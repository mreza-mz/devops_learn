import { day, goLab, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

/**
 * Module 1 — Go fundamentals.
 * Order: everyday language → design with types → errors → generics & tooling →
 * testing → memory & GC → runtime → capstone. Concurrency (and the memory
 * model) comes in Module 2, once the learner can write and test Go.
 */
export const goFundamentalsDays: DaySeed[] = [
  day({
    dayNumber: 1,
    phaseSlug: "go-fundamentals",
    titleFa: "تایپ‌ها، slice و map — جایی که باگ‌های واقعی شروع می‌شوند",
    objectiveFa: "zero value، slice header و aliasing و رفتار map را طوری توضیح دهید که مصاحبه‌گر Senior قانع شود.",
    topicSlugs: ["go-types", "go-collections"],
    lessons: [
      goLesson({
        slug: "types-constants",
        topicSlug: "go-types",
        titleFa: "تایپ‌ها، zero value و ثابت‌ها",
        objectiveFa: "بدانید چرا zero value در Go یک ابزار طراحی است، نه فقط مقدار پیش‌فرض.",
        theoryMd: `## چرا مهم است
در کد production بیشتر panicها و باگ‌های «عجیب» از فرض اشتباه دربارهٔ مقدار اولیه می‌آیند: map که \`nil\` است، pointer که مقدار نگرفته، یا struct کپی‌شده.

## مفهوم
- هر تایپ **zero value** دارد: \`0\`، \`""\`، \`false\`، و \`nil\` برای pointer، slice، map، channel، func و interface.
- طراحی خوب در Go یعنی **zero value قابل استفاده** باشد: \`var mu sync.Mutex\` و \`var buf bytes.Buffer\` بدون constructor کار می‌کنند.
- \`new(T)\` حافظهٔ صفرشده می‌دهد و \`*T\` برمی‌گرداند؛ \`make\` فقط برای slice، map و channel است و ساختار داخلی را مقداردهی می‌کند.
- ثابت‌های untyped دقت بالا دارند و تا لحظهٔ استفاده تایپ نمی‌گیرند؛ تبدیل تایپ همیشه صریح است.
- \`:=\` فقط داخل تابع است و حداقل یک متغیر جدید لازم دارد. مراقب **shadowing** باشید: \`err :=\` داخل یک بلوک، \`err\` بیرونی را پنهان می‌کند.

## اشتباهات رایج
- نوشتن در \`nil\` map ← panic. خواندن از nil map مجاز است و zero value برمی‌گرداند.
- \`json.Unmarshal\` در struct با فیلد map که مقداردهی نشده؛ بعد کد دیگری روی آن می‌نویسد.
- shadow شدن \`err\` در \`if\` و برگرداندن \`err\` بیرونی که \`nil\` است.

## سؤال مصاحبه
**«چرا \`var m map[string]int; m["a"]=1\` panic می‌کند ولی \`var s []int; s = append(s, 1)\` نه؟»**
پاسخ کوتاه: map یک pointer به hash table است و nil map هیچ table ندارد که در آن بنویسیم. \`append\` روی nil slice خودش آرایهٔ جدید allocate می‌کند و slice جدید برمی‌گرداند.`,
        practicalMd: `در یک فایل Go برای int، string، pointer، slice، map و یک struct مقدار zero را چاپ کنید (\`fmt.Printf("%#v")\`) و پیش‌بینی خود را قبل از اجرا بنویسید.`,
        exampleMd: `~~~go
type Config struct {
	Timeout time.Duration
	Labels  map[string]string // nil تا وقتی make نشود
}

func (c *Config) SetLabel(k, v string) {
	if c.Labels == nil { // zero value را امن کنید
		c.Labels = make(map[string]string)
	}
	c.Labels[k] = v
}
~~~`,
      }),
      goLesson({
        slug: "slices-maps",
        topicSlug: "go-collections",
        titleFa: "Slice header، aliasing و map",
        objectiveFa: "پیش‌بینی کنید append کی آرایهٔ زیرین را به اشتراک می‌گذارد و کی کپی می‌کند.",
        theoryMd: `## چرا مهم است
یکی از رایج‌ترین باگ‌های Go در production: دو slice که فکر می‌کنید مستقل‌اند ولی روی **یک آرایه** می‌نویسند. سؤال مصاحبه‌ای کلاسیک هم هست.

## مفهوم
Slice یک struct سه‌فیلدی است: **pointer** به آرایه، **len** و **cap**. پاس دادن slice یعنی کپی همین header؛ آرایه کپی نمی‌شود.

- اگر \`len < cap\` باشد، \`append\` در همان آرایه می‌نویسد و header جدید برمی‌گرداند ← **aliasing**.
- اگر جا نباشد، آرایهٔ بزرگ‌تر allocate می‌شود (رشد حدوداً ۲ برابر برای sliceهای کوچک) و ارتباط با قبلی قطع می‌شود.
- \`s[low:high:max]\` (full slice expression) cap را محدود می‌کند تا append بعدی مجبور به کپی شود.
- **حافظهٔ نگه‌داشته‌شده:** \`small := huge[:10]\` کل آرایهٔ \`huge\` را زنده نگه می‌دارد. برای نگه داشتن بخش کوچکی از یک buffer بزرگ، کپی کنید (\`bytes.Clone\`، \`slices.Clone\` یا \`copy\`).

### Map
- ترتیب iteration عمداً تصادفی است؛ به آن تکیه نکنید.
- خواندن و نوشتن هم‌زمان بدون sync یعنی \`fatal error: concurrent map writes\`؛ این خطا با \`recover\` هم گرفته نمی‌شود.
- map هیچ‌وقت کوچک نمی‌شود: delete کردن میلیون‌ها کلید حافظهٔ bucketها را آزاد نمی‌کند. برای cacheهای بزرگ گاهی باید map را از نو ساخت.
- از Go 1.24 پیاده‌سازی داخلی map به Swiss Table تغییر کرد؛ رفتار قابل مشاهده همان است.

## اشتباهات رایج
- برگرداندن \`append(input, x)\` از تابعی که caller انتظار slice جدید دارد.
- نگه داشتن \`buf[:n]\` از buffer یک request در cache.
- گرفتن آدرس عنصر slice (\`&s[i]\`) و بعد append کردن؛ pointer ممکن است به آرایهٔ قدیمی اشاره کند.

## سؤال مصاحبه
**«خروجی این کد چیست؟»**
~~~go
a := make([]int, 3, 10)
b := append(a, 1)
c := append(a, 2)
fmt.Println(b[3], c[3])
~~~
پاسخ: \`2 2\`. هر دو append در همان آرایه (cap=10) و در خانهٔ ۳ نوشتند و دومی اولی را overwrite کرد.`,
        practicalMd: `قبل از لب، کد سؤال مصاحبه را اجرا کنید، بعد \`a := make([]int, 3, 3)\` را امتحان کنید و تفاوت را با \`len\`/\`cap\` توضیح دهید.`,
        exampleMd: `~~~go
// کپی امن با یک allocation
out := make([]T, len(base), len(base)+1)
copy(out, base)
out = append(out, x)

// یا محدود کردن cap تا append مجبور به کپی شود
safe := base[:len(base):len(base)]
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "slice-aliasing",
        titleFa: "لب: باگ aliasing و حافظهٔ نگه‌داشته‌شده",
        topicSlug: "go-collections",
        lessonSlug: "slices-maps",
        instructionsMd: `دو تابع \`WithSuffix\` و \`Head\` در یک سرویس واقعی باگ دارند:
- \`WithSuffix\` گاهی نتیجهٔ قبلی را خراب می‌کند.
- \`Head\` باعث می‌شود bufferهای یک مگابایتی هیچ‌وقت آزاد نشوند.

اول تست‌ها را اجرا کنید و پیام خطا را بخوانید، بعد هر دو را درست کنید.`,
        hints: [
          "تست اول یک slice با len=2 و cap=10 می‌سازد. وقتی cap > len است، append کجا می‌نویسد؟",
          "نتیجه باید آرایهٔ مخصوص خودش را داشته باشد: make با اندازهٔ دقیق + copy.",
          "WithSuffix: out := make([]string, len(base), len(base)+1); copy(out, base); return append(out, s). در Head هم یک slice جدید به طول n بسازید و copy کنید.",
        ],
        difficulty: "easy",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Panic روی map در production",
      path: "/tmp/go-day1-scenario.txt",
      mustContain: "nil map",
      incidentMd: "سرویس config گاهی با این پیام panic می‌کند: assignment to entry in nil map.",
      symptomsMd: "فقط برای tenantهایی رخ می‌دهد که در فایل YAML بخش labels ندارند.",
      rootCause: "struct از YAML پر می‌شود و فیلد map وقتی کلید وجود ندارد nil می‌ماند؛ کد بعدی بدون make روی آن می‌نویسد",
    }),
    exam: {
      titleFa: "آزمون — تایپ و مجموعه‌ها",
      questions: [
        tf("نوشتن روی nil map باعث panic می‌شود ولی خواندن از آن مجاز است.", true, "خواندن zero value برمی‌گرداند؛ نوشتن به table نیاز دارد.", "go-collections"),
        mc(
          "a := make([]int, 3, 10); b := append(a, 1); c := append(a, 2). مقدار b[3] چیست؟",
          ["1", "2", "0", "panic"],
          "2",
          "هر دو append در همان آرایهٔ زیرین نوشتند و c مقدار b را overwrite کرد.",
          "go-collections",
        ),
        mc(
          "چرا small := huge[:10] می‌تواند memory leak بسازد؟",
          ["چون slice کپی عمیق می‌شود", "چون کل آرایهٔ huge زنده می‌ماند", "چون GC sliceها را جمع نمی‌کند", "چون cap صفر می‌شود"],
          "چون کل آرایهٔ huge زنده می‌ماند",
          "slice به آرایهٔ زیرین pointer دارد؛ تا وقتی small زنده است کل آرایه هم زنده است.",
          "go-collections",
        ),
        sa("سه فیلد header اسلایس را نام ببرید.", "pointer len cap", "pointer به آرایه، len و cap.", "go-collections"),
        tf("ترتیب iteration روی map در Go ثابت و قابل اتکاست.", false, "عمداً تصادفی است.", "go-collections"),
      ],
    },
  }),

  day({
    dayNumber: 2,
    phaseSlug: "go-fundamentals",
    titleFa: "Pointer، Struct و Method",
    objectiveFa: "انتخاب value یا pointer receiver را با دلیل (mutate، اندازه، method set، کپی‌ناپذیری) توضیح دهید.",
    topicSlugs: ["go-pointers", "go-structs"],
    lessons: [
      goLesson({
        slug: "pointers",
        topicSlug: "go-pointers",
        titleFa: "Pointerها در Go",
        objectiveFa: "بدانید Go همیشه pass-by-value است و pointer دقیقاً چه چیزی را عوض می‌کند.",
        theoryMd: `## چرا مهم است
«Go pass-by-reference دارد؟» سؤال غربالگری رایجی است و جواب غلط به آن زود رد می‌شود.

## مفهوم
- Go **همیشه pass-by-value** است. وقتی pointer پاس می‌دهید، خود آدرس کپی می‌شود.
- slice، map و channel هم مقدارند، ولی مقدارشان شامل pointer داخلی است. برای همین تغییر عناصر دیده می‌شود ولی \`append\` یا انتساب دوباره دیده نمی‌شود.
- Pointer arithmetic وجود ندارد (جز با \`unsafe\`). این ایمنی حافظه و کار GC را ساده می‌کند.
- Pointer برای سه هدف: **تغییر مقدار**، **اجتناب از کپی structهای بزرگ** و **نشان دادن «مقدار ندارد»** (\`*int\` در PATCH یا JSON).
- Pointer رایگان نیست: اغلب باعث escape به heap و فشار GC می‌شود (روز «حافظه و GC»).

## اشتباهات رایج
- برگرداندن pointer به عنصر slice و بعد append (آدرس کهنه).
- \`*int\` برای فیلدهای optional همه‌جا؛ هر کدام nil check لازم دارد و خوانایی را کم می‌کند.

## سؤال مصاحبه
**«اگر map را به تابع بدهید و تابع کلیدی اضافه کند، caller آن را می‌بیند؟ برای slice چطور؟»**
پاسخ: برای map بله، چون مقدار map به hash table مشترک اشاره می‌کند. برای slice تغییر \`s[i]\` دیده می‌شود ولی \`append\` نه، مگر slice برگردانده شود، چون header (len) کپی شده است.`,
        practicalMd: `تابعی بنویسید که یک slice می‌گیرد، \`s[0]\` را عوض و یک عنصر append می‌کند. در caller نتیجه را چاپ کنید و توضیح دهید چرا append دیده نمی‌شود.`,
        exampleMd: `~~~go
type UpdateUser struct {
	Name  *string \`json:"name"\` // nil = فیلد ارسال نشده
	Email *string \`json:"email"\`
}
~~~`,
      }),
      goLesson({
        slug: "structs-methods",
        topicSlug: "go-structs",
        titleFa: "Struct، method و انتخاب receiver",
        objectiveFa: "قانون انتخاب receiver و تأثیر آن روی method set و interface را بدانید.",
        theoryMd: `## قاعدهٔ انتخاب receiver
1. method باید struct را تغییر دهد ← **pointer receiver**
2. struct فیلدی دارد که نباید کپی شود (\`sync.Mutex\`، \`bytes.Buffer\`) ← **pointer receiver**
3. struct بزرگ است ← pointer receiver
4. تایپ کوچک و immutable است (\`time.Time\`، \`Point\`) ← value receiver
5. **یکدست بودن:** اگر یک method pointer receiver دارد، بقیه هم بهتر است داشته باشند.

## Method set (سؤال پرتکرار)
- method set تایپ \`T\` فقط methodهای value receiver را دارد.
- method set تایپ \`*T\` هر دو نوع را دارد.
- پس اگر \`Save\` روی \`*User\` تعریف شده باشد، \`User\` (مقدار) آن interface را **satisfy نمی‌کند**.

## Struct layout (سطح Senior)
فیلدها با padding چیده می‌شوند. \`struct{a bool; b int64; c bool}\` روی ۶۴ بیت ۲۴ بایت است ولی با مرتب‌سازی \`{b int64; a, c bool}\` ۱۶ بایت می‌شود. در sliceهای میلیونی این تفاوت محسوس است (\`unsafe.Sizeof\`، linter \`fieldalignment\`).

## اشتباهات رایج
- setter با value receiver که روی کپی کار می‌کند و هیچ اثری ندارد.
- کپی کردن struct دارای \`sync.Mutex\` (\`go vet\` با بررسی copylocks می‌گیرد).

## سؤال مصاحبه
**«چرا \`var _ Saver = User{}\` کامپایل نمی‌شود ولی \`var _ Saver = &User{}\` می‌شود؟»**
پاسخ: \`Save\` pointer receiver دارد و در method set تایپ \`User\` نیست.`,
        practicalMd: `\`unsafe.Sizeof\` را برای دو چیدمان مختلف یک struct با فیلدهای bool، int64 و int32 مقایسه کنید.`,
        exampleMd: `~~~go
type Counter struct {
	mu sync.Mutex
	n  int
}

func (c *Counter) Inc()       { c.mu.Lock(); c.n++; c.mu.Unlock() }
func (c *Counter) Value() int { c.mu.Lock(); defer c.mu.Unlock(); return c.n }
// Value هم pointer receiver دارد: Counter حاوی Mutex است و نباید کپی شود.
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی HTTP client قابل استفادهٔ مجدد",
        topicSlug: "go-structs",
        lessonSlug: "structs-methods",
        path: "/tmp/go-day2-client.txt",
        mustContain: "http.Client",
        instructionsMd: `اسکلت یک struct به نام \`PaymentClient\` با base URL، timeout و یک \`*http.Client\` اختصاصی بنویسید. برای هر method توضیح دهید چرا pointer یا value receiver انتخاب کردید و چرا از \`http.DefaultClient\` استفاده نمی‌کنید.`,
        answerOutlineFa:
          "struct با فیلدهای baseURL و httpClient *http.Client که در constructor با Timeout ساخته می‌شود؛ همهٔ methodها pointer receiver دارند (یکدستی و جلوگیری از کپی)؛ DefaultClient هیچ timeoutی ندارد و بین همهٔ پکیج‌ها مشترک است.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "باگ تغییر نکردن تنظیمات",
      path: "/tmp/go-day2-scenario.txt",
      mustContain: "value receiver",
      incidentMd: "method SetTimeout روی Config صدا زده می‌شود ولی مقدار عوض نمی‌شود.",
      symptomsMd: "panic در کار نیست؛ فقط مقدار قبلی می‌ماند.",
      rootCause: "method با value receiver روی کپی struct کار می‌کرد",
    }),
    exam: {
      titleFa: "آزمون — pointer و struct",
      questions: [
        tf("Go برای sliceها pass-by-reference است.", false, "همیشه pass-by-value است؛ slice header کپی می‌شود.", "go-pointers"),
        mc(
          "Save روی *User تعریف شده. کدام interface Saver را satisfy می‌کند؟",
          ["User و *User", "فقط *User", "فقط User", "هیچ‌کدام"],
          "فقط *User",
          "method set تایپ User شامل methodهای pointer receiver نیست.",
          "go-structs",
        ),
        mc(
          "کدام دلیل pointer receiver را الزامی می‌کند؟",
          ["struct فقط دو فیلد int دارد", "struct یک sync.Mutex دارد", "method فقط مقدار برمی‌گرداند", "تایپ immutable است"],
          "struct یک sync.Mutex دارد",
          "Mutex نباید کپی شود؛ value receiver هر بار کپی می‌سازد.",
          "go-structs",
        ),
        sa("کدام ابزار کپی شدن sync.Mutex را تشخیص می‌دهد؟", "go vet", "بررسی copylocks در go vet.", "go-structs"),
      ],
    },
  }),

  day({
    dayNumber: 3,
    phaseSlug: "go-fundamentals",
    titleFa: "Interface، Composition و Embedding",
    objectiveFa: "interfaceهای کوچک و مصرف‌کننده‌محور طراحی کنید و دام typed nil را بشناسید.",
    topicSlugs: ["go-interfaces", "go-embedding"],
    lessons: [
      goLesson({
        slug: "interfaces",
        topicSlug: "go-interfaces",
        titleFa: "Interface: کوچک، ضمنی، سمت مصرف‌کننده",
        objectiveFa: "اصل accept interfaces, return structs و ساختار داخلی interface را توضیح دهید.",
        theoryMd: `## چرا مهم است
Interface در Go قلب تست‌پذیری و معماری است. در code review سنیور، interfaceهای بیش از حد بزرگ یا بی‌جا اولین چیزی است که دیده می‌شود.

## مفهوم
- satisfy کردن **ضمنی** است؛ کلمهٔ \`implements\` وجود ندارد.
- **interface را سمت مصرف‌کننده تعریف کنید**، نه کنار پیاده‌سازی. پکیج \`order\` که فقط \`GetByID\` لازم دارد، interface تک‌متدی خودش را تعریف می‌کند.
- **Accept interfaces, return structs:** ورودی‌ها انعطاف‌پذیر و خروجی‌ها concrete باشند تا caller به همهٔ قابلیت‌ها دسترسی داشته باشد.
- interfaceهای کوچک ترکیب‌پذیرند: \`io.Reader\`، \`io.Writer\` و \`io.ReadWriter\`.

## Interface از داخل
مقدار interface دو word است: **(type, value)**. فقط وقتی هر دو nil باشند interface برابر \`nil\` است.

~~~go
var p *MyErr = nil
var err error = p   // (type=*MyErr, value=nil)
err != nil          // true!
~~~

این همان باگ کلاسیک **typed nil** است: تابعی که \`*MyErr\` برمی‌گرداند و نتیجه‌اش در \`error\` قرار می‌گیرد.

## Type assertion و type switch
\`v, ok := x.(T)\` شکل امن است؛ بدون \`ok\`، assertion غلط panic می‌کند.

## اشتباهات رایج
- تعریف interface با ۱۵ method فقط برای mock کردن.
- \`interface{}\` یا \`any\` در API به جای تایپ مشخص.
- برگرداندن interface از constructor بدون دلیل.

## سؤال مصاحبه
**«چرا \`if err != nil\` برای خطایی که nil است true شد؟»**
پاسخ: تابع یک \`*CustomError\` nil را در interface \`error\` برگردانده است. interface حاوی type است و nil نیست. باید صریحاً \`return nil\` نوشت.`,
        practicalMd: `یک سرویس که مستقیم \`*sql.DB\` می‌گیرد را تصور کنید. interface تک‌متدی‌ای که واقعاً لازم دارد را در پکیج مصرف‌کننده تعریف کنید.`,
        exampleMd: `~~~go
// package order — مصرف‌کننده تعریف می‌کند
type userGetter interface {
	GetByID(ctx context.Context, id int64) (user.User, error)
}

type Service struct{ users userGetter }

func NewService(u userGetter) *Service { return &Service{users: u} } // return struct
~~~`,
      }),
      goLesson({
        slug: "embedding",
        topicSlug: "go-embedding",
        titleFa: "Embedding: composition نه inheritance",
        objectiveFa: "promoted methodها و ریسک لو رفتن API با embedding را بشناسید.",
        theoryMd: `## مفهوم
Embedding فیلدها و methodهای تایپ درونی را **promote** می‌کند. این delegation است، نه inheritance: method تایپ درونی receiver خودش را دارد و از تایپ بیرونی خبر ندارد (polymorphism مجازی وجود ندارد).

## کجا خوب است
- ترکیب interfaceها: \`type ReadWriter interface { Reader; Writer }\`
- wrapper که فقط یک method را override می‌کند، مثلاً \`responseWriter\` که status را ثبت می‌کند و بقیه را از \`http.ResponseWriter\` می‌گیرد.

## کجا بد است
**embedding \`sync.Mutex\` در تایپ exported:**
~~~go
type Cache struct {
	sync.Mutex // Lock و Unlock بخشی از API عمومی Cache می‌شوند!
	m map[string]string
}
~~~
هر caller می‌تواند \`cache.Lock()\` را صدا بزند و invariantها را بشکند. فیلد نام‌دار و unexported (\`mu sync.Mutex\`) بهتر است.

## سؤال مصاحبه
**«embedding با inheritance چه فرقی دارد؟»**
پاسخ: تایپ بیرونی is-a تایپ درونی نیست. نمی‌توان \`*Outer\` را جایی پاس داد که \`*Inner\` لازم است، و method درونی methodهای بیرونی را صدا نمی‌زند. فقط promotion نام و تبدیل خودکار selector اتفاق می‌افتد.`,
        practicalMd: `یک \`statusRecorder\` بنویسید که \`http.ResponseWriter\` را embed و فقط \`WriteHeader\` را override می‌کند.`,
        exampleMd: `~~~go
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "typed-nil",
        titleFa: "لب: همهٔ درخواست‌ها رد می‌شوند (typed nil)",
        topicSlug: "go-interfaces",
        lessonSlug: "interfaces",
        instructionsMd: `بعد از یک refactor، endpoint ثبت‌نام همهٔ کاربرها را رد می‌کند، حتی کاربر معتبر. تابع \`check\` درست است. مشکل در \`Validate\` است. پیدا و اصلاحش کنید و در یک جمله توضیح دهید چرا این اتفاق می‌افتد.`,
        hints: [
          "کمک نمی‌کند داخل Validate مقدار check(u) را چاپ کنید؛ نتیجهٔ Validate را با %#v چاپ کنید.",
          "interface از دو بخش (type, value) تشکیل شده است. وقتی یک *ValidationError با مقدار nil در error قرار می‌گیرد چه می‌شود؟",
          "نتیجهٔ check را در متغیر بگیرید و اگر nil بود صریحاً return nil کنید؛ در غیر این صورت همان را برگردانید.",
        ],
        difficulty: "easy",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Lock از بیرون پکیج",
      path: "/tmp/go-day3-scenario.txt",
      mustContain: "embedding",
      incidentMd: "گاهی سرویس کاملاً freeze می‌شود. goroutine dump نشان می‌دهد همه روی Cache.Lock منتظرند.",
      symptomsMd: "یک تیم دیگر در handler خودش cache.Lock() صدا زده و در مسیر خطا Unlock نکرده است.",
      rootCause: "Cache به جای فیلد unexported، sync.Mutex را embed کرده بود و Lock/Unlock بخشی از API عمومی شده بود",
    }),
    exam: {
      titleFa: "آزمون — interface",
      questions: [
        tf("در Go باید پیاده‌سازی interface را صریحاً اعلام کرد.", false, "satisfy کردن ضمنی است.", "go-interfaces"),
        mc(
          "func f() error { var e *MyErr; return e } — مقدار f() != nil چیست؟",
          ["false", "true", "کامپایل نمی‌شود", "panic"],
          "true",
          "interface حاوی type=*MyErr است و nil نیست.",
          "go-interfaces",
        ),
        mc(
          "بهترین جای تعریف interface Repository کجاست؟",
          ["کنار پیاده‌سازی Postgres", "در پکیجی که از آن استفاده می‌کند", "در پکیج models مشترک", "در main"],
          "در پکیجی که از آن استفاده می‌کند",
          "interface سمت مصرف‌کننده کوچک می‌ماند و وابستگی را معکوس می‌کند.",
          "go-interfaces",
        ),
        tf("embed کردن sync.Mutex در تایپ exported، Lock را به API عمومی اضافه می‌کند.", true, "methodهای embedded promote می‌شوند.", "go-embedding"),
        sa("اصل رایج طراحی API در Go: accept ?, return ?", "accept interfaces return structs", "Accept interfaces, return structs", "go-interfaces"),
      ],
    },
  }),

  day({
    dayNumber: 4,
    phaseSlug: "go-fundamentals",
    titleFa: "Error handling، Defer، Panic و Recover",
    objectiveFa: "خطا را با context و قابل تشخیص wrap کنید و بدانید panic کجا مجاز است.",
    topicSlugs: ["go-errors", "go-defer-panic"],
    lessons: [
      goLesson({
        slug: "errors",
        topicSlug: "go-errors",
        titleFa: "خطاها مقدارند: wrap، Is، As",
        objectiveFa: "sentinel، تایپ خطا و wrapping را درست انتخاب کنید و خطا را به status code نگاشت دهید.",
        theoryMd: `## چرا مهم است
در سرویس واقعی خطا از repository تا handler چند لایه بالا می‌آید. اگر cause در مسیر گم شود، handler نمی‌فهمد ۴۰۴ برگرداند یا ۵۰۰، و لاگ هم نمی‌گوید کجا خراب شد.

## سه ابزار
| ابزار | کی | بررسی |
|---|---|---|
| sentinel (\`var ErrNotFound = errors.New(...)\`) | شرط ساده و بدون داده | \`errors.Is\` |
| تایپ خطا (\`*RateLimitError\`) | caller به داده نیاز دارد (RetryAfter) | \`errors.As\` |
| opaque (فقط \`error\`) | caller نباید تصمیم بگیرد | فقط لاگ |

## Wrapping
- \`fmt.Errorf("get user %d: %w", id, err)\` ← cause حفظ می‌شود و \`errors.Is/As\` زنجیره را طی می‌کنند.
- \`%v\` ← cause به رشته تبدیل می‌شود و **از دست می‌رود**.
- از Go 1.20 چند \`%w\` و \`errors.Join\` مجازند.
- پیام را با حروف کوچک و بدون نقطه بنویسید. context اضافه کنید، نه کلمهٔ «failed» در هر لایه.

## قانون طلایی
هر خطا را **یا handle کنید یا return کنید، نه هر دو.** لاگ کردن و return کردن هم‌زمان باعث می‌شود یک خطا پنج بار لاگ شود.

## مرز سیستم
خطای داخلی (\`pq: duplicate key...\`) را مستقیم به کلاینت نفرستید. در لایهٔ handler نگاشت کنید: \`ErrNotFound\` به 404، \`ErrConflict\` به 409، بقیه به 500 با request id.

## سؤال مصاحبه
**«چه زمانی sentinel و چه زمانی تایپ خطا؟»**
پاسخ: sentinel وقتی caller فقط باید شرط را تشخیص دهد. تایپ وقتی داده لازم است. هر دو بخشی از API عمومی پکیج‌اند، پس کم و آگاهانه export کنید.`,
        practicalMd: `مسیر یک خطا را از \`repo.Find\` تا \`handler\` روی کاغذ بکشید: هر لایه چه context اضافه می‌کند و کجا به status code تبدیل می‌شود؟`,
        exampleMd: `~~~go
func statusOf(err error) int {
	var rl *RateLimitError
	switch {
	case errors.Is(err, ErrNotFound):
		return http.StatusNotFound
	case errors.As(err, &rl):
		return http.StatusTooManyRequests
	default:
		return http.StatusInternalServerError
	}
}
~~~`,
      }),
      goLesson({
        slug: "defer-panic",
        topicSlug: "go-defer-panic",
        titleFa: "Defer، Panic و Recover",
        objectiveFa: "ترتیب defer، ارزیابی آرگومان‌ها و مرز درست recover را بدانید.",
        theoryMd: `## Defer
- LIFO اجرا می‌شود.
- **آرگومان‌ها همان لحظهٔ defer ارزیابی می‌شوند:** \`defer fmt.Println(i)\` مقدار فعلی i را چاپ می‌کند.
- با named result می‌توان خطا را در defer تغییر داد، مثلاً برای گرفتن خطای \`Close\` روی فایلی که در آن نوشته‌اید.
- \`defer\` داخل حلقه تا پایان تابع اجرا نمی‌شود. حلقه روی ۱۰ هزار فایل یعنی ۱۰ هزار file descriptor باز.

## Panic و Recover
- panic برای **باگ برنامه‌نویس و حالت غیرقابل ادامه** است، نه کنترل جریان عادی.
- \`recover\` فقط داخل تابع defer‌شده در **همان goroutine** کار می‌کند.
- **panic بدون recover در هر goroutine، کل process را می‌کشد.** \`net/http\` panic هر handler را recover می‌کند، ولی goroutineای که خودتان داخل handler می‌سازید محافظت نمی‌شود.
- \`fatal error\`ها (مثل concurrent map writes و کمبود حافظه) اصلاً recover نمی‌شوند.

## الگوی worker امن
~~~go
go func() {
	defer func() {
		if r := recover(); r != nil {
			log.Error("worker panic", "panic", r, "stack", string(debug.Stack()))
			errCh <- fmt.Errorf("worker panic: %v", r) // supervisor باید خبردار شود
		}
	}()
	work()
}()
~~~

## سؤال مصاحبه
**«یک goroutine که داخل handler ساخته‌اید panic کند، چه می‌شود؟»**
پاسخ: کل سرور crash می‌کند. recover درون \`net/http\` فقط goroutine خود handler را پوشش می‌دهد.`,
        practicalMd: `خروجی \`for i := 0; i < 3; i++ { defer fmt.Print(i) }\` را پیش‌بینی و بعد اجرا کنید.`,
        exampleMd: `~~~go
func writeFile(path string, data []byte) (err error) {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer func() {
		if cerr := f.Close(); cerr != nil && err == nil {
			err = cerr // خطای flush روی دیسک گم نشود
		}
	}()
	_, err = f.Write(data)
	return err
}
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "errors-wrap",
        titleFa: "لب: گم شدن ErrNotFound و نگاشت به status code",
        topicSlug: "go-errors",
        lessonSlug: "errors",
        instructionsMd: `API برای کاربری که وجود ندارد ۵۰۰ برمی‌گرداند، نه ۴۰۴.
1. \`GetUserName\` را طوری درست کنید که پیامش context داشته باشد و cause حفظ شود.
2. \`StatusCode\` را با \`errors.Is\` و \`errors.As\` پیاده کنید. مقایسهٔ رشته ممنوع است (یکی از تست‌ها همین را می‌سنجد).`,
        hints: [
          "تفاوت %v و %w در fmt.Errorf چیست؟",
          "برای تایپ خطا یک متغیر pointer بسازید: var rl *RateLimitError؛ بعد errors.As(err, &rl).",
          "در StatusCode یک switch بنویسید: nil به 200، errors.Is(err, ErrNotFound) به 404، errors.As(err, &rl) به 429، و پیش‌فرض 500.",
        ],
      }),
    ],
    scenario: noteScenario({
      titleFa: "Crash کامل سرور از یک goroutine",
      path: "/tmp/go-day4-scenario.txt",
      mustContain: "recover",
      incidentMd: "سرویس سفارش چند بار در روز restart می‌شود. لاگ: panic: runtime error: index out of range — goroutine 8123.",
      symptomsMd: "middleware recovery وجود دارد ولی کمکی نمی‌کند؛ panic داخل goroutine ارسال ایمیل است که handler آن را با go func() ساخته.",
      rootCause: "panic در goroutine فرزند بدون recover کل process را می‌کشد؛ recovery middleware فقط goroutine خود handler را پوشش می‌دهد",
    }),
    exam: {
      titleFa: "آزمون — خطا و panic",
      questions: [
        mc(
          "برای بررسی sentinel که چند لایه wrap شده کدام درست است؟",
          ["err == ErrNotFound", "errors.Is(err, ErrNotFound)", "strings.Contains(err.Error(), \"not found\")", "err.(ErrNotFound)"],
          "errors.Is(err, ErrNotFound)",
          "errors.Is زنجیرهٔ Unwrap را طی می‌کند.",
          "go-errors",
        ),
        tf("fmt.Errorf با %v زنجیرهٔ خطا را برای errors.Is حفظ می‌کند.", false, "فقط %w wrap می‌کند.", "go-errors"),
        tf("panic بدون recover در یک goroutine فرزند فقط همان goroutine را متوقف می‌کند.", false, "کل process خاتمه می‌یابد.", "go-defer-panic"),
        mc(
          "خروجی for i := 0; i < 3; i++ { defer fmt.Print(i) } چیست؟",
          ["012", "210", "333", "222"],
          "210",
          "LIFO و آرگومان هنگام defer ارزیابی می‌شود (و از Go 1.22 هر iteration متغیر خودش را دارد).",
          "go-defer-panic",
        ),
        sa("کدام دسته از خطاهای runtime حتی با recover هم گرفته نمی‌شوند؟", "fatal error", "مثلاً concurrent map writes یا out of memory.", "go-defer-panic"),
      ],
    },
  }),

  day({
    dayNumber: 5,
    phaseSlug: "go-fundamentals",
    titleFa: "Generics، Module و ابزارهای کیفیت کد",
    objectiveFa: "بدانید کجا generic بنویسید، module را درست ساختار دهید و pipeline کیفیت یک تیم Go را بچینید.",
    topicSlugs: ["go-generics", "go-packages", "go-tooling"],
    lessons: [
      goLesson({
        slug: "generics",
        topicSlug: "go-generics",
        titleFa: "Generics: کی بله، کی نه",
        objectiveFa: "constraint بنویسید و بین generic و interface درست انتخاب کنید.",
        theoryMd: `## مفهوم
از Go 1.18 تابع و تایپ می‌توانند پارامتر تایپ بگیرند: \`func Map[T, R any](in []T, f func(T) R) []R\`.

- **Constraint** خودش interface است: \`any\`، \`comparable\`، \`cmp.Ordered\` یا union مثل \`~int | ~int64\`.
- \`~int\` یعنی هر تایپی که underlying آن int است (مثلاً \`type UserID int\`).
- پکیج‌های \`slices\`، \`maps\` و \`cmp\` در stdlib را بشناسید؛ خیلی از helperهای قدیمی را جایگزین کرده‌اند.

## قاعدهٔ تصمیم
- **generic:** وقتی کد برای همهٔ تایپ‌ها دقیقاً یکی است: containerها (cache، set، heap)، helperهای slice، و pool.
- **interface:** وقتی رفتار بر اساس تایپ فرق می‌کند (\`Store\` با پیاده‌سازی Postgres و Redis).
- اگر فقط یک تایپ دارید، generic ننویسید.

## جزئیات Senior
- پیاده‌سازی Go از **GC shape stenciling** استفاده می‌کند: تایپ‌های pointer یک نسخه کد مشترک دارند و فراخوانی method روی آن‌ها از dictionary می‌گذرد. generic همیشه سریع‌تر از interface نیست. benchmark کنید.
- method نمی‌تواند پارامتر تایپ جدید داشته باشد (\`func (s *S[T]) Map[R any]\` مجاز نیست).

## سؤال مصاحبه
**«چرا \`func Max[T any](a, b T) T\` کامپایل نمی‌شود؟»**
پاسخ: \`any\` عملگر \`>\` را تضمین نمی‌کند. باید \`cmp.Ordered\` باشد.`,
        practicalMd: `یک \`Set[T comparable]\` با \`Add\`، \`Has\` و \`Len\` روی \`map[T]struct{}\` بنویسید.`,
        exampleMd: `~~~go
type Number interface{ ~int | ~int64 | ~float64 }

func Sum[T Number](xs []T) T {
	var total T
	for _, x := range xs {
		total += x
	}
	return total
}
~~~`,
      }),
      goLesson({
        slug: "packages-modules",
        topicSlug: "go-packages",
        titleFa: "Package، module و ساختار پروژه",
        objectiveFa: "internal/، نسخه‌گذاری semver، import cycle و ساختار سرویس را توضیح دهید.",
        theoryMd: `## Module
- \`go.mod\` مسیر module، نسخهٔ Go و وابستگی‌ها را دارد. \`go.sum\` hash محتوای ماژول‌هاست (امنیت supply chain).
- **Breaking change** یعنی major version جدید و مسیر \`/v2\` در import.
- **Minimal Version Selection:** Go پایین‌ترین نسخه‌ای را برمی‌دارد که همهٔ نیازها را برآورده کند، نه آخرین نسخه را. build تکرارپذیر است.

## Package
- \`internal/\` فقط از والد و زیرشاخه‌هایش قابل import است. ابزار اصلی برای مخفی نگه داشتن کد است.
- نام پکیج کوتاه، مفرد و بدون \`util\` یا \`common\` باشد. \`user.Service\` بهتر از \`services.UserService\` است.
- **Import cycle** در Go خطای کامپایل است. راه حل معمولاً یک interface در پکیج مصرف‌کننده یا جدا کردن تایپ‌های domain است.

## ساختار رایج سرویس
~~~text
cmd/api/main.go        ← فقط wiring
internal/order/        ← domain + service
internal/platform/pg/  ← adapterها
~~~
\`pkg/\` اجباری نیست و بسیاری از تیم‌ها از آن استفاده نمی‌کنند.

## در ایران: proxy و vendoring
به خاطر تحریم و فیلتر، \`proxy.golang.org\` و \`sum.golang.org\` همیشه در دسترس نیستند. تیم‌ها معمولاً این کارها را می‌کنند:
- یک **GOPROXY داخلی** (Athens یا Nexus) یا mirror معتبر راه می‌اندازند،
- برای ماژول‌های خصوصی \`GOPRIVATE=git.company.ir/*\` تنظیم می‌کنند،
- برای build آفلاین در CI از \`go mod vendor\` استفاده می‌کنند.

اینکه بدانید \`GONOSUMDB\` و \`GOFLAGS=-mod=vendor\` چه می‌کنند، در مصاحبهٔ تیم‌های ایرانی امتیاز است.`,
        practicalMd: `ساختار پوشهٔ یک سرویس سفارش با api و worker را بنویسید و مشخص کنید کدام پکیج‌ها internal هستند.`,
        exampleMd: `~~~bash
go env -w GOPRIVATE='git.company.ir/*'
go mod tidy && go mod vendor
go build -mod=vendor ./...
~~~`,
      }),
      goLesson({
        slug: "go-tooling",
        topicSlug: "go-tooling",
        titleFa: "ابزارهای کیفیت: vet، lint، vulncheck",
        objectiveFa: "pipeline کیفیت کد یک تیم Go را بچینید و بدانید هر ابزار چه چیزی را می‌گیرد.",
        theoryMd: `## چرا مهم است
از Senior انتظار می‌رود استاندارد تیم را تعریف کند، نه فقط کد بنویسد.

## ابزارها
| ابزار | چه می‌گیرد |
|---|---|
| \`gofmt\` / \`goimports\` | فرمت یکسان، بدون بحث در review |
| \`go vet\` | copylocks، printf اشتباه، lostcancel، struct tag غلط |
| \`staticcheck\` | کد مرده، API منسوخ، باگ‌های رایج |
| \`golangci-lint\` | اجرای ده‌ها linter (errcheck، gosec، revive و...) با یک config |
| \`go test -race\` | data race در زمان اجرا |
| \`govulncheck\` | آسیب‌پذیری‌هایی که **واقعاً از کد شما فراخوانی می‌شوند** |

## Pipeline پیشنهادی CI
1. \`gofmt -l\` (اگر خروجی داشت، fail شود)
2. \`go vet ./...\` و \`golangci-lint run\`
3. \`go test -race -count=1 ./...\` با coverage
4. \`govulncheck ./...\`
5. build با \`-trimpath\` و \`-ldflags "-s -w -X main.version=..."\`

## سؤال مصاحبه
**«یک دستور CI که حتماً برای سرویس Go می‌گذارید؟»**
پاسخ خوب: \`go test -race\`. data race معمولاً در تست عادی دیده نمی‌شود و در production به شکل دادهٔ خراب ظاهر می‌شود.`,
        practicalMd: `در لب امروز بعد از حل تمرین، \`go vet ./...\` را اجرا کنید و ببینید چه چیزهایی را بررسی می‌کند (\`go tool vet help\`).`,
        exampleMd: `~~~yaml
# .golangci.yml
linters:
  enable: [errcheck, govet, staticcheck, gosec, revive, bodyclose, noctx]
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "generic-stack",
        titleFa: "لب: Stack جنریک و MaxOf",
        topicSlug: "go-generics",
        lessonSlug: "generics",
        instructionsMd: `یک \`Stack[T any]\` بنویسید که zero valueاش قابل استفاده باشد، و یک \`MaxOf[T cmp.Ordered]\`.
سؤال تکمیلی برای مصاحبه: چرا در \`Pop\` بهتر است خانهٔ آزادشده را zero کنید؟`,
        hints: [
          "یک فیلد items []T کافی است؛ nil slice با append کار می‌کند، پس zero value خودبه‌خود قابل استفاده است.",
          "برای برگرداندن «هیچ» در تابع generic از var zero T استفاده کنید.",
          "در Pop: v := s.items[len-1]؛ s.items[len-1] = zero (تا GC بتواند pointer را آزاد کند)؛ s.items = s.items[:len-1].",
        ],
        difficulty: "easy",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Build شکست‌خورده در CI ساعت ۲ بامداد",
      path: "/tmp/go-day5-scenario.txt",
      mustContain: "vendor",
      incidentMd: "pipeline همهٔ سرویس‌ها با خطای dial tcp: lookup proxy.golang.org: i/o timeout شکست خورده و release اضطراری متوقف است.",
      symptomsMd: "روی لپ‌تاپ توسعه‌دهنده‌ها build کار می‌کند چون module cache محلی پر است.",
      rootCause: "CI به proxy خارجی وابسته بود و دسترسی قطع شد؛ GOPROXY داخلی یا vendoring وجود نداشت",
    }),
    exam: {
      titleFa: "آزمون — generics و module",
      questions: [
        tf("هر API عمومی بهتر است generic باشد.", false, "فقط وقتی کد برای همهٔ تایپ‌ها یکسان است.", "go-generics"),
        mc(
          "کدام constraint اجازهٔ استفاده از < را می‌دهد؟",
          ["any", "comparable", "cmp.Ordered", "error"],
          "cmp.Ordered",
          "comparable فقط == و != را تضمین می‌کند.",
          "go-generics",
        ),
        sa("پوشه‌ای که import از بیرون زیردرخت را ممنوع می‌کند؟", "internal", "internal packages", "go-packages"),
        mc(
          "کدام ابزار فقط آسیب‌پذیری‌هایی را گزارش می‌کند که کد شما واقعاً فراخوانی می‌کند؟",
          ["go vet", "gofmt", "govulncheck", "go mod tidy"],
          "govulncheck",
          "govulncheck تحلیل call graph انجام می‌دهد.",
          "go-tooling",
        ),
        tf("Go در Minimal Version Selection همیشه آخرین نسخهٔ منتشرشدهٔ هر وابستگی را انتخاب می‌کند.", false, "حداقل نسخه‌ای که همهٔ requireها را برآورده کند.", "go-packages"),
      ],
    },
  }),

  day({
    dayNumber: 6,
    phaseSlug: "go-fundamentals",
    titleFa: "تست‌نویسی idiomatic در Go",
    objectiveFa: "table-driven test، subtest، fake، httptest، fuzzing و benchmark را مثل یک Senior به‌کار ببرید.",
    topicSlugs: ["go-testing"],
    lessons: [
      goLesson({
        slug: "testing-idioms",
        topicSlug: "go-testing",
        titleFa: "Table-driven test، subtest و fake",
        objectiveFa: "تستی بنویسید که خوانا، سریع و مستقل از جزئیات پیاده‌سازی باشد.",
        theoryMd: `## چرا اینجا؟
از این به بعد همهٔ لب‌ها با \`go test\` ارزیابی می‌شوند. در مصاحبه‌های live coding هم اغلب می‌پرسند «چطور تستش می‌کنید؟».

## Table-driven
~~~go
cases := []struct {
	name string
	in   string
	want int
}{
	{"empty", "", 0},
	{"ascii", "go", 2},
}
for _, tc := range cases {
	t.Run(tc.name, func(t *testing.T) {
		if got := Len(tc.in); got != tc.want {
			t.Fatalf("Len(%q) = %d; want %d", tc.in, got, tc.want)
		}
	})
}
~~~
- پیام خطا الگوی \`got X; want Y\` و ورودی را داشته باشد.
- \`t.Fatalf\` تست را متوقف می‌کند و \`t.Errorf\` ادامه می‌دهد.
- \`t.Parallel()\` برای subtestهای مستقل. از Go 1.22 متغیر حلقه در هر iteration جدید است.
- \`t.Helper()\` در توابع کمکی تا خط خطا درست گزارش شود. \`t.Cleanup\` برای آزادسازی منابع.

## Fake بهتر از mock
برای وابستگی‌ها یک **fake ساده** (مثلاً repository در حافظه با map) بنویسید. mockهای تولیدشده که ترتیب فراخوانی را assert می‌کنند تست را به پیاده‌سازی قفل می‌کنند و با هر refactor می‌شکنند.

## زمان را تزریق کنید
\`time.Now\`، \`rand\` و \`sleep\` وابستگی‌اند. آن‌ها را به شکل تابع یا interface تزریق کنید (در لب token bucket می‌بینید).

## HTTP
\`httptest.NewRecorder\` برای تست handler بدون شبکه و \`httptest.NewServer\` برای تست client در برابر سرور واقعی محلی.

## سؤال مصاحبه
**«تست‌هایتان flaky هستند. اولین کاری که می‌کنید؟»**
پاسخ: با \`-count=50 -race\` بازتولید می‌کنم. معمولاً علت \`time.Sleep\` به جای synchronization، ترتیب map، یا state مشترک بین تست‌های parallel است.`,
        practicalMd: `برای تابع \`Reverse\` لب امروز دو case جدید به table test اضافه کنید: یکی با emoji و یکی با متن ترکیبی فارسی و انگلیسی.`,
        exampleMd: `~~~go
type fakeUsers struct{ m map[int64]User }

func (f *fakeUsers) GetByID(_ context.Context, id int64) (User, error) {
	u, ok := f.m[id]
	if !ok {
		return User{}, ErrNotFound
	}
	return u, nil
}
~~~`,
      }),
      goLesson({
        slug: "fuzz-bench",
        topicSlug: "go-testing",
        titleFa: "Fuzzing و benchmark",
        objectiveFa: "با fuzz باگ‌هایی را پیدا کنید که به ذهن نمی‌رسند و با benchmark ادعای بهینه‌سازی را اثبات کنید.",
        theoryMd: `## Fuzzing (از Go 1.18)
به جای مثال، **ویژگی (property)** را تست کنید: «دو بار reverse برابر ورودی است»، «Marshal و سپس Unmarshal همان را می‌دهد».
~~~bash
go test -fuzz=FuzzReverse -fuzztime=20s
~~~
ورودی شکست‌خورده در \`testdata/fuzz/FuzzXxx/\` ذخیره می‌شود و از آن به بعد جزو تست‌های عادی است. برای parserها، decoderها و هر چیزی که ورودی کاربر می‌گیرد عالی است.

## Benchmark
~~~go
func BenchmarkReverse(b *testing.B) {
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		Reverse("سلام دنیا")
	}
}
~~~
- \`go test -bench=. -benchmem -count=10 > new.txt\` و مقایسه با \`benchstat old.txt new.txt\`. یک اجرای تکی نویز دارد.
- از Go 1.24 \`for b.Loop()\` جایگزین بهتر \`b.N\` است.
- **ns/op، B/op و allocs/op** را با هم ببینید. کاهش allocation معمولاً روی tail latency اثر بیشتری دارد.

## سؤال مصاحبه
**«چطور ثابت می‌کنید بهینه‌سازی‌تان واقعاً بهتر است؟»**
پاسخ: benchmark قبل و بعد با \`-count=10\`، مقایسه با \`benchstat\` و توجه به p-value. و در production، متریک p99 قبل و بعد از canary.`,
        practicalMd: `در لب امروز اول fuzz را اجرا کنید تا ورودی شکست‌خورده را پیدا کند، بعد آن را درست کنید.`,
        exampleMd: `~~~text
name        old time/op  new time/op  delta
Reverse-8   182ns ± 2%    96ns ± 1%  -47.25%  (p=0.000 n=10+10)
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "fuzz-reverse",
        titleFa: "لب: باگی که فقط fuzzer پیدا می‌کند",
        topicSlug: "go-testing",
        lessonSlug: "fuzz-bench",
        instructionsMd: `تابع \`Reverse\` تست‌های ASCII را پاس می‌کند و همه فکر می‌کردند درست است، تا وقتی که کاربر فارسی‌زبان آمد.
1. \`go test -fuzz=FuzzReverse -fuzztime=20s\` را اجرا و ورودی شکست‌خورده را پیدا کنید.
2. توضیح دهید چرا خراب می‌شود (byte در برابر rune).
3. اصلاح کنید تا همهٔ تست‌ها پاس شوند.`,
        hints: [
          "len(\"سلام\") برابر ۸ است نه ۴. هر حرف فارسی در UTF-8 چند بایت است؟",
          "به جای []byte روی []rune کار کنید.",
          "r := []rune(s)؛ دو اندیس از دو سر به سمت هم جابه‌جا شوند؛ return string(r).",
        ],
        difficulty: "easy",
      }),
    ],
    scenario: noteScenario({
      titleFa: "تست‌های flaky در CI",
      path: "/tmp/go-day6-scenario.txt",
      mustContain: "time.Sleep",
      incidentMd: "حدود ۱۰٪ اجراهای CI بدون تغییر کد fail می‌شوند و تیم عادت کرده دکمهٔ retry را بزند.",
      symptomsMd: "تست‌های مشکل‌دار همه شامل goroutine هستند و با time.Sleep(10*time.Millisecond) منتظر نتیجه می‌مانند.",
      rootCause: "استفاده از time.Sleep به جای synchronization (channel یا WaitGroup) در تست؛ روی CI کند، ۱۰ms کافی نیست",
    }),
    exam: {
      titleFa: "آزمون — تست‌نویسی",
      questions: [
        mc(
          "تفاوت t.Fatalf و t.Errorf؟",
          ["هیچ", "Fatalf تست جاری را متوقف می‌کند، Errorf ادامه می‌دهد", "Errorf کل package را متوقف می‌کند", "Fatalf فقط در benchmark است"],
          "Fatalf تست جاری را متوقف می‌کند، Errorf ادامه می‌دهد",
          "Fatalf با runtime.Goexit تست جاری را تمام می‌کند.",
          "go-testing",
        ),
        tf("ورودی شکست‌خوردهٔ fuzzer در testdata ذخیره می‌شود و بخشی از go test عادی می‌شود.", true, "testdata/fuzz/FuzzName", "go-testing"),
        sa("ابزار مقایسهٔ آماری نتایج benchmark؟", "benchstat", "golang.org/x/perf/cmd/benchstat", "go-testing"),
        mc(
          "برای تست handler بدون باز کردن port از چه چیزی استفاده می‌کنید؟",
          ["httptest.NewRecorder", "net.Listen", "http.DefaultClient", "os/exec"],
          "httptest.NewRecorder",
          "Recorder یک ResponseWriter در حافظه است.",
          "go-testing",
        ),
        tf("mockهایی که ترتیب دقیق فراخوانی‌ها را assert می‌کنند معمولاً تست را شکننده می‌کنند.", true, "تست به پیاده‌سازی قفل می‌شود؛ fake یا تست رفتار بهتر است.", "go-testing"),
      ],
    },
  }),

  day({
    dayNumber: 7,
    phaseSlug: "go-fundamentals",
    titleFa: "حافظه: Stack، Heap، Escape Analysis و GC",
    objectiveFa: "پیش‌بینی کنید چه چیزی به heap می‌رود، GC چطور کار می‌کند و GOGC و GOMEMLIMIT را در کانتینر تنظیم کنید.",
    topicSlugs: ["go-stack-heap", "go-escape", "go-gc", "go-alloc"],
    lessons: [
      goLesson({
        slug: "stack-heap-escape",
        topicSlug: "go-stack-heap",
        titleFa: "Stack، Heap و Escape Analysis",
        objectiveFa: "خروجی gcflags=-m را بخوانید و دلایل رایج escape را بشناسید.",
        theoryMd: `## چرا مهم است
در سرویس‌های پرترافیک (مثل checkout یا ارسال SMS)، p99 بیشتر از تعداد allocation در hot path تأثیر می‌گیرد تا از سرعت CPU.

## مفهوم
- **Stack:** هر goroutine stack خودش را دارد (شروع از ۲KB و قابل رشد). allocation روی stack تقریباً رایگان است و با برگشت تابع آزاد می‌شود.
- **Heap:** مشترک است و GC آن را مدیریت می‌کند. هر allocation هزینه دارد و هزینهٔ بزرگ‌تر، کار GC در آینده است.
- **Escape analysis:** کامپایلر در زمان build تصمیم می‌گیرد. اگر نتواند ثابت کند متغیر بعد از برگشت تابع استفاده نمی‌شود، آن را به heap می‌برد.

## دلایل رایج escape
1. برگرداندن pointer به متغیر محلی
2. قرار دادن مقدار در interface (\`fmt.Println(x)\`، \`any\`)
3. capture شدن در closure که بیشتر از تابع زنده می‌ماند (مثلاً goroutine)
4. اندازهٔ نامعلوم در زمان کامپایل: \`make([]byte, n)\` با n متغیر
5. ذخیره در struct یا slice که خودش روی heap است

~~~bash
go build -gcflags='-m' ./...      # چه چیزی escape می‌کند
go build -gcflags='-m -m' ./...   # و چرا
~~~

## سؤال مصاحبه
**«آیا new(T) همیشه روی heap است؟»**
پاسخ: نه. اگر escape نکند، روی stack می‌ماند. \`new\` و \`&T{}\` فقط معنای «pointer بده» دارند و محل allocation را escape analysis تعیین می‌کند.`,
        practicalMd: `یک تابع که \`*int\` برمی‌گرداند و یکی که \`int\` برمی‌گرداند بنویسید و خروجی \`go build -gcflags=-m\` را مقایسه کنید.`,
        exampleMd: `~~~go
func newInt() *int {
	x := 42
	return &x // ./main.go:4:2: moved to heap: x
}

func sum(xs []int) int { // xs does not escape
	t := 0
	for _, x := range xs {
		t += x
	}
	return t
}
~~~`,
      }),
      goLesson({
        slug: "gc-tuning",
        topicSlug: "go-gc",
        titleFa: "GC در Go و تنظیم GOGC و GOMEMLIMIT",
        objectiveFa: "رفتار GC را توضیح دهید و OOMKill در Kubernetes را با GOMEMLIMIT پیشگیری کنید.",
        theoryMd: `## GC در Go
- **Concurrent، tri-color mark-and-sweep**، non-generational و non-compacting.
- بیشتر کار هم‌زمان با برنامه انجام می‌شود. stop-the-world فقط چند ده میکروثانیه است.
- هزینهٔ واقعی **CPU** است، نه pause: حدود ۲۵٪ از Pها در زمان mark کار GC انجام می‌دهند، و goroutineای که سریع allocate می‌کند مجبور به **mark assist** می‌شود. این مستقیم روی latency اثر دارد.

## GOGC
پیش‌فرض ۱۰۰ است: GC بعدی وقتی شروع می‌شود که heap به ۲ برابر heap زندهٔ بعد از GC قبلی برسد.
- GOGC بالاتر ← GC کمتر و CPU کمتر، ولی حافظهٔ بیشتر
- GOGC پایین‌تر ← برعکس

## GOMEMLIMIT (از Go 1.19) — مهم برای کانتینر
Go از limit کانتینر خبر ندارد. سرویسی با heap زندهٔ ۶۰۰MB و GOGC=100 ممکن است تا ۱.۲GB برود و در pod با limit یک گیگ **OOMKilled** شود.
- \`GOMEMLIMIT\` یک **soft limit** است: نزدیک آن، GC تهاجمی‌تر می‌شود.
- قاعدهٔ رایج: حدود ۸۰ تا ۹۰٪ memory limit کانتینر، تا برای stackها، cgo و بافرها جا بماند.
- الگوی سرویس‌های پرترافیک: \`GOGC=off\` به همراه \`GOMEMLIMIT\`. تا رسیدن به سقف GC اجرا نمی‌شود. خطرش این است که اگر heap زنده به سقف برسد، GC مدام اجرا می‌شود (death spiral).

## کاهش allocation
- \`sync.Pool\` برای bufferهای موقت (روز «هم‌زمانی پیشرفته»)
- پیش‌تخصیص: \`make([]T, 0, n)\` و \`strings.Builder.Grow\`
- اجتناب از \`fmt.Sprintf\` و تبدیل‌های \`[]byte\`/\`string\` در hot path

## سؤال مصاحبه
**«سرویس Go در Kubernetes مدام OOMKilled می‌شود ولی heap profile نشتی نشان نمی‌دهد. چه می‌کنید؟»**
پاسخ: احتمالاً heap بین دو GC تا ۲ برابر حجم زنده رشد می‌کند. \`GOMEMLIMIT\` را حدود ۹۰٪ limit تنظیم می‌کنم و \`/sched/gc\` و \`go_memstats\` را نگاه می‌کنم. اگر heap زنده واقعاً بزرگ است، یا limit را بالا می‌برم یا allocation را کم می‌کنم.`,
        practicalMd: `برنامه‌ای که در حلقه slice بزرگ می‌سازد را با \`GODEBUG=gctrace=1\` اجرا کنید و یک خط خروجی را تفسیر کنید.`,
        exampleMd: `~~~yaml
# deployment.yaml
resources:
  limits:
    memory: 1Gi
env:
  - name: GOMEMLIMIT
    value: "900MiB"
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تحلیل escape یک تابع",
        topicSlug: "go-escape",
        lessonSlug: "stack-heap-escape",
        path: "/tmp/go-day7-escape.txt",
        mustContain: "escapes",
        instructionsMd: `در ترمینال لب (Go نصب است) یک فایل با دو تابع بنویسید: یکی pointer به متغیر محلی برمی‌گرداند و دیگری مقدار را. \`go build -gcflags=-m\` را اجرا کنید و خروجی را به همراه توضیح خودتان (با واژهٔ escapes) در فایل بنویسید.`,
        answerOutlineFa: "خروجی شامل «moved to heap: x» برای نسخهٔ pointer و «does not escape» برای پارامترهاست؛ توضیح دهید کامپایلر نمی‌تواند ثابت کند x بعد از return استفاده نمی‌شود.",
      }),
      noteExercise({
        titleFa: "طراحی تنظیمات حافظه برای pod",
        topicSlug: "go-gc",
        lessonSlug: "gc-tuning",
        path: "/tmp/go-day7-memlimit.txt",
        mustContain: "GOMEMLIMIT",
        instructionsMd: `سرویسی با heap زندهٔ حدود ۴۰۰MB در pod با memory limit دو گیگ اجرا می‌شود و گاهی OOMKill می‌خورد. مقدار GOGC و GOMEMLIMIT پیشنهادی را با دلیل بنویسید و یک ریسک تنظیمتان را نام ببرید.`,
        answerOutlineFa: "GOMEMLIMIT حدود 1800MiB (حدود ۹۰٪ limit)، GOGC پیش‌فرض یا بالاتر؛ ریسک: اگر heap زنده به سقف نزدیک شود GC مداوم CPU را می‌خورد. باید متریک GC CPU را مانیتور کرد.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Latency ناگهانی پس از deploy",
      path: "/tmp/go-day7-scenario.txt",
      mustContain: "allocation",
      incidentMd: "پس از deploy، p99 سرویس از 40ms به 180ms رسیده. CPU کمی بالاتر است و GC در متریک‌ها بیشتر اجرا می‌شود.",
      symptomsMd: "benchmark جدید alloc/op سه برابر را نشان می‌دهد؛ goroutine leak نیست.",
      rootCause: "ساخت مکرر []byte بزرگ در hot path بدون buffer pool؛ mark assist روی goroutineهای request اثر گذاشته",
    }),
    exam: {
      titleFa: "آزمون — حافظه و GC",
      questions: [
        tf("هر متغیر محلی در Go همیشه روی stack است.", false, "escape analysis ممکن است آن را به heap ببرد.", "go-stack-heap"),
        sa("پرچم کامپایلر برای دیدن escape analysis؟", "-gcflags=-m", "go build -gcflags='-m'", "go-escape"),
        mc(
          "GOGC=100 یعنی چه؟",
          ["هر ۱۰۰ms یک بار GC", "GC بعدی وقتی heap دو برابر heap زنده شود", "حداکثر ۱۰۰MB heap", "۱۰۰٪ CPU برای GC"],
          "GC بعدی وقتی heap دو برابر heap زنده شود",
          "هدف رشد heap برابر ۱۰۰٪ heap زنده است.",
          "go-gc",
        ),
        mc(
          "برای جلوگیری از OOMKill سرویس Go در کانتینر کدام تنظیم مستقیماً کمک می‌کند؟",
          ["GOMAXPROCS", "GOMEMLIMIT", "GOPATH", "GOFLAGS"],
          "GOMEMLIMIT",
          "soft memory limit؛ GC نزدیک سقف تهاجمی‌تر می‌شود.",
          "go-gc",
        ),
        tf("هزینهٔ اصلی GC در Go معمولاً pause طولانی stop-the-world است.", false, "STW کوتاه است؛ هزینهٔ اصلی CPU و mark assist است.", "go-gc"),
      ],
    },
  }),

  day({
    dayNumber: 8,
    phaseSlug: "go-fundamentals",
    titleFa: "Runtime: Scheduler، GOMAXPROCS و Reflection",
    objectiveFa: "مدل G-M-P، preemption، رفتار در کانتینر و هزینهٔ reflection را در سطح مصاحبهٔ Senior توضیح دهید.",
    topicSlugs: ["go-runtime", "go-reflection"],
    lessons: [
      goLesson({
        slug: "scheduler-gmp",
        topicSlug: "go-runtime",
        titleFa: "Scheduler: G، M، P",
        objectiveFa: "توضیح دهید goroutineها چطور روی threadها اجرا می‌شوند و I/O چرا thread را block نمی‌کند.",
        theoryMd: `## اجزا
- **G** یعنی goroutine: stack و وضعیت.
- **M** یعنی thread سیستم‌عامل.
- **P** یعنی processor منطقی با run queue محلی. تعداد آن \`GOMAXPROCS\` است. M برای اجرای کد Go باید یک P داشته باشد.

## رفتارهای کلیدی
- **Work stealing:** وقتی run queue یک P خالی شود، از P دیگر یا global queue کار می‌دزدد.
- **Network I/O:** از طریق **netpoller** (epoll یا kqueue) انجام می‌شود. goroutine پارک می‌شود و M آزاد می‌ماند، برای همین ده هزار connection هم‌زمان با چند thread ممکن است.
- **Blocking syscall** (مثلاً I/O فایل یا cgo): M همراه G block می‌شود و P به M دیگری داده می‌شود. پس تعداد threadها می‌تواند از GOMAXPROCS بیشتر شود.
- **Preemption:** از Go 1.14 غیرهم‌زمان و مبتنی بر signal است. حلقهٔ تنگ بدون فراخوانی تابع دیگر scheduler را قفل نمی‌کند.

## GOMAXPROCS در کانتینر — دام کلاسیک
تا قبل از Go 1.25، مقدار پیش‌فرض GOMAXPROCS تعداد CPUهای **node** بود، نه CPU limit کانتینر. pod با limit دو CPU روی node با ۶۴ هسته ۶۴ thread اجرا می‌کرد، CFS throttling رخ می‌داد و p99 بالا می‌رفت. راه‌حل‌ها:
- \`go.uber.org/automaxprocs\`، یا تنظیم صریح env \`GOMAXPROCS\`
- از **Go 1.25** runtime به CPU limit در cgroup توجه می‌کند.

در مصاحبه بگویید نسخهٔ Go سرویس را بررسی می‌کنید.

## ابزار
\`GODEBUG=schedtrace=1000\`، \`go tool trace\` و \`runtime.NumGoroutine()\`.

## سؤال مصاحبه
**«چرا ۱۰ هزار goroutine منتظر HTTP فقط چند thread مصرف می‌کنند ولی ۱۰ هزار goroutine منتظر فایل NFS صدها thread؟»**
پاسخ: network I/O از netpoller می‌گذرد و goroutine پارک می‌شود. I/O فایل یک syscall مسدودکننده است و M را نگه می‌دارد، پس runtime برای حفظ P threadهای جدید می‌سازد.`,
        practicalMd: `در لب \`nproc\` و \`go env GOMAXPROCS\` (یا \`runtime.GOMAXPROCS(0)\`) را مقایسه کنید. env کانتینر روی ۲ تنظیم شده است. چرا؟`,
        exampleMd: `~~~go
import _ "go.uber.org/automaxprocs" // Go < 1.25: GOMAXPROCS را از cgroup می‌خواند

func main() {
	log.Printf("GOMAXPROCS=%d", runtime.GOMAXPROCS(0))
}
~~~`,
      }),
      goLesson({
        slug: "reflection",
        topicSlug: "go-reflection",
        titleFa: "Reflection و unsafe: کی و به چه قیمتی",
        objectiveFa: "بدانید encoding/json چطور از reflect استفاده می‌کند و چرا در business logic بوی بد می‌دهد.",
        theoryMd: `## مفهوم
\`reflect.TypeOf\` و \`reflect.ValueOf\` اطلاعات تایپ را در زمان اجرا می‌دهند. کتابخانه‌هایی مثل \`encoding/json\`، ORMها و validatorها بدون آن ممکن نیستند. struct tagها (\`json:"name"\`) فقط از طریق reflection خوانده می‌شوند.

## هزینه
- کندتر از کد مستقیم (معمولاً ۱۰ تا ۱۰۰ برابر)، با allocation زیاد و خطاهایی که در زمان اجرا پیدا می‌شوند نه کامپایل.
- \`encoding/json\` در hot path پرترافیک یک bottleneck شناخته‌شده است. جایگزین‌ها: codegen (easyjson) یا کتابخانه‌های سریع‌تر، **فقط بعد از profile**.

## جایگزین‌ها در کد خودتان
interface، generics، یا \`go generate\` برای تولید کد.

## unsafe
\`unsafe.Pointer\` و \`unsafe.String\` تضمین‌های Go را دور می‌زنند. فقط در کتابخانه‌های پایه، با benchmark و توضیح. در code review سنیور هر \`unsafe\` باید دلیل مکتوب داشته باشد.

## سؤال مصاحبه
**«چرا فیلد unexported در خروجی json.Marshal نمی‌آید؟»**
پاسخ: reflect فقط به فیلدهای exported دسترسی تنظیم و خواندن دارد.`,
        practicalMd: `در profile یک سرویس فرضی \`reflect.Value.Interface\` در بالای لیست است. سه علت احتمالی و یک راه‌حل بنویسید.`,
        exampleMd: `~~~go
t := reflect.TypeOf(User{})
for i := 0; i < t.NumField(); i++ {
	f := t.Field(i)
	fmt.Println(f.Name, f.Tag.Get("json"))
}
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "throttling در Kubernetes",
        topicSlug: "go-runtime",
        lessonSlug: "scheduler-gmp",
        path: "/tmp/go-day8-gomaxprocs.txt",
        mustContain: "GOMAXPROCS",
        instructionsMd: `سرویس Go 1.22 روی node با ۳۲ هسته و CPU limit برابر ۲ اجرا می‌شود. متریک container_cpu_cfs_throttled بالاست و p99 نوسان دارد. علت را با مدل G-M-P توضیح دهید و دو راه‌حل بنویسید.`,
        answerOutlineFa:
          "GOMAXPROCS برابر ۳۲ است؛ ۳۲ thread در سهمیهٔ دو CPU رقابت می‌کنند و CFS در هر دورهٔ ۱۰۰ms سهمیه را زود تمام و thread را throttle می‌کند. راه‌حل: automaxprocs یا env GOMAXPROCS=2، یا ارتقا به Go 1.25.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "CPU داغ در serializer سفارشی",
      path: "/tmp/go-day8-scenario.txt",
      mustContain: "reflect",
      incidentMd: "سرویس گزارش CPU بالایی دارد؛ CPU profile نشان می‌دهد hotspot در reflect.Value.Interface و mapassign است.",
      symptomsMd: "هر request صدها allocation در تابع toMap(any) دارد که یک تیم برای لاگ ساخته.",
      rootCause: "تبدیل struct به map با reflection برای هر لاگ در hot path",
    }),
    exam: {
      titleFa: "آزمون — runtime و reflection",
      questions: [
        mc(
          "P در مدل G-M-P چیست؟",
          ["process سیستم‌عامل", "processor منطقی با run queue؛ تعدادش GOMAXPROCS است", "یک pointer", "پکیج runtime"],
          "processor منطقی با run queue؛ تعدادش GOMAXPROCS است",
          "M برای اجرای کد Go باید P داشته باشد.",
          "go-runtime",
        ),
        tf("goroutine منتظر socket شبکه یک thread سیستم‌عامل را block می‌کند.", false, "از netpoller استفاده می‌کند و M آزاد می‌ماند.", "go-runtime"),
        tf("در Go 1.22، GOMAXPROCS پیش‌فرض برابر CPU limit کانتینر است.", false, "تا قبل از 1.25 تعداد CPU node است.", "go-runtime"),
        tf("استفاده از reflect در hot path معمولاً ارزان است.", false, "هزینهٔ CPU و allocation دارد.", "go-reflection"),
        mc(
          "کدام پکیج stdlib به شدت به reflect وابسته است؟",
          ["math", "encoding/json", "sync/atomic", "os"],
          "encoding/json",
          "tagها و فیلدها با reflection خوانده می‌شوند.",
          "go-reflection",
        ),
      ],
    },
  }),

  day({
    dayNumber: 9,
    phaseSlug: "go-fundamentals",
    titleFa: "جمع‌بندی Module 1: کلاینت HTTP آمادهٔ production",
    objectiveFa: "مفاهیم Module 1 را در طراحی یک پکیج واقعی کنار هم بگذارید و از تصمیم‌هایتان دفاع کنید.",
    topicSlugs: ["go-structs", "go-errors", "go-interfaces", "go-alloc", "go-testing"],
    lessons: [
      goLesson({
        slug: "module1-capstone",
        topicSlug: "go-interfaces",
        titleFa: "طراحی پکیج paymentclient",
        objectiveFa: "یک API کوچک ولی production-grade طراحی کنید که در code review سنیور قبول شود.",
        theoryMd: `## صورت مسئله
تیم شما باید درگاه پرداخت شاپرک‌محور یک PSP را از سه سرویس صدا بزند. شما مالک پکیج \`paymentclient\` هستید.

## چک‌لیست طراحی (هر کدام = یک روز این ماژول)
1. **تایپ‌ها:** zero value امن و \`Config\` با مقادیر پیش‌فرض
2. **Struct و receiver:** \`*Client\` با \`*http.Client\` اختصاصی و timeout
3. **Interface:** وابستگی به \`Doer\` (\`Do(*http.Request)\`) برای تست، نه \`*http.Client\`
4. **خطا:** \`ErrDeclined\` به صورت sentinel، و \`*APIError{Code, RetryAfter}\` به صورت تایپ، wrap با \`%w\`
5. **Generics:** فقط اگر واقعاً لازم شد (مثلاً decode جنریک پاسخ)
6. **تست:** \`httptest.NewServer\` برای PSP جعلی و table test برای نگاشت status code به خطا
7. **حافظه:** بستن \`resp.Body\` در همهٔ مسیرها، و خواندن با \`io.LimitReader\`
8. **API:** \`context.Context\` پارامتر اول هر method

## دام‌هایی که مصاحبه‌گر دنبالشان است
- \`resp.Body.Close()\` فراموش‌شده یا body که خوانده نشده ← connection به pool برنمی‌گردد.
- retry روی \`POST /pay\` بدون idempotency key ← پرداخت دوباره (Module 7).
- لاگ کردن شماره کارت یا توکن.`,
        practicalMd: `API عمومی پکیج (تایپ‌ها، constructor، methodها و خطاها) را در فایل تمرین بنویسید. پیاده‌سازی لازم نیست.`,
        exampleMd: `~~~go
type Doer interface {
	Do(*http.Request) (*http.Response, error)
}

type Client struct {
	baseURL string
	http    Doer
}

func New(baseURL string, opts ...Option) *Client

func (c *Client) Pay(ctx context.Context, req PayRequest) (PayResult, error)
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "API عمومی paymentclient",
        topicSlug: "go-errors",
        lessonSlug: "module1-capstone",
        path: "/tmp/go-day9-client.txt",
        mustContain: "context.Context",
        instructionsMd: `API عمومی پکیج paymentclient را طراحی کنید: هر method پارامتر اول \`context.Context\` بگیرد، خطاها قابل تشخیص با errors.Is و errors.As باشند، و بنویسید چطور با httptest تستش می‌کنید.`,
        difficulty: "hard",
        maxScore: 20,
        answerOutlineFa:
          "New(baseURL, ...Option) *Client؛ Pay(ctx, PayRequest) (PayResult, error)؛ ErrDeclined و *APIError؛ Option برای WithHTTPClient و WithTimeout؛ تست با httptest.NewServer که سناریوهای 200، 402، 429 و 500 را برمی‌گرداند.",
      }),
      noteExercise({
        titleFa: "بستن body و connection reuse",
        topicSlug: "go-alloc",
        lessonSlug: "module1-capstone",
        path: "/tmp/go-day9-body.txt",
        mustContain: "Body.Close",
        instructionsMd: `توضیح دهید اگر \`resp.Body.Close()\` فراموش شود یا body تا انتها خوانده نشود چه اتفاقی برای connection pool و file descriptorها می‌افتد. الگوی درست را بنویسید.`,
        answerOutlineFa:
          "connection به idle pool برنمی‌گردد و connection جدید باز می‌شود؛ fdها و goroutineهای readLoop نشت می‌کنند. الگو: defer resp.Body.Close() و در صورت نیاز io.Copy(io.Discard, io.LimitReader(resp.Body, 64<<10)).",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Timeoutهای پراکنده در downstream",
      path: "/tmp/go-day9-scenario.txt",
      mustContain: "context",
      incidentMd: "فراخوانی‌های PSP گاهی چند دقیقه hang می‌مانند و workerها تمام می‌شوند.",
      symptomsMd: "goroutine dump نشان می‌دهد صدها goroutine در net/http.(*persistConn).roundTrip منتظرند؛ کلاینت از http.DefaultClient استفاده می‌کند.",
      rootCause: "DefaultClient هیچ timeoutی ندارد و context هم به درخواست پاس داده نشده بود",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون پایانی Module 1",
      questions: [
        mc(
          "کدام ترکیب برای کلاینت production بهتر است؟",
          ["http.DefaultClient بدون context", "*http.Client اختصاصی با Timeout و NewRequestWithContext", "panic روی هر خطا", "یک client جدید برای هر درخواست"],
          "*http.Client اختصاصی با Timeout و NewRequestWithContext",
          "DefaultClient timeout ندارد؛ و client (به‌ویژه Transport) باید یک بار ساخته و بین درخواست‌ها مشترک باشد.",
          "go-interfaces",
        ),
        tf("ساختن http.Transport جدید برای هر درخواست هزینه‌ای ندارد.", false, "هر Transport pool اتصال خودش را دارد؛ اتصال‌ها reuse نمی‌شوند و TCP/TLS handshake هر بار تکرار می‌شود.", "go-structs"),
        sa("برای کاهش allocation مکرر bufferهای موقت چه ابزاری در stdlib هست؟", "sync.Pool", "pool از bufferها", "go-alloc"),
        tf("wrap کردن خطا با %w به errors.Is کمک می‌کند.", true, "%w زنجیره را حفظ می‌کند.", "go-errors"),
      ],
    },
  }),
];
