/* Jetsonic CMS overlay
 * Fetches block content from the admin API and patches existing DOM elements.
 * Elements opt in with three data attributes:
 *   data-cms-page="home"           — which page slug to read
 *   data-cms-block="0"             — which block (0-based index)
 *   data-cms-key="headingEn"       — which field inside block.data
 *
 * For bilingual fields, mark two siblings with -en / -ar suffixes,
 * or add data-cms-mode="html|text" (default: text).
 *
 * The script also updates data-en / data-ar attributes when the field key
 * ends with En or Ar, so the existing language toggle keeps working.
 */
(function () {
  var API_BASE = (function () {
    var meta = document.querySelector('meta[name="cms-api"]');
    if (meta && meta.content) return meta.content.replace(/\/$/, '');
    // Default — backend is reverse-proxied same-origin under /api/* in production.
    return '/api/v1';
  })();

  function findTargets() {
    var nodes = document.querySelectorAll('[data-cms-key]');
    var byPageAndBlock = {};
    nodes.forEach(function (el) {
      var page = el.getAttribute('data-cms-page');
      var block = el.getAttribute('data-cms-block');
      var key = el.getAttribute('data-cms-key');
      if (!page || block === null || !key) return;
      var pageKey = page;
      var blockKey = String(block);
      byPageAndBlock[pageKey] = byPageAndBlock[pageKey] || {};
      byPageAndBlock[pageKey][blockKey] = byPageAndBlock[pageKey][blockKey] || [];
      byPageAndBlock[pageKey][blockKey].push({ el: el, key: key });
    });
    return byPageAndBlock;
  }

  function applyBlock(targets, block) {
    if (!targets) return;
    var data = block.data || {};
    targets.forEach(function (t) {
      var value = data[t.key];
      if (typeof value !== 'string') return;

      // Update both data-en / data-ar attrs so existing lang toggle keeps working.
      if (/En$/.test(t.key)) t.el.setAttribute('data-en', value);
      if (/Ar$/.test(t.key)) t.el.setAttribute('data-ar', value);

      // For href fields, update the attribute on the element itself if it's a link.
      if (/Href$/.test(t.key) && t.el.tagName === 'A') {
        t.el.setAttribute('href', value);
        return;
      }

      // Default: replace text content for the current language.
      var currentLang = document.body.getAttribute('dir') === 'rtl' ? 'ar' : 'en';
      var shouldApplyToText =
        (currentLang === 'en' && /En$/.test(t.key)) ||
        (currentLang === 'ar' && /Ar$/.test(t.key)) ||
        !/En$|Ar$|Href$/.test(t.key);

      if (shouldApplyToText) {
        t.el.textContent = value;
      }
    });
  }

  function hideDisabledBlocks(slug, page) {
    page.blocks.forEach(function (block, index) {
      // If a block index is in the API response, it's enabled (public endpoint already filters).
      // We mark known sections with data-cms-section so they can be hidden when disabled.
      var section = document.querySelector(
        '[data-cms-page="' + slug + '"][data-cms-section="' + index + '"]'
      );
      if (section) section.style.display = '';
    });
  }

  function applySeo(seo) {
    if (!seo) return;
    if (seo.title) document.title = seo.title;
    setMeta('description', seo.description);
    setProperty('og:title', seo.title);
    setProperty('og:description', seo.description);
    if (seo.ogImage) setProperty('og:image', seo.ogImage);
    setMeta('keywords', seo.keywords || '');
  }

  function setMeta(name, content) {
    if (!content) return;
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setProperty(prop, content) {
    if (!content) return;
    var el = document.querySelector('meta[property="' + prop + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function load() {
    var pages = {};
    document.querySelectorAll('[data-cms-page]').forEach(function (el) {
      var slug = el.getAttribute('data-cms-page');
      if (slug) pages[slug] = true;
    });

    var slugs = Object.keys(pages);
    if (slugs.length === 0) return;

    var targets = findTargets();

    slugs.forEach(function (slug) {
      fetch(API_BASE + '/pages/public/' + encodeURIComponent(slug))
        .then(function (r) {
          if (!r.ok) throw new Error('CMS ' + r.status);
          return r.json();
        })
        .then(function (page) {
          applySeo(page.seo);
          hideDisabledBlocks(slug, page);
          page.blocks.forEach(function (block, index) {
            var blockTargets = targets[slug] && targets[slug][String(index)];
            applyBlock(blockTargets, block);
          });
          // Re-trigger language application if the landing exposes it on window.
          if (typeof window.applyLanguage === 'function') {
            try {
              window.applyLanguage();
            } catch (e) {
              /* no-op */
            }
          }
        })
        .catch(function (err) {
          // Fail silently — landing keeps static fallback content.
          if (window.console && console.warn) console.warn('[CMS]', err);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
