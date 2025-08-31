const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

/**
 * Formats a duration in seconds into a readable string.
 * @param {string} durationString - The duration in 'H:MM' or 'HH:MM' format.
 * @returns {string|null} The formatted string, or null if invalid.
 */
function formatDuration(durationString) {
  if (!durationString || typeof durationString !== 'string') {
    return null;
  }
  const parts = durationString.split(':');
  if (parts.length < 2) {
    return null;
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  let formattedParts = [];
  if (hours > 0) {
    formattedParts.push(`${hours}hr`);
  }
  if (minutes > 0) {
    formattedParts.push(`${minutes}min`);
  }
  
  return formattedParts.length > 0 ? formattedParts.join(' ') : null;
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
  try {
    const locationRecords = await base("Locations").select({ view: "Grid view" }).all();
    const tagRecords = await base("Tags").select({ view: "Grid view" }).all();

    const tagMap = new Map();
    tagRecords.forEach(record => {
      tagMap.set(record.fields['Tag Name'], record.fields.tagGroup || "Other");
    });

    return locationRecords.map((record) => {
      const fields = record.fields;

      const formattedTags = (typeof fields.formattedTags === 'string' ? fields.formattedTags : "")
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
      
      // Add distance and duration groups for searching
      if (fields.durationGroup) {
        formattedTags.push({
          name: fields.durationGroup,
          group: "Duration"
        });
      }

      if (fields.distanceGroup) {
        formattedTags.push({
          name: fields.distanceGroup,
          group: "Distance"
        });
      }

      return {
        id: record.id,
        title: fields.title,
        description: fields.description,
        slug: fields.slug,
        googleMapsLink: fields.googleMapsLink,
        formattedTags: formattedTags,
        imagePath: `/Images/${fields.slug}.webp`,
        guideURL: fields.guideURL,
        canonicalURL: `/locations/${fields.slug}/`,
        
        distanceKm: fields.distanceKm || null,
        durationHrs: fields.durationHrs || null,
        
        formattedDuration: fields.formattedDuration,
        formattedDistance: fields.formattedDistance,
        
        type: "section",
      };
    });
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    return [];
  }
};