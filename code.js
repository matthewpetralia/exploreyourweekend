/*eslint-env es6*/



document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
        const answer = document.getElementById(button.getAttribute("aria-controls"));
        const isExpanded = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", !isExpanded);
        answer.hidden = isExpanded;
    });
});


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

    
    
    document.addEventListener("DOMContentLoaded", function () {

        

    // NAV MENU TOGGLE
    const menuButton = document.querySelector('[data-menu-toggle]');

    const navDiv = document.querySelector('nav div');

    if (menuButton) {
        menuButton.addEventListener('click', () => {
            if (navDiv) {
                navDiv.style.display = navDiv.style.display === "block" ? "none" : "block";
                
                const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
                menuButton.setAttribute('aria-expanded', !isExpanded);
            }
        });
    }


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

// This function calculates and sets the viewport height to avoid mobile browser UI issues
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set the height on load
setViewportHeight();

// Re-calculate the height on window resize
window.addEventListener('resize', setViewportHeight);

// Now apply this to your elements using CSS variables
// Add this to the top of your CSS
// :root {
//     --vh: 100vh;
// }

// Then replace the existing height/min-height on your main and article elements
// main#horizontal, main#vertical {
//     height: calc(var(--vh, 1vh) * 100 - 7vh);
//     min-height: calc(var(--vh, 1vh) * 100 - 7vh);
// }
// article {
//     height: calc(var(--vh, 1vh) * 100 - 7vh);
//     min-height: calc(var(--vh, 1vh) * 100 - 7vh);
// }

// function initializeImageLayout() {
//     const galleries = document.querySelectorAll('.multiImage');
    
//     galleries.forEach(gallery => {
//         const images = gallery.querySelectorAll('.image-wrapper');
//         const count = images.length;
//         const parent = gallery.parentElement;
//         const parentWidth = parent.offsetWidth;
//         const parentHeight = parent.offsetHeight;

//         // Reset any existing classes
//         gallery.className = 'multiImage';
        
//         // Add layout class based on image count
//         gallery.classList.add(`layout-${Math.min(count, 6)}`);

//         // Calculate minimum image size based on layout
//         let minImageSize;
//         if (count <= 2) {
//             minImageSize = parentHeight / 2;
//         } else if (count <= 4) {
//             minImageSize = Math.min(parentWidth / 2, parentHeight / 2);
//         } else {
//             minImageSize = Math.min(parentWidth / 3, parentHeight / 2);
//         }

//         // Check if images would be too small
//         if (minImageSize < 200) { // minimum acceptable size in pixels
//             gallery.classList.add('overflow-layout');
//             const visibleCount = Math.floor((parentWidth * parentHeight) / (200 * 200));
            
//             // Hide excess images
//             images.forEach((img, index) => {
//                 if (index >= visibleCount) {
//                     img.style.display = 'none';
//                 }
//             });

//             // Add overlay to last visible image if there are hidden images
//             if (count > visibleCount) {
//                 const lastVisible = images[visibleCount - 1];
//                 const overlay = document.createElement('div');
//                 overlay.className = 'image-overlay';
//                 overlay.innerHTML = `+${count - visibleCount + 1} more`;
//                 lastVisible.appendChild(overlay);
//             }
//         }
//     });
// }

// // Initialize on load and when window resizes
// document.addEventListener('DOMContentLoaded', initializeImageLayout);
// window.addEventListener('resize', debounce(initializeImageLayout, 250));

// // Debounce helper function
// function debounce(func, wait) {
//     let timeout;
//     return function executedFunction(...args) {
//         const later = () => {
//             clearTimeout(timeout);
//             func(...args);
//         };
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//     };
// }