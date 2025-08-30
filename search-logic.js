/*eslint-env es6*/

// This file replaces the entire inline script in index.liquid.
// It is designed to be self-contained and handles all search and tag filtering logic.

// Shared helpers for search
const SearchHelpers = {
    normaliseTag(tag) {
        if (!tag || typeof tag !== 'string') {
            return null;
        }

        const lowerTag = tag.toLowerCase();

        // Prioritize specific string tags first
        if (lowerTag.includes("new south wales")) return "New South Wales";
        if (lowerTag.includes("queensland")) return "Queensland";
        if (lowerTag.includes("national park")) return "National Park";
        if (lowerTag.includes("nature reserve")) return "Nature Reserve";
        if (lowerTag.includes("binna burra section")) return "Binna Burra Section";
        if (lowerTag.includes("green mountains section")) return "Green Mountains Section";
        if (lowerTag === "beaches" || lowerTag === "beach") return "Beach";
        if (lowerTag.includes("drive")) return "Scenic Drive";
        
        // Handle numeric tags (distance and duration) next
        if (/\d+/.test(tag)) {
            const value = parseFloat(tag);
            const isKm = lowerTag.includes("km");
            const isM = lowerTag.includes("m");
            const isHrs = lowerTag.includes("hr");
            const isMins = lowerTag.includes("min");

            if (isM && !isKm) {
                return "less than 1km";
            }
            if (isKm) {
                if (value < 1) return "less than 1km";
                if (value <= 5) return "1-5km";
                if (value <= 10) return "5-10km";
                if (value <= 20) return "10-20km";
                return "20+km";
            }
            if (isHrs) {
                if (value < 2) return "less than 2hrs";
                if (value <= 4) return "2-4hrs";
                return "4+hrs";
            }
            if (isMins) {
                const totalHours = value / 60;
                if (totalHours < 2) return "less than 2hrs";
                return "2+hrs";
            }
        }
        
        // Handle plurals as a final check
        if (tag.endsWith("s") && !tag.endsWith("ss")) {
            const exceptions = ["beaches", "classes", "grass"];
            if (!exceptions.some(exception => exception.toLowerCase() === lowerTag)) {
                return tag.slice(0, -1);
            }
        }

        return tag;
    },
    processTags(tags) {
        if (!Array.isArray(tags)) return [];
        return [...new Set(tags.map(this.normaliseTag).filter(t => t))];
    },
    sortTags(tags) {
        const distanceOrder = ["less than 1km", "1-5km", "5-10km", "10-20km", "20+km"];
        const timeOrder = ["less than 2hrs", "2-4hrs", "4+hrs"];
        const distanceTags = tags.filter(tag => distanceOrder.includes(tag));
        const timeTags = tags.filter(tag => timeOrder.includes(tag));
        const otherTags = tags.filter(tag => !distanceOrder.includes(tag) && !timeOrder.includes(tag));
        return [
            ...distanceOrder.filter(tag => distanceTags.includes(tag)),
            ...timeOrder.filter(tag => timeTags.includes(tag)),
            ...otherTags.sort()
        ];
    }
};

const contexts = {
    homepage: {
        input: document.querySelector(".search-input"),
        allContentContainer: document.getElementById('all-content-cards'),
        searchResultsContainer: document.getElementById('search-results-container'),
        clearSearchButton: document.querySelector(".clear-search-button"),
        tagDatabase: document.querySelector(".tag-database .filters"),
        activeTagsContainer: document.querySelector(".active-tags-container"),
        activeTags: []
    }
};

let searchIndex, searchStore;
const tagMappings = {
    Coastal: ["Beach"]
};

