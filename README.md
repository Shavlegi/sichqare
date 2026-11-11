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

## შენიშვნა

ერთი სრული ტესტი ~100 MB მონაცემს მოიხმარს — Wi-Fi-ზე გაშვება ჯობია.
