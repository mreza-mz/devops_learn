import { day, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

export const goConcurrencyDays: DaySeed[] = [
  day({
    dayNumber: 9,
    phaseSlug: "go-concurrency",
    titleFa: "Goroutine و مدل اجرای Go",
    objectiveFa: "مدل M:N scheduling، هزینهٔ goroutine و الگوهای leak/panic را در مصاحبه توضیح دهید.",
    topicSlugs: ["go-goroutines", "go-patterns"],
    lessons: [
      goLesson({
        slug: "goroutine-fundamentals",
        topicSlug: "go-goroutines",
        titleFa: "Goroutine و scheduler",
        objectiveFa: "تفاوت thread OS و goroutine، نقش GOMAXPROCS و نقطهٔ yield را بدانید.",
        theoryMd: `## اهداف یادگیری
- ساخت goroutine با \`go\` و چرخهٔ عمر آن
- مدل G-M-P و نقش network poller
- هزینهٔ راه‌اندازی goroutine در مقابل thread

## توضیح مفهوم
Goroutine سبک است (~چند KB stack اولیه، قابل grow) و توسط runtime روی threadهای OS multiplex می‌شود. Scheduler work-stealing انجام می‌دهد. Blocking روی net I/O اغلب thread را آزاد می‌کند؛ blocking روی syscall یا lock ممکن است thread اضافه کند.

## کاربرد واقعی
HTTP handlerها، consumerهای queue، background refresh، parallel fan-out روی shardها — هر جا concurrency بدون هزاران thread OS لازم است.

## اشتباهات رایج
- راه انداختن goroutine بدون راه خروج (leak)
- فرض اینکه \`go func(){...}()\` panic را به main propagate می‌کند
- infinite goroutine spawn بدون backpressure
- شمارش goroutine با sleep به‌جای synchronization

## سؤالات مصاحبه
1. تفاوت goroutine و OS thread از نظر memory و switching؟
2. \`GOMAXPROCS\` چه چیزی را محدود می‌کند؟
3. چرا goroutine leak در production خطرناک‌تر از یک memory leak کوچک است؟`,
        practicalMd: `با \`runtime.NumGoroutine()\` قبل/بعد از یک بار اجرا الگوی leak را در یادداشت مقایسه کنید (روی کد نمونه).`,
        exampleMd: "`go func(){...}()` + channel برای هماهنگی.",
      }),
      goLesson({
        slug: "goroutine-leaks-panic",
        topicSlug: "go-patterns",
        titleFa: "Leak، panic و graceful coordination",
        objectiveFa: "الگوی errgroup، recover در worker و سیگنال shutdown را بشناسید.",
        theoryMd: `## اهداف یادگیری
- تشخیص goroutine leak (channel block، select بی‌پایان)
- panic در goroutine و recover محدود
- انتظار برای پایان کار با \`sync.WaitGroup\`

## توضیح مفهوم
Leak وقتی است که goroutine برای همیشه block مانده و GC آن را جمع نمی‌کند. panic فقط همان goroutine را می‌کشد مگر recover شود.

## کاربرد واقعی
سرویس‌های long-running با health check روی goroutine count؛ worker pool با context cancel.

## اشتباهات رایج
- \`WaitGroup.Add\` بعد از \`Wait\` یا race روی Add
- فراموش \`defer wg.Done()\`
- spawn بدون upper bound روی load spike

## سؤالات مصاحبه
1. الگوی ایمن shutdown چند goroutine چیست؟
2. چه زمانی \`runtime.Goexit\` درست است؟
3. چطور leak را با pprof goroutine profile پیدا می‌کنید؟`,
        practicalMd: `یک leak عمدی (goroutine منتظر channel بدون reader) را روی کاغذ ترسیم و مسیر unblock را بنویسید.`,
        exampleMd: `\`\`\`go
defer wg.Done(); defer func(){ recover() }()
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تحلیل goroutine leak",
        topicSlug: "go-goroutines",
        lessonSlug: "goroutine-leaks-panic",
        path: "/tmp/go-day9-leak.txt",
        mustContain: "block",
        instructionsMd: `سناریویی بنویسید که goroutine روی channel بدون buffer منتظر می‌ماند و reader ندارد. علت block بودن را توضیح دهید و واژهٔ block را در فایل بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "رشد بی‌نهایت goroutine پس از ترافیک",
      path: "/tmp/go-day9-scenario.txt",
      mustContain: "leak",
      incidentMd: "پس از کمپین مارکتینگ، RAM سرویس ۸GB شده و GOMEMLIMIT نزدیک است؛ CPU متوسط.",
      symptomsMd: "pprof goroutine نشان می‌دهد هزاران goroutine در حالت block روی unbuffered send.",
      rootCause: "spawn یک goroutine per request بدون semaphore یا worker pool؛ handler منتظر downstream کند می‌ماند",
    }),
    exam: {
      titleFa: "آزمون روز ۹ — Goroutine",
      questions: [
        mc(
          "panic در goroutine فرزند چه می‌شود؟",
          ["کل process exit می‌کند", "فقط همان goroutine می‌میرد مگر recover", "همیشه به main propagate می‌شود", "کامپایلر جلوگیری می‌کند"],
          "فقط همان goroutine می‌میرد مگر recover",
          "بدون recover، main ادامه می‌دهد ولی goroutine می‌میرد.",
          "go-goroutines",
        ),
        tf("هر goroutine دقیقاً یک OS thread اختصاصی دارد.", false, "M:N multiplexing روی thread pool است.", "go-goroutines"),
        sa("متغیر محیطی برای تعداد Pهای scheduler؟", "GOMAXPROCS", "تعداد threadهای قابل اجرای Go code همزمان.", "go-goroutines"),
        mc(
          "نشانهٔ رایج goroutine leak؟",
          ["کاهش CPU", "رشد monotonic goroutine count", "کاهش heap", "افزایش compile time"],
          "رشد monotonic goroutine count",
          "تعداد goroutineهای block‌شده مدام بالا می‌رود.",
          "go-patterns",
        ),
      ],
    },
  }),
  day({
    dayNumber: 10,
    phaseSlug: "go-concurrency",
    titleFa: "Channel — buffered، unbuffered و بستن",
    objectiveFa: "معنای synchronization در channel، قوانین close و nil channel را در عمق توضیح دهید.",
    topicSlugs: ["go-channels"],
    lessons: [
      goLesson({
        slug: "channels-sync",
        topicSlug: "go-channels",
        titleFa: "Buffered و unbuffered channels",
        objectiveFa: "تفاوت rendezvous و queue و happens-before روی send/recv را بدانید.",
        theoryMd: `## اهداف یادگیری
- Unbuffered: send تا recv sync می‌شود (handoff)
- Buffered: send تا فضا پر نشود block نمی‌شود
- close: دیگر send ممنوع؛ recv باقی‌مانده و سپس zero value + ok=false

## توضیح مفهوم
Channel هم communication و هم synchronization است. Unbuffered برای handoff قطعی؛ buffered برای decouple نرخ تولید/مصرف با cap مشخص.

## کاربرد واقعی
Pipeline stageها، limit concurrent work (semaphore با buffered channel)، signal one-shot با close.

## اشتباهات رایج
- double close (panic)
- send روی channel بسته‌شده توسط خودتان
- انتظار drain بدون range یا loop با ok
- buffered بزرگ بدون دلیل (ماسک کردن backpressure)

## سؤالات مصاحبه
1. چرا «do not communicate by sharing memory»؟
2. رفتار recv از channel بسته چیست؟
3. تفاوت nil channel در send/recv/select؟
4. چرا close فقط در producer و pipeline سه‌مرحله‌ای چطور deadlock می‌گیرد؟`,
        practicalMd: `unbuffered در برابر buffered cap=1 و pipeline کوتاه generate→map را شماتیک بکشید.`,
        exampleMd: `\`\`\`go
ch := make(chan int, 2); ch <- 1; close(ch)
for v := range ch { _ = v }
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تشخیص deadlock channel",
        topicSlug: "go-channels",
        lessonSlug: "channels-sync",
        path: "/tmp/go-day10-deadlock.txt",
        mustContain: "unbuffered",
        instructionsMd: `مثالی بنویسید که دو goroutine هر دو روی unbuffered send منتظرند. علت را توضیح کنید و unbuffered را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Deadlock در pipeline deploy",
      path: "/tmp/go-day10-scenario.txt",
      mustContain: "close",
      incidentMd: "سرویس ingest بعد از refactor گاهی hang می‌شود؛ هیچ CPU بالا نیست.",
      symptomsMd: "همه goroutineها block روی channel؛ یک stage دیگر send نمی‌کند.",
      rootCause: "consumer متوقف شد ولی producer همچنان send می‌کند روی unbuffered بدون listener؛ close هرگز فراخوانی نشد",
    }),
    exam: {
      titleFa: "آزمون روز ۱۰ — Channel",
      questions: [
        tf("ارسال روی channel بسته باعث panic می‌شود.", true, "مگر recover یا select با default طراحی شده باشد.", "go-channels"),
        mc(
          "recv از nil channel چه می‌کند؟",
          ["panic فوری", "block برای همیشه", "zero value برمی‌گرداند", "compile error"],
          "block برای همیشه",
          "عملیات روی nil channel block می‌ماند.",
          "go-channels",
        ),
        sa("چه کسی باید channel را close کند؟", "sender producer", "فقط طرفی که send می‌کند مالک close است.", "go-channels"),
        mc(
          "buffered channel با cap=0 معادل چیست؟",
          ["unbuffered", "همیشه non-blocking", "فقط برای int", "غیرقانونی"],
          "unbuffered",
          "make(chan T) و make(chan T, 0) یکسان‌اند.",
          "go-channels",
        ),
      ],
    },
  }),
  day({
    dayNumber: 11,
    phaseSlug: "go-concurrency",
    titleFa: "Select، timeout و multiplexing",
    objectiveFa: "select برای timeout، non-blocking و fan-in را در کد production توضیح دهید.",
    topicSlugs: ["go-select", "go-patterns"],
    lessons: [
      goLesson({
        slug: "select-basics",
        topicSlug: "go-select",
        titleFa: "Select و fairness",
        objectiveFa: "رفتار pseudo-random انتخاب case آماده و default را بدانید.",
        theoryMd: `## اهداف یادگیری
- select بین چند send/recv
- \`default\` برای non-blocking
- ترکیب با \`time.After\` برای timeout

## توضیح مفهوم
اگر چند case آماده باشد یکی pseudo-random انتخاب می‌شود. select روی nil channel هرگز انتخاب نمی‌شود (برای disable کردن case).

## کاربرد واقعی
Heartbeat، cancel درخواست طولانی، merge چند stream با select در loop.

## اشتباهات رایج
- busy loop با default بدون sleep/backoff
- leak timer با time.After در loop داغ (ترجیح time.NewTicker)
- فراموش کردن break؛ label برای خروج از for

## سؤالات مصاحبه
1. چطور case را در select غیرفعال کنید؟
2. تفاوت context deadline و time.After در handler؟`,
        practicalMd: `الگوی request با timeout با select بین result و time.After را طراحی کنید.`,
        exampleMd: `\`\`\`go
select {
case v := <-ch:
  return v
case <-time.After(2 * time.Second):
  return errors.New("timeout")
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "پیاده‌سازی timeout با context",
        topicSlug: "go-select",
        lessonSlug: "select-basics",
        path: "/tmp/go-day11-select.txt",
        mustContain: "select",
        instructionsMd: `شبه‌کد handler که با select بین ctx.Done() و work منتظر می‌ماند را بنویسید و select را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "CPU ۱۰۰٪ از busy select",
      path: "/tmp/go-day11-scenario.txt",
      mustContain: "default",
      incidentMd: "پس از افزودن polling، یک pod CPU saturated شده.",
      symptomsMd: "flame graph نشان می‌دهد loop تایت در select با default.",
      rootCause: "non-blocking select در tight loop بدون backoff یا block روی event",
    }),
    exam: {
      titleFa: "آزمون روز ۱۱ — Select",
      questions: [
        tf("select با همه caseهای nil block می‌ماند.", true, "هیچ case قابل انتخاب نیست.", "go-select"),
        mc(
          "برای disable کردن recv موقت در for-select؟",
          ["close channel", "assign nil به case channel", "panic", "GOMAXPROCS=1"],
          "assign nil به case channel",
          "nil channel در select هرگز اجرا نمی‌شود.",
          "go-select",
        ),
        sa("در loop داغ timeout کوتاه با چه API بهتر از time.After است؟", "time.NewTicker", "جلوگیری از leak timer در هر iteration.", "go-select"),
      ],
    },
  }),
  day({
    dayNumber: 12,
    phaseSlug: "go-concurrency",
    titleFa: "sync، Mutex و atomic",
    objectiveFa: "WaitGroup، Mutex/RWMutex، atomic و trade-off lock vs channel را مقایسه کنید.",
    topicSlugs: ["go-sync", "go-patterns"],
    lessons: [
      goLesson({
        slug: "waitgroup-mutex",
        topicSlug: "go-sync",
        titleFa: "WaitGroup و Mutex",
        objectiveFa: "data race را با mutex حل کنید و RWMutex را برای read-heavy انتخاب کنید.",
        theoryMd: `## اهداف یادگیری
- WaitGroup برای انتظار batch goroutine
- Mutex برای exclusive access
- RWMutex برای خوانندهٔ زیاد / نویسندهٔ کم

## توضیح مفهوم
Memory مشترک نیاز به happens-before دارد. Mutex سنگین‌تر از atomic برای counter ساده است ولی برای invariant پیچیده لازم است.

## کاربرد واقعی
In-memory cache با RWMutex؛ parallel HTTP fetch با WaitGroup.

## اشتباهات رایج
- کپی کردن sync.Mutex (همیشه pointer به struct حاوی mutex)
- lock nested بدون ترتیب ثابت → deadlock
- RLock سپس Lock در همان goroutine (deadlock)

## سؤالات مصاحبه
1. چه زمانی channel به‌جای mutex؟
2. چرا embedding sync.Mutex رایج است؟
3. atomic.Int64 برای counter و \`go test -race\` چه زمانی؟`,
        practicalMd: `Mutex vs atomic.Int64 برای counter؛ race detector در CI.`,
        exampleMd: `\`\`\`go
var c atomic.Int64; c.Add(1)
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "رفع data race",
        topicSlug: "go-sync",
        lessonSlug: "waitgroup-mutex",
        path: "/tmp/go-day12-race.txt",
        mustContain: "mutex",
        instructionsMd: `counter مشترک بدون sync را توصیف کنید و fix با mutex را بنویسید؛ mutex را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "نتیجهٔ تصادفی در cache",
      path: "/tmp/go-day12-scenario.txt",
      mustContain: "race",
      incidentMd: "cache in-memory گاهی دادهٔ قدیمی برمی‌گرداند؛ فقط زیر load بالا.",
      symptomsMd: "go test -race در integration fail می‌شود.",
      rootCause: "read map بدون RLock و concurrent write در refresh goroutine",
    }),
    exam: {
      titleFa: "آزمون روز ۱۲ — Sync",
      questions: [
        mc(
          "کدام برای parallel wait چند worker مناسب است؟",
          ["Mutex", "WaitGroup", "Once", "Cond بدون loop"],
          "WaitGroup",
          "WaitGroup انتظار پایان goroutineها را هماهنگ می‌کند.",
          "go-sync",
        ),
        tf("کپی شدن struct حاوی Mutex مجاز است.", false, "Mutex باید کپی نشود؛ از pointer استفاده کنید.", "go-sync"),
        mc(
          "read-heavy map in-memory؟",
          ["sync.Mutex only", "sync.RWMutex", "بدون lock", "channel فقط"],
          "sync.RWMutex",
          "RLock اجازهٔ خوانندگان همزمان می‌دهد.",
          "go-sync",
        ),
        sa("پرچم تست race detector؟", "go test -race", "instrumentation در runtime test.", "go-sync"),
      ],
    },
  }),
  day({
    dayNumber: 13,
    phaseSlug: "go-concurrency",
    titleFa: "Context — لغو، deadline و propagation",
    objectiveFa: "درخت context، لغو آبشاری و anti-patternهای value را توضیح دهید.",
    topicSlugs: ["go-context"],
    lessons: [
      goLesson({
        slug: "context-cancellation",
        topicSlug: "go-context",
        titleFa: "Cancellation و deadlines",
        objectiveFa: "WithCancel، WithTimeout، WithDeadline و listening روی Done را مسلط شوید.",
        theoryMd: `## اهداف یادگیری
- context سلسله‌مراتبی؛ cancel والد فرزند را لغو می‌کند
- همیشه defer cancel برای جلوگیری از leak
- انتقال ctx به تمام I/O و goroutine فرزند

## توضیح مفهوم
Context signal only است؛ دادهٔ business در value نگذارید مگر request-scoped metadata (trace id).

## کاربرد واقعی
HTTP server shutdown، gRPC deadline، query DB با timeout.

## اشتباهات رایج
- context در struct global
- ctx بدون cancel leak timer در WithTimeout
- check نکردن ctx.Err() در loop طولانی

## سؤالات مصاحبه
1. تفاوت Background و TODO؟
2. چرا context value برای optional parameter بد است؟
3. الگوی graceful shutdown با context؟`,
        practicalMd: `handler که ctx.Done را در select با query DB ترکیب می‌کند طراحی کنید.`,
        exampleMd: `\`\`\`go
ctx, cancel := context.WithTimeout(parent, 3*time.Second); defer cancel()
\`\`\`
HTTP: \`NewRequestWithContext\`؛ worker: ctx از message نه Background.`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "جلوگیری از context leak",
        topicSlug: "go-context",
        lessonSlug: "context-cancellation",
        path: "/tmp/go-day13-cancel.txt",
        mustContain: "defer cancel",
        instructionsMd: `چرا باید بعد از WithTimeout همیشه defer cancel() بزنید؟ توضیح کوتاه با عبارت defer cancel در فایل.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Timer leak بعد از refactor",
      path: "/tmp/go-day13-scenario.txt",
      mustContain: "WithTimeout",
      incidentMd: "heap تعداد زیادی time.Timer نشان می‌دهد پس از افزایش RPS.",
      symptomsMd: "goroutine profile تمیز؛ timer bucket بزرگ.",
      rootCause: "WithTimeout بدون defer cancel در path پرتکرار handler",
    }),
    exam: {
      titleFa: "آزمون روز ۱۳ — Context",
      questions: [
        tf("لغو context والد همهٔ فرزندان را لغو می‌کند.", true, "درخت cancel به descendants propagate می‌شود.", "go-context"),
        mc(
          "ctx.Err() بعد از cancel چه برمی‌گرداند؟",
          ["nil", "context.Canceled یا DeadlineExceeded", "panic", "string خالی"],
          "context.Canceled یا DeadlineExceeded",
          "نوع خطا مشخص است.",
          "go-context",
        ),
        sa("اولین پارامتر idiomatic برای cancelable work؟", "context.Context", "ctx به‌عنوان اولین arg.", "go-context"),
      ],
    },
  }),
  day({
    dayNumber: 14,
    phaseSlug: "go-concurrency",
    titleFa: "الگوهای production — pool، fan، shutdown",
    objectiveFa: "worker pool، fan-out/in، pipeline، rate limiter و graceful shutdown را طراحی کنید.",
    topicSlugs: ["go-patterns", "go-goroutines", "go-context"],
    lessons: [
      goLesson({
        slug: "worker-pool-fan",
        topicSlug: "go-patterns",
        titleFa: "Worker pool و fan-out/fan-in",
        objectiveFa: "محدود کردن parallelism و merge ایمن چند producer را پیاده‌سازی کنید.",
        theoryMd: `## اهداف یادگیری
- jobs/results channel با N worker
- fan-out: چند worker روی یک jobs
- fan-in: merge با WaitGroup + یک output channel

## کاربرد واقعی
پردازش batch upload، crawl URL، consumer Kafka با ثابت parallelism.

## اشتباهات رایج
- بستن jobs قبل از اتمام enqueue
- تعداد worker = تعداد item بدون cap روی memory

## سؤالات مصاحبه
1. semaphore با buffered channel چطور کار می‌کند؟
2. تفاوت errgroup و WaitGroup؟`,
        practicalMd: `pool با 5 worker و ctx cancel در وسیلهٔ کار طراحی کنید.`,
        exampleMd: `\`\`\`go
sem := make(chan struct{}, 10)
sem <- struct{}{}
defer func() { <-sem }()
\`\`\``,
      }),
      goLesson({
        slug: "rate-limit-shutdown",
        topicSlug: "go-patterns",
        titleFa: "Rate limiter و graceful shutdown",
        objectiveFa: "token bucket با time.Ticker و shutdown HTTP server را بدانید.",
        theoryMd: `## اهداف یادگیری
- rate.Limiter از x/time/rate
- http.Server Shutdown با context
- جمع‌آوری در-flight قبل از exit

## کاربرد واقعی
API public، protection از downstream، deploy بدون قطع ناگهانی.

## اشتباهات
- Shutdown بدون timeout
- بستن listener قبل از drain در-flight

## سؤالات مصاحبه
1. تفاوت leaky bucket و token bucket؟
2. چطور worker pool را با SIGTERM متوقف می‌کنید؟`,
        practicalMd: `ترتیب: signal → cancel ctx → Shutdown → WaitGroup workers را لیست کنید.`,
        exampleMd: `\`\`\`go
limiter := rate.NewLimiter(rate.Limit(10), 20)
if err := limiter.Wait(ctx); err != nil { return err }
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "semaphore با channel",
        topicSlug: "go-patterns",
        lessonSlug: "worker-pool-fan",
        path: "/tmp/go-day14-sem.txt",
        mustContain: "buffered",
        instructionsMd: `semaphore با buffered channel و cap ثابت توضیح دهید؛ buffered را در فایل بیاورید.`,
      }),
      noteExercise({
        titleFa: "چک‌لیست shutdown",
        topicSlug: "go-patterns",
        lessonSlug: "rate-limit-shutdown",
        path: "/tmp/go-day14-shutdown.txt",
        mustContain: "Shutdown",
        instructionsMd: `مراحل graceful shutdown برای http.Server را بنویسید و Shutdown را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Queue backlog و OOM",
      path: "/tmp/go-day14-scenario.txt",
      mustContain: "worker pool",
      incidentMd: "consumer نمی‌تواند با producer همگام شود؛ latency صف ساعت‌هاست.",
      symptomsMd: "memory به خاطر buffer بی‌نهایت jobs؛ downstream rate limit شده.",
      rootCause: "unbounded channel برای jobs بدون worker pool و backpressure به producer",
    }),
    exam: {
      titleFa: "آزمون روز ۱۴ — الگوها",
      questions: [
        mc(
          "محدود کردن ۱۰۰ concurrent call همزمان؟",
          ["sync.Once", "buffered chan struct{} با cap 100", "close(channel)", "atomic only"],
          "buffered chan struct{} با cap 100",
          "کلاسیک semaphore pattern در Go.",
          "go-patterns",
        ),
        tf("fan-in همیشه نیاز به mutex دارد.", false, "می‌توان با یک goroutine و select merge کرد.", "go-patterns"),
        mc(
          "برای rate limit استاندارد در Go؟",
          ["math/rand", "golang.org/x/time/rate", "sync.Map", "unsafe"],
          "golang.org/x/time/rate",
          "Token bucket آماده و thread-safe.",
          "go-patterns",
        ),
        sa("قبل از exit process چه متدی listener HTTP را graceful می‌بندد؟", "Shutdown", "Server.Shutdown با context.", "go-patterns"),
      ],
    },
  }),
];
