/*eslint-env es6*/

const SearchHelpers = {
    sortTags(tags) {
        const distanceOrder = ["less than 1km", "1-5km", "5-10km", "10-20km", "20+km"];
        const timeOrder = ["less than 2hrs", "2-4hrs", "4+hrs"];
        
        const distanceTags = tags.filter(tag => tag.group === "Distance" && distanceOrder.includes(tag.name));
        const timeTags = tags.filter(tag => tag.group === "Duration" && timeOrder.includes(tag.name));
        const otherTags = tags.filter(tag => tag.group !== "Distance" && tag.group !== "Duration");
        
        return [
            ...distanceOrder.map(name => distanceTags.find(tag => tag.name === name)).filter(Boolean),
            ...timeOrder.map(name => timeTags.find(tag => tag.name === name)).filter(Boolean),
            ...otherTags.sort((a, b) => a.name.localeCompare(b.name))
        ];
    },

    // Helper function to convert the internal tag name to a user-friendly name for display
    formatTagForDisplay(tagName) {
        return tagName.replace(/-/g, ' ');
    }
};

const contexts = {
    homepage: {
        input: document.querySelector(".search-input"),
        allContentContainer: document.querySelector('.locations-grid'),
        searchResultsContainer: document.getElementById('search-results-container'),
        clearSearchButton: document.querySelector(".clear-search-button"),
        tagDatabase: document.querySelector(".tag-database .filters"),
        activeTagsContainer: document.querySelector(".active-tags-container"),
        activeTags: []
    }
};

let searchIndex, searchStore;

function checkTagGroups(groupedTags) {
    console.log("Checking Tag Groups...");
    for (const group in groupedTags) {
        console.log(`- Group: ${group}`);
        groupedTags[group].forEach(tag => {
            console.log(`  - Tag: ${tag.name} (Group: ${tag.group})`);
        });
    }
    console.log("Check complete.");
}

// New function to parse tags from URL, handling the special case of "Gold Coast, Queensland"
function parseTagsFromUrl(tagsString) {
    if (!tagsString) return [];
    const tags = [];
    // Specific fix for 'Gold Coast, Queensland'
    if (tagsString.includes('Gold Coast, Queensland')) {
      tags.push('Gold Coast, Queensland');
      // Handle any other tags that might exist in the string
      const otherTags = tagsString.replace('Gold Coast, Queensland', '').split(',').filter(Boolean).map(tag => tag.trim());
      tags.push(...otherTags);
    } else {
      // Default behavior for all other tags
      tags.push(...tagsString.split(',').filter(Boolean).map(tag => tag.trim()));
    }
    return tags;
}

