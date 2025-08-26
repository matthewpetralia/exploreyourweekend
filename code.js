/*eslint-env es6*/

// Shared helpers for search
// const SearchHelpers = {
//     normaliseTag(tag) {
//         if (/\d+\s?(min|mins|hr|hrs)/i.test(tag)) {
//             const value = parseFloat(tag.trim());

//             if (/hr|hrs/i.test(tag)) {
//                 if (value < 2) return "less than 2hrs";
//                 if (value <= 4) return "2-4hrs";
//                 return "4+hrs";
//             }

//             if (/min|mins/i.test(tag)) {
//                 if (value < 120) return "less than 2hrs";
//                 return "2+hrs"; // Fallback for clarity
//             }
//         }

//         if (/\d+\s?(m|km)/i.test(tag)) {
//             const value = parseFloat(tag);
//             if (tag.includes("km")) {
//                 if (value < 1) return "less than 1km";
//                 if (value >= 1 && value <= 5) return "1-5km";
//                 if (value > 5 && value <= 10) return "5-10km";
//                 if (value > 10 && value <= 20) return "10-20km";
//                 if (value > 20) return "20+km";
//             } else if (/m\b/i.test(tag)) {
//                 if (value < 1000) return "less than 1km";
//             }
//         }

//         if (tag.toLowerCase() === "beaches" || tag.toLowerCase() === "beach") {
//             return "Beach";
//         }

//         if (tag.toLowerCase().includes("wales")) {
//             return tag;
//         }

//         if (tag.toLowerCase().includes("drive")) {
//             return "Scenic Drive";
//         }

//         if (tag.endsWith("s") && !tag.endsWith("ss")) {
//             const exceptions = ["beaches", "classes", "grass"];
//             if (!exceptions.some((exception) => exception.toLowerCase() === tag.toLowerCase())) {
//                 return tag.slice(0, -1);
//             }
//         }

//         return tag;
//     },
//     processTags(tags) {
//         return [...new Set(tags.map(this.normaliseTag))];
//     },

//     sortTags(tags) {
//         const distanceOrder = ["less than 1km", "1-5km", "5-10km", "10-20km", "20+km"];
//         const timeOrder = ["less than 2hrs", "2-4hrs", "4+hrs"];
//         const distanceTags = tags.filter((tag) => distanceOrder.includes(tag));
//         const timeTags = tags.filter((tag) => timeOrder.includes(tag));
//         const otherTags = tags.filter((tag) => !distanceOrder.includes(tag) && !timeOrder.includes(tag));
//         return [
//             ...distanceOrder.filter((tag) => distanceTags.includes(tag)),
//             ...timeOrder.filter((tag) => timeTags.includes(tag)),
//             ...otherTags.sort()
//         ];
//     }
// };

// let contexts = {};
// let searchData = [];

// const tagMappings = {
//     Coastal: ["Beach"]
// };

// // SEARCH SYSTEM
// document.addEventListener("DOMContentLoaded", () => {
//     const contexts = {
//         homepage: {
//             input: document.querySelector("main#vertical .search .search-input"),
//             results: document.querySelector("main#vertical"),
//             clearSearchButton: document.querySelector("main#vertical .search .clear-search-button"),
//             tagDatabase: document.querySelector("main#vertical .search .tag-database .filters"),
//             activeTagsContainer: document.querySelector("main#vertical .search .active-tags-container"),
//             activeTags: []
//         }
//     };

//     if (!contexts.homepage) {
//         return;
//     }

//     const tagGroupConfig = {
//         Distance: (tag) => tag.includes("km"),
//         Time: (tag) => tag.includes("hrs"),
//         "National Parks": (tag) => ["national park", "nature reserve"].some((key) => tag.toLowerCase().includes(key)),
//         Location: (tag) => ["queensland", "new south wales"].some((location) => tag.toLowerCase().includes(location)),
//         Other: (tag) =>
//             !["km", "hrs", "national park", "nature reserve"].some((key) => tag.toLowerCase().includes(key)) &&
//             !tagGroupConfig.Location(tag)
//     };

//     // Fetch search data
//     fetch("/search-data.json")
//         .then((response) => response.json())
//         .then((data) => {
//             searchData = data;

