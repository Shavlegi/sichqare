/* სიჩქარე — ინტერნეტის სიჩქარის ტესტი.
   იზომება Cloudflare-ის უახლოესი სერვერის (speed.cloudflare.com) წინააღმდეგ.
   საჯარო endpoint-ები, გასაღები არ სჭირდება. */
'use strict';

var DOWN_BASE = 'https://speed.cloudflare.com/__down';
var UP_URL = 'https://speed.cloudflare.com/__up';
var DOWNLOAD_SECONDS = 10;
var UPLOAD_SECONDS = 10;
var DOWNLOAD_STREAMS = 4;
var UPLOAD_STREAMS = 3;

var $ = function (id) { return document.getElementById(id); };
var bigSpeed = $('bigSpeed'), statusText = $('statusText'), startBtn = $('startBtn'),
    resDown = $('resDown'), resUp = $('resUp'), resPing = $('resPing'),
    resDownMB = $('resDownMB'), resUpMB = $('resUpMB'), resJitter = $('resJitter'),
    serverInfo = $('serverInfo'), shareBtn = $('shareBtn');

var running = false, stopFlag = false, aborters = [];
var lastResult = null, usedBytes = 0;

function fmt(n, d) { return n.toFixed(d === undefined ? 1 : d); }
function mbps(bytes, seconds) { return (bytes * 8) / seconds / 1e6; }
function mbs(bytes, seconds) { return bytes / seconds / 1e6; }

function setStatus(t) { statusText.textContent = t; }
function setBig(v) { bigSpeed.textContent = v; }

/* ---- Ping: warmup + 5 გაზომვა, მინიმუმია Ping, jitter — საშუალო ცვალებადობა ---- */
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

/* ---- Download: N პარალელური ნაკადი, reader-ით ბაიტების დათვლა.
   შენიშვნა: __down endpoint-ი 100 MB-ზე 403-ს აბრუნებს — მაქსიმუმი ~25 MB,
   ამიტომ ნაკადი 25 MB-იან ნაწილებს იმეორებს დედლაინამდე. ---- */
var DOWNLOAD_CHUNK = 25000000;

function captureServer(res, counter) {
  if (counter.server || !res.headers) return;
  var city = res.headers.get('cf-meta-city') || res.headers.get('city');
  var country = res.headers.get('cf-meta-country') || res.headers.get('country');
  if (city || country) counter.server = [city, country].filter(Boolean).join(', ');
}

