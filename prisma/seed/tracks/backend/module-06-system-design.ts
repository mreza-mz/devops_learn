import { day, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

export const systemDesignDays: DaySeed[] = [
  day({
    dayNumber: 30,
    phaseSlug: "system-design",
    titleFa: "نیازمندی‌ها، CAP و دسترس‌پذیری",
    objectiveFa: "FR/NFR، SLA/SLO، scalability و trade-offهای CAP را در مصاحبه ساختار دهید.",
    topicSlugs: ["sd-fundamentals"],
    lessons: [
      goLesson({
        slug: "fr-nfr-cap",
        topicSlug: "sd-fundamentals",
        titleFa: "FR/NFR و CAP",
        objectiveFa: "نیازمندی را قابل اندازه‌گیری کنید؛ CP vs AP را برای سرویس انتخاب کنید.",
        theoryMd: `## FR / NFR
- **Functional**: چه کاری سیستم می‌کند
- **Non-functional**: latency، throughput، availability، consistency، cost

## معیارها
- **Availability**: uptime (99.9% ≈ 8.7h/year down)
- **Latency**: p50/p99
- **Scalability**: horizontal vs vertical

## CAP
در partition، **Consistency** یا **Availability** — کاربرد واقعی **PACELC**

## مصاحبه
- Back-of-envelope: QPS، storage، bandwidth
- Assumptions را صریح بگویید`,
        practicalMd: `برای یک سرویس ۱۰M DAU، storage و QPS تخمینی را با فرض‌های شفاف محاسبه کنید.`,
        exampleMd: `URL shortener: 100:1 read/write → cache حیاتی؛ CP برای counter ممکن است.`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "جدول FR/NFR",
        topicSlug: "sd-fundamentals",
        lessonSlug: "fr-nfr-cap",
        path: "/tmp/sd-day30-requirements.txt",
        mustContain: "NFR",
        instructionsMd: `سرویس اعلان: حداقل ۵ FR و ۵ NFR با عدد (مثلاً p99 latency) بنویسید؛ NFR را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "طراحی بدون NFR",
      path: "/tmp/sd-day30-scenario.txt",
      mustContain: "SLO",
      incidentMd: "معماری زیبا ساخته شد اما p99 ۸ ثانیه و churn بالا رفت.",
      symptomsMd: "CPU کم؛ tail latency بالا.",
      rootCause: "بدون SLO و capacity planning؛ sync call زنجیره‌ای",
    }),
    exam: {
      titleFa: "آزمون روز ۳۰ — Fundamentals",
      questions: [
        mc(
          "در CAP هنگام network partition بین C و A کدام انتخاب ضروری است؟",
          ["هر دو همزمان", "یکی را قربانی کنید", "هیچ", "فقط latency"],
          "یکی را قربانی کنید",
          "CAP تعریف کلاسیک.",
          "sd-fundamentals",
        ),
        tf("NFRها باید قابل اندازه‌گیری باشند.", true, "مثلاً 99.9% و p99<200ms.", "sd-fundamentals"),
        sa("vertical scaling یعنی؟", "قدرتمندتر کردن یک سرور", "افزایش CPU/RAM یک node.", "sd-fundamentals"),
        mc(
          "کدام برای read-heavy مناسب‌تر است؟",
          ["بدون cache", "replication + cache", "یک DB کوچک", "sync replication همه جا"],
          "replication + cache",
          "مقیاس خواندن.",
          "sd-scaling",
        ),
      ],
    },
  }),

  day({
    dayNumber: 31,
    phaseSlug: "system-design",
    titleFa: "مقیاس‌پذیری: LB، cache، DB، queue",
    objectiveFa: "load balancing، sharding DB، message queue و caching لایه‌ای را ترکیب کنید.",
    topicSlugs: ["sd-scaling"],
    lessons: [
      goLesson({
        slug: "scaling-patterns",
        topicSlug: "sd-scaling",
        titleFa: "Load balancing و database scaling",
        objectiveFa: "L4/L7، sticky session، read replica و queue برای async.",
        theoryMd: `## Load balancing
- **L4**: TCP، سریع
- **L7**: HTTP path، header، canary
- **Health check** و **connection draining**

## DB scaling
- Read replica، sharding، CQRS سبک
- **Bottleneck**: hot shard، connection limit

## Queue
- Decouple producers/consumers
- **Backpressure**، DLQ، visibility timeout
- Kafka: log؛ RabbitMQ: routing

## Cache layers
- CDN → edge → app Redis → DB`,
        practicalMd: `diagram ساده برای سرویس با API، worker و queue بکشید.`,
        exampleMd: `Notification: API → queue → workers → SMS provider`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "بottleneck شناسی",
        topicSlug: "sd-scaling",
        lessonSlug: "scaling-patterns",
        path: "/tmp/sd-day31-bottleneck.txt",
        mustContain: "queue",
        instructionsMd: `Job queue با ۱M job/day: کجا bottleneck می‌شود؟ نقش queue را توضیح دهید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Hot key در Redis",
      path: "/tmp/sd-day31-scenario.txt",
      mustContain: "shard",
      incidentMd: "یک پست viral شد؛ یک shard Redis 100% CPU.",
      symptomsMd: "سایر keyها سالم.",
      rootCause: "counter/global feed در یک key — نیاز به shard یا local aggregate",
    }),
    exam: {
      titleFa: "آزمون روز ۳۱ — Scaling",
      questions: [
        mc(
          "هدف اصلی message queue در peak traffic؟",
          ["حذف DB", "decouple و صاف کردن بار", "افزایش latency اجباری", "حذف retry"],
          "decouple و صاف کردن بار",
          "async processing.",
          "sd-scaling",
        ),
        tf("L7 load balancer می‌تواند بر اساس URL route کند.", true, "HTTP awareness.", "sd-scaling"),
        sa("DLQ مخفف چیست؟", "Dead Letter Queue", "پیام‌های شکست‌خوردهٔ پردازش‌نشده.", "sd-scaling"),
        mc(
          "Sticky session معایب اصلی؟",
          ["همیشه بهتر", "ناهمگنی بار و failover سخت", "امنیت بیشتر", "حذف state"],
          "ناهمگنی بار و failover سخت",
          "stateful LB.",
          "sd-scaling",
        ),
      ],
    },
  }),

  day({
    dayNumber: 32,
    phaseSlug: "system-design",
    titleFa: "پروژه: URL Shortener و Rate Limiter",
    objectiveFa: "برای دو سرویس کلاسیک API، schema، bottlenecks و failure mode بنویسید.",
    topicSlugs: ["sd-fundamentals", "sd-scaling"],
    lessons: [
      goLesson({
        slug: "project-url-shortener",
        topicSlug: "sd-fundamentals",
        titleFa: "URL Shortener",
        objectiveFa: "encoding، collision، redirect latency و analytics.",
        theoryMd: `## Requirements
- Create short URL، redirect، optional TTL
- **Scale**: read >> write

## Design
- **Key**: base62 یا hash truncated + collision check
- **Store**: SQL یا KV (Dynamo/Cassandra)
- **Cache**: hot URLs در Redis
- **API**: POST /v1/links، GET /{code} → 302

## Failures
- Cache miss storm؛ duplicate slug
- Analytics async via queue`,
        practicalMd: `capacity: 500M links، 100K redirect/s — storage و QPS تخمین.`,
        exampleMd: `62^7 ≈ 3.5T codes — sufficient entropy with check.`,
      }),
      goLesson({
        slug: "project-rate-limiter",
        topicSlug: "sd-scaling",
        titleFa: "Distributed Rate Limiter",
        objectiveFa: "token bucket، sliding window و Redis cluster.",
        theoryMd: `## Algorithms
- **Token bucket**: burst
- **Fixed/sliding window**: دقت counter

## Distributed
- Redis INCR + TTL
- **Race**: Lua script atomic

## Placement
- API Gateway یا sidecar middleware`,
        practicalMd: `limit 1000 req/min per API key — key design و 429 response.`,
        exampleMd: `KEY rl:{apiKey}:{windowStart}`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "معماری URL Shortener",
        topicSlug: "sd-fundamentals",
        lessonSlug: "project-url-shortener",
        path: "/tmp/sd-day32-url-shortener.txt",
        mustContain: "302",
        instructionsMd: `FR، API endpoints، schema جدول links، cache و bottlenecks را بنویسید؛ کد وضعیت redirect 302 را ذکر کنید.`,
      }),
      noteExercise({
        titleFa: "طراحی Rate Limiter",
        topicSlug: "sd-scaling",
        lessonSlug: "project-rate-limiter",
        path: "/tmp/sd-day32-rate-limiter.txt",
        mustContain: "token bucket",
        instructionsMd: `الگوریتم، ذخیره‌سازی Redis، و trade-offها؛ عبارت token bucket را بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Short link به سایت مخرب",
      path: "/tmp/sd-day32-scenario.txt",
      mustContain: "abuse",
      incidentMd: "کاربران از سرویس شما برای phishing استفاده می‌کنند.",
      symptomsMd: "افزایش redirect به دامنه‌های گزارش‌شده.",
      rootCause: "بدون abuse detection و blocklist async",
    }),
    exam: {
      titleFa: "آزمون روز ۳۲ — Mini projects",
      questions: [
        mc(
          "redirect استاندارد short URL؟",
          ["201", "302/301", "500", "418"],
          "302/301",
          "HTTP redirect.",
          "sd-fundamentals",
        ),
        tf("Rate limit در gateway می‌تواند از overload سرویس داخلی جلوگیری کند.", true, "در لبه محافظت.", "sd-scaling"),
        sa("برای unique short code در scale چه ریسکی؟", "collision", "نیاز به check یا فضای بزرگ.", "sd-fundamentals"),
        mc(
          "بهترین cache برای URL پرمصرف؟",
          ["فایل لوکال فقط", "Redis نزدیک API", "بدون TTL", "فقط CDN برای POST"],
          "Redis نزدیک API",
          "کاهش latency redirect.",
          "sd-scaling",
        ),
      ],
    },
  }),

  day({
    dayNumber: 33,
    phaseSlug: "system-design",
    titleFa: "Microservices، Gateway و Event-driven",
    objectiveFa: "service boundary، API gateway، circuit breaker و event-driven integration.",
    topicSlugs: ["sd-reliability", "sd-scaling"],
    lessons: [
      goLesson({
        slug: "microservices-gateway",
        topicSlug: "sd-scaling",
        titleFa: "Microservices و API Gateway",
        objectiveFa: "مرز سرویس، sync vs async، gateway concerns.",
        theoryMd: `## Microservices
- **Bounded context**؛ autonomy
- هزینه: distributed transactions، observability، deploy

## API Gateway
- Auth، rate limit، routing، aggregation
- **BFF** برای کلاینت‌های مختلف

## Event-driven
- **Pub/sub**، event notification vs event-carried state
- **Ordering**: partition key

## Circuit breaker
- Closed → Open → Half-open
- جلوگیری از cascade failure`,
        practicalMd: `سرویس notification را به‌صورت event consumer از order.created طراحی کنید.`,
        exampleMd: `Order → outbox → Kafka → Notification worker`,
      }),
      goLesson({
        slug: "project-notification",
        topicSlug: "sd-reliability",
        titleFa: "Notification Service",
        objectiveFa: "multi-channel، template، retry و idempotency.",
        theoryMd: `## FR
- email/SMS/push؛ preferences؛ scheduling

## Schema
- notifications، deliveries، templates
- **Idempotency key** per user+event

## Failures
- Provider 5xx → exponential backoff
- **Circuit** روی provider ضعیف`,
        practicalMd: `API POST /notify و worker flow را شرح دهید.`,
        exampleMd: `Queue per channel یا priority queue`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی Notification",
        topicSlug: "sd-reliability",
        lessonSlug: "project-notification",
        path: "/tmp/sd-day33-notification.txt",
        mustContain: "idempotency",
        instructionsMd: `requirements، architecture، API، schema، failures و trade-offs؛ idempotency را توضیح دهید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Cascade failure پس از deploy",
      path: "/tmp/sd-day33-scenario.txt",
      mustContain: "circuit breaker",
      incidentMd: "سرویس پرداخت down شد؛ همه سرویس‌ها timeout و down شدند.",
      symptomsMd: "thread pool exhaustion در gateway.",
      rootCause: "بدون circuit breaker و bulkhead روی dependency",
    }),
    exam: {
      titleFa: "آزمون روز ۳۳ — Services",
      questions: [
        mc(
          "Circuit breaker در حالت Open چه می‌کند؟",
          ["همه درخواست‌ها فوری fail fast", "همیشه retry بی‌نهایت", "DB را lock می‌کند", "فقط cache"],
          "همه درخواست‌ها فوری fail fast",
          "محافظت از dependency.",
          "sd-reliability",
        ),
        tf("Event-driven همیشه consistency قوی‌تر از sync REST می‌دهد.", false, "معمولاً eventual.", "sd-scaling"),
        sa("BFF مخفف؟", "Backend For Frontend", "لایه API مخصوص کلاینت.", "sd-scaling"),
        mc(
          "Retry با backoff برای چه خطاهایی؟",
          ["4xx validation", "transient 5xx/timeout", "همیشه همه", "فقط panic"],
          "transient 5xx/timeout",
          "4xx معمولاً non-retryable.",
          "sd-reliability",
        ),
      ],
    },
  }),

  day({
    dayNumber: 34,
    phaseSlug: "system-design",
    titleFa: "Job Queue، Chat و E-commerce",
    objectiveFa: "پروژه‌های job queue و chat؛ inventory و cart در ecommerce.",
    topicSlugs: ["sd-scaling", "sd-reliability"],
    lessons: [
      goLesson({
        slug: "project-job-queue",
        topicSlug: "sd-scaling",
        titleFa: "Distributed Job Queue",
        objectiveFa: "scheduler، worker pool، visibility timeout، priority.",
        theoryMd: `## Components
- API enqueue؛ workers dequeue
- **At-least-once** → idempotent handler

## Schema
- jobs(status, run_at, attempts, payload)

## Bottlenecks
- DB as queue anti-pattern در scale بالا
- Kafka/SQS/RabbitMQ انتخاب بر اساس ordering`,
        practicalMd: `retry policy و DLQ برای job تصویر thumbnail.`,
        exampleMd: `visibility timeout > max processing time`,
      }),
      goLesson({
        slug: "project-chat-ecommerce",
        topicSlug: "sd-fundamentals",
        titleFa: "Chat و E-commerce (core)",
        objectiveFa: "WebSocket fan-out؛ catalog، cart، inventory.",
        theoryMd: `## Chat: WebSocket gateway، presence در Redis، store مقیاس‌پذیر؛ گروه بزرگ → inbox/pull hybrid
## E-commerce: cart در Redis؛ **inventory** reservation؛ checkout saga؛ search جدا`,
        practicalMd: `برای گروه ۱۰۰k نفر fan-out strategy بنویسید.`,
        exampleMd: `Small: push؛ large: inbox`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "معماری Job Queue",
        topicSlug: "sd-scaling",
        lessonSlug: "project-job-queue",
        path: "/tmp/sd-day34-job-queue.txt",
        mustContain: "at-least-once",
        instructionsMd: `API، schema jobs، workers، failures؛ تضمین at-least-once و idempotency را بنویسید.`,
      }),
      noteExercise({
        titleFa: "E-commerce checkout",
        topicSlug: "sd-fundamentals",
        lessonSlug: "project-chat-ecommerce",
        path: "/tmp/sd-day34-ecommerce.txt",
        mustContain: "inventory",
        instructionsMd: `cart، inventory reservation و bottleneckها؛ کلمه inventory را بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "پیام تکراری در چت",
      path: "/tmp/sd-day34-scenario.txt",
      mustContain: "idempotent",
      incidentMd: "کاربران duplicate message می‌بینند پس از reconnect.",
      symptomsMd: "at-least-once delivery بدون dedup.",
      rootCause: "client resend بدون server-side message id dedup",
    }),
    exam: {
      titleFa: "آزمون روز ۳۴ — Queue & Chat",
      questions: [
        mc(
          "Visibility timeout در queue برای چیست؟",
          ["encryption", "جلوگیری از گم شدن job در حال پردازش", "DNS", "sharding"],
          "جلوگیری از گم شدن job در حال پردازش",
          "اگر worker مرد، job دوباره visible می‌شود.",
          "sd-scaling",
        ),
        tf("WebSocket برای real-time chat مناسب‌تر از polling است.", true, "کاهش overhead.", "sd-fundamentals"),
        sa("برای inventory oversell چه مکانیزمی؟", "reservation", "یا SELECT FOR UPDATE / version.", "sd-fundamentals"),
        mc(
          "DB table به‌عنوان sole job queue در 50K job/s؟",
          ["ایده‌آل", "anti-pattern", "الزامی", "فقط NoSQL"],
          "anti-pattern",
          "lock contention.",
          "sd-scaling",
        ),
      ],
    },
  }),

  day({
    dayNumber: 35,
    phaseSlug: "system-design",
    titleFa: "Payments، SMS، Saga و Observability",
    objectiveFa: "طراحی payments و SMS gateway؛ saga، outbox و fault tolerance.",
    topicSlugs: ["sd-reliability"],
    lessons: [
      goLesson({
        slug: "project-payments-sms",
        topicSlug: "sd-reliability",
        titleFa: "Payment و SMS Gateway",
        objectiveFa: "PCI scope، webhook idempotency و provider abstraction.",
        theoryMd: `## Payments
- **Never store PAN**؛ tokenization
- **Idempotency-Key** header
- Webhook signature verify؛ ledger double-entry

## SMS Gateway
- Multi-provider failover
- Rate limit per region؛ template compliance

## Saga / Outbox
- **Outbox pattern**: same TX DB + event
- **Saga**: orchestration vs choreography؛ compensating TX`,
        practicalMd: `flow charge کارت با timeout provider و compensating refund outline کنید.`,
        exampleMd: `payment_intents(status, idempotency_key UNIQUE)`,
      }),
      goLesson({
        slug: "observability-fault",
        topicSlug: "sd-reliability",
        titleFa: "Observability و fault tolerance",
        objectiveFa: "metrics، traces، SLO و chaos mindset.",
        theoryMd: `RED/USE metrics؛ trace روی checkout؛ correlation id در log. Multi-AZ، degradation، bulkhead per dependency.`,
        practicalMd: `۳ SLI برای payments تعریف کنید.`,
        exampleMd: `success rate، p99، reconciliation lag`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی Payment Service",
        topicSlug: "sd-reliability",
        lessonSlug: "project-payments-sms",
        path: "/tmp/sd-day35-payments.txt",
        mustContain: "outbox",
        instructionsMd: `requirements، API، schema، failures، trade-offs؛ الگوی outbox برای event را شرح دهید.`,
      }),
      noteExercise({
        titleFa: "SMS Gateway outline",
        topicSlug: "sd-reliability",
        lessonSlug: "project-payments-sms",
        path: "/tmp/sd-day35-sms.txt",
        mustContain: "failover",
        instructionsMd: `multi-provider، rate limit، idempotency و failover را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "پرداخت دو بار charge شد",
      path: "/tmp/sd-day35-scenario.txt",
      mustContain: "Idempotency",
      incidentMd: "کاربر دوبار کلیک؛ دو charge در کارت.",
      symptomsMd: "دو payment با amount یکسان.",
      rootCause: "بدون Idempotency-Key در API و webhook duplicate",
    }),
    exam: {
      titleFa: "آزمون روز ۳۵ — Reliability",
      questions: [
        mc(
          "Outbox pattern مشکل چه چیزی را حل می‌کند؟",
          ["UI", "dual write DB و message broker", "DNS", "CSS"],
          "dual write DB و message broker",
          "atomic publish با business data.",
          "sd-reliability",
        ),
        tf("Saga ممکن است compensating transaction نیاز داشته باشد.", true, "rollback منطقی در microservices.", "sd-reliability"),
        sa("RED method برای API؟", "Rate Errors Duration", "متریک‌های درخواست.", "sd-reliability"),
        mc(
          "Exponential backoff در retry برای؟",
          ["کاهش فشار روی failing dependency", "افزایش فوری بار", "حذف idempotency", "SQL tuning"],
          "کاهش فشار روی failing dependency",
          "retry storm کمتر.",
          "sd-reliability",
        ),
      ],
    },
  }),
];
