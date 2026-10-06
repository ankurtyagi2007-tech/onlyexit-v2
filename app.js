/* app.js — OnlyExit V2 */

(function() {
  'use strict';

  // ===== MOBILE NAV HAMBURGER =====
  var burger = document.querySelector('.site-header__burger');
  var navMenu = document.querySelector('.site-header__nav');
  if (burger && navMenu) {
    burger.addEventListener('click', function() {
      var open = burger.classList.toggle('is-open');
      navMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        burger.classList.remove('is-open');
        navMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== GOOGLE SHEETS FORM SUBMISSION =====
  var GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw1w2nCUcxTC7dFIRZE4BhmmtLFFq7InER-A8GAoy0cR420FKJzl2bXsB4wWLPqvzqm/exec';

  function submitToSheets(formData) {
    return fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(formData)
    });
  }

  function collectFormData(form) {
    var formData = new FormData(form);
    var data = {};
    formData.forEach(function(value, key) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });
    return data;
  }

  // ===== HEADER SCROLL STATE =====
  var header = document.querySelector('.site-header');

  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }
  }
  if (header) window.addEventListener('scroll', onScroll, { passive: true });

  // ===== SCROLL-SPY (Active Nav Highlight) =====
  var navLinks = document.querySelectorAll('.site-header__nav a[href^="#"]');
  var sections = [];

  navLinks.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href && href !== '#') {
      var target = document.querySelector(href);
      if (target) {
        sections.push({ el: target, id: href });
      }
    }
  });

  var scrollSpyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = '#' + entry.target.id;
        navLinks.forEach(function(link) {
          if (link.getAttribute('href') === id) {
            link.classList.add('active');
          } else if (!link.classList.contains('nav-apply')) {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(function(s) {
    scrollSpyObserver.observe(s.el);
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-item__btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('faq-item--open');

      document.querySelectorAll('.faq-item--open').forEach(function(openItem) {
        if (openItem !== item) {
          openItem.classList.remove('faq-item--open');
          openItem.querySelector('.faq-item__btn').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('faq-item--open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ===== SCROLL REVEALS =====
  document.body.classList.add('js-ready');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(function(el) {
    revealObserver.observe(el);
  });

  // ===== CARD SHINE EFFECT =====
  if (!prefersReducedMotion) {
    var shineTargets = document.querySelectorAll('.wyg-card, .city-card, .stats-band__item');
    shineTargets.forEach(function(card) {
      card.classList.add('card-shine');
    });
  }

  // ===== HERO FADE ON SCROLL =====
  var heroSection = document.querySelector('.hero');
  if (heroSection) {
    var heroTicking = false;
    window.addEventListener('scroll', function() {
      if (!heroTicking) {
        requestAnimationFrame(function() {
          var scrollY = window.scrollY;
          var vh = window.innerHeight;
          if (scrollY >= vh) {
            heroSection.style.visibility = 'hidden';
          } else {
            heroSection.style.visibility = '';
            heroSection.style.opacity = 1 - (scrollY / vh) * 0.3;
          }
          heroTicking = false;
        });
        heroTicking = true;
      }
    }, { passive: true });
  }

  // ===== GENERIC MODAL HELPERS =====
  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(function(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });

  // ===== PROGRAM TABS =====
  var programTabBtns = document.querySelectorAll('.program-tabs__btn');
  var programCardTitle = document.getElementById('program-card-title');
  var programRowsEl = document.getElementById('program-rows');
  var programTabsData = [
    {card:'Plan · written with the GP', rows:[['Go to market','first two weeks','Plan'],['Fundraising','weeks three to six','Plan'],['Product and hiring','through Demo Day','Plan']]},
    {card:'Sessions · this week', rows:[['Pricing that survives a real buyer','with a Seattle operator','Session'],['Reading a term sheet','with a founder who has raised','Session'],['First five hires, in order','with an operator who has hired','Session'],['Getting the first ten customers','with an operator who sold into the vertical','Session']]},
    {card:'Stream · weekly report', rows:[['Revenue','this week against last','Reported'],['NRR','what existing customers did','Reported'],['Cold calls and demos','how many, and what came back','Reported'],['Burn','what it cost to get there','Reported']]},
    {card:'Demo Day · first week of November', rows:[['Investors in the room','Cohort 0','Nov 2026'],['Each team shows what it shipped','ten weeks of work','Demo'],['Cohort 1 Demo Day','after the January batch','2027']]}
  ];
  function setProgramTab(i) {
    programTabBtns.forEach(function(b, j) {
      b.classList.toggle('program-tabs__btn--active', j === i);
    });
    if (programCardTitle) programCardTitle.textContent = programTabsData[i].card;
    if (programRowsEl) {
      programRowsEl.innerHTML = '';
      programTabsData[i].rows.forEach(function(r) {
        var div = document.createElement('div');
        div.className = 'program-tabs__row';
        div.innerHTML = '<div class="program-tabs__row-text"><span class="program-tabs__row-a">' + r[0] + '</span><span class="program-tabs__row-b">' + r[1] + '</span></div><span class="program-tabs__row-tag">' + r[2] + '</span>';
        programRowsEl.appendChild(div);
      });
    }
  }
  programTabBtns.forEach(function(b, i) {
    b.addEventListener('click', function() { setProgramTab(i); });
  });

  // ===== HACKER HOUSE APPLICATION MODAL =====
  document.querySelectorAll('#openHackerHouseModal, #openHackerHouseModal2').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal('hackerHouseModal');
    });
  });

  var addCofounderBtn = document.getElementById('addCofounder');
  var cofoundersContainer = document.getElementById('cofounders-container');
  if (addCofounderBtn && cofoundersContainer) {
    var cofounderCount = 1;
    addCofounderBtn.addEventListener('click', function() {
      cofounderCount++;
      var row = document.createElement('div');
      row.className = 'form-grid form-grid--2col cofounder-row';
      row.innerHTML = '<div class="form-field"><label>Cofounder Name</label><input type="text" name="cofounder_' + cofounderCount + '_name" placeholder="Optional"></div>' +
        '<div class="form-field"><label>Cofounder LinkedIn</label><input type="url" name="cofounder_' + cofounderCount + '_linkedin" placeholder="https://linkedin.com/in/..."></div>' +
        '<button type="button" class="btn--remove-cofounder" aria-label="Remove cofounder">&times;</button>';
      cofoundersContainer.appendChild(row);
      row.querySelector('.btn--remove-cofounder').addEventListener('click', function() {
        row.remove();
      });
    });
  }

  var hhForm = document.getElementById('hackerHouseForm');
  var hhSuccess = document.getElementById('hhSuccess');
  if (hhForm) {
    hhForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = hhForm.querySelector('button[type="submit"]');
      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      var data = collectFormData(hhForm);
      submitToSheets(data).then(function() {
        hhForm.style.display = 'none';
        hhSuccess.classList.add('active');
      }).catch(function() {
        btn.disabled = false;
        btn.textContent = origText;
        alert('Submission failed — please try again.');
      });
    });
  }

})();
