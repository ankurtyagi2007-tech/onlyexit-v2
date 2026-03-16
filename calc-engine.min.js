/* calc-engine.js — Severance Runway Calculator Engine (scoped for modal) */
/* Adapted from severance-calc-source/app.js. All DOM queries scoped to #calcModal. */
/* Uses cm- prefixed IDs and data-cm-* attributes. */

(function () {
  'use strict';

  const modal = document.getElementById('calcModal');
  if (!modal) return;

  // Scoped query helpers
  function $(sel) { return modal.querySelector(sel); }
  function $$(sel) { return modal.querySelectorAll(sel); }
  function $id(id) { return document.getElementById('cm-' + id); }

  // ============================================
  // STATE
  // ============================================
  const state = {
    currentStep: 1,
    // Step 1
    grossSeverance: 102000,
    paymentType: 'lump',
    installmentMonths: 12,
    vestedEquity: 0,
    currentSavings: 25000,
    uiState: 'CA',
    // Step 2
    filingStatus: 'single',
    taxState: 'CA',
    otherStateTax: 5,
    spouseIncome: 0,
    contribution401k: 23500,
    contributionIRA: 7000,
    hsaEligible: 'individual',
    // Step 3
    rent: 3200,
    healthInsurance: 'cobra',
    carPayment: 0,
    studentLoans: 0,
    childcare: 0,
    utilities: 300,
    phone: 100,
    cc1Balance: 5000, cc1APR: 24, cc1Payment: 150,
    cc2Balance: 0, cc2APR: 0, cc2Payment: 0,
    plBalance: 0, plAPR: 0, plPayment: 0,
    discretionary: 1500,
    leanSlider: 100,
    // Levers (Step 4)
    leverCobra: false,
    leverDebt: false,
    leverLean: false,
    leverFreelance: false,
    leverHousing: false,
    leverPretax: false,
    freelanceIncome: 5000,
    newRent: 2000,
  };

  // ============================================
  // TAX CONSTANTS (2026 estimated)
  // ============================================
  const BRACKETS_SINGLE = [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: Infinity, rate: 0.35 },
  ];

  const BRACKETS_MFJ = BRACKETS_SINGLE.map(function (b) {
    return {
      min: b.min * 2,
      max: b.max === Infinity ? Infinity : b.max * 2,
      rate: b.rate,
    };
  });

  const SS_WAGE_BASE = 176100;
  const SS_RATE = 0.062;
  const MEDICARE_RATE = 0.0145;
  const UI_RATES = { CA: 1950, WA: 4329, NY: 2184, none: 0 };
  const UI_MONTHS = 6;
  const HEALTH_COSTS = { cobra: 2100, aca: 400, spouse: 300, none: 0 };
  const HSA_LIMITS = { no: 0, individual: 4300, family: 8550 };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function fmt(n) {
    if (n === undefined || n === null || isNaN(n)) return '$0';
    var abs = Math.abs(Math.round(n));
    var formatted = abs.toLocaleString('en-US');
    return (n < 0 ? '-$' : '$') + formatted;
  }

  function parseNum(str) {
    if (typeof str === 'number') return str;
    return parseFloat(String(str).replace(/[^0-9.\-]/g, '')) || 0;
  }

  function formatInput(el) {
    var raw = parseNum(el.value);
    // Don't format percentage or month fields, or range inputs
    if (el.closest('.calc-modal__input-suffix-wrap') || el.id === 'cm-installmentMonths' || el.id === 'cm-leanSlider') return;
    el.value = raw.toLocaleString('en-US');
  }

  function setText(id, text) {
    var el = document.getElementById('cm-' + id);
    if (el) el.textContent = text;
  }

  // ============================================
  // TAX CALCULATIONS
  // ============================================
  function calcFederalTax(taxableIncome, status) {
    var brackets = status === 'mfj' ? BRACKETS_MFJ : BRACKETS_SINGLE;
    var tax = 0;
    var remaining = Math.max(0, taxableIncome);
    for (var i = 0; i < brackets.length; i++) {
      var b = brackets[i];
      if (remaining <= 0) break;
      var taxable = Math.min(remaining, b.max - b.min);
      tax += taxable * b.rate;
      remaining -= taxable;
    }
    return tax;
  }

  function calcStateTax(income, taxState, otherRate) {
    if (taxState === 'WA') return 0;
    if (taxState === 'CA') return income * 0.093;
    if (taxState === 'NY') return income * 0.0685;
    return income * (otherRate / 100);
  }

  function calcFICA(grossIncome) {
    var ss = Math.min(grossIncome, SS_WAGE_BASE) * SS_RATE;
    var medicare = grossIncome * MEDICARE_RATE;
    return ss + medicare;
  }

  // ============================================
  // CORE CALCULATIONS
  // ============================================
  function calcTaxes(overrides) {
    var s = Object.assign({}, state, overrides);
    var totalGross = s.grossSeverance + s.vestedEquity + s.spouseIncome;
    var hsaAmount = HSA_LIMITS[s.hsaEligible] || 0;
    var pretaxDeductions = s.contribution401k + s.contributionIRA + hsaAmount;
    var taxableIncome = Math.max(0, totalGross - pretaxDeductions);
    var federalTax = calcFederalTax(taxableIncome, s.filingStatus);
    var stateTax = calcStateTax(taxableIncome, s.taxState, s.otherStateTax);
    var fica = calcFICA(totalGross);
    var totalTax = federalTax + stateTax + fica;
    var netAfterTax = totalGross - totalTax;
    var sevGross = s.grossSeverance + s.vestedEquity;
    var sevShare = totalGross > 0 ? sevGross / totalGross : 1;
    var netSeverance = sevGross - totalTax * sevShare;

    // Tax savings from pre-tax contributions
    var taxableWithout = totalGross;
    var fedWithout = calcFederalTax(taxableWithout, s.filingStatus);
    var stateWithout = calcStateTax(taxableWithout, s.taxState, s.otherStateTax);
    var taxSavings = (fedWithout + stateWithout) - (federalTax + stateTax);

    return {
      totalGross: totalGross,
      pretaxDeductions: pretaxDeductions,
      taxableIncome: taxableIncome,
      federalTax: federalTax,
      stateTax: stateTax,
      fica: fica,
      totalTax: totalTax,
      netAfterTax: netAfterTax,
      netSeverance: netSeverance,
      taxSavings: taxSavings,
      hsaAmount: hsaAmount,
    };
  }

  function calcLumpSavings() {
    if (state.paymentType !== 'lump') return 0;
    var fullTax = calcTaxes();
    var halfSev = state.grossSeverance / 2;
    var halfEquity = state.vestedEquity / 2;
    var tax1 = calcTaxes({ grossSeverance: halfSev, vestedEquity: halfEquity });
    var tax2 = calcTaxes({ grossSeverance: halfSev, vestedEquity: halfEquity });
    var splitTotal = tax1.federalTax + tax1.stateTax + tax2.federalTax + tax2.stateTax;
    var fullTotal = fullTax.federalTax + fullTax.stateTax;
    return Math.max(0, fullTotal - splitTotal);
  }

  function calcMonthlyBurn() {
    var healthCost = HEALTH_COSTS[state.healthInsurance] || 0;
    var leanFactor = state.leanSlider / 100;
    var discretionaryActual = state.discretionary * leanFactor;
    var fixed = state.rent + healthCost + state.carPayment + state.studentLoans
      + state.childcare + state.utilities + state.phone;
    var debt = state.cc1Payment + state.cc2Payment + state.plPayment;
    return { fixed: fixed, healthCost: healthCost, debt: debt, discretionaryActual: discretionaryActual, total: fixed + debt + discretionaryActual };
  }

  function calcRunway(taxes, burn, extraMonthlyIncome, overrides) {
    var o = overrides || {};
    var totalLiquid = (o.netSeverance !== undefined ? o.netSeverance : taxes.netSeverance)
      + (o.savings !== undefined ? o.savings : state.currentSavings);
    var uiMonthly = UI_RATES[state.uiState] || 0;
    var monthlyBurn = o.burn !== undefined ? o.burn : burn.total;
    var income = extraMonthlyIncome || 0;

    var months = 0;
    var cash = totalLiquid;
    while (cash > 0 && months < 120) {
      var uiThisMonth = months < UI_MONTHS ? uiMonthly : 0;
      cash = cash - monthlyBurn + uiThisMonth + income;
      if (cash > 0) {
        months++;
      } else {
        months += (cash + monthlyBurn - uiThisMonth - income) / (monthlyBurn - uiThisMonth - income || 1);
        break;
      }
    }
    return Math.max(0, Math.round(months * 10) / 10);
  }

  // ============================================
  // UI UPDATE FUNCTIONS
  // ============================================
  function updateStep1() {
    var uiMonthly = UI_RATES[state.uiState] || 0;
    var uiDisplay = modal.querySelector('#cm-uiMonthlyDisplay .calc-modal__data-value');
    if (uiDisplay) uiDisplay.textContent = fmt(uiMonthly);
    var installWrap = document.getElementById('cm-installmentMonths-wrap');
    if (installWrap) installWrap.style.display = state.paymentType === 'installments' ? 'block' : 'none';
  }

  function updateStep2() {
    var taxes = calcTaxes();
    setText('tax-gross', fmt(state.grossSeverance));
    setText('tax-equity', fmt(state.vestedEquity));
    setText('tax-spouse', fmt(state.spouseIncome));
    setText('tax-totalGross', fmt(taxes.totalGross));
    setText('tax-pretax', fmt(-taxes.pretaxDeductions));
    setText('tax-taxable', fmt(taxes.taxableIncome));
    setText('tax-federal', fmt(-taxes.federalTax));
    setText('tax-state', fmt(-taxes.stateTax));
    setText('tax-fica', fmt(-taxes.fica));
    setText('tax-net', fmt(taxes.netAfterTax));
    setText('tax-savings-amount', fmt(taxes.taxSavings));

    // State note
    var stateNote = document.getElementById('cm-stateNote');
    if (stateNote) {
      if (state.taxState === 'CA') {
        stateNote.className = 'calc-modal__callout calc-modal__callout--warning';
        stateNote.textContent = 'CA taxes severance as ordinary income at ~9.3%.';
        stateNote.style.display = '';
      } else if (state.taxState === 'WA') {
        stateNote.className = 'calc-modal__callout calc-modal__callout--accent';
        stateNote.textContent = 'No state income tax — you keep more.';
        stateNote.style.display = '';
      } else if (state.taxState === 'NY') {
        stateNote.className = 'calc-modal__callout calc-modal__callout--warning';
        stateNote.textContent = 'NY ~6.85% state tax + potential NYC tax.';
        stateNote.style.display = '';
      } else {
        stateNote.style.display = 'none';
      }
    }

    var otherWrap = document.getElementById('cm-otherStateTax-wrap');
    if (otherWrap) otherWrap.style.display = state.taxState === 'other' ? 'block' : 'none';

    // Lump sum comparison
    var lumpComp = document.getElementById('cm-lumpComparison');
    if (lumpComp) {
      if (state.paymentType === 'lump') {
        var savings = calcLumpSavings();
        setText('lump-savings', fmt(savings));
        lumpComp.style.display = savings > 100 ? '' : 'none';
      } else {
        lumpComp.style.display = 'none';
      }
    }
  }

  function updateStep3() {
    var burn = calcMonthlyBurn();
    setText('fixedSubtotal', fmt(burn.fixed));
    setText('debtSubtotal', fmt(burn.debt));
    var leanFactor = state.leanSlider / 100;
    var discActual = state.discretionary * leanFactor;
    setText('discretionarySubtotal', fmt(discActual));
    var leanPercentEl = document.getElementById('cm-leanPercent');
    if (leanPercentEl) leanPercentEl.textContent = state.leanSlider + '%';
    var leanSavings = state.discretionary - discActual;
    var leanDisplay = modal.querySelector('#cm-leanSavingsDisplay .calc-modal__data-value');
    if (leanDisplay) leanDisplay.textContent = fmt(leanSavings);
    var totalBurnEl = document.getElementById('cm-totalBurn');
    if (totalBurnEl) totalBurnEl.textContent = fmt(burn.total);

    // COBRA callout
    var cobraCallout = document.getElementById('cm-cobraCallout');
    if (cobraCallout) cobraCallout.style.display = state.healthInsurance === 'cobra' ? '' : 'none';

    // Debt callout
    var debtCallout = document.getElementById('cm-debtCallout');
    var debtCalloutText = document.getElementById('cm-debtCalloutText');
    if (debtCallout && debtCalloutText) {
      var cards = [
        { bal: state.cc1Balance, apr: state.cc1APR, pmt: state.cc1Payment, name: 'Credit Card 1' },
        { bal: state.cc2Balance, apr: state.cc2APR, pmt: state.cc2Payment, name: 'Credit Card 2' },
      ];
      var shown = false;
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        if (c.apr > 15 && c.bal > 3000) {
          var monthlyInterest = (c.bal * c.apr / 100) / 12;
          var monthsGained = c.bal / burn.total;
          debtCalloutText.textContent = 'Paying off ' + c.name + '\'s ' + fmt(c.bal) + ' balance saves you ' + fmt(monthlyInterest) + '/month in interest and adds ~' + monthsGained.toFixed(1) + ' months of clarity. Worth considering.';
          debtCallout.style.display = '';
          shown = true;
          break;
        }
      }
      if (!shown) debtCallout.style.display = 'none';
    }
  }

  function updateStep4() {
    var taxes = calcTaxes();
    var burn = calcMonthlyBurn();
    var baselineMonths = calcRunway(taxes, burn);

    // Hero
    setText('heroMonths', Math.floor(baselineMonths));
    var deadline = new Date();
    deadline.setMonth(deadline.getMonth() + Math.floor(baselineMonths));
    var deadlineStr = deadline.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setText('heroDeadline', 'Decision deadline: ' + deadlineStr);

    // Timeline
    updateTimeline(baselineMonths);

    // Levers
    updateLevers(taxes, burn, baselineMonths);

    // Summary
    var uiMonthly = UI_RATES[state.uiState] || 0;
    setText('sum-netSev', fmt(taxes.netSeverance));
    setText('sum-liquid', fmt(taxes.netSeverance + state.currentSavings));
    setText('sum-ui', fmt(uiMonthly) + '/mo × 6mo');
    setText('sum-burnBase', fmt(burn.total));
    setText('sum-runwayBase', Math.floor(baselineMonths) + ' months');
    setText('sum-deadline', deadlineStr);
  }

  function updateTimeline(months) {
    var maxMonths = Math.max(months + 6, 12);
    var greenPct = Math.min(3 / maxMonths * 100, 100);
    var yellowPct = Math.min(3 / maxMonths * 100, 100 - greenPct);
    var redPct = Math.max(0, 100 - greenPct - yellowPct);
    var tzGreen = document.getElementById('cm-tzGreen');
    var tzYellow = document.getElementById('cm-tzYellow');
    var tzRed = document.getElementById('cm-tzRed');
    if (tzGreen) tzGreen.style.width = greenPct + '%';
    if (tzYellow) tzYellow.style.width = yellowPct + '%';
    if (tzRed) tzRed.style.width = redPct + '%';
    var markerPct = Math.min((months / maxMonths) * 100, 98);
    var marker = document.getElementById('cm-tzMarker');
    if (marker) marker.style.left = markerPct + '%';
    setText('tzMarkerLabel', Math.floor(months) + 'mo');
  }

  function updateLevers(taxes, burn, baselineMonths) {
    var grid = document.getElementById('cm-leversGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var levers = [];

    // 1. COBRA → ACA
    if (state.healthInsurance === 'cobra') {
      var savingsPerMonth = HEALTH_COSTS.cobra - HEALTH_COSTS.aca;
      var newBurn = burn.total - savingsPerMonth;
      var newMonths = calcRunway(taxes, burn, 0, { burn: newBurn });
      var gained = newMonths - baselineMonths;
      levers.push({
        id: 'leverCobra',
        name: 'Switch COBRA → ACA',
        desc: 'Save ' + fmt(savingsPerMonth) + '/mo on health insurance.',
        months: gained,
        burnReduction: savingsPerMonth,
      });
    }

    // 2. Pay off high-interest debt
    var totalHiDebt = (state.cc1APR > 15 ? state.cc1Balance : 0) + (state.cc2APR > 15 ? state.cc2Balance : 0);
    var totalHiPayment = (state.cc1APR > 15 ? state.cc1Payment : 0) + (state.cc2APR > 15 ? state.cc2Payment : 0);
    if (totalHiDebt > 0 && totalHiPayment > 0) {
      var newSavings = state.currentSavings - totalHiDebt;
      var newBurn2 = burn.total - totalHiPayment;
      var newMonths2 = calcRunway(taxes, { total: newBurn2 }, 0, { savings: Math.max(0, newSavings) });
      var gained2 = newMonths2 - baselineMonths;
      levers.push({
        id: 'leverDebt',
        name: 'Pay off high-interest debt',
        desc: 'Use ' + fmt(totalHiDebt) + ' to eliminate ' + fmt(totalHiPayment) + '/mo in payments.',
        months: gained2,
        burnReduction: totalHiPayment,
        cashReduction: totalHiDebt,
      });
    }

    // 3. Go lean mode (50%)
    if (state.leanSlider > 50) {
      var currentDisc = state.discretionary * (state.leanSlider / 100);
      var leanDisc = state.discretionary * 0.5;
      var leanSave = currentDisc - leanDisc;
      var newBurn3 = burn.total - leanSave;
      var newMonths3 = calcRunway(taxes, burn, 0, { burn: newBurn3 });
      var gained3 = newMonths3 - baselineMonths;
      levers.push({
        id: 'leverLean',
        name: 'Go lean mode (50%)',
        desc: 'Cut discretionary from ' + fmt(currentDisc) + ' to ' + fmt(leanDisc) + '/mo.',
        months: gained3,
        burnReduction: leanSave,
      });
    }

    // 4. Freelance income
    var newMonthsFreelance = calcRunway(taxes, burn, state.freelanceIncome);
    var gainedFreelance = newMonthsFreelance - baselineMonths;
    levers.push({
      id: 'leverFreelance',
      name: 'Add freelance income',
      desc: 'Expected ' + fmt(state.freelanceIncome) + '/mo consulting.',
      months: gainedFreelance,
      hasInput: true,
      inputField: 'freelanceIncome',
      inputValue: state.freelanceIncome,
    });

    // 5. Move to cheaper housing
    if (state.rent > 2000) {
      var housingCut = state.rent - state.newRent;
      var newBurn4 = burn.total - housingCut;
      var newMonths4 = calcRunway(taxes, burn, 0, { burn: newBurn4 });
      var gained4 = newMonths4 - baselineMonths;
      levers.push({
        id: 'leverHousing',
        name: 'Move to cheaper housing',
        desc: 'Reduce rent from ' + fmt(state.rent) + ' to ' + fmt(state.newRent) + '/mo.',
        months: gained4,
        hasInput: true,
        inputField: 'newRent',
        inputValue: state.newRent,
      });
    }

    // 6. Max pre-tax contributions
    var taxSavingsMonths = taxes.taxSavings / burn.total;
    if (taxSavingsMonths > 0.3) {
      levers.push({
        id: 'leverPretax',
        name: 'Max pre-tax contributions',
        desc: fmt(taxes.taxSavings) + ' in tax savings = ' + taxSavingsMonths.toFixed(1) + ' extra months.',
        months: taxSavingsMonths,
      });
    }

    // Render levers
    for (var li = 0; li < levers.length; li++) {
      (function (lever) {
        var card = document.createElement('div');
        card.className = 'calc-modal__lever-card' + (state[lever.id] ? ' active' : '');
        card.setAttribute('role', 'switch');
        card.setAttribute('aria-checked', state[lever.id] ? 'true' : 'false');
        card.setAttribute('tabindex', '0');

        var inputHTML = '';
        if (lever.hasInput) {
          inputHTML = '<div class="calc-modal__lever-input-wrap" onclick="event.stopPropagation()">'
            + '<div class="calc-modal__input-prefix-wrap">'
            + '<span class="calc-modal__input-prefix">$</span>'
            + '<input type="text" inputmode="numeric" value="' + lever.inputValue.toLocaleString('en-US') + '"'
            + ' data-cm-lever-input="' + lever.inputField + '"'
            + ' onclick="event.stopPropagation()"'
            + ' onfocus="event.stopPropagation()">'
            + '</div></div>';
        }

        card.innerHTML = '<div class="calc-modal__lever-toggle"></div>'
          + '<div class="calc-modal__lever-info">'
          + '<div class="calc-modal__lever-name">' + lever.name + '</div>'
          + '<div class="calc-modal__lever-desc">' + lever.desc + '</div>'
          + inputHTML
          + '</div>'
          + '<div class="calc-modal__lever-badge">' + (lever.months >= 0 ? '+' : '') + lever.months.toFixed(1) + ' mo</div>';

        card.addEventListener('click', function () {
          state[lever.id] = !state[lever.id];
          card.classList.toggle('active');
          card.setAttribute('aria-checked', state[lever.id] ? 'true' : 'false');
          updateOptimized(taxes, burn, baselineMonths, levers);
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });

        // Handle lever inputs
        var leverInput = card.querySelector('[data-cm-lever-input]');
        if (leverInput) {
          leverInput.addEventListener('input', function () {
            var field = leverInput.getAttribute('data-cm-lever-input');
            state[field] = parseNum(leverInput.value);
            updateStep4();
          });
          leverInput.addEventListener('blur', function () {
            formatInput(leverInput);
          });
        }

        grid.appendChild(card);
      })(levers[li]);
    }

    updateOptimized(taxes, burn, baselineMonths, levers);
  }

  function updateOptimized(taxes, burn, baselineMonths, levers) {
    var optimizedBurn = burn.total;
    var optimizedSavings = state.currentSavings;
    var extraIncome = 0;
    var anyActive = false;

    for (var i = 0; i < levers.length; i++) {
      var lever = levers[i];
      if (!state[lever.id]) continue;
      anyActive = true;
      if (lever.burnReduction) optimizedBurn -= lever.burnReduction;
      if (lever.cashReduction) optimizedSavings -= lever.cashReduction;
      if (lever.id === 'leverFreelance') extraIncome += state.freelanceIncome;
    }

    optimizedSavings = Math.max(0, optimizedSavings);
    var optSection = document.getElementById('cm-optimizedSection');

    if (anyActive) {
      var optMonths = calcRunway(taxes, { total: optimizedBurn }, extraIncome, { savings: optimizedSavings });
      var delta = optMonths - baselineMonths;
      setText('optimizedMonths', Math.floor(optMonths));
      setText('optimizedDelta', (delta >= 0 ? '+' : '') + delta.toFixed(1) + ' months');
      setText('sum-burnOpt', fmt(optimizedBurn));
      setText('sum-runwayOpt', Math.floor(optMonths) + ' months');
      if (optSection) optSection.style.display = '';
    } else {
      if (optSection) optSection.style.display = 'none';
      setText('sum-burnOpt', fmt(burn.total));
      setText('sum-runwayOpt', Math.floor(baselineMonths) + ' months');
    }
  }

  // ============================================
  // STEP NAVIGATION
  // ============================================
  function goToStep(step) {
    if (step < 1 || step > 4) return;
    state.currentStep = step;

    // Update panels
    modal.querySelectorAll('.calc-modal__step-panel').forEach(function (p) { p.classList.remove('active'); });
    var panel = document.getElementById('calc-step-' + step);
    if (panel) panel.classList.add('active');

    // Update progress steps
    modal.querySelectorAll('.calc-modal__progress-step').forEach(function (s) {
      var sn = parseInt(s.getAttribute('data-calc-step'));
      s.classList.remove('active', 'completed');
      if (sn === step) s.classList.add('active');
      else if (sn < step) s.classList.add('completed');
    });

    // Update progress lines
    for (var i = 1; i <= 3; i++) {
      var line = document.getElementById('calc-line-' + i);
      if (line) line.style.width = (i < step) ? '100%' : '0%';
    }

    // Scroll modal to top
    var container = modal.querySelector('.calc-modal__container');
    if (container) container.scrollTop = 0;

    // Recalculate
    if (step === 1) updateStep1();
    if (step === 2) updateStep2();
    if (step === 3) updateStep3();
    if (step === 4) { updateStep2(); updateStep3(); updateStep4(); }
  }

  // Progress step click handlers
  modal.querySelectorAll('.calc-modal__progress-step').forEach(function (s) {
    s.addEventListener('click', function () {
      var step = parseInt(s.getAttribute('data-calc-step'));
      goToStep(step);
    });
  });

  // Nav button click handlers (data-cm-goto)
  modal.querySelectorAll('[data-cm-goto]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var step = parseInt(btn.getAttribute('data-cm-goto'));
      goToStep(step);
    });
  });

  // ============================================
  // INPUT BINDINGS
  // ============================================
  function bindInputs() {
    // Text/number inputs
    modal.querySelectorAll('[data-cm-field]').forEach(function (el) {
      if (el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'range') {
        el.addEventListener('input', function () {
          state[el.getAttribute('data-cm-field')] = parseNum(el.value);
          updateCurrent();
        });
        el.addEventListener('blur', function () { formatInput(el); });
      }
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', function () {
          state[el.getAttribute('data-cm-field')] = el.value;
          updateCurrent();
        });
      }
      if (el.type === 'radio') {
        el.addEventListener('change', function () {
          if (el.checked) {
            state[el.getAttribute('data-cm-field')] = el.value;
            updateCurrent();
          }
        });
      }
      if (el.type === 'range') {
        el.addEventListener('input', function () {
          state[el.getAttribute('data-cm-field')] = parseNum(el.value);
          updateCurrent();
        });
      }
    });

    // Toggle groups (data-cm-toggle)
    modal.querySelectorAll('[data-cm-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.getAttribute('data-cm-toggle');
        var value = btn.getAttribute('data-value');
        modal.querySelectorAll('[data-cm-toggle="' + group + '"]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state[group] = value;
        updateCurrent();
      });
    });

    // Collapse toggles (data-cm-collapse)
    modal.querySelectorAll('[data-cm-collapse]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-cm-collapse');
        var target = document.getElementById('cm-' + targetId + '-body');
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !expanded);
        if (target) {
          if (expanded) {
            target.classList.add('collapsed');
          } else {
            target.classList.remove('collapsed');
          }
        }
      });
    });
  }

  function updateCurrent() {
    if (state.currentStep === 1) updateStep1();
    if (state.currentStep === 2) updateStep2();
    if (state.currentStep === 3) updateStep3();
    if (state.currentStep === 4) updateStep4();
  }

  // ============================================
  // INIT
  // ============================================
  bindInputs();
  updateStep1();
  updateStep2();
  updateStep3();

  // Format all inputs on load
  modal.querySelectorAll('[data-cm-field]').forEach(function (el) {
    if (el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'range') formatInput(el);
  });

  // Expose goToStep for external use if needed
  modal._goToStep = goToStep;
  // Expose a reset function to reinitialize when modal opens
  modal._initCalc = function () {
    goToStep(1);
    updateStep1();
    updateStep2();
  };

})();