(async () => {
    try {
        const response = await fetch('/search.json');
        const searchData = await response.json();
        searchIndex = lunr.Index.load(searchData.index);
        searchStore = searchData.store;

        const allUniqueTags = new Map();
        const groupedTags = {};

        Object.values(searchStore).forEach(item => {
            if (item.formattedTags) {
                item.formattedTags.forEach(tag => {
                    const tagKey = `${tag.name}-${tag.group}`;
                    if (!allUniqueTags.has(tagKey)) {
                        allUniqueTags.set(tagKey, tag);
                        if (!groupedTags[tag.group]) {
                            groupedTags[tag.group] = [];
                        }
                        groupedTags[tag.group].push(tag);
                    }
                });
            }
        });
        
        Object.keys(groupedTags).forEach(key => {
            groupedTags[key] = SearchHelpers.sortTags(groupedTags[key]);
        });
        
        renderTags(groupedTags, contexts.homepage);
        checkTagGroups(groupedTags);
        
        const initialQuery = new URLSearchParams(window.location.search).get('q');
        const initialTagsString = new URLSearchParams(window.location.search).get('tags');
        if (initialQuery) {
            contexts.homepage.input.value = initialQuery;
        }
        if (initialTagsString) {
            // Use the new function to parse the tags correctly
            contexts.homepage.activeTags = parseTagsFromUrl(initialTagsString);
            renderActiveTags(contexts.homepage);
        }
        if (initialQuery || initialTagsString) {
            applyFilters('homepage');
        } else {
            contexts.homepage.allContentContainer.style.display = 'grid';
            contexts.homepage.searchResultsContainer.style.display = 'none';
        }

    } catch (error) {
        console.error("Error loading search data:", error);
    }
})();

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
            // Use the helper to format for display, but the original name for the URL
            tagLink.href = `#tag-${encodeURIComponent(tag.name)}`;
            tagLink.textContent = SearchHelpers.formatTagForDisplay(tag.name);
            tagLink.classList.add("tag-link");
            if (context.activeTags.includes(tag.name)) {
                tagLink.classList.add("popup-active-tag");
            }
            tagLink.addEventListener("click", event => {
                event.preventDefault();
                toggleTag(tag.name);
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
        // Use the helper to format for display
        tagElement.textContent = tag;
        const removeButton = document.createElement("button");
        removeButton.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960' ><path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z'/></svg>";
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

    let lunrResults = [];
    if (query) {
        const queryWords = query.split(/\s+/).filter(Boolean);
        const lunrQuery = queryWords.map(word => `${word}*^10 ${word}~1`).join(' ');
        lunrResults = searchIndex.search(lunrQuery);
    } else {
        lunrResults = Object.keys(searchStore).map(ref => ({ ref }));
    }

    let filteredItems = lunrResults.map(result => searchStore[result.ref]);
    if (activeTags.length > 0) {
        filteredItems = filteredItems.filter(item => {
            const itemTagNames = (item.formattedTags || []).map(tag => tag.name);
            return activeTags.every(activeTag => itemTagNames.includes(activeTag));
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
        
        // Sort all the tags correctly
        const sortedTags = SearchHelpers.sortTags(item.formattedTags || []);

        let combinedTagsHtml = '';
        
        // Add the formatted distance and duration tags if they exist and are for locations
        if (item.type === 'section') {
            if (item.formattedDistance && item.formattedDistance !== '0m') {
                combinedTagsHtml += `<div class="tag">${item.formattedDistance} Distance</div>`;
            }
            if (item.formattedDuration && item.formattedDuration !== '0min') {
                combinedTagsHtml += `<div class="tag">${item.formattedDuration} Duration</div>`;
            }
        }

        // Add other tags, excluding the distance and duration group names
        sortedTags.forEach(tag => {
            if (tag.group !== "Distance" && tag.group !== "Duration") {
                combinedTagsHtml += `<div class="tag">${tag.name}</div>`;
            }
        });

        function generateResponsiveImageHTML(item, aspect_ratio = "3:4") {
  const [widthRatio, heightRatio] = aspect_ratio.split(':').map(Number);
  const image_path = `${item.slug}.webp`;

  const widths = [362, 480, 592, 640, 768, 800];
  const default_width = widths[0];
  const default_height = Math.round((default_width / widthRatio) * heightRatio);

  const srcset_parts = widths.map(width => {
    const height = Math.round((width / widthRatio) * heightRatio);
    return `https://cdn.exploreyourweekend.com/cdn-cgi/image/quality=70,fit=cover,gravity=auto,width=${width},height=${height},format=auto/${image_path} ${width}w`;
  }).join(', ');

  // A reasonable default for a grid layout, similar to your all-locations page.
  // You may need to adjust this based on your specific CSS media queries.
  const sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';

  return `
    <div class="image-wrapper" style="aspect-ratio: ${widthRatio} / ${heightRatio};">
      <img
        src="https://cdn.exploreyourweekend.com/cdn-cgi/image/quality=70,fit=cover,gravity=auto,width=${default_width},height=${default_height},format=auto/${image_path}"
        srcset="${srcset_parts}"
        sizes="${sizes}"
        width="${default_width}"
        height="${default_height}"
        alt="${item.title}"
        itemprop="image"
        decoding="async"
        loading="lazy"
      >
    </div>
  `;
}

// Your existing search result card loop.
card.innerHTML = `
  <a href="${item.canonicalURL || item.url}" class="location-card">
    ${generateResponsiveImageHTML(item)}
    <div class="card-content InfoPanel">
      <h2 itemprop="headline">${item.title}</h2>
      <p itemprop="description">${item.description}</p>
      <div class="tags" itemprop="keywords">
        ${combinedTagsHtml}
      </div>
    </div>
  </a>
`;
        container.appendChild(card);
    });

    context.allContentContainer.style.display = 'none';
    container.style.display = 'grid';
}
