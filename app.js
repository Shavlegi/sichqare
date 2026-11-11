/* სიჩქარე v3 — ინტერნეტის სიჩქარის ტესტი.
   იზომება Cloudflare-ის უახლოესი სერვერის (speed.cloudflare.com) წინააღმდეგ.
   საჯარო endpoint-ები, გასაღები არ სჭირდება.
   v3: მონაცემების ლიმიტი (მომხმარებლის არჩევანი), შედეგის სურათად გაზიარება,
   ისტორიის გრაფიკი, ქსელის ნიშანი (Wi-Fi/მობილური), KA/EN/RU, AdSense გვერდები. */
'use strict';

/* ---------------- i18n ---------------- */
var STRINGS = {
  ka: {
    subtitle: 'ინტერნეტის სიჩქარის ტესტი',
    statusIdle: 'დააჭირე ღილაკს და გაიგე შენი ინტერნეტის სიჩქარე',
    statusPing: 'Ping იზომება…',
    statusDown: 'ჩამოტვირთვა იზომება…',
    statusUp: 'ატვირთვა იზომება…',
    statusReady: 'მზადაა',
    statusStopped: 'ტესტი შეჩერებულია',
    statusFailed: 'ტესტი ვერ ჩატარდა — შეამოწმე ინტერნეტი და სცადე თავიდან.',
    statusCapped: 'ლიმიტი მიღწეულია — შედეგი მიახლოებითია',
    modeQuick: 'სწრაფი · ~5 წამი',
    modeFull: 'სრული · ~10 წამი',
    start: 'ტესტის დაწყება',
    stop: 'გაჩერება',
    retest: 'თავიდან ტესტი',
    downLabel: '⬇ ჩამოტვირთვა',
    upLabel: '⬆ ატვირთვა',
    copyBtn: 'შედეგის კოპირება',
    copied: 'კოპირებულია ✓',
    shareImgBtn: 'სურათად გაზიარება',
    historyTitle: 'ბოლო ტესტები',
    clearHistory: 'ისტორიის წაშლა',
    aboutTitle: 'როგორ მუშაობს?',
    aboutP1: 'ტესტი შენი ბრაუზერიდან იზომება Cloudflare-ის უახლოესი სერვერის წინააღმდეგ: ჩამოტვირთვისას ფაილი ჩამოდის და დრო ითვლება, ატვირთვისას — პირიქით. Ping არის დრო, რაც სერვერის პასუხს სჭირდება.',
    aboutP2: 'შედეგზე მოქმედებს Wi-Fi სიგნალი, ტელეფონი და ქსელის დატვირთვა. ზუსტი შედეგისთვის ტესტი რამდენჯერმე გაუშვი და სხვა პროგრამები დახურე.',
    dataLimitLabel: 'მონაცემების ლიმიტი',
    unlimited: 'ულიმიტო',
    footer: 'სიჩქარე · v3 · უფასო ტესტი · მონაცემები არსად ინახება',
    dataUsed: 'მოხმარებული მონაცემები: ~',
    limitNote: 'პატარა ლიმიტი = ნაკლებად ზუსტი შედეგი',
    useQuick: 'სწრაფი ტესტი ~40 MB-ს მოიხმარს',
    useFull: 'სრული ტესტი ~100+ MB-ს მოიხმარს',
    serverLabel: 'სერვერი: ',
    providerLabel: 'პროვაიდერი: ',
    aboutLink: 'შესახებ',
    privacyLink: 'კონფიდენციალურობა',
    limitInfo: 'ლიმიტი',
    downVerdict: [
      'შესანიშნავი სიჩქარე — 4K ვიდეო, დიდი ფაილები, ყველაფერი თავისუფლად.',
      'კარგი სიჩქარე — 4K ვიდეო და ვიდეოზარები უპრობლემოდ.',
      'საშუალო სიჩქარე — Full HD ვიდეო კარგად იმუშავებს, 4K შეიძლება გაჭედოს.',
      'ნელი სიჩქარე — YouTube 720p-ზე, დიდი ფაილები ნელა ჩაიტვირთება.',
      'ძალიან ნელი — მხოლოდ მიმოწერა და მსუბუქი გვერდები.'
    ],
    pingVerdict: [
      'Ping დაბალია — ონლაინ თამაშებისთვის კარგია.',
      'Ping საშუალოა — თამაშში მცირე დაყოვნება იგრძნობა.',
      'Ping მაღალია — თამაშები და ვიდეოზარები გაჭედავს.'
    ]
  },
  en: {
    subtitle: 'Internet speed test',
    statusIdle: 'Tap the button to test your internet speed',
    statusPing: 'Measuring ping…',
    statusDown: 'Measuring download…',
    statusUp: 'Measuring upload…',
    statusReady: 'Done',
    statusStopped: 'Test stopped',
    statusFailed: 'Test failed — check your connection and try again.',
    statusCapped: 'Data limit reached — result is approximate',
    modeQuick: 'Quick · ~5 sec',
    modeFull: 'Full · ~10 sec',
    start: 'Start test',
    stop: 'Stop',
    retest: 'Test again',
    downLabel: '⬇ Download',
    upLabel: '⬆ Upload',
    copyBtn: 'Copy result',
    copied: 'Copied ✓',
    shareImgBtn: 'Share as image',
    historyTitle: 'Recent tests',
    clearHistory: 'Clear history',
    aboutTitle: 'How it works?',
    aboutP1: 'The test runs from your browser against the nearest Cloudflare server: downloading a file and timing it, then the same in reverse for upload. Ping is the time the server takes to answer.',
    aboutP2: 'Results depend on your Wi-Fi signal, your phone and network load. For an accurate result, run the test a few times and close other apps.',
    dataLimitLabel: 'Data limit',
    unlimited: 'Unlimited',
    footer: 'Speed · v3 · Free test · No data stored',
    dataUsed: 'Data used: ~',
    limitNote: 'A small limit means a less accurate result',
    useQuick: 'Quick test uses ~40 MB',
    useFull: 'Full test uses ~100+ MB',
    serverLabel: 'Server: ',
    providerLabel: 'Provider: ',
    aboutLink: 'About',
    privacyLink: 'Privacy',
    limitInfo: 'Limit',
    downVerdict: [
      'Excellent speed — 4K video, large files, everything with ease.',
      'Good speed — 4K video and video calls without issues.',
      'Average speed — Full HD video will work fine, 4K may buffer.',
      'Slow speed — YouTube at 720p; large files will load slowly.',
      'Very slow — only messaging and light pages.'
    ],
    pingVerdict: [
      'Low ping — good for online gaming.',
      'Average ping — slight delay in games.',
      'High ping — games and video calls will lag.'
    ]
  },
  ru: {
    subtitle: 'Тест скорости интернета',
    statusIdle: 'Нажмите кнопку, чтобы проверить скорость интернета',
    statusPing: 'Измерение пинга…',
    statusDown: 'Измерение загрузки…',
    statusUp: 'Измерение отдачи…',
    statusReady: 'Готово',
    statusStopped: 'Тест остановлен',
    statusFailed: 'Тест не удался — проверьте соединение и попробуйте снова.',
    statusCapped: 'Лимит исчерпан — результат приблизительный',
    modeQuick: 'Быстрый · ~5 сек',
    modeFull: 'Полный · ~10 сек',
    start: 'Начать тест',
    stop: 'Стоп',
    retest: 'Ещё раз',
    downLabel: '⬇ Загрузка',
    upLabel: '⬆ Отдача',
    copyBtn: 'Скопировать результат',
    copied: 'Скопировано ✓',
    shareImgBtn: 'Поделиться картинкой',
    historyTitle: 'Последние тесты',
    clearHistory: 'Очистить историю',
    aboutTitle: 'Как это работает?',
    aboutP1: 'Тест выполняется из вашего браузера к ближайшему серверу Cloudflare: скачивается файл и замеряется время, затем то же самое наоборот для отдачи. Пинг — время ответа сервера.',
    aboutP2: 'На результат влияют сигнал Wi-Fi, телефон и загрузка сети. Для точности запустите тест несколько раз и закройте другие приложения.',
    dataLimitLabel: 'Лимит трафика',
    unlimited: 'Без лимита',
    footer: 'Скорость · v3 · Бесплатный тест · Данные не хранятся',
    dataUsed: 'Потрачено трафика: ~',
    limitNote: 'Маленький лимит — менее точный результат',
    useQuick: 'Быстрый тест потратит ~40 МБ',
    useFull: 'Полный тест потратит ~100+ МБ',
    serverLabel: 'Сервер: ',
    providerLabel: 'Провайдер: ',
    aboutLink: 'О сайте',
    privacyLink: 'Конфиденциальность',
    limitInfo: 'Лимит',
    downVerdict: [
      'Отличная скорость — 4K-видео, большие файлы, всё без проблем.',
      'Хорошая скорость — 4K-видео и видеозвонки без проблем.',
      'Средняя скорость — Full HD будет работать хорошо, 4K может тормозить.',
      'Медленная скорость — YouTube в 720p, большие файлы грузятся медленно.',
      'Очень медленно — только переписка и лёгкие страницы.'
    ],
    pingVerdict: [
      'Низкий пинг — хорошо для онлайн-игр.',
      'Средний пинг — в играх будет заметна задержка.',
      'Высокий пинг — игры и видеозвонки будут тормозить.'
    ]
  }
};

