const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

module.exports = async () => {
  const records = await base('Guides').select({ view: 'Grid view' }).all();
  return records.map(record => {
    const fields = record.fields;

    // A robust way to handle the formattedTags field
    let formattedTagsArray = [];
    if (fields.formattedTags) {
      if (Array.isArray(fields.formattedTags)) {
        // If it's already an array, use it directly
        formattedTagsArray = fields.formattedTags.filter(tag => tag);
      } else if (typeof fields.formattedTags === 'string') {
        // If it's a string, split it and trim whitespace
const formattedTagsArray = (fields.formattedTags || '')
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(tag => tag.trim().replace(/^"|"$/g, ''))
      .filter(tag => tag);
      }
    }

    return {
      id: record.id,
      title: fields.title,
      description: fields.description,
      slug: fields.slug,
      formattedTags: formattedTagsArray,
      linkedLocations: fields.Locations || [],
      url: `/${fields.slug}/`,
      imagePath: `/Images/${fields.slug}.webp`,
      type: 'page'
    };
  });
};