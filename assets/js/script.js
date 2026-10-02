'use strict';

const pages = ['about', 'resume', 'publications', 'journey'];

function showPage(moveFocus = false) {
  const requested = window.location.hash.slice(1);
  // A skip link is an in-page anchor, not a route.
  if (requested === 'content-placeholder' && document.querySelector('#content-placeholder article[hidden]')) return;
  const page = pages.includes(requested) ? requested : 'about';
  pages.forEach(name => {
    const article = document.getElementById(name);
    article.hidden = name !== page;
    article.classList.toggle('active', name === page);
  });
  document.querySelectorAll('.navbar-link').forEach(link => {
    const active = link.getAttribute('href') === `#${page}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  closeSidebarNav();
  if (moveFocus) {
    const heading = document.querySelector(`#${page} h2`);
    heading.tabIndex = -1;
    heading.focus();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  showPage();
  keepPresentEntriesFirst();
  initResumeFilter();
  initNewsFilter();
  initPublicationsFilter();
  insertRecentUpdates();
  initThemeToggle();
  initNavbarAutoHide();
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  });
  document.querySelectorAll('.sidebar-nav .navbar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (link.hash === window.location.hash) showPage(true);
    });
  });
});
window.addEventListener('hashchange', () => showPage(true));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.getElementById('hamburger').getAttribute('aria-expanded') === 'true') {
    closeSidebarNav();
    document.getElementById('hamburger').focus();
  }
});

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
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

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

function keepPresentEntriesFirst() {
  const resumeArticle = document.querySelector('article.resume');
  if (!resumeArticle) return;

  const timelineLists = resumeArticle.querySelectorAll('.timeline-list');
  timelineLists.forEach(list => {
    const items = Array.from(list.querySelectorAll(':scope > .timeline-item'));
    if (!items.length) return;

    const isPresentItem = (item) => {
      const dateText = item.querySelector('span')?.textContent || '';
      return /\bpresent\b/i.test(dateText);
    };

    const presentItems = items.filter(isPresentItem);
    if (!presentItems.length) return;

    const nonPresentItems = items.filter(item => !isPresentItem(item));
    [...presentItems, ...nonPresentItems].forEach(item => list.appendChild(item));
  });
}

function initResumeFilter() {
  const resumeArticle = document.querySelector('article.resume');
  if (!resumeArticle) return;

  const filterButtons = resumeArticle.querySelectorAll('.resume-filter .filter-btn');
  const resumeSections = resumeArticle.querySelectorAll('.resume-section');
  if (!filterButtons.length || !resumeSections.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.getAttribute('data-filter');

      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      resumeSections.forEach(section => {
        const sectionCategory = section.getAttribute('data-category');
        section.style.display = (filterValue === 'all' || sectionCategory === filterValue)
          ? 'block'
          : 'none';
      });
    });
  });
}

function initPublicationsFilter() {
  const publicationsArticle = document.querySelector('article.publication');
  if (!publicationsArticle) return;

  const filterButtons = publicationsArticle.querySelectorAll('.publication-filter .filter-btn');
  const publicationItems = publicationsArticle.querySelectorAll('.publication-item');
  if (!filterButtons.length || !publicationItems.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.getAttribute('data-filter');

      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      publicationItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        item.style.display = (filterValue === 'all' || itemCategory === filterValue)
          ? 'block'
          : 'none';
      });
    });
  });
}


function closeSidebarNav() {
  document.getElementById('sidebar-nav').style.display = 'none';
  document.getElementById('hamburger').setAttribute('aria-expanded', 'false');
}

function toggleSidebarNav() {
  const button = document.getElementById('hamburger');
  const expanded = button.getAttribute('aria-expanded') !== 'true';
  document.getElementById('sidebar-nav').style.display = expanded ? 'block' : 'none';
  button.setAttribute('aria-expanded', String(expanded));
}

function insertRecentUpdates() {
  const updatesList = document.querySelector('#recent-updates .timeline-list');
  const journeyList = document.querySelector('#journey .timeline-list');
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

function initNavbarAutoHide() {
  if (window.__navbarAutoHideInitialized) return;
  window.__navbarAutoHideInitialized = true;

  const syncNavbarVisibility = () => {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    const inTabletRange = window.innerWidth >= 577 && window.innerWidth <= 1023;
    if (!inTabletRange) {
      nav.classList.remove('navbar-hidden');
      return;
    }

    if (window.scrollY > 20 && !nav.contains(document.activeElement)) {
      nav.classList.add('navbar-hidden');
    } else {
      nav.classList.remove('navbar-hidden');
    }
  };

  document.querySelector('.navbar').addEventListener('focusin', syncNavbarVisibility);
  document.querySelector('.navbar').addEventListener('focusout', syncNavbarVisibility);
  window.addEventListener('scroll', syncNavbarVisibility, { passive: true });
  window.addEventListener('resize', syncNavbarVisibility, { passive: true });
  window.addEventListener('hashchange', syncNavbarVisibility);
  syncNavbarVisibility();
}