var lang = 'ka';
try { lang = localStorage.getItem('sichqare-lang') || 'ka'; } catch (e) {}
if (!STRINGS[lang]) lang = 'ka';
function t(key) { return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.ka[key] || key; }
function applyI18n() {
  document.documentElement.lang = lang;
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) {
    var k = els[i].getAttribute('data-i18n');
    if (t(k) !== k) els[i].textContent = t(k);
  }
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });
  updateHint();
}
function setLang(l) {
  if (!STRINGS[l]) return;
  lang = l;
  try { localStorage.setItem('sichqare-lang', l); } catch (e) {}
  applyI18n();
  renderHistory();
}
document.querySelectorAll('.lang-btn').forEach(function (b) {
  b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
});

/* ---------------- ძირითადი ---------------- */
var DOWN_BASE = 'https://speed.cloudflare.com/__down';
var UP_URL = 'https://speed.cloudflare.com/__up';
var DOWNLOAD_CHUNK = 25000000; /* __down 100 MB-ზე 403-ს აბრუნებს */

var MODES = {
  quick: { downSec: 5, upSec: 5, downStreams: 2, upStreams: 2 },
  full: { downSec: 10, upSec: 10, downStreams: 4, upStreams: 3 }
};
var mode = 'full';

var $ = function (id) { return document.getElementById(id); };
var bigSpeed = $('bigSpeed'), statusText = $('statusText'), verdictEl = $('verdict'),
    startBtn = $('startBtn'), resDown = $('resDown'), resUp = $('resUp'), resPing = $('resPing'),
    resDownMB = $('resDownMB'), resUpMB = $('resUpMB'), resJitter = $('resJitter'),
    serverInfo = $('serverInfo'), netInfo = $('netInfo'), shareBtn = $('shareBtn'),
    shareImgBtn = $('shareImgBtn'), hintText = $('hintText'),
    graphCanvas = $('graph'), historyGraph = $('historyGraph'),
    historySection = $('historySection'), historyList = $('historyList');

