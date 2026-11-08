import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "./types";

export const obsDays: DaySeed[] = [
  {
    dayNumber: 31,
    phaseSlug: "observability",
    titleFa: "متریک، Prometheus و Grafana",
    objectiveFa: "از مدل دادهٔ متریک تا PromQL و داشبورد عملیاتی را یاد بگیرید و cardinality، نرخ و انتخاب visualization را در سطح مصاحبه تحلیل کنید.",
    topicSlugs: ["metrics", "prometheus", "grafana"],
    lessons: [
      {
        slug: "prometheus-metrics",
        topicSlug: "prometheus",
        titleFa: "متریک و Prometheus؛ عددی که در زمان معنا دارد",
        objectiveFa: "counter، gauge، histogram و مدل pull پرومتئوس را بشناسید و query قابل‌اعتماد بنویسید.",
        theoryMd: `## مبتدی
متریک یک مقدار عددی همراه timestamp و label است. **Counter** فقط افزایش می‌یابد و برای تعداد request مناسب است؛ **Gauge** بالا و پایین می‌رود و برای queue depth یا memory است؛ **Histogram** رخدادها را در bucketها جمع می‌کند و برای latency و percentile کاربرد دارد.

Prometheus معمولاً endpoint \`/metrics\` targetها را pull می‌کند. Service discovery targetها را پیدا و scrape interval نرخ نمونه‌برداری را تعیین می‌کند. counter خام کمتر مفید است؛ \`rate(http_requests_total[5m])\` نرخ درخواست را می‌دهد.

## کارورز
Label امکان slice کردن داده را می‌دهد، اما label با مقدارهای نامحدود مثل user_id یا request_id cardinality را منفجر می‌کند و RAM/CPU را بالا می‌برد. Recording rule query سنگین و پرتکرار را از قبل محاسبه می‌کند. برای percentile توزیع‌شده از histogram و \`histogram_quantile\` استفاده کنید؛ average به‌تنهایی tail latency را پنهان می‌کند.

## زاویهٔ مصاحبهٔ سنیور
دربارهٔ staleness، missing data و counter reset صحبت کنید. \`rate\` reset را بهتر از تفریق دستی مدیریت می‌کند. retention و remote storage را بر اساس هزینه و نیاز تحقیق انتخاب کنید. متریک برای trend و alert عالی است اما context یک request را مثل trace یا جزئیات رخداد را مثل log نمی‌دهد.`,
        practicalMd: `برای یک API چهار متریک طراحی کنید: request counter، error counter، in-flight gauge و latency histogram. labelهای کم‌کاردینال را مشخص و یک PromQL برای نرخ خطای پنج‌دقیقه‌ای بنویسید.`,
        exampleMd: `\`\`\`promql
sum(rate(http_requests_total{service="checkout",status=~"5.."}[5m]))
/
sum(rate(http_requests_total{service="checkout"}[5m]))
\`\`\``,
        commands: ["curl -s localhost:9090/-/healthy", "curl -s localhost:9090/api/v1/targets", "promtool check rules rules.yml"],
      },
      {
        slug: "grafana-dashboard",
        topicSlug: "grafana",
        titleFa: "Grafana؛ داشبورد برای تصمیم، نه تزئین",
        objectiveFa: "پنل‌هایی بسازید که وضعیت سرویس، تغییرات و مسیر drill-down را روشن نشان دهند.",
        theoryMd: `## مبتدی
Grafana داده را از data sourceهایی مثل Prometheus می‌خواند. داشبورد خوب از بالا پاسخ می‌دهد: سرویس سالم است؟ کاربر آسیب دیده؟ کدام component؟ چهار سیگنال طلایی latency، traffic، errors و saturation نقطهٔ شروع مناسبی‌اند.

## کارورز
واحد، legend و بازهٔ زمانی را درست تنظیم کنید. نمودار rate را با counter خام اشتباه نگیرید. deploy annotation کمک می‌کند جهش خطا را با تغییر نسخه مرتبط کنید. متغیرهای dashboard باید محدود باشند؛ wildcard بزرگ query پرهزینه می‌سازد. پنل‌های overview به dashboard تشخیصی لینک بدهند.

## زاویهٔ مصاحبهٔ سنیور
Dashboard نباید تنها هنگام incident فهمیده شود. مالک، هدف و runbook link داشته باشد و به‌صورت code version شود. میانگین سراسری می‌تواند outage یک region را پنهان کند؛ breakdown کنترل‌شده بر اساس region و status لازم است. پنلی که هیچ تصمیمی پشتیبانی نمی‌کند حذف شود.`,
        practicalMd: `یک داشبورد API با ردیف overview و ردیف diagnosis طراحی کنید. برای هر پنل query، واحد، threshold و تصمیمی که اپراتور می‌گیرد بنویسید.`,
        exampleMd: `\`\`\`text
Overview: availability | request rate | p95 latency | error rate
Diagnosis: saturation by instance | errors by route | deploy annotations
Links: service runbook | logs | traces
\`\`\``,
        commands: ["curl -s localhost:3000/api/health"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی متریک RED",
        topicSlug: "metrics",
        lessonSlug: "prometheus-metrics",
        path: "/tmp/day31-metrics.txt",
        mustContain: "cardinality",
        instructionsMd: "هدف این است که متریک‌های rate، errors و duration یک API را با نوع و labelهای مناسب طراحی کنید و ریسک cardinality بالا را توضیح دهید. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "نقشهٔ داشبورد عملیاتی",
        topicSlug: "grafana",
        lessonSlug: "grafana-dashboard",
        path: "/tmp/day31-dashboard.txt",
        mustContain: "p95",
        instructionsMd: "هدف این است که یک داشبورد عملیاتی با نماهای overview و diagnosis طراحی کنید و برای هر پنل، واحد، query و تصمیم قابل پشتیبانی را توضیح دهید. پاسخ را در آزمایشگاه ثبت کنید.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Prometheus با Cardinality انفجاری",
      path: "/tmp/day31-scenario.txt",
      mustContain: "user_id",
      incidentMd: "پس از افزودن label جدید، مصرف حافظهٔ Prometheus جهش کرده و queryهای Grafana timeout می‌شوند.",
      symptomsMd: "تعداد series چند برابر شده و label برای هر کاربر مقدار یکتا دارد.",
      rootCause: "قرار دادن user_id با دامنهٔ نامحدود روی متریک request cardinality را منفجر کرده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۱",
      questions: [
        mc("مبتدی — تعداد تجمعی request معمولاً چه نوع متریکی است؟", ["Counter", "Gauge", "Histogram", "Log"], "Counter", "Counter برای رخدادهای تجمعی است و معمولاً کاهش نمی‌یابد.", "metrics"),
        sa("کارورز — تابع رایج PromQL برای نرخ counter چیست؟", "rate", "rate افزایش counter در یک پنجرهٔ زمانی را محاسبه و reset را مدیریت می‌کند.", "prometheus"),
        tf("کارورز — request_id label مناسبی برای هر request در متریک عمومی است.", false, "مقدار تقریباً یکتا cardinality بسیار بالا می‌سازد.", "metrics"),
        mc("سنیور — کدام نما tail latency را بهتر نشان می‌دهد؟", ["p95 یا p99", "فقط average", "counter خام", "تعداد target"], "p95 یا p99", "صدک‌های بالا تجربهٔ درخواست‌های کند را آشکار می‌کنند.", "grafana"),
      ],
    },
  },
  {
    dayNumber: 32,
    phaseSlug: "observability",
    titleFa: "لاگ با Loki و Trace با OpenTelemetry",
    objectiveFa: "لاگ ساخت‌یافته و کم‌کاردینال را در Loki جست‌وجو کنید، trace توزیع‌شده را بفهمید و با OpenTelemetry سیگنال‌ها را هم‌بسته کنید.",
    topicSlugs: ["loki", "obs-logs", "traces", "otel"],
    lessons: [
      {
        slug: "loki-logs",
        topicSlug: "loki",
        titleFa: "Loki و لاگ ساخت‌یافته",
        objectiveFa: "تفاوت label و محتوای لاگ را بفهمید و LogQL کم‌هزینه و قابل‌تحقیق بنویسید.",
        theoryMd: `## مبتدی
لاگ یک رخداد با context است: timestamp، level، service، message و ترجیحاً trace_id. Loki برخلاف موتورهای full-text سنتی عمدتاً labelها را index می‌کند و متن chunkها را نگه می‌دارد. query ابتدا stream را با label selector محدود و سپس متن را filter می‌کند.

## کارورز
Labelهایی مانند service، environment و region دامنهٔ محدود دارند. request_id، user_id و timestamp را label نکنید؛ آن‌ها داخل بدنهٔ JSON بمانند و هنگام query parse شوند. لاگ structured نسبت به متن آزاد filtering پایدارتر دارد. retention، sampling و حذف دادهٔ شخصی باید policy روشن داشته باشد.

## زاویهٔ مصاحبهٔ سنیور
هزینهٔ logging را با volume، cardinality و retention کنترل کنید. خطای ساکت بد است، اما log کردن هر request با payload کامل نیز امنیت و هزینه را خراب می‌کند. trace_id پل مهم میان log و trace است. در incident ابتدا stream را با label محدود کنید، سپس بازهٔ زمانی و عبارت را تنگ کنید.`,
        practicalMd: `schema یک خط JSON برای checkout طراحی کنید و یک LogQL بنویسید که errorهای production را محدود، JSON را parse و بر اساس status فیلتر کند.`,
        exampleMd: `\`\`\`logql
{service="checkout", environment="production"}
  | json
  | level="error"
  | status >= 500
\`\`\``,
        commands: ["curl -s localhost:3100/ready", "curl -G -s localhost:3100/loki/api/v1/query_range --data-urlencode 'query={service=\"checkout\"}'"],
      },
      {
        slug: "otel-tracing",
        topicSlug: "otel",
        titleFa: "Trace و OpenTelemetry؛ سفر یک درخواست",
        objectiveFa: "trace، span، context propagation و نقش Collector را در سامانهٔ توزیع‌شده توضیح دهید.",
        theoryMd: `## مبتدی
Trace سفر یک درخواست بین سرویس‌هاست. هر trace چند span دارد؛ span یک عملیات با start، duration، status و attribute است. parent/child ترتیب فراخوانی را نشان می‌دهد. trace_id همهٔ spanهای یک درخواست و span_id یک عملیات را مشخص می‌کند.

OpenTelemetry استاندارد و SDK برای تولید metrics، logs و traces است. Collector داده را receive، پردازش و به backend صادر می‌کند و وابستگی مستقیم برنامه به vendor را کم می‌کند.

## کارورز
اگر context از header بین سرویس‌ها propagate نشود، trace شکسته می‌شود. semantic convention نام attributeها را یکسان می‌کند. head sampling پیش از دیدن نتیجه تصمیم می‌گیرد و ارزان‌تر است؛ tail sampling می‌تواند traceهای خطادار/کند را پس از مشاهده نگه دارد اما state و هزینهٔ بیشتری دارد.

## زاویهٔ مصاحبهٔ سنیور
همهٔ spanها را نگه داشتن معمولاً اقتصادی نیست. sampling باید خطا و مسیرهای حساس را حفظ کند. attribute با cardinality بالا هزینه دارد و اطلاعات محرمانه نباید وارد span شود. instrumentation خودکار شروع خوبی است اما spanهای business-critical و مرز queue نیاز به instrumentation آگاهانه دارند.`,
        practicalMd: `مسیر browser → gateway → checkout → payment را به spanها بشکنید. نقاط context propagation، attributeهای مجاز و policy sampling برای خطا و latency بالا را تعیین کنید.`,
        exampleMd: `\`\`\`text
trace 4bf92f...
└─ gateway HTTP POST /checkout
   ├─ checkout validate-cart
   └─ payment charge
      └─ database INSERT transaction
\`\`\``,
        commands: ["curl -s localhost:13133", "curl -s localhost:4318/v1/traces"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی لاگ Loki",
        topicSlug: "obs-logs",
        lessonSlug: "loki-logs",
        path: "/tmp/day32-logs.txt",
        mustContain: "trace_id",
        instructionsMd: "سؤال مصاحبه: برای Loki چگونه schema لاگ ساخت‌یافته، labelهای کم‌کاردینال و query مناسب طراحی می‌کنید و شناسهٔ درخواست توزیع‌شده را کجا نگه می‌دارید؟ پاسخ را در آزمایشگاه ثبت کنید.",
      }),
      noteExercise({
        titleFa: "نقشهٔ Trace و Sampling",
        topicSlug: "traces",
        lessonSlug: "otel-tracing",
        path: "/tmp/day32-traces.txt",
        mustContain: "propagation",
        instructionsMd: "هدف این است که مسیر trace یک درخواست چندسرویسی را طراحی کنید، نقاط انتقال context را مشخص کنید و انتخاب head یا tail sampling را توجیه کنید. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Trace در مرز Queue قطع می‌شود",
      path: "/tmp/day32-scenario.txt",
      mustContain: "context",
      incidentMd: "در UI trace، درخواست تا producer دیده می‌شود اما پردازش consumer یک trace مستقل ساخته و ارتباط دو بخش گم شده است.",
      symptomsMd: "trace_id پیش و پس از queue متفاوت است و latency انتها‌به‌انتها قابل محاسبه نیست.",
      rootCause: "Trace context در metadata پیام inject و در consumer extract نشده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۲",
      questions: [
        mc("مبتدی — چند span مرتبط چه چیزی را تشکیل می‌دهند؟", ["Trace", "Gauge", "Dashboard", "Alert"], "Trace", "Trace مسیر انتها‌به‌انتهای درخواست و spanهای عملیات را نشان می‌دهد.", "traces"),
        tf("کارورز — Loki بهتر است request_id یکتا را label کند.", false, "این کار cardinality streamها را بسیار بالا می‌برد.", "loki"),
        sa("کارورز — شناسهٔ مناسب برای اتصال یک لاگ به trace چیست؟", "trace_id", "ثبت trace_id در لاگ امکان پرش از رخداد به trace را می‌دهد.", "obs-logs"),
        mc("سنیور — مزیت tail sampling چیست؟", ["تصمیم پس از دیدن نتیجهٔ trace", "صفر کردن هزینه", "حذف propagation", "تبدیل log به metric"], "تصمیم پس از دیدن نتیجهٔ trace", "می‌توان traceهای خطادار یا کند را هدفمند نگه داشت.", "otel"),
      ],
    },
  },
  {
    dayNumber: 33,
    phaseSlug: "observability",
    titleFa: "Alertmanager، هشدار و داشبورد Incident",
    objectiveFa: "هشدارهای actionable طراحی کنید، routing و inhibition را در Alertmanager بسازید و dashboard را به runbook و پاسخ incident متصل کنید.",
    topicSlugs: ["alertmanager", "alerts", "dashboards"],
    lessons: [
      {
        slug: "alert-rules",
        topicSlug: "alerts",
        titleFa: "هشدار خوب؛ علامت نیازمند اقدام",
        objectiveFa: "هشدار را بر symptom کاربر، مدت پایدار و context عملیاتی طراحی کنید.",
        theoryMd: `## مبتدی
Alert زمانی لازم است که انسانی باید اقدام کند. هر افت‌وخیز نمودار alert نیست. rule شامل expression، مدت \`for\`، labelهای severity/team و annotationهایی مانند summary و runbook است. \`for\` از page شدن بر اثر spike کوتاه جلوگیری می‌کند.

## کارورز
روی symptom کاربر مثل error ratio و latency alert کنید، نه صرفاً علت احتمالی مثل CPU. warning می‌تواند ticket باشد و critical page. هشدار باید owner، اثر، dashboard و runbook داشته باشد. absent data را آگاهانه مدیریت کنید؛ نبود متریک ممکن است exporter down یا واقعاً نبود traffic باشد.

## زاویهٔ مصاحبهٔ سنیور
Alert fatigue نتیجهٔ threshold بد، duplicate و نبود ownership است. کیفیت را با page volume، false positive و time-to-ack بسنجید. multi-window burn-rate برای SLO بهتر از threshold ثابت است چون هم burn سریع و هم فرسایش آهسته را کشف می‌کند.`,
        practicalMd: `برای error ratio یک alert با threshold، for، severity، summary و runbook بنویسید. توضیح دهید چرا CPU بالا فقط در صورت ارتباط روشن با اثر کاربر page می‌شود.`,
        exampleMd: `\`\`\`yaml
- alert: CheckoutHighErrorRate
  expr: job:http_5xx_ratio:rate5m > 0.05
  for: 10m
  labels:
    severity: critical
    team: payments
  annotations:
    runbook_url: https://runbooks.example/checkout-errors
\`\`\``,
        commands: ["promtool check rules alerts.yml", "promtool test rules tests.yml"],
      },
      {
        slug: "alertmanager-routing",
        topicSlug: "alertmanager",
        titleFa: "Alertmanager و داشبورد پاسخ‌گویی",
        objectiveFa: "group، route، silence و inhibition را بدون پنهان کردن حادثه به‌کار ببرید.",
        theoryMd: `## مبتدی
Prometheus alert را ارزیابی می‌کند؛ Alertmanager آن را deduplicate، group و route می‌کند. route بر اساس labelهایی مثل team و severity گیرنده را انتخاب می‌کند. Silence برای بازهٔ نگهداری برنامه‌ریزی‌شده است.

## کارورز
Grouping صد alert از instanceهای یک سرویس را به یک notification تبدیل می‌کند. Inhibition وقتی alert ریشه‌ای فعال است هشدارهای وابسته را موقتاً suppress می‌کند؛ مثلاً down بودن cluster هشدار instanceها را مهار کند. mute کردن دائمی درمان rule بد نیست.

Dashboard لینک‌شده باید همان label و بازهٔ incident را باز کند: impact، SLO، deploy، saturation و وابستگی‌ها. notification باید کوتاه اما actionable باشد.

## زاویهٔ مصاحبهٔ سنیور
Routing tree باید ownership سازمان را منعکس کند و fallback معتبر داشته باشد. config و templateها versioned و تست شوند. HA Alertmanager برای جلوگیری از نقطهٔ شکست لازم است، اما receiver خارجی نیز باید retry و deduplication را تحمل کند. silence بدون تاریخ انقضا debt عملیاتی است.`,
        practicalMd: `یک routing tree برای warning و critical دو تیم طراحی کنید. یک inhibition ریشه‌ای و dashboard incident با لینک logs/traces/runbook تعریف کنید.`,
        exampleMd: `\`\`\`yaml
route:
  group_by: [alertname, service]
  receiver: platform-default
  routes:
    - matchers: [team="payments", severity="critical"]
      receiver: payments-pager
\`\`\``,
        commands: ["amtool config routes show", "amtool alert query", "amtool silence query"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "نوشتن Alert قابل اقدام",
        topicSlug: "alerts",
        lessonSlug: "alert-rules",
        path: "/tmp/day33-alert.txt",
        mustContain: "runbook",
        instructionsMd: "هدف این است که برای خطای checkout یک alert قابل اقدام طراحی کنید و شرط، پایداری زمانی، شدت، مالک، اثر کاربر و مسیر اقدام را توضیح دهید. پاسخ را در آزمایشگاه ثبت کنید.",
      }),
      noteExercise({
        titleFa: "طراحی Routing و Inhibition",
        topicSlug: "alertmanager",
        lessonSlug: "alertmanager-routing",
        path: "/tmp/day33-routing.txt",
        mustContain: "inhibition",
        instructionsMd: "سؤال مصاحبه: چگونه routing هشدارهای warning و critical، grouping، suppression وابسته و silence زمان‌دار را طراحی می‌کنید تا نویز کم شود اما حادثه پنهان نماند؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "طوفان هشدار پس از قطع Cluster",
      path: "/tmp/day33-scenario.txt",
      mustContain: "group",
      incidentMd: "با قطع یک cluster، صدها هشدار instance و dependency هم‌زمان pager همهٔ تیم‌ها را اشباع کرده‌اند و alert ریشه‌ای میان نویز گم شده است.",
      symptomsMd: "notification تکراری، route عمومی و نبود grouping/inhibition دیده می‌شود.",
      rootCause: "Alertmanager بر اساس service/cluster گروه‌بندی و هشدارهای فرزند را هنگام alert ریشه‌ای inhibit نکرده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۳",
      questions: [
        tf("مبتدی — هر spike کوتاه باید فوراً pager را فعال کند.", false, "مدت for و تمرکز بر اثر پایدار از page کاذب جلوگیری می‌کند.", "alerts"),
        mc("کارورز — deduplication و routing معمولاً وظیفهٔ چیست؟", ["Alertmanager", "Loki", "Trace SDK", "Terraform"], "Alertmanager", "Alertmanager alertهای firing را گروه‌بندی و به receiver مناسب route می‌کند.", "alertmanager"),
        sa("کارورز — سرکوب alert فرزند به‌علت فعال بودن alert ریشه‌ای چه نام دارد؟", "inhibition", "Inhibition نویز وابسته را با matcherهای source/target کاهش می‌دهد.", "alertmanager"),
        tf("سنیور — silence بدون انقضا راه مناسبی برای اصلاح alert پرنویز است.", false, "Silence دائمی مشکل rule را پنهان و پوشش هشدار را حذف می‌کند.", "alerts"),
      ],
    },
  },
  {
    dayNumber: 34,
    phaseSlug: "observability",
    titleFa: "SLI، SLO، SLA و Error Budget",
    objectiveFa: "اعتمادپذیری را از دید کاربر اندازه بگیرید، تعهد داخلی و قراردادی را جدا کنید و error budget را به تصمیم انتشار و مصاحبهٔ سنیور پیوند دهید.",
    topicSlugs: ["sli", "slo", "sla", "error-budget"],
    lessons: [
      {
        slug: "sli-slo-sla",
        topicSlug: "sli",
        titleFa: "از اندازه‌گیری تا هدف و قرارداد",
        objectiveFa: "SLI خوب انتخاب کنید و تفاوت SLO داخلی با SLA قراردادی را دقیق توضیح دهید.",
        theoryMd: `## مبتدی
**SLI** شاخص اندازه‌گیری‌شده است، مثل نسبت درخواست موفق یا latency زیر ۳۰۰ms. **SLO** هدف داخلی برای همان شاخص در یک window است، مثلاً ۹۹٫۹٪ درخواست موفق در ۳۰ روز. **SLA** قرارداد با مشتری است و معمولاً پیامد نقض مانند credit دارد.

## کارورز
availability را از دید کاربر تعریف کنید: good events / valid events. پاسخ عمدی 4xx شاید خطای سرویس نباشد؛ 5xx و timeout معمولاً bad هستند. window rolling رفتار فعلی را بهتر از ماه تقویمی نشان می‌دهد. هدف ۱۰۰٪ هزینه و توقف نوآوری می‌سازد؛ هدف باید با نیاز کسب‌وکار سازگار باشد.

## زاویهٔ مصاحبهٔ سنیور
SLA معمولاً از SLO ضعیف‌تر تنظیم می‌شود تا حاشیهٔ عملیاتی وجود داشته باشد. اندازه‌گیری از load balancer، synthetic یا client trade-off دارد. SLI باید قابل‌کنترل، مقاوم در برابر gaming و متناظر با تجربهٔ کاربر باشد. چند SLO زیاد تمرکز تیم را از بین می‌برد.`,
        practicalMd: `برای API پرداخت availability و latency SLI را با صورت و مخرج دقیق تعریف کنید؛ سپس SLO سی‌روزه و SLA قراردادی محافظه‌کارانه‌تر بنویسید.`,
        exampleMd: `\`\`\`text
SLI = successful valid requests / all valid requests
SLO = 99.9% over rolling 30 days
SLA = 99.5% per calendar month with service credit
\`\`\``,
        commands: ["promtool check rules slo-rules.yml"],
      },
      {
        slug: "error-budget-policy",
        topicSlug: "error-budget",
        titleFa: "Error Budget و Burn Rate؛ زبان مشترک سرعت و پایداری",
        objectiveFa: "بودجهٔ خطا را محاسبه کنید و آن را به policy تصمیم‌گیری قابل‌اجرا تبدیل کنید.",
        theoryMd: `## مبتدی
اگر SLO برابر ۹۹٫۹٪ باشد، error budget برابر ۰٫۱٪ رخداد بد در همان window است. برای ۳۰ روز زمان، تقریب ساده حدود ۴۳ دقیقه عدم‌دسترس‌پذیری است، ولی event-based budget دقیق‌تر می‌تواند بر تعداد request محاسبه شود.

## کارورز
Burn rate می‌گوید بودجه چند برابر سرعت مجاز مصرف می‌شود. burn rate برابر ۱ یعنی با همان سرعت تا پایان window دقیقاً بودجه تمام می‌شود؛ مقدار بزرگ نیازمند واکنش سریع‌تر است. alert چندپنجره‌ای هم outage تند و هم فرسایش کند را می‌بیند.

## زاویهٔ مصاحبهٔ سنیور
Error budget ابزار تنبیه نیست؛ قرارداد تصمیم میان محصول و reliability است. policy باید روشن کند هنگام مصرف بودجه چه می‌شود: محدود کردن release پرریسک، اولویت دادن به کار پایداری، و استثنای امنیتی. freeze کور و دائمی باعث پنهان‌کاری می‌شود. بودجه باید برای dependency و segmentهای مهم نیز قابل‌تحلیل باشد، بدون اینکه ده‌ها هدف متناقض بسازیم.`,
        practicalMd: `بودجهٔ یک SLO ۹۹٫۹٪ را محاسبه و policy سه‌سطحی برای مصرف ۵۰٪، ۸۰٪ و ۱۰۰٪ بنویسید. release امنیتی را به‌عنوان استثنای کنترل‌شده لحاظ کنید.`,
        exampleMd: `\`\`\`text
Budget healthy: normal releases
50% consumed early: review risky changes
80% consumed: prioritize reliability work
100% consumed: pause nonessential risk; security fixes still reviewed
\`\`\``,
        commands: ["promtool test rules slo-tests.yml"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "تعریف SLI و SLO قابل‌اندازه‌گیری",
        topicSlug: "slo",
        lessonSlug: "sli-slo-sla",
        path: "/tmp/day34-slo.txt",
        mustContain: "good events",
        instructionsMd: "هدف این است که برای یک سرویس، SLI را از دید کاربر تعریف کنید و یک SLO پنجره‌ای و SLA محافظه‌کارانه‌تر با پیامد نقض طراحی کنید. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "سیاست Error Budget",
        topicSlug: "error-budget",
        lessonSlug: "error-budget-policy",
        path: "/tmp/day34-budget.txt",
        mustContain: "burn rate",
        instructionsMd: "سؤال مصاحبه: بودجهٔ خطا برای هدف 99.9% چگونه محاسبه می‌شود، سرعت مصرف آن چه معنایی دارد و چگونه باید بر سیاست انتشار اثر بگذارد؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "SLO سبز، کاربران موبایل ناراضی",
      path: "/tmp/day34-scenario.txt",
      mustContain: "SLI",
      incidentMd: "داشبورد availability از داخل دیتاسنتر 99.99% نشان می‌دهد، اما کاربران موبایل timeout گسترده گزارش می‌کنند و SLA نزدیک نقض است.",
      symptomsMd: "اندازه‌گیری server-side درخواست‌هایی را که اصلاً به سرور نرسیده‌اند نمی‌بیند.",
      rootCause: "SLI از نقطه‌ای انتخاب شده که تجربهٔ واقعی client و شکست مسیر edge را پوشش نمی‌دهد.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۴",
      questions: [
        mc("مبتدی — کدام مورد هدف داخلی قابلیت اطمینان است؟", ["SLO", "SLI", "SLA credit", "Log"], "SLO", "SLO هدف روی SLI است؛ SLA قرارداد خارجی و SLI اندازه‌گیری است.", "slo"),
        tf("کارورز — SLA معمولاً می‌تواند پیامد قراردادی نقض داشته باشد.", true, "Service credit نمونهٔ پیامد SLA است.", "sla"),
        sa("کارورز — بودجهٔ خطای SLO برابر 99.9% چند درصد است؟", "0.1%", "مکمل هدف: 100%-99.9%=0.1%.", "error-budget"),
        mc("سنیور — burn rate برابر ۱ چه مفهومی دارد؟", ["مصرف بودجه با سرعت مجاز window", "هیچ خطایی نیست", "بودجه فوراً تمام شده", "SLA حذف شده"], "مصرف بودجه با سرعت مجاز window", "اگر این نرخ ادامه یابد بودجه درست در انتهای window مصرف می‌شود.", "error-budget"),
      ],
    },
  },
];
