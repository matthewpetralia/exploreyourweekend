const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

function parseEffort(tag) {
  const distanceMatch = tag.match(/(\d+\.?\d*)\s*k?m/i);
  const timeMatch = tag.match(/(\d+\.?\d*)\s*hr?s?/i);
  let distance_km = null;
  let duration_min = null;

  if (distanceMatch) {
    distance_km = parseFloat(distanceMatch[1]);
  }
  if (timeMatch) {
    duration_min = parseFloat(timeMatch[1]) * 60;
  }

  return { distance_km, duration_min };
}

module.exports = async () => {
  const records = await base('Locations').select({ view: 'Grid view' }).all();
  return records.map(record => {
    const fields = record.fields;
    let distance = null;
    let duration = null;

    if (fields.tags) {
      const effortTag = fields.tags.find(tag => tag.match(/(\d+\.?\d*)\s*(km|hr|hrs|m)/i));
      if (effortTag) {
        const parsed = parseEffort(effortTag);
        distance = parsed.distance_km;
        duration = parsed.duration_min;
      }
    }

const formattedTagsArray = (fields.formattedTags || '')
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(tag => tag.trim().replace(/^"|"$/g, ''))
      .filter(tag => tag);

    return {
      id: record.id,
      title: fields.title,
      description: fields.description,
      shortDescription: fields.shortDescription,
      slug: fields.slug,
      tags: fields.tags || [],
      formattedTags: formattedTagsArray,
      imagePath: `/Images/${fields.slug}.webp`,
      guideURL: fields.guideURL,
      formattedDistance: fields.formattedDistance || '',
      formattedDuration: fields.formattedDuration || '',
      distanceKm: distance,
      durationHrs: duration ? duration / 60 : null,
      type: 'section'
    };
  });
};