//             const allTags = [];
//             searchData.forEach((page) => {
//                 allTags.push(...SearchHelpers.processTags(page.tags));
//                 if (page.sections) {
//                     page.sections.forEach((section) => allTags.push(...SearchHelpers.processTags(section.tags)));
//                 }
//             });

//             const groupedTags = Object.fromEntries(
//                 Object.entries(tagGroupConfig).map(([groupName, filterFn]) => [
//                     groupName,
//                     SearchHelpers.sortTags([...new Set(allTags.filter(filterFn))])
//                 ])
//             );

//             Object.values(contexts).forEach((context) => {
//                 if (context.tagDatabase) renderTags(groupedTags, context);
//             });

//             // Preload for both contexts
//             // if (contexts.homepage) preloadHomepageGuides(contexts.homepage, searchData);

//             // After preloading, process URL queries and tags
//             // if (contexts.homepage) loadFiltersFromURL("homepage");

//             const url = new URL(window.location.href);
//             const params = new URLSearchParams(url.search);
//             const hasQueryOrTags = params.has("query") || params.has("tags");

//             if (!hasQueryOrTags && !contexts.homepage.activeTags.length) {
//                 console.log("No query or tags in URL. Clearing search state...");
//                 //clearSearch("homepage");
//             } else {
//                 console.log("Query or tags detected in URL. Skipping clearSearch...");

//                 // Prevent default guides from overwriting active filters
//                 return;
//             }
//         })
//         .catch((error) => console.error("Error fetching data:", error));

//     function loadFiltersFromURL(contextKey) {
//         const url = new URL(window.location.href);
//         const params = new URLSearchParams(url.search);

//         const searchQuery = params.get("query") || "";
//         const activeTags = params.get("tags") ? params.get("tags").split(",") : [];

//         const context = contexts[contextKey];
//         if (context) {
//             // Only set input and tags if they're not already set
//             if (!context.input.value.trim()) context.input.value = searchQuery;
//             context.activeTags = activeTags;
//             renderActiveTags(context);

//             // Apply filters only if there are tags or a query
//             if (searchQuery || activeTags.length > 0) {
//                 applyFilters(contextKey);
//             }
//         }
//     }

//     function updateURL(contextKey, searchQuery, activeTags) {
//         const url = new URL(window.location.href);
//         const params = new URLSearchParams(url.search);

//         if (searchQuery) {
//             params.set("query", searchQuery);
//         } else {
//             params.delete("query");
//         }

//         if (activeTags.length > 0) {
//             params.set("tags", activeTags.join(","));
//         } else {
//             params.delete("tags");
//         }

//         history.replaceState(null, "", `${url.pathname}${params.toString() ? `?${params.toString()}` : ""}`);
//     }

//     function applyFilters(contextKey) {
//         const context = contexts[contextKey];
//         if (!context) {
//             console.error(`Context not found for key: ${contextKey}`);
//             return;
//         }

//         const searchQuery = context.input.value.trim().toLowerCase();
//         const activeTags = context.activeTags || [];

//         // Update URL with the current query and tags
//         updateURL(contextKey, searchQuery, activeTags);

//         console.log(`Applying filters for: ${contextKey}`);
//         console.log(`Query: "${searchQuery}", Active Tags:`, activeTags);

//         // Expand active tags using tagMappings
//         const expandedTags = new Set(activeTags);
//         activeTags.forEach((tag) => {
//             if (tagMappings[tag]) {
//                 tagMappings[tag].forEach((mappedTag) => expandedTags.add(mappedTag));
//             }
//         });
//         console.log(`Expanded Tags:`, [...expandedTags]);

//         // Split search query into words for partial matching
//         const searchWords = searchQuery.split(/\s+/);

//         // Handle cases with no active tags or query
//         // if (searchQuery === "" && activeTags.length === 0) {
//         //     console.log(`No query or tags. Reloading default guides for context: ${contextKey}`);
//         //     preloadHomepageGuides(context, searchData);
//         //     return;
//         // }

//         const filteredResults = searchData.reduce((results, page) => {
//             // --- Section Matching First ---
//             let matchingSections = [];
//             if (page.sections) {
//                 matchingSections = page.sections.filter((section) => {
//                     const sectionTags = SearchHelpers.processTags(section.tags);