var running = false, stopFlag = false, capped = false, aborters = [], activeXhrs = [];
var lastResult = null, usedBytes = 0;
var net = { ip: null, asn: null, isp: null, city: null, country: null, server: null };
var graphSamples = []; /* {t, v, phase} */

/* ---- მონაცემების ლიმიტი (მომხმარებლის არჩევანი) ---- */
var LIMIT_KEY = 'sichqare-datalimit';
var limitMB = '100';
try { limitMB = localStorage.getItem(LIMIT_KEY) || '100'; } catch (e) {}
function dataCapBytes() {
  return limitMB === 'inf' ? Infinity : parseInt(limitMB, 10) * 1e6;
}
function phaseCapBytes() { return dataCapBytes() / 2; } /* ლიმიტი ორად იყოფა: ჩამოტვირთვა / ატვირთვა */
function updateHint() {
  var use = mode === 'quick' ? t('useQuick') : t('useFull');
  if (limitMB === 'inf') hintText.textContent = t('limitInfo') + ': ' + t('unlimited') + ' · ' + use;
  else hintText.textContent = t('limitInfo') + ': ' + limitMB + ' MB · ' + t('limitNote');
}
function setLimit(v) {
  limitMB = v;
  try { localStorage.setItem(LIMIT_KEY, v); } catch (e) {}
  document.querySelectorAll('.limit-btn').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-limit') === v);
  });
  updateHint();
}
document.querySelectorAll('.limit-btn').forEach(function (b) {
  b.addEventListener('click', function () { if (!running) setLimit(b.getAttribute('data-limit')); });
});

