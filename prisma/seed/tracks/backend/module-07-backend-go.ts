import { day, goLab, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

/**
 * Module 7 — Backend engineering with Go: from net/http to a production service.
 */
export const backendGoDays: DaySeed[] = [
  day({
    dayNumber: 38,
    phaseSlug: "backend-go",
    titleFa: "HTTP در Go: REST، middleware و تنظیمات production",
    objectiveFa: "API تمیز طراحی کنید، middleware بنویسید و http.Server و http.Client را برای production تنظیم کنید.",
    topicSlugs: ["be-http"],
    lessons: [
      goLesson({
        slug: "http-rest-internals",
        topicSlug: "be-http",
        titleFa: "REST و net/http مدرن",
        objectiveFa: "routing در Go 1.22، status codeها، idempotency و pagination را درست به‌کار ببرید.",
        theoryMd: `## REST در عمل
- **Resource و verb:** \`GET /orders/{id}\`، \`POST /orders\`، \`PATCH /orders/{id}\`
- **Idempotent:** GET، PUT و DELETE هستند. POST نیست، مگر با \`Idempotency-Key\` (روز Reliability).
- **Status codeها:** 400 (ورودی نامعتبر)، 401 (احراز نشده)، 403 (دسترسی ندارد)، 404، 409 (تعارض یا تکراری)، 422 (validation دامنه)، 429 (با \`Retry-After\`)، 5xx فقط برای خطای سمت سرور.
- **Pagination:** cursor (keyset) در مقیاس بزرگ بهتر از offset است، چون offset بزرگ کند است و با درج همزمان آیتم تکراری یا گم‌شده می‌دهد.
- **Versioning:** \`/v1\` در مسیر ساده‌ترین روش است. تغییر سازگار (فیلد جدید) نسخهٔ جدید لازم ندارد.
- **فرمت خطای یکسان**، مثلاً RFC 9457 (problem+json): \`{"type","title","status","detail"}\`.

## net/http از Go 1.22
\`ServeMux\` جدید method و wildcard دارد. در بیشتر سرویس‌ها دیگر router خارجی لازم نیست:
~~~go
mux.HandleFunc("GET /orders/{id}", h.getOrder)
id := r.PathValue("id")
~~~

## Handler تمیز
- ورودی را با \`http.MaxBytesReader\` محدود کنید و JSON را با \`DisallowUnknownFields\` (در صورت نیاز) decode کنید.
- handler نازک باشد: parse، فراخوانی service، نگاشت خطا به status. business logic داخل handler نباشد (روز Architecture).

## سؤال مصاحبه
**«تفاوت PUT و PATCH؟»**
PUT کل resource را جایگزین می‌کند و idempotent است. PATCH تغییر جزئی است و بسته به فرمت (JSON Merge Patch یا JSON Patch) ممکن است idempotent نباشد.`,
        practicalMd: `API سفارش (ایجاد، خواندن، لیست با cursor، لغو) را با مسیرها، status codeها و فرمت خطا طراحی کنید.`,
        exampleMd: `~~~go
func (h *Handler) createOrder(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var in CreateOrderInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeProblem(w, http.StatusBadRequest, "invalid body")
		return
	}
	order, err := h.svc.Create(r.Context(), in)
	if err != nil {
		writeError(w, err) // نگاشت errors.Is/As به status
		return
	}
	writeJSON(w, http.StatusCreated, order)
}
~~~`,
      }),
      goLesson({
        slug: "middleware-patterns",
        topicSlug: "be-http",
        titleFa: "Middleware: recover، request id، logging",
        objectiveFa: "middleware را به شکل func(http.Handler) http.Handler بنویسید و ترتیبشان را توجیه کنید.",
        theoryMd: `## الگو
~~~go
type Middleware func(http.Handler) http.Handler
~~~
ترتیب (از بیرون به داخل): **recover، سپس request id، سپس logging و metrics، سپس timeout، سپس auth، سپس handler**.
- recover بیرونی‌ترین است تا panic هر لایه را بگیرد.
- request id قبل از logging می‌آید تا لاگ id را داشته باشد.

## جزئیات
- **Request ID:** اگر از edge یا ingress آمده، همان را استفاده کنید (با محدودیت طول، چون ورودی کاربر است). وگرنه بسازید. در context، header پاسخ و همهٔ لاگ‌ها بگذارید.
- **کلید context** از تایپ unexported باشد (\`type ctxKey struct{}\`) تا با پکیج دیگر تداخل نکند.
- **Recoverer:** لاگ با stack، پاسخ 500 بدون جزئیات داخلی. \`http.ErrAbortHandler\` را دوباره panic کنید؛ net/http عمداً از آن برای قطع پاسخ استفاده می‌کند.
- **ثبت status:** برای logging باید \`ResponseWriter\` را wrap کنید (روز Embedding). مراقب \`http.Flusher\` و \`Hijacker\` باشید؛ از Go 1.20 \`http.ResponseController\` کمک می‌کند.

## سؤال مصاحبه
**«چرا recover باید بیرونی‌ترین middleware باشد؟»**
تا panic در هر middleware داخلی (logging، auth) هم گرفته شود و پاسخ ۵۰۰ استاندارد برگردد.`,
        practicalMd: `ترتیب middlewareهای یک API عمومی پرداخت را بنویسید و برای هر جایگاه یک دلیل بیاورید.`,
        exampleMd: `~~~go
handler := Chain(mux, Recoverer, RequestID, AccessLog, Timeout(5*time.Second), Auth)

func Chain(h http.Handler, mws ...Middleware) http.Handler {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}
~~~`,
      }),
      goLesson({
        slug: "http-production-config",
        topicSlug: "be-http",
        titleFa: "http.Server و http.Client در production",
        objectiveFa: "timeoutهای سرور و کلاینت و تنظیم Transport را بدانید تا سرویس با یک کلاینت کند از پا نیفتد.",
        theoryMd: `## چرا مهم است
\`http.ListenAndServe(":8080", mux)\` هیچ timeoutی ندارد. یک کلاینت مخرب یا کند (Slowloris) با باز نگه داشتن connectionها fdها را تمام می‌کند. \`gosec\` همین را با G112 گزارش می‌کند.

## Server
~~~go
srv := &http.Server{
	Addr:              ":8080",
	Handler:           handler,
	ReadHeaderTimeout: 5 * time.Second,  // حداقلِ ضروری
	ReadTimeout:       15 * time.Second,
	WriteTimeout:      30 * time.Second, // برای streaming/SSE مراقب باشید
	IdleTimeout:       120 * time.Second,
	MaxHeaderBytes:    1 << 20,
}
~~~
\`http.TimeoutHandler\` یا context با timeout در middleware برای محدود کردن زمان handler.

## Client
- \`http.Client{Timeout: ...}\` کل درخواست، از جمله خواندن body، را محدود می‌کند. برای کنترل دقیق‌تر per-request از context استفاده کنید.
- **Transport مشترک** بسازید و در هر درخواست نسازید:
~~~go
tr := http.DefaultTransport.(*http.Transport).Clone()
tr.MaxIdleConns = 200
tr.MaxIdleConnsPerHost = 50 // پیش‌فرض ۲ است؛ برای فراخوانی زیاد به یک host گلوگاه است
tr.IdleConnTimeout = 90 * time.Second
client := &http.Client{Transport: tr, Timeout: 3 * time.Second}
~~~
- **همیشه body را ببندید** و برای reuse شدن connection تا انتها بخوانید (با \`io.LimitReader\` برای امنیت).
- \`MaxIdleConnsPerHost=2\` پیش‌فرض یکی از دلایل رایج «TIME_WAIT زیاد» و latency بالا در سرویس‌هایی است که یک سرویس داخلی را زیاد صدا می‌زنند.

## سؤال مصاحبه
**«سرویس ما به سرویس دیگری ۵۰۰۰ درخواست در ثانیه می‌زند و هزاران socket در TIME_WAIT داریم. چرا؟»**
پاسخ: یا body بسته یا کامل خوانده نمی‌شود، یا \`MaxIdleConnsPerHost\` کوچک است. connectionهای اضافه بعد از استفاده بسته می‌شوند و برای هر درخواست connection جدید باز می‌شود.`,
        practicalMd: `\`curl -v\` را با یک سرور Go بدون ReadHeaderTimeout تصور کنید که header را بایت‌به‌بایت با فاصلهٔ ۱۰ ثانیه می‌فرستد. چه می‌شود؟ با timeout چطور؟`,
        exampleMd: `~~~go
resp, err := client.Do(req)
if err != nil {
	return err
}
defer resp.Body.Close()
if resp.StatusCode != http.StatusOK {
	_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 64<<10)) // اجازهٔ reuse
	return fmt.Errorf("upstream status %d", resp.StatusCode)
}
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "http-middleware",
        titleFa: "لب: middleware برای Recover و Request ID",
        topicSlug: "be-http",
        lessonSlug: "middleware-patterns",
        instructionsMd: `دو middleware بنویسید که هر سرویس Go در production دارد: \`RequestID\` و \`Recoverer\`. تست‌ها با \`httptest\` نوشته شده‌اند. آن‌ها را بخوانید؛ الگوی خوبی برای تست handlerهای خودتان هستند.`,
        hints: [
          "هر دو middleware یک http.HandlerFunc برمی‌گردانند که next.ServeHTTP را صدا می‌زند. برای کلید context یک تایپ unexported مثل type ctxKey struct{} بسازید.",
          "RequestID: header ورودی اگر خالی یا بلندتر از ۶۴ بود، با crypto/rand و hex یک id بسازید؛ قبل از next، w.Header().Set و r.WithContext(context.WithValue(...)).",
          "Recoverer: defer func(){ rec := recover(); if rec == nil {return}; if rec == http.ErrAbortHandler {panic(rec)}; Content-Type را application/json بگذارید، WriteHeader(500) و بدنهٔ {\"error\":\"internal\"} }().",
        ],
      }),
      noteExercise({
        titleFa: "تنظیم http.Server و Transport",
        topicSlug: "be-http",
        lessonSlug: "http-production-config",
        path: "/tmp/be-day36-http.txt",
        mustContain: "ReadHeaderTimeout",
        instructionsMd: `برای سرویسی که هم API عمومی ارائه می‌دهد و هم روزانه میلیون‌ها بار سرویس pricing داخلی را صدا می‌زند، تنظیمات http.Server و http.Transport را با عدد و دلیل بنویسید.`,
        answerOutlineFa:
          "Server: ReadHeaderTimeout حدود ۵s، ReadTimeout و WriteTimeout متناسب با بزرگ‌ترین درخواست، IdleTimeout حدود ۱۲۰s، MaxHeaderBytes. Transport: یک نمونهٔ مشترک، MaxIdleConnsPerHost هم‌اندازهٔ هم‌زمانی معمول به pricing، IdleConnTimeout، و Client.Timeout یا ctx در هر درخواست.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "TIME_WAIT زیاد و latency بالا به سرویس داخلی",
      path: "/tmp/be-day36-scenario.txt",
      mustContain: "MaxIdleConnsPerHost",
      incidentMd: "سرویس checkout بعد از افزایش ترافیک p99 تماس با pricing را از 20ms به 300ms رسانده؛ ss -s ده‌ها هزار socket در TIME_WAIT نشان می‌دهد.",
      symptomsMd: "کلاینت با &http.Client{Timeout: 2*time.Second} ساخته شده (Transport پیش‌فرض). هم‌زمانی درخواست‌ها به pricing حدود ۲۰۰ است.",
      rootCause: "MaxIdleConnsPerHost پیش‌فرض ۲ است؛ بقیهٔ connectionها پس از استفاده بسته می‌شوند و هر درخواست TCP جدید باز می‌کند",
    }),
    exam: {
      titleFa: "آزمون — HTTP",
      questions: [
        mc(
          "کدام method طبق تعریف idempotent است؟",
          ["POST", "PUT", "PATCH همیشه", "هیچ‌کدام"],
          "PUT",
          "PUT جایگزینی کامل است؛ تکرار آن همان نتیجه را دارد.",
          "be-http",
        ),
        mc(
          "حداقل timeout ضروری http.Server برای مقابله با Slowloris؟",
          ["IdleTimeout", "ReadHeaderTimeout", "WriteTimeout", "هیچ‌کدام لازم نیست"],
          "ReadHeaderTimeout",
          "بدون آن کلاینت می‌تواند header را بی‌نهایت کند بفرستد.",
          "be-http",
        ),
        sa("مقدار پیش‌فرض MaxIdleConnsPerHost در http.Transport؟", "2", "DefaultMaxIdleConnsPerHost = 2", "be-http"),
        tf("http.DefaultClient به‌طور پیش‌فرض timeout ۳۰ ثانیه دارد.", false, "هیچ timeoutی ندارد.", "be-http"),
        mc(
          "کدام middleware باید بیرونی‌ترین باشد؟",
          ["Auth", "Recoverer", "Timeout", "JSON decoder"],
          "Recoverer",
          "تا panic همهٔ لایه‌های داخلی را بگیرد.",
          "be-http",
        ),
      ],
    },
  }),

  day({
    dayNumber: 39,
    phaseSlug: "backend-go",
    titleFa: "احراز هویت و امنیت API",
    objectiveFa: "JWT و refresh rotation را درست طراحی و خطرات OWASP API را در کد Go پیشگیری کنید.",
    topicSlugs: ["be-auth", "be-security"],
    lessons: [
      goLesson({
        slug: "jwt-auth",
        topicSlug: "be-auth",
        titleFa: "JWT، session و refresh rotation",
        objectiveFa: "مزایا و محدودیت JWT، rotation و reuse detection را توضیح دهید.",
        theoryMd: `## JWT
- ساختار \`header.payload.signature\`. payload **رمز نشده** و فقط base64 است؛ داده محرمانه در آن نگذارید.
- **الگوریتم را سمت سرور ثابت کنید** (مثلاً فقط RS256 یا EdDSA). حملهٔ \`alg: none\` یا جابه‌جایی HS256 و RS256 از اعتماد به header می‌آید.
- \`exp\`، \`iss\` و \`aud\` را اعتبارسنجی کنید. **Access token کوتاه‌عمر** باشد (۵ تا ۱۵ دقیقه).
- JWT stateless است و revoke فوری ندارد. یا TTL کوتاه، یا denylist روی \`jti\` در Redis.

## Session در برابر JWT
برای وب‌اپ تک‌دامنه، session سمت سرور (cookie با شناسهٔ تصادفی و ذخیره در Redis) اغلب ساده‌تر و امن‌تر است. JWT وقتی می‌درخشد که چند سرویس مستقل بدون فراخوانی مرکزی بخواهند توکن را تأیید کنند.

## Refresh rotation
- refresh token **تصادفی و opaque**، و **hash آن** در DB.
- هر بار refresh، توکن جدید و ابطال قبلی.
- **Reuse detection:** اگر توکن ابطال‌شده دوباره آمد، کل خانوادهٔ توکن را revoke کنید (نشانهٔ سرقت).
- ذخیره در کلاینت: refresh در cookie با \`HttpOnly; Secure; SameSite=Strict\`؛ هرگز در localStorage (XSS).

## سؤال مصاحبه
**«کاربر رمزش را عوض کرد. چطور همهٔ sessionها را باطل می‌کنید وقتی JWT stateless است؟»**
پاسخ: \`token_version\` در DB یا کش و در claim. middleware نسخه را مقایسه می‌کند. یا access token کوتاه به همراه revoke همهٔ refresh tokenها.`,
        practicalMd: `flow ورود، دریافت access و refresh، rotate و تشخیص reuse را به صورت sequence diagram متنی بنویسید.`,
        exampleMd: `~~~go
token, err := jwt.ParseWithClaims(raw, &Claims{}, keyFunc,
	jwt.WithValidMethods([]string{"EdDSA"}), // الگوریتم ثابت
	jwt.WithIssuer("auth.company.ir"),
	jwt.WithAudience("orders-api"),
	jwt.WithExpirationRequired(),
)
~~~`,
      }),
      goLesson({
        slug: "api-security",
        topicSlug: "be-security",
        titleFa: "امنیت API در Go: OWASP در عمل",
        objectiveFa: "BOLA، SQL injection، SSRF و نشت داده را در کد Go بشناسید و جلویشان را بگیرید.",
        theoryMd: `## OWASP API Top 10 در کد شما
1. **BOLA (IDOR):** \`GET /orders/{id}\` بدون بررسی اینکه سفارش مال همین کاربر است. شایع‌ترین آسیب‌پذیری API است. مالکیت را در query بررسی کنید: \`WHERE id=$1 AND user_id=$2\`.
2. **Broken auth:** توکن بدون اعتبارسنجی aud و exp، و rate limit نداشتن روی login و OTP. (OTP پیامکی بدون محدودیت تلاش هم امنیت را می‌شکند و هم هزینهٔ پیامک می‌سازد.)
3. **Mass assignment:** decode مستقیم JSON در struct مدل DB که فیلد \`IsAdmin\` دارد. DTO ورودی جدا بسازید.
4. **مصرف نامحدود منابع:** body بدون \`MaxBytesReader\`، pagination بدون سقف، و upload بدون محدودیت.
5. **SSRF:** گرفتن URL از کاربر (webhook، تصویر) و fetch در سرور. IPهای داخلی (\`169.254.169.254\`، \`10.0.0.0/8\`) را در \`net.Dialer.Control\` بلاک کنید.

## SQL injection
همیشه placeholder (\`$1\` در Postgres و \`?\` در MySQL). \`fmt.Sprintf\` برای ساخت query ممنوع است، به‌خصوص برای ORDER BY که باید از allowlist بیاید.

## Secrets و لاگ
- secret از env یا Vault، هرگز در repo. \`gitleaks\` در CI.
- توکن، رمز، شماره کارت و کد ملی را لاگ نکنید. برای تایپ‌های حساس \`slog.LogValuer\` بنویسید تا مقدار mask شود.

## ابزار
\`gosec\` (داخل golangci-lint) و \`govulncheck\`.

## سؤال مصاحبه
**«در code review چه چیزی را برای یک endpoint جدید بررسی می‌کنید؟»**
پاسخ: authorization در سطح شیء (BOLA)، validation و سقف ورودی، query پارامتری، عدم نشت خطای داخلی، rate limit و لاگ بدون داده حساس.`,
        practicalMd: `endpoint \`GET /invoices/{id}/pdf\` را از نظر سه آسیب‌پذیری بالا بررسی و کد امن (شبه‌کد) آن را بنویسید.`,
        exampleMd: `~~~go
type CardNumber string

func (c CardNumber) LogValue() slog.Value {
	s := string(c)
	if len(s) < 4 {
		return slog.StringValue("****")
	}
	return slog.StringValue("****" + s[len(s)-4:])
}
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی refresh rotation",
        topicSlug: "be-auth",
        lessonSlug: "jwt-auth",
        path: "/tmp/be-day37-auth.txt",
        mustContain: "rotation",
        instructionsMd: `endpointهای /login، /refresh و /logout، جدول refresh_tokens (ستون‌ها)، سیاست rotation و reuse detection را شرح دهید.`,
        answerOutlineFa:
          "جدول: id، user_id، family_id، token_hash، expires_at، revoked_at و replaced_by. در refresh: یافتن با hash؛ اگر revoked بود همهٔ family را revoke کن و ۴۰۱ بده؛ وگرنه revoke قدیمی و صدور جدید در یک تراکنش. logout: revoke family. cookie با HttpOnly، Secure و SameSite.",
      }),
      noteExercise({
        titleFa: "code review امنیتی",
        topicSlug: "be-security",
        lessonSlug: "api-security",
        path: "/tmp/be-day37-review.txt",
        mustContain: "BOLA",
        instructionsMd: `این handler را review کنید و حداقل سه مشکل امنیتی و اصلاح هر کدام را بنویسید:

~~~go
func (h *H) getOrder(w http.ResponseWriter, r *http.Request) {
	q := fmt.Sprintf("SELECT * FROM orders WHERE id = %s ORDER BY %s", r.PathValue("id"), r.URL.Query().Get("sort"))
	var o Order
	if err := h.db.QueryRow(q).Scan(&o); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(o)
}
~~~`,
        answerOutlineFa:
          "۱) SQL injection در id و sort: placeholder و allowlist برای sort. ۲) BOLA: شرط user_id از context احراز هویت. ۳) نشت خطای داخلی به کلاینت. ۴) QueryRow بدون ctx. ۵) SELECT * و برگرداندن مدل DB به جای DTO.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "دسترسی به فاکتور دیگران",
      path: "/tmp/be-day37-scenario.txt",
      mustContain: "authorization",
      incidentMd: "یک پژوهشگر امنیتی گزارش داده با تغییر عدد در URL فاکتور مشتریان دیگر قابل دانلود است.",
      symptomsMd: "JWT معتبر است و middleware احراز هویت درست کار می‌کند؛ handler فقط با id فاکتور query می‌زند.",
      rootCause: "BOLA: authentication بود ولی authorization در سطح شیء (بررسی مالکیت فاکتور) وجود نداشت",
    }),
    exam: {
      titleFa: "آزمون — Auth و امنیت",
      questions: [
        tf("payload یک JWT رمزنگاری شده و محرمانه است.", false, "فقط base64url است؛ امضا integrity می‌دهد نه محرمانگی.", "be-auth"),
        mc(
          "کجا refresh token را در مرورگر نگه دارید؟",
          ["localStorage", "cookie با HttpOnly، Secure و SameSite", "query string", "sessionStorage"],
          "cookie با HttpOnly، Secure و SameSite",
          "از دسترس JavaScript (XSS) دور است.",
          "be-auth",
        ),
        mc(
          "GET /orders/42 سفارش کاربر دیگری را برمی‌گرداند. نام این آسیب‌پذیری؟",
          ["SSRF", "BOLA / IDOR", "XSS", "CSRF"],
          "BOLA / IDOR",
          "Broken Object Level Authorization — رتبهٔ ۱ در OWASP API.",
          "be-security",
        ),
        tf("ساخت query با fmt.Sprintf برای ORDER BY اشکالی ندارد چون placeholder برای آن کار نمی‌کند.", false, "باید از allowlist ستون‌های مجاز استفاده کرد.", "be-security"),
        sa("کدام linter امنیتی Go در golangci-lint هست؟", "gosec", "مثلاً G112 برای نبود ReadHeaderTimeout.", "be-security"),
      ],
    },
  }),

  day({
    dayNumber: 40,
    phaseSlug: "backend-go",
    titleFa: "معماری سرویس: Clean، Hexagonal و DI در Go",
    objectiveFa: "لایه‌بندی را بدون over-engineering انجام دهید و وابستگی‌ها را به سمت domain نگه دارید.",
    topicSlugs: ["be-architecture"],
    lessons: [
      goLesson({
        slug: "clean-hexagonal",
        topicSlug: "be-architecture",
        titleFa: "Hexagonal به سبک Go",
        objectiveFa: "port و adapter، wiring دستی و مرز تراکنش را درست طراحی کنید.",
        theoryMd: `## لایه‌ها
- **Domain:** entity، قوانین کسب‌وکار و خطاهای دامنه. بدون import از net/http یا database/sql.
- **Service / use case:** orchestration. interfaceهایی (port) که لازم دارد را **خودش** تعریف می‌کند.
- **Adapterها:** handler HTTP و gRPC (driving)، و repository Postgres، کلاینت Redis و producer Kafka (driven).
- **main:** فقط wiring.

## به سبک Go، نه Java
- پکیج‌بندی **بر اساس دامنه** (\`internal/order\`، \`internal/payment\`) بهتر از لایه‌ای (\`controllers/\`، \`services/\`، \`repositories/\`) است.
- DI با **constructor دستی** در main. Wire یا fx فقط وقتی گراف واقعاً بزرگ شد.
- برای هر چیزی interface نسازید. فقط مرزهایی که در تست جایگزین می‌شوند یا چند پیاده‌سازی دارند.

## مرز تراکنش (سؤال پرتکرار)
تراکنش مفهوم use case است ولی در adapter پیاده می‌شود. دو الگو:
1. \`TxManager.WithinTx(ctx, func(ctx) error)\` که tx را در ctx می‌گذارد و repoها از آن استفاده می‌کنند.
2. repository با متدی که کل عملیات اتمیک را انجام می‌دهد.

## سؤال مصاحبه
**«چرا interface Repository در پکیج service است نه در پکیج postgres؟»**
پاسخ: Dependency Inversion. service نمی‌داند postgres وجود دارد. postgres به service وابسته است (interface را satisfy می‌کند) و import cycle هم پیش نمی‌آید.`,
        practicalMd: `برای سرویس سفارش درخت پوشه و جهت importها را بکشید؛ مشخص کنید interfaceها کجا تعریف می‌شوند.`,
        exampleMd: `~~~go
// cmd/api/main.go
db := pg.MustOpen(cfg.DSN)
orders := postgres.NewOrderRepo(db)
payments := psp.NewClient(cfg.PSPURL)
svc := order.NewService(orders, payments, clock.Real{})
h := httpapi.NewHandler(svc)
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "ساختار پکیج سرویس",
        topicSlug: "be-architecture",
        lessonSlug: "clean-hexagonal",
        path: "/tmp/be-day38-architecture.txt",
        mustContain: "adapter",
        instructionsMd: `درخت پوشهٔ سرویس سفارش (api و worker) و جریان وابستگی را بنویسید. مشخص کنید تراکنش «ثبت سفارش و رزرو موجودی» در کدام لایه شروع و کجا پیاده می‌شود.`,
        answerOutlineFa:
          "cmd/api، cmd/worker، internal/order (domain و service و portها)، internal/adapter/postgres، internal/adapter/httpapi و internal/adapter/kafka. تراکنش با TxManager از service شروع می‌شود و adapter postgres آن را پیاده می‌کند.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "تست‌ناپذیری و import cycle",
      path: "/tmp/be-day38-scenario.txt",
      mustContain: "interface",
      incidentMd: "اضافه کردن یک feature ساده دو هفته طول کشید؛ تست واحد نوشتن ممکن نیست.",
      symptomsMd: "handler مستقیم *sql.DB و *redis.Client را صدا می‌زند؛ پکیج models و services به هم import دارند.",
      rootCause: "نبود مرز و interface سمت مصرف‌کننده؛ business logic در handler و وابستگی دوطرفهٔ پکیج‌ها",
    }),
    exam: {
      titleFa: "آزمون — Architecture",
      questions: [
        mc(
          "در hexagonal، HTTP handler چیست؟",
          ["domain core", "driving adapter", "driven adapter", "port"],
          "driving adapter",
          "ورودی به application.",
          "be-architecture",
        ),
        tf("در Go پکیج‌بندی بر اساس لایه (controllers، services) بهترین روش است.", false, "بر اساس دامنه رایج‌تر و خواناتر است.", "be-architecture"),
        sa("روش DI رایج و idiomatic در Go؟", "constructor injection", "wiring صریح در main.", "be-architecture"),
        mc(
          "interface Repository کجا تعریف شود؟",
          ["پکیج postgres", "پکیج service که از آن استفاده می‌کند", "پکیج models", "main"],
          "پکیج service که از آن استفاده می‌کند",
          "Dependency Inversion و جلوگیری از import cycle.",
          "be-architecture",
        ),
      ],
    },
  }),

  day({
    dayNumber: 41,
    phaseSlug: "backend-go",
    titleFa: "Go و دیتابیس: database/sql، pgx، تراکنش و migration",
    objectiveFa: "connection pool را تنظیم کنید، تراکنش را با context درست بنویسید و بین ORM، sqlc و SQL خام انتخاب کنید.",
    topicSlugs: ["be-database"],
    lessons: [
      goLesson({
        slug: "database-sql-pool",
        topicSlug: "be-database",
        titleFa: "database/sql و connection pool",
        objectiveFa: "رفتار pool، تنظیمات آن و نشت connection را بشناسید.",
        theoryMd: `## \`*sql.DB\` یک connection نیست
یک **pool** thread-safe است. یک بار در main بسازید و همه‌جا پاس دهید. \`sql.Open\` اتصال برقرار نمی‌کند؛ \`PingContext\` بزنید.

## تنظیمات (همیشه صریح)
~~~go
db.SetMaxOpenConns(25)                 // پیش‌فرض نامحدود است و DB را خفه می‌کند
db.SetMaxIdleConns(25)                 // پیش‌فرض ۲ است؛ churn زیاد
db.SetConnMaxLifetime(30 * time.Minute) // سازگار با failover و LB
db.SetConnMaxIdleTime(5 * time.Minute)
~~~
**قاعده:** مجموع MaxOpenConns همهٔ podها از \`max_connections\` دیتابیس (منهای حاشیه) کمتر باشد. ۲۰ pod ضربدر ۵۰ connection یعنی ۱۰۰۰ connection به Postgres، و این Postgres را کند می‌کند. PgBouncer در حالت transaction pooling کمک می‌کند ولی prepared statementها را محدود می‌کند.

## نشت connection
- \`rows.Close()\` فراموش‌شده (\`defer rows.Close()\` بلافاصله بعد از err check). \`rows.Err()\` را هم بعد از حلقه چک کنید.
- تراکنشی که Commit یا Rollback نشده.
- query بدون context که بعد از قطع کلاینت ادامه دارد.

متریک‌ها: \`db.Stats()\` شامل InUse، Idle، **WaitCount** و **WaitDuration** است. WaitDuration رو به رشد یعنی pool کم است یا queryها کند.

## pgx
برای Postgres، \`jackc/pgx/v5\` (مستقیم با \`pgxpool\` یا به شکل driver برای database/sql) سریع‌تر است و COPY، LISTEN و NOTIFY و تایپ‌های Postgres را پشتیبانی می‌کند.

## سؤال مصاحبه
**«MaxOpenConns را چند می‌گذارید؟»**
پاسخ: با بودجهٔ \`max_connections\` شروع می‌کنم، تقسیم بر تعداد podها (با در نظر گرفتن HPA max)، بعد با WaitDuration و p99 تنظیم می‌کنم. عدد بزرگ‌تر لزوماً سریع‌تر نیست؛ contention به سمت DB منتقل می‌شود.`,
        practicalMd: `با ۱۲ pod در حداکثر HPA و \`max_connections=300\` (۲۰ تا برای admin)، MaxOpenConns هر pod را حساب کنید.`,
        exampleMd: `~~~go
rows, err := db.QueryContext(ctx, \`SELECT id, total FROM orders WHERE user_id = $1\`, uid)
if err != nil {
	return nil, err
}
defer rows.Close()
for rows.Next() {
	var o Order
	if err := rows.Scan(&o.ID, &o.Total); err != nil {
		return nil, err
	}
	out = append(out, o)
}
return out, rows.Err()
~~~`,
      }),
      goLesson({
        slug: "transactions-go",
        topicSlug: "be-database",
        titleFa: "تراکنش در Go، ORM یا sqlc، و migration",
        objectiveFa: "الگوی امن تراکنش، lock ردیف و ابزار دسترسی به داده را انتخاب کنید.",
        theoryMd: `## الگوی امن تراکنش
~~~go
func (r *Repo) WithTx(ctx context.Context, fn func(*sql.Tx) error) (err error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
		if err != nil {
			_ = tx.Rollback()
		}
	}()
	if err = fn(tx); err != nil {
		return err
	}
	return tx.Commit()
}
~~~
- داخل tx از \`tx.QueryContext\` استفاده کنید، نه \`db\`. اشتباه رایجی است که query را بیرون از tx اجرا می‌کند.
- **فراخوانی HTTP یا صف داخل تراکنش نکنید.** lock و connection را طولانی نگه می‌دارد. برای انتشار رویداد بعد از commit از outbox استفاده کنید (روز Reliability).
- برداشت از موجودی: \`UPDATE ... SET stock = stock - $1 WHERE id = $2 AND stock >= $1\` و بررسی RowsAffected. یا \`SELECT ... FOR UPDATE\`. یا optimistic با ستون version.

## ابزار دسترسی به داده
| ابزار | مزیت | عیب |
|---|---|---|
| SQL خام و database/sql | کنترل کامل | boilerplate برای Scan |
| **sqlc** | تولید کد type-safe از SQL، بدون reflection | query پویا سخت است |
| GORM | سرعت توسعه، رایج در تیم‌های ایرانی | queryهای پنهان، N+1، کندی reflection |
| squirrel / goqu | ساخت query پویا | هنوز Scan دستی |

در مصاحبه بگویید trade-off را می‌شناسید: GORM برای CRUD ساده و sqlc برای مسیرهای پرترافیک.

## Migration
\`golang-migrate\` یا \`goose\`. migrationها forward-only و **سازگار با نسخهٔ قبلی** باشند (expand و contract): ستون جدید nullable، deploy کد، backfill، و بعد NOT NULL. ساخت index در Postgres با \`CREATE INDEX CONCURRENTLY\` تا جدول قفل نشود.`,
        practicalMd: `migration اضافه کردن ستون اجباری \`currency\` به جدول orders با ۵۰ میلیون ردیف را بدون downtime مرحله‌بندی کنید.`,
        exampleMd: `~~~sql
-- name: ReserveStock :execrows
UPDATE products SET stock = stock - $2
WHERE id = $1 AND stock >= $2;
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "محاسبهٔ pool و تشخیص نشت",
        topicSlug: "be-database",
        lessonSlug: "database-sql-pool",
        path: "/tmp/be-day39-pool.txt",
        mustContain: "MaxOpenConns",
        instructionsMd: `سرویسی با حداکثر ۱۲ pod و Postgres با max_connections=300 دارید. MaxOpenConns، MaxIdleConns و ConnMaxLifetime را با محاسبه بنویسید. سپس توضیح دهید از کدام فیلدهای db.Stats() برای آلارم استفاده می‌کنید.`,
        answerOutlineFa:
          "حدود (300-20)/12 که تقریباً ۲۳ می‌شود؛ پس MaxOpenConns=20 و MaxIdleConns=20، ConnMaxLifetime حدود ۳۰ دقیقه. آلارم روی نرخ رشد WaitCount و WaitDuration و InUse نزدیک MaxOpen.",
      }),
      noteExercise({
        titleFa: "migration بدون downtime",
        topicSlug: "be-database",
        lessonSlug: "transactions-go",
        path: "/tmp/be-day39-migration.txt",
        mustContain: "backfill",
        instructionsMd: `مراحل افزودن ستون NOT NULL به جدول بزرگ را با الگوی expand و contract بنویسید، به همراه ترتیب deploy کد.`,
        answerOutlineFa:
          "۱) ADD COLUMN nullable (یا با DEFAULT که در Postgres 11 به بعد سریع است) ۲) deploy کدی که هر دو حالت را می‌نویسد و می‌خواند ۳) backfill دسته‌ای با batchهای کوچک ۴) SET NOT NULL (یا CHECK NOT VALID و سپس VALIDATE) ۵) حذف کد قدیمی.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Pool exhaustion بعد از feature گزارش",
      path: "/tmp/be-day39-scenario.txt",
      mustContain: "rows.Close",
      incidentMd: "بعد از release قابلیت export، سرویس هر چند ساعت از دسترس خارج می‌شود و با restart درست می‌شود.",
      symptomsMd: "db.Stats: InUse=MaxOpenConns و ثابت؛ WaitCount مدام بالا می‌رود؛ pg_stat_activity: connectionهای idle in transaction ندارد ولی idle زیاد دارد.",
      rootCause: "در مسیر export وقتی خطای validation رخ می‌داد، از حلقه return می‌شد بدون rows.Close() و connection به pool برنمی‌گشت",
    }),
    exam: {
      titleFa: "آزمون — Go و دیتابیس",
      questions: [
        tf("*sql.DB یک connection تکی است و باید برای هر request یکی ساخت.", false, "pool است و یک بار ساخته می‌شود.", "be-database"),
        mc(
          "پیش‌فرض MaxOpenConns در database/sql؟",
          ["۱۰", "۲", "نامحدود", "۱۰۰"],
          "نامحدود",
          "بدون تنظیم می‌تواند DB را با connection خفه کند.",
          "be-database",
        ),
        mc(
          "کدام مورد داخل تراکنش DB نباید انجام شود؟",
          ["UPDATE با WHERE", "SELECT FOR UPDATE", "فراخوانی HTTP به درگاه پرداخت", "INSERT در outbox"],
          "فراخوانی HTTP به درگاه پرداخت",
          "lock و connection را طولانی نگه می‌دارد؛ نتیجهٔ شبکه هم با rollback برنمی‌گردد.",
          "be-database",
        ),
        sa("ابزاری که از SQL کد Go type-safe تولید می‌کند؟", "sqlc", "بدون reflection در runtime.", "be-database"),
        tf("CREATE INDEX CONCURRENTLY در Postgres جدول را برای نوشتن قفل نمی‌کند.", true, "کندتر است ولی writeها ادامه می‌یابند.", "be-database"),
      ],
    },
  }),

  day({
    dayNumber: 42,
    phaseSlug: "backend-go",
    titleFa: "gRPC و Messaging: Kafka، RabbitMQ و Temporal",
    objectiveFa: "بین REST و gRPC و بین Kafka و RabbitMQ با دلیل انتخاب کنید و semantics تحویل پیام را دقیق توضیح دهید.",
    topicSlugs: ["be-architecture", "be-reliability"],
    lessons: [
      goLesson({
        slug: "grpc-messaging",
        topicSlug: "be-architecture",
        titleFa: "gRPC و message brokerها",
        objectiveFa: "ویژگی‌های gRPC، مدل Kafka و RabbitMQ و commit و ack را بشناسید.",
        theoryMd: `## gRPC
- Protobuf روی HTTP/2، با قرارداد صریح، کد تولیدی و streaming.
- **Deadline** خودکار propagate می‌شود (اگر ctx پاس دهید). interceptor معادل middleware است.
- مناسب ارتباط داخلی سرویس‌ها. برای مرورگر grpc-web یا یک gateway لازم است.
- load balancing: HTTP/2 connection طولانی دارد و L4 LB همهٔ درخواست‌ها را به یک pod می‌فرستد. LB سمت کلاینت یا L7 (Envoy یا service mesh) لازم است.
- سازگاری schema: شمارهٔ فیلدها را عوض یا دوباره استفاده نکنید؛ فیلد حذف‌شده را \`reserved\` کنید.

## Kafka
- topic، partition و offset. **ترتیب فقط داخل partition** است و کلید پیام partition را تعیین می‌کند (مثلاً order_id).
- consumer group: هر partition در هر لحظه فقط یک consumer از گروه دارد. حداکثر موازی‌سازی برابر تعداد partition است.
- **Commit offset بعد از پردازش** یعنی at-least-once و احتمال پیام تکراری، پس consumer باید **idempotent** باشد. commit قبل از پردازش یعنی at-most-once و احتمال گم شدن.
- rebalance: هنگام اضافه یا کم شدن consumer، پردازش متوقف می‌شود. پردازش طولانی‌تر از \`max.poll.interval.ms\` باعث بیرون افتادن consumer می‌شود.
- کتابخانه‌های Go: \`franz-go\`، \`segmentio/kafka-go\`، \`confluent-kafka-go\` (cgo).

## RabbitMQ
- exchange، routing key و queue. **ack دستی بعد از پردازش**. \`prefetch\` (QoS) تعداد پیام unack هر consumer را محدود می‌کند.
- DLQ با dead-letter exchange، و retry با تأخیر از طریق TTL و DLX.
- مناسب صف کار (job) با routing پیچیده. Kafka مناسب event log با replay و throughput بالا.

## Temporal (نمای کلی)
workflowهای durable و طولانی (saga پرداخت، onboarding). state و retry را Temporal نگه می‌دارد. کد workflow باید deterministic باشد.

## سؤال مصاحبه
**«exactly-once در Kafka داریم؟»**
پاسخ: Kafka تراکنش و idempotent producer دارد که exactly-once را **داخل Kafka** (خواندن، پردازش و نوشتن به Kafka) می‌دهد. اما وقتی side effect بیرونی دارید (DB یا ارسال SMS) در عمل at-least-once به همراه consumer idempotent است.`,
        practicalMd: `برای «ارسال پیامک تأیید سفارش» بین Kafka و RabbitMQ انتخاب کنید و کلید partition یا routing را مشخص کنید.`,
        exampleMd: `~~~go
for {
	fetches := client.PollFetches(ctx)
	fetches.EachRecord(func(rec *kgo.Record) {
		if err := handle(ctx, rec); err != nil {
			// retry topic یا DLQ؛ commit نکنید تا دوباره بیاید
			return
		}
	})
	if err := client.CommitUncommittedOffsets(ctx); err != nil {
		log.Error("commit", "err", err)
	}
}
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "انتخاب broker",
        topicSlug: "be-architecture",
        lessonSlug: "grpc-messaging",
        path: "/tmp/be-day40-messaging.txt",
        mustContain: "consumer group",
        instructionsMd: `دو سناریو: (۱) audit log همهٔ تغییرات سفارش با نیاز به replay برای سرویس‌های جدید؛ (۲) صف ارسال ایمیل با retry تأخیری. برای هر کدام broker، کلید یا routing، و semantics تحویل را بنویسید.`,
        answerOutlineFa:
          "۱) Kafka؛ کلید order_id برای ترتیب هر سفارش؛ retention طولانی؛ هر سرویس consumer group خودش. ۲) RabbitMQ؛ ack دستی، prefetch کوچک، DLX و TTL برای retry تأخیری؛ consumer idempotent با شناسهٔ پیام.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "پیام تکراری و پیام گم‌شده",
      path: "/tmp/be-day40-scenario.txt",
      mustContain: "commit",
      incidentMd: "بعد از هر deploy، بعضی مشتری‌ها دو پیامک تأیید می‌گیرند و بعضی هیچ.",
      symptomsMd: "consumer با auto-commit هر ۵ ثانیه offset را commit می‌کند و پردازش را در goroutine جدا انجام می‌دهد.",
      rootCause: "auto-commit مستقل از پایان پردازش؛ پیام‌هایی که در goroutine تمام نشده بودند commit و گم شدند، و پیام‌های پردازش‌شدهٔ commit‌نشده بعد از rebalance دوباره آمدند",
    }),
    exam: {
      titleFa: "آزمون — gRPC و Messaging",
      questions: [
        mc(
          "Kafka ترتیب پیام را کجا تضمین می‌کند؟",
          ["کل topic", "داخل یک partition", "کل cluster", "هیچ‌جا"],
          "داخل یک partition",
          "کلید پیام partition را تعیین می‌کند.",
          "be-architecture",
        ),
        mc(
          "commit offset بعد از پردازش چه تضمینی می‌دهد؟",
          ["exactly-once", "at-least-once", "at-most-once", "هیچ"],
          "at-least-once",
          "در crash بین پردازش و commit، پیام دوباره پردازش می‌شود؛ consumer باید idempotent باشد.",
          "be-reliability",
        ),
        tf("یک L4 load balancer جلوی gRPC درخواست‌ها را به‌خوبی بین podها پخش می‌کند.", false, "HTTP/2 connection طولانی دارد؛ L7 یا LB سمت کلاینت لازم است.", "be-architecture"),
        sa("در RabbitMQ کدام تنظیم تعداد پیام‌های unack هر consumer را محدود می‌کند؟", "prefetch", "basic.qos", "be-architecture"),
      ],
    },
  }),

  day({
    dayNumber: 43,
    phaseSlug: "backend-go",
    titleFa: "Resilience در کد: retry، idempotency و outbox",
    objectiveFa: "retry امن با backoff و jitter بنویسید، idempotency را پیاده کنید و dual-write را با outbox حل کنید.",
    topicSlugs: ["be-reliability"],
    lessons: [
      goLesson({
        slug: "retry-idempotency",
        topicSlug: "be-reliability",
        titleFa: "Retry، backoff، jitter و idempotency",
        objectiveFa: "بدانید کی retry کنید، چطور retry storm نسازید و چطور POST را امن تکرار کنید.",
        theoryMd: `## کی retry؟
- **فقط خطاهای موقت:** timeout، اتصال قطع، 503 و 429 (با رعایت \`Retry-After\`).
- **نه:** 400، 401، 403، 404، 422 و خطای validation. این‌ها permanent هستند.
- **فقط عملیات idempotent**، یا عملیاتی که idempotency key دارد.

## Backoff و jitter
- exponential: \`base * 2^attempt\` با سقف max.
- **Full jitter:** \`sleep = rand(0, min(max, base*2^attempt))\`. بدون jitter، هزار کلاینت که هم‌زمان خطا گرفته‌اند هم‌زمان هم retry می‌کنند (thundering herd).
- **Retry budget:** در زنجیرهٔ سه سرویسی که هر کدام سه بار retry کنند، یک خطا ۲۷ درخواست می‌سازد. retry را فقط در یک لایه (معمولاً نزدیک کلاینت) انجام دهید یا با circuit breaker محدود کنید.
- retry باید ctx را رعایت کند. retry بعد از deadline کار بی‌فایده است.

## Idempotency key
کلاینت یک \`Idempotency-Key\` (UUID) برای هر عملیات منطقی می‌فرستد. سرور:
1. در یک تراکنش رکورد \`(key, request_hash, status=processing)\` را با unique constraint درج می‌کند.
2. اگر کلید وجود داشت و تمام شده، **همان پاسخ ذخیره‌شده** را برمی‌گرداند. اگر در حال پردازش است 409 می‌دهد. اگر hash بدنه فرق دارد 422.
3. بعد از پایان، پاسخ را ذخیره می‌کند (با TTL، مثلاً ۲۴ ساعت).

## Circuit breaker
closed، open و half-open. وقتی downstream مرده، به جای انتظار برای timeout سریع fail کنید و fallback بدهید. (\`sony/gobreaker\`)

## سؤال مصاحبه
**«درگاه پرداخت timeout داد. retry کنیم؟»**
پاسخ: نه کورکورانه. timeout یعنی نمی‌دانیم پرداخت انجام شده یا نه. اول با شناسهٔ تراکنش استعلام (inquiry یا verify) می‌کنیم. retry فقط با همان idempotency key و اگر PSP آن را پشتیبانی کند.`,
        practicalMd: `برای endpoint \`POST /payments\` جدول idempotency_keys و منطق سه حالت (جدید، در حال پردازش، تمام‌شده) را بنویسید.`,
        exampleMd: `~~~sql
CREATE TABLE idempotency_keys (
  key           text PRIMARY KEY,
  user_id       bigint NOT NULL,
  request_hash  bytea NOT NULL,
  status        text NOT NULL,       -- processing | done
  response_code int,
  response_body jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
~~~`,
      }),
      goLesson({
        slug: "outbox-pattern",
        topicSlug: "be-reliability",
        titleFa: "Transactional outbox و dual-write",
        objectiveFa: "مشکل نوشتن هم‌زمان در DB و Kafka را توضیح دهید و outbox را پیاده کنید.",
        theoryMd: `## مشکل dual-write
~~~go
tx.Commit()                        // سفارش ثبت شد
producer.Send("order.created", e) // اگر اینجا crash کنیم چه؟
~~~
یا رویداد گم می‌شود، یا اگر ترتیب برعکس باشد، رویدادی برای سفارشی منتشر می‌شود که commit نشده است. تراکنش توزیع‌شده (2PC) بین Postgres و Kafka عملاً گزینه نیست.

## Outbox
1. در **همان تراکنش** سفارش، یک ردیف در جدول \`outbox(id, aggregate_id, type, payload, created_at, published_at)\` درج کنید.
2. یک **relay** جدا ردیف‌های منتشرنشده را می‌خواند، به Kafka می‌فرستد و \`published_at\` را می‌زند. یا CDC با Debezium که WAL را می‌خواند.
3. چند instance relay: \`SELECT ... FOR UPDATE SKIP LOCKED LIMIT 100\`.
4. تحویل **at-least-once** است. consumerها با \`event_id\` تکراری‌ها را حذف می‌کنند (جدول processed_events یا upsert).

## Inbox (سمت consumer)
\`INSERT INTO processed_events(event_id) ... ON CONFLICT DO NOTHING\` در همان تراکنش اثر پیام. اگر ردیف درج نشد، پیام تکراری است.

## سؤال مصاحبه
**«چرا outbox exactly-once نمی‌دهد؟»**
پاسخ: relay ممکن است بعد از send و قبل از به‌روز کردن \`published_at\` crash کند و دوباره بفرستد. outbox **گم نشدن** را تضمین می‌کند و idempotency سمت consumer **تکرار نشدن اثر** را.`,
        practicalMd: `query relay را با \`FOR UPDATE SKIP LOCKED\` بنویسید و توضیح دهید چرا دو relay هم‌زمان یک ردیف را برنمی‌دارند.`,
        exampleMd: `~~~sql
WITH batch AS (
  SELECT id FROM outbox
  WHERE published_at IS NULL
  ORDER BY id
  LIMIT 100
  FOR UPDATE SKIP LOCKED
)
SELECT o.* FROM outbox o JOIN batch b ON o.id = b.id;
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "retry-backoff",
        titleFa: "لب: Retry با exponential backoff، jitter و خطای permanent",
        topicSlug: "be-reliability",
        lessonSlug: "retry-idempotency",
        instructionsMd: `\`Retry\` را مطابق مشخصات پیاده کنید. \`Sleep\` و \`Rand\` تزریق می‌شوند تا تست بدون منتظر ماندن واقعی تأخیرها را بسنجد. این همان تکنیک «زمان یک وابستگی است» از روز تست است. اگر nil بودند، پیش‌فرض واقعی را بگذارید.`,
        hints: [
          "حلقه روی attempt از 0 تا Attempts-1. قبل از هر attempt به جز اولی sleep کنید. برای پیش‌فرض Sleep از time.NewTimer و select روی ctx.Done() استفاده کنید.",
          "ceiling := Base << (attempt-1)؛ اگر از Max بزرگ‌تر یا منفی (overflow) بود برابر Max. تأخیر: time.Duration(Rand() * float64(ceiling)).",
          "بعد از fn: اگر nil بود return nil؛ با errors.As(err, &perm) خطای permanent را تشخیص و perm.err را برگردانید؛ اگر ctx.Err() != nil آن را برگردانید؛ بعد از حلقه آخرین err.",
        ],
      }),
      noteExercise({
        titleFa: "طراحی outbox برای ثبت سفارش",
        topicSlug: "be-reliability",
        lessonSlug: "outbox-pattern",
        path: "/tmp/be-day41-outbox.txt",
        mustContain: "outbox",
        instructionsMd: `برای «ثبت سفارش و انتشار order.created» جدول outbox، تراکنش ثبت، relay (با SKIP LOCKED) و منطق حذف تکرار در consumer را بنویسید.`,
        answerOutlineFa:
          "تراکنش: INSERT order و INSERT outbox(event_id uuid، type، payload). relay: SELECT FOR UPDATE SKIP LOCKED LIMIT n، send به Kafka با کلید order_id، و UPDATE published_at. consumer: INSERT processed_events(event_id) ON CONFLICT DO NOTHING در همان تراکنش اثر؛ اگر درج نشد، پیام تکراری است.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Duplicate charge بعد از timeout",
      path: "/tmp/be-day41-scenario.txt",
      mustContain: "idempotency",
      incidentMd: "چند مشتری گزارش داده‌اند برای یک سفارش دو بار از حسابشان کسر شده است.",
      symptomsMd: "لاگ: اولین درخواست به PSP بعد از ۱۰ ثانیه timeout خورد و retry middleware همان POST را دوباره فرستاد. PSP هر دو را پردازش کرده.",
      rootCause: "retry روی عملیات non-idempotent بدون idempotency key و بدون استعلام وضعیت تراکنش قبلی",
    }),
    exam: {
      titleFa: "آزمون — Resilience",
      questions: [
        mc(
          "کدام خطا ارزش retry دارد؟",
          ["400 Bad Request", "401 Unauthorized", "503 Service Unavailable", "422 Unprocessable"],
          "503 Service Unavailable",
          "خطای موقت؛ بقیه permanent هستند.",
          "be-reliability",
        ),
        tf("jitter در backoff برای جلوگیری از هم‌زمانی retry کلاینت‌ها (thundering herd) است.", true, "full jitter بار را در زمان پخش می‌کند.", "be-reliability"),
        mc(
          "مشکلی که outbox حل می‌کند؟",
          ["کندی query", "dual-write بین DB و broker", "cache stampede", "SQL injection"],
          "dual-write بین DB و broker",
          "رویداد در همان تراکنش داده ثبت می‌شود.",
          "be-reliability",
        ),
        tf("outbox به‌تنهایی exactly-once را تضمین می‌کند.", false, "at-least-once است؛ consumer باید idempotent باشد.", "be-reliability"),
        sa("کدام clause در Postgres اجازه می‌دهد چند relay بدون تداخل ردیف بردارند؟", "SKIP LOCKED", "SELECT ... FOR UPDATE SKIP LOCKED", "be-reliability"),
      ],
    },
  }),

  day({
    dayNumber: 44,
    phaseSlug: "backend-go",
    titleFa: "Container، Graceful Shutdown و Observability",
    objectiveFa: "سرویس Go را درست containerize کنید، shutdown بی‌خطا داشته باشید و logs، metrics و traces مفید تولید کنید.",
    topicSlugs: ["be-observability"],
    lessons: [
      goLesson({
        slug: "docker-graceful",
        topicSlug: "be-observability",
        titleFa: "Docker و shutdown برای سرویس Go در Kubernetes",
        objectiveFa: "image کوچک و امن بسازید و چرخهٔ عمر pod را رعایت کنید.",
        theoryMd: `## Image
- multi-stage: build در \`golang:1.xx\` و اجرا در \`distroless/static\` یا \`scratch\`. باینری با \`CGO_ENABLED=0\` و \`-trimpath -ldflags="-s -w"\`.
- \`USER nonroot\`، بدون shell (سطح حمله کمتر)، و گواهی‌های CA برای TLS.
- cache لایه: اول \`go.mod\` و \`go.sum\` و \`go mod download\`، بعد کپی کد.

## Probeها
- **liveness:** فقط «process گیر نکرده». به DB وابسته نکنید، وگرنه قطعی DB همهٔ podها را restart می‌کند.
- **readiness:** آماده‌ی ترافیک (گرم شدن cache و اتصال به وابستگی‌های ضروری). هنگام shutdown اول این fail شود.
- **startup:** برای شروع کند.

## Shutdown (مرور روز الگوها)
SIGTERM، fail readiness، صبر کوتاه، \`srv.Shutdown(ctx با timeout)\`، توقف consumerها و \`wg.Wait\`، بستن DB و flush trace. همه کمتر از \`terminationGracePeriodSeconds\`.

## GOMAXPROCS و GOMEMLIMIT
یادآوری روزهای Runtime و GC: در کانتینر هر دو را تنظیم کنید (یا Go 1.25 به بعد برای GOMAXPROCS).`,
        practicalMd: `Dockerfile multi-stage برای سرویس api بنویسید و حجم image نهایی را تخمین بزنید.`,
        exampleMd: `~~~dockerfile
FROM golang:1.24 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM gcr.io/distroless/static:nonroot
COPY --from=build /out/api /api
USER nonroot:nonroot
ENTRYPOINT ["/api"]
~~~`,
      }),
      goLesson({
        slug: "otel-prometheus",
        topicSlug: "be-observability",
        titleFa: "slog، Prometheus و OpenTelemetry",
        objectiveFa: "لاگ ساختاریافته، متریک RED با cardinality کنترل‌شده و trace توزیع‌شده بسازید.",
        theoryMd: `## Logging با log/slog (از Go 1.21)
- JSON handler، سطح از config، و فیلدهای ثابت: \`request_id\`، \`trace_id\`، \`user_id\`.
- لاگ رویداد است، نه متریک. برای شمردن از متریک استفاده کنید.

## Prometheus
- **RED** برای هر endpoint: Rate (counter)، Errors (counter با label status) و Duration (**histogram**).
- **Cardinality:** label با مقدار نامحدود (user_id، مسیر خام \`/orders/123\`) حافظهٔ Prometheus را منفجر می‌کند. از route template (\`/orders/{id}\`) استفاده کنید.
- percentile را از histogram در Prometheus حساب کنید (\`histogram_quantile\`)، نه summary سمت کلاینت (قابل جمع نیست).
- متریک‌های runtime: \`go_goroutines\`، \`go_memstats_*\` و \`go_gc_duration_seconds\`.

## OpenTelemetry
- span برای هر درخواست ورودی و هر فراخوانی خروجی (HTTP، DB، Kafka). propagation با header \`traceparent\` (W3C).
- \`otelhttp\` و \`otelgrpc\` برای instrument خودکار. trace_id را در لاگ بگذارید تا از لاگ به trace بروید.
- **Sampling:** head-based برای هزینه، tail-based برای نگه داشتن traceهای خطادار و کند.

## سؤال مصاحبه
**«p99 یک endpoint بالا رفته. با چه سیگنالی شروع می‌کنید؟»**
پاسخ: histogram برای دیدن زمان و دامنهٔ مشکل، trace نمونه‌های کند برای پیدا کردن span مقصر، بعد لاگ و profile آن سرویس. ترتیب: metrics، سپس traces، سپس logs و profiles.`,
        practicalMd: `سه متریک و labelهایشان را برای یک endpoint پرداخت تعریف کنید و توضیح دهید چرا \`user_id\` label نیست.`,
        exampleMd: `~~~go
var reqDur = promauto.NewHistogramVec(prometheus.HistogramOpts{
	Name:    "http_server_request_duration_seconds",
	Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5},
}, []string{"route", "method", "status"})
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی graceful shutdown کامل",
        topicSlug: "be-observability",
        lessonSlug: "docker-graceful",
        path: "/tmp/be-day42-shutdown.txt",
        mustContain: "SIGTERM",
        instructionsMd: `ترتیب بستن readiness، HTTP server، consumer کافکا، workerها، producer outbox و DB pool را بعد از SIGTERM با timeoutها بنویسید (terminationGracePeriodSeconds=30).`,
        answerOutlineFa:
          "SIGTERM، readiness fail و صبر ۵ ثانیه، Shutdown با ۱۵ ثانیه، توقف poll کافکا و commit پیام‌های پردازش‌شده، wg.Wait workerها با سقف، flush producer، db.Close و flush tracer؛ مجموع کمتر از ۳۰ ثانیه.",
      }),
      noteExercise({
        titleFa: "انفجار cardinality",
        topicSlug: "be-observability",
        lessonSlug: "otel-prometheus",
        path: "/tmp/be-day42-metrics.txt",
        mustContain: "cardinality",
        instructionsMd: `حافظهٔ Prometheus بعد از افزودن متریک جدید ۱۰ برابر شده است. متریک: http_requests_total{path=r.URL.Path, user=userID}. مشکل و اصلاح را بنویسید.`,
        answerOutlineFa: "cardinality نامحدود: هر path یکتا (با id) و هر کاربر یک سری جدید می‌سازد. اصلاح: route template به جای path خام، حذف user، و استفاده از trace یا لاگ برای جزئیات کاربر.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "۵۰۲ در هر rolling update",
      path: "/tmp/be-day42-scenario.txt",
      mustContain: "Shutdown",
      incidentMd: "در هر deploy حدود ۱۵ ثانیه خطای 502 از ingress دیده می‌شود.",
      symptomsMd: "main: go srv.ListenAndServe(); <-quit; os.Exit(0). readiness probe همیشه ۲۰۰ برمی‌گرداند.",
      rootCause: "process بدون srv.Shutdown و بدون fail کردن readiness قبل از خروج بسته می‌شد؛ ingress هنوز ترافیک می‌فرستاد",
    }),
    exam: {
      titleFa: "آزمون — Observability",
      questions: [
        mc(
          "اولین قدم سرویس پس از SIGTERM در Kubernetes؟",
          ["فوراً os.Exit", "fail کردن readiness و توقف پذیرش ترافیک جدید", "بستن DB", "panic"],
          "fail کردن readiness و توقف پذیرش ترافیک جدید",
          "سپس Shutdown و drain.",
          "be-observability",
        ),
        tf("liveness probe بهتر است به سلامت دیتابیس وابسته باشد.", false, "قطعی DB همهٔ podها را restart می‌کند؛ این کار readiness است.", "be-observability"),
        mc(
          "کدام label برای متریک Prometheus مناسب است؟",
          ["user_id", "مسیر خام URL", "route template", "request_id"],
          "route template",
          "بقیه cardinality نامحدود می‌سازند.",
          "be-observability",
        ),
        sa("پکیج لاگ ساختاریافتهٔ stdlib از Go 1.21؟", "log/slog", "slog با JSONHandler", "be-observability"),
        tf("OpenTelemetry vendor-neutral است و با OTLP به Jaeger یا Tempo export می‌کند.", true, "استاندارد باز CNCF.", "be-observability"),
      ],
    },
  }),

  day({
    dayNumber: 45,
    phaseSlug: "backend-go",
    titleFa: "تست یکپارچه، pprof و Capstone",
    objectiveFa: "استراتژی تست سرویس را تعریف کنید، با pprof مشکل عملکرد را پیدا کنید و capstone را برنامه‌ریزی کنید.",
    topicSlugs: ["be-http", "be-architecture", "be-observability", "go-testing"],
    lessons: [
      goLesson({
        slug: "testing-benchmark-pprof",
        topicSlug: "go-testing",
        titleFa: "تست integration و pprof در production",
        objectiveFa: "testcontainers، تست contract و پروفایل‌گیری امن از production را بشناسید.",
        theoryMd: `## هرم تست سرویس
- **Unit:** منطق domain و service با fake (روز تست).
- **Integration:** repository در برابر **Postgres واقعی** با \`testcontainers-go\`. با SQLite یا mock تست نکنید؛ SQL و lockها فرق دارند. پکیج‌ها را با \`//go:build integration\` جدا کنید.
- **HTTP:** handler به همراه service واقعی و fake repo با \`httptest\`.
- **Contract:** برای قرارداد بین سرویس‌ها (protobuf با \`buf breaking\`، یا Pact).
- **E2E:** کم و فقط برای مسیرهای حیاتی (checkout).

## pprof
~~~go
import _ "net/http/pprof" // روی mux پیش‌فرض ثبت می‌شود
go http.ListenAndServe("localhost:6060", nil) // پورت admin جدا، نه روی API عمومی
~~~
- \`go tool pprof -http=: http://host:6060/debug/pprof/profile?seconds=30\` برای CPU
- \`/heap\` برای حافظهٔ زنده (inuse) و \`/allocs\` برای کل allocation؛ \`-diff_base\` برای مقایسهٔ دو snapshot در جست‌وجوی leak
- \`/goroutine\`، \`/mutex\` و \`/block\` (این دو باید با \`runtime.SetMutexProfileFraction\` و \`SetBlockProfileRate\` فعال شوند)
- **Continuous profiling** (Pyroscope یا Parca) در production، و PGO (از Go 1.21) با CPU profile واقعی برای ۲ تا ۷٪ بهبود رایگان.

## سؤال مصاحبه
**«CPU سرویس بعد از release دو برابر شده. قدم‌هایتان؟»**
پاسخ: CPU profile قبل و بعد، مقایسه با \`-diff_base\`، پیدا کردن تابع جدید در flame graph، و تأیید با benchmark و canary.`,
        practicalMd: `در لب یکی از روزهای قبل یک benchmark بنویسید و با \`-cpuprofile\` و \`go tool pprof -top\` داغ‌ترین تابع را پیدا کنید.`,
        exampleMd: `~~~go
func TestOrderRepo(t *testing.T) {
	ctx := context.Background()
	pg, err := postgres.Run(ctx, "postgres:16-alpine", postgres.WithDatabase("test"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = pg.Terminate(ctx) })
	dsn, _ := pg.ConnectionString(ctx, "sslmode=disable")
	_ = dsn // migrate و تست repo واقعی
}
~~~`,
      }),
      goLesson({
        slug: "capstone-backend-outline",
        topicSlug: "be-architecture",
        titleFa: "Capstone: سرویس سفارش production-grade",
        objectiveFa: "همهٔ آموخته‌ها را در یک پروژهٔ قابل نمایش در رزومه و مصاحبه جمع کنید.",
        theoryMd: `## پروژه
یک سرویس سفارش که در مصاحبه بتوانید ۴۵ دقیقه دربارهٔ تصمیم‌هایش صحبت کنید:
- \`cmd/api\` (REST با ServeMux 1.22) و \`cmd/worker\` (consumer)
- Postgres با sqlc و migration، Redis برای cache با singleflight
- outbox و Kafka یا RabbitMQ برای \`order.created\` و consumer idempotent
- idempotency key روی \`POST /orders\`
- JWT با refresh rotation، rate limit (token bucket لب)
- slog، Prometheus RED و OTel trace، به همراه داشبورد Grafana
- تست: unit با fake، integration با testcontainers و \`-race\` در CI
- Dockerfile distroless، docker-compose و graceful shutdown

## چیزی که رزومه را قوی می‌کند
README با **ADR**ها (Architecture Decision Record): «چرا sqlc نه GORM»، «چرا outbox». نتایج benchmark و load test (k6) با p99. این‌ها در مصاحبه بیشتر از تعداد تکنولوژی‌ها ارزش دارند.`,
        practicalMd: `ADR اول پروژه را بنویسید: یک تصمیم، گزینه‌ها، انتخاب و پیامدها.`,
        exampleMd: `~~~text
ADR-001: Transactional outbox برای رویدادهای سفارش
Context: نیاز به انتشار order.created بدون گم شدن
Options: dual-write | outbox+relay | CDC (Debezium)
Decision: outbox+relay (ساده‌تر از CDC برای تیم فعلی)
Consequences: at-least-once → consumerها idempotent
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "استراتژی تست سرویس سفارش",
        topicSlug: "go-testing",
        lessonSlug: "testing-benchmark-pprof",
        path: "/tmp/be-day43-testing.txt",
        mustContain: "testcontainers",
        instructionsMd: `برای سرویس capstone بنویسید چه چیزی در هر سطح (unit، integration، HTTP، contract و e2e) تست می‌شود و CI چه دستورهایی اجرا می‌کند.`,
        answerOutlineFa:
          "unit: قوانین domain و service با fake repo؛ integration: repo و outbox با testcontainers Postgres؛ HTTP: handlerها با httptest؛ contract: buf breaking یا Pact؛ e2e: checkout. CI: go vet، golangci-lint، go test -race، تست integration با build tag و govulncheck.",
      }),
      noteExercise({
        titleFa: "برنامهٔ capstone و ADR",
        topicSlug: "be-architecture",
        lessonSlug: "capstone-backend-outline",
        path: "/tmp/be-day43-capstone.txt",
        mustContain: "ADR",
        instructionsMd: `معماری یک‌صفحه‌ای capstone و دو ADR (مثلاً sqlc در برابر GORM و outbox در برابر dual-write) را بنویسید.`,
        difficulty: "hard",
        maxScore: 25,
      }),
    ],
    scenario: noteScenario({
      titleFa: "رگرسیون پنهان بعد از «بهینه‌سازی»",
      path: "/tmp/be-day43-scenario.txt",
      mustContain: "-race",
      incidentMd: "بعد از بهینه‌سازی cache، latency بهتر شد ولی چند روز بعد کاربران قیمت محصول دیگری را می‌بینند.",
      symptomsMd: "تست‌ها سبزند؛ CI بدون -race اجرا می‌شود؛ cache جدید map معمولی است که از چند goroutine پر می‌شود.",
      rootCause: "data race در cache که بدون -race در CI دیده نشد؛ بهینه‌سازی بدون benchmark و تست هم‌زمانی merge شد",
    }),
    exam: {
      titleFa: "آزمون — تست و capstone",
      questions: [
        mc(
          "برای تست repository که Postgres-specific SQL دارد بهترین گزینه؟",
          ["mock کامل database/sql", "SQLite در حافظه", "Postgres واقعی با testcontainers", "تست نکردن"],
          "Postgres واقعی با testcontainers",
          "SQL، lockها و تایپ‌ها بین DBها فرق دارند.",
          "go-testing",
        ),
        tf("ثبت net/http/pprof روی پورت عمومی API ایمن است.", false, "اطلاعات داخلی و امکان DoS؛ پورت admin داخلی.", "be-observability"),
        sa("کدام پروفایل pprof برای یافتن goroutine leak؟", "goroutine", "/debug/pprof/goroutine", "be-observability"),
        mc(
          "PGO در Go چیست؟",
          ["Profile-Guided Optimization با CPU profile واقعی", "یک GC جدید", "ابزار lint", "پروتکل gRPC"],
          "Profile-Guided Optimization با CPU profile واقعی",
          "از Go 1.21؛ فایل default.pgo در پکیج main.",
          "be-observability",
        ),
      ],
    },
  }),
];
