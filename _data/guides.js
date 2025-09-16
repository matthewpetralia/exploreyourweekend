const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

module.exports = async () => {
  try {
    const guideRecords = await base('Guides').select({
      view: 'Grid view'
    }).all();
    const locationRecords = await base('Locations').select({
      view: 'liveLocations'
    }).all();
    const tagRecords = await base("Tags").select({ view: "Grid view" }).all();

    const tagMap = new Map();
    tagRecords.forEach(record => {
      tagMap.set(record.fields['Tag Name'], record.fields.tagGroup || "Other");
    });

    const locationMap = {};
    locationRecords.forEach(locationRecord => {
      locationMap[locationRecord.id] = {
        ...locationRecord.fields,
        formattedTags: (typeof locationRecord.fields.formattedTags === 'string' ? locationRecord.fields.formattedTags : "")
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((tagName) => {
            const trimmedTag = tagName.trim().replace(/^"|"$/g, "");
            const tagGroup = tagMap.get(trimmedTag) || "Other";
            return {
              name: trimmedTag,
              group: tagGroup
            };
          })
          .filter((tag) => tag.name),
        distanceGroup: locationRecord.fields.distanceGroup,
        durationGroup: locationRecord.fields.durationGroup
      };
    });

    return guideRecords.map(guideRecord => {
      const guideFields = guideRecord.fields;
      
      const combinedTags = new Map();

      // Add tags from the guide itself
      const guideTags = (typeof guideFields.formattedTags === 'string' ? guideFields.formattedTags : "")
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((tagName) => {
          const trimmedTag = tagName.trim().replace(/^"|"$/g, "");
          const tagGroup = tagMap.get(trimmedTag) || "Other";
          return {
            name: trimmedTag,
            group: tagGroup
          };
        })
        .filter((tag) => tag.name);
        
      guideTags.forEach(tag => combinedTags.set(tag.name, tag));

      // Add tags from linked locations, excluding distance and duration groups
      const linkedLocationIds = guideFields.Locations || [];
      const sectionsData = linkedLocationIds.map(locationId => {
        const location = locationMap[locationId];
        if (location && location.formattedTags) {
          location.formattedTags.forEach(tag => {
            // Only add tags that are not from the "Distance" or "Duration" groups
            if (tag.group !== "Distance" && tag.group !== "Duration") {
              combinedTags.set(tag.name, tag);
            }
          });
        }
        return {
          title: location.title,
          description: location.description,
          slug: location.slug,
          canonicalURL: `/locations/${location.slug}/`,
          imagePath: `/images/${location.slug}`,
        formattedTags: location.formattedTags,
        formattedDistance: location.formattedDistance,
        formattedDuration: location.formattedDuration,
        };
      });

      return {
        id: guideRecord.id,
        title: guideFields.title,
        metaTitle: guideFields.metaTitle || guideFields.title,
        description: guideFields.description,
        slug: guideFields.slug,
        formattedTags: Array.from(combinedTags.values()),
        sections: sectionsData,
        url: `/${guideFields.slug}/`,
        canonicalURL: `/guides/${guideFields.slug}/`,
        imagePath: `/images/${guideFields.slug}`,
        type: 'page'
      };
    });
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    return [];
  }
};