function fmt(n, d) { return n.toFixed(d === undefined ? 1 : d); }
function mbps(bytes, seconds) { return (bytes * 8) / seconds / 1e6; }
function mbs(bytes, seconds) { return bytes / seconds / 1e6; }
function setStatus(txt) { statusText.textContent = txt; }
function setBig(v) { bigSpeed.textContent = v; }

/* ---- შეფასება: რას ჰყოფნის სიჩქარე ---- */
function verdictFor(down, ping) {
  var dv = STRINGS[lang].downVerdict, pv = STRINGS[lang].pingVerdict;
  var d = down >= 100 ? dv[0] : down >= 50 ? dv[1] : down >= 25 ? dv[2] : down >= 10 ? dv[3] : dv[4];
  var p = ping <= 30 ? pv[0] : ping <= 80 ? pv[1] : pv[2];
  return d + ' ' + p;
}
function rateClass(v) { return v >= 50 ? 'good' : (v >= 10 ? 'mid' : 'bad'); }
function colorBig(v) {
  bigSpeed.classList.remove('good', 'mid', 'bad');
  if (v != null && isFinite(v)) bigSpeed.classList.add(rateClass(v));
}
function rateColor(v) { return v >= 50 ? '#3ddc84' : (v >= 10 ? '#ffc53d' : '#ff5252'); }

