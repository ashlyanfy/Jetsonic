// Jetsonic Trading FZCO — client script.
// Responsibilities: EN/AR language toggle, nav active state, footer year,
// reveal-on-scroll animation, service-worker registration, RFQ form helpers.

(() => {
  const STORAGE_KEY = 'jetsonicLanguage';
  const DEFAULT_LANG = 'en';
  const LANGS = ['en', 'ar'];

  const root = document.documentElement;
  const body = document.body;

  function applyLanguage(lang){
    if (!LANGS.includes(lang)) lang = DEFAULT_LANG;
    root.lang = lang;
    body.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-en]').forEach(el => {
      const value = el.dataset[lang] || el.dataset.en;
      if (value) el.textContent = value;
    });

    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.dataset.lang = lang;
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function initLanguageToggle(){
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = (btn.dataset.lang === 'en') ? 'ar' : 'en';
        applyLanguage(next);
      });
    });
  }

  function markActiveNav(){
    const page = body.dataset.page;
    if (!page) return;
    document.querySelectorAll('[data-page-target="' + page + '"]').forEach(el => el.classList.add('active'));
  }

  function setFooterYear(){
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function initReveal(){
    const items = document.querySelectorAll('.reveal');
    if (!items.length || !('IntersectionObserver' in window)){
      items.forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  }

  function registerServiceWorker(){
    if (!('serviceWorker' in navigator)) return;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1'){
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
      return;
    }
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    });
  }

  // API endpoint for RFQ submissions.
  // Priority: <meta name="jetsonic-api"> → <meta name="cms-api"> → localhost fallback → PROD_API_BASE.
  // In production the backend is reverse-proxied under the same origin at /api/*,
  // so a relative base works for both the sslip.io test host and the real domain.
  const PROD_API_BASE = '/api/v1';
  const API_BASE = (() => {
    const explicit = document.querySelector('meta[name="jetsonic-api"]');
    if (explicit && explicit.content) return explicit.content.replace(/\/+$/, '');
    const cms = document.querySelector('meta[name="cms-api"]');
    if (cms && cms.content) return cms.content.replace(/\/+$/, '');
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000/api/v1';
    return PROD_API_BASE;
  })();

  const FIELD_MAP = {
    request_type: 'requestType',
    urgency: 'urgency',
    name: 'name',
    company: 'company',
    role: 'role',
    email: 'email',
    phone: 'phone',
    part_number: 'partNumber',
    alternate_part_number: 'altPartNumber',
    ata_chapter: 'ataChapter',
    aircraft_type: 'aircraftType',
    tail_number: 'tailNumber',
    quantity: 'quantity',
    condition: 'condition',
    certificate: 'certificate',
    target_date: 'targetDate',
    delivery_location: 'deliveryLocation',
    message: 'message',
    'bot-field': 'botField', // honeypot — must stay empty; filled = bot
  };

  function initRfqForm(){
    const form = document.querySelector('form[name="jetsonic-rfq"]');
    if (!form) return;

    const requestType = form.querySelector('#request_type');
    if (requestType){
      const params = new URLSearchParams(window.location.search);
      if ((params.get('request') || '').toLowerCase() === 'aog'){
        requestType.value = 'AOG Request';
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn ? submitBtn.textContent : '';
      if (submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '…'; }

      try {
        const formData = new FormData(form);
        const payload = new FormData();
        for (const [htmlKey, apiKey] of Object.entries(FIELD_MAP)){
          const v = formData.get(htmlKey);
          if (v != null && v !== '') payload.append(apiKey, v);
        }
        const file = formData.get('attachment');
        if (file && file instanceof File && file.size > 0) payload.append('attachment', file);
        payload.append('source', window.location.pathname);

        const res = await fetch(API_BASE + '/leads', { method: 'POST', body: payload });
        if (!res.ok) throw new Error('API ' + res.status);

        window.location.href = '/thank-you.html';
      } catch (err) {
        console.error('Lead submit failed:', err);
        // Show error to user — do NOT fall back to native submit (would silently drop the lead)
        const lang = document.documentElement.lang || 'en';
        const msg = lang === 'ar'
          ? 'حدث خطأ في الإرسال. يرجى إعادة المحاولة أو مراسلتنا على sales@jetsonic.aero'
          : 'Submission failed. Please try again or email us at sales@jetsonic.aero';
        alert(msg);
      } finally {
        if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = original; }
      }
    });
  }

  // Expose applyLanguage so CMS overlay can re-apply after content updates.
  window.applyLanguage = function () {
    const current = document.body.getAttribute('dir') === 'rtl' ? 'ar' : 'en';
    applyLanguage(current);
  };

  // Boot
  const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } })();
  applyLanguage(saved || DEFAULT_LANG);
  initLanguageToggle();
  markActiveNav();
  setFooterYear();
  initReveal();
  initRfqForm();
  registerServiceWorker();
})();
