document.addEventListener("DOMContentLoaded", function () {
  // ── TOC linking system ──
  var OFFSET = 82 + 16; // navbar height + 16px breathing room
  var ACTIVE_COLOR = "#8D4CDD";
  var tocLinks = document.querySelectorAll(".toc-link");
  var sections = [];

  // Build sections array from TOC link hrefs
  tocLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var id = href.replace("#", "");
    var target = document.getElementById(id);
    if (target) {
      sections.push({ id: id, el: target, link: link });
    }
  });

  // Store each link's original color
  tocLinks.forEach(function (link) {
    link.dataset.originalColor = getComputedStyle(link).color;
  });

  // Disable Webflow's native smooth scroll on TOC links
  tocLinks.forEach(function (link) {
    link.removeAttribute("data-wf-id");
    link.removeAttribute("data-wf-element");
  });

  // Disable CSS scroll-behavior so we control it entirely
  document.documentElement.style.scrollBehavior = "auto";

  // Smooth scroll on click with offset
  tocLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      history.pushState(null, null, " ");

      var id = this.getAttribute("href").replace("#", "");
      var target = document.getElementById(id);
      if (!target) return;

      // Collapse mobile TOC on click below 991px
      if (window.innerWidth < 991) {
        var mToc = document.getElementById("m-toc");
        if (mToc && mToc.offsetHeight > 60) {
          mToc.click();
        }
      }

      var top = target.getBoundingClientRect().top + window.pageYOffset - OFFSET;
      window.scrollTo({ top: top, behavior: "smooth" });
    }, true);
  });

  // Close #m-toc when clicking anywhere else on the page
  document.addEventListener("click", function (e) {
    if (window.innerWidth >= 991) return;
    var mToc = document.getElementById("m-toc");
    if (!mToc) return;
    if (mToc.contains(e.target)) return;
    if (mToc.offsetHeight > 60) {
      mToc.click();
    }
  });

  var lastActive = null;

  // Highlight active link on scroll
  function setActiveLink() {
    var current = null;
    var viewportBottom = window.innerHeight;

    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].el.getBoundingClientRect();
      if (rect.top <= viewportBottom - 30) {
        current = sections[i];
      }
    }

    if (current) {
      lastActive = current;
    } else {
      current = lastActive;
    }

    tocLinks.forEach(function (link) {
      link.style.color = link.dataset.originalColor;
      link.style.fontWeight = "";
    });

    if (current) {
      current.link.style.color = ACTIVE_COLOR;
      current.link.style.fontWeight = "bold";
    }
  }

  // Throttle scroll events
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        setActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  setActiveLink();

  // ── GSAP Animations ──
  gsap.registerPlugin(ScrollTrigger);

  // ── Hero staggered fade-up animation ──
  gsap.set([".aw_logo_top", ".cross_icon", ".ammex_logo_top"], {
    opacity: 0,
    y: 40
  });
  var heroTl = gsap.timeline({ delay: 0.3 });

  heroTl.to([".aw_logo_top", ".cross_icon", ".ammex_logo_top"], {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power2.out",
    stagger: 0.35
  });

  // ── Hero text word-by-word fade-up ──
  var heroTxt = document.getElementById("hero_txt");
  if (heroTxt) {
    var words = heroTxt.textContent.trim().split(/\s+/);
    heroTxt.innerHTML = words.map(function (word) {
      return '<span style="display:inline-block;opacity:0;transform:translateY(20px)">' + word + '</span>';
    }).join(' ');

    var wordSpans = heroTxt.querySelectorAll("span");
    heroTl.to(wordSpans, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.12
    }, "-=1.2");

    // ── PM pointers fade-up ──
    gsap.set(".pm-pointers-wraper", { opacity: 0, y: 40 });
    heroTl.to(".pm-pointers-wraper", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=0.5");
  }

  // ── Content section scroll-triggered fade-up ──
  gsap.set([".case_study_toc_wrapper", ".case_study_block"], {
    opacity: 0,
    y: 40
  });

  // ── Number count-up animation ──
  var counters = [
    { id: "#idr", target: 20 },
    { id: "#cdr", target: 65 },
    { id: "#dri", target: 80 }
  ];

  counters.forEach(function (counter) {
    var el = document.querySelector(counter.id);
    if (!el) return;
    el.textContent = "0%";

    ScrollTrigger.create({
      trigger: counter.id,
      start: "top 90%",
      once: true,
      onEnter: function () {
        var obj = { val: 0 };
        gsap.to(obj, {
          val: counter.target,
          duration: 2,
          ease: "power2.out",
          onUpdate: function () {
            el.textContent = Math.round(obj.val) + "%";
          }
        });
      }
    });
  });

  heroTl.eventCallback("onComplete", function () {
    ScrollTrigger.create({
      trigger: "#content_section",
      start: "top 80%",
      once: true,
      onEnter: function () {
        var contentTl = gsap.timeline();
        contentTl.to(".case_study_toc_wrapper", {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        }).to(".case_study_block", {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        }, "-=0.5");
      }
    });
  });
});