/* ---- ცოცხალი გრაფიკი ---- */
function drawGraph() {
  var ctx = graphCanvas.getContext('2d');
  var W = graphCanvas.width, H = graphCanvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#232323'; ctx.lineWidth = 1;
  for (var g = 1; g < 4; g++) {
    ctx.beginPath(); ctx.moveTo(0, H * g / 4); ctx.lineTo(W, H * g / 4); ctx.stroke();
  }
  if (!graphSamples.length) return;
  var maxV = 10, maxT = 1;
  graphSamples.forEach(function (s) { if (s.v > maxV) maxV = s.v; if (s.t > maxT) maxT = s.t; });
  function line(phase, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    var started = false;
    graphSamples.forEach(function (s) {
      if (s.phase !== phase) return;
      var x = (s.t / maxT) * (W - 8) + 4;
      var y = H - 6 - (s.v / maxV) * (H - 14);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  line('down', '#4d8dff');
  line('up', '#3ddc84');
}
function graphPush(time, v, phase) {
  graphSamples.push({ t: time, v: v, phase: phase });
  if (graphSamples.length > 400) graphSamples.shift();
  drawGraph();
}

/* ---- ისტორია + ისტორიის გრაფიკი + ქსელის ნიშანი ---- */
var HISTORY_KEY = 'sichqare-history-v1';
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20))); } catch (e) {}
}
function connTag() {
  var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return '';
  if (c.type === 'wifi') return 'Wi-Fi';
  if (c.type === 'cellular') return lang === 'ka' ? 'მობილური' : lang === 'ru' ? 'Мобильный' : 'Mobile';
  if (c.effectiveType) return String(c.effectiveType).toUpperCase();
  return '';
}
function drawHistoryGraph() {
  var ctx = historyGraph.getContext('2d');
  var W = historyGraph.width, H = historyGraph.height;
  ctx.clearRect(0, 0, W, H);
  var h = loadHistory().slice().reverse();
  if (h.length < 2) { historyGraph.style.display = 'none'; return; }
  historyGraph.style.display = '';
  ctx.strokeStyle = '#232323'; ctx.lineWidth = 1;
  for (var g = 1; g < 4; g++) {
    ctx.beginPath(); ctx.moveTo(0, H * g / 4); ctx.lineTo(W, H * g / 4); ctx.stroke();
  }
  var maxV = 10;
  h.forEach(function (r) { if (r.down > maxV) maxV = r.down; if (r.up > maxV) maxV = r.up; });
  function line(key, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    h.forEach(function (r, i) {
      var x = (i / (h.length - 1)) * (W - 8) + 4;
      var y = H - 6 - ((r[key] || 0) / maxV) * (H - 14);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  line('down', '#4d8dff');
  line('up', '#3ddc84');
}
function renderHistory() {
  var h = loadHistory();
  historySection.hidden = !h.length;
  historyList.innerHTML = '';
  h.forEach(function (r) {
    var li = document.createElement('li');
    var d = new Date(r.t);
    var loc = lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-GB';
    var when = d.toLocaleDateString(loc, { day: 'numeric', month: 'short' }) +
      ', ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    if (r.conn) when += ' · ' + r.conn;
    var vals = '↓ ' + fmt(r.down) + ' · ↑ ' + fmt(r.up) + ' · ' + fmt(r.ping, 0) + ' ms';
    var w = document.createElement('span'); w.className = 'when'; w.textContent = when;
    var v = document.createElement('span'); v.textContent = vals;
    li.appendChild(v); li.appendChild(w);
    historyList.appendChild(li);
  });
  drawHistoryGraph();
}
function addHistory(r) {
  var h = loadHistory();
  h.unshift({ t: Date.now(), down: r.down, up: r.up, ping: r.ping, conn: connTag() });
  saveHistory(h);
  renderHistory();
}
$('clearHistory').addEventListener('click', function () {
  saveHistory([]);
  renderHistory();
});

/* ---- ქსელის ინფო: IP / პროვაიდერი / ქალაქი ---- */
function renderNet() {
  var parts = [];
  if (net.ip) parts.push('IP: ' + net.ip);
  if (net.isp) parts.push(t('providerLabel') + net.isp);
  else if (net.asn) parts.push(net.asn);
  if (net.city) parts.push(net.city + (net.country ? ', ' + net.country : ''));
  netInfo.textContent = parts.join(' · ');
  if (net.server) serverInfo.textContent = t('serverLabel') + net.server;
}
function captureNet(res) {
  if (!res.headers) return;
  var g = function (a, b) { return res.headers.get(a) || (b ? res.headers.get(b) : null); };
  if (!net.ip) net.ip = g('cf-meta-ip');
  if (!net.asn) net.asn = g('cf-meta-asn');
  if (!net.city) net.city = g('cf-meta-city', 'city');
  if (!net.country) net.country = g('cf-meta-country', 'country');
  var colo = g('cf-meta-colo', 'colo');
  if (!net.server && (net.city || colo)) net.server = [net.city, net.country].filter(Boolean).join(', ') || colo;
  renderNet();
  if (net.ip && !net.isp) fetchIsp(net.ip);
}
function fetchIsp(ip) {
  var ctrl = new AbortController();
  var to = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 4000);
  fetch('https://ip-api.com/json/' + encodeURIComponent(ip) + '?fields=status,isp', { signal: ctrl.signal })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      clearTimeout(to);
      if (j && j.status === 'success' && j.isp) { net.isp = j.isp; renderNet(); }
    })
    .catch(function () { clearTimeout(to); });
}

