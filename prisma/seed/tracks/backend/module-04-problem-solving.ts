import { day, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

export const problemSolvingDays: DaySeed[] = [
  day({
    dayNumber: 23,
    phaseSlug: "problem-solving",
    titleFa: "دیباگ سیستماتیک و memory leak",
    objectiveFa: "فرایند triage، pprof و تمایز leak حافظه از goroutine را در incident حل کنید.",
    topicSlugs: ["ps-debugging"],
    lessons: [
      goLesson({
        slug: "debugging-process",
        topicSlug: "ps-debugging",
        titleFa: "فرایند عیب‌یابی production",
        objectiveFa: "مشاهده → فرض → آزمایش → تأیید را در پاسخ مصاحبه ساختار بدهید.",
        theoryMd: `## اهداف یادگیری
- جمع‌آوری سیگنال: metrics، logs، traces، profiles
- ایزوله کردن متغیر: deploy، region، version
- نوشتن postmortem با action items

## توضیح مفهوم
دیباگ مهندسی فراتر از printf است: reproducibility، bisect، و hypothesis-driven investigation.

## کاربرد واقعی
on-call SRE؛ رگرسیون بعد از release؛ مشتری گزارش کندی.

## اشتباهات رایج
- deploy بی‌برنامه برای «امتحان کردن»
- نادیده گرفتن correlation id
- fix symptom بدون RCA

## سؤالات مصاحبه
1. اولین ۵ قدم وقتی error rate ۵x شد؟
2. چطور bisect بین code و config؟`,
        practicalMd: `چک‌لیست triage ۱۰ دقیقه‌ای برای سرویس Go بنویسید.`,
        exampleMd: `metrics → logs sample → trace slow → profile heap/goroutine`,
      }),
      goLesson({
        slug: "memory-leak-go",
        topicSlug: "ps-debugging",
        titleFa: "Memory leak در سرویس Go",
        objectiveFa: "heap profile، retain path و leak از slice/map/timer را تشخیص دهید.",
        theoryMd: `## اهداف یادگیری
- RSS بالا vs heap در-use vs idle
- pprof heap و allocs
- leak: global map بدون eviction، subscription فراموش، timer

## کاربرد واقعی
cache بدون TTL، goroutine با buffer بزرگ، json decoder reuse غلط

## اشتباهات
- فرض فقط GC مشکل است
- ignore کردن off-heap (CGO)

## سؤالات مصاحبه
1. diff دو heap profile؟
2.چرا leak گاهی بعد از روزها دیده می‌شود؟`,
        practicalMd: `مسیر تحقیق heap leak را از alert تا fix لیست کنید.`,
        exampleMd: `\`\`\`go
import _ "net/http/pprof"
// GET /debug/pprof/heap
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "فرضیه leak",
        topicSlug: "ps-debugging",
        lessonSlug: "memory-leak-go",
        path: "/tmp/ps-day21-leak.txt",
        mustContain: "pprof",
        instructionsMd: `سناریوی cache بدون eviction را تحلیل کنید؛ چه profile می‌گیرید؟ pprof را ذکر کنید.`,
      }),
      noteExercise({
        titleFa: "مراحل triage",
        topicSlug: "ps-debugging",
        lessonSlug: "debugging-process",
        path: "/tmp/ps-day21-triage.txt",
        mustContain: "hypothesis",
        instructionsMd: `سه فرضیه اول برای error spike بنویسید و روش رد/تأیید هر کدام را توضیح دهید؛ hypothesis را بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Memory leak در Go service",
      path: "/tmp/ps-day21-scenario.txt",
      mustContain: "heap",
      incidentMd: "پس از ۴۸ ساعت uptime، pod OOMKilled می‌شود؛ restart موقت کمک می‌کند.",
      symptomsMd: "heap in-use خطی رشد می‌کند؛ GC کامل کمکی نمی‌کند.",
      rootCause: "map[string][]byte global برای dedupe بدون TTL؛ کلیدها هر request جدید می‌مانند",
    }),
    exam: {
      titleFa: "آزمون — دیباگ",
      questions: [
        mc(
          "اولین profile برای RSS رو به بالا؟",
          ["block", "heap", "mutex", "threadcreate only"],
          "heap",
          "شیء‌های زنده روی heap.",
          "ps-debugging",
        ),
        tf("OOM بعد از GC کامل همیشه یعنی leak application-level.", false, "می‌تواند off-heap یا cgroup limit باشد.", "ps-debugging"),
        sa("endpoint پیش‌فرض pprof heap؟", "/debug/pprof/heap", "با net/http/pprof.", "ps-debugging"),
        mc(
          "نشانهٔ leak از cache؟",
          ["flat CPU", "monotonic heap با ترافیک پایدار", "disk full", "compile slow"],
          "monotonic heap با ترافیک پایدار",
          "retained objects accumulate.",
          "ps-debugging",
        ),
      ],
    },
  }),
  day({
    dayNumber: 24,
    phaseSlug: "problem-solving",
    titleFa: "عملکرد — latency و بهینه‌سازی",
    objectiveFa: "تجزیه latency، trace و CPU/alloc profile را برای API کند تحلیل کنید.",
    topicSlugs: ["ps-perf"],
    lessons: [
      goLesson({
        slug: "latency-breakdown",
        topicSlug: "ps-perf",
        titleFa: "API latency و tail",
        objectiveFa: "p50/p95/p99، queueing delay و saturation را تفسیر کنید.",
        theoryMd: `## اهداف یادگیری
- latency = service time + wait
- tail توسط lock contention، GC pause، slow dependency
- USE method برای resource

## کاربرد واقعی
gateway timeout؛ SLO burn؛ autoscaling تصمیم

## اشتباهات
- بهینه mean وقتی SLO روی p99 است
- افزودن cache بدون اندازه‌گیری hit rate

## سؤالات مصاحبه
1. p99 بالا ولی p50 خوب — چه می‌کنید؟
2. RED metrics برای API؟`,
        practicalMd: `synthetic trace با spanهای DB/HTTP خارجی را برای bottleneck ترسیم کنید.`,
        exampleMd: `total 200ms = 5ms app + 180ms db + 15ms serialize`,
      }),
      goLesson({
        slug: "profiling-go",
        topicSlug: "ps-perf",
        titleFa: "CPU و allocation profiling",
        objectiveFa: "go tool pprof، flame graph و بهینه allocation را بدانید.",
        theoryMd: `## اهداف یادگیری
- CPU profile sampling
- allocs/op در benchmark
- escape و allocation در hot path

## کاربرد واقعی
JSON marshal، regex compile در loop، lock گسترده

## سؤالات مصاحبه
1. چطور regression benchmark در CI؟
2. sync.Pool چه زمانی؟`,
        practicalMd: `قبل/بعد از حذف alloc در hot path چه متریک‌هایی را نگاه می‌کنید؟`,
        exampleMd: `\`\`\`go
func BenchmarkX(b *testing.B) {
  b.ReportAllocs()
  for i := 0; i < b.N; i++ { /* ... */ }
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تحلیل p99",
        topicSlug: "ps-perf",
        lessonSlug: "latency-breakdown",
        path: "/tmp/ps-day22-p99.txt",
        mustContain: "dependency",
        instructionsMd: `اگر p99 به خاطر downstream کند است چه actionهایی (timeout، circuit breaker، cache) پیشنهاد می‌دهید؟ dependency را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "API latency پس از release",
      path: "/tmp/ps-day22-scenario.txt",
      mustContain: "N+1",
      incidentMd: "endpoint لیست سفارش p95 از 80ms به 900ms؛ error rate پایین.",
      symptomsMd: "DB QPS ×10؛ هر row یک query اضافی.",
      rootCause: "N+1 query بعد از حذف eager load",
    }),
    exam: {
      titleFa: "آزمون — عملکرد",
      questions: [
        mc("tail latency اغلب از؟", ["p50 بهتر", "outlier و contention", "فقط DNS", "compile"], "outlier و contention", "tail events.", "ps-perf"),
        tf("کاهش allocation می‌تواند tail را بهبود دهد.", true, "کمتر GC pause.", "ps-perf"),
        sa("متریک rate در RED؟", "requests per second", "traffic.", "ps-perf"),
        mc("N+1 در ORM معمولاً؟", ["کمتر query", "query per entity", "بدون DB", "cache only"], "query per entity", "کلاسیک latency.", "ps-perf"),
      ],
    },
  }),
  day({
    dayNumber: 25,
    phaseSlug: "problem-solving",
    titleFa: "RCA — تراکنش، race و صف",
    objectiveFa: "duplicate payment، race condition و queue backlog را با شواهد ریشه‌یابی کنید.",
    topicSlugs: ["ps-rca"],
    lessons: [
      goLesson({
        slug: "rca-method",
        topicSlug: "ps-rca",
        titleFa: "Root cause analysis",
        objectiveFa: "5 whys، timeline و contributing vs root cause را تفکیک کنید.",
        theoryMd: `## اهداف یادگیری
- symptom ≠ cause
- مقالات incident: impact، timeline، lessons
- change correlation

## کاربرد واقعی
payment duplicate؛ data corruption؛ partial outage

## اشتباهات
- blame فرد بدون سیستم
- fix فوری بدون guardrail برای تکرار

## سؤالات مصاحبه
1. چطور idempotency duplicate payment را می‌برد؟
2. race در financial path چطور test می‌شود؟`,
        practicalMd: `timeline نوشتن برای incident ۱۵ دقیقه‌ای تمرین کنید.`,
        exampleMd: `T+0 alert → T+5 triage → T+12 mitigation → T+60 RCA draft`,
      }),
      goLesson({
        slug: "concurrency-rca",
        topicSlug: "ps-rca",
        titleFa: "Race و ordering در سیستم توزیع‌شده",
        objectiveFa: "at-least-once، retry و race logical را تشخیص دهید.",
        theoryMd: `## اهداف یادگیری
- duplicate از retry بدون idempotency key
- race: check-then-act بدون lock/tx
- queue backlog: consumer < producer

## کاربرد واقعی
webhook retry، double click، out-of-order events

## سؤالات مصاحبه
1. exactly-once illusion چطور approximate می‌شود؟`,
        practicalMd: `idempotency key در payment API را طراحی کنید.`,
        exampleMd: `Idempotency-Key header + unique constraint on (merchant, key)`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "duplicate payment RCA",
        topicSlug: "ps-rca",
        lessonSlug: "concurrency-rca",
        path: "/tmp/ps-day23-idempotent.txt",
        mustContain: "idempotency",
        instructionsMd: `ریشهٔ duplicate charge از retry client را تحلیل کنید و راه‌حل idempotency را بنویسید.`,
      }),
      noteExercise({
        titleFa: "race condition",
        topicSlug: "ps-rca",
        lessonSlug: "concurrency-rca",
        path: "/tmp/ps-day23-race.txt",
        mustContain: "mutex",
        instructionsMd: `سناریوی check-then-act روی موجودی را با race توضیح دهید و fix با mutex یا transaction را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Duplicate payments",
      path: "/tmp/ps-day23-scenario.txt",
      mustContain: "retry",
      incidentMd: "مشتریان گزارش double charge؛ بانک settle دو بار.",
      symptomsMd: "دو request با همان amount در ۲ ثانیه؛ gateway 504 داد و client retry کرد.",
      rootCause: "retry بدون idempotency key؛ processor هر بار charge جدید ساخت",
    }),
    exam: {
      titleFa: "آزمون — RCA",
      questions: [
        mc("جلوگیری duplicate از retry؟", ["random sleep", "idempotency key", "bigger timeout only", "remove logs"], "idempotency key", "همان عملیات یک بار اثر کند.", "ps-rca"),
        tf("queue backlog همیشه یعنی consumer crash.", false, "می‌تواند slow processing یا producer spike باشد.", "ps-rca"),
        mc("check-then-act race fix؟", ["print debug", "transaction یا row lock", "more goroutines", "delete DB"], "transaction یا row lock", "atomic check+update.", "ps-rca"),
        sa("نام header رایج idempotency؟", "Idempotency-Key", "در APIهای payment.", "ps-rca"),
      ],
    },
  }),
  day({
    dayNumber: 26,
    phaseSlug: "problem-solving",
    titleFa: "شکست dependency و resilience",
    objectiveFa: "DB pool exhaustion، outage خارجی و طراحی degradation را ارزیابی کنید.",
    topicSlugs: ["ps-rca", "ps-perf", "ps-debugging"],
    lessons: [
      goLesson({
        slug: "external-failures",
        topicSlug: "ps-rca",
        titleFa: "External service failures",
        objectiveFa: "timeout، retry با backoff، circuit breaker و bulkhead را مقایسه کنید.",
        theoryMd: `## اهداف یادگیری
- timeout < client deadline
- retry فقط idempotent؛ jittered exponential backoff
- circuit breaker برای fail fast

## کاربرد واقعی
payment provider، auth، third-party API

## اشتباهات
- retry storm وقتی downstream down
- بدون deadline context

## سؤالات مصاحبه
1. تفاوت retry و fallback؟
2. سه state circuit breaker؟`,
        practicalMd: `سیاست retry برای GET vs POST را جدول کنید.`,
        exampleMd: `max_retries=3, base=100ms, cap=2s, jitter`,
      }),
      goLesson({
        slug: "db-pool-exhaustion",
        topicSlug: "ps-debugging",
        titleFa: "DB connection exhaustion",
        objectiveFa: "pool sizing، leaked conn و slow query interaction را تشخیص دهید.",
        theoryMd: `## اهداف یادگیری
- MaxOpenConns، MaxIdle، ConnMaxLifetime
- goroutine منتظر conn → latency spike
- query بدون index → conn held long

## کاربرد واقعی
Postgres pgx/sql، pgbouncer

## اشتباهات
- MaxOpen = نامحدود
- فراموش rows.Close()

## سؤالات مصاحبه
1. علامت pool exhaustion در metrics؟
2. فرق ConnMaxIdleTime و MaxLifetime؟`,
        practicalMd: `وقتی wait_count DB pool بالا است چه می‌کنید؟`,
        exampleMd: `\`\`\`go
db.SetMaxOpenConns(25)
db.SetConnMaxLifetime(5 * time.Minute)
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تنظیم pool",
        topicSlug: "ps-debugging",
        lessonSlug: "db-pool-exhaustion",
        path: "/tmp/ps-day24-pool.txt",
        mustContain: "MaxOpenConns",
        instructionsMd: `علائم exhaustion و تنظیم MaxOpenConns/MaxIdle را توضیح دهید؛ MaxOpenConns را ذکر کنید.`,
      }),
      noteExercise({
        titleFa: "circuit breaker reasoning",
        topicSlug: "ps-rca",
        lessonSlug: "external-failures",
        path: "/tmp/ps-day24-circuit.txt",
        mustContain: "backoff",
        instructionsMd: `چرا retry با exponential backoff بدون circuit breaker خطرناک است؟ backoff را در پاسخ بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "DB connection exhaustion",
      path: "/tmp/ps-day24-scenario.txt",
      mustContain: "pool",
      incidentMd: "همه APIها timeout؛ DB CPU پایین؛ اپ در حالت wait.",
      symptomsMd: "sql.DB Stats: WaitCount بالا؛ open connections = MaxOpenConns.",
      rootCause: "slow report query بدون index + conn leak از goroutine بدون Close",
    }),
    exam: {
      titleFa: "آزمون — Resilience",
      questions: [
        mc("retry POST پرداخت بدون چه چیزی خطرناک است؟", ["logging", "idempotency key", "context", "mutex"], "idempotency key", "جلوگیری duplicate.", "ps-rca"),
        tf("circuit breaker در حالت open درخواست‌ها را سریع fail می‌کند.", true, "تا recovery timeout.", "ps-rca"),
        mc("queue backlog با consumer سالم؟", ["producer spike", "همیشه bug consumer", "only network", "compile"], "producer spike", "imbalance rate.", "ps-rca"),
        sa("فیلد sql.DB برای connهای منتظر؟", "WaitCount", "در DB.Stats.", "ps-debugging"),
        mc("اولین گام وقتی dependency 500 می‌دهد؟", ["infinite retry", "bounded retry+timeout+circuit", "disable monitoring", "panic all"], "bounded retry+timeout+circuit", "controlled resilience.", "ps-rca"),
      ],
    },
  }),
];
