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
      var calcModal = document.getElementById('calcModal');
      if (calcModal && calcModal.classList.contains('active')) {
        closeCalcModal();
      }
    }
  });

  // ===== HACKER HOUSE APPLICATION MODAL =====
  var openHHBtn = document.getElementById('openHackerHouseModal');
  if (openHHBtn) {
    openHHBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal('hackerHouseModal');
    });
  }

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

  // ===== SEVERANCE CALCULATOR MODAL =====
  var calcModal = document.getElementById('calcModal');
  var calcCard = document.getElementById('calc-card');
  var calcModalClose = document.getElementById('calcModalClose');

  function openCalcModal() {
    if (!calcModal) return;
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
      ? '<button class="btn btn--secondary btn--small" id="quizPrev">← Back</button>'
      : '<span></span>';

    var nextDisabled = quizAnswers[index] === null ? ' disabled style="opacity:0.5;pointer-events:none;"' : '';
    var nextHtml = index < quizData.length - 1
      ? '<button class="btn btn--primary btn--small" id="quizNext"' + nextDisabled + '>Next →</button>'
      : '<button class="btn btn--primary btn--small" id="quizFinish"' + nextDisabled + '>See Results</button>';

    div.innerHTML = '<div class="quiz__question-number">Question ' + (index + 1) + ' of ' + quizData.length + '</div>' +
      '<div class="quiz__question-text">' + q.q + '</div>' +
      '<div class="quiz__options">' + optionsHtml + '</div>' +
      '<div class="quiz__nav">' + prevHtml + nextHtml + '</div>';

    quizQuestionsContainer.appendChild(div);
    quizProgress.style.width = ((index + 1) / quizData.length * 100) + '%';

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
      desc = 'Book a free strategy session with OnlyExit founders. We\'ve built and exited $50M+ in companies. This is a $500 meeting — on us.';
      cta = '<a href="https://calendly.com/ank-ty/30min?back=1" target="_blank" rel="noopener noreferrer" class="btn btn--primary">Book Strategy Session →</a>';
    } else if (percentage >= 60) {
      title = "Almost. You're one or two moves away.";
      var weakAreas = [];
      quizAnswers.forEach(function(ansIdx, qIdx) {
        if (ansIdx !== null && quizData[qIdx].options[ansIdx].score <= 2) {
          weakAreas.push(categoryLabels[qIdx]);
        }
      });
      desc = 'Focus areas: ' + (weakAreas.length > 0 ? weakAreas.join(', ') : 'Keep pushing');
      cta = '<a href="#apply" class="btn btn--primary" onclick="document.getElementById(\'quizModal\').classList.remove(\'active\');document.body.style.overflow=\'\';">Apply for the Hacker House →</a>';
    } else if (percentage >= 40) {
      title = "You've got the fire. Now build the foundation.";
      desc = 'Start with our next event to connect with builders at your stage.';
      cta = '<a href="#events" class="btn btn--primary" onclick="document.getElementById(\'quizModal\').classList.remove(\'active\');document.body.style.overflow=\'\';">Join Our Next Event →</a>';
    } else {
      title = "Not yet. But keep us bookmarked.";
      desc = 'The best founders took time to prepare. Follow us for resources and events.';
      cta = '<a href="https://linkedin.com/company/onlyexit" target="_blank" rel="noopener noreferrer" class="btn btn--secondary">Follow OnlyExit →</a>';
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
