const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

module.exports = async () => {
  try {
    // Fetch all records from the Guides table
    const guideRecords = await base('Guides').select({ 
      view: 'Grid view' 
    }).all();

    // Fetch all records from the Locations table
    const locationRecords = await base('Locations').select({ 
      view: 'Grid view' 
    }).all();

    // Create a mapping of location IDs to their full record data for quick lookup
    const locationMap = {};
    locationRecords.forEach(locationRecord => {
      locationMap[locationRecord.id] = locationRecord.fields;
    });

    // Process each guide record and link the locations
    return guideRecords.map(guideRecord => {
      const guideFields = guideRecord.fields;
      
      // Get the list of linked location IDs
      const linkedLocationIds = guideFields.Locations || [];
      
      // Build the sections array using the locationMap
      const sectionsData = linkedLocationIds.map(locationId => {
        const locationFields = locationMap[locationId];
        return {
              title: locationFields.title,
              description: locationFields.description,
              slug: locationFields.slug,
              canonURL: `/locations/${locationFields.slug}/`,
              imagePath: `/Images/${locationFields.slug}.webp`,
            };
          });

      return {
        id: guideRecord.id,
        title: guideFields.title,
        description: guideFields.description,
        slug: guideFields.slug,
        formattedTags: guideFields.formattedTags,
        sections: sectionsData,
        url: `/${guideFields.slug}/`,
        canonURL: `/guides/${guideFields.slug}/`,
        imagePath: `/Images/${guideFields.slug}.webp`,
        type: 'page'
      };
    });
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    return [];
  }
};