// Main function to run everything
(async () => {
    try {
        const response = await fetch('/search.json');
        const searchData = await response.json();
        searchIndex = lunr.Index.load(searchData.index);
        searchStore = searchData.store;

        const allTags = [];
        Object.values(searchStore).forEach(item => {
            const allItemTags = item.formattedTags || [];
            if (item.formattedDistance) allItemTags.push(item.formattedDistance);
            if (item.formattedDuration) allItemTags.push(item.formattedDuration);
            allTags.push(...SearchHelpers.processTags(allItemTags));
        });

        // Define a function to categorize a single tag
        const getTagGroup = (tag) => {
            if (tag.includes("National Park") || tag.includes("Nature Reserve")) return "National Parks";
            if (tag.includes("New South Wales") || tag.includes("Queensland")) return "Location";
            if (tag.includes("hr") || tag.includes("min")) return "Time";
            if (tag.includes("km") || tag.includes("m")) return "Distance";
            return "Other";
        };
        
        const groupedTags = {
            "National Parks": [],
            "Location": [],
            "Distance": [],
            "Time": [],
            "Other": []
        };

        // Group the tags based on the new logic
        const uniqueTags = [...new Set(allTags)];
        uniqueTags.forEach(tag => {
            const groupName = getTagGroup(tag);
            groupedTags[groupName].push(tag);
        });
        
        // Sort each group
        Object.keys(groupedTags).forEach(key => {
            groupedTags[key] = SearchHelpers.sortTags(groupedTags[key]);
        });

        renderTags(groupedTags, contexts.homepage);

        // Define and expose the debugging function
        window.checkTagGroups = () => {
            console.log("--- Tag Grouping Analysis ---");
            Object.entries(groupedTags).forEach(([groupName, tags]) => {
                console.log(`\n** ${groupName} **`);
                if (tags.length > 0) {
                    tags.forEach(tag => console.log(`- ${tag}`));
                } else {
                    console.log("  (no tags in this group)");
                }
            });
            console.log("\n----------------------------");
        };
        
        // Handle URL parameters on page load
        const initialQuery = new URLSearchParams(window.location.search).get('q');
        const initialTags = new URLSearchParams(window.location.search).get('tags');
        if (initialQuery) {
            contexts.homepage.input.value = initialQuery;
        }
        if (initialTags) {
            contexts.homepage.activeTags = initialTags.split(',').filter(Boolean);
            renderActiveTags(contexts.homepage);
        }
        if (initialQuery || initialTags) {
            applyFilters('homepage');
        } else {
            contexts.homepage.allContentContainer.style.display = 'grid';
            contexts.homepage.searchResultsContainer.style.display = 'none';
        }

    } catch (error) {
        console.error("Error loading search data:", error);
    }
})();

// --- Event Listeners and Functions ---

contexts.homepage.input.addEventListener('input', () => {
    updateURL();
    applyFilters('homepage');
});

contexts.homepage.clearSearchButton.addEventListener('click', () => {
    contexts.homepage.input.value = '';
    contexts.homepage.activeTags = [];
    renderActiveTags(contexts.homepage);
    updateURL();
    applyFilters('homepage');
});

function toggleTag(tag) {
    const { activeTags } = contexts.homepage;
    const index = activeTags.indexOf(tag);
    if (index > -1) {
        activeTags.splice(index, 1);
    } else {
        activeTags.push(tag);
    }
    renderActiveTags(contexts.homepage);
    updateURL();
    applyFilters('homepage');
}

function renderTags(tagGroups, context) {
    const tagDatabase = context.tagDatabase;
    tagDatabase.innerHTML = "";
    Object.entries(tagGroups).forEach(([groupName, tags]) => {
        if (tags.length === 0) return;
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("tag-group");
        const groupHeader = document.createElement("button");
        groupHeader.textContent = groupName;
        groupHeader.classList.add("tag-group-header");
        const groupContent = document.createElement("div");
        groupContent.classList.add("tag-group-content", "hidden");
        tags.forEach(tag => {
            const tagLink = document.createElement("a");
            tagLink.href = `#tag-${encodeURIComponent(tag)}`;
            tagLink.textContent = tag;
            tagLink.classList.add("tag-link");
            if (context.activeTags.includes(tag)) {
                tagLink.classList.add("popup-active-tag");
            }
            tagLink.addEventListener("click", event => {
                event.preventDefault();
                toggleTag(tag);
                groupContent.classList.add("hidden");
            });
            groupContent.appendChild(tagLink);
        });
        groupHeader.addEventListener("click", event => {
            event.stopPropagation();
            const isHidden = groupContent.classList.contains("hidden");
            document.querySelectorAll(".tag-group-content").forEach(content => content.classList.add("hidden"));
            if (isHidden) groupContent.classList.remove("hidden");
        });
        groupDiv.appendChild(groupHeader);
        groupDiv.appendChild(groupContent);
        tagDatabase.appendChild(groupDiv);
    });
    document.addEventListener("click", event => {
        if (!tagDatabase.contains(event.target)) {
            document.querySelectorAll(".tag-group-content").forEach(content => content.classList.add("hidden"));
        }
    });
}

