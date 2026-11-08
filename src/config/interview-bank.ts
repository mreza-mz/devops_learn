export type InterviewCategory =
  | "go-fundamentals"
  | "concurrency"
  | "algorithms"
  | "database"
  | "system-design"
  | "backend"
  | "problem-solving";

export type InterviewDifficulty = "easy" | "medium" | "hard";

export type InterviewQuestion = {
  id: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  promptFa: string;
  rubricFa: string;
  expectedPoints: string[];
};

export const INTERVIEW_MODE_COUNTS = {
  quick: 10,
  standard: 20,
} as const;

export type InterviewMode = keyof typeof INTERVIEW_MODE_COUNTS;

export const INTERVIEW_CATEGORY_LABELS: Record<InterviewCategory, string> = {
  "go-fundamentals": "مبانی Go",
  concurrency: "هم‌زمانی",
  algorithms: "الگوریتم",
  database: "دیتابیس",
  "system-design": "طراحی سیستم",
  backend: "Backend",
  "problem-solving": "حل مسئله",
};

export const INTERVIEW_LESSON_BY_CATEGORY: Record<InterviewCategory, { dayNumber: number; labelFa: string }> = {
  "go-fundamentals": { dayNumber: 42, labelFa: "روز ۴۲ — مبانی و هم‌زمانی Go" },
  concurrency: { dayNumber: 42, labelFa: "روز ۴۲ — مصاحبه هم‌زمانی" },
  algorithms: { dayNumber: 43, labelFa: "روز ۴۳ — الگوریتم و دیتابیس" },
  database: { dayNumber: 43, labelFa: "روز ۴۳ — مهندسی دیتابیس" },
  "system-design": { dayNumber: 44, labelFa: "روز ۴۴ — طراحی سیستم" },
  backend: { dayNumber: 45, labelFa: "روز ۴۵ — Backend تولیدی" },
  "problem-solving": { dayNumber: 45, labelFa: "روز ۴۵ — حل مسئله مهندسی" },
};

