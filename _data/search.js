const locations = require("./locations.js");
const guides = require("./guides.js");
const lunr = require("lunr");

module.exports = async () => {
  const allContent = [...(await locations()), ...(await guides())];

  const idx = lunr(function () {
    // Keep the default pipeline for fuzzy matching on single words
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('description');
    this.field('tags', { boost: 20 });

    allContent.forEach(item => {
      // Defensive coding to ensure item is valid
      if (item.title && typeof item.title === 'string' && item.title.trim().length > 0) {
        const doc = {
          id: item.id,
          title: item.title,
          description: typeof item.description === 'string' ? item.description : '',
          tags: ''
        };

        // --- FIX: Create special phrase tokens for multi-word tags ---
        if (item.formattedTags && Array.isArray(item.formattedTags)) {
          const tagsWithPhrases = item.formattedTags.map(tag => {
            // If the tag has spaces, create a concatenated version for exact phrase matching
            // e.g., "New South Wales" -> "NewSouthWales"
            return tag.includes(' ') ? tag.replace(/\s+/g, '') : tag;
          });
          
          // Join original tags and new phrase tokens into one searchable string
          doc.tags = item.formattedTags.join(' ') + ' ' + tagsWithPhrases.join(' ');
        }
        this.add(doc);
      }
    });
  });

  const store = {};
  allContent.forEach(item => {
    store[item.id] = {
      url: item.guideURL || item.url,
      image: item.imagePath,
      title: item.title,
      description: item.description,
      type: item.type,
      // Pass both the numeric and formatted versions
      distanceKm: item.distanceKm,
      durationHrs: item.durationHrs,
      formattedDuration: item.formattedDuration,
      formattedTags: item.formattedTags,
    };
  });

  return {
    index: idx.toJSON(),
    store: store
  };
};