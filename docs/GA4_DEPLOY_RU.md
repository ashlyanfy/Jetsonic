# Деплой аналитики на jetsonic.aero

Что изменилось в репозитории и как это выкатить.

---

## 1. Изменённые файлы

| Файл | Что сделано |
|---|---|
| `frontend/analytics.js` | **Новый.** Весь слой измерений GA4. |
| `frontend/index.html` и ещё 8 страниц | Подключение `<script src="/analytics.js" defer>` перед `</head>`. |
| `frontend/service-worker.js` | `/analytics.js` добавлен в предзагрузку; запросы к доменам Google проходят мимо кеша. |
| `frontend/nginx.conf` | Заголовок кеширования для `/analytics.js` — час с перепроверкой. |
| `frontend/netlify.toml` | Тот же заголовок, чтобы конфигурации не разъезжались. |
| `docs/GA4_SETUP_RU.md` | **Новый.** Ручная настройка интерфейса GA4. |
| `docs/GA4_EVENTS_RU.md` | **Новый.** Справочник событий и параметров. |

`offline.html` намеренно **не** подключает аналитику: эта страница
показывается, когда сети нет, и отправлять с неё нечего.

Правки в `app.js` не потребовались — измерения полностью отделены от логики
сайта. Единственная точка соприкосновения: обёртка над `fetch` следит за
ответом `/api/v1/leads`, не вмешиваясь в него.

---

## 2. Проверка перед выкаткой

```bash
node --check frontend/analytics.js
```

Должно вывести пустую строку — синтаксис в порядке.

Дальше поднять сайт локально и пройти сценарии.

> Команды ниже — для **Windows PowerShell 5.1**, той оболочки, что стоит на
> рабочей машине. В ней нет `&&`, `head`, а `curl` — это псевдоним для
> `Invoke-WebRequest`, поэтому настоящая утилита вызывается как `curl.exe`.
> Каждую команду выполнять отдельной строкой.

```powershell
cd D:\Jetsonic\frontend
```

```powershell
npx --yes serve -l 4173 .
```

Открыть `http://localhost:4173/?ga_debug=1`. Параметр обязателен: без него код
на `localhost` молчит намеренно, чтобы разработка не попадала в статистику.

В консоли браузера (F12 → Console) — не в PowerShell — посмотреть, что уходит:

```js
dataLayer.filter(a => a[0] === 'event').map(a => [a[1], a[2]])
```

Полный чек-лист приёмки — в [GA4_SETUP_RU.md](GA4_SETUP_RU.md), раздел 11.

---

## 3. Выкатка

Боевой сайт живёт на Hetzner (`2.28.10.92`) в `/opt/jetsonic-landing`,
контейнер `landing-site` — nginx со статикой. Удалённый репозиторий уже
настроен:

```
hetzner  jetsonic:/opt/jetsonic-landing.git
origin   https://github.com/ashlyanfy/Jetsonic.git
```

### Основной путь — push

```powershell
cd D:\Jetsonic
```

```powershell
git add frontend docs
```

```powershell
git commit -m "Google Analytics 4: измерение обращений, заявок и чтения страниц"
```

```powershell
git push hetzner main
```

Дальше отправить копию на GitHub:

```powershell
git push origin main
```

### Если хук не пересобрал контейнер

Проверить, обновился ли сайт:

```powershell
curl.exe -sI https://jetsonic.aero/analytics.js | Select-Object -First 1
```

Ответ `HTTP/2 200` — всё выкатилось, дальше раздел 4. Если `404` — собрать
вручную. `BUILD_ID` подставляется в имя кеша service worker, поэтому он должен
быть новым при каждой сборке.

Кавычки здесь **одинарные**: тогда PowerShell отдаёт строку в ssh дословно, а
`&&` и `$(date +%s)` выполняет уже удалённая оболочка, где они работают.

```powershell
ssh root@2.28.10.92 'cd /opt/jetsonic-landing && git pull && BUILD_ID=ga4-$(date +%s) docker compose -f docker-compose.prod.yml up -d --build site'
```

Посмотреть, что контейнер поднялся:

```powershell
ssh root@2.28.10.92 'cd /opt/jetsonic-landing && docker compose -f docker-compose.prod.yml ps site'
```

---

## 4. Проверка после выкатки

Файл отдаётся и не закеширован навсегда:

```powershell
curl.exe -sI https://jetsonic.aero/analytics.js | Select-String -Pattern "^HTTP","cache-control"
```

Ожидается `200` и `Cache-Control: public, max-age=3600, must-revalidate`.

Скрипт подключён на всех страницах:

```powershell
foreach ($p in '/','/parts/','/services/','/aog/','/quality/','/about/','/contact/','/thank-you.html') { $n = (curl.exe -s "https://jetsonic.aero$p" | Select-String 'analytics.js').Count; "{0,-18} {1}" -f $p, $n }
```

Напротив каждого адреса должна стоять `2` — комментарий плюс сам тег.

Затем открыть боевой сайт в отладочном режиме:

```
https://jetsonic.aero/?ga_debug=1
```

и в GA4 открыть **Администратор → DebugView**. События должны появиться в
течение нескольких секунд.

> ⚠️ Сразу после выкатки пройдите по своим устройствам с `?ga_internal=1`
> (раздел 5.2 в [GA4_SETUP_RU.md](GA4_SETUP_RU.md)), иначе первые дни
> статистики будут состоять в основном из вашей же команды, проверяющей сайт.

---

## 5. Откат

Аналитика ничего не ломает в работе сайта: она не трогает форму, навигацию и
контент. Но если понадобится снять быстро — достаточно убрать один файл:

```powershell
ssh root@2.28.10.92 'docker exec landing-site rm -f /usr/share/nginx/html/analytics.js'
```

Теги на страницах останутся, получат `404` и молча ничего не сделают. Это
временная мера до следующей сборки — она вернёт файл на место.

Полный откат — обычным способом:

```powershell
git revert HEAD
```

```powershell
git push hetzner main
```

---

## 6. Известное ограничение

У постоянных посетителей service worker уже установлен и хранит старый список
файлов. Он работает по схеме «сначала сеть, кеш только при отказе», а HTML
отдаётся с `no-store`, поэтому новую страницу и новый `/analytics.js` они
получат при первом же заходе после выкатки.

Отдельного действия это не требует, но объясняет, почему в первые часы число
событий будет ниже числа просмотров: часть посетителей ещё дочитывает страницы,
загруженные до деплоя.
