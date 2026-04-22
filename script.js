document.addEventListener("DOMContentLoaded", function () {
  // ── Brand Motion Identity (Premium archetype) ──
  // Signature easing + bounded duration palette for consistency across the page.
  var EASE = {
    entry: "power3.out",      // signature entrance curve
    reveal: "expo.out",       // dramatic number/hero reveal
    smooth: "power2.inOut",   // on-screen transitions
    pop: "back.out(1.6)"      // success beat only
  };

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

  // Store each link's original color + add smooth active-state transition
  tocLinks.forEach(function (link) {
    link.dataset.originalColor = getComputedStyle(link).color;
    link.style.transition = "color 220ms cubic-bezier(0.215,0.61,0.355,1), font-weight 220ms cubic-bezier(0.215,0.61,0.355,1)";
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

  // ── Hero staggered entrance ──
  // Primary: y-shift. Secondary: scale (depth) + cross-icon rotation (character).
  gsap.set([".aw_logo_top", ".ammex_logo_top"], {
    opacity: 0,
    y: 40,
    scale: 0.94
  });
  gsap.set(".cross_icon", {
    opacity: 0,
    y: 40,
    scale: 0.7,
    rotation: -45
  });

  var heroTl = gsap.timeline({ delay: 0.3 });

  heroTl.to(".aw_logo_top", {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.0,
    ease: EASE.entry
  }).to(".cross_icon", {
    opacity: 1,
    y: 0,
    scale: 1,
    rotation: 0,
    duration: 0.9,
    ease: EASE.entry
  }, "-=0.55").to(".ammex_logo_top", {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.0,
    ease: EASE.entry
  }, "-=0.55");

  // ── Hero text word-by-word fade-up ──
  var heroTxt = document.getElementById("hero_txt");
  if (heroTxt) {
    var words = heroTxt.textContent.trim().split(/\s+/);
    heroTxt.innerHTML = words.map(function (word) {
      return '<span style="display:inline-block;opacity:0;transform:translateY(20px)">' + word + '</span>';
    }).join(' ');

    var wordSpans = heroTxt.querySelectorAll("span");
    // Cap total stagger at 0.8s so the reveal stays within the dramatic budget
    // regardless of word count.
    var wordStaggerBudget = Math.min(0.8, wordSpans.length * 0.05);

    heroTl.to(wordSpans, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: EASE.entry,
      stagger: { amount: wordStaggerBudget }
    }, "-=0.8");

    // ── In-conversation-with block ──
    // Primary: container rises (shared hero vocabulary).
    // Secondary: avatars scale-settle with slight x-offset so the overlapping
    // DPs feel like they're clicking into the stack, not popping in place.
    // Tertiary: caption fades up just as avatars land; name spans get a
    // micro-emphasis (subtle opacity lift) to draw the eye without adding noise.
    gsap.set(".in-convo-with", { opacity: 0, y: 30 });
    gsap.set(".rino_dp", { opacity: 0, scale: 0.7, x: 10 });
    gsap.set(".chad_dp", { opacity: 0, scale: 0.7, x: -10 });
    gsap.set(".in-convo-with-txt", { opacity: 0, y: 12 });
    gsap.set(".in-convo-with-txt .u-bold.is-black", { opacity: 0.6 });

    heroTl.to(".in-convo-with", {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: EASE.entry
    }, "-=0.45")
    .to(".rino_dp", {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 0.55,
      ease: EASE.entry
    }, "-=0.5")
    .to(".chad_dp", {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 0.55,
      ease: EASE.entry
    }, "-=0.45")
    .to(".in-convo-with-txt", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: EASE.entry
    }, "-=0.35")
    .to(".in-convo-with-txt .u-bold.is-black", {
      opacity: 1,
      duration: 0.35,
      ease: EASE.entry,
      stagger: 0.05
    }, "-=0.25");

    // ── PM pointers fade-up ──
    gsap.set(".pm-pointers-wraper", { opacity: 0, y: 40, scale: 0.98 });
    heroTl.to(".pm-pointers-wraper", {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: EASE.entry
    }, "-=0.35");
  }

  // ── Content section scroll-triggered fade-up ──
  gsap.set([".case_study_toc_wrapper", ".case_study_block"], {
    opacity: 0,
    y: 40
  });

  // ── Number count-up animation ──
  // Primary: value ticks up. Secondary: scale pop at completion (success beat).
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
          duration: 1.8,
          ease: EASE.reveal,
          onUpdate: function () {
            el.textContent = Math.round(obj.val) + "%";
          },
          onComplete: function () {
            // Success beat: scale pop to punctuate the milestone landing.
            gsap.fromTo(el,
              { scale: 1 },
              {
                scale: 1.08,
                duration: 0.22,
                ease: EASE.pop,
                yoyo: true,
                repeat: 1
              }
            );
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
          duration: 0.9,
          ease: EASE.entry
        }).to(".case_study_block", {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: EASE.entry,
          stagger: { amount: 0.35 }
        }, "-=0.5");
      }
    });
  });
});