//                     let sectionQueryMatches = !searchQuery;
//                     if (searchQuery) {
//                         sectionQueryMatches =
//                             section.title.toLowerCase().includes(searchQuery) ||
//                             searchWords.some(
//                                 (word) =>
//                                     section.description.toLowerCase().includes(word) ||
//                                     sectionTags.some((tag) => tag.toLowerCase().includes(word))
//                             );
//                     }

//                     let sectionTagsMatch = activeTags.length === 0;
//                     if (activeTags.length > 0) {
//                         sectionTagsMatch = [...expandedTags].every((tag) => sectionTags.includes(tag));
//                     }

//                     return sectionQueryMatches && sectionTagsMatch;
//                 });
//             }

//             // If sections matched, add them and stop.
//             if (matchingSections.length > 0) {
//                 matchingSections.forEach((section) => {
//                     results.push({
//                         ...section,
//                         isSection: true,
//                         parentPage: page.title,
//                         rawTags: section.tags
//                     });
//                 });
//             } else {
//                 // --- Page Matching (Fallback) ---
//                 // Only run if no sections matched.
//                 const pageTags = SearchHelpers.processTags(page.tags);

//                 let queryMatches = !searchQuery;
//                 if (searchQuery) {
//                     queryMatches =
//                         page.title.toLowerCase().includes(searchQuery) ||
//                         searchWords.some(
//                             (word) =>
//                                 page.description.toLowerCase().includes(word) ||
//                                 pageTags.some((tag) => tag.toLowerCase().includes(word))
//                         );
//                 }

//                 let tagsMatch = activeTags.length === 0;
//                 if (activeTags.length > 0) {
//                     tagsMatch = [...expandedTags].every((tag) => pageTags.includes(tag));
//                 }

//                 if (queryMatches && tagsMatch) {
//                     results.push(page);
//                 }
//             }

//             return results;
//         }, []);

//         console.log(`Filtered results for ${contextKey}:`, filteredResults);

//         updateHomepageResults(filteredResults);
//     }

//     function stripAnchorTags(html) {
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(html, "text/html");
//         return doc.body.textContent || "";
//     }

//     function updateHomepageResults(results) {
//         const mainContainer = document.querySelector("main#vertical");

//         while (mainContainer.children.length > 1) {
//             mainContainer.removeChild(mainContainer.lastChild);
//         }

//         results.forEach((result) => {
//             const article = document.createElement("article");
//             article.setAttribute("itemscope", "");
//             article.setAttribute("itemtype", "https://schema.org/CreativeWork");
//             article.id = result.id || "";

//             // Define a reusable filter condition for exclusions
//             const isExcludedTag = (tag) =>
//                 /less than 1km|1-5km|5-10km|10-20km|20\+km|less than 2hrs|2-4hrs|4\+hrs|national park|nature reserve/i.test(
//                     tag
//                 );

//             const tagContent = result.isSection
//                 ? result.rawTags
//                     ? result.rawTags.filter((tag) => !isExcludedTag(tag)).join(",") // Filter and join raw tags for sections
//                     : ""
//                 : SearchHelpers.processTags(result.tags, true)
//                       .filter((tag) => !isExcludedTag(tag)) // Filter processed tags
//                       .join(",");

//             const imageSource = result.image || "/Images/Placeholder.webp";

//             const plainDescription = stripAnchorTags(result.description);

//             article.innerHTML = `
//             <a href="${result.url}">
//                 <picture>
//                     <source srcset="${imageSource}" media="(min-width: 768px), (orientation: landscape)" />
//                     <img src="${imageSource}" alt="${result.title}" itemprop="image" />
//                 </picture>
//                 <div class="InfoPanel">
//                     ${result.isSection ? `<h3>${result.parentPage}</h3>` : ""}
//                     <h2 itemprop="headline">${result.title}</h2>
//                     <p itemprop="description">${plainDescription}</p>
//                     <div class="tagContent">${tagContent}</div>

//                 </div>
//                 </a>
//             `;

//             mainContainer.appendChild(article);
//             const processedTags = SearchHelpers.processTags(result.tags, true);
//             console.log("Processed tags for result:", result.title, processedTags);
//         });

//         splitTagsIntoDivs(); // Transform tags into divs
//     }

//     function renderTags(tagGroups, context) {
//         const tagDatabase = context.tagDatabase;
//         if (!tagDatabase) {
//             console.error("Tag database container is missing.");
//             return;
//         }

