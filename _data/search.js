const locations = require("./locations.js");
const guides = require("./guides.js");
const lunr = require("lunr");

module.exports = async () => {
  const allContent = [...(await locations()), ...(await guides())];

  const idx = lunr(function () {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('description');
    this.field('tags', { boost: 20 });

    allContent.forEach(item => {
      if (item.title && typeof item.title === 'string' && item.title.trim().length > 0) {
        const doc = {
          id: item.id,
          title: item.title,
          description: typeof item.description === 'string' ? item.description : '',
          tags: ''
        };

        if (item.formattedTags && Array.isArray(item.formattedTags)) {
          const tagsWithPhrases = item.formattedTags.map(tag => {
            return tag.includes(' ') ? tag.replace(/\s+/g, '') : tag;
          });
          
          doc.tags = item.formattedTags.join(' ') + ' ' + tagsWithPhrases.join(' ');
        }
        this.add(doc);
      }
    });
  });

  const store = {};
  allContent.forEach(item => {
    store[item.id] = {
      url: item.canonicalURL || item.url,
      canonicalURL: item.canonicalURL || null,
      imagePath: item.imagePath,
      title: item.title,
      description: item.description,
      type: item.type,
      distanceKm: item.distanceKm,
      durationHrs: item.durationHrs,
      formattedDuration: item.formattedDuration,
      formattedDistance: item.formattedDistance,
      formattedTags: item.formattedTags,
    };
  });

  return {
    index: idx.toJSON(),
    store: store
  };
};