export const INTERVIEW_QUESTION_BANK: InterviewQuestion[] = [
  {
    id: "go-01",
    category: "go-fundamentals",
    difficulty: "easy",
    promptFa: "تفاوت array و slice در Go چیست و هدر slice شامل چه فیلدهایی است؟",
    rubricFa: "باید len/cap، اشاره به آرایهٔ زیرین، و رفتار append/reallocate را توضیح دهد.",
    expectedPoints: ["pointer", "len", "cap", "append"],
  },
  {
    id: "go-02",
    category: "go-fundamentals",
    difficulty: "medium",
    promptFa: "escape analysis چیست و چرا برای بهینه‌سازی latency مهم است؟",
    rubricFa: "تصمیم کامپایلر stack vs heap، فشار GC، و مثال escape (مثلاً برگرداندن pointer).",
    expectedPoints: ["heap", "stack", "escape", "gc"],
  },
  {
    id: "go-03",
    category: "go-fundamentals",
    difficulty: "medium",
    promptFa: "تفاوت value receiver و pointer receiver روی method چیست و چه زمانی pointer receiver لازم است؟",
    rubricFa: "کپی vs mutate، interface satisfaction، و عملکرد.",
    expectedPoints: ["pointer receiver", "mutate", "copy"],
  },
  {
    id: "go-04",
    category: "go-fundamentals",
    difficulty: "hard",
    promptFa: "data race در Go چیست و چه ابزارهایی برای تشخیص آن دارید؟",
    rubricFa: "تعریف data race، race detector، و راه‌های امن‌سازی (mutex/channel/atomic).",
    expectedPoints: ["data race", "-race", "mutex"],
  },
  {
    id: "go-05",
    category: "go-fundamentals",
    difficulty: "easy",
    promptFa: "zero value انواع رایج int، string، slice و map در Go چیست؟",
    rubricFa: "۰، \"\", nil برای slice/map و رفتار نوشتن روی nil map.",
    expectedPoints: ["nil", "zero value"],
  },
  {
    id: "go-06",
    category: "go-fundamentals",
    difficulty: "medium",
    promptFa: "interface در Go چگونه پیاده‌سازی می‌شود (iface/eface) و empty interface چه معنایی دارد؟",
    rubricFa: "dynamic type + value، type assertion، و هزینهٔ type switch.",
    expectedPoints: ["type assertion", "interface"],
  },
  {
    id: "conc-01",
    category: "concurrency",
    difficulty: "medium",
    promptFa: "تفاوت buffered و unbuffered channel چیست و هر کدام چه happens-before ایجاد می‌کنند؟",
    rubricFa: "sync در unbuffered، ظرفیت بافر، و deadlockهای رایج.",
    expectedPoints: ["buffered", "unbuffered", "happens-before"],
  },
  {
    id: "conc-02",
    category: "concurrency",
    difficulty: "hard",
    promptFa: "الگوی worker pool در Go را توضیح دهید و چرا context برای لغو کاربردی است.",
    rubricFa: "goroutine workers، job channel، ctx.Done و graceful shutdown.",
    expectedPoints: ["worker pool", "context", "cancel"],
  },
  {
    id: "conc-03",
    category: "concurrency",
    difficulty: "medium",
    promptFa: "چه زمانی Mutex بهتر از channel است؟",
    rubricFa: "محافظت state مشترک کوچک vs orchestration؛ قانون «share memory by communicating».",
    expectedPoints: ["mutex", "channel", "shared state"],
  },
  {
    id: "conc-04",
    category: "concurrency",
    difficulty: "hard",
    promptFa: "goroutine leak چیست و چگونه در production تشخیص می‌دهید؟",
    rubricFa: "بلوک روی channel، pprof goroutine، و الگوی خروج با context.",
    expectedPoints: ["goroutine leak", "pprof", "context"],
  },
  {
    id: "conc-05",
    category: "concurrency",
    difficulty: "easy",
    promptFa: "select در Go چه کاری می‌کند و default branch چه فایده‌ای دارد؟",
    rubricFa: "multiplex روی channelها، non-blocking با default.",
    expectedPoints: ["select", "default"],
  },
  {
    id: "conc-06",
    category: "concurrency",
    difficulty: "medium",
    promptFa: "sync.WaitGroup و errgroup چه تفاوتی دارند؟",
    rubricFa: "جمع‌آوری خطا، لغو همزمان، و محدودیت WaitGroup.",
    expectedPoints: ["WaitGroup", "errgroup", "error"],
  },
  {
    id: "algo-01",
    category: "algorithms",
    difficulty: "easy",
    promptFa: "پیچیدگی زمانی جستجوی دودویی و مرتب‌سازی merge sort را بگویید.",
    rubricFa: "O(log n) و O(n log n) با توضیح کوتاه.",
    expectedPoints: ["O(log n)", "O(n log n)"],
  },
  {
    id: "algo-02",
    category: "algorithms",
    difficulty: "medium",
    promptFa: "دو pointer technique را روی یک مسئلهٔ آرایهٔ مرتب توضیح دهید.",
    rubricFa: "اشاره‌گر جلو/عقب، شرط توقف، مثال two-sum sorted.",
    expectedPoints: ["two pointers", "sorted"],
  },
  {
    id: "algo-03",
    category: "algorithms",
    difficulty: "medium",
    promptFa: "BFS و DFS چه تفاوتی دارند و هر کدام برای چه گرافی مناسب‌ترند؟",
    rubricFa: "queue vs stack/recursion، کوتاه‌ترین مسیر unweighted با BFS.",
    expectedPoints: ["BFS", "DFS", "queue"],
  },
  {
    id: "algo-04",
    category: "algorithms",
    difficulty: "hard",
    promptFa: "اصل optimal substructure در DP چیست؟ مثال کوتاه بزنید.",
    rubricFa: "تعریف، جدول/zustand، مثال fib یا knapsack.",
    expectedPoints: ["dynamic programming", "subproblem"],
  },
  {
    id: "algo-05",
    category: "algorithms",
    difficulty: "medium",
    promptFa: "hash map برای حل two-sum چه پیچیدگی‌ای می‌دهد؟",
    rubricFa: "O(n) زمان، trade-off حافظه.",
    expectedPoints: ["hash map", "O(n)"],
  },
  {
    id: "algo-06",
    category: "algorithms",
    difficulty: "easy",
    promptFa: "تفاوت stable و unstable sort چیست؟",
    rubricFa: "حفظ ترتیب عناصر برابر؛ مثال merge vs quick.",
    expectedPoints: ["stable", "unstable"],
  },
  {
    id: "db-01",
    category: "database",
    difficulty: "easy",
    promptFa: "تفاوت clustered و non-clustered index چیست؟",
    rubricFa: "ترتیب فیزیکی داده vs lookup جداگانه.",
    expectedPoints: ["clustered", "index"],
  },
  {
    id: "db-02",
    category: "database",
    difficulty: "medium",
    promptFa: "سطوح ایزولیشن ANSI و anomalyهای dirty/non-repeatable/phantom را توضیح دهید.",
    rubricFa: "READ COMMITTED، REPEATABLE READ، SERIALIZABLE و مثال هر anomaly.",
    expectedPoints: ["isolation", "phantom", "transaction"],
  },
  {
    id: "db-03",
    category: "database",
    difficulty: "medium",
    promptFa: "N+1 query problem چیست و در ORM چگونه حل می‌شود؟",
    rubricFa: "eager loading، join، batch.",
    expectedPoints: ["N+1", "eager", "join"],
  },
  {
    id: "db-04",
    category: "database",
    difficulty: "hard",
    promptFa: "استراتژی sharding در مقابل read replica چه trade-offهایی دارد؟",
    rubricFa: "نوشتن افقی، hotspot، replication lag برای read scaling.",
    expectedPoints: ["sharding", "replica", "lag"],
  },
  {
    id: "db-05",
    category: "database",
    difficulty: "medium",
    promptFa: "cache-aside pattern را برای خواندن/نوشتن توضیح دهید.",
    rubricFa: "read miss → DB → fill cache؛ invalidate/update on write.",
    expectedPoints: ["cache-aside", "invalidate"],
  },
  {
    id: "db-06",
    category: "database",
    difficulty: "easy",
    promptFa: "PRIMARY KEY و UNIQUE constraint چه تفاوتی دارند؟",
    rubricFa: "یک PK per table، NULL behavior در unique بسته به DB.",
    expectedPoints: ["primary key", "unique"],
  },
  {
    id: "sd-01",
    category: "system-design",
    difficulty: "medium",
    promptFa: "طراحی سرویس کوتاه‌کننده URL: API، ذخیره‌سازی، و redirect path را شرح دهید.",
    rubricFa: "hash/base62، DB vs cache، collision handling، analytics اختیاری.",
    expectedPoints: ["hash", "redirect", "database"],
  },
  {
    id: "sd-02",
    category: "system-design",
    difficulty: "hard",
    promptFa: "rate limiter توزیع‌شده با sliding window چگونه کار می‌کند؟",
    rubricFa: "counter per window، Redis، clock skew، burst.",
    expectedPoints: ["sliding window", "redis", "rate limit"],
  },
  {
    id: "sd-03",
    category: "system-design",
    difficulty: "medium",
    promptFa: "CAP theorem را در عمل برای یک سرویس پرداخت توضیح دهید.",
    rubricFa: "partition tolerance اجباری، انتخاب CP vs AP.",
    expectedPoints: ["CAP", "partition", "consistency"],
  },
  {
    id: "sd-04",
    category: "system-design",
    difficulty: "medium",
    promptFa: "load balancer L4 vs L7 چه تفاوتی دارد؟",
    rubricFa: "TCP vs HTTP routing، TLS termination.",
    expectedPoints: ["L4", "L7", "load balancer"],
  },
  {
    id: "sd-05",
    category: "system-design",
    difficulty: "hard",
    promptFa: "CQRS چه زمانی ارزش دارد و چه پیچیدگی‌هایی اضافه می‌کند؟",
    rubricFa: "read/write model جدا، eventual consistency، projection.",
    expectedPoints: ["CQRS", "read model", "eventual consistency"],
  },
  {
    id: "sd-06",
    category: "system-design",
    difficulty: "easy",
    promptFa: "horizontal scaling و vertical scaling را مقایسه کنید.",
    rubricFa: "افزودن نود vs سخت‌افزار قوی‌تر؛ stateless کمک می‌کند.",
    expectedPoints: ["horizontal", "vertical", "stateless"],
  },
  {
    id: "be-01",
    category: "backend",
    difficulty: "medium",
    promptFa: "اصول طراحی REST و idempotency متد PUT/POST را توضیح دهید.",
    rubricFa: "resource، status code، idempotency key برای POST پرداخت.",
    expectedPoints: ["REST", "idempotent", "PUT"],
  },
  {
    id: "be-02",
    category: "backend",
    difficulty: "medium",
    promptFa: "JWT access/refresh token flow و ریسک‌های امنیتی آن چیست؟",
    rubricFa: "expiry کوتاه access، rotation refresh، ذخیره امن.",
    expectedPoints: ["JWT", "refresh", "expiry"],
  },
  {
    id: "be-03",
    category: "backend",
    difficulty: "hard",
    promptFa: "outbox pattern برای reliable messaging چگونه پیاده می‌شود؟",
    rubricFa: "transaction + outbox table، relay، at-least-once.",
    expectedPoints: ["outbox", "transaction", "at-least-once"],
  },
  {
    id: "be-04",
    category: "backend",
    difficulty: "medium",
    promptFa: "golden signals در observability چیستند؟",
    rubricFa: "latency، traffic، errors، saturation.",
    expectedPoints: ["latency", "errors", "saturation"],
  },
  {
    id: "be-05",
    category: "backend",
    difficulty: "easy",
    promptFa: "تفاوت authentication و authorization چیست؟",
    rubricFa: "چه کسی هستید vs چه کاری مجازید.",
    expectedPoints: ["authentication", "authorization"],
  },
  {
    id: "be-06",
    category: "backend",
    difficulty: "medium",
    promptFa: "graceful shutdown در سرویس Go HTTP چگونه انجام می‌شود؟",
    rubricFa: "signal، context timeout، Server.Shutdown.",
    expectedPoints: ["Shutdown", "signal", "context"],
  },
  {
    id: "ps-01",
    category: "problem-solving",
    difficulty: "medium",
    promptFa: "p99 latency بالا ولی average نرمال است — گام‌های عیب‌یابی شما چیست؟",
    rubricFa: "histogram، tail latency، GC، dependency slow path.",
    expectedPoints: ["p99", "histogram", "tail"],
  },
  {
    id: "ps-02",
    category: "problem-solving",
    difficulty: "hard",
    promptFa: "memory leak در سرویس Go بدون افزایش واضح goroutine — چه می‌کنید؟",
    rubricFa: "pprof heap، retained slice، global cache بی‌مرز.",
    expectedPoints: ["pprof", "heap", "retain"],
  },
  {
    id: "ps-03",
    category: "problem-solving",
    difficulty: "medium",
    promptFa: "چگونه بین consistency و availability در deploy تصمیم می‌گیرید؟",
    rubricFa: "rolling deploy، feature flag، degradation plan.",
    expectedPoints: ["rolling", "degradation", "availability"],
  },
  {
    id: "ps-04",
    category: "problem-solving",
    difficulty: "easy",
    promptFa: "روش ۵ چرا (5 whys) در RCA چگونه کار می‌کند؟",
    rubricFa: "زنجیرهٔ علت تا ریشهٔ سیستمی، نه مقصر شخصی.",
    expectedPoints: ["5 whys", "root cause"],
  },
];

const bankById = new Map(INTERVIEW_QUESTION_BANK.map((q) => [q.id, q]));

export function getInterviewQuestion(id: string): InterviewQuestion | undefined {
  return bankById.get(id);
}
