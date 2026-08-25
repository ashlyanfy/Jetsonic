/* =========================================================================
 * Jetsonic Trading FZCO — слой измерений GA4
 * Файл: /analytics.js — подключается в <head> каждой страницы с `defer`.
 *
 * Весь контракт измерений живёт в одном файле: страницы отчитываются
 * одинаково, а правка прилетает сразу на все девять.
 *
 * Правила, которые держат цифры честными:
 *   1. Ничего не отправляется, кроме как с боевых хостов. Локальная работа,
 *      тестовый sslip.io и админка в свойство не попадают — «пользователи»
 *      никогда не считают команду.
 *   2. Одно логическое действие даёт не больше одного события на страницу.
 *   3. `generate_lead` срабатывает только на /thank-you.html и только если
 *      форму отправил именно этот браузер. Прямой заход на этот адрес
 *      заявкой не считается.
 *   4. Отправки с заполненной ловушкой `bot-field` — боты, они не считаются
 *      никогда.
 *   5. Имена событий не пересекаются с Enhanced Measurement, поэтому
 *      включённые одновременно два источника не могут задвоить счёт.
 * ========================================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------------- настройки */

  var MEASUREMENT_ID = 'G-8MV5KXLR61';

  // Только эти хосты отчитываются в свойство.
  var PRODUCTION_HOSTS = ['jetsonic.aero', 'www.jetsonic.aero'];

  // Пороги прокрутки, процент от высоты документа.
  var SCROLL_STEPS = [25, 50, 75, 90];

  // Потолок на section_view: страница из CMS может внезапно получить
  // полсотни секций, и без ограничения она зальёт свойство мусором.
  var MAX_SECTION_EVENTS = 20;

  var LS_OPTOUT = 'jetsonicGaOptOut';
  var LS_INTERNAL = 'jetsonicGaInternal';
  var LS_LANGUAGE = 'jetsonicLanguage'; // тот же ключ, что пишет app.js
  var SS_LEAD = 'jetsonicGaPendingLead';

  /* -------------------------------------------------------------- утилиты */

  var query = new URLSearchParams(location.search);

  function readStore(kind, key) {
    try { return window[kind].getItem(key); } catch (e) { return null; }
  }
  function writeStore(kind, key, value) {
    try { window[kind].setItem(key, value); } catch (e) {}
  }
  function dropStore(kind, key) {
    try { window[kind].removeItem(key); } catch (e) {}
  }
  function clean(text, limit) {
    return String(text == null ? '' : text).replace(/\s+/g, ' ').trim().slice(0, limit || 100);
  }

  /* ------------------------------------------------- отказ от учёта и гейт */

  // ?ga_optout=1 навсегда выключает этот браузер (телефоны сотрудников,
  // демо-ноутбуки). ?ga_optin=1 возвращает обратно.
  if (query.get('ga_optout') === '1') writeStore('localStorage', LS_OPTOUT, '1');
  if (query.get('ga_optin') === '1') dropStore('localStorage', LS_OPTOUT);

  // ?ga_internal=1 помечает устройство как внутреннее: события продолжают
  // уходить, но с traffic_type=internal, и фильтр в GA4 их отбрасывает.
  // Работает там, где фильтр по IP бесполезен — мобильный интернет, роуминг.
  if (query.get('ga_internal') === '1') writeStore('localStorage', LS_INTERNAL, '1');
  if (query.get('ga_external') === '1') dropStore('localStorage', LS_INTERNAL);

  var debugMode = query.get('ga_debug') === '1';
  var internalTraffic = readStore('localStorage', LS_INTERNAL) === '1';
  var optedOut = readStore('localStorage', LS_OPTOUT) === '1';
  var isProductionHost = PRODUCTION_HOSTS.indexOf(location.hostname) !== -1;

  // navigator.webdriver выставляют Playwright, Puppeteer и Selenium.
  // Мониторинг и парсеры не должны раздувать число пользователей.
  var automated = navigator.webdriver === true;

  if (optedOut || automated || (!isProductionHost && !debugMode)) {
    // Публичный хелпер оставляем живым, чтобы код страниц не падал.
    window.jetsonicTrack = function () {};
    return;
  }

  /* ------------------------------------------------------- запуск gtag.js */

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode v2. Аналитическое хранилище разрешено, рекламные сигналы
  // запрещены: сайт не крутит рекламу и не собирает рекламные аудитории.
  // Если появится баннер согласия — поставьте здесь analytics_storage:
  // 'denied' и вызывайте gtag('consent','update',{analytics_storage:
  // 'granted'}) после согласия; GA4 дошлёт накопленные события.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
    functionality_storage: 'granted',
    security_storage: 'granted'
  });

  gtag('js', new Date());

  /* --------------------------------------------------- контекст страницы */

  var path = location.pathname;

  // thank-you.html и 404.html несут чужой data-page, поэтому тип страницы
  // определяем по адресу, а не по атрибуту.
  var pageType = (function () {
    if (/\/thank-you(\.html)?$/.test(path)) return 'thank_you';
    if (/\/404(\.html)?$/.test(path)) return 'not_found';
    var declared = document.body && document.body.dataset ? document.body.dataset.page : '';
    return declared || 'other';
  })();

  // app.js применяет сохранённый язык тоже через defer, и порядок выполнения
  // не гарантирован. Читаем тот же ключ напрямую — так значение верное
  // независимо от того, кто отработал первым.
  var language = readStore('localStorage', LS_LANGUAGE) || document.documentElement.lang || 'en';

  var configParams = {
    send_page_view: true,
    content_group: pageType,
    page_type: pageType,
    page_language: language
  };
  if (debugMode) configParams.debug_mode = true;
  if (internalTraffic) configParams.traffic_type = 'internal';

  gtag('config', MEASUREMENT_ID, configParams);

  // Библиотека грузится после постановки команд в очередь — ровно так же,
  // как в официальном сниппете Google.
  var loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(loader);

  /* ------------------------------------------------------ отправка событий */

  var fired = Object.create(null);

  // Поднимается, когда форму отправил бот (заполнена ловушка). Обёртка над
  // fetch про ловушку не знает, а без этого флага боты, долбящие упавший
  // эндпоинт, надули бы `rfq_error` и сломали сравнение попыток с заявками.
  var lastSubmitWasBot = false;

  /**
   * track('event_name', {параметры}, {once: 'ключ'})
   * Ключ `once` гарантирует одну отправку на загрузку страницы.
   */
  function track(name, params, options) {
    var once = options && options.once;
    if (once) {
      if (fired[once]) return;
      fired[once] = true;
    }
    var payload = {};
    var source = params || {};
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) payload[key] = source[key];
    }
    payload.page_type = pageType;
    payload.page_language = language;
    if (internalTraffic) payload.traffic_type = 'internal';
    gtag('event', name, payload);
  }

  // Доступно из кода страниц и из блоков, добавленных через CMS.
  window.jetsonicTrack = track;

  /* --------------------------------------------------- глубина прокрутки */

  function initScrollDepth() {
    var pending = SCROLL_STEPS.slice();
    var scheduled = false;

    function measure() {
      scheduled = false;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      // Страница короче экрана не прокручивается. Отдать по ней 100%
      // означало бы утопить реальную глубину чтения длинных страниц.
      if (scrollable < 200) return;
      var percent = ((window.scrollY || doc.scrollTop || 0) / scrollable) * 100;
      while (pending.length && percent >= pending[0]) {
        var step = pending.shift();
        track('scroll_depth', { percent_scrolled: step }, { once: 'scroll_' + step });
      }
      if (!pending.length) window.removeEventListener('scroll', onScroll);
    }

    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(measure);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------- просмотр секций */

  // Атрибут id есть у считаных секций, поэтому имя выводим из заголовка:
  // «Why Dubai sourcing works» → `why_dubai_sourcing_works`. В отчёте это
  // читается, в отличие от `position_3`, и не требует правки вёрстки.
  function sectionName(section, index) {
    if (section.id) return section.id;
    var heading = section.querySelector('h1, h2, h3');
    if (!heading) return 'position_' + (index + 1);
    // Берём data-en, а не видимый текст: при арабской версии заголовок
    // переводится, и одна и та же секция получила бы два разных имени —
    // в отчёте она развалилась бы на две строки.
    var text = clean(heading.dataset.en || heading.textContent, 40);
    var slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return slug || ('position_' + (index + 1));
  }

  function initSectionViews() {
    if (!('IntersectionObserver' in window)) return;
    var sections = [].slice.call(document.querySelectorAll('main section')).slice(0, MAX_SECTION_EVENTS);
    if (!sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var index = sections.indexOf(entry.target);
        var id = sectionName(entry.target, index);
        track('section_view', {
          section_id: id,
          section_position: index + 1
        }, { once: 'section_' + id });
      });
    // Порог 0.2, а не 0.5: секция высотой в три экрана физически не может
    // показать половину себя, и с большим порогом не сработала бы никогда.
    }, { threshold: 0.2 });

    sections.forEach(function (section) { io.observe(section); });
  }

  /* ----------------------------------------------------- клики по ссылкам */

  // Подписи на сайте переводятся, поэтому в отчёт идёт канонический
  // английский вариант из data-en. Иначе одна и та же кнопка, нажатая в
  // арабской версии, встала бы в отчёте отдельной строкой.
  function labelOf(el) {
    if (el.dataset && el.dataset.en) return clean(el.dataset.en, 100);
    var translated = el.querySelector('[data-en]');
    if (translated && translated.dataset.en) return clean(translated.dataset.en, 100);
    return clean(el.textContent, 100) || clean(el.getAttribute('aria-label'), 100) || 'no_text';
  }

  function placementOf(el) {
    if (el.closest('.mobile-bottom-nav')) return 'mobile_nav';
    if (el.closest('.desktop-nav')) return 'header_nav';
    if (el.closest('.cta-band')) return 'cta_band';
    if (el.closest('.contact-card')) return 'contact_card';
    if (el.closest('form')) return 'form';
    if (el.closest('footer')) return 'footer';
    if (el.closest('header')) return 'header';
    if (el.closest('.hero')) return 'hero';
    return 'body';
  }

  function initLinkTracking() {
    // Capture-фаза: событие дойдёт до нас, даже если чей-то обработчик
    // ниже по дереву остановит всплытие.
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      var link = target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href') || '';
      var placement = placementOf(link);
      var label = labelOf(link);

      if (/^https?:\/\/(wa\.me|(api|web|chat)\.whatsapp\.com)/i.test(href)) {
        track('whatsapp_click', {
          contact_channel: 'whatsapp',
          link_placement: placement,
          link_text: label,
          link_url: clean(href, 100)
        });
        return;
      }
      if (/^tel:/i.test(href)) {
        track('phone_click', {
          contact_channel: 'phone',
          link_placement: placement,
          link_text: label
        });
        return;
      }
      if (/^mailto:/i.test(href)) {
        track('email_click', {
          contact_channel: 'email',
          link_placement: placement,
          link_text: label
        });
        return;
      }
      if (/^(#|javascript:)/i.test(href)) return;

      var url;
      try { url = new URL(href, location.href); } catch (e) { return; }

      if (url.origin !== location.origin) {
        track('outbound_click', {
          link_domain: url.hostname,
          link_url: clean(url.href, 100),
          link_placement: placement,
          link_text: label
        });
        return;
      }

      if (link.matches('.nav-cta, .footer-cta, .cta-band a, .button, a.primary')) {
        track('cta_click', {
          cta_text: label,
          cta_placement: placement,
          link_url: url.pathname + url.search
        });
      } else if (placement === 'mobile_nav' || placement === 'header_nav' || placement === 'footer') {
        track('nav_click', {
          nav_placement: placement,
          link_text: label,
          link_url: url.pathname
        });
      }
    }, true);
  }

  /* -------------------------------------------------- переключатель языка */

  function initLanguageToggle() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      var button = target.closest('.lang-toggle');
      if (!button) return;
      // Обработчик из app.js ещё не отработал, поэтому dataset.lang здесь —
      // язык «до» переключения.
      var from = button.dataset.lang || language;
      var to = from === 'en' ? 'ar' : 'en';
      track('language_switch', { language_from: from, language_to: to });
      language = to;
    }, true);
  }

  /* ------------------------------------------------------------ форма RFQ */

  function initRfqForm() {
    var form = document.querySelector('form[name="jetsonic-rfq"]');
    if (!form) return;

    var started = false;
    var submitted = false;
    var lastField = '';

    function honeypotFilled() {
      var trap = form.querySelector('[name="bot-field"]');
      return !!(trap && String(trap.value || '').trim());
    }

    form.addEventListener('focusin', function (event) {
      var field = event.target;
      if (!field || !field.name || field.name === 'bot-field') return;
      lastField = field.name;
      if (started) return;
      started = true;
      track('form_start', { form_name: 'jetsonic_rfq' }, { once: 'form_start' });
    });

    var attachment = form.querySelector('input[type="file"]');
    if (attachment) {
      attachment.addEventListener('change', function () {
        if (!attachment.files || !attachment.files.length) return;
        var file = attachment.files[0];
        track('rfq_attachment_added', {
          file_extension: clean((file.name.split('.').pop() || 'none').toLowerCase(), 16),
          file_size_kb: Math.round(file.size / 1024)
        });
      });
    }

    form.addEventListener('submit', function () {
      lastSubmitWasBot = honeypotFilled();
      if (lastSubmitWasBot) return; // бот — молчим
      submitted = true;

      var data = new FormData(form);
      var file = data.get('attachment');
      // Ни имени, ни почты, ни телефона: персональные данные в GA4
      // отправлять запрещено правилами Google, за это блокируют аккаунт.
      var details = {
        form_name: 'jetsonic_rfq',
        request_type: clean(data.get('request_type'), 60) || 'unspecified',
        urgency: clean(data.get('urgency'), 60) || 'unspecified',
        aircraft_type: clean(data.get('aircraft_type'), 60) || 'unspecified',
        has_attachment: (file && file.size > 0) ? 'yes' : 'no',
        has_alternate_pn: clean(data.get('alternate_part_number'), 1) ? 'yes' : 'no',
        entry_page: clean(path, 100)
      };

      track('rfq_submit', details);

      // Передаём детали на /thank-you.html: `generate_lead` обязан сработать
      // только после того, как API реально принял заявку, а app.js уводит
      // туда именно в этот момент.
      writeStore('sessionStorage', SS_LEAD, JSON.stringify(details));
    }, true);

    // Уход со страницы с начатой, но не отправленной формой — отдельный
    // сигнал: показывает, на каком поле люди сдаются.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'hidden') return;
      if (!started || submitted) return;
      track('form_abandon', {
        form_name: 'jetsonic_rfq',
        last_field: lastField || 'none'
      }, { once: 'form_abandon' });
    });
  }

  /* ------------------------------------------- наблюдение за ответом API */

  function initLeadApiWatch() {
    if (typeof window.fetch !== 'function') return;
    var nativeFetch = window.fetch;

    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      var isLead = method === 'POST' && /\/leads(\?|$)/.test(url);
      var promise = nativeFetch.apply(this, arguments);
      if (!isLead) return promise;

      return promise.then(function (response) {
        if (!response.ok && !lastSubmitWasBot) {
          track('rfq_error', { error_type: 'api_status', error_status: response.status });
          // Заявку не приняли — снимаем заготовку, иначе на /thank-you.html
          // родился бы лид, которого не было.
          dropStore('sessionStorage', SS_LEAD);
        }
        return response;
      }, function (error) {
        if (!lastSubmitWasBot) {
          track('rfq_error', {
            error_type: 'network',
            error_status: 0,
            error_message: clean(error && error.message, 100) || 'unknown'
          });
        }
        dropStore('sessionStorage', SS_LEAD);
        throw error;
      });
    };
  }

  /* ---------------------------------------------- заявка: страница успеха */

  function initThankYou() {
    if (pageType !== 'thank_you') return;
    var raw = readStore('sessionStorage', SS_LEAD);
    // Пусто — значит адрес открыли напрямую: закладка, бот, пересланная
    // ссылка. Засчитать это заявкой означало бы выдумать её.
    if (!raw) return;
    dropStore('sessionStorage', SS_LEAD); // одна отправка, переживает F5

    var details;
    try { details = JSON.parse(raw); } catch (e) { details = { form_name: 'jetsonic_rfq' }; }
    track('generate_lead', details, { once: 'generate_lead' });
  }

  /* --------------------------------------------------------- страница 404 */

  function initNotFound() {
    if (pageType !== 'not_found') return;
    // nginx отдаёт 404.html по запрошенному адресу, поэтому pathname здесь —
    // именно тот путь, которого не существует.
    track('page_not_found', {
      not_found_path: clean(path + location.search, 100),
      not_found_referrer: clean(document.referrer, 100) || 'direct'
    }, { once: 'not_found' });
  }

  /* ------------------------------------------------------------------ старт */

  initScrollDepth();
  initSectionViews();
  initLinkTracking();
  initLanguageToggle();
  initLeadApiWatch();
  initRfqForm();
  initThankYou();
  initNotFound();
})();
