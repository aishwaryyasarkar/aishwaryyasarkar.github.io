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

window.addEventListener('DOMContentLoaded', () => {
  loadPartial('sidebar-placeholder', './partials/sidebar.html');
  loadPartial('navbar-placeholder', './partials/navbar.html');
  loadPartial('content-placeholder', './partials/about.html');
});

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


function initNewsFilter() {
  console.log("initNewsFilter running");
  const filterButtons = document.querySelectorAll('.news-filter .filter-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  // console.log("Found filterButtons:", filterButtons);
  // console.log("Found timelineItems:", timelineItems);
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.getAttribute('data-filter');
      // console.log('Filter clicked:', filterValue);
      
      // Remove 'active' from all buttons, then add to clicked one
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Loop through timeline items and show/hide based on data-category
      timelineItems.forEach(item => {
        const itemCategories = item.getAttribute('data-category').split(' ');
        if (filterValue === 'all' || itemCategories.includes(filterValue)) {
          item.style.display = 'list-item';
          // console.log("Showing item:", item.textContent);
        } else {
          item.style.display = 'none';
          // console.log("Hiding item:", item.textContent);
        }
      });
    });
  });
}