/* ---- Ping ---- */
async function measurePing() {
  try { await fetch(DOWN_BASE + '?bytes=0', { cache: 'no-store' }); } catch (e) {}
  var samples = [];
  for (var i = 0; i < 5; i++) {
    if (stopFlag) break;
    var t0 = performance.now();
    await fetch(DOWN_BASE + '?bytes=0', { cache: 'no-store' });
    samples.push(performance.now() - t0);
  }
  if (!samples.length) throw new Error('ping failed');
  var ping = Math.min.apply(null, samples);
  var diffs = 0;
  for (var j = 1; j < samples.length; j++) diffs += Math.abs(samples[j] - samples[j - 1]);
  var jitter = samples.length > 1 ? diffs / (samples.length - 1) : 0;
  return { ping: ping, jitter: jitter };
}

/* ---- Download (ლიმიტით) ---- */
async function downloadStream(url, signal, counter, deadline, cap) {
  while (performance.now() < deadline && !stopFlag && counter.bytes < cap) {
    var res;
    try {
      res = await fetch(url, { cache: 'no-store', signal: signal });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      throw err;
    }
    if (!res.ok) throw new Error('download failed: ' + res.status);
    captureNet(res);
    var reader = res.body.getReader();
    try {
      for (;;) {
        var r = await reader.read();
        if (r.done) break;
        counter.bytes += r.value.byteLength;
        if (counter.bytes >= cap) { capped = true; try { await reader.cancel(); } catch (e) {} break; }
        if (performance.now() >= deadline) { try { await reader.cancel(); } catch (e) {} break; }
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      throw err;
    }
  }
}

async function measureDownload(onTick) {
  var cfg = MODES[mode];
  var cap = phaseCapBytes();
  var counter = { bytes: 0 };
  var ctrl = new AbortController();
  aborters.push(ctrl);
  var start = performance.now();
  var deadline = start + cfg.downSec * 1000;
  var timer = setInterval(function () {
    var elapsed = (performance.now() - start) / 1000;
    if (elapsed > 0.3) {
      var v = mbps(counter.bytes, elapsed);
      onTick(v);
      graphPush(elapsed, v, 'down');
      if (counter.bytes >= cap) { capped = true; ctrl.abort(); }
    }
  }, 200);
  var streams = [];
  for (var i = 0; i < cfg.downStreams; i++) {
    streams.push(downloadStream(DOWN_BASE + '?bytes=' + DOWNLOAD_CHUNK, ctrl.signal, counter, deadline, cap));
  }
  var stopTimer = setTimeout(function () { ctrl.abort(); }, cfg.downSec * 1000 + 500);
  try {
    await Promise.all(streams);
  } finally {
    clearTimeout(stopTimer);
    clearInterval(timer);
  }
  var seconds = (performance.now() - start) / 1000;
  usedBytes += counter.bytes;
  return { speed: mbps(counter.bytes, seconds) };
}

/* ---- Upload (XHR progress, ლიმიტით) ---- */
var upBlob = null;
function getUpData() {
  if (upBlob) return upBlob;
  /* crypto.getRandomValues ერთ ზარში მაქსიმუმ 65,536 ბაიტს იძლევა */
  var size = 10 * 1024 * 1024;
  var buf = new Uint8Array(size);
  var CHUNK = 65536;
  for (var off = 0; off < size; off += CHUNK) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + CHUNK, size)));
  }
  upBlob = new Blob([buf]);
  return upBlob;
}

