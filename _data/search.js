const locations = require("./locations.js");
const guides = require("./guides.js");
const lunr = require("lunr");

module.exports = async () => {
    const allContent = [...(await locations()), ...(await guides())];

    const idx = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('description');
        this.field('formattedTags');

        allContent.forEach(item => {
            if (item.title && typeof item.title === 'string' && item.title.trim().length > 0) {
                const sanitizedDescription = typeof item.description === 'string' ? item.description : '';
                const sanitizedFormattedTags = Array.isArray(item.formattedTags) ? item.formattedTags.join(' ') : '';
                
                this.add({
                    id: item.id,
                    title: item.title,
                    description: sanitizedDescription,
                    formattedTags: sanitizedFormattedTags,
                });
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
            distanceKm: item.distanceKm,
            durationHrs: item.durationHrs,
            formattedTags: item.formattedTags,
        };
    });

    return {
        index: idx.toJSON(),
        store: store
    };
};