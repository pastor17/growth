(function () {
  "use strict";

  /* 移动端导航开关 */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
  }

  /* 阅读进度条（仅在文章正文页启用） */
  var articleBody = document.getElementById("articleBody");
  var progressBar = document.getElementById("progressBar");
  if (articleBody && progressBar) {
    var onScroll = function () {
      var rect = articleBody.getBoundingClientRect();
      var total = articleBody.offsetHeight - window.innerHeight;
      var scrolled = -rect.top;
      if (total > 0) {
        var pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
        progressBar.style.width = pct + "%";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  /* 字号调节（记住用户偏好） */
  var fontDown = document.getElementById("fontDown");
  var fontUp = document.getElementById("fontUp");
  var fontReset = document.getElementById("fontReset");
  if (articleBody && (fontDown || fontUp || fontReset)) {
    var STORAGE_KEY = "readerFontSize";
    var MIN = 0.9, MAX = 1.35, DEFAULT = 1.02, STEP = 0.05;

    var current = parseFloat(localStorage.getItem(STORAGE_KEY)) || DEFAULT;
    var apply = function () {
      articleBody.style.setProperty("--reader-size", current.toFixed(2) + "rem");
      localStorage.setItem(STORAGE_KEY, String(current));
    };
    if (fontDown) fontDown.addEventListener("click", function () { current = Math.max(MIN, current - STEP); apply(); });
    if (fontUp) fontUp.addEventListener("click", function () { current = Math.min(MAX, current + STEP); apply(); });
    if (fontReset) fontReset.addEventListener("click", function () { current = DEFAULT; apply(); });
    apply();
  }

  /* 回到顶部 */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* 代码块一键复制 */
  var copyButtons = function () {
    var pres = document.querySelectorAll("main pre");
    pres.forEach(function (pre) {
      if (pre.closest(".code-wrap")) return;
      var wrap = document.createElement("div");
      wrap.className = "code-wrap";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.textContent = "复制";
      btn.setAttribute("aria-label", "复制代码");
      btn.addEventListener("click", function () {
        var code = pre.innerText;
        var done = function () {
          btn.textContent = "已复制";
          btn.classList.add("is-copied");
          setTimeout(function () {
            btn.textContent = "复制";
            btn.classList.remove("is-copied");
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done).catch(function () { fallback(); });
        } else { fallback(); }
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = code;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
      wrap.appendChild(btn);
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", copyButtons);
  } else {
    copyButtons();
  }
})();
