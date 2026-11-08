import { day, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

export const interviewDays: DaySeed[] = [
  day({
    dayNumber: 46,
    phaseSlug: "mock-interviews",
    titleFa: "مصاحبه: مبانی Go و هم‌زمانی",
    objectiveFa:
      "پاسخ شفاهی/نوشتاری ساخت‌یافته به سؤالات Mid/Senior دربارهٔ مدل حافظه، تایپ‌ها و concurrency در Go.",
    topicSlugs: ["iv-go", "go-memory-model", "go-goroutines"],
    lessons: [
      goLesson({
        slug: "iv-go-fundamentals-rubric",
        topicSlug: "iv-go",
        titleFa: "Rubrics مصاحبه مبانی Go",
        objectiveFa: "بدانید مصاحبه‌کننده به چه عمقی انتظار دارد و چگونه پاسخ لایه‌ای بدهید.",
        theoryMd: `## ساختار پاسخ خوب
1. **تعریف یک‌خطی** — بدون طولانی‌گویی
2. **مکانیزم داخلی** — کامپایلر، runtime، GC
3. **trade-off** — عملکرد، خوانایی، امنیت نوع
4. **مثال کوتاه** — کد یا سناریوی تولید

## نمونه Q&A
**سؤال:** escape analysis چیست؟
**پاسخ نمونه:** کامپایلر تصمیم می‌گیرد متغیر روی stack بماند یا به heap برود. اگر pointer به محلی برگردد یا در goroutine دیگر زنده بماند → heap → فشار GC. برای hot path از تخصیص بی‌دلیل پرهیز می‌کنیم.

## اشتباهات رایج
- شروع با جزئیات بی‌ربط
- نادیده گرفتن happens-before
- ادعای «همیشه» بدون استثنا`,
        practicalMd: `یک سؤال از لیست زیر را انتخاب کنید و در ۳ دقیقه پاسخ bullet بنویسید:
- تفاوت slice و array
- data race vs race condition
- چرا map concurrent-safe نیست`,
        exampleMd: `کلیدواژه‌های نمرهٔ کامل: **stack، heap، escape، -race، mutex، channel**`,
      }),
      goLesson({
        slug: "iv-concurrency-drill",
        topicSlug: "go-goroutines",
        titleFa: "مصاحبه هم‌زمانی — عمق Senior",
        objectiveFa: "worker pool، context cancel، و تشخیص leak را در قالب مصاحبه تمرین کنید.",
        theoryMd: `## سؤالات پرتکرار
| سؤال | نکات Rubric |
|------|-------------|
| buffered vs unbuffered channel | sync، ظرفیت، deadlock |
| ctx در HTTP handler | timeout، cancel propagation |
| goroutine leak | pprof، بلاک روی chan |

## پاسخ نمونه worker pool
goroutineهای ثابت + job channel + ctx برای shutdown؛ errgroup برای جمع‌آوری خطا.

## سؤال پیگیری
«اگر producer سریع‌تر از consumer باشد چه می‌کنید؟» → backpressure، bounded buffer، drop/metrics.`,
        practicalMd: `روی کاغذ یک worker pool با ۳ worker و ctx cancel طراحی کنید.`,
        exampleMd: `\`\`\`go
ctx, cancel := context.WithCancel(context.Background())
defer cancel()
jobs := make(chan int, 8)
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "دریل: توضیح escape analysis",
        topicSlug: "go-escape",
        lessonSlug: "iv-go-fundamentals-rubric",
        path: "/tmp/iv-day42-escape.txt",
        mustContain: "heap",
        instructionsMd: `در ۵ بولت پاسخ بنویسید: escape analysis چیست و چه ربطی به heap دارد؟`,
        hints: [
          { level: 1, textFa: "با تعریف یک‌خطی شروع کنید؛ بعد بگویید چه چیزی باعث escape می‌شود." },
          { level: 2, textFa: "از کلمات stack، heap و GC در پاسخ استفاده کنید." },
          { level: 3, textFa: "پاسخ نمونه: escape analysis تصمیم زمان کامپایل است که متغیر روی stack بماند یا به heap برود. اگر کامپایلر نتواند ثابت کند متغیر بعد از return استفاده نمی‌شود (pointer برگردانده‌شده، interface، closure که goroutine آن را نگه می‌دارد، اندازهٔ پویا)، آن را به heap می‌برد. heap یعنی فشار GC و latency. ابزار: go build -gcflags=-m." },
        ],
      }),
      noteExercise({
        titleFa: "دریل: channel و happens-before",
        topicSlug: "go-channels",
        lessonSlug: "iv-concurrency-drill",
        path: "/tmp/iv-day42-channel.txt",
        mustContain: "happens-before",
        instructionsMd: `تفاوت unbuffered channel از buffered را توضیح دهید و بگویید کدام عملیات happens-before می‌دهد.`,
        hints: [
          { level: 1, textFa: "unbuffered را به عنوان همگام‌سازی دو goroutine توصیف کنید." },
          { level: 2, textFa: "واژهٔ happens-before را صریحاً در متن بیاورید." },
          { level: 3, textFa: "پاسخ نمونه: در unbuffered، send تا رسیدن receiver منتظر می‌ماند (rendezvous)؛ در buffered تا پر شدن buffer منتظر نمی‌ماند. send روی channel نسبت به receive متناظرش happens-before دارد؛ در unbuffered، receive هم نسبت به پایان send happens-before دارد. close نسبت به receiveای که zero value به خاطر close می‌گیرد happens-before دارد." },
        ],
      }),
    ],
    scenario: noteScenario({
      titleFa: "یادداشت پنل — راند Go",
      path: "/tmp/iv-day42-panel.txt",
      mustContain: "depth",
      incidentMd: `**مصاحبه‌کننده ۱:** می‌خواهم عمق runtime ببینم.
**مصاحبه‌کننده ۲:** concurrency و shutdown graceful.
**داوطلب:** باید لایه‌ای پاسخ دهد: تعریف → مکانیزم → trade-off → مثال.`,
      symptomsMd: "پاسخ‌های سطحی یا فقط تعریف ویکی‌پدیا نمرهٔ Mid را نمی‌گیرند.",
      rootCause: "نبود مثال تولیدی و نادیده گرفتن ابعاد observability",
    }),
    exam: {
      titleFa: "آزمون — Go و concurrency",
      questions: [
        mc(
          "کدام گزینه برای ایجاد happens-before بین دو goroutine درست‌تر است؟",
          ["time.Sleep", "ارسال/دریافت روی channel بدون بافر", "افزایش int مشترک", "fmt.Println"],
          "ارسال/دریافت روی channel بدون بافر",
          "Channel unbuffered synchronization می‌دهد.",
          "iv-go",
        ),
        sa("پرچم race detector در Go چیست؟", "go test -race", "یا go run -race", "iv-go"),
        tf("map در Go برای concurrent read/write بدون sync امن است.", false, "نیاز به mutex یا sync.Map", "go-collections"),
        mc(
          "برای لغو کارهای پس‌زمینه در shutdown سرویس چه استفاده می‌شود؟",
          ["فقط os.Exit", "context.Cancel و graceful shutdown", "panic", "init()"],
          "context.Cancel و graceful shutdown",
          "الگوی استاندارد production.",
          "go-context",
        ),
        sa("یک علت رایج goroutine leak را نام ببرید.", "block on channel", "منتظر ماندن روی channel بدون reader", "iv-go"),
      ],
    },
  }),
  day({
    dayNumber: 47,
    phaseSlug: "mock-interviews",
    titleFa: "مصاحبه: الگوریتم و دیتابیس",
    objectiveFa: "پیچیدگی، ساختمان داده و تصمیم‌های دیتابیس را در قالب مصاحبه Backend بیان کنید.",
    topicSlugs: ["iv-go", "algo-complexity", "db-indexes"],
    lessons: [
      goLesson({
        slug: "iv-algorithms-rubric",
        topicSlug: "algo-complexity",
        titleFa: "Rubrics الگوریتم در مصاحبه",
        objectiveFa: "الگوی clarify → brute → optimize → code → test را دنبال کنید.",
        theoryMd: `## Rubric نمرهٔ کامل
- state کردن فرض ورودی (مرتب؟ محدودیت n؟)
- پیچیدگی زمانی/حافظه
- پیاده‌سازی Go تمیز
- edge case: خالی، تک‌عنصری

## نمونه
**Two-sum:** hash map O(n)؛ alternative دو pointer اگر مرتب باشد.

## سؤال پیگیری
«اگر حافظه محدود باشد؟»`,
        practicalMd: `مسئلهٔ two-sum را بدون کد کامل، فقط با مراحل حل توضیح دهید.`,
        exampleMd: `O(n) با map از complement استفاده می‌کند.`,
      }),
      goLesson({
        slug: "iv-database-rubric",
        topicSlug: "db-indexes",
        titleFa: "Rubrics دیتابیس",
        objectiveFa: "ایندکس، تراکنش و مقیاس‌پذیری را با زبان مصاحبه Senior توضیح دهید.",
        theoryMd: `## محورهای سؤال
- B-tree index، covering index
- isolation level و anomaly
- replication lag و read-your-writes
- sharding vs vertical scale

## پاسخ نمونه N+1
ORM lazy load → query اضافه؛ حل: preload/join.

## trade-off
ایندکس زیاد → write کندتر.`,
        practicalMd: `سناریوی «کندی لیست سفارش‌ها» را با فرض missing index تحلیل کنید.`,
        exampleMd: `EXPLAIN ANALYZE برای اثبات sequential scan.`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "دریل: پیچیدگی و ساختمان داده",
        topicSlug: "algo-complexity",
        lessonSlug: "iv-algorithms-rubric",
        path: "/tmp/iv-day43-algo.txt",
        mustContain: "O(n)",
        instructionsMd: `برای جستجوی عضو در slice نامرتب و در map، پیچیدگی را مقایسه کنید و O(n) را در متن بیاورید.`,
        hints: [
          { level: 1, textFa: "slice linear scan؛ map تقریباً O(1) average." },
          { level: 2, textFa: "حتماً O(n) برای slice ذکر شود." },
          { level: 3, textFa: "پاسخ نمونه: جست‌وجو در slice نامرتب O(n) است (اسکن خطی)؛ در map میانگین O(1) و بدترین حالت O(n) با تصادم. trade-off: map حافظهٔ بیشتر و ترتیب ندارد؛ برای n کوچک (کمتر از حدود ۱۰ تا ۲۰) اسکن slice به خاطر cache locality حتی سریع‌تر است." },
        ],
      }),
      noteExercise({
        titleFa: "دریل: ایندکس و کوئری کند",
        topicSlug: "db-indexes",
        lessonSlug: "iv-database-rubric",
        path: "/tmp/iv-day43-index.txt",
        mustContain: "index",
        instructionsMd: `چرا فیلتر روی ستون بدون index کند است؟ کلمهٔ index را در پاسخ بیاورید.`,
        hints: [
          { level: 1, textFa: "sequential scan vs index seek." },
          { level: 2, textFa: "از composite index در WHERE + ORDER BY یاد کنید." },
          { level: 3, textFa: "پاسخ نمونه: بدون index، DB کل جدول را می‌خواند (Seq Scan با O(n)). index B-Tree جست‌وجو را O(log n) می‌کند. برای WHERE a=? ORDER BY b index ترکیبی (a, b) هم فیلتر و هم مرتب‌سازی را پوشش می‌دهد. با EXPLAIN ANALYZE تأیید کنید؛ هزینه: کندتر شدن نوشتن و حافظهٔ بیشتر." },
        ],
      }),
    ],
    scenario: noteScenario({
      titleFa: "یادداشت پنل — الگوریتم و SQL",
      path: "/tmp/iv-day43-panel.txt",
      mustContain: "trade-off",
      incidentMd: `**پنل:** ابتدا ۲۰ دقیقه coding سبک، سپس deep dive روی کوئری کند در production.`,
      symptomsMd: "داوطلب فقط کد می‌نویسد بدون تحلیل پیچیدگی یا plan برای index.",
      rootCause: "نادیده گرفتن بخش communicate و trade-off",
    }),
    exam: {
      titleFa: "آزمون — الگوریتم و DB",
      questions: [
        sa("پیچیدگی merge sort چیست؟", "O(n log n)", "مرتب‌سازی تقسیم‌و‌حل", "algo-complexity"),
        mc(
          "برای کوتاه‌ترین مسیر در گراف بدون وزن منفی معمولاً چه استفاده می‌شود؟",
          ["DFS", "BFS", "Dijkstra", "Floyd"],
          "BFS",
          "لایه‌لایه از مبدأ.",
          "algo-trees",
        ),
        tf("phantom read در سطح REPEATABLE READ هنوز ممکن است (بسته به DB).", true, "بسته به پیاده‌سازی RDBMS", "db-tx"),
        sa("cache-aside در write چه کار می‌کند؟", "invalidate", "حذف یا به‌روز کردن cache", "db-cache"),
        mc(
          "N+1 معمولاً از کجا می‌آید؟",
          ["یک JOIN بزرگ", "lazy loading در ORM", "index زیاد", "VACUUM"],
          "lazy loading در ORM",
          "حلقهٔ query در application layer.",
          "db-sql",
        ),
        tf("sharding همیشه جایگزین replication برای read scale است.", false, "اهداف متفاوت", "db-cache"),
      ],
    },
  }),
  day({
    dayNumber: 48,
    phaseSlug: "mock-interviews",
    titleFa: "مصاحبه: طراحی سیستم (URL Shortener)",
    objectiveFa: "یک سؤال طراحی سیستم را از requirements تا deep dive (مثلاً کوتاه‌کننده URL) کامل جلو ببرید.",
    topicSlugs: ["iv-system", "sd-scaling", "sd-fundamentals"],
    lessons: [
      goLesson({
        slug: "iv-system-design-framework",
        topicSlug: "sd-fundamentals",
        titleFa: "چارچوب ۴۵ دقیقه‌ای System Design",
        objectiveFa: "requirements، estimation، API، data model، scaling و failure را پوشش دهید.",
        theoryMd: `## مراحل
1. Functional / non-functional (latency, QPS, durability)
2. Back-of-envelope: ترافیک، storage
3. API و flow
4. ذخیره‌سازی + cache
5. bottlenecks و monitoring

## URL Shortener — Rubric
- encode: hash/base62 vs auto-increment + obfuscate
- redirect 301/302
- collision handling
- analytics async`,
        practicalMd: `برای ۱۰M URL/day حجم ذخیره را تخمین بزنید.`,
        exampleMd: `Key: shortCode → longUrl mapping؛ TTL اختیاری.`,
      }),
      goLesson({
        slug: "iv-url-shortener-deep",
        topicSlug: "sd-scaling",
        titleFa: "Deep dive: URL Shortener",
        objectiveFa: "cache، DB sharding و hot key را در همان سؤال بحث کنید.",
        theoryMd: `## پاسخ لایهٔ Senior
- read-heavy → CDN/cache for redirect
- write path: generate id در سرویس جدا
- single point: DB → read replicas + cache invalidation

## سؤال پیگیری پنل
«اگر short code قابل حدس باشد؟» → entropy، rate limit، abuse detection.

## ارتباط با rate limiter
همان روز می‌توانید limiter را به عنوان follow-up طراحی کنید.`,
        practicalMd: `diagram ساده client → API → cache → DB برای redirect بنویسید.`,
        exampleMd: `302 برای آمار کلیک؛ 301 برای cache دائمی مرورگر.`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی API کوتاه‌کننده",
        topicSlug: "sd-fundamentals",
        lessonSlug: "iv-url-shortener-deep",
        path: "/tmp/iv-day44-api.txt",
        mustContain: "POST",
        instructionsMd: `دو endpoint اصلی (ایجاد لینک و redirect) را با متد HTTP مناسب لیست کنید؛ POST را ذکر کنید.`,
        hints: [
          { level: 1, textFa: "create نیاز به body دارد؛ redirect با GET." },
          { level: 2, textFa: "POST /api/v1/links و GET /:code" },
          { level: 3, textFa: "پاسخ نمونه: POST /api/v1/links با بدنهٔ {url} پاسخ 201 و {code, short_url} برمی‌گرداند؛ GET /{code} پاسخ 302 با هدر Location می‌دهد (یا 301 اگر analytics لازم نیست)، و 404 یا 410 برای کد ناموجود یا منقضی." },
        ],
      }),
      noteExercise({
        titleFa: "تخمین ظرفیت",
        topicSlug: "sd-scaling",
        lessonSlug: "iv-system-design-framework",
        path: "/tmp/iv-day44-scale.txt",
        mustContain: "cache",
        instructionsMd: `برای read-heavy بودن redirect، نقش cache را در یک پاراگراف کوتاه توضیح دهید.`,
        hints: [
          { level: 1, textFa: "اکثر ترافیک redirect است نه create." },
          { level: 2, textFa: "Redis/Memcached جلوی DB." },
          { level: 3, textFa: "پاسخ نمونه: نسبت خواندن به نوشتن حدود ۱۰۰ به ۱ است؛ redirectها از Redis (cache-aside، کلید code و مقدار url، با TTL) سرو می‌شوند تا DB فقط miss و create را ببیند. کلیدهای داغ: cache محلی در process یا CDN. negative cache برای کدهای ناموجود." },
        ],
      }),
    ],
    scenario: noteScenario({
      titleFa: "یادداشت پنل — System Design",
      path: "/tmp/iv-day44-panel.txt",
      mustContain: "estimate",
      incidentMd: `**مدیر:** ۴۵ دقیقه روی URL shortener؛ در ۱۰ دقیقه آخر rate limiting را follow-up بپرسید.
**نمرهٔ بالا:** back-of-envelope واضح + failure mode (DB down).`,
      symptomsMd: "شروع مستقیم با Redis بدون requirements.",
      rootCause: "نپرسیدن QPS و read/write ratio",
    }),
    exam: {
      titleFa: "آزمون — طراحی سیستم",
      questions: [
        sa("در CAP هنگام partition کدام دو را trade-off می‌کنیم؟", "consistency availability", "CP یا AP", "sd-fundamentals"),
        mc(
          "برای جلوگیری از hot key در sharded cache چه کمک می‌کند؟",
          ["یک shard", "replication + random salt در key", "حذف cache", "فقط SQL"],
          "replication + random salt در key",
          "توزیع بار خواندن.",
          "sd-scaling",
        ),
        tf("301 redirect برای shortener همیشه بهتر از 302 است.", false, "302 برای analytics دقیق‌تر", "sd-fundamentals"),
        sa("sliding window rate limiter معمولاً کجا state نگه می‌دارد؟", "redis", "memory/redis مشترک", "sd-reliability"),
        mc(
          "اولین قدم در system design interview چیست؟",
          ["انتخاب Kafka", "جمع‌آوری requirements", "نوشتن کد Go", "انتخاب رنگ UI"],
          "جمع‌آوری requirements",
          "قبل از هر معماری.",
          "iv-system",
        ),
      ],
    },
  }),
  day({
    dayNumber: 49,
    phaseSlug: "mock-interviews",
    titleFa: "مصاحبهٔ رفتاری و رهبری فنی (Senior)",
    objectiveFa: "تجربه‌هایتان را با STAR و عدد روایت کنید و نشان دهید Senior یعنی ownership، تصمیم‌گیری و رشد دادن تیم.",
    topicSlugs: ["iv-behavioral", "iv-full"],
    lessons: [
      goLesson({
        slug: "iv-behavioral-star",
        topicSlug: "iv-behavioral",
        titleFa: "راند رفتاری: چه چیزی Senior را از Mid جدا می‌کند",
        objectiveFa: "داستان‌های آماده با ساختار STAR داشته باشید و سیگنال‌های Senior را در آن‌ها نشان دهید.",
        theoryMd: `## چرا این راند تعیین‌کننده است
در شرکت‌های بزرگ (اسنپ، دیجی‌کالا، بانک‌ها و فین‌تک‌ها) خیلی وقت‌ها **سطح** (Mid یا Senior) در راند رفتاری و System Design تعیین می‌شود، نه در کدنویسی. کد خوب شما را Mid می‌کند؛ اینکه چطور تصمیم گرفتید، ریسک را مدیریت کردید و دیگران را بالا کشیدید شما را Senior می‌کند.

## ساختار STAR (با تأکید بر R)
- **Situation** (۱ تا ۲ جمله): بستر و مقیاس. «سرویس ارسال پیامک با ۲ هزار درخواست در ثانیه...»
- **Task**: مسئولیت **شما**، نه تیم.
- **Action** (بیشترین زمان): تصمیم‌ها، گزینه‌های ردشده و چرا. «من» بگویید، نه «ما».
- **Result**: **عدد**. p99 از ۸۰۰ به ۱۲۰ میلی‌ثانیه، هزینهٔ زیرساخت ۳۰٪ کمتر، incidentها از ۴ به ۰ در ماه. و درسی که گرفتید.

## سیگنال‌های Senior که مصاحبه‌گر دنبالشان است
1. **Ownership:** مشکلی که مال شما نبود را تا آخر پیگیری کردید.
2. **Trade-off آگاهانه:** «X را انتخاب کردیم چون...، هزینه‌اش Y بود و این‌طور مدیریتش کردیم.»
3. **ابهام:** نیازمندی گنگ را به طرح قابل اجرا تبدیل کردید (design doc یا RFC).
4. **تأثیر فراتر از کد خودتان:** code review، mentoring، استاندارد تیم (linter، CI، runbook).
5. **مدیریت incident:** آرامش، ارتباط شفاف با ذی‌نفعان و postmortem بدون مقصرتراشی.
6. **اختلاف نظر:** «disagree and commit» با داده، نه با سمت.

## بانک داستان (قبل از مصاحبه آماده کنید)
۶ داستان که هر کدام چند سؤال را پوشش دهد:
| داستان | سؤال‌هایی که جواب می‌دهد |
|---|---|
| سخت‌ترین incident | فشار، دیباگ، ارتباط |
| یک تصمیم فنی بزرگ | trade-off، تأثیر، اقناع |
| یک شکست یا اشتباه | یادگیری، صداقت |
| اختلاف با همکار یا مدیر | تعارض، تأثیرگذاری |
| رشد دادن یک نفر | mentoring و رهبری |
| بهبودی که خودتان شروع کردید | ownership |

## اشتباهات رایج
- داستان بدون عدد و نتیجه.
- «ما» در همهٔ جمله‌ها، طوری که نقش شما دیده نمی‌شود.
- مقصر دانستن دیگران در داستان شکست.
- داستان‌های قدیمی و کوچک برای سطح Senior.

## سؤال‌های پرتکرار
- «پیچیده‌ترین سیستمی که طراحی کردید را توضیح دهید.» (معمولاً ۲۰ دقیقه deep dive با سؤال‌های تعقیبی)
- «زمانی که با تصمیم فنی تیم مخالف بودید؟»
- «یک باگ production که شما ساختید؟»
- «چطور کیفیت کد تیم را بالا بردید؟»
- «یک کار را با deadline سخت چطور اولویت‌بندی کردید؟»`,
        practicalMd: `داستان «سخت‌ترین incident» خود را با STAR بنویسید و حداقل دو عدد در Result بیاورید. اگر تجربهٔ کاری مرتبط ندارید، از capstone همین دوره استفاده کنید.`,
        exampleMd: `~~~text
S: سرویس ارسال پیامک، ۲k RPS، روزهای کمپین ۵ برابر.
T: من on-call بودم؛ p99 تحویل به اپراتور به ۴۰ ثانیه رسیده بود.
A: با pprof دیدم ۸۰ هزار goroutine منتظر کانکشن اپراتورند (بدون سقف هم‌زمانی).
   worker pool با سقف per-operator و backpressure به صف گذاشتم؛ گزینهٔ
   «افزایش pod» را رد کردم چون اپراتور rate limit داشت و مشکل بدتر می‌شد.
R: p99 به ۱.۲ ثانیه رسید، retryهای اپراتور ۹۰٪ کم شد؛ runbook و alert روی
   go_goroutines اضافه کردم و در postmortem تیم را با الگو آشنا کردم.
~~~`,
      }),
      goLesson({
        slug: "iv-tech-leadership",
        topicSlug: "iv-behavioral",
        titleFa: "رهبری فنی: design doc، code review و mentoring",
        objectiveFa: "نشان دهید چطور تصمیم‌های فنی را مستند، بازبینی و در تیم جاری می‌کنید.",
        theoryMd: `## Design doc یا RFC
برای هر تغییری که بیش از یک sprint طول می‌کشد یا چند تیم را درگیر می‌کند:
1. **Context و مسئله** (با عدد)
2. **اهداف و non-goals** (non-goal ها مهم‌ترند)
3. **گزینه‌ها** (حداقل دو) با trade-off
4. **طرح انتخابی**: API، داده، migration و rollout
5. **ریسک‌ها**، rollback، observability و هزینه
6. سؤال‌های باز

## Code review در سطح Senior
- اولویت: **درستی و امنیت**، سپس طراحی و قابلیت نگهداری، سپس خوانایی، و در آخر سلیقه.
- سلیقه را به linter بسپارید، نه به کامنت review.
- کامنت سؤالی و آموزشی («اگر X رخ دهد چه می‌شود؟») به جای دستوری. nit را برچسب بزنید.
- PR کوچک بخواهید و خودتان بدهید (کمتر از ۴۰۰ خط).
- چیزهایی که در Go می‌بینید: goroutine بدون مسیر خروج، ctx پاس‌داده‌نشده، خطای بلعیده‌شده، lock زیر I/O و interface بی‌جا.

## Mentoring و استاندارد تیم
- pair programming روی کار واقعی، نه سخنرانی.
- استانداردها را **کد کنید**: template سرویس، config مشترک golangci-lint، CI مشترک و runbook.
- incident review بدون مقصرتراشی و با action item دارای مالک و تاریخ.

## تخمین و اولویت‌بندی
تخمین با بازه («۳ تا ۵ روز، ریسک اصلی migration است»)، شکستن کار، و تحویل تدریجی پشت feature flag.

## سؤال مصاحبه
**«یک Junior PR بزرگی فرستاده که طراحی‌اش مشکل دارد. چه می‌کنید؟»**
پاسخ: قبل از کامنت‌های ریز، یک گفت‌وگوی کوتاه دربارهٔ طراحی (یا جلسهٔ ۱۵ دقیقه‌ای). مشکل اصلی و دلیلش را توضیح می‌دهم، پیشنهاد شکستن PR می‌دهم و کمک می‌کنم نسخهٔ اول را merge کند. هدف یاد گرفتن اوست، نه کد بی‌نقص من.`,
        practicalMd: `یک design doc یک‌صفحه‌ای برای «اضافه کردن outbox به سرویس سفارش» با بخش‌های بالا بنویسید.`,
        exampleMd: `~~~text
Non-goals: تغییر schema رویدادهای فعلی؛ مهاجرت به CDC.
Rollout: ۱) جدول outbox  ۲) نوشتن دوگانه پشت flag  ۳) relay در shadow mode
         ۴) مقایسهٔ تعداد رویدادها  ۵) حذف producer مستقیم
Rollback: خاموش کردن flag؛ relay idempotent است.
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "بانک داستان STAR",
        topicSlug: "iv-behavioral",
        lessonSlug: "iv-behavioral-star",
        path: "/tmp/iv-behavioral-stories.txt",
        mustContain: "Result",
        instructionsMd: `سه داستان (incident، تصمیم فنی بزرگ، و یک شکست) را با برچسب‌های Situation، Task، Action و Result بنویسید. هر Result حداقل یک عدد داشته باشد و در Action حداقل یک گزینهٔ ردشده و دلیلش بیاید.`,
        difficulty: "hard",
        maxScore: 20,
        answerOutlineFa:
          "هر داستان: S کوتاه با مقیاس؛ T مسئولیت شخصی؛ A تصمیم‌ها با «من» و گزینهٔ ردشده و دلیلش؛ R با عدد (latency، هزینه، تعداد incident) و یک درس. داستان شکست باید مسئولیت‌پذیری و تغییر رفتار بعدی را نشان دهد.",
      }),
      noteExercise({
        titleFa: "code review یک PR",
        topicSlug: "iv-behavioral",
        lessonSlug: "iv-tech-leadership",
        path: "/tmp/iv-behavioral-review.txt",
        mustContain: "context",
        instructionsMd: `برای این تکه کد سه کامنت review بنویسید: یکی blocking، یکی پیشنهادی و یکی nit. لحن آموزشی باشد.

~~~go
func (s *Service) Notify(userIDs []int64, msg string) {
	for _, id := range userIDs {
		go func(id int64) {
			u, _ := s.users.Get(context.Background(), id)
			s.sms.Send(u.Phone, msg)
		}(id)
	}
}
~~~`,
        answerOutlineFa:
          "blocking: goroutine نامحدود بدون سقف و بدون انتظار؛ خطای Get بلعیده شده و u خالی ارسال می‌شود؛ context.Background به جای ctx caller. پیشنهادی: worker pool یا errgroup با SetLimit و برگرداندن خطا؛ idempotency برای ارسال. nit: نام msg را به body تغییر دهید و تابع ctx بگیرد.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "یادداشت پنل — راند رفتاری",
      path: "/tmp/iv-behavioral-panel.txt",
      mustContain: "ownership",
      incidentMd: "**بازخورد پنل:** «فنی قوی است ولی در داستان‌ها نقش خودش مشخص نبود و هیچ عدد یا نتیجه‌ای نگفت. سطح پیشنهادی: Mid.»",
      symptomsMd: "همهٔ پاسخ‌ها با «ما» شروع شدند؛ داستان incident بدون نتیجهٔ قابل اندازه‌گیری؛ هیچ اشاره‌ای به trade-off یا گزینهٔ ردشده نبود.",
      rootCause: "نبود بانک داستان آماده با STAR؛ ownership و تأثیر شخصی نشان داده نشد",
    }),
    exam: {
      titleFa: "آزمون — رفتاری و رهبری",
      questions: [
        mc(
          "کدام بخش STAR در سطح Senior بیشترین وزن را دارد؟",
          ["Situation", "Task", "Action و Result با عدد", "هیچ‌کدام"],
          "Action و Result با عدد",
          "تصمیم‌ها، trade-off و تأثیر قابل اندازه‌گیری.",
          "iv-behavioral",
        ),
        tf("در داستان رفتاری بهتر است همیشه «ما» بگویید تا تیمی به نظر برسید.", false, "مصاحبه‌گر باید نقش شخصی شما را ببیند.", "iv-behavioral"),
        mc(
          "مهم‌ترین بخش design doc که اغلب جا می‌افتد؟",
          ["فونت", "non-goals و گزینه‌های ردشده", "اسم پروژه", "تاریخچهٔ شرکت"],
          "non-goals و گزینه‌های ردشده",
          "دامنه را محدود و تصمیم را قابل دفاع می‌کند.",
          "iv-behavioral",
        ),
        tf("اختلاف سلیقه در فرمت کد بهتر است در code review بحث شود.", false, "به gofmt و linter بسپارید.", "iv-behavioral"),
      ],
    },
  }),

  day({
    dayNumber: 50,
    phaseSlug: "mock-interviews",
    titleFa: "Mock کامل Senior Backend + شبیه‌ساز درون‌برنامه",
    objectiveFa:
      "ترکیب Go، الگوریتم، DB، طراحی سیستم و backend production؛ آشنایی با مسیر «مصاحبه آزمایشی» در منو.",
    topicSlugs: ["iv-full", "be-http", "iv-go"],
    lessons: [
      goLesson({
        slug: "iv-full-mock-structure",
        topicSlug: "iv-full",
        titleFa: "ساختار مصاحبه کامل ۹۰ دقیقه‌ای",
        objectiveFa: "توزیع زمانی بین coding، system design و behavioral فنی.",
        theoryMd: `## بلوک‌های رایج
| بلوک | مدت | محتوا |
|------|-----|--------|
| Coding | ۳۵–۴۵ دقیقه | Go + الگوریتم |
| System | ۳۵ دقیقه | یک سوال عمیق |
| Deep dive | ۱۰–۱۵ دقیقه | پروژهٔ گذشته / observability |

## نمره‌دهی پنل
ارتباط، عمق، pragmatic trade-off

## استفاده از شبیه‌ساز
منوی **مصاحبه آزمایشی** → حالت سریع (۱۰) یا استاندارد (۲۰) → پس از هر سؤال بازخورد AI → گزارش نهایی با درس پیشنهادی.`,
        practicalMd: `یک بار حالت quick شبیه‌ساز را اجرا کنید و ضعف دسته‌ای را یادداشت کنید.`,
        exampleMd: `پس از session، روزهای مرتبط با ضعیف‌ترین دسته را برای مرور پیشنهاد می‌دهد.`,
      }),
      goLesson({
        slug: "iv-backend-production",
        topicSlug: "be-http",
        titleFa: "سؤالات Backend تولیدی",
        objectiveFa: "auth، graceful shutdown، outbox و golden signals را در یک پاسخ coherent بیاورید.",
        theoryMd: `## Rubric
- JWT: access کوتاه، refresh امن
- Shutdown: signal → drain → timeout
- Outbox: consistency با broker
- SRE: latency/traffic/errors/saturation

## behavioral فنی
«آخرین incident شما؟»: پاسخ با STAR و متریک قبل و بعد (جزئیات در روز «مصاحبهٔ رفتاری و رهبری فنی»).`,
        practicalMd: `یک پاراگراف دربارهٔ graceful shutdown در Go HTTP server بنویسید.`,
        exampleMd: `signal.Notify + Server.Shutdown(ctx)`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "خودارزیابی پس از mock",
        topicSlug: "iv-full",
        lessonSlug: "iv-full-mock-structure",
        path: "/tmp/iv-day45-self.txt",
        mustContain: "simulator",
        instructionsMd: `بنویسید از شبیه‌ساز درون‌برنامه (simulator) چگونه در هفتهٔ آینده استفاده می‌کنید.`,
        hints: [
          { level: 1, textFa: "حالت standard هفتگی یک بار." },
          { level: 2, textFa: "کلمهٔ simulator را در متن بیاورید." },
          { level: 3, textFa: "پاسخ نمونه: هر هفته یک simulator در حالت standard؛ دو دستهٔ ضعیف گزارش را انتخاب می‌کنم، روزهای پیشنهادی را مرور و لب‌هایشان را دوباره بدون hint حل می‌کنم؛ هفتهٔ بعد مقایسه می‌کنم." },
        ],
      }),
      noteExercise({
        titleFa: "دریل: golden signals",
        topicSlug: "be-observability",
        lessonSlug: "iv-backend-production",
        path: "/tmp/iv-day45-signals.txt",
        mustContain: "latency",
        instructionsMd: `چهار golden signal را نام ببرید؛ latency حتماً باشد.`,
        hints: [
          { level: 1, textFa: "از Google SRE book." },
          { level: 2, textFa: "latency, traffic, errors, saturation" },
          { level: 3, textFa: "پاسخ نمونه: latency (به تفکیک موفق و ناموفق، با p99)، traffic (RPS)، errors (نرخ ۵xx و خطاهای منطقی)، saturation (CPU، حافظه، pool دیتابیس، طول صف). برای هر کدام یک متریک Prometheus و یک آستانهٔ alert مبتنی بر SLO." },
        ],
      }),
    ],
    scenario: noteScenario({
      titleFa: "یادداشت پنل — راند نهایی Senior",
      path: "/tmp/iv-day45-panel.txt",
      mustContain: "senior",
      incidentMd: `**پنل ترکیبی:** coding (Go concurrency) + طراحی notification system + سوال observability.
انتظار: trade-off شفاف، ذکر monitoring و rollout plan.`,
      symptomsMd: "پاسخ‌های پراکنده بدون جمع‌بندی.",
      rootCause: "نبود تمرین timed mock",
    }),
    exam: {
      titleFa: "آزمون — Mock کامل",
      questions: [
        mc(
          "بهترین مسیر تمرین هفتگی با این پلتفرم؟",
          ["فقط خواندن theory", "مصاحبه آزمایشی standard + مرور روز ضعیف", "رد کردن exam", "فقط scenario"],
          "مصاحبه آزمایشی standard + مرور روز ضعیف",
          "حلقهٔ بازخورد شبیه‌ساز + curriculum.",
          "iv-full",
        ),
        sa("نام یک golden signal مربوط به خطا", "errors", "error rate", "be-observability"),
        tf("outbox pattern برای exactly-once بدون idempotent consumer کافی است.", false, "معمولاً at-least-once", "be-architecture"),
        mc(
          "در JWT flow refresh token کجا باید امن ذخیره شود؟",
          ["localStorage همیشه", "httpOnly cookie یا secure store", "URL query", "console.log"],
          "httpOnly cookie یا secure store",
          "کاهش XSS risk.",
          "be-auth",
        ),
        sa("متد HTTP idempotent برای جایگزینی کامل resource؟", "PUT", "PUT/DELETE", "be-http"),
        tf("مصاحبه senior فقط به کدنویسی محدود است.", false, "design و production مهارت هم هست", "iv-full"),
      ],
    },
  }),
];