//         tagDatabase.innerHTML = "";

//         Object.entries(tagGroups).forEach(([groupName, tags]) => {
//             if (tags.length === 0) return;

//             const groupDiv = document.createElement("div");
//             groupDiv.classList.add("tag-group");

//             const groupHeader = document.createElement("button");
//             groupHeader.textContent = groupName;
//             groupHeader.classList.add("tag-group-header");

//             const groupContent = document.createElement("div");
//             groupContent.classList.add("tag-group-content", "hidden");

//             tags.forEach((tag) => {
//                 const tagLink = document.createElement("a");
//                 tagLink.href = `#tag-${encodeURIComponent(tag)}`;
//                 tagLink.textContent = tag;
//                 tagLink.classList.add("tag-link");

//                 // Highlight only active tags for this context
//                 if (context.activeTags.includes(tag)) {
//                     tagLink.classList.add("popup-active-tag");
//                 }

//                 // Add event listener for toggling tags
//                 tagLink.addEventListener("click", (event) => {
//                     event.preventDefault();
//                     toggleTag(tag, context);
//                     groupContent.classList.add("hidden"); // Collapse the group after selection
//                 });

//                 groupContent.appendChild(tagLink);
//             });

//             groupHeader.addEventListener("click", (event) => {
//                 event.stopPropagation();
//                 const isHidden = groupContent.classList.contains("hidden");
//                 document.querySelectorAll(".tag-group-content").forEach((content) => content.classList.add("hidden")); // Hide other groups
//                 if (isHidden) groupContent.classList.remove("hidden");
//             });

//             groupDiv.appendChild(groupHeader);
//             groupDiv.appendChild(groupContent);
//             tagDatabase.appendChild(groupDiv);
//         });

//         // Ensure group contents collapse when clicking outside
//         document.addEventListener("click", (event) => {
//             if (!tagDatabase.contains(event.target)) {
//                 document.querySelectorAll(".tag-group-content").forEach((content) => content.classList.add("hidden"));
//             }
//         });
//     }

//     function toggleTag(tag, context) {
//         // Update activeTags list for the specific context
//         if (context.activeTags.includes(tag)) {
//             context.activeTags = context.activeTags.filter((t) => t !== tag);
//         } else {
//             context.activeTags.push(tag);
//         }

//         // Update the active tags visually
//         renderActiveTags(context);

//         // Update tag highlights for the specific context
//         const contextTagLinks = context.tagDatabase.querySelectorAll(".tag-link");
//         contextTagLinks.forEach((tagLink) => {
//             if (context.activeTags.includes(tagLink.textContent.trim())) {
//                 tagLink.classList.add("popup-active-tag");
//             } else {
//                 tagLink.classList.remove("popup-active-tag");
//             }
//         });

//         // Apply filters specific to the context
//         applyFilters(Object.keys(contexts).find((key) => contexts[key] === context));
//     }

//     function renderActiveTags(context) {
//         const { activeTagsContainer, activeTags } = context;
//         activeTagsContainer.innerHTML = "";

//         activeTags.forEach((tag) => {
//             const tagElement = document.createElement("span");
//             tagElement.classList.add("active-tag-item");
//             tagElement.textContent = tag;

//             const removeButton = document.createElement("button");
//             removeButton.innerHTML = "<span class='material-symbols-outlined'>close</span>";
//             removeButton.classList.add("remove-tag-button");

//             // Remove the tag from active tags when the remove button is clicked
//             removeButton.addEventListener("click", () => {
//                 context.activeTags = context.activeTags.filter((t) => t !== tag);
//                 renderActiveTags(context);

//                 // Remove the popup-active-tag class from the corresponding tag link
//                 document.querySelectorAll(".tag-link").forEach((tagLink) => {
//                     if (tagLink.textContent.trim() === tag) {
//                         tagLink.classList.remove("popup-active-tag");
//                     }
//                 });

//                 applyFilters(Object.keys(contexts).find((key) => contexts[key] === context));
//             });

//             tagElement.appendChild(removeButton);
//             activeTagsContainer.appendChild(tagElement);
//         });
//     }

//     let isPreloading = false;

//     function preloadHomepageGuides(context, pages) {
//         console.trace();
//         console.log("Preloading homepage guides. Context:", context);