function uploadStream(counter, ms, cap) {
  return new Promise(function (resolve) {
    var done = false;
    var counted = 0;
    var data = getUpData();
    var total = data.size;
    var finish = function (ok) { if (!done) { done = true; resolve(ok); } };
    var xhr = new XMLHttpRequest();
    activeXhrs.push(xhr);
    xhr.open('POST', UP_URL, true);
    xhr.upload.onprogress = function (e) {
      if (e.loaded > counted) { counter.bytes += (e.loaded - counted); counted = e.loaded; }
      if (counter.bytes >= cap) { capped = true; try { xhr.abort(); } catch (e2) {} }
    };
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300 && counted < total) {
        counter.bytes += (total - counted); counted = total;
      }
      finish(xhr.status >= 200 && xhr.status < 300);
    };
    xhr.onerror = function () { finish(false); };
    xhr.onabort = function () { finish(true); };
    try { xhr.send(data); } catch (e) { finish(false); return; }
    setTimeout(function () { try { xhr.abort(); } catch (e) {} finish(true); }, ms);
  });
}

async function measureUpload(onTick) {
  var cfg = MODES[mode];
  var cap = phaseCapBytes();
  var counter = { bytes: 0 };
  var start = performance.now();
  var timer = setInterval(function () {
    var elapsed = (performance.now() - start) / 1000;
    if (elapsed > 0.3) {
      var v = mbps(counter.bytes, elapsed);
      onTick(v);
      graphPush(elapsed, v, 'up');
      if (counter.bytes >= cap) {
        capped = true;
        activeXhrs.forEach(function (x) { try { x.abort(); } catch (e) {} });
      }
    }
  }, 200);
  var streams = [];
  for (var i = 0; i < cfg.upStreams; i++) {
    streams.push(uploadStream(counter, cfg.upSec * 1000, cap));
  }
  await Promise.all(streams);
  clearInterval(timer);
  var seconds = (performance.now() - start) / 1000;
  usedBytes += counter.bytes;
  return { speed: mbps(counter.bytes, seconds) };
}

/* ---- რეჟიმის არჩევა ---- */
function setMode(m) {
  mode = m;
  $('modeQuick').classList.toggle('active', m === 'quick');
  $('modeFull').classList.toggle('active', m === 'full');
  updateHint();
}
$('modeQuick').addEventListener('click', function () { if (!running) setMode('quick'); });
$('modeFull').addEventListener('click', function () { if (!running) setMode('full'); });

/* ---- მთავარი პროცესი ---- */
async function runTest() {
  if (running) return;
  running = true; stopFlag = false; capped = false; aborters = []; activeXhrs = [];
  usedBytes = 0; lastResult = null;
  graphSamples = []; drawGraph();
  colorBig(null);
  startBtn.textContent = t('stop');
  startBtn.classList.add('stop');
  shareBtn.hidden = true; shareImgBtn.hidden = true;
  verdictEl.textContent = '';
  resDown.textContent = '—'; resUp.textContent = '—'; resPing.textContent = '—';
  resDownMB.textContent = ''; resUpMB.textContent = ''; resJitter.textContent = '';
  try {
    setStatus(t('statusPing'));
    var ping = await measurePing();
    if (stopFlag) throw new Error('stopped');
    resPing.textContent = fmt(ping.ping, 0);
    resJitter.textContent = 'Jitter ' + fmt(ping.jitter, 0) + ' ms';
    lastResult = { ping: ping.ping };

    setStatus(t('statusDown'));
    var down = await measureDownload(function (v) { setBig(fmt(v)); colorBig(v); });
    if (stopFlag) throw new Error('stopped');
    resDown.textContent = fmt(down.speed);
    resDownMB.textContent = fmt(mbs(down.speed * 1e6 / 8, 1), 1) + ' MB/წმ';
    setBig(fmt(down.speed)); colorBig(down.speed);
    verdictEl.textContent = verdictFor(down.speed, ping.ping);
    lastResult.down = down.speed;

    setStatus(t('statusUp'));
    var up = await measureUpload(function (v) { setBig(fmt(v)); });
    if (stopFlag) throw new Error('stopped');
    resUp.textContent = fmt(up.speed);
    resUpMB.textContent = fmt(mbs(up.speed * 1e6 / 8, 1), 1) + ' MB/წმ';
    setBig(fmt(down.speed)); colorBig(down.speed);
    lastResult.up = up.speed;

    setStatus(t(capped ? 'statusCapped' : 'statusReady') + ' · ' + t('dataUsed') + '~' + Math.round(usedBytes / 1e6) + ' MB');
    addHistory(lastResult);
    shareBtn.hidden = false; shareImgBtn.hidden = false;
  } catch (err) {
    if (err && err.message === 'stopped') {
      setStatus(t('statusStopped'));
      setBig('—'); colorBig(null);
    } else {
      setStatus(t('statusFailed'));
      setBig('—'); colorBig(null);
    }
  } finally {
    running = false;
    startBtn.textContent = t('retest');
    startBtn.classList.remove('stop');
  }
}

