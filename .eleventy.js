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
        // The correct way to handle async data in Eleventy collections
        const guidesData = await require("./_data/guides.js")();
        return guidesData;
    });

    return {
        dir: {
            input: ".",
            output: "_site",
            data: "_data"
        }
    };
};