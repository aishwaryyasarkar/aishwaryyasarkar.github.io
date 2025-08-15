'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

function initSidebar() {
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  // If these elements exist, attach event listeners
  if (sidebar && sidebarBtn) {
    sidebarBtn.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });
  }
}


async function loadPartial(elementId, partialPath, updateHash = true) {
  try {
    const response = await fetch(partialPath);
    if (!response.ok) {
      throw new Error(`Could not load ${partialPath}`);
    }
    const htmlContent = await response.text();
    document.getElementById(elementId).innerHTML = htmlContent;

    // Save the partial that was loaded for next time
    if (elementId === "content-placeholder") {
      localStorage.setItem("lastActivePage", partialPath);
    }

    // Update the URL hash if requested (so the address changes to #about, etc.)
    if (updateHash && elementId === "content-placeholder") {
      const fileName = partialPath.split("/").pop(); // e.g. "about.html"
      const section = fileName.replace(".html", ""); // e.g. "about"
      window.location.hash = section; 
      // or use history.pushState if you prefer:
      // history.pushState({section}, "", "#" + section);
    }

    return htmlContent;
  } catch (error) {
    console.error("Error loading partial:", error);
  }
}

/**
 * On DOMContentLoaded:
 *  1. Load sidebar and navbar
 *  2. Check the URL hash (if present) or localStorage to figure out which partial to show
 *  3. If the partial is "news", call initNewsFilter
 */
window.addEventListener("DOMContentLoaded", () => {
  // Load sidebar & navbar, no need to update hash for those
  loadPartial("sidebar-placeholder", "./partials/sidebar.html", false);
  
  // Load navbar first; once that's done, proceed
  loadPartial("navbar-placeholder", "./partials/navbar.html", false)
    .then(() => {
      // Figure out which partial to load into #content-placeholder
      let lastPage = localStorage.getItem("lastActivePage") || "./partials/about.html";

      // If the URL has a hash (e.g. #resume), use that
      if (window.location.hash) {
        const section = window.location.hash.substring(1); // remove '#'
        lastPage = `./partials/${section}.html`;
      }

      // Load the main content partial
      loadPartial("content-placeholder", lastPage, false)
      .then(() => {
        if (lastPage.includes("journey.html")) {
          initNewsFilter();
        }
        if (lastPage.includes("about.html")) {
          loadPartial("hidden-journey-placeholder", "./partials/journey.html", false)
            .then(() => {
              insertRecentUpdates();
            });
        }
        updateActiveNav();
      }).catch((error) => {
              console.error("Error loading content partial:", error);
            });
        })
    .catch((err) => {
      console.error("Error loading navbar partial:", err);
    });
});



window.addEventListener("hashchange", () => {
  const section = window.location.hash.substring(1); 
  if (section) {
    loadPartial("content-placeholder", `./partials/${section}.html`)
      .then(() => {
        if (section === "journey") {
          initNewsFilter();
        }
        updateActiveNav();
      });
  }
});


// Update the active state on navbar buttons based on the current URL hash
function updateActiveNav() {
  const navButtons = document.querySelectorAll('.navbar-link');
  const currentSection = window.location.hash.substring(1) || 'about';
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    // You can match by text content (make sure the text matches your section names)
    if (btn.textContent.trim().toLowerCase() === currentSection.toLowerCase()) {
      btn.classList.add('active');
    }
  });
}


// window.addEventListener('DOMContentLoaded', () => {
//   loadPartial('sidebar-placeholder', './partials/sidebar.html');
//   loadPartial('navbar-placeholder', './partials/navbar.html');
//   loadPartial('content-placeholder', './partials/about.html')
// });




// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}




// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}


function markLastVisibleTimelineItem() {
  const items = document.querySelectorAll('.timeline-item');
  // Remove .last-visible from all items first
  items.forEach(item => item.classList.remove('last-visible'));

  // Filter only those that are not hidden
  const visibleItems = [...items].filter(item => item.style.display !== 'none');

  // Add .last-visible to the final visible item
  if (visibleItems.length > 0) {
    const last = visibleItems[visibleItems.length - 1];
    last.classList.add('last-visible');
  }
}

function initNewsFilter() {
  console.log("initNewsFilter running");
  const filterButtons = document.querySelectorAll('.news-filter .filter-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.getAttribute('data-filter');
      
      // Remove 'active' from all filter buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Show/hide timeline items
      timelineItems.forEach(item => {
        const itemCategories = item.getAttribute('data-category').split(' ');
        if (filterValue === 'all' || itemCategories.includes(filterValue)) {
          item.style.display = 'list-item';
        } else {
          item.style.display = 'none';
        }
      });

      // 3. Mark the new last visible item after filtering
      markLastVisibleTimelineItem();
    });
  });
}

function toggleSidebarNav() {
  const nav = document.getElementById('sidebar-nav');
  // If it's hidden, show it. If shown, hide it.
  if (nav.style.display === 'block') {
    nav.style.display = 'none';
  } else {
    nav.style.display = 'block';
  }
}

function insertRecentUpdates() {
  const updatesList = document.querySelector('#recent-updates .timeline-list');
  const journeyList = document.querySelector('article.news .timeline-list');

  if (!updatesList || !journeyList) return;

  updatesList.innerHTML = '';

  // Get the first two recent journey items
  const mostRecent = Array.from(journeyList.querySelectorAll('.timeline-item')).slice(0, 2);

  mostRecent.forEach(item => {
    const clone = item.cloneNode(true);
    updatesList.appendChild(clone);
  });
}
