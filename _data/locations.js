const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

/**
 * Parses a time string (like "7:30" or "0:45") into a total number of hours.
 * @param {string} timeString - The time string to parse.
 * @returns {number|null} The total hours as a decimal, or null if invalid.
 */
function parseDurationToHours(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return null;
  }
  const parts = timeString.split(':');
  if (parts.length !== 2) {
    return null;
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) {
    return null;
  }
  return hours + minutes / 60;
}

module.exports = async () => {
  const records = await base("Locations").select({ view: "Grid view" }).all();
  
  return records.map((record) => {
    const fields = record.fields;

    const formattedTagsArray = (fields.formattedTags || "")
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((tag) => tag.trim().replace(/^"|"$/g, ""))
      .filter((tag) => tag);

    // --- FIX: Correctly parse duration and use direct data fields ---
    const durationInHours = parseDurationToHours(fields.durationHrs);

    return {
      id: record.id,
      title: fields.title,
      description: fields.description,
      slug: fields.slug,
      formattedTags: formattedTagsArray,
      imagePath: `/Images/${fields.slug}.webp`,
      guideURL: fields.guideURL,
      canonURL: `/locations/${fields.slug}/`,
      
      // Use the direct value from the 'distanceKm' field.
      distanceKm: fields.distanceKm || null,
      
      // Pass the numeric value (in hours) for filtering and the formatted string for display.
      durationHrs: durationInHours,
      formattedDuration: fields.formattedDuration || '',
      
      type: "section",
    };
  });
};