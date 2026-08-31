import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "./types";

export const sreDays: DaySeed[] = [
  {
    dayNumber: 35,
    phaseSlug: "sre",
    titleFa: "Reliability، Availability، HA و Fault Tolerance",
    objectiveFa: "قابلیت اطمینان را به‌صورت مهندسی تعریف کنید، availability را درست محاسبه کنید و تفاوت افزونگی، دسترس‌پذیری بالا و تحمل خطا را در طراحی توضیح دهید.",
    topicSlugs: ["reliability", "availability", "ha", "fault-tolerance"],
    lessons: [
      {
        slug: "reliability-availability",
        topicSlug: "reliability",
        titleFa: "Reliability و Availability؛ سالم بودن از دید کاربر",
        objectiveFa: "شاخص‌های خرابی و بازیابی را بفهمید و availability اسمی را با تجربهٔ واقعی کاربر اشتباه نگیرید.",
        theoryMd: `## مبتدی
Reliability یعنی سامانه در یک بازه وظیفهٔ درست را پیوسته انجام دهد. Availability سهم زمانی یا رخدادهایی است که سرویس قابل‌استفاده است. سامانه‌ای ممکن است بیشتر اوقات up باشد اما پاسخ غلط بدهد؛ بنابراین health فقط روشن بودن process نیست.

فرمول تقریبی availability مبتنی بر زمان: \`MTBF / (MTBF + MTTR)\`. افزایش فاصلهٔ خرابی‌ها یا کاهش زمان بازیابی availability را بهتر می‌کند.

## کارورز
اندازه‌گیری باید از دید user journey باشد. endpoint سلامت داخلی ممکن است سبز باشد ولی login یا payment خراب باشد. planned maintenance، partial failure و dependency باید در تعریف شاخص روشن شوند. Reliability با deploy کوچک، rollback سریع، observability، capacity و حذف single point of failure ساخته می‌شود.

## زاویهٔ مصاحبهٔ سنیور
تعداد نه‌ها هزینهٔ غیرخطی دارد؛ 99.99 بدون معماری، عملیات و dependency هم‌سطح یک شعار است. availability ترکیبی از componentهای سری کاهش می‌یابد. دربارهٔ error budget، graceful degradation و trade-off consistency/availability متناسب با نیاز کسب‌وکار صحبت کنید، نه «همیشه پنج نه».`,
        practicalMd: `برای checkout تعریف «موفق» بنویسید و MTBF/MTTR فرضی را به availability تبدیل کنید. سپس دو راه کاهش MTTR و دو راه افزایش MTBF پیشنهاد دهید.`,
        exampleMd: `\`\`\`text
MTBF = 720 hours
MTTR = 1 hour
Availability ≈ 720 / 721 = 99.86%
\`\`\``,
        commands: ["uptime"],
      },
      {
        slug: "ha-fault-tolerance",
        topicSlug: "ha",
        titleFa: "High Availability و Fault Tolerance",
        objectiveFa: "redundancy، failover، quorum و حذف failure domain مشترک را در معماری مقاوم تحلیل کنید.",
        theoryMd: `## مبتدی
HA هدف کم کردن downtime با چند نمونه و failover است. Fault tolerance توان ادامهٔ کار درست هنگام خرابی یک جزء است، گاهی بدون وقفهٔ قابل‌مشاهده. صرف داشتن دو سرور کافی نیست؛ اگر هر دو روی یک rack، database یا credential مشترک وابسته باشند failure domain مشترک باقی است.

## کارورز
Load balancer فقط target سالم را route می‌کند، اما health check باید آمادگی واقعی را بسنجد. active-passive ساده‌تر ولی failover آن باید مرتب تست شود؛ active-active ظرفیت را استفاده می‌کند اما consistency و هماهنگی پیچیده‌تر است. quorum از split-brain جلوگیری می‌کند و odd number رأی‌دهنده رایج است.

## زاویهٔ مصاحبهٔ سنیور
افزونگی آزمایش‌نشده یک فرض است. ظرفیت N+1، anti-affinity، multi-zone، timeout، retry با backoff و circuit breaker لایه‌های متفاوت مقاومت‌اند. retry بدون budget می‌تواند retry storm بسازد. RTO/RPO و هزینه تعیین می‌کنند fault tolerance در کدام مسیر واقعاً لازم است.`,
        practicalMd: `یک سرویس سه‌لایه را روی دو zone طراحی کنید. failure domain هر جزء، health check، quorum، ظرفیت پس از خرابی یک zone و رفتار degraded را بنویسید.`,
        exampleMd: `\`\`\`text
Clients → multi-zone load balancer
          ├─ app-a (zone A)
          └─ app-b (zone B)
Database: quorum across independent zones
Failure policy: bounded retries + circuit breaker
\`\`\``,
        commands: ["curl -fsS http://localhost/health"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "مدل Availability سرویس",
        topicSlug: "availability",
        lessonSlug: "reliability-availability",
        path: "/tmp/day35-availability.txt",
        mustContain: "MTTR",
        instructionsMd: "در `/tmp/day35-availability.txt` availability را با MTBF و MTTR محاسبه کنید و توضیح دهید چگونه deploy کوچک و rollback خودکار MTTR را کاهش می‌دهد.",
      }),
      noteExercise({
        titleFa: "طراحی بدون Failure Domain مشترک",
        topicSlug: "fault-tolerance",
        lessonSlug: "ha-fault-tolerance",
        path: "/tmp/day35-ha.txt",
        mustContain: "quorum",
        instructionsMd: "در `/tmp/day35-ha.txt` معماری multi-zone، ظرفیت N+1، health check، quorum و خطر retry storm را تحلیل کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "دو Replica، یک نقطهٔ شکست",
      path: "/tmp/day35-scenario.txt",
      mustContain: "failure domain",
      incidentMd: "تیم تصور می‌کرد دو replica سرویس را HA کرده است، اما خرابی یک zone هر دو replica و load balancer داخلی را هم‌زمان از دسترس خارج کرد.",
      symptomsMd: "همهٔ نمونه‌ها روی یک zone و subnet قرار دارند و failover مقصدی ندارد.",
      rootCause: "Redundancy در یک failure domain مشترک قرار گرفته و HA واقعی ایجاد نشده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۵",
      questions: [
        mc("مبتدی — کدام تغییر availability را بهتر می‌کند؟", ["کاهش MTTR", "افزایش زمان بازیابی", "حذف health check", "قرار دادن همه در یک zone"], "کاهش MTTR", "بازیابی سریع‌تر سهم downtime را کم می‌کند.", "availability"),
        tf("کارورز — دو replica در یک failure domain الزاماً HA کامل می‌سازند.", false, "خرابی مشترک می‌تواند هر دو را هم‌زمان حذف کند.", "ha"),
        sa("کارورز — سازوکار جلوگیری از split-brain در سیستم رأی‌دهنده چیست؟", "quorum", "Quorum نیاز به اکثریت دارد و مانع فعال شدن دو بخش بدون اکثریت می‌شود.", "fault-tolerance"),
        tf("سنیور — retry نامحدود می‌تواند هنگام خرابی بار را بیشتر کند.", true, "Retry storm dependency ضعیف را اشباع می‌کند؛ backoff، jitter و budget لازم است.", "reliability"),
      ],
    },
  },
  {
    dayNumber: 36,
    phaseSlug: "sre",
    titleFa: "Incident Management، Response، RCA و Postmortem",
    objectiveFa: "حادثه را با نقش‌ها و ارتباط روشن مدیریت کنید، timeline مبتنی بر شواهد بسازید و RCA و postmortem بدون سرزنش را به اقدام اصلاحی تبدیل کنید.",
    topicSlugs: ["incident-mgmt", "incident-response", "rca", "postmortem"],
    lessons: [
      {
        slug: "incident-command",
        topicSlug: "incident-mgmt",
        titleFa: "فرماندهی Incident و پاسخ مرحله‌ای",
        objectiveFa: "severity، نقش‌ها، کانال ارتباط و اولویت mitigation بر diagnosis را در فشار حادثه اجرا کنید.",
        theoryMd: `## مبتدی
Incident اختلال برنامه‌ریزی‌نشده‌ای است که به کاربر یا عملیات آسیب می‌زند. پاسخ معمول: detect، acknowledge، triage، mitigate، recover و learn. در حادثهٔ شدید، Incident Commander هماهنگی و تصمیم را نگه می‌دارد؛ Operations اقدام فنی و Communications اطلاع‌رسانی را انجام می‌دهند.

## کارورز
اول scope و severity را بر اساس impact بسنجید. یک کانال و timeline مشترک بسازید. هدف نخست کاهش آسیب است: rollback، failover، feature flag یا محدود کردن traffic؛ یافتن علت نهایی می‌تواند بعد از recovery ادامه یابد. هر اقدام باید owner، زمان و نتیجه داشته باشد تا دو نفر تغییر متناقض ندهند.

## زاویهٔ مصاحبهٔ سنیور
فرمانده نباید لزوماً بهترین debugger باشد؛ باید cognitive load را مدیریت و تصمیم قابل‌بازگشت را ترجیح دهد. status update با cadence ثابت، facts/unknowns/hypotheses و زمان update بعدی اعتماد می‌سازد. escalation دیرهنگام و تغییرات هم‌زمان کنترل‌نشده MTTR را زیاد می‌کند.`,
        practicalMd: `برای outage پرداخت severity و نقش‌ها را تعیین کنید. پیام اولیهٔ وضعیت، cadence به‌روزرسانی، سه mitigation قابل‌بازگشت و معیار recovery را بنویسید.`,
        exampleMd: `\`\`\`text
SEV-1 | IC: Sara | Ops: API/DB | Comms: Support
Impact: 38% checkout failures since 10:42 UTC
Mitigation: rollback in progress
Next update: 11:05 UTC
\`\`\``,
        commands: ["date -u +%FT%TZ"],
      },
      {
        slug: "rca-postmortem",
        topicSlug: "rca",
        titleFa: "RCA و Blameless Postmortem",
        objectiveFa: "timeline، عوامل مؤثر و اقدام اصلاحی قابل‌سنجش بسازید و از توقف روی «خطای انسانی» عبور کنید.",
        theoryMd: `## مبتدی
RCA تلاش برای فهمیدن چرایی حادثه است. Postmortem سند یادگیری شامل impact، timeline، detection، response، عوامل مؤثر، چیزهای خوب/بد و action itemهاست. Blameless یعنی رفتار افراد را در context سیستم بفهمیم، نه اینکه مسئولیت‌پذیری حذف شود.

## کارورز
«مهندس دستور اشتباه زد» علت ریشه‌ای کافی نیست: چرا دسترسی تولید مستقیم بود؟ چرا preview، approval یا rollback نبود؟ روش Five Whys کمک می‌کند اما سیستم پیچیده معمولاً یک علت واحد ندارد. timeline باید از timestampهای قابل‌اعتماد ساخته شود و fact از hypothesis جدا بماند.

Action item خوب owner، deadline، اولویت و معیار completion دارد. «دقت بیشتر» اقدام اصلاحی نیست؛ guardrail، test، automation و بهبود detection پایدارترند.

## زاویهٔ مصاحبهٔ سنیور
Postmortem نباید گزارش قضایی یا backlog بی‌پایان شود. اقدام‌ها را بر اساس کاهش احتمال، کاهش impact و بهبود detection اولویت‌بندی کنید. review اثربخشی لازم است: آیا guardrail واقعاً کلاس خطا را بست؟ near-missها نیز فرصت یادگیری ارزان‌اند.`,
        practicalMd: `برای یک استقرار معیوب timeline مبتنی بر fact بسازید. سه عامل سیستمی و سه action item با owner/deadline/verification تعریف کنید.`,
        exampleMd: `\`\`\`text
Action: block unreviewed production schema changes
Owner: Platform | Due: 2026-09-15
Verification: CI rejects a destructive migration fixture
\`\`\``,
        commands: ["date -u +%FT%TZ"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "ساخت Incident Brief",
        topicSlug: "incident-response",
        lessonSlug: "incident-command",
        path: "/tmp/day36-response.txt",
        mustContain: "mitigation",
        instructionsMd: "در `/tmp/day36-response.txt` severity، نقش‌های IC/Ops/Comms، impact، mitigation، cadence ارتباط و معیار recovery را برای outage بنویسید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "نوشتن Action Item مؤثر",
        topicSlug: "postmortem",
        lessonSlug: "rca-postmortem",
        path: "/tmp/day36-postmortem.txt",
        mustContain: "owner",
        instructionsMd: "در `/tmp/day36-postmortem.txt` timeline کوتاه، عوامل سیستمی و سه action item دارای owner، deadline و معیار verification بنویسید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "حادثه با تغییرات متناقض",
      path: "/tmp/day36-scenario.txt",
      mustContain: "Incident Commander",
      incidentMd: "در outage، سه مهندس هم‌زمان config، database و load balancer را بدون ثبت timeline تغییر داده‌اند؛ تیم پشتیبانی نیز پیام متفاوتی به مشتری داده است.",
      symptomsMd: "مالک تصمیم روشن نیست، شواهد آلوده شده و هیچ‌کس نمی‌داند کدام تغییر باعث recovery یا تشدید شده است.",
      rootCause: "Incident command، نقش‌ها، کانال واحد و ثبت اقدام‌ها تعریف نشده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۶",
      questions: [
        mc("مبتدی — هدف نخست پاسخ به incident فعال چیست؟", ["کاهش impact", "تکمیل postmortem", "یافتن مقصر", "بازنویسی کامل سامانه"], "کاهش impact", "Mitigation و recovery پیش از تحلیل نهایی علت انجام می‌شود.", "incident-response"),
        tf("کارورز — Incident Commander باید همهٔ debuggingها را شخصاً انجام دهد.", false, "نقش اصلی هماهنگی، تصمیم و کاهش بار شناختی تیم است.", "incident-mgmt"),
        sa("کارورز — سند یادگیری پس از حادثه چه نام دارد؟", "postmortem", "Postmortem impact، timeline، عوامل و اقدام‌های اصلاحی را ثبت می‌کند.", "postmortem"),
        tf("سنیور — «اپراتور باید دقت کند» یک action item سیستمی و قابل‌سنجش است.", false, "Owner، deadline، guardrail و verification لازم است.", "rca"),
      ],
    },
  },
  {
    dayNumber: 37,
    phaseSlug: "sre",
    titleFa: "Capacity، Performance و Disaster Recovery",
    objectiveFa: "ظرفیت را از روی تقاضا و headroom برنامه‌ریزی کنید، bottleneck را با اندازه‌گیری پیدا کنید و RTO/RPO را به طرح DR آزموده تبدیل کنید.",
    topicSlugs: ["capacity", "performance", "dr"],
    lessons: [
      {
        slug: "capacity-performance",
        topicSlug: "capacity",
        titleFa: "Capacity Planning و Performance Engineering",
        objectiveFa: "load، throughput، latency، saturation و headroom را به تصمیم scaling و بهینه‌سازی متصل کنید.",
        theoryMd: `## مبتدی
Capacity یعنی سامانه چه مقدار load را با سطح خدمت مطلوب تحمل می‌کند. Throughput تعداد کار در زمان، latency مدت یک کار و utilization سهم مصرف منبع است. وقتی منبع به saturation نزدیک می‌شود queue و latency معمولاً غیرخطی رشد می‌کنند.

## کارورز
از trend، seasonality، رشد کسب‌وکار و رویدادهای ویژه forecast بسازید. headroom برای burst و خرابی یک node لازم است. average کافی نیست؛ peak، p95/p99 و breakdown را ببینید. Load test باید workload واقعی، warm-up و bottleneck production-like داشته باشد. قبل و بعد از تغییر یک متغیر را اندازه بگیرید.

## زاویهٔ مصاحبهٔ سنیور
Little's Law به‌صورت \`L = λW\` رابطهٔ concurrency، throughput و latency را توضیح می‌دهد. autoscaling lag دارد و dependency پایین‌دستی ممکن است scale نشود. vertical/horizontal scaling، queue، backpressure و admission control trade-off دارند. هدف performance سریع‌ترین benchmark نیست؛ SLO با هزینهٔ قابل‌قبول است.`,
        practicalMd: `برای ترافیک فعلی و رشد ۴۰٪ ظرفیت لازم را با N+1 و headroom محاسبه کنید. load-test plan شامل workload، معیار توقف و مشاهدهٔ bottleneck بنویسید.`,
        exampleMd: `\`\`\`text
Peak demand: 8,000 rps
Safe node capacity: 1,500 rps at p95 target
N+1 requirement: ceil(8000/1500) + 1 = 7 nodes
\`\`\``,
        commands: ["uptime", "free -m", "vmstat 1 5"],
      },
      {
        slug: "disaster-recovery",
        topicSlug: "dr",
        titleFa: "Disaster Recovery؛ Backup تا بازیابی آزموده",
        objectiveFa: "RTO و RPO را تعیین کنید، strategy مناسب انتخاب کنید و restore را به‌جای وجود فایل backup اثبات کنید.",
        theoryMd: `## مبتدی
**RTO** حداکثر زمان قابل‌قبول برای بازیابی سرویس است. **RPO** حداکثر داده‌ای است که از نظر زمان می‌توان از دست داد. backup بدون restore test تضمین بازیابی نیست.

## کارورز
راهکارها از backup/restore تا pilot light، warm standby و active-active هزینه و سرعت متفاوت دارند. replication جای backup نیست؛ حذف یا corruption می‌تواند replicate شود. backup باید رمزگذاری، versioned، جدا از failure domain و با policy نگهداری باشد. runbook شامل تصمیم failover و failback است.

## زاویهٔ مصاحبهٔ سنیور
DR باید business service را بازیابی کند، نه فقط database را. DNS TTL، credential، dependency، schema compatibility و ظرفیت region دوم اهمیت دارند. game day زمان واقعی را با RTO مقایسه می‌کند. RPO صفر معمولاً نیازمند synchronous replication و trade-off latency/availability است؛ آن را رایگان فرض نکنید.`,
        practicalMd: `برای سرویس سفارش RTO/RPO بنویسید و strategy متناسب انتخاب کنید. مراحل restore، validation داده، تغییر traffic و failback را با owner مشخص کنید.`,
        exampleMd: `\`\`\`text
RTO: 60 minutes | RPO: 5 minutes
Strategy: warm standby + immutable backups
Proof: quarterly restore and regional failover game day
\`\`\``,
        commands: ["date -u +%FT%TZ"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "برنامهٔ ظرفیت N+1",
        topicSlug: "capacity",
        lessonSlug: "capacity-performance",
        path: "/tmp/day37-capacity.txt",
        mustContain: "headroom",
        instructionsMd: "در `/tmp/day37-capacity.txt` demand، ظرفیت امن هر node، N+1، headroom، autoscaling lag و معیارهای p95/p99 را تحلیل کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "طرح DR قابل‌آزمایش",
        topicSlug: "dr",
        lessonSlug: "disaster-recovery",
        path: "/tmp/day37-dr.txt",
        mustContain: "RPO",
        instructionsMd: "در `/tmp/day37-dr.txt` RTO/RPO، strategy، backup isolation، مراحل restore/failover/failback و برنامهٔ game day را بنویسید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Backup موجود است اما Restore شکست می‌خورد",
      path: "/tmp/day37-scenario.txt",
      mustContain: "restore test",
      incidentMd: "پس از خرابی region، تیم فایل backup روزانه دارد اما کلید رمزگشایی در همان region از دست رفته و نسخهٔ schema ابزار restore ناسازگار است.",
      symptomsMd: "RTO گذشته، backup قابل‌بازیابی نیست و runbook آخرین بار یک سال پیش دیده شده است.",
      rootCause: "تیم وجود backup را معادل DR دانسته و restore test، جداسازی کلید و game day انجام نداده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۷",
      questions: [
        mc("مبتدی — با نزدیک شدن به saturation معمولاً چه رخ می‌دهد؟", ["queue و latency رشد می‌کنند", "latency همیشه صفر می‌شود", "ظرفیت نامحدود می‌شود", "RPO حذف می‌شود"], "queue و latency رشد می‌کنند", "صف در منبع اشباع‌شده باعث رشد غیرخطی تأخیر می‌شود.", "performance"),
        tf("کارورز — average load به‌تنهایی برای capacity planning کافی است.", false, "Peak، seasonality، percentile و failure headroom نیز لازم‌اند.", "capacity"),
        sa("کارورز — بیشینهٔ دادهٔ قابل‌قبول برای از دست رفتن با چه مخففی بیان می‌شود؟", "RPO", "Recovery Point Objective مرز زمانی از دست رفتن داده است.", "dr"),
        tf("سنیور — replication به‌تنهایی جای backup مستقل را می‌گیرد.", false, "حذف و corruption می‌تواند replicate شود؛ backup versioned و جدا لازم است.", "dr"),
      ],
    },
  },
  {
    dayNumber: 38,
    phaseSlug: "sre",
    titleFa: "Chaos Engineering، Failure Scenario و Operational Excellence",
    objectiveFa: "فرضیهٔ پایداری را با آزمایش کنترل‌شده بسنجید، سناریوهای شکست ترکیبی را پیش‌بینی کنید و اصول operational excellence را در پاسخ سنیور جمع‌بندی کنید.",
    topicSlugs: ["chaos", "failure-scenarios", "opex"],
    lessons: [
      {
        slug: "chaos-engineering",
        topicSlug: "chaos",
        titleFa: "Chaos Engineering؛ آزمایش فرضیه، نه خرابکاری",
        objectiveFa: "steady state، hypothesis، blast radius و abort condition را برای آزمایش امن تعریف کنید.",
        theoryMd: `## مبتدی
Chaos Engineering یعنی آزمایش کنترل‌شده برای کشف ضعف پیش از حادثه. ابتدا steady state قابل‌اندازه‌گیری مانند نرخ موفقیت تعریف می‌شود، سپس فرضیه می‌گوید با خرابی مشخص این وضعیت باید حفظ شود. خاموش کردن تصادفی production بدون هدف chaos engineering نیست.

## کارورز
از محیط کم‌ریسک و blast radius کوچک شروع کنید: kill یک pod، افزودن latency یا قطع یک dependency. monitoring، owner، communication و rollback/abort condition باید پیش از اجرا حاضر باشند. یک متغیر را تغییر دهید و نتیجه را ثبت کنید. آزمایش موفق حتی می‌تواند فرضیه را رد و شکاف واقعی را آشکار کند.

## زاویهٔ مصاحبهٔ سنیور
Game day فقط ابزار فنی نیست؛ response، runbook و تصمیم انسانی را نیز می‌آزماید. آزمایش باید از risk model و incidentهای قبلی بیاید. اجرای chaos هنگام freeze یا بدون رضایت owner بی‌مسئولیتی است. یادگیری باید به backlog با owner و retest تبدیل شود.`,
        practicalMd: `برای حذف یک replica آزمایش طراحی کنید: steady state، hypothesis، blast radius، telemetry، abort threshold، rollback و معیار موفقیت را بنویسید.`,
        exampleMd: `\`\`\`text
Steady state: success rate > 99.9%, p95 < 300ms
Experiment: terminate one replica for 10 minutes
Abort: error rate > 2% for 2 minutes
Expected: traffic shifts; no SLO breach
\`\`\``,
        commands: ["date -u +%FT%TZ"],
      },
      {
        slug: "failure-opex",
        topicSlug: "failure-scenarios",
        titleFa: "Failure Scenarios و Operational Excellence",
        objectiveFa: "شکست‌های آبشاری را مدل کنید و عملیات را با استاندارد، اتوماسیون، یادگیری و کاهش toil بهبود دهید.",
        theoryMd: `## مبتدی
Failure scenario زنجیرهٔ «محرک، اثر، detection، mitigation و recovery» است. نمونه‌ها: dependency کند، disk پر، certificate منقضی، DNS خراب، region down یا queue backlog. طراحی فقط برای happy path کافی نیست.

Operational excellence یعنی عملیات قابل‌تکرار، مشاهده‌پذیر و رو به بهبود: runbook، on-call سالم، change review، automation، capacity plan و postmortem.

## کارورز
شکست‌ها ترکیبی‌اند: timeout بلند + retry بدون jitter + dependency کند می‌تواند thread pool را پر و outage آبشاری بسازد. timeout، retry budget، circuit breaker، load shedding و backpressure باید هماهنگ شوند. Toil کار دستی، تکراری، قابل‌اتوماسیون و بدون ارزش ماندگار است؛ اندازه‌گیری و کاهش آن ظرفیت مهندسی آزاد می‌کند.

## زاویهٔ مصاحبهٔ سنیور
Excellence با تعداد ابزار سنجیده نمی‌شود؛ با outcome مانند change failure rate، MTTR، SLO attainment، کاهش toil و یادگیری بسته‌شده سنجیده می‌شود. استانداردها باید paved road بسازند نه دروازهٔ کند. تمرکز بر socio-technical system، ownership و feedback loop پاسخ مصاحبه را از فهرست ابزار بالاتر می‌برد.`,
        practicalMd: `سناریوی کندی database را تا retry storm مدل کنید. برای هر مرحله signal، guardrail و mitigation بدهید و دو toil پرتکرار را برای اتوماسیون اولویت‌بندی کنید.`,
        exampleMd: `\`\`\`text
DB latency → request timeout → synchronized retries → pool saturation
Controls: bounded timeout, jittered retry budget, circuit breaker,
          queue limits, load shedding, clear runbook and owner
\`\`\``,
        commands: ["uptime", "free -m", "df -h"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی آزمایش Chaos امن",
        topicSlug: "chaos",
        lessonSlug: "chaos-engineering",
        path: "/tmp/day38-chaos.txt",
        mustContain: "abort",
        instructionsMd: "در `/tmp/day38-chaos.txt` steady state، hypothesis، fault، blast radius، telemetry، abort condition، rollback و retest را برای یک آزمایش بنویسید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "پاسخ مصاحبهٔ Operational Excellence",
        topicSlug: "opex",
        lessonSlug: "failure-opex",
        path: "/tmp/day38-opex.txt",
        mustContain: "toil",
        instructionsMd: "در `/tmp/day38-opex.txt` یک failure chain، guardrailها و تعریف operational excellence را با SLO، MTTR، change failure rate، toil و feedback loop توضیح دهید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Chaos بدون Guardrail در Production",
      path: "/tmp/day38-scenario.txt",
      mustContain: "blast radius",
      incidentMd: "مهندس برای آزمایش failover یک zone را در ساعت اوج بدون owner، steady-state metric یا abort condition قطع کرده و retry storm کل region را اشباع کرده است.",
      symptomsMd: "آزمایش قابل‌توقف نیست، تیم on-call از آن خبر ندارد و dependency پایین‌دستی نیز overload شده است.",
      rootCause: "آزمایش chaos بدون فرضیه، blast radius محدود، هماهنگی و guardrail اجرا شده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۸",
      questions: [
        mc("مبتدی — اولین جزء آزمایش chaos معنادار چیست؟", ["steady state و hypothesis", "قطع تصادفی همهٔ zoneها", "حذف monitoring", "retry نامحدود"], "steady state و hypothesis", "باید بدانیم چه رفتار پایداری را می‌آزماییم و چگونه اندازه می‌گیریم.", "chaos"),
        tf("کارورز — آزمایش chaos باید abort condition از پیش تعریف‌شده داشته باشد.", true, "Guardrail مانع عبور impact از محدودهٔ پذیرفته‌شده می‌شود.", "chaos"),
        sa("کارورز — کار دستی تکراری و قابل‌اتوماسیون در SRE چه نام دارد؟", "toil", "کاهش toil ظرفیت تیم را برای مهندسی پایداری آزاد می‌کند.", "opex"),
        mc("سنیور — کدام ترکیب retry storm را بهتر مهار می‌کند؟", ["backoff+jitter+retry budget", "retry فوری نامحدود", "timeout بی‌نهایت", "حذف circuit breaker"], "backoff+jitter+retry budget", "محدودیت، پخش زمانی و بودجه از هم‌زمانی و amplification جلوگیری می‌کنند.", "failure-scenarios"),
      ],
    },
  },
];
