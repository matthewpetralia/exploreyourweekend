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
    const [allLocationRecords, tagRecords, guideRecords, imageRecords] = await Promise.all([
        base("Locations").select({ view: "liveLocations" }).all(),
        base("Tags").select({ view: "Grid view" }).all(),
        base("Guides").select({ view: "Grid view" }).all(),
        base('images').select({ view: 'Grid view' }).all()
    ]);
    
    const imageMap = new Map();
    imageRecords.forEach(record => {
      const filename = record.fields.fileName || null;
      const alt = record.fields.altTag || null;
      if (filename) {
        imageMap.set(record.id, { filename, alt });
      }
    });
    
    const guideMap = new Map();
    guideRecords.forEach(record => {
      guideMap.set(record.id, {
        slug: record.fields.slug,
        title: record.fields.title
      });
    });

    const locationMap = new Map();
    allLocationRecords.forEach(record => {
      locationMap.set(record.id, {
        slug: record.fields.slug,
        title: record.fields.title
      });
    });

    const tagMap = new Map();
    tagRecords.forEach(record => {
      tagMap.set(record.fields['Tag Name'], record.fields.tagGroup || "Other");
    });

    return allLocationRecords.map((record) => {
      const fields = record.fields;
      
      const imageFiles = [];
      const altTags = [];

      if (Array.isArray(fields.images)) {
        fields.images.forEach(id => {
          const imageData = imageMap.get(id);
          if (imageData) {
            imageFiles.push(imageData.filename);
            if (imageData.alt) {
              altTags.push(imageData.alt);
            }
          }
        });
      }

      const faqs = [];
      const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
      const faqQuestions = (fields.faqQuestion1 || "").split(regex).map(q => q.trim());
      const faqAnswers = (fields.faqAnswer1 || "").split(regex).map(a => a.trim().replace(/^"|"$/g, ""));
      
      if (faqQuestions.length === faqAnswers.length) {
        for (let i = 0; i < faqQuestions.length; i++) {
          if (faqQuestions[i] && faqAnswers[i]) {
            faqs.push({
              question: faqQuestions[i],
              answer: faqAnswers[i]
            });
          }
        }
      }

      const nearbyLocations = [];
      const nearbyIds = Array.isArray(fields.nearby) && fields.nearby.length > 0
        ? fields.nearby
        : (Array.isArray(fields.nearbyByGuide) ? fields.nearbyByGuide : []);

      nearbyIds.forEach(id => {
        const linkedLocation = locationMap.get(id);
        if (linkedLocation) {
          nearbyLocations.push({
            title: linkedLocation.title,
            url: `/locations/${linkedLocation.slug}/`
          });
        }
      });
      
      const linkedGuides = [];
      if (Array.isArray(fields.guide) && fields.guide.length > 0) {
        fields.guide.forEach(guideId => {
          const linkedGuide = guideMap.get(guideId);
          if (linkedGuide) {
            linkedGuides.push({
              title: linkedGuide.title,
              url: `/guides/${linkedGuide.slug}/`
            });
          }
        });
      }

      // Process Formatted Tags
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

      // console.log('Debug for location:', fields.title);
      // console.log('Image files:', imageFiles);
      // console.log('Alt tags array:', altTags);
      // console.log('Raw image data:', fields.images?.map(id => imageMap.get(id)));

      return {
        id: record.id,
        title: fields.title,
        metaTitle: fields.metaTitle || fields.title,
        updated: fields.updated || null,
        guides: linkedGuides,
        description: fields.description,
        detailedDescription: fields.detailedDescription.value || "",
        metaDescription: fields.metaDescription.value || fields.shortDescription || "",
        imageCount: imageFiles.length,
        altTags: altTags,
        difficulty: fields.difficulty,
        parking: fields.parking,
        parkingInfo: fields.parkingInfo,
        amenities: fields.formattedAmenities ? fields.formattedAmenities.split(", ") : [],
        amenitiesInfo: fields.amenitiesInfo,
        bestTimeToVisit: fields.bestTimeToVisit,
        nearby: nearbyLocations,
        faqs: faqs,
        slug: fields.slug,
        googleMapsLink: fields.googleMapsLink,
        formattedTags: formattedTags,
        imagePath: `/images/${fields.slug}`,
        canonicalURL: `/locations/${fields.slug}/`,
        images: record.images || [],
        imageFiles: imageFiles,
        imagePrimary: imageFiles.length > 0 ? imageFiles[0] : `${fields.slug}.webp`,
        distanceKm: fields.distanceKm || null,
        durationHrs: fields.durationHrs || null,
        formattedDuration: fields.formattedDuration,
        formattedDistance: fields.formattedDistance,
        type: "section",
        __rawFields: fields
      };
    });
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    return [];
  }
};
