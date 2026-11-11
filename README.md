# სიჩქარე — ინტერნეტის სიჩქარის ტესტი

ქართული, უფასო, ერთგვერდიანი სიჩქარის ტესტი — Fast.com-ის მსგავსი.
იზომება: ჩამოტვირთვა (Download), ატვირთვა (Upload), Ping, Jitter.

## როგორ მუშაობს

ყველაფერი ბრაუზერში ითვლება — ბექენდი არ გვჭირდება:

- **Download:** `GET https://speed.cloudflare.com/__down?bytes=N` — 4 პარალელური
  ნაკადი, `ReadableStream`-ით ბაიტების დათვლა, 10 წამი.
- **Upload:** `POST https://speed.cloudflare.com/__up` — 3 პარალელური XHR
  (upload progress events), 10 წამი.
- **Ping:** `GET __down?bytes=0` — warmup + 5 გაზომვა, მინიმუმია Ping.

საზომი endpoint-ები Cloudflare-ის საჯარო speed-test სერვისისაა
(`Access-Control-Allow-Origin: *`, გასაღები არ სჭირდება).

## ჰოსტინგი

სტატიკური საიტი GitHub Pages-ზე (უფასო). საზომი ტრაფიკი GitHub-ს არ
ეხება, ამიტომ Pages-ის 100 GB/თვეში ლიმიტი არ ივსება.

## ფაილები

- `index.html` — გვერდი (ქართული UI)
- `styles.css` — მუქი თემა
- `app.js` — გაზომვის ლოგიკა
- `manifest.json`, `sw.js`, `icon-*.png` — PWA (v2)

## v2 (2026-11-12)

- შედეგების ისტორია (localStorage, ბოლო 20 ტესტი)
- შეფასება სიტყვებით (რას ჰყოფნის სიჩქარე + Ping თამაშებისთვის)
- IP / პროვაიდერი / ქალაქი (Cloudflare header-ები + ip-api best-effort)
- ცოცხალი გრაფიკი ტესტის დროს (canvas)
- ფერები შედეგის მიხედვით + სწრაფი (~5 წამი) / სრული (~10 წამი) რეჟიმი
- PWA: manifest + ხატულები + service worker (ქეში `sichqare-v2`)

## შენიშვნა

ერთი სრული ტესტი ~100 MB მონაცემს მოიხმარს — Wi-Fi-ზე გაშვება ჯობია.