//         if (!context.results) {
//             console.error("Invalid context or missing results container:", context);
//             return;
//         }

//         const url = new URL(window.location.href);
//         const params = new URLSearchParams(url.search);
//         const hasTags = params.has("tags") || params.has("query");

//         if (hasTags) {
//             console.log("Skipping preload due to active tags or query.");
//             return;
//         }

//         console.log("Preloading default guides for context:", context);

//         console.log(`Context results ID: ${context.results.id || "No ID available"}`);

//         const container = context.results;

//         while (container.children.length > (context === contexts.homepage ? 1 : 0)) {
//             container.removeChild(container.lastChild);
//         }

//         const uniquePages = Array.from(new Set(pages.map((page) => page.url))).map((url) =>
//             pages.find((page) => page.url === url)
//         );

//         uniquePages.forEach((page) => {
//             const article = document.createElement("article");
//             article.setAttribute("itemscope", "");
//             article.setAttribute("itemtype", "https://schema.org/CreativeWork");
//             article.id = page.id || "";

//             const imageSource = page.image || "/Images/Placeholder.webp";
//             const plainDescription = stripAnchorTags(page.description);

//             // Define a reusable filter condition for exclusions
//             const isExcludedTag = (tag) =>
//                 /less than 1km|1-5km|5-10km|10-20km|20\+km|less than 2hrs|2-4hrs|4\+hrs|national park|nature reserve/i.test(
//                     tag
//                 );

//             const tagContent = page.isSection
//                 ? page.rawTags
//                     ? page.rawTags.filter((tag) => !isExcludedTag(tag)).join(",") // Filter and join raw tags for sections
//                     : ""
//                 : SearchHelpers.processTags(page.tags, true)
//                       .filter((tag) => !isExcludedTag(tag)) // Filter processed tags
//                       .join(",");

//             article.innerHTML = `
//             <a href="${page.url}">
//                 <picture>
//                     <source srcset="${imageSource}" media="(min-width: 768px), (orientation: landscape)" />
//                     <img src="${imageSource}" alt="${page.title}" itemprop="image" />
//                 </picture>
//                 <div class="InfoPanel">
//                     <h2 itemprop="headline">${page.title}</h2>
//                     <p itemprop="description">${plainDescription}</p>
//                     <div class="tagContent">${tagContent}</div>
//                 </div>
//             </a>
//         `;

//             container.appendChild(article);
//         });

//         splitTagsIntoDivs();
//         console.log(`preloadHomepageGuides completed for context: ${context.results.id}`);
//     }

//     function clearSearch(contextKey) {
//         console.log(`clearSearch called for context: ${contextKey}`);
//         console.trace(); // Add this line to show the call stack
//         const context = contexts[contextKey];
//         if (!context) {
//             console.error(`Context not found: ${contextKey}`);
//             return;
//         }

//         // Clear the search input and active tags
//         context.input.value = "";
//         context.activeTags = [];
//         renderActiveTags(context);

//         // Remove active classes from all tag links
//         const contextTagLinks = context.tagDatabase.querySelectorAll(".tag-link");
//         contextTagLinks.forEach((tagLink) => tagLink.classList.remove("popup-active-tag"));

//         // Reset the URL
//         const url = new URL(window.location.href);
//         const params = new URLSearchParams(url.search);
//         params.delete("query");
//         params.delete("tags");
//         history.replaceState(null, "", `${url.pathname}`);

//         console.log(`Cleared search state for context: ${contextKey}`);

//         // Reload the default guides for this context
//         const pagesOnly = searchData.filter((page) => page.id && !page.isSection);
//         preloadHomepageGuides(context, pagesOnly);
//     }

//     Object.keys(contexts).forEach((contextKey) => {
//         const context = contexts[contextKey];

//         //if (context.clearSearchButton && !context.clearSearchButton.hasListener) {
//         if (context.clearSearchButton) {
//             context.clearSearchButton.removeEventListener("click", () => clearSearch(contextKey));
//             //context.clearSearchButton.addEventListener("click", () => clearSearch(contextKey));

//             context.clearSearchButton.addEventListener("click", () => {
//                 console.log(`Adding event listener for clearSearch on context: ${contextKey}`);
//                 clearSearch(contextKey);
//             });

