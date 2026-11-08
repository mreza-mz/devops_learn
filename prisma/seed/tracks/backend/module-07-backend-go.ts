import { day, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

export const backendGoDays: DaySeed[] = [
  day({
    dayNumber: 36,
    phaseSlug: "backend-go",
    titleFa: "REST، HTTP و Middleware",
    objectiveFa: "مدل HTTP، status code، middleware chain و طراحی REST در Go را مسلط شوید.",
    topicSlugs: ["be-http"],
    lessons: [
      goLesson({
        slug: "http-rest-internals",
        topicSlug: "be-http",
        titleFa: "HTTP internals و REST",
        objectiveFa: "keep-alive، HTTP/2، idempotent methods و طراحی resource-oriented API.",
        theoryMd: `## HTTP
- **Stateless**؛ headers برای metadata
- **Methods**: GET safe؛ POST non-idempotent؛ PUT/PATCH؛ DELETE
- **Status**: 2xx success؛ 4xx client؛ 5xx server
- **HTTP/2**: multiplex روی یک TCP

## REST
- Resource + HTTP verbs
- **Versioning**: /v1 یا header
- **Pagination**: cursor بهتر از offset در scale

## Go
- \`net/http\` ServeMux (1.22+ routing)
- **Context** برای cancel و timeout`,
        practicalMd: `handler با timeout و graceful error JSON بنویسید.`,
        exampleMd: `\`\`\`go
func withTimeout(next http.Handler, d time.Duration) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), d)
    defer cancel()
    next.ServeHTTP(w, r.WithContext(ctx))
  })
}
\`\`\``,
      }),
      goLesson({
        slug: "middleware-patterns",
        topicSlug: "be-http",
        titleFa: "Middleware patterns",
        objectiveFa: "logging، recovery، request ID و composition.",
        theoryMd: `## Chain
request → logging → auth → handler

## Best practices
- **Recovery** از panic
- **Request-ID** در context و response header
- Body size limit؛ read timeout server

## مصاحبه
- تفاوت middleware و filter servlet؟
- چرا timeout در context نه فقط client؟`,
        practicalMd: `۳ middleware ضروری production را لیست و ترتیب دهید.`,
        exampleMd: `recover → requestid → logging → auth → handler`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی REST API",
        topicSlug: "be-http",
        lessonSlug: "http-rest-internals",
        path: "/tmp/be-day36-rest-api.txt",
        mustContain: "cursor",
        instructionsMd: `CRUD برای resource orders با pagination cursor و status codes را طراحی کنید؛ cursor را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "goroutine leak در handler",
      path: "/tmp/be-day36-scenario.txt",
      mustContain: "context",
      incidentMd: "بعد از چند ساعت RPS پایین، memory بالا و پاسخ کند.",
      symptomsMd: "goroutine count رشد کرده.",
      rootCause: "go func بدون respect به request context cancel",
    }),
    exam: {
      titleFa: "آزمون روز ۳۶ — HTTP",
      questions: [
        mc(
          "کدام method معمولاً idempotent است؟",
          ["POST", "GET", "POST بدون key", "همه non-idempotent"],
          "GET",
          "GET safe و idempotent است.",
          "be-http",
        ),
        tf("HTTP/2 روی یک connection چند stream همزمان دارد.", true, "Multiplexing.", "be-http"),
        sa("کد وضعیت conflict در update؟", "409", "یا 412 با ETag.", "be-http"),
        mc(
          "timeout درخواست در Go کجا propagate می‌شود؟",
          ["فقط log", "context.Context", "init()", "go.mod"],
          "context.Context",
          "Cancellation در درخت.",
          "be-http",
        ),
      ],
    },
  }),

  day({
    dayNumber: 37,
    phaseSlug: "backend-go",
    titleFa: "احراز هویت: JWT و Refresh Rotation",
    objectiveFa: "access/refresh، rotation، storage امن و middleware auth.",
    topicSlugs: ["be-auth"],
    lessons: [
      goLesson({
        slug: "jwt-auth",
        topicSlug: "be-auth",
        titleFa: "JWT و session security",
        objectiveFa: "claims، signing، expiry و چرا refresh لازم است.",
        theoryMd: `## JWT
- Header.Payload.Signature
- **Access**: کوتاه‌عمر (۱۵m)
- **Refresh**: طولانی‌تر؛ ذخیره hashed در DB

## Rotation
- هر refresh → refresh token جدید؛ قبلی revoke
- **Reuse detection**: اگر old refresh دوباره آمد → family revoke

## Storage
- **HttpOnly Secure cookie** برای refresh
- Access در memory یا short cookie

## Go
- \`github.com/golang-jwt/jwt/v5\` یا auth library`,
        practicalMd: `flow login → access + refresh → rotate را sequence بنویسید.`,
        exampleMd: `\`\`\`go
type Claims struct {
  UserID string \`json:"sub"\`
  jwt.RegisteredClaims
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی refresh rotation",
        topicSlug: "be-auth",
        lessonSlug: "jwt-auth",
        path: "/tmp/be-day37-auth.txt",
        mustContain: "rotation",
        instructionsMd: `endpointهای /login /refresh /logout و سیاست rotation و reuse detection را شرح دهید؛ rotation را بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "سرقت refresh token",
      path: "/tmp/be-day37-scenario.txt",
      mustContain: "HttpOnly",
      incidentMd: "XSS در frontend؛ token از localStorage لو رفت.",
      symptomsMd: "sessionهای غیرمعمول از IPهای مختلف.",
      rootCause: "refresh در localStorage بدون rotation و بدون HttpOnly cookie",
    }),
    exam: {
      titleFa: "آزمون روز ۳۷ — Auth",
      questions: [
        mc(
          "هدف refresh token؟",
          ["جایگزین TLS", "access کوتاه بدون login مکرر", "حذف DB", "فقط logging"],
          "access کوتاه بدون login مکرر",
          "کاهش پنجرهٔ access leak.",
          "be-auth",
        ),
        tf("JWT stateless یعنی نمی‌توان قبل از expiry revoke کرد بدون blocklist.", true, "نیاز به denylist یا short TTL.", "be-auth"),
        sa("JWT بخش سوم چیست؟", "signature", "تایید integrity.", "be-auth"),
        mc(
          "کجا refresh را ذخیره کنید؟",
          ["localStorage عمومی", "HttpOnly Secure cookie", "URL query", "comment HTML"],
          "HttpOnly Secure cookie",
          "کاهش دسترسی JS.",
          "be-auth",
        ),
      ],
    },
  }),

  day({
    dayNumber: 38,
    phaseSlug: "backend-go",
    titleFa: "Clean / Hexagonal و DI",
    objectiveFa: "لایه domain، use case، adapter و repository/service در Go.",
    topicSlugs: ["be-architecture"],
    lessons: [
      goLesson({
        slug: "clean-hexagonal",
        topicSlug: "be-architecture",
        titleFa: "Clean و Hexagonal architecture",
        objectiveFa: "وابستگی به سمت domain؛ port و adapter.",
        theoryMd: `## لایه‌ها
- **Domain**: entity، error domain
- **Use case / Service**: orchestration
- **Adapter**: HTTP handler، Postgres repo، Redis

## DI در Go
- Constructor injection؛ interface کوچک
- \`wire\` یا دستی — از over-abstract پرهیز

## Repository pattern
- interface در usecase package
- impl در infrastructure`,
        practicalMd: `برای UserService interface Repository تعریف و handler نازک بنویسید.`,
        exampleMd: `\`\`\`go
type UserRepository interface {
  GetByID(ctx context.Context, id string) (User, error)
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "ساختار پکیج سرویس",
        topicSlug: "be-architecture",
        lessonSlug: "clean-hexagonal",
        path: "/tmp/be-day38-architecture.txt",
        mustContain: "adapter",
        instructionsMd: `درخت پوشه (cmd, internal/domain, internal/service, internal/adapter/http, internal/adapter/postgres) و جریان dependency را بنویسید؛ adapter را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "تست‌ناپذیری به خاطر import cycle",
      path: "/tmp/be-day38-scenario.txt",
      mustContain: "interface",
      incidentMd: "handler مستقیم sql.DB صدا می‌زند؛ mock impossible.",
      symptomsMd: "import cycle بین handler و repo.",
      rootCause: "نبود boundary و interface در لایه usecase",
    }),
    exam: {
      titleFa: "آزمون روز ۳۸ — Architecture",
      questions: [
        mc(
          "در hexagonal، HTTP handler چیست؟",
          ["domain core", "driving adapter", "database", "CI"],
          "driving adapter",
          "ورودی به application.",
          "be-architecture",
        ),
        tf("Repository باید جزئیات SQL را به use case لو بدهد.", false, "use case فقط interface می‌بیند.", "be-architecture"),
        sa("DI در Go معمولاً چگونه؟", "constructor injection", "explicit wiring.", "be-architecture"),
        mc(
          "handler ضخیم anti-pattern چرا؟",
          ["خواناتر", "business logic و HTTP قاطی؛ تست سخت", "سریع‌تر", "الزامی"],
          "business logic و HTTP قاطی؛ تست سخت",
          "جداسازی مسئولیت.",
          "be-architecture",
        ),
      ],
    },
  }),

  day({
    dayNumber: 39,
    phaseSlug: "backend-go",
    titleFa: "gRPC، Messaging و Temporal",
    objectiveFa: "protobuf، gRPC vs REST، RabbitMQ/Kafka و نمای کلی Temporal.",
    topicSlugs: ["be-architecture"],
    lessons: [
      goLesson({
        slug: "grpc-messaging",
        topicSlug: "be-architecture",
        titleFa: "gRPC و message brokers",
        objectiveFa: "وقتی gRPC؛ semantics Kafka vs RabbitMQ.",
        theoryMd: `## gRPC
- **Protobuf** schema؛ HTTP/2
- مناسب internal؛ streaming
- **Deadline** و metadata

## RabbitMQ
- Exchange، queue، routing key
- ACK، prefetch، DLQ

## Kafka
- Log، partition، consumer group
- ordering per partition؛ replay

## Temporal (overview)
- durable workflow؛ saga طولانی
- worker Go SDK؛ retry policy declarative`,
        practicalMd: `تصمیم REST vs gRPC برای public mobile vs internal billing.`,
        exampleMd: `\`\`\`protobuf
service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (CreateOrderResponse);
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "انتخاب broker",
        topicSlug: "be-architecture",
        lessonSlug: "grpc-messaging",
        path: "/tmp/be-day39-messaging.txt",
        mustContain: "consumer group",
        instructionsMd: `سناریو audit log با replay: Kafka vs RabbitMQ و consumer group را توضیح دهید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "پیام گم‌شده بدون ACK",
      path: "/tmp/be-day39-scenario.txt",
      mustContain: "prefetch",
      incidentMd: "worker crash؛ بعضی jobها دوباره پردازش نمی‌شوند.",
      symptomsMd: "unacked messages.",
      rootCause: "manual ack قبل از commit و prefetch بالا",
    }),
    exam: {
      titleFa: "آزمون روز ۳۹ — Messaging",
      questions: [
        mc(
          "Kafka ordering تضمین می‌کند در؟",
          ["کل topic", "یک partition", "random", "بدون تضمین"],
          "یک partition",
          "کلید partition تعیین‌کننده.",
          "be-architecture",
        ),
        tf("gRPC معمولاً برای browser public بدون grpc-web سخت‌تر از JSON REST است.", true, "مرورگر محدودیت دارد.", "be-architecture"),
        sa("Temporal برای چه نوع workload؟", "durable workflow", "فرایند چندمرحله‌ای طولانی.", "be-architecture"),
        mc(
          "RabbitMQ prefetch زیاد چه ریسکی دارد؟",
          ["هیچ", "ناعادلانه توزیع و memory worker", "حذف queue", "TLS"],
          "ناعادلانه توزیع و memory worker",
          "fair dispatch خراب می‌شود.",
          "be-architecture",
        ),
      ],
    },
  }),

  day({
    dayNumber: 40,
    phaseSlug: "backend-go",
    titleFa: "Docker، Shutdown و OpenTelemetry",
    objectiveFa: "containerize سرویس Go؛ graceful shutdown؛ logs، metrics، traces.",
    topicSlugs: ["be-observability"],
    lessons: [
      goLesson({
        slug: "docker-graceful",
        topicSlug: "be-observability",
        titleFa: "Docker و graceful shutdown",
        objectiveFa: "multi-stage build، signal handling و drain connections.",
        theoryMd: `## Docker
- **multi-stage**: build → distroless/scratch
- **USER non-root**؛ HEALTHCHECK

## Graceful shutdown
- SIGTERM → stop accept → wait in-flight → close DB pool
- \`http.Server.Shutdown(ctx)\`

## Observability
- **Structured logging** (slog/zap)
- **Metrics**: Prometheus /go/prometheus
- **Tracing**: OpenTelemetry → OTLP`,
        practicalMd: `main با signal.Notify و Shutdown timeout 30s طراحی کنید.`,
        exampleMd: `\`\`\`go
srv := &http.Server{Addr: ":8080", Handler: mux}
go srv.ListenAndServe()
<-quit
srv.Shutdown(context.Background())
\`\`\``,
      }),
      goLesson({
        slug: "otel-prometheus",
        topicSlug: "be-observability",
        titleFa: "OpenTelemetry و Prometheus/Grafana",
        objectiveFa: "instrument HTTP و DB؛ SLI dashboards.",
        theoryMd: `OTel: span per request، W3C traceparent. Prometheus: Counter/Histogram، RED روی handler. Grafana: SLO burn alert.`,
        practicalMd: `۳ metric HTTP server نام ببرید.`,
        exampleMd: `http_server_duration_seconds`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی graceful shutdown",
        topicSlug: "be-observability",
        lessonSlug: "docker-graceful",
        path: "/tmp/be-day40-shutdown.txt",
        mustContain: "SIGTERM",
        instructionsMd: `ترتیب بستن listener، workers، RabbitMQ consumer و DB pool را بنویسید؛ SIGTERM را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "قطع ناگهانی در deploy",
      path: "/tmp/be-day40-scenario.txt",
      mustContain: "Shutdown",
      incidentMd: "Kubernetes rolling update؛ ۵xx spike.",
      symptomsMd: "connection reset during checkout.",
      rootCause: "process فوراً kill بدون http.Server.Shutdown",
    }),
    exam: {
      titleFa: "آزمون روز ۴۰ — Observability",
      questions: [
        mc(
          "اولین قدم پس از SIGTERM در HTTP server؟",
          ["فوراً os.Exit", "Stop accepting new connections", "حذف DB", "panic"],
          "Stop accepting new connections",
          "سپس drain.",
          "be-observability",
        ),
        tf("OpenTelemetry vendor-neutral است.", true, "OTLP export به Jaeger/Tempo.", "be-observability"),
        sa("Histogram در Prometheus برای؟", "latency distribution", "percentile از buckets.", "be-observability"),
        mc(
          "multi-stage Docker image هدف؟",
          ["بزرگ‌تر کردن image", "کوچک و امن build جدا", "حذف go", "فقط Windows"],
          "کوچک و امن build جدا",
          "artifact کوچک production.",
          "be-observability",
        ),
      ],
    },
  }),

  day({
    dayNumber: 41,
    phaseSlug: "backend-go",
    titleFa: "Testing، pprof و Capstone Go Backend",
    objectiveFa: "table-driven tests، integration، benchmark و outline production backend.",
    topicSlugs: ["be-http", "be-auth", "be-architecture", "be-observability"],
    lessons: [
      goLesson({
        slug: "testing-benchmark-pprof",
        topicSlug: "be-observability",
        titleFa: "Testing، benchmark و pprof",
        objectiveFa: "unit با mock؛ testcontainers؛ cpu/mem profile.",
        theoryMd: `## Testing
- **Table-driven** tests
- \`httptest.ResponseRecorder\` برای handler
- **Integration**: testcontainers Postgres/Redis

## Benchmark
- \`go test -bench\`؛ alloc/op
- مقایسه قبل/بعد optimization

## pprof
- \`import _ "net/http/pprof"\`
- \`go tool pprof\` cpu و heap`,
        practicalMd: `یک handler test با mock repository بنویسید (outline در یادداشت).`,
        exampleMd: `\`\`\`go
func BenchmarkHandler(b *testing.B) {
  for i := 0; i < b.N; i++ { /* ... */ }
}
\`\`\``,
      }),
      goLesson({
        slug: "capstone-backend-outline",
        topicSlug: "be-architecture",
        titleFa: "Capstone: Production Go Backend",
        objectiveFa: "auth، CRUD، Postgres، Redis، RabbitMQ، workers، OTel، tests، compose.",
        theoryMd: `cmd/api + cmd/worker؛ Postgres/migrate؛ Redis؛ RabbitMQ workers؛ JWT؛ OTel/Prometheus؛ docker-compose؛ /healthz /readyz؛ OpenAPI؛ Makefile test/lint/up.`,
        practicalMd: `architecture یک‌صفحه‌ای capstone را در تمرین بنویسید.`,
        exampleMd: `Order: API sync + worker notify`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "برنامه capstone",
        topicSlug: "be-architecture",
        lessonSlug: "capstone-backend-outline",
        path: "/tmp/be-day41-capstone.txt",
        mustContain: "docker-compose",
        instructionsMd: `سرویس‌های api/worker، Postgres، Redis، RabbitMQ، OTel، test strategy و docker-compose را outline کنید.`,
      }),
      noteExercise({
        titleFa: "استراتژی تست",
        topicSlug: "be-observability",
        lessonSlug: "testing-benchmark-pprof",
        path: "/tmp/be-day41-testing.txt",
        mustContain: "testcontainers",
        instructionsMd: `سطح unit/integration/e2e و نقش testcontainers را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "رگرسیون بعد از «بهینه‌سازی»",
      path: "/tmp/be-day41-scenario.txt",
      mustContain: "benchmark",
      incidentMd: "latency بهتر شد اما باگ race در cache.",
      symptomsMd: "فقط production traffic بالا.",
      rootCause: "بهینه بدون benchmark و race test (-race)",
    }),
    exam: {
      titleFa: "آزمون روز ۴۱ — Production Go",
      questions: [
        mc(
          "httptest برای چیست؟",
          ["DB migrate", "تست HTTP handler بدون network", "فقط gRPC", "Docker"],
          "تست HTTP handler بدون network",
          "Recorder روی ResponseWriter.",
          "be-http",
        ),
        tf("go test -race race detector را فعال می‌کند.", true, "در CI توصیه می‌شود.", "be-observability"),
        sa("pprof endpoint معمولاً کجا؟", "/debug/pprof", "یا dedicated admin port.", "be-observability"),
        mc(
          "capstone worker برای چه کاری؟",
          ["فقط UI", "async job از queue", "حذف Postgres", "DNS"],
          "async job از queue",
          "RabbitMQ consumer.",
          "be-architecture",
        ),
      ],
    },
  }),
];
