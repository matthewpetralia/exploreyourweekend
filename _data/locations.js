const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

/**
 * Formats a duration in seconds into a readable string.
 * @param {number} totalSeconds - The duration in seconds.
 * @returns {string|null} The formatted string, or null if 0 or less.
 */
function formatDuration(totalSeconds) {
  if (totalSeconds === null || typeof totalSeconds !== 'number' || totalSeconds <= 0) {
    return null;
  }
  
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let parts = [];
  if (hours > 0) {
    parts.push(`${hours}hr${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}min${minutes > 1 ? 's' : ''}`);
  }
  
  return parts.join(' ');
}

/**
 * Formats a distance in kilometers into a readable string.
 * @param {number} distanceKm - The distance in kilometers.
 * @returns {string|null} The formatted string, or null if 0 or less.
 */
function formatDistance(distanceKm) {
  if (distanceKm === null || typeof distanceKm === 'undefined' || distanceKm <= 0) {
    return null;
  }

  if (distanceKm % 1 === 0) {
    return `${distanceKm}km`;
  }
  
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    if (meters === 0) return null;
    return `${meters}m`;
  }
  
  return `${distanceKm.toFixed(1)}km`;
}

module.exports = async () => {
  const records = await base("Locations").select({ view: "Grid view" }).all();
  
  return records.map((record) => {
    const fields = record.fields;

    const formattedTagsArray = (fields.formattedTags || "")
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((tag) => tag.trim().replace(/^"|"$/g, ""))
      .filter((tag) => tag);

    const formattedDurationString = formatDuration(fields.durationHrs);
    const formattedDistanceString = formatDistance(fields.distanceKm);

    return {
      id: record.id,
      title: fields.title,
      description: fields.description,
      slug: fields.slug,
      formattedTags: formattedTagsArray,
      imagePath: `/Images/${fields.slug}.webp`,
      guideURL: fields.guideURL,
      canonicalURL: `/locations/${fields.slug}/`,
      
      distanceKm: fields.distanceKm || null,
      durationHrs: fields.durationHrs,
      
      formattedDuration: formattedDurationString,
      formattedDistance: formattedDistanceString,
      
      type: "section",
    };
  });
};