//             console.log(`Clear button clicked for context: ${contextKey}`);
//             context.input.value = "";
//             context.activeTags = [];
//             renderActiveTags(context);
//             applyFilters(contextKey);
//             context.clearSearchButton.hasListener = true;
//         }

//         //if (!context) return;

//         //context.clearSearchButton?.addEventListener("click", () => clearSearch(contextKey));

//         context.input?.addEventListener("input", () => applyFilters(contextKey));
//         context.clearSearchButton?.addEventListener("click", () => {});
//         context.clearTagsButton?.addEventListener("click", () => {
//             context.activeTags = [];
//             renderActiveTags(context);
//             applyFilters(contextKey);
//         });
//     });
// });

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
        const answer = document.getElementById(button.getAttribute("aria-controls"));
        const isExpanded = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", !isExpanded);
        answer.hidden = isExpanded;
    });
});

//document.querySelectorAll(".faq-question").forEach((button) => {
//    button.addEventListener("click", () => {
//        const answer = button.nextElementSibling;
//        answer.hidden = !answer.hidden;
//    });
//});

document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
        const parent = button.closest(".InfoPanel");
        const tabs = parent.querySelectorAll(".tab-button");
        const contents = parent.querySelectorAll(".tab-content");

        // Remove active state from all tabs and contents
        tabs.forEach((tab) => tab.classList.remove("active"));
        contents.forEach((content) => content.classList.remove("active"));

        // Activate the clicked tab and corresponding content
        button.classList.add("active");
        parent.querySelector(`.tab-content.${button.dataset.tab}`).classList.add("active");
    });
});

function splitTagsIntoDivs() {
    document.querySelectorAll(".tagContent").forEach((tagContainer) => {
        // Ensure this container hasn't already been transformed
        if (!tagContainer.classList.contains("transformed")) {
            console.log("Original textContent:", tagContainer.textContent); // Debugging

            // Extract and split tags only when the comma is not followed by a space
            const tags = tagContainer.textContent
                .split(/,(?! )/) // Split on commas not followed by a space
                .map((tag) => tag.trim()); // Trim spaces around each tag

            console.log("Split tags:", tags); // Debugging

            // Create a new container with the class "tags"
            const tagsContainer = document.createElement("div");
            tagsContainer.classList.add("tags");

            // Create individual divs for each tag and append them to the new container
            tags.forEach((tag) => {
                const tagDiv = document.createElement("div");
                tagDiv.textContent = tag;
                tagsContainer.appendChild(tagDiv);
            });

            // Replace the old tagContent container with the new tags container
            tagContainer.replaceWith(tagsContainer);

            // Add the 'transformed' class to prevent re-processing
            tagsContainer.classList.add("transformed");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // splitTagsIntoDivs(); // Apply to static content

    const mainHorizontal = document.querySelector("main#horizontal");
    const mainSections = mainHorizontal ? mainHorizontal.querySelectorAll("article") : [];
    const landingSections = document.querySelectorAll("main#vertical > article");

    // Only add arrows if main#horizontal has more than one child
    if (mainSections.length > 1) {
        mainSections.forEach((section) => {
            const firstChild = section.firstElementChild;
            if (firstChild) {
                firstChild.insertAdjacentHTML(
                    "afterend",
                    '<a class="bwd"><span class="material-symbols-outlined">chevron_left</span></a>' +
                        '<a class="fwd"><span class="material-symbols-outlined">chevron_right</span></a>'
                );
            }
        });

        // Set up forward and backward links for each section
        mainSections.forEach((section, index) => {
            let fwdButton = section.querySelector(".fwd");
            let bwdButton = section.querySelector(".bwd");

            if (fwdButton && mainSections[index + 1]) {
                fwdButton.href = `#${mainSections[index + 1].id}`;
            }
            if (bwdButton && index > 0) {
                bwdButton.href = `#${mainSections[index - 1].id}`;
            }
        });

        // Loop to connect first and last sections
        const lastSection = mainSections[mainSections.length - 1];
        if (lastSection) {
            lastSection.querySelector(".fwd").href = `#${mainSections[0].id}`;
            mainSections[0].querySelector(".bwd").href = "/";
        }
    }

    // Process landing sections
    landingSections.forEach((section) => {
        const firstChild = section.firstElementChild;
        if (firstChild) {
            firstChild.insertAdjacentHTML(
                "afterend",
                '<a class="fwd"><span class="material-symbols-outlined">chevron_right</span></a>'
            );
        }
    });
});

// NAV MENU TOGGLE
function myFunction() {
    const navDiv = document.querySelector("nav div");
    navDiv.style.display = navDiv.style.display === "block" ? "none" : "block";
}

//
//
//Scroll Indicator
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("main#horizontal > article");
    const indicator = document.querySelector(".scroll-indicator");
    const intro = document.querySelector("#Intro");

    // Ensure we have sections, the indicator, and #Intro
    if (!sections.length || !indicator || !intro) {
        console.log("Sections, scroll indicator, or #Intro not found.");
        return;
    }

    // Initially hide the indicator
    indicator.style.display = "none";

    // IntersectionObserver for showing/hiding the indicator
    const introObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // If #Intro is visible, hide the indicator
                    indicator.style.display = "none";
                } else {
                    // If #Intro is not visible, show the indicator
                    indicator.style.display = "flex";
                }
            });
        },
        {
            threshold: 0.1 // Trigger when even a small part of #Intro is visible
        }
    );

    // Observe #Intro
    introObserver.observe(intro);

    // Generate the segments dynamically
    sections.forEach((section) => {
        const segment = document.createElement("div");
        segment.classList.add("segment");

        // Get h1 or h2 content for tooltip
        const h1 = section.querySelector("h1");
        const h2 = section.querySelector("h2");
        const tooltipText = h1 ? h1.textContent : h2 ? h2.textContent : "Section";

        // Create and append the tooltip
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");
        tooltip.textContent = tooltipText.trim(); // Use the text content
        segment.appendChild(tooltip);

        // Add click-to-scroll functionality
        segment.addEventListener("click", () => {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        indicator.appendChild(segment);
    });

    // Update the active segment based on scroll
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const activeIndex = [...sections].indexOf(entry.target);
                    const segments = document.querySelectorAll(".scroll-indicator .segment");

                    // Highlight the correct segment
                    segments.forEach((seg, index) => {
                        if (index === activeIndex) {
                            seg.classList.add("active");
                        } else {
                            seg.classList.remove("active");
                        }
                    });
                }
            });
        },
        {
            threshold: 0.6 // Adjusts how much of a section must be visible to trigger
        }
    );

    // Observe each section
    sections.forEach((section) => observer.observe(section));
});

