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
async function loadPartial(elementId, partialPath) {
  try {
    const response = await fetch(partialPath);
    if (!response.ok) {
      throw new Error(`Could not load ${partialPath}`);
    }
    const htmlContent = await response.text();
    document.getElementById(elementId).innerHTML = htmlContent;
    // Save the partial that was loaded
    localStorage.setItem('lastActivePage', partialPath);
    return htmlContent;
  } catch (error) {
    console.error('Error loading partial:', error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadPartial('sidebar-placeholder', './partials/sidebar.html');
  loadPartial('navbar-placeholder', './partials/navbar.html');
  
  // Retrieve the last active page from localStorage, defaulting to About only if none exists.
  const lastPage = localStorage.getItem('lastActivePage') || './partials/about.html';
  console.log("Last active page:", lastPage);
  
  loadPartial('content-placeholder', lastPage)
    .then(() => {
      if (lastPage.includes('news.html')) {
        initNewsFilter();
      }
    })
    .catch((error) => {
      console.error("Error loading content partial:", error);
    });
});

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



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
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