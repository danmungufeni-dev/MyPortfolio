/* ============================================================
   GTNationDEV — Dan Mungufeni portfolio
   Vanilla JS: navigation, scroll-spy, reveal, count-up,
   portfolio filtering + lightbox, audio player, form, carousel.
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     EDIT: contact + form configuration
     ---------------------------------------------------------- */
  var CONFIG = {
    whatsapp: "256778625624", // NOTE: no + and no spaces, e.g. 256778625624
    formMode: "whatsapp", // "whatsapp" (default) or "formspree"
    formspreeEndpoint: "https://formspree.io/f/your-form-id" // only used when formMode === "formspree"
  };

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isDesktop = function () { return window.matchMedia("(min-width: 1024px)").matches; };
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var sectionEls = $$("section[data-spy]");
  var sectionIds = sectionEls.map(function (s) { return s.getAttribute("data-spy"); });

  /* ==========================================================
     1. Smooth scrolling (with sticky-topbar offset on mobile)
     ========================================================== */
  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var topbar = $(".topbar");
    var offset = !isDesktop() && topbar ? topbar.offsetHeight : 0;
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    if (id === "home") top = 0;
    window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
  }

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      closeMobileNav();
      scrollToSection(id);
    });
  });

  /* ==========================================================
     2. Mobile navigation drawer
     ========================================================== */
  var toggle = $(".topbar__toggle");
  var mobileNav = $("#mobile-nav");

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.hidden = false;
    mobileNav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("is-locked");
  }
  function closeMobileNav() {
    if (!mobileNav || !mobileNav.classList.contains("is-open")) return;
    mobileNav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("is-locked");
    window.setTimeout(function () { if (!mobileNav.classList.contains("is-open")) mobileNav.hidden = true; }, 400);
  }
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      if (mobileNav.classList.contains("is-open")) closeMobileNav(); else openMobileNav();
    });
  }

  /* ==========================================================
     3. Sidebar up/down arrows
     ========================================================== */
  function currentIndex() {
    var i = sectionIds.indexOf(activeId);
    return i < 0 ? 0 : i;
  }
  $$(".sidebar__arrow").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dir = parseInt(btn.getAttribute("data-move"), 10);
      var next = Math.min(sectionIds.length - 1, Math.max(0, currentIndex() + dir));
      scrollToSection(sectionIds[next]);
    });
  });

  /* ==========================================================
     4. Scroll-spy (sidebar links + right timeline)
     ========================================================== */
  var activeId = sectionIds[0];
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    $$("[data-spy]").forEach(function (el) {
      if (el.classList.contains("sidebar__link") || el.classList.contains("timeline__dot")) {
        el.classList.toggle("is-active", el.getAttribute("data-spy") === id);
      }
    });
  }

  var spyTicking = false;
  function runSpy() {
    var probe = window.pageYOffset + window.innerHeight * 0.32;
    var current = sectionIds[0];
    for (var i = 0; i < sectionEls.length; i++) {
      if (sectionEls[i].offsetTop <= probe) current = sectionEls[i].getAttribute("data-spy");
    }
    setActive(current);
    spyTicking = false;
  }
  window.addEventListener("scroll", function () {
    if (!spyTicking) { spyTicking = true; requestAnimationFrame(runSpy); }
  }, { passive: true });

  /* ==========================================================
     5. Entrance reveal animations
     ========================================================== */
  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ==========================================================
     6. Fun-fact count-up
     ========================================================== */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    if (prefersReduced) { el.textContent = String(target); return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); countObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    $$("[data-count]").forEach(function (el) { countObserver.observe(el); });
  } else {
    $$("[data-count]").forEach(countUp);
  }

  /* ==========================================================
     7. Portfolio: load data, render, filter, lightbox
     ========================================================== */
  var grid = $("#portfolio-grid");
  var cards = [];

  function cardMarkup(item) {
    return '' +
      '<button class="card" type="button" data-category="' + item.category + '" ' +
      'data-title="' + escapeAttr(item.title) + '" ' +
      'data-cat="' + escapeAttr(item.categoryLabel || item.category) + '" ' +
      'data-image="' + escapeAttr(item.image) + '" ' +
      'data-desc="' + escapeAttr(item.description || "") + '" ' +
      'aria-label="Open ' + escapeAttr(item.title) + '">' +
      '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.title) + '" loading="lazy" width="800" height="600" />' +
      '<span class="card__overlay">' +
      '<span class="card__cat">' + escapeHtml(item.categoryLabel || item.category) + '</span>' +
      '<span class="card__title">' + escapeHtml(item.title) + '</span>' +
      '<span class="card__view">View project <svg class="ico"><use href="#i-external"/></svg></span>' +
      '</span>' +
      '</button>';
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function renderPortfolio(items) {
    if (!grid) return;
    grid.innerHTML = items.map(cardMarkup).join("");
    cards = $$(".card", grid);
    cards.forEach(function (card, i) {
      card.style.transitionDelay = (i % 8) * 0.05 + "s";
      card.addEventListener("click", function () { openLightbox(card); });
      requestAnimationFrame(function () { card.classList.add("is-shown"); });
    });
  }

  function applyFilter(cat) {
    cards.forEach(function (card, i) {
      var match = cat === "all" || card.getAttribute("data-category") === cat;
      if (match) {
        card.classList.remove("is-hiding");
        card.style.transitionDelay = (i % 8) * 0.04 + "s";
        requestAnimationFrame(function () { card.classList.add("is-shown"); });
      } else {
        card.classList.remove("is-shown");
        card.style.transitionDelay = "0s";
        window.setTimeout(function () {
          if (!card.classList.contains("is-shown")) card.classList.add("is-hiding");
        }, 320);
      }
    });
  }

  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".filter").forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  // Lightbox
  var lightbox = $("#lightbox");
  var lbImg = $("#lightbox-img");
  var lbTitle = $("#lightbox-title");
  var lbCat = $("#lightbox-cat");
  var lbDesc = $("#lightbox-desc");
  var lastFocus = null;

  function openLightbox(card) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    lbImg.src = card.getAttribute("data-image");
    lbImg.alt = card.getAttribute("data-title");
    lbTitle.textContent = card.getAttribute("data-title");
    lbCat.textContent = card.getAttribute("data-cat");
    lbDesc.textContent = card.getAttribute("data-desc") || "A GTNationDEV project.";
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    var closeBtn = $(".lightbox__close", lightbox);
    if (closeBtn) closeBtn.focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("is-locked");
    lbImg.src = "";
    if (lastFocus) lastFocus.focus();
  }
  if (lightbox) {
    $$("[data-close]", lightbox).forEach(function (el) { el.addEventListener("click", closeLightbox); });
  }

  // Load data. NOTE: fetch() needs an HTTP server — run "npx serve" or deploy.
  // Opening index.html directly via file:// will block this request.
  fetch("data/portfolio.json")
    .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
    .then(function (data) { renderPortfolio((data && data.items) || []); })
    .catch(function (err) {
      if (!grid) return;
      console.warn("Portfolio data could not be loaded:", err);
      grid.innerHTML = '<p style="grid-column:1/-1;font-weight:600">Portfolio data could not load. ' +
        'Serve the site over HTTP (e.g. <code>npx serve</code>) or check data/portfolio.json.</p>';
    });

  /* ==========================================================
     8. Audio player
     ========================================================== */
  var audioEl = $("#audio-el");
  var activeTrack = null;
  function pauseActive() {
    if (!audioEl || !activeTrack) return;
    audioEl.pause();
    setTrackIcon(activeTrack, false);
    activeTrack.classList.remove("is-playing");
    activeTrack = null;
  }
  function setTrackIcon(track, playing) {
    var use = $("use", track);
    if (use) use.setAttribute("href", playing ? "#i-pause" : "#i-play");
    var btn = $(".audio__btn", track);
    if (btn) btn.setAttribute("aria-label", (playing ? "Pause " : "Play ") + ($(".audio__meta strong", track) || {}).textContent);
  }
  var tracks = $$(".audio__track");
  tracks.forEach(function (track) {
    var btn = $(".audio__btn", track);
    if (!btn || !audioEl) return;
    btn.addEventListener("click", function () {
      var src = track.getAttribute("data-audio");
      if (activeTrack === track && !audioEl.paused) { audioEl.pause(); setTrackIcon(track, false); return; }
      if (activeTrack && activeTrack !== track) pauseActive();
      if (audioEl.getAttribute("src") !== src) audioEl.setAttribute("src", src);
      activeTrack = track;
      audioEl.play().then(function () {
        setTrackIcon(track, true);
        track.classList.add("is-playing");
        activeTrack = track;
      }).catch(function () {
        activeTrack = null;
        var meta = $(".audio__meta em", track);
        if (meta) meta.textContent = "Audio coming soon";
      });
    });
  });
  if (audioEl) {
    audioEl.addEventListener("ended", function () {
      if (activeTrack) { setTrackIcon(activeTrack, false); activeTrack.classList.remove("is-playing"); activeTrack = null; }
    });
    audioEl.addEventListener("timeupdate", function () {
      if (!activeTrack) return;
      var bar = $(".audio__progress i", activeTrack);
      if (bar && audioEl.duration) bar.style.width = (audioEl.currentTime / audioEl.duration) * 100 + "%";
    });
  }

  /* ==========================================================
     9. Testimonials carousel dots (mobile)
     ========================================================== */
  var scroller = $(".testimonials");
  var dotsWrap = $("#carousel-dots");
  if (scroller && dotsWrap) {
    var slides = $$(".testimonial", scroller);
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () {
        scroller.scrollTo({ left: slides[i].offsetLeft - 16, behavior: prefersReduced ? "auto" : "smooth" });
      });
      dotsWrap.appendChild(dot);
    });
    var dotBtns = $$("button", dotsWrap);
    var scrollTicking = false;
    scroller.addEventListener("scroll", function () {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(function () {
        var width = scroller.clientWidth;
        var idx = Math.round(scroller.scrollLeft / width);
        idx = Math.min(dotBtns.length - 1, Math.max(0, idx));
        dotBtns.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
        scrollTicking = false;
      });
    }, { passive: true });
  }

  /* ==========================================================
     10. Contact form -> WhatsApp / Formspree
     ========================================================== */
  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("#cf-status");
      var fields = form.elements;
      var name = fields.namedItem("name").value.trim();
      var email = fields.namedItem("email").value.trim();
      var message = fields.namedItem("message").value.trim();

      if (!name || !email || !message) {
        if (status) { status.textContent = "Please fill in your name, email and message."; status.classList.add("is-error"); }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) { status.textContent = "Please enter a valid email address."; status.classList.add("is-error"); }
        return;
      }
      if (status) { status.textContent = ""; status.classList.remove("is-error"); }

      if (CONFIG.formMode === "formspree") {
        fetch(CONFIG.formspreeEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form)
        }).then(function (res) {
          if (status) status.textContent = res.ok ? "Thanks! Your message was sent." : "Something went wrong. Please try WhatsApp.";
          if (res.ok) form.reset();
        }).catch(function () {
          if (status) status.textContent = "Network error. Please try WhatsApp instead.";
        });
        return;
      }

      // Default: open WhatsApp with a prefilled message
      var text = "Hi Dan, I'm " + name + " (" + email + ").%0A%0A" + encodeURIComponent(message);
      window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + text, "_blank", "noopener");
      if (status) status.textContent = "Opening WhatsApp…";
      form.reset();
    });
  }

  /* ==========================================================
     11. Back-to-top button
     ========================================================== */
  var toTop = $("#to-top");
  if (toTop) {
    var toggleTop = function () { toTop.hidden = window.pageYOffset < 600; };
    window.addEventListener("scroll", toggleTop, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
    toggleTop();
  }

  /* ==========================================================
     12. Keyboard support
     ========================================================== */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeLightbox(); closeMobileNav(); }
  });

  // Run once on load so state is correct even if the page opens scrolled.
  window.addEventListener("load", runSpy);
  runSpy();
})();
