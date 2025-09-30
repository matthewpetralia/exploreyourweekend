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
      if (filename) {
        imageMap.set(record.id, filename);
      }
    });

    const tagMap = new Map();
    tagRecords.forEach(record => {
      tagMap.set(record.fields['Tag Name'], record.fields.tagGroup || "Other");
    });

    const locationMap = {};
    locationRecords.forEach(locationRecord => {
      const fields = locationRecord.fields;
      locationMap[locationRecord.id] = {
        id: locationRecord.id,
        title: fields.title,
        slug: fields.slug,
        image: fields.image,
        // Add other relevant location fields here
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

      return {
        id: guideRecord.id,
        title: guideFields.title,
        slug: guideFields.slug,
        metaTitle: guideFields.metaTitle,
        description: guideFields.description,
        locations: locations,
        imageFiles: imageFiles,
        imagePrimary: imageFiles.length > 0 ? imageFiles[0] : `${guideFields.slug}.webp`,
        altTag: altTags,
        // Add any other guide fields you need
      };
    });
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    return [];
  }
};