document.addEventListener("DOMContentLoaded", function () {
    // Setup scroll handler for main container
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
        setupScrollHandler(mainContainer, "main");
    } else {
        console.error("Main container not found");
    }

    /**
     * Sets up a scroll handler for a given container.
     * @param {Element} container - The scrollable container element.
     * @param {string} context - The context ("main" or "nav") to distinguish actions.
     */
    function setupScrollHandler(container, context) {
        let isScrolling;

        container.addEventListener("scroll", function () {
            clearTimeout(isScrolling);

            // Close .tag-group-content specific to the context
            document.querySelectorAll("main .tag-group-content").forEach((content) => content.classList.add("hidden"));

            // Optional: lock scrolling for "main"
            if (context === "main") {
                isScrolling = setTimeout(() => {
                    lockScroll(container);
                }, 100);
            }
        });
    }

    /**
     * Locks the scroll to the nearest section in the main container.
     * @param {Element} container - The scrollable container.
     */
    function lockScroll(container) {
        const containerWidth = container.offsetWidth;
        const scrollLeft = container.scrollLeft;

        // Calculate the nearest scroll position (100vw per section)
        const nearestSection = Math.round(scrollLeft / containerWidth) * containerWidth;

        // Smooth scroll to the nearest section
        container.scrollTo({
            left: nearestSection,
            behavior: "smooth"
        });
    }
});

// document.addEventListener("DOMContentLoaded", function () {
//     document.querySelectorAll(".tags a:not(a[target='_blank'])").forEach((link) => {
//         link.innerHTML += '<span class="material-symbols-outlined">chevron_right</span>';
//     });

//     document.querySelectorAll("a[target='_blank']").forEach((link) => {
//         link.innerHTML += '<span class="material-symbols-outlined">arrow_outward</span>';
//     });
// });
