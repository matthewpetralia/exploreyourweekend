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



// NAV MENU TOGGLE
function myFunction() {
    const navDiv = document.querySelector("nav div");
    navDiv.style.display = navDiv.style.display === "block" ? "none" : "block";
}



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