function renderActiveTags(context) {
    const { activeTagsContainer, activeTags } = context;
    activeTagsContainer.innerHTML = "";
    activeTags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("active-tag-item");
        tagElement.textContent = tag;
        const removeButton = document.createElement("button");
        removeButton.innerHTML = "<span class='material-symbols-outlined'>close</span>";
        removeButton.classList.add("remove-tag-button");
        removeButton.addEventListener("click", () => {
            toggleTag(tag);
        });
        tagElement.appendChild(removeButton);
        activeTagsContainer.appendChild(tagElement);
    });
}

function updateURL() {
    const { input, activeTags } = contexts.homepage;
    const query = input.value.trim();
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (activeTags.length > 0) params.set('tags', activeTags.join(','));

    history.pushState({}, '', `${url.pathname}?${params.toString()}`);
}

function applyFilters(contextKey) {
    const context = contexts[contextKey];
    if (!context) return;
    
    const query = context.input.value.trim().toLowerCase();
    const activeTags = context.activeTags;
    
    // Check for a single '*' or empty query to display all content
    if (query === '' && activeTags.length === 0) {
      context.allContentContainer.style.display = 'grid';
      context.searchResultsContainer.style.display = 'none';
      return;
    }
    if (query === '*') {
      context.allContentContainer.style.display = 'none';
      context.searchResultsContainer.style.display = 'grid';
      const allItems = Object.values(searchStore);
      renderResults(allItems, context);
      return;
    }

    // Lunr search for text
    let lunrResults = [];
    if (query) {
        // Build the Lunr query string with wildcards for partial matches and boosting for relevance
        const queryWords = query.split(/\s+/).filter(Boolean);
        const lunrQuery = queryWords.map(word => `${word}*^10 ${word}~1`).join(' ');
        lunrResults = searchIndex.search(lunrQuery);
    } else {
        // If no text query, get all documents from the search store to be filtered by tags
        lunrResults = Object.keys(searchStore).map(ref => ({ ref }));
    }

    // Manual filtering for tags
    let filteredItems = lunrResults.map(result => searchStore[result.ref]);
    if (activeTags.length > 0) {
        filteredItems = filteredItems.filter(item => {
            const itemTags = SearchHelpers.processTags(item.formattedTags);
            if (item.formattedDistance) itemTags.push(item.formattedDistance);
            if (item.formattedDuration) itemTags.push(item.formattedDuration);
            
            // Check if all active tags are present in the item's tags
            const expandedActiveTags = [...new Set(activeTags.flatMap(tag => tagMappings[tag] || [tag]))];
            return expandedActiveTags.every(activeTag => itemTags.includes(activeTag));
        });
    }

    renderResults(filteredItems, context);
}

function renderResults(results, context) {
    const container = context.searchResultsContainer;
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        context.allContentContainer.style.display = 'none';
        container.style.display = 'grid';
        return;
    }
    
    results.forEach(item => {
        const card = document.createElement('article');
        card.className = 'search-result-card';
        
        // Correctly assemble the tags to avoid duplication
        const tags = [];
        if (item.formattedDistance) {
            tags.push(item.formattedDistance);
        }
        if (item.formattedDuration) {
            tags.push(item.formattedDuration);
        }
        if (item.formattedTags) {
            tags.push(...item.formattedTags);
        }
        
        const combinedTagsHtml = [...new Set(tags)].map(tag => `<div class="tag">${tag}</div>`).join('');

        card.innerHTML = `
            <a href="${item.canonicalURL || item.url}">
                <picture>
                    <source
                        srcset='${item.imagePath}'
                        media='(min-width: 768px), (orientation: landscape)'
                        onerror='this.onerror=null;this.src="/Images/Placeholder.webp";'>
                    <img src="${item.imagePath}" alt="${item.title}">
                </picture>
                <div class="InfoPanel">
                    <h2>${item.title}</h2>
                    <p>${item.description}</p>
                    <div class="tags">${combinedTagsHtml}</div>
                </div>
            </a>
        `;
        container.appendChild(card);
    });

    context.allContentContainer.style.display = 'none';
    container.style.display = 'grid';
}