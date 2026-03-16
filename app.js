/* app.js — OnlyExit V2 */

(function() {
  'use strict';

  // ===== GOOGLE SHEETS FORM SUBMISSION =====
  var GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxpCT61uRcvcvxUOC6rOzfdjMz9F4PUJyJKO0uSVPz4_RxSwi0lR0FU_zhQepyU6cEQ/exec';

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
  var header = document.getElementById('header');

  function onScroll() {
    var currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ===== SCROLL-SPY (Active Nav Highlight) =====
  var navLinks = document.querySelectorAll('.header__nav a[href^="#"]');
  var mobileMenuEl = document.getElementById('mobileMenu');
  var mobileNavLinks = mobileMenuEl ? mobileMenuEl.querySelectorAll('a[href^="#"]') : [];
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
          } else if (!link.classList.contains('header__cta')) {
            link.classList.remove('active');
          }
        });
        mobileNavLinks.forEach(function(link) {
          if (link.getAttribute('href') === id) {
            link.classList.add('active');
          } else {
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

  // ===== MOBILE MENU =====
  var menuOpen = document.getElementById('menuOpen');
  var menuClose = document.getElementById('menuClose');
  var mobileLinks = mobileMenuEl ? mobileMenuEl.querySelectorAll('a') : [];

  function openMenu() {
    mobileMenuEl.classList.add('mobile-menu--open');
    mobileMenuEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenuEl.classList.remove('mobile-menu--open');
    mobileMenuEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (menuOpen) menuOpen.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  mobileLinks.forEach(function(link) {
    link.addEventListener('click', closeMenu);
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
  document.querySelectorAll('.faq-item__question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('faq-item--open');

      document.querySelectorAll('.faq-item--open').forEach(function(openItem) {
        if (openItem !== item) {
          openItem.classList.remove('faq-item--open');
          openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('faq-item--open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ===== ANIMATED COUNTERS =====
  var counters = document.querySelectorAll('[data-count]');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    var statsSection = document.querySelector('.stats-strip');
    if (!statsSection) return;

    var rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
      countersAnimated = true;
      counters.forEach(function(counter) {
        var target = parseInt(counter.getAttribute('data-count'), 10);
        var duration = 1200;
        var startTime = performance.now();

        function update(currentTime) {
          var elapsed = currentTime - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            counter.textContent = target;
          }
        }
        requestAnimationFrame(update);
      });
    }
  }
  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();

  // ===== SCROLL REVEALS =====
  document.body.classList.add('js-ready');

  var revealElements = document.querySelectorAll('.reveal, .reveal-stagger > *');
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  revealElements.forEach(function(el) {
    if (el.parentElement && el.parentElement.classList.contains('reveal-stagger')) {
      var childIndex = Array.from(el.parentElement.children).indexOf(el);
      el.style.transitionDelay = childIndex * 120 + 'ms';
    }
    revealObserver.observe(el);
  });

  // ===== HERO: Ken Burns is pure CSS — no scroll JS needed =====

  // ===== THESIS CARDS — Mobile tap-to-toggle =====
  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var thesisCards = document.querySelectorAll('.thesis-card');

  if (isTouchDevice && thesisCards.length > 0) {
    thesisCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        var wasActive = card.classList.contains('thesis-card--active');
        // Close all first
        thesisCards.forEach(function(c) { c.classList.remove('thesis-card--active'); });
        // Toggle the clicked one
        if (!wasActive) {
          card.classList.add('thesis-card--active');
        }
      });
    });
  }

  // ===== FUNNEL STAGES — Mobile tap-to-toggle =====
  var funnelStages = document.querySelectorAll('.funnel__stage');

  if (isTouchDevice && funnelStages.length > 0) {
    funnelStages.forEach(function(stage) {
      stage.addEventListener('click', function(e) {
        var wasActive = stage.classList.contains('funnel__stage--active');
        // Close all first
        funnelStages.forEach(function(s) { s.classList.remove('funnel__stage--active'); });
        // Toggle the clicked one
        if (!wasActive) {
          stage.classList.add('funnel__stage--active');
        }
      });
    });
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

  // Close on overlay click for all .modal-overlay elements
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Close buttons with data-close-modal attribute
  document.querySelectorAll('[data-close-modal]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Close on ESC key for any active modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(function(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
      // Also close calc modal
      var calcModal = document.getElementById('calcModal');
      if (calcModal && calcModal.classList.contains('active')) {
        closeCalcModal();
      }
    }
  });

  // ===== HACKER HOUSE APPLICATION MODAL =====
  var openHHBtn = document.getElementById('openHackerHouseModal');
  if (openHHBtn) {
    openHHBtn.addEventListener('click', function() {
      openModal('hackerHouseModal');
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

  // ===== QUIZ MODAL =====
  var openQuizBtn = document.getElementById('openQuizModal');
  if (openQuizBtn) {
    openQuizBtn.addEventListener('click', function() {
      openModal('quizModal');
      currentQuestion = 0;
      quizAnswers = new Array(quizData.length).fill(null);
      renderQuestion(0);
    });
  }

  // ===== CO-FOUNDER MATCH MODAL =====
  var openCFBtn = document.getElementById('openCofounderModal');
  if (openCFBtn) {
    openCFBtn.addEventListener('click', function() {
      openModal('cofounderModal');
    });
  }

  var cfForm = document.getElementById('cofounderForm');
  var cfSuccess = document.getElementById('cofounderSuccess');
  if (cfForm) {
    cfForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = cfForm.querySelector('button[type="submit"]');
      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      var data = collectFormData(cfForm);
      submitToSheets(data).then(function() {
        cfForm.style.display = 'none';
        cfSuccess.classList.add('active');
      }).catch(function() {
        btn.disabled = false;
        btn.textContent = origText;
        alert('Submission failed — please try again.');
      });
    });
  }

  // ===== FLY-IN APPLICATION MODAL =====
  var openFlyinBtn = document.getElementById('openFlyinModal');
  if (openFlyinBtn) {
    openFlyinBtn.addEventListener('click', function() {
      openModal('flyinModal');
    });
  }

  var flyinForm = document.getElementById('flyinForm');
  var flyinSuccess = document.getElementById('flyinSuccess');
  if (flyinForm) {
    flyinForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = flyinForm.querySelector('button[type="submit"]');
      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      var data = collectFormData(flyinForm);
      submitToSheets(data).then(function() {
        flyinForm.style.display = 'none';
        flyinSuccess.classList.add('active');
      }).catch(function() {
        btn.disabled = false;
        btn.textContent = origText;
        alert('Submission failed — please try again.');
      });
    });
  }

  // ===== MERCH PRE-ORDER MODAL =====
  var preorderModal = document.getElementById('preorderModal');
  var preorderClose = document.getElementById('preorderClose');
  var preorderForm = document.getElementById('preorderForm');
  var preorderItemName = document.getElementById('preorderItemName');
  var poItemInput = document.getElementById('po-item');
  var poPriceInput = document.getElementById('po-price');
  var poSuccess = document.getElementById('poSuccess');

  document.querySelectorAll('[data-preorder]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.getAttribute('data-preorder');
      var price = btn.getAttribute('data-price');
      preorderItemName.textContent = item + ' — ' + price;
      poItemInput.value = item;
      poPriceInput.value = price;
      preorderForm.style.display = 'block';
      poSuccess.classList.remove('active');
      preorderModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closePreorder() {
    preorderModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (preorderClose) preorderClose.addEventListener('click', closePreorder);
  if (preorderModal) {
    preorderModal.addEventListener('click', function(e) {
      if (e.target === preorderModal) closePreorder();
    });
  }

  if (preorderForm) {
    preorderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = preorderForm.querySelector('button[type="submit"]');
      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      var data = collectFormData(preorderForm);
      submitToSheets(data).then(function() {
        preorderForm.style.display = 'none';
        poSuccess.classList.add('active');
      }).catch(function() {
        btn.disabled = false;
        btn.textContent = origText;
        alert('Submission failed — please try again.');
      });
    });
  }

  // ===== SEVERANCE CALCULATOR MODAL =====
  var calcModal = document.getElementById('calcModal');
  var calcCard = document.getElementById('calc-card');
  var calcModalClose = document.getElementById('calcModalClose');

  var jetBrainsLoaded = false;
  function loadJetBrainsMono() {
    if (jetBrainsLoaded) return;
    jetBrainsLoaded = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }

  function openCalcModal() {
    if (!calcModal) return;
    loadJetBrainsMono();
    calcModal.classList.add('active');
    calcModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCalcModal() {
    if (!calcModal) return;
    calcModal.classList.remove('active');
    calcModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (calcCard) {
    calcCard.addEventListener('click', openCalcModal);
    calcCard.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCalcModal(); }
    });
  }
  if (calcModalClose) calcModalClose.addEventListener('click', closeCalcModal);

  // Close on overlay click
  if (calcModal) {
    var calcOverlay = calcModal.querySelector('.calc-modal__overlay');
    if (calcOverlay) calcOverlay.addEventListener('click', closeCalcModal);
  }

  // ===== "AM I READY TO QUIT?" QUIZ =====
  var quizData = [
    {
      q: 'How much runway do you have?',
      options: [
        { text: 'Less than 3 months', score: 1 },
        { text: '3–6 months', score: 2 },
        { text: '6–12 months', score: 3 },
        { text: '12+ months', score: 4 }
      ]
    },
    {
      q: 'Do you have a startup idea?',
      options: [
        { text: 'No, but I want to', score: 1 },
        { text: 'Rough concept', score: 2 },
        { text: 'Validated idea', score: 3 },
        { text: 'Paying users already', score: 4 }
      ]
    },
    {
      q: 'Do you have a co-founder?',
      options: [
        { text: 'No', score: 1 },
        { text: 'Looking', score: 2 },
        { text: 'Yes, not fully committed', score: 3 },
        { text: 'Yes, locked in', score: 4 }
      ]
    },
    {
      q: 'Visa situation?',
      options: [
        { text: 'H-1B, laid off', score: 1 },
        { text: 'H-1B employed / F-1 OPT/CPT', score: 2 },
        { text: 'O-1 or other work visa', score: 3 },
        { text: 'Citizen / Green Card', score: 4 }
      ]
    },
    {
      q: 'Have you talked to potential customers?',
      options: [
        { text: 'No', score: 1 },
        { text: 'A few informal conversations', score: 2 },
        { text: '10+ conversations', score: 3 },
        { text: 'Some said they\'d pay', score: 4 }
      ]
    },
    {
      q: 'Do you have relevant expertise?',
      options: [
        { text: 'Starting fresh', score: 1 },
        { text: 'Some overlap', score: 2 },
        { text: 'Direct experience', score: 3 },
        { text: 'Domain expert', score: 4 }
      ]
    },
    {
      q: 'Risk tolerance?',
      options: [
        { text: 'Need a paycheck within 3 months', score: 1 },
        { text: 'Can handle 6 months of uncertainty', score: 2 },
        { text: 'Comfortable with 12 months', score: 3 },
        { text: 'Already burned the boats', score: 4 }
      ]
    },
    {
      q: 'Support system?',
      options: [
        { text: 'Going alone', score: 1 },
        { text: 'Some support', score: 2 },
        { text: 'People around me get it', score: 3 },
        { text: 'Actively helping me', score: 4 }
      ]
    },
    {
      q: 'Have you built anything before?',
      options: [
        { text: 'Never', score: 1 },
        { text: 'Side projects', score: 2 },
        { text: 'Launched something', score: 3 },
        { text: 'Built and scaled', score: 4 }
      ]
    },
    {
      q: 'Why now?',
      options: [
        { text: 'Got laid off', score: 2 },
        { text: 'Been thinking for years', score: 2 },
        { text: 'Market timing is right', score: 3 },
        { text: 'Can\'t do another 9-to-5', score: 4 }
      ]
    }
  ];

  var quizQuestionsContainer = document.getElementById('quizQuestions');
  var quizProgress = document.getElementById('quizProgress');
  var quizResult = document.getElementById('quizResult');

  var currentQuestion = 0;
  var quizAnswers = new Array(quizData.length).fill(null);

  function renderQuestion(index) {
    var q = quizData[index];
    quizQuestionsContainer.innerHTML = '';
    quizResult.classList.remove('active');
    quizResult.style.display = 'none';

    var div = document.createElement('div');
    div.className = 'quiz__question active';

    var optionsHtml = q.options.map(function(opt, i) {
      return '<button class="quiz__option ' + (quizAnswers[index] === i ? 'selected' : '') + '" data-index="' + i + '" data-score="' + opt.score + '">' + opt.text + '</button>';
    }).join('');

    var prevHtml = index > 0
      ? '<button class="btn btn--secondary btn--small" id="quizPrev">\u2190 Back</button>'
      : '<span></span>';

    var nextDisabled = quizAnswers[index] === null ? ' disabled style="opacity:0.5;pointer-events:none;"' : '';
    var nextHtml = index < quizData.length - 1
      ? '<button class="btn btn--primary btn--small" id="quizNext"' + nextDisabled + '>Next \u2192</button>'
      : '<button class="btn btn--primary btn--small" id="quizFinish"' + nextDisabled + '>See Results</button>';

    div.innerHTML = '<div class="quiz__question-number">Question ' + (index + 1) + ' of ' + quizData.length + '</div>' +
      '<div class="quiz__question-text">' + q.q + '</div>' +
      '<div class="quiz__options">' + optionsHtml + '</div>' +
      '<div class="quiz__nav">' + prevHtml + nextHtml + '</div>';

    quizQuestionsContainer.appendChild(div);
    quizProgress.style.width = ((index + 1) / quizData.length * 100) + '%';

    // Option click handlers
    div.querySelectorAll('.quiz__option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var optIdx = parseInt(btn.getAttribute('data-index'), 10);
        quizAnswers[index] = optIdx;
        div.querySelectorAll('.quiz__option').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        var nextBtn = div.querySelector('#quizNext') || div.querySelector('#quizFinish');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
          nextBtn.style.pointerEvents = 'auto';
        }
      });
    });

    // Nav handlers
    var prevBtn = div.querySelector('#quizPrev');
    var nextBtn = div.querySelector('#quizNext');
    var finishBtn = div.querySelector('#quizFinish');

    if (prevBtn) prevBtn.addEventListener('click', function() { currentQuestion--; renderQuestion(currentQuestion); });
    if (nextBtn) nextBtn.addEventListener('click', function() { currentQuestion++; renderQuestion(currentQuestion); });
    if (finishBtn) finishBtn.addEventListener('click', showQuizResults);
  }

  function showQuizResults() {
    var totalScore = 0;
    var categoryLabels = ['Runway', 'Idea', 'Co-Founder', 'Visa', 'Customer Validation', 'Expertise', 'Risk Tolerance', 'Support System', 'Build Experience', 'Timing'];

    quizAnswers.forEach(function(ansIdx, qIdx) {
      if (ansIdx !== null) {
        totalScore += quizData[qIdx].options[ansIdx].score;
      }
    });

    var maxScore = quizData.length * 4;
    var percentage = Math.round((totalScore / maxScore) * 100);

    quizQuestionsContainer.innerHTML = '';
    quizResult.style.display = 'block';
    quizResult.classList.add('active');

    var title, desc, cta;
    if (percentage >= 80) {
      title = "You're ready. Stop reading and start building.";
      desc = 'Book a free strategy session with OnlyExit founders. We\'ve built and exited $50M+ in companies. This is a $500 meeting \u2014 on us.';
      cta = '<a href="https://calendly.com/ank-ty/30min?back=1" target="_blank" rel="noopener noreferrer" class="btn btn--primary">Book Strategy Session \u2192</a>';
    } else if (percentage >= 60) {
      title = "Almost. You're one or two moves away.";
      var weakAreas = [];
      quizAnswers.forEach(function(ansIdx, qIdx) {
        if (ansIdx !== null && quizData[qIdx].options[ansIdx].score <= 2) {
          weakAreas.push(categoryLabels[qIdx]);
        }
      });
      desc = 'Focus areas: ' + (weakAreas.length > 0 ? weakAreas.join(', ') : 'Keep pushing');
      cta = '<a href="#apply" class="btn btn--primary" onclick="document.getElementById(\'quizModal\').classList.remove(\'active\');document.body.style.overflow=\'\';">Apply for the Hacker House \u2192</a>';
    } else if (percentage >= 40) {
      title = "You've got the fire. Now build the foundation.";
      desc = 'Start with our next event to connect with builders at your stage.';
      cta = '<a href="#events" class="btn btn--primary" onclick="document.getElementById(\'quizModal\').classList.remove(\'active\');document.body.style.overflow=\'\';">Join Our Next Event \u2192</a>';
    } else {
      title = "Not yet. But keep us bookmarked.";
      desc = 'The best founders took time to prepare. Follow us for resources and events.';
      cta = '<a href="https://linkedin.com/company/onlyexit" target="_blank" rel="noopener noreferrer" class="btn btn--secondary">Follow OnlyExit \u2192</a>';
    }

    quizResult.innerHTML = '<div class="quiz__score">' + percentage + '%</div>' +
      '<div class="quiz__result-title">' + title + '</div>' +
      '<div class="quiz__result-desc">' + desc + '</div>' +
      cta +
      '<br><br><button class="btn btn--ghost btn--small" id="quizRetake">Retake Quiz</button>';

    quizProgress.style.width = '100%';

    document.getElementById('quizRetake').addEventListener('click', function() {
      currentQuestion = 0;
      quizAnswers = new Array(quizData.length).fill(null);
      quizResult.style.display = 'none';
      quizResult.classList.remove('active');
      renderQuestion(0);
    });
  }

})();
