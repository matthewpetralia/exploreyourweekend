const path = require('path');
const util = require('util');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = function(eleventyConfig) {
    eleventyConfig.addFilter("dump", obj => {
        return JSON.stringify(obj, null, 2);
    });

    eleventyConfig.addFilter("safe", obj => {
        return obj;
    });

    eleventyConfig.addPassthroughCopy("main.css");
    eleventyConfig.addPassthroughCopy("code.js");
    eleventyConfig.addPassthroughCopy("robots.txt");
    eleventyConfig.addPassthroughCopy("_redirects");
    eleventyConfig.addPassthroughCopy("search-logic.js");
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy(".eslintrc.js");
    eleventyConfig.addPassthroughCopy("CNAME");
    eleventyConfig.addPassthroughCopy("ExploreYourWeekendFAVICON.svg");
    eleventyConfig.addPassthroughCopy("ExploreYourWeekendLogo.svg");
    eleventyConfig.addPassthroughCopy("ExploreYourWeekendLogoGREEN.svg");
    eleventyConfig.addPassthroughCopy("normalize.css");
    eleventyConfig.addPassthroughCopy({"./node_modules/lunr/lunr.js": "assets/js/lunr.js"});

    eleventyConfig.addCollection("guides", async function(collectionApi) {
        const guidesData = await require("./_data/guides.js")();
        return guidesData.map(guide => {
            // Convert image objects to filenames array
            const imageFiles = guide.imageFiles.map(img => img.filename || img);
            
            return {
                ...guide,
                imageFiles: imageFiles,
                altTags: guide.altTag || [], // Use guide.altTag since that's what you're setting in guides.js
                data: {
                    layout: "guide",
                    title: guide.title,
                    permalink: `/guides/${guide.slug}/`
                }
            };
        });
    });
   
    eleventyConfig.addCollection("locations", async function(collectionApi) {
        const locationsData = await require("./_data/locations.js")();
        return locationsData;
    });
   
    return {
        dir: {
            input: ".",
            output: "_site",
            data: "_data"
        }
    };
};