async function downloadStream(url, signal, counter, deadline) {
  while (performance.now() < deadline && !stopFlag) {
    var res;
    try {
      res = await fetch(url, { cache: 'no-store', signal: signal });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      throw err;
    }
    if (!res.ok) throw new Error('download failed: ' + res.status);
    captureServer(res, counter);
    var reader = res.body.getReader();
    try {
      for (;;) {
        var r = await reader.read();
        if (r.done) break;
        counter.bytes += r.value.byteLength;
        if (performance.now() >= deadline) { try { await reader.cancel(); } catch (e) {} break; }
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      throw err;
    }
  }
}

async function measureDownload(onTick) {
  var counter = { bytes: 0, server: null };
  var ctrl = new AbortController();
  aborters.push(ctrl);
  var start = performance.now();
  var deadline = start + DOWNLOAD_SECONDS * 1000;
  var timer = setInterval(function () {
    var elapsed = (performance.now() - start) / 1000;
    if (elapsed > 0.3) onTick(mbps(counter.bytes, elapsed));
  }, 200);
  var streams = [];
  for (var i = 0; i < DOWNLOAD_STREAMS; i++) {
    streams.push(downloadStream(DOWN_BASE + '?bytes=' + DOWNLOAD_CHUNK, ctrl.signal, counter, deadline));
  }
  var stopTimer = setTimeout(function () { ctrl.abort(); }, DOWNLOAD_SECONDS * 1000 + 500);
  try {
    await Promise.all(streams);
  } finally {
    clearTimeout(stopTimer);
    clearInterval(timer);
  }
  var seconds = (performance.now() - start) / 1000;
  usedBytes += counter.bytes;
  return { speed: mbps(counter.bytes, seconds), server: counter.server };
}

/* ---- Upload: XHR (upload progress events), პარალელური POST-ები ---- */
var upBlob = null;
function getUpData() {
  if (upBlob) return upBlob;
  var buf = new Uint8Array(10 * 1024 * 1024);
  crypto.getRandomValues(buf);
  upBlob = new Blob([buf]);
  return upBlob;
}

function uploadStream(counter, ms) {
  return new Promise(function (resolve) {
    var done = false;
    var finish = function (ok) { if (!done) { done = true; resolve(ok); } };
    var xhr = new XMLHttpRequest();
    var last = 0;
    xhr.open('POST', UP_URL, true);
    xhr.upload.onprogress = function (e) {
      if (e.loaded > last) { counter.bytes += (e.loaded - last); last = e.loaded; }
    };
    xhr.onload = function () { finish(xhr.status >= 200 && xhr.status < 300); };
    xhr.onerror = function () { finish(false); };
    xhr.onabort = function () { finish(true); };
    try { xhr.send(getUpData()); } catch (e) { finish(false); return; }
    setTimeout(function () { try { xhr.abort(); } catch (e) {} finish(true); }, ms);
  });
}

async function measureUpload(onTick) {
  var counter = { bytes: 0 };
  var start = performance.now();
  var timer = setInterval(function () {
    var elapsed = (performance.now() - start) / 1000;
    if (elapsed > 0.3) onTick(mbps(counter.bytes, elapsed));
  }, 200);
  var streams = [];
  for (var i = 0; i < UPLOAD_STREAMS; i++) {
    streams.push(uploadStream(counter, UPLOAD_SECONDS * 1000));
  }
  await Promise.all(streams);
  clearInterval(timer);
  var seconds = (performance.now() - start) / 1000;
  usedBytes += counter.bytes;
  return { speed: mbps(counter.bytes, seconds) };
}

/* ---- მთავარი პროცესი ---- */
async function runTest() {
  if (running) return;
  running = true; stopFlag = false; aborters = []; usedBytes = 0; lastResult = null;
  startBtn.textContent = 'გაჩერება';
  startBtn.classList.add('stop');
  shareBtn.hidden = true;
  resDown.textContent = '—'; resUp.textContent = '—'; resPing.textContent = '—';
  resDownMB.textContent = ''; resUpMB.textContent = ''; resJitter.textContent = '';
  serverInfo.textContent = '';
  try {
    setStatus('Ping იზომება…');
    var ping = await measurePing();
    if (stopFlag) throw new Error('stopped');
    resPing.textContent = fmt(ping.ping, 0);
    resJitter.textContent = 'Jitter ' + fmt(ping.jitter, 0) + ' ms';
    lastResult = { ping: ping.ping };

    setStatus('ჩამოტვირთვა იზომება…');
    var down = await measureDownload(function (v) { setBig(fmt(v)); });
    if (stopFlag) throw new Error('stopped');
    resDown.textContent = fmt(down.speed);
    resDownMB.textContent = fmt(mbs(down.speed * 1e6 / 8 * 1, 1), 1) + ' MB/წმ';
    setBig(fmt(down.speed));
    lastResult.down = down.speed;
    if (down.server) serverInfo.textContent = 'სერვერი: ' + down.server;

    setStatus('ატვირთვა იზომება…');
    var up = await measureUpload(function (v) { setBig(fmt(v)); });
    if (stopFlag) throw new Error('stopped');
    resUp.textContent = fmt(up.speed);
    resUpMB.textContent = fmt(mbs(up.speed * 1e6 / 8 * 1, 1), 1) + ' MB/წმ';
    setBig(fmt(down.speed));
    lastResult.up = up.speed;

    setStatus('მზადაა · მოხმარებული მონაცემები: ~' + Math.round(usedBytes / 1e6) + ' MB');
    shareBtn.hidden = false;
  } catch (err) {
    if (err && err.message === 'stopped') {
      setStatus('ტესტი შეჩერებულია');
      setBig('—');
    } else {
      setStatus('ტესტი ვერ ჩატარდა — შეამოწმე ინტერნეტი და სცადე თავიდან.');
      setBig('—');
    }
  } finally {
    running = false;
    startBtn.textContent = 'თავიდან ტესტი';
    startBtn.classList.remove('stop');
  }
}

startBtn.addEventListener('click', function () {
  if (running) {
    stopFlag = true;
    aborters.forEach(function (c) { try { c.abort(); } catch (e) {} });
    return;
  }
  runTest();
});

shareBtn.addEventListener('click', function () {
  if (!lastResult) return;
  var text = 'ჩემი ინტერნეტი: ↓ ' + fmt(lastResult.down || 0) + ' Mbps, ↑ ' +
    fmt(lastResult.up || 0) + ' Mbps, Ping ' + fmt(lastResult.ping || 0, 0) +
    ' ms — გაზომილია სიჩქარე-თ';
  function done() { shareBtn.textContent = 'კოპირებულია ✓'; setTimeout(function () { shareBtn.textContent = 'შედეგის კოპირება'; }, 2000); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, done);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); done();
  }
});
