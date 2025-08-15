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
      initThemeToggle();
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
  if (!section) return;

  loadPartial("content-placeholder", `./partials/${section}.html`)
    .then(async () => {
      if (section === "journey") {
        initNewsFilter();
      }
      if (section === "about") {
        await ensureRecentUpdates();
      }
      updateActiveNav();
    });
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
  const newsArticle = document.querySelector('article.news');
  if (!newsArticle) return;

  const filterButtons = newsArticle.querySelectorAll('.news-filter .filter-btn');
  const timelineItems = newsArticle.querySelectorAll('.timeline-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.getAttribute('data-filter');

      // only mess with buttons in this article
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // only mess with items in this article
      timelineItems.forEach(item => {
        const itemCategories = item.getAttribute('data-category').split(' ');
        item.style.display = (filterValue === 'all' || itemCategories.includes(filterValue))
          ? 'list-item'
          : 'none';
      });

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
  const journeyList = document.querySelector('#hidden-journey-placeholder article.news .timeline-list');
  if (!updatesList || !journeyList) return;

  updatesList.innerHTML = '';

  // reset any lingering inline styles just in case
  journeyList.querySelectorAll('.timeline-item').forEach(i => i.style.display = 'list-item');

  // take top two (DOM order)
  const mostRecent = Array.from(journeyList.querySelectorAll('.timeline-item')).slice(0, 2);

  mostRecent.forEach(item => {
    const clone = item.cloneNode(true);
    // make sure clones are visible
    clone.style.display = 'list-item';
    updatesList.appendChild(clone);
  });
}


async function ensureRecentUpdates() {
  // Only do work if we're on About and the container exists
  const updatesList = document.querySelector('#recent-updates .timeline-list');
  if (!updatesList) return;

  // If the hidden journey isn't loaded (or got replaced), load it first
  let journeyList = document.querySelector('#hidden-journey-placeholder article.news .timeline-list');
  if (!journeyList || journeyList.children.length === 0) {
    await loadPartial('hidden-journey-placeholder', './partials/journey.html', false);
  }

  // Now (re)insert the two most recent items
  insertRecentUpdates();
}


function initThemeToggle() {
  const input = document.getElementById('theme-toggle');
  if (!input) return;

  const media = window.matchMedia('(prefers-color-scheme: dark)');

  // Helper: apply a theme and update UI
  const applyTheme = (mode) => {
    const isDark = mode === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark);
    input.checked = isDark;
  };

  // 1) Determine initial mode
  let stored = localStorage.getItem('theme'); // 'dark' | 'light' | null
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);         // user override
  } else {
    applyTheme(media.matches ? 'dark' : 'light'); // system default
  }

  // 2) React to slider changes (this sets a user override)
  input.addEventListener('change', () => {
    const mode = input.checked ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
    applyTheme(mode);
  });

  // 3) React to system changes ONLY if there’s no user override
  const onSystemChange = (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  };
  // Modern & legacy listener support
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onSystemChange);
  } else if (typeof media.addListener === 'function') {
    media.addListener(onSystemChange);
  }
}

function setNavOffset() {
  const nav = document.querySelector('.navbar');
  const h = nav ? nav.offsetHeight : 0;
  document.documentElement.style.setProperty('--nav-h', `${h}px`);
}
window.addEventListener('load', setNavOffset);
window.addEventListener('resize', setNavOffset);



// ===== DEBUG (remove later) =====
// (function () {
//   const badge = document.createElement('div');
//   badge.style.cssText = `
//     position:fixed; z-index:9999; right:8px; bottom:8px;
//     font:12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
//     background:#000c; color:#fff; padding:6px 8px; border-radius:8px;
//     pointer-events:none;`;
//   document.body.appendChild(badge);

//   const mq = [
//     ['≤579',  '(max-width: 579px)'],
//     ['580–767','(min-width: 580px) and (max-width: 767px)'],
//     ['768–1023','(min-width: 768px) and (max-width: 1023px)'],
//     ['≥1024','(min-width: 1024px)']
//   ].map(([label, q]) => [label, window.matchMedia(q)]);

//   function tick() {
//     const w = window.innerWidth;
//     const active = mq.find(([, m]) => m.matches)?.[0] || '—';
//     const nav = document.querySelector('.navbar');
//     const navH = nav ? Math.round(getComputedStyle(nav).height.replace('px','')) : 0;
//     badge.textContent = `w:${w}px  •  ${active}  •  navH:${navH}px`;
//     // console view too:
//     // console.log({w, active, navH});
//   }
//   window.addEventListener('resize', tick, {passive:true});
//   window.addEventListener('DOMContentLoaded', tick);
//   tick();
// })();
