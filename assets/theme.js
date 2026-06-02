/* ===== PawLove theme — theme.js ===== */
(function () {
  'use strict';

  /* Mobile nav toggle */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-nav-toggle]');
    if (toggle) {
      var nav = document.querySelector('.header__nav');
      if (nav) nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    }
  });

  /* ===== Product page logic ===== */
  function initProduct() {
    var root = document.querySelector('[data-product]');
    if (!root) return;

    var variantsData = [];
    try { variantsData = JSON.parse(root.querySelector('[data-variants-json]').textContent); } catch (e) {}

    var idInput = root.querySelector('[data-variant-id]');
    var priceEl = root.querySelector('[data-price]');
    var compareEl = root.querySelector('[data-compare]');
    var saveEl = root.querySelector('[data-save]');
    var addBtn = root.querySelector('[data-add]');

    function money(cents) {
      return '€' + (cents / 100).toFixed(2).replace('.', ',');
    }

    var stockN = root.querySelector('[data-stock-n]');
    var stockFill = root.querySelector('[data-stock-fill]');
    var stockbar = root.querySelector('.stockbar');
    var bbPrice = document.querySelector('[data-bb-price]');
    var bbName = document.querySelector('[data-bb-name]');
    var mainImg = root.querySelector('[data-main-img]');
    var mainPh = root.querySelector('[data-main-ph]');
    var shipMsg = root.querySelector('[data-ship-msg]');
    var shipFill = root.querySelector('[data-ship-fill]');
    var SHIP = parseInt(root.getAttribute('data-free-ship'), 10) || 4000;
    var qtyInput = root.querySelector('[data-qty] input');
    var current = variantsData.filter(function (x) { var r = root.querySelector('[data-variant-radio]:checked'); return r ? String(x.id) === String(r.value) : true; })[0] || variantsData[0];

    function qty() { return Math.max(1, parseInt(qtyInput && qtyInput.value || '1', 10)); }

    function updateShip() {
      if (!shipFill || !current) return;
      var total = current.price * qty();
      var pct = Math.min(100, Math.round(total / SHIP * 100));
      shipFill.style.width = pct + '%';
      if (shipMsg) {
        if (total >= SHIP) { shipMsg.innerHTML = '¡Genial! Tienes <b>envío gratis</b> 🎉'; }
        else { shipMsg.innerHTML = 'Te faltan <b>' + money(SHIP - total) + '</b> para el envío gratis'; }
      }
    }

    function selectVariant(variant) {
      if (!variant) return;
      current = variant;
      if (idInput) idInput.value = variant.id;
      if (priceEl) priceEl.textContent = money(variant.price);
      var hasCompare = variant.compare_at_price && variant.compare_at_price > variant.price;
      if (compareEl) {
        compareEl.textContent = hasCompare ? money(variant.compare_at_price) : '';
        compareEl.style.display = hasCompare ? '' : 'none';
      }
      if (saveEl) {
        saveEl.textContent = hasCompare ? 'Ahorras ' + money(variant.compare_at_price - variant.price) : '';
        saveEl.style.display = hasCompare ? '' : 'none';
      }
      if (addBtn) {
        addBtn.disabled = !variant.available;
        addBtn.textContent = variant.available ? 'Añadir al carrito 🐾' : 'Agotado';
      }
      /* stock bar */
      if (stockbar) {
        if (typeof variant.stock === 'number' && variant.stock > 0) {
          stockbar.style.display = '';
          if (stockN) stockN.textContent = variant.stock;
          if (stockFill) stockFill.style.width = Math.max(8, Math.min(100, Math.round(variant.stock / 25 * 100))) + '%';
        } else { stockbar.style.display = 'none'; }
      }
      /* gallery swap */
      if (mainImg && variant.featured_image) {
        mainImg.style.opacity = '0';
        setTimeout(function () { mainImg.src = variant.featured_image; mainImg.style.opacity = '1'; }, 120);
      }
      if (mainPh) {
        mainPh.style.opacity = '0';
        setTimeout(function () {
          if (variant.bg) mainPh.style.background = variant.bg;
          if (variant.ink) mainPh.style.color = variant.ink;
          if (variant.label) mainPh.textContent = variant.label;
          mainPh.style.opacity = '1';
        }, 120);
      }
      /* sticky buy bar */
      if (bbPrice) bbPrice.innerHTML = (hasCompare ? '<del>' + money(variant.compare_at_price) + '</del>' : '') + money(variant.price);
      updateShip();
    }

    root.querySelectorAll('[data-variant-radio]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        root.querySelectorAll('.variant-card').forEach(function (c) { c.classList.remove('is-active'); });
        var card = radio.closest('.variant-card');
        if (card) card.classList.add('is-active');
        var v = variantsData.filter(function (x) { return String(x.id) === String(radio.value); })[0];
        selectVariant(v);
      });
    });

    /* Quantity stepper */
    root.querySelectorAll('[data-qty]').forEach(function (wrap) {
      var input = wrap.querySelector('input');
      wrap.querySelector('[data-qty-minus]').addEventListener('click', function () {
        input.value = Math.max(1, parseInt(input.value || '1', 10) - 1); updateShip();
      });
      wrap.querySelector('[data-qty-plus]').addEventListener('click', function () {
        input.value = parseInt(input.value || '1', 10) + 1; updateShip();
      });
      input.addEventListener('change', updateShip);
    });

    if (bbName) bbName.textContent = (root.querySelector('.pdp__title') || {}).textContent || '';
    selectVariant(current);

    /* Sticky buy bar reveal */
    var buybar = document.querySelector('.buybar');
    if (buybar && addBtn) {
      window.addEventListener('scroll', function () {
        var r = addBtn.getBoundingClientRect();
        buybar.classList.toggle('show', r.bottom < 0);
      }, { passive: true });
      var bbAdd = buybar.querySelector('[data-bb-add]');
      if (bbAdd) bbAdd.addEventListener('click', function () { addBtn.click(); });
    }

    /* Gallery thumbs */
    var mainImg = root.querySelector('[data-main-img]');
    root.querySelectorAll('[data-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var full = thumb.getAttribute('data-full');
        if (mainImg && full) mainImg.src = full;
        root.querySelectorAll('[data-thumb]').forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });
  }

  /* ===== Countdown ===== */
  function initCountdown() {
    document.querySelectorAll('[data-countdown]').forEach(function (el) {
      var hours = parseInt(el.getAttribute('data-countdown'), 10) || 24;
      var key = 'pawlove_cd_' + (el.getAttribute('data-cd-key') || 'default');
      var end = parseInt(localStorage.getItem(key), 10);
      var now = Date.now();
      if (!end || end < now) {
        end = now + hours * 3600 * 1000;
        localStorage.setItem(key, String(end));
      }
      var h = el.querySelector('[data-cd-h]');
      var m = el.querySelector('[data-cd-m]');
      var s = el.querySelector('[data-cd-s]');
      function pad(n) { return n < 10 ? '0' + n : '' + n; }
      function tick() {
        var diff = Math.max(0, end - Date.now());
        var hh = Math.floor(diff / 3600000);
        var mm = Math.floor((diff % 3600000) / 60000);
        var ss = Math.floor((diff % 60000) / 1000);
        if (h) h.textContent = pad(hh);
        if (m) m.textContent = pad(mm);
        if (s) s.textContent = pad(ss);
        if (diff <= 0) { end = Date.now() + hours * 3600000; localStorage.setItem(key, String(end)); }
      }
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ===== Accordions ===== */
  function initAccordions() {
    document.querySelectorAll('[data-acc]').forEach(function (btn) {
      var item = btn.closest('.acc-item');
      var body = item.querySelector('.acc-body');
      function open() { body.style.maxHeight = body.scrollHeight + 'px'; }
      if (item.classList.contains('open')) open();
      btn.addEventListener('click', function () {
        var isOpen = item.classList.toggle('open');
        body.style.maxHeight = isOpen ? body.scrollHeight + 'px' : '0px';
      });
    });
  }

  /* ===== Live viewers ticker ===== */
  function initViewers() {
    document.querySelectorAll('[data-viewers]').forEach(function (el) {
      setInterval(function () {
        var n = parseInt(el.textContent, 10) || 14;
        n += Math.floor(Math.random() * 5) - 2;
        el.textContent = Math.max(7, Math.min(48, n));
      }, 4000);
    });
  }

  /* ===== Spotlight color/size selectors (home page) ===== */
  function initSpotlightSelectors() {
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-c]');
      if (c) {
        c.parentElement.querySelectorAll('[data-c]').forEach(function (b) { b.classList.remove('sel'); });
        c.classList.add('sel');
      }
      var s = e.target.closest('[data-s]');
      if (s) {
        s.parentElement.querySelectorAll('[data-s]').forEach(function (b) { b.classList.remove('sel'); });
        s.classList.add('sel');
      }
    });
  }

  /* ===== Scroll reveal ===== */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.14 });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initProduct();
    initCountdown();
    initAccordions();
    initViewers();
    initSpotlightSelectors();
    initReveal();
  });
})();
