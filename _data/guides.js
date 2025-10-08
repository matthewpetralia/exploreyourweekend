const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

module.exports = async () => {
  try {
    const [guideRecords, locationRecords, tagRecords, imageRecords] = await Promise.all([
      base('Guides').select({
        view: 'Grid view'
      }).all(),
      base('Locations').select({
        view: 'liveLocations'
      }).all(),
      base("Tags").select({
        view: "Grid view"
      }).all(),
      base('images').select({
        view: 'Grid view'
      }).all()
    ]);

    const imageMap = new Map();
imageRecords.forEach(record => {
  const filename = record.fields.fileName || null;
  const alt = record.fields.altTag || null;
  if (filename) {
    imageMap.set(record.id, { filename, alt });
  }
});

    const tagMap = new Map();
    tagRecords.forEach(record => {
      tagMap.set(record.fields['Tag Name'], record.fields.tagGroup || "Other");
    });

    const locationMap = {};
    locationRecords.forEach(locationRecord => {
      const fields = locationRecord.fields;
      if (!fields.title) {
        console.log('Warning: Location missing title:', {
          id: locationRecord.id,
          fields: fields
        });
      }
      
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
        durationGroup: locationRecord.fields.durationGroup,
        image: fields.images,
        slug: fields.slug,
        title: fields.title
      };
    });

    return guideRecords.map(guideRecord => {
      const guideFields = guideRecord.fields;

      const imageFiles = Array.isArray(guideFields.images)
        ? guideFields.images.map(id => imageMap.get(id)).filter(Boolean)
        : [];

      const locations = (guideFields.locations || []).map(locationId => {
        return locationMap[locationId];
      }).filter(Boolean); // Filter out any undefined locations

      let altTags = guideFields.altTag || [];
      if (typeof altTags === 'string') {
        try {
          altTags = JSON.parse(altTags);
        } catch (e) {
          altTags = [altTags];
        }
      }

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
      // Add debug logging for sections mapping


const sectionsData = linkedLocationIds.map(locationId => {
  const location = locationMap[locationId];
  if (!location) {
    console.log('Warning: Location not found:', locationId);
    return null;
  }

const locationImages = [];
  const locationAltTags = [];
  
  if (Array.isArray(location.image)) {
    location.image.forEach(imageId => {
      const imageData = imageMap.get(imageId);
      if (imageData) {
        locationImages.push(imageData.filename);
        if (imageData.alt) {
          locationAltTags.push(imageData.alt);
        }
      }
    });
  }

  if (!location.title) {
    console.log('Warning: Location missing title in map:', {
      locationId,
      location
    });
  }
  
  return {
    title: location.title,
    description: location?.description,
    slug: location?.slug,
    canonicalURL: `/locations/${location.slug}/`,
    imagePath: `/images/${location.slug}`,
    formattedTags: location.formattedTags,
    formattedDistance: location.formattedDistance,
    formattedDuration: location.formattedDuration,
    imageFiles: locationImages,
    altTags: locationAltTags
      };
    }).filter(Boolean); // Remove null entries

      // Debug final output
// console.log('Guide output:', {
//   guideTitle: guideFields.title,
//   sections: sectionsData.map(s => ({id: s.slug, title: s.title}))
// });

      return {
        id: guideRecord.id,
        title: guideFields.title,
        metaTitle: guideFields.metaTitle || guideFields.title,
        updated: guideFields.updated || null,
        description: guideFields.description,
        slug: guideFields.slug,
        formattedTags: Array.from(combinedTags.values()),
        sections: sectionsData,
        url: `/${guideFields.slug}/`,
        canonicalURL: `/guides/${guideFields.slug}/`,
        imagePath: `/images/${guideFields.slug}`,
        type: 'page',
        locations: locations,
        imageFiles: guideFields.images ? guideFields.images.map(id => {
            const imageData = imageMap.get(id);
            return imageData ? imageData.filename : null;
        }).filter(Boolean) : [],
        altTag: guideFields.images ? guideFields.images.map(id => {
            const imageData = imageMap.get(id);
            return imageData ? imageData.alt : null;
        }).filter(Boolean) : [],
        // Add any other guide fields you need
      };
    });
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    return [];
  }
};