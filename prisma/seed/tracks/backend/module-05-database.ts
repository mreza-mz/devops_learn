import { day, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

export const databaseDays: DaySeed[] = [
  day({
    dayNumber: 25,
    phaseSlug: "database-engineering",
    titleFa: "مدل رابطه‌ای، SQL و JOIN",
    objectiveFa: "نرمال‌سازی، انواع JOIN، aggregate و تفاوت‌های عملی PostgreSQL/MySQL را در مصاحبه توضیح دهید.",
    topicSlugs: ["db-sql"],
    lessons: [
      goLesson({
        slug: "relational-sql-core",
        topicSlug: "db-sql",
        titleFa: "Relational model و SQL پایه",
        objectiveFa: "کلید اصلی/خارجی، constraint، نرمال‌سازی تا 3NF و تفاوت DDL/DML/DCL را مسلط شوید.",
        theoryMd: `## یادگیری
- **1NF/2NF/3NF**: تکرار، وابستگی جزئی، وابستگی انتقالی
- **PK/FK/UNIQUE/CHECK**: یکپارچگی referential
- **PostgreSQL** vs **MySQL**: MVCC قوی‌تر در PG؛ InnoDB row-level lock؛ JSONB در PG

## JOINها
- **INNER**: فقط match
- **LEFT**: همهٔ سطر چپ + match راست
- **FULL OUTER**: PG دارد؛ MySQL ندارد (با UNION شبیه‌سازی)
- **CROSS**: Cartesian — خطر در production

## مصاحبه
- چرا denormalize می‌کنید؟
- تفاوت WHERE و HAVING؟
- NULL در مقایسه چه رفتاری دارد؟`,
        practicalMd: `سه جدول users، orders، order_items طراحی کنید و یک گزارش فروش با JOIN و GROUP BY بنویسید.`,
        exampleMd: `\`\`\`sql
SELECT u.id, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
GROUP BY u.id
HAVING COUNT(o.id) > 0;
\`\`\``,
      }),
      goLesson({
        slug: "postgres-mysql-ops",
        topicSlug: "db-sql",
        titleFa: "PostgreSQL و MySQL در production",
        objectiveFa: "نوع داده، collation، connection و محدودیت‌های مهاجرتی را بدانید.",
        theoryMd: `## انتخاب
- **OLTP**: PG برای consistency پیچیده؛ MySQL برای ساده و اکوسیستم وسیع
- **Extensions**: pg_stat_statements، logical replication در PG

## اشتباهات
- SELECT * در API hot path
- FK بدون index روی ستون reference
- استفاده از FLOAT برای پول`,
        practicalMd: `برای schema پرداخت تصمیم بگیرید DECIMAL کجا و چرا استفاده می‌شود.`,
        exampleMd: `\`\`\`sql
CREATE TABLE ledger_entries (
  id BIGSERIAL PRIMARY KEY,
  amount NUMERIC(19,4) NOT NULL CHECK (amount <> 0)
);
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی schema پرداخت",
        topicSlug: "db-sql",
        lessonSlug: "relational-sql-core",
        path: "/tmp/db-day25-payment-schema.txt",
        mustContain: "NUMERIC",
        instructionsMd: `جدول‌های accounts، transactions و idempotency_keys را با FK و نوع مناسب پول (NUMERIC/DECIMAL) توصیف کنید. کلمهٔ NUMERIC را در فایل بیاورید.`,
      }),
      noteExercise({
        titleFa: "تحلیل JOIN گزارش",
        topicSlug: "db-sql",
        lessonSlug: "relational-sql-core",
        path: "/tmp/db-day25-join.txt",
        mustContain: "LEFT JOIN",
        instructionsMd: `سناریو: کاربرانی که سفارش پرداخت‌شده ندارند. کوئری یا توضیح JOIN را بنویسید و عبارت LEFT JOIN را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "گزارش مالی اعداد غلط",
      path: "/tmp/db-day25-scenario.txt",
      mustContain: "FLOAT",
      incidentMd: "پس از مهاجرت، جمع تراکنش‌ها ۰.۰۱ دلار اختلاف با حسابداری دارد.",
      symptomsMd: "فقط مجموع‌های بزرگ؛ تک‌تراکنش‌ها درست به نظر می‌رسند.",
      rootCause: "استفاده از FLOAT برای amount به‌جای NUMERIC",
    }),
    exam: {
      titleFa: "آزمون روز ۲۵ — SQL",
      questions: [
        mc(
          "کدام JOIN کاربران بدون سفارش را هم برمی‌گرداند؟",
          ["INNER JOIN orders", "LEFT JOIN orders", "CROSS JOIN", "ONLY INNER"],
          "LEFT JOIN orders",
          "LEFT همهٔ users را نگه می‌دارد.",
          "db-sql",
        ),
        tf("در SQL، NULL = NULL نتیجهٔ TRUE می‌دهد.", false, "NULL comparisons unknown هستند؛ از IS NULL استفاده کنید.", "db-sql"),
        sa("کلید اصلی composite چیست؟", "PRIMARY KEY چند ستون", "ترکیب چند ستون به‌عنوان PK.", "db-sql"),
        mc(
          "برای مبالغ پول در OLTP چه تایپی ترجیح است؟",
          ["FLOAT", "DOUBLE", "NUMERIC/DECIMAL", "TEXT"],
          "NUMERIC/DECIMAL",
          "دقت ثابت برای پول ضروری است.",
          "db-sql",
        ),
      ],
    },
  }),

  day({
    dayNumber: 26,
    phaseSlug: "database-engineering",
    titleFa: "ایندکس، B-Tree و بهینه‌سازی کوئری",
    objectiveFa: "EXPLAIN، selective index، covering index و anti-patternهای N+1 را تحلیل کنید.",
    topicSlugs: ["db-indexes"],
    lessons: [
      goLesson({
        slug: "indexes-btree",
        topicSlug: "db-indexes",
        titleFa: "B-Tree و انواع ایندکس",
        objectiveFa: "چه زمانی index می‌سازید و چه زمین write amplification ایجاد می‌کند.",
        theoryMd: `## B-Tree (پیش‌فرض PG/MySQL InnoDB)
- equality و range روی ستون‌های چپ composite index
- **Covering index**: INCLUDE / index-only scan
- **Partial index**: WHERE شرطی

## هزینه
- INSERT/UPDATE/DELETE کندتر؛ فضا
- ایندکس بی‌استفاده → pg_stat_user_indexes

## EXPLAIN
- **seq scan** vs **index scan** vs **bitmap**
- **rows estimate** vs actual (ANALYZE مهم است)`,
        practicalMd: `روی کوئری کند EXPLAIN (ANALYZE, BUFFERS) بخوانید و bottleneck را یادداشت کنید.`,
        exampleMd: `\`\`\`sql
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "رفع کوئری کند",
        topicSlug: "db-indexes",
        lessonSlug: "indexes-btree",
        path: "/tmp/db-day26-slow-sql.txt",
        mustContain: "index",
        instructionsMd: `کوئری: فیلتر status + sort created_at روی جدول میلیونی. ایندکس پیشنهادی و دلیل را بنویسید؛ واژهٔ index را بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "CPU دیتابیس ۱۰۰٪ بعد از deploy",
      path: "/tmp/db-day26-scenario.txt",
      mustContain: "seq scan",
      incidentMd: "سرویس لیست سفارشات timeout می‌دهد؛ CPU PostgreSQL saturated است.",
      symptomsMd: "pg_stat_statements نشان می‌دهد یک SELECT پرتکرار است.",
      rootCause: "حذف تصادفی composite index و fallback به seq scan",
    }),
    exam: {
      titleFa: "آزمون روز ۲۶ — Indexes",
      questions: [
        mc(
          "ترتیب ستون در composite index (a,b) برای WHERE a=? AND b>? چه اهمیتی دارد؟",
          ["بی‌اهمیت", "a باید برای equality جلو باشد", "فقط b مهم است", "INDEX معکوس لازم است"],
          "a باید برای equality جلو باشد",
          "قانون leftmost prefix.",
          "db-indexes",
        ),
        tf("هر FK خودکار index می‌گیرد.", false, "در بسیاری DBها باید دستی index بزنید.", "db-indexes"),
        sa("دستور PG برای plan واقعی با timing؟", "EXPLAIN ANALYZE", "اجرا و اندازه‌گیری واقعی.", "db-indexes"),
        mc(
          "N+1 در ORM معمولاً چگونه حل می‌شود؟",
          ["DELETE CASCADE", "Eager loading / JOIN batch", "DROP INDEX", "VARCHAR بزرگ‌تر"],
          "Eager loading / JOIN batch",
          "یک کوئری به‌جای N کوئری.",
          "db-indexes",
        ),
      ],
    },
  }),

  day({
    dayNumber: 27,
    phaseSlug: "database-engineering",
    titleFa: "تراکنش، ACID و ایزولاسیون",
    objectiveFa: "سطوح isolation، deadlock، MVCC و locking را برای سناریوهای پرداخت توضیح دهید.",
    topicSlugs: ["db-tx"],
    lessons: [
      goLesson({
        slug: "acid-isolation",
        topicSlug: "db-tx",
        titleFa: "ACID و isolation levels",
        objectiveFa: "Dirty read، phantom، repeatable read و Serializable را با مثال بگویید.",
        theoryMd: `## ACID
- **Atomicity**: all or nothing
- **Consistency**: constraintها
- **Isolation**: concurrency illusion
- **Durability**: WAL/commit

## سطوح (ANSI)
- **RU**: dirty read (نادر در PG)
- **RC**: default PG/Oracle
- **RR**: default InnoDB — snapshot
- **Serializable**: highest — ممکن است serialization failure

## MVCC (PostgreSQL)
هر transaction snapshot می‌بیند؛ UPDATE row version جدید؛ VACUUM dead tuple

## Deadlock
چرخهٔ lock → DB یکی را kill می‌کند؛ retry با backoff`,
        practicalMd: `تراکنش انتقال موجودی با SELECT FOR UPDATE و ترتیب ثابت lock روی account_id طراحی کنید.`,
        exampleMd: `\`\`\`sql
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
\`\`\``,
      }),
      goLesson({
        slug: "locking-deadlock",
        topicSlug: "db-tx",
        titleFa: "Locking و deadlock",
        objectiveFa: "row vs table lock، advisory lock و پیشگیری deadlock.",
        theoryMd: `## پیشگیری
- ترتیب یکسان گرفتن lock روی منابع
- کوتاه نگه داشتن transaction
- optimistic locking (version column)

## مصاحبه
- تفاوت FOR UPDATE و FOR SHARE؟
- optimistic vs pessimistic؟`,
        practicalMd: `دو تراکنش متقابل که deadlock می‌سازند را روی کاغذ رسم و fix کنید.`,
        exampleMd: `همیشه account با id کوچک‌تر اول lock شود.`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی تراکنش انتقال",
        topicSlug: "db-tx",
        lessonSlug: "acid-isolation",
        path: "/tmp/db-day27-tx-transfer.txt",
        mustContain: "FOR UPDATE",
        instructionsMd: `مراحل atomic transfer با جلوگیری از double-spend را بنویسید؛ عبارت FOR UPDATE را ذکر کنید.`,
      }),
      noteExercise({
        titleFa: "تحلیل deadlock",
        topicSlug: "db-tx",
        lessonSlug: "locking-deadlock",
        path: "/tmp/db-day27-deadlock.txt",
        mustContain: "deadlock",
        instructionsMd: `دو session که روی rowهای A و B به ترتیب مخالف lock می‌گیرند را شرح دهید و راه‌حل؛ کلمه deadlock را بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "موجودی منفی در peak",
      path: "/tmp/db-day27-scenario.txt",
      mustContain: "isolation",
      incidentMd: "دو خرید همزمان از یک موجودی کم باعث oversell شده.",
      symptomsMd: "هیچ error در لاگ اپ نیست؛ فقط دادهٔ غلط.",
      rootCause: "Read Committed بدون lock/version روی decrement موجودی",
    }),
    exam: {
      titleFa: "آزمون روز ۲۷ — Transactions",
      questions: [
        mc(
          "PostgreSQL isolation پیش‌فرض؟",
          ["SERIALIZABLE", "REPEATABLE READ", "READ COMMITTED", "READ UNCOMMITTED"],
          "READ COMMITTED",
          "Default در PG RC است.",
          "db-tx",
        ),
        tf("MVCC در PG خواننده‌ها را با writer بلاک نمی‌کند (معمولاً).", true, "Readers از snapshot استفاده می‌کنند.", "db-tx"),
        sa("ستون optimistic locking معمولاً چه نام دارد؟", "version", "یا updated_at / etag برای compare-and-swap.", "db-tx"),
        mc(
          "بهترین اولین اقدام برای deadlock گزارش‌شده؟",
          ["kill database", "retry با backoff و ترتیب lock ثابت", "RU", "حذف FK"],
          "retry با backoff و ترتیب lock ثابت",
          "applicaton باید idempotent retry داشته باشد.",
          "db-tx",
        ),
      ],
    },
  }),

  day({
    dayNumber: 28,
    phaseSlug: "database-engineering",
    titleFa: "Connection pool، replication و sharding",
    objectiveFa: "PgBouncer، read replica lag، partitioning و sharding trade-off را بیان کنید.",
    topicSlugs: ["db-sql", "db-tx"],
    lessons: [
      goLesson({
        slug: "pooling-replication",
        topicSlug: "db-sql",
        titleFa: "Pooling و replication",
        objectiveFa: "چرا connection pool ضروری است و eventual consistency replica چه معنایی دارد.",
        theoryMd: `## Connection pooling
- هر connection حافظه در PG/MySQL می‌خورد
- **PgBouncer**: transaction/session pooling
- **pool size** ≈ (cores * 2) + spindle — نه «هر goroutine یک conn»

## Replication
- **Streaming physical**: hot standby
- **Logical**: انتخاب جدول، upgrade
- **Lag**: replication lag → stale read

## Partitioning
- Range/list/hash — prune partition در query plan
- **Sharding**: اپ routing؛ cross-shard JOIN سخت`,
        practicalMd: `تصمیم بگیرید کدام queryها به replica می‌روند و چه staleness قابل قبول است.`,
        exampleMd: `Dashboard تحلیلی → replica؛ پرداخت → primary همیشه.`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "سایز pool و replica routing",
        topicSlug: "db-sql",
        lessonSlug: "pooling-replication",
        path: "/tmp/db-day28-pool-replica.txt",
        mustContain: "PgBouncer",
        instructionsMd: `برای سرویس Go با ۵۰۰ RPS و PG، pool و replica strategy را بنویسید؛ نام PgBouncer را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "خواندن stale پس از خرید",
      path: "/tmp/db-day28-scenario.txt",
      mustContain: "replication lag",
      incidentMd: "کاربر پس از پرداخت، سفارش را در اپ نمی‌بیند تا ۳۰ ثانیه.",
      symptomsMd: "روی primary داده هست؛ API read از replica.",
      rootCause: "read-after-write بدون routing به primary یا session stickiness",
    }),
    exam: {
      titleFa: "آزمون روز ۲۸ — Scale DB",
      questions: [
        mc(
          "Sharding بیشترین هزینه را در کجا ایجاد می‌کند؟",
          ["PRIMARY KEY", "cross-shard transactions/joins", "BACKUP", "INDEX"],
          "cross-shard transactions/joins",
          "توزیع داده پیچیدگی اپ را بالا می‌برد.",
          "db-sql",
        ),
        tf("PgBouncer می‌تواند تعداد connectionهای واقعی به DB را کاهش دهد.", true, "Multiplex روی pool.", "db-sql"),
        sa("partition pruning چیست؟", "حذف پارتیشن‌های irrelevant از plan", "فقط پارتیشن‌های لازم scan می‌شوند.", "db-sql"),
        mc(
          "کدام workload برای replica مناسب‌تر است؟",
          ["transfer پول", "گزارش ۹۰ روزه", "idempotency check", "FOR UPDATE"],
          "گزارش ۹۰ روزه",
          "تحلیل read-heavy و lag قابل تحمل.",
          "db-sql",
        ),
      ],
    },
  }),

  day({
    dayNumber: 29,
    phaseSlug: "database-engineering",
    titleFa: "Redis و استراتژی کش",
    objectiveFa: "cache-aside، TTL، invalidation و thundering herd را طراحی کنید.",
    topicSlugs: ["db-cache"],
    lessons: [
      goLesson({
        slug: "redis-caching",
        topicSlug: "db-cache",
        titleFa: "Redis و الگوهای cache",
        objectiveFa: "cache-aside، write-through، write-behind و key design.",
        theoryMd: `## الگوها
- **Cache-aside**: app read miss → DB → set cache
- **Write-through**: write به cache و DB همزمان
- **TTL**: stale bounded؛ **negative cache** برای miss

## Invalidation
- Event-driven (pub/sub، message)
- Version در key: \`product:{id}:v{ver}\`
- **Thundering herd**: singleflight / lock / probabilistic early refresh

## Redis structures
- String، Hash (object)، ZSET (leaderboard)
- **Redis Cluster** برای shard افقی`,
        practicalMd: `برای پروفایل کاربر cache-aside با TTL و invalidation روی update بنویسید.`,
        exampleMd: `\`\`\`text
GET user:42 → miss → SELECT → SETEX user:42 300 {...}
On UPDATE users SET ... → DEL user:42
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "استراتژی کش کاتالوگ",
        topicSlug: "db-cache",
        lessonSlug: "redis-caching",
        path: "/tmp/db-day29-cache-strategy.txt",
        mustContain: "TTL",
        instructionsMd: `محصول پررفت‌وآمد: TTL، invalidation روی قیمت، و جلوگیری از herd را شرح دهید؛ TTL را ذکر کنید.`,
      }),
      noteExercise({
        titleFa: "تراکنش + کش همزمان",
        topicSlug: "db-cache",
        lessonSlug: "redis-caching",
        path: "/tmp/db-day29-tx-cache.txt",
        mustContain: "cache-aside",
        instructionsMd: `پس از commit تراکنش، چه زمانی cache را پاک می‌کنید؟ الگوی cache-aside را نام ببرید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "انفجار ترافیک پس از cache flush",
      path: "/tmp/db-day29-scenario.txt",
      mustContain: "thundering",
      incidentMd: "Redis restart شد؛ DB زیر بار ۱۰۰x رفت و down شد.",
      symptomsMd: "همه keyها miss؛ هزاران کوئری یکسان.",
      rootCause: "بدون singleflight/TTL jitter؛ thundering herd",
    }),
    exam: {
      titleFa: "آزمون روز ۲۹ — Cache",
      questions: [
        mc(
          "cache-aside: چه کسی cache را on miss پر می‌کند؟",
          ["فقط DB", "اپلیکیشن", "Redis خودکار", "DNS"],
          "اپلیکیشن",
          "اپ بعد از read از DB می‌نویسد.",
          "db-cache",
        ),
        tf("Redis persistence همیشه جایگزین DB اصلی است.", false, "کش ephemeral است؛ source of truth DB.", "db-cache"),
        sa("برای جلوگیری از herd روی hot key چه الگویی؟", "singleflight", "یا lock / request coalescing.", "db-cache"),
        mc(
          "بهترین invalidation برای user profile پس از update؟",
          ["هیچ", "DEL key مربوطه", "افزایش TTL بی‌نهایت", "FLUSHALL"],
          "DEL key مربوطه",
          "هدفمند و سریع.",
          "db-cache",
        ),
        tf("Negative caching می‌تواند DB را از repeated miss نجات دهد.", true, "Miss معتبر را کوتاه cache کنید.", "db-cache"),
      ],
    },
  }),
];