startBtn.addEventListener('click', function () {
  if (running) {
    stopFlag = true;
    aborters.forEach(function (c) { try { c.abort(); } catch (e) {} });
    activeXhrs.forEach(function (x) { try { x.abort(); } catch (e) {} });
    return;
  }
  runTest();
});

shareBtn.addEventListener('click', function () {
  if (!lastResult) return;
  var loc = lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-GB';
  var text = '↓ ' + fmt(lastResult.down || 0) + ' Mbps, ↑ ' +
    fmt(lastResult.up || 0) + ' Mbps, Ping ' + fmt(lastResult.ping || 0, 0) +
    ' ms — ' + (lang === 'ka' ? 'სიჩქარე' : lang === 'ru' ? 'Скорость' : 'Speed');
  function done() { shareBtn.textContent = t('copied'); setTimeout(function () { shareBtn.textContent = t('copyBtn'); }, 2000); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, done);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); done();
  }
});

/* ---- შედეგის სურათად გაზიარება ---- */
shareImgBtn.addEventListener('click', function () {
  if (!lastResult) return;
  var S = 1080;
  var c = document.createElement('canvas');
  c.width = S; c.height = S;
  var x = c.getContext('2d');
  x.fillStyle = '#0a0a0a'; x.fillRect(0, 0, S, S);
  x.fillStyle = '#12275c'; x.fillRect(0, 0, S, 16);
  x.fillStyle = '#ffffff';
  x.font = '800 92px sans-serif';
  x.fillText(lang === 'ka' ? 'სიჩქარე' : lang === 'ru' ? 'Скорость' : 'Speed', 80, 150);
  x.fillStyle = '#9aa3b2';
  x.font = '400 42px sans-serif';
  x.fillText(t('subtitle'), 80, 210);
  x.fillStyle = rateColor(lastResult.down || 0);
  x.font = '800 210px sans-serif';
  x.fillText(fmt(lastResult.down || 0), 80, 470);
  x.fillStyle = '#9aa3b2';
  x.font = '600 64px sans-serif';
  x.fillText('Mbps', 80 + x.measureText(fmt(lastResult.down || 0)).width + 20, 470);
  x.fillStyle = '#ffffff';
  x.font = '600 52px sans-serif';
  x.fillText('↑ ' + fmt(lastResult.up || 0) + ' Mbps', 80, 590);
  x.fillText('Ping ' + fmt(lastResult.ping || 0, 0) + ' ms', 80, 670);
  x.fillStyle = '#9aa3b2';
  x.font = '400 38px sans-serif';
  var loc = lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-GB';
  x.fillText(new Date().toLocaleString(loc), 80, 770);
  x.fillStyle = '#666666';
  x.fillText('shavlegi.github.io/sichqare', 80, 1000);
  c.toBlob(function (blob) {
    if (!blob) return;
    var file = new File([blob], 'speed-test.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch(function () { downloadBlob(blob); });
    } else {
      downloadBlob(blob);
    }
  }, 'image/png');
  function downloadBlob(blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'speed-test.png';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
});

/* ---- PWA: service worker ---- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}

applyI18n();
setLimit(limitMB);
renderHistory();
drawGraph();
