import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "../../types";

function goLesson(opts: {
  slug: string;
  topicSlug: string;
  titleFa: string;
  objectiveFa: string;
  theoryMd: string;
  practicalMd: string;
  exampleMd: string;
}) {
  return { ...opts, commands: [] as string[] };
}

export const goFundamentalsDays: DaySeed[] = [
  {
    dayNumber: 1,
    phaseSlug: "go-fundamentals",
    titleFa: "مدل حافظه، Stack و Heap",
    objectiveFa: "تفاوت stack/heap، escape analysis و رفتار GC را در سطح مصاحبه Mid/Senior توضیح دهید.",
    topicSlugs: ["go-memory-model", "go-stack-heap", "go-escape", "go-gc", "go-alloc"],
    lessons: [
      goLesson({
        slug: "memory-model-basics",
        topicSlug: "go-memory-model",
        titleFa: "Go memory model در یک نگاه",
        objectiveFa: "بدانید چه تضمین‌هایی دربارهٔ visibility بین goroutineها وجود دارد و چه چیزهایی تضمین نمی‌شود.",
        theoryMd: `## اهداف یادگیری
- مفهوم happens-before در Go
- تفاوت data race و race condition
- نقش \`sync\` و channel در برقراری happens-before

## توضیح مفهوم
Go memory model مشخص می‌کند چه زمانی نوشتن یک goroutine برای خواندن goroutine دیگر **قابل مشاهده** است. بدون synchronization صریح (channel، mutex، atomic، \`WaitGroup.Wait\` و ...)، کامپایلر و CPU می‌توانند reorder کنند.

## اشتباهات رایج
- فرض اینکه \`time.Sleep\` synchronization است
- خواندن/نوشتن shared variable بدون sync و اتکا به «احتمالاً درست کار می‌کند»
- اشتباه گرفتن data race (undefined behavior) با race منطقی کسب‌وکار

## سؤالات مصاحبه
1. چه عملی بین دو goroutine happens-before ایجاد می‌کند؟
2. چرا data race در Go همیشه با تست معمولی دیده نمی‌شود؟
3. \`go run -race\` چه چیزی را پیدا می‌کند و چه چیزی را نه؟`,
        practicalMd: `روی کاغذ یا در یادداشت آزمایشگاه، یک سناریوی دو goroutine بنویسید که بدون sync اشتباه باشد و نسخهٔ امن با channel یا mutex را کنارش بنویسید.`,
        exampleMd: `\`\`\`go
var a string
var done bool

func setup() {
  a = "hello"
  done = true // data race if read without sync
}

func main() {
  go setup()
  for !done { }
  print(a)
}
\`\`\`

نسخهٔ امن: ارسال روی channel یا استفاده از \`atomic\`/\`Mutex\`.`,
      }),
      goLesson({
        slug: "stack-heap-escape",
        topicSlug: "go-stack-heap",
        titleFa: "Stack در برابر Heap و Escape Analysis",
        objectiveFa: "پیش‌بینی کنید چه تخصیص‌هایی به heap می‌روند و چرا برای latency مهم است.",
        theoryMd: `## Stack vs Heap
- Stack: سریع، per-goroutine، عمر کوتاه با frameها
- Heap: GC-managed، برای داده‌هایی که از scope فراتر می‌روند

## Escape analysis
کامپایلر تصمیم می‌گیرد متغیر روی stack بماند یا به heap برود. دلایل رایج escape:
- برگرداندن pointer به متغیر محلی
- ذخیره در interface{}
- ارسال به goroutine جدا
- اندازهٔ خیلی بزرگ یا نامشخص

## GC
Go از concurrent mark-and-sweep استفاده می‌کند. هدف کاهش pause است نه حذف کامل هزینه. تخصیص زیاد → فشار GC.

## مصاحبه
- \`go build -gcflags="-m"\` چه می‌گوید؟
- چرا slice بزرگ ممکن است روی heap باشد؟
- تفاوت value receiver و pointer receiver از نظر escape؟`,
        practicalMd: `با \`go build -gcflags="-m"\` روی یک فایل کوچک escape را مشاهده کنید و نتیجه را در فایل یادداشت ثبت کنید.`,
        exampleMd: `\`\`\`go
func newInt() *int {
  x := 42
  return &x // x escapes to heap
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تحلیل escape یک تابع",
        topicSlug: "go-escape",
        lessonSlug: "stack-heap-escape",
        path: "/tmp/go-day1-escape.txt",
        mustContain: "escapes",
        instructionsMd: `یک تابع کوچک Go بنویسید که pointer برمی‌گرداند. با \`go build -gcflags="-m"\` خروجی را ببینید و در فایل مشخص‌شده بنویسید آیا متغیر escapes می‌کند یا نه (کلمهٔ escapes را ذکر کنید).`,
      }),
      noteExercise({
        titleFa: "تشخیص data race",
        topicSlug: "go-memory-model",
        lessonSlug: "memory-model-basics",
        path: "/tmp/go-day1-race.txt",
        mustContain: "race",
        instructionsMd: `یک مثال shared counter بدون mutex بنویسید و توضیح دهید چرا data race دارد. پاسخ را در فایل ذخیره کنید و واژهٔ race را بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Latency ناگهانی پس از deploy",
      path: "/tmp/go-day1-scenario.txt",
      mustContain: "allocation",
      incidentMd: "پس از deploy، p99 سرویس Go از 40ms به 180ms رسیده. CPU کمی بالاست و GC pause در متریک‌ها دیده می‌شود.",
      symptomsMd: "افزایش alloc/op در benchmark؛ heap رشد کرده؛ goroutine leak گزارش نشده.",
      rootCause: "افزایش allocation به خاطر ساخت مکرر []byte بزرگ در hot path بدون buffer pool",
    }),
    exam: {
      titleFa: "آزمون روز ۱ — حافظه و runtime",
      questions: [
        mc(
          "کدام مورد happens-before ایجاد می‌کند؟",
          ["time.Sleep بین دو goroutine", "ارسال و دریافت روی channel بدون بافر", "چاپ fmt.Println", "افزایش int معمولی"],
          "ارسال و دریافت روی channel بدون بافر",
          "Channel unbuffered هم synchronization و هم happens-before می‌دهد.",
          "go-memory-model",
        ),
        tf("هر متغیر محلی در Go همیشه روی stack است.", false, "Escape analysis ممکن است آن را به heap ببرد.", "go-stack-heap"),
        sa("پرچم کامپایلر برای دیدن escape analysis چیست؟", "go build -gcflags=-m", "خروجی compiler با -m چاپ می‌شود.", "go-escape"),
        mc(
          "هدف اصلی GC در Go چیست؟",
          ["حذف کامل pause", "کاهش pause با mark/sweep همزمان", "جلوگیری از هر allocation", "جایگزینی کامل با arena دستی"],
          "کاهش pause با mark/sweep همزمان",
          "Go GC concurrent است و pause را کم می‌کند نه صفر.",
          "go-gc",
        ),
      ],
    },
  },
  {
    dayNumber: 2,
    phaseSlug: "go-fundamentals",
    titleFa: "تایپ‌ها، ثابت‌ها و مجموعه‌ها",
    objectiveFa: "متغیر، ثابت، array، slice و map را دقیق و با جزئیات ظرفیت/طول توضیح دهید.",
    topicSlugs: ["go-types", "go-collections"],
    lessons: [
      goLesson({
        slug: "types-constants",
        topicSlug: "go-types",
        titleFa: "Variables, types, constants",
        objectiveFa: "zero value، typed/untyped constant و تبدیل تایپ را مسلط شوید.",
        theoryMd: `## نکات کلیدی
- هر تایپ zero value دارد (\`0\`, \`""\`, \`nil\`, \`false\`)
- ثابت‌های untyped انعطاف بیشتری در assign دارند
- تبدیل تایپ صریح است؛ برخلاف C تبدیل ضمنی گسترده نداریم
- \`:=\` فقط داخل تابع و با حداقل یک متغیر جدید

## اشتباهات
- فرض \`nil\` map قابل نوشتن است (panic)
- اشتباه گرفتن \`new\` و \`make\``,
        practicalMd: `برای int، string، pointer، slice و map مقدار zero value را بنویسید.`,
        exampleMd: `\`\`\`go
const Pi = 3.1415 // untyped
var n int
s := make([]int, 0, 8)
\`\`\``,
      }),
      goLesson({
        slug: "slices-maps",
        topicSlug: "go-collections",
        titleFa: "Arrays, slices, maps",
        objectiveFa: "رابطهٔ slice با array زیرین و هزینهٔ append/reallocate را بفهمید.",
        theoryMd: `## Slice
Header شامل pointer، len، cap است. append ممکن است آرایهٔ جدید بسازد.

## Map
Unordered است؛ iteration ترتیب ثابت ندارد. concurrent read/write بدون sync ممنوع است.

## مصاحبه
- چرا \`s = append(s, x)\` گاهی آرایهٔ جدید می‌سازد؟
- تفاوت \`len\` و \`cap\`؟
- چطور slice را بدون leak کردن آرایهٔ بزرگ کپی کنیم؟`,
        practicalMd: `یک slice با cap مشخص بسازید، append کنید تا reallocate رخ دهد و قبل/بعد pointer را مقایسه کنید.`,
        exampleMd: `\`\`\`go
a := [...]int{1,2,3}
s := a[:2]
s = append(s, 4) // may overwrite a[2] or allocate
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "پیاده‌سازی Set با map",
        topicSlug: "go-collections",
        lessonSlug: "slices-maps",
        path: "/tmp/go-day2-set.txt",
        mustContain: "map[string]struct{}",
        instructionsMd: `طراحی یک Set ساده برای string با map را توضیح دهید و تایپ پیشنهادی را در فایل بنویسید (باید شامل map[string]struct{} باشد).`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Panic روی map در production",
      path: "/tmp/go-day2-scenario.txt",
      mustContain: "nil map",
      incidentMd: "سرویس گاهی panic می‌کند: assignment to entry in nil map.",
      symptomsMd: "فقط روی pathهایی که config خالی است رخ می‌دهد.",
      rootCause: "map بدون make initialize شده (nil map)",
    }),
    exam: {
      titleFa: "آزمون روز ۲ — تایپ و مجموعه",
      questions: [
        tf("نوشتن روی nil map باعث panic می‌شود.", true, "باید make شود یا literal غیر nil.", "go-collections"),
        mc(
          "کدام zero value برای pointer است؟",
          ["0", "nil", "false", "empty struct"],
          "nil",
          "Pointer zero value برابر nil است.",
          "go-types",
        ),
        sa("سه فیلد header اسلایس را نام ببرید (انگلیسی).", "pointer len cap", "slice header: ptr, len, cap", "go-collections"),
      ],
    },
  },
  {
    dayNumber: 3,
    phaseSlug: "go-fundamentals",
    titleFa: "Pointer، Struct و Method",
    objectiveFa: "انتخاب value/pointer receiver و کپی شدن struct را درست انجام دهید.",
    topicSlugs: ["go-pointers", "go-structs"],
    lessons: [
      goLesson({
        slug: "pointers",
        topicSlug: "go-pointers",
        titleFa: "Pointers در Go",
        objectiveFa: "بدون arithmetic بودن pointer و الگوی اختیاری بودن را بفهمید.",
        theoryMd: `Go pointer arithmetic ندارد. \`&\` و \`*\` برای آدرس و dereference هستند. برای optional values اغلب از pointer به struct استفاده می‌شود.

## مصاحبه
- چرا Go pointer arithmetic ندارد؟
- تفاوت \`*T\` و \`T\` در API عمومی؟`,
        practicalMd: `تابعی بنویسید که فیلد یک struct را از طریق pointer عوض کند.`,
        exampleMd: `\`\`\`go
func bump(p *int) { *p++ }
\`\`\``,
      }),
      goLesson({
        slug: "structs-methods",
        topicSlug: "go-structs",
        titleFa: "Structs and methods",
        objectiveFa: "value receiver در برابر pointer receiver را انتخاب کنید.",
        theoryMd: `## قانون سرانگشتی
- نیاز به mutate یا struct بزرگ → pointer receiver
- immutable کوچک → value receiver
- consistency در همه methodهای تایپ مهم است

## اشتباهات
- فراموش کردن که method با value receiver روی کپی کار می‌کند`,
        practicalMd: `یک \`Counter\` با method \`Inc\` و \`Value\` طراحی کنید.`,
        exampleMd: `\`\`\`go
type Counter struct{ n int }
func (c *Counter) Inc() { c.n++ }
func (c Counter) Value() int { return c.n }
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی HTTP client قابل استفاده مجدد",
        topicSlug: "go-structs",
        lessonSlug: "structs-methods",
        path: "/tmp/go-day3-client.txt",
        mustContain: "http.Client",
        instructionsMd: `اسکلت یک HTTP client قابل استفاده مجدد با timeout و base URL را در یادداشت بنویسید و نشان دهید کجا از *http.Client استفاده می‌کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "باگ تغییر نکردن تنظیمات",
      path: "/tmp/go-day3-scenario.txt",
      mustContain: "value receiver",
      incidentMd: "متد SetTimeout روی Config صدا زده می‌شود ولی مقدار عوض نمی‌شود.",
      symptomsMd: "هیچ panic نیست؛ فقط مقدار قبلی می‌ماند.",
      rootCause: "method با value receiver روی کپی کار می‌کرد",
    }),
    exam: {
      titleFa: "آزمون روز ۳ — pointer و struct",
      questions: [
        tf("Go از pointer arithmetic پشتیبانی می‌کند.", false, "عمداً برای ایمنی حذف شده.", "go-pointers"),
        mc(
          "برای mutate فیلد struct کدام receiver مناسب‌تر است؟",
          ["value", "pointer", "interface", "channel"],
          "pointer",
          "Pointer receiver روی همان instance کار می‌کند.",
          "go-structs",
        ),
      ],
    },
  },
  {
    dayNumber: 4,
    phaseSlug: "go-fundamentals",
    titleFa: "Interface، Composition و Embedding",
    objectiveFa: "رابطه‌های کوچک، composition و embedding را در طراحی API به‌کار ببرید.",
    topicSlugs: ["go-interfaces", "go-embedding"],
    lessons: [
      goLesson({
        slug: "interfaces",
        topicSlug: "go-interfaces",
        titleFa: "Interfaces and composition",
        objectiveFa: "accept interfaces, return structs را در عمل اعمال کنید.",
        theoryMd: `Interface در Go ضمنی satisfy می‌شود. رابطه‌های کوچک (\`io.Reader\`) ترکیب‌پذیرند.

## دام‌ها
- \`var x I = (*T)(nil)\` غیر nil interface با nil dynamic value
- interface{} بیش از حد`,
        practicalMd: `یک interface \`Store\` با \`Get/Put\` تعریف کنید و دو پیاده‌سازی فرضی نام ببرید.`,
        exampleMd: `\`\`\`go
type Reader interface{ Read(p []byte) (int, error) }
\`\`\``,
      }),
      goLesson({
        slug: "embedding",
        topicSlug: "go-embedding",
        titleFa: "Embedding",
        objectiveFa: "promoted methods و تداخل نام را بفهمید.",
        theoryMd: `Embedding برای composition است نه inheritance کلاسیک. Field/method promote می‌شوند مگر override شوند.`,
        practicalMd: `مثالی از embedding \`sync.Mutex\` داخل struct بنویسید.`,
        exampleMd: `\`\`\`go
type SafeMap struct {
  sync.Mutex
  m map[string]string
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "بازآرایی کد ضعیف با interface",
        topicSlug: "go-interfaces",
        lessonSlug: "interfaces",
        path: "/tmp/go-day4-refactor.txt",
        mustContain: "interface",
        instructionsMd: `یک سرویس که مستقیم به *sql.DB وابسته است را طوری بازطراحی کنید که به interface وابسته شود. طرح را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Nil interface در لاگ خطا",
      path: "/tmp/go-day4-scenario.txt",
      mustContain: "typed nil",
      incidentMd: "چک \`if err != nil\` همیشه true است حتی وقتی خطا نیست.",
      symptomsMd: "تابع error را از *MyError برمی‌گرداند که گاهی nil pointer است.",
      rootCause: "typed nil داخل interface غیر nil است",
    }),
    exam: {
      titleFa: "آزمون روز ۴ — interface",
      questions: [
        tf("در Go باید صریحاً implement کردن interface را اعلام کرد.", false, "Satisfy ضمنی است.", "go-interfaces"),
        sa("اصل رایج API گو را به انگلیسی بنویسید: accept ?, return ?", "accept interfaces return structs", "Accept interfaces, return structs", "go-interfaces"),
      ],
    },
  },
  {
    dayNumber: 5,
    phaseSlug: "go-fundamentals",
    titleFa: "Error handling و Defer/Panic/Recover",
    objectiveFa: "خطاها را wrap کنید و panic را فقط برای باگ‌های برنامه‌نویس نگه دارید.",
    topicSlugs: ["go-errors", "go-defer-panic"],
    lessons: [
      goLesson({
        slug: "errors",
        topicSlug: "go-errors",
        titleFa: "Error handling",
        objectiveFa: "errors.Is/As و wrap با %w را درست استفاده کنید.",
        theoryMd: `خطاها value هستند. برای sentinel از \`errors.Is\` و برای تایپ از \`errors.As\` استفاده کنید. Wrap با \`fmt.Errorf("...: %w", err)\`.

## اشتباهات
- مقایسهٔ \`==\` مستقیم با wrapped error
- بلعیدن خطا بدون context`,
        practicalMd: `یک خطای سفارشی \`ValidationError\` طراحی کنید.`,
        exampleMd: `\`\`\`go
if errors.Is(err, fs.ErrNotExist) { ... }
\`\`\``,
      }),
      goLesson({
        slug: "defer-panic",
        topicSlug: "go-defer-panic",
        titleFa: "Defer, Panic, Recover",
        objectiveFa: "مرز recover در middleware/server را بدانید.",
        theoryMd: `Defer LIFO اجرا می‌شود. Panic برای موقعیت‌های غیرقابل ادامهٔ برنامه‌نویس است نه کنترل جریان عادی. Recover فقط در defer همان goroutine کار می‌کند.`,
        practicalMd: `توضیح دهید چرا recover در goroutine فرزند، parent را نجات نمی‌دهد.`,
        exampleMd: `\`\`\`go
defer func(){ if r := recover(); r != nil { log.Println(r) } }()
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "Custom error types",
        topicSlug: "go-errors",
        lessonSlug: "errors",
        path: "/tmp/go-day5-errors.txt",
        mustContain: "errors.As",
        instructionsMd: `یک خطای دامنه با فیلد Code بسازید و نشان دهید چطور با errors.As استخراج می‌شود. یادداشت را در فایل بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Panic در worker pool",
      path: "/tmp/go-day5-scenario.txt",
      mustContain: "recover",
      incidentMd: "یک panic در worker کل process را نمی‌کشد ولی jobها گیر می‌کنند.",
      symptomsMd: "channel پر می‌ماند؛ watcher restart نمی‌کند.",
      rootCause: "نبود recover/defer در worker و عدم سیگنال failure به supervisor",
    }),
    exam: {
      titleFa: "آزمون روز ۵ — خطا و panic",
      questions: [
        mc(
          "برای بررسی wrapped sentinel کدام درست است؟",
          ["err == sentinel", "errors.Is(err, sentinel)", "strings.Contains", "panic(err)"],
          "errors.Is(err, sentinel)",
          "errors.Is زنجیره wrap را طی می‌کند.",
          "go-errors",
        ),
        tf("recover در هر جایی از call stack بدون defer کار می‌کند.", false, "فقط داخل defer همان goroutine.", "go-defer-panic"),
      ],
    },
  },
  {
    dayNumber: 6,
    phaseSlug: "go-fundamentals",
    titleFa: "Generics، Package و Module",
    objectiveFa: "genericهای کاربردی بنویسید و مرز module/package را رعایت کنید.",
    topicSlugs: ["go-generics", "go-packages"],
    lessons: [
      goLesson({
        slug: "generics",
        topicSlug: "go-generics",
        titleFa: "Generics",
        objectiveFa: "constraintها و زمان استفاده/عدم استفاده از generic را بدانید.",
        theoryMd: `از Go 1.18 generic داریم. برای container/algorithmهای type-safe مفید است. برای هر API عجله نکنید؛ گاهی interface ساده‌تر است.`,
        practicalMd: `یک تابع \`Max[T cmp.Ordered](a, b T) T\` بنویسید.`,
        exampleMd: `\`\`\`go
func Map[T any, R any](in []T, f func(T) R) []R { ... }
\`\`\``,
      }),
      goLesson({
        slug: "packages-modules",
        topicSlug: "go-packages",
        titleFa: "Packages and modules",
        objectiveFa: "internal/، go.mod و نسخهٔ semver را توضیح دهید.",
        theoryMd: `Module path در go.mod هویت import است. پکیج \`internal\` فقط برای والد و زیرمجموعه‌ها قابل import است. Breaking change → major version (/v2).`,
        practicalMd: `ساختار پیشنهادی برای سرویس کوچک: cmd/، internal/، pkg/ را بنویسید.`,
        exampleMd: `\`\`\`text
module github.com/acme/payments
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "Generic data structure",
        topicSlug: "go-generics",
        lessonSlug: "generics",
        path: "/tmp/go-day6-stack.txt",
        mustContain: "type Stack[T any]",
        instructionsMd: `اسکلت یک Stack جنریک با Push/Pop را در فایل بنویسید (باید type Stack[T any] داشته باشد).`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Import cycle در مونو‌ریپو",
      path: "/tmp/go-day6-scenario.txt",
      mustContain: "import cycle",
      incidentMd: "بیلد با import cycle شکست می‌خورد بین package service و repository.",
      symptomsMd: "هر دو به تایپ‌های هم وابسته‌اند.",
      rootCause: "نبود لایهٔ domain مشترک و وابستگی دوطرفه",
    }),
    exam: {
      titleFa: "آزمون روز ۶ — generics و module",
      questions: [
        tf("هر API عمومی بهتر است generic باشد.", false, "فقط وقتی ارزش type-safety و reuse دارد.", "go-generics"),
        sa("پوشه‌ای که import از بیرون module را محدود می‌کند؟", "internal", "internal packages", "go-packages"),
      ],
    },
  },
  {
    dayNumber: 7,
    phaseSlug: "go-fundamentals",
    titleFa: "Reflection و محدودیت‌ها",
    objectiveFa: "reflect را فقط وقتی لازم است به‌کار ببرید و هزینهٔ آن را بشناسید.",
    topicSlugs: ["go-reflection"],
    lessons: [
      goLesson({
        slug: "reflection",
        topicSlug: "go-reflection",
        titleFa: "Reflection",
        objectiveFa: "Value/Type و موارد استفادهٔ serialization را بفهمید.",
        theoryMd: `\`reflect\` برای کتابخانه‌هایی مثل encoding/json ضروری است ولی در business logic معمولاً بوی طراحی بد می‌دهد. کندتر و سخت‌تر برای optimize است.`,
        practicalMd: `توضیح دهید json.Unmarshal چگونه از tagهای struct استفاده می‌کند.`,
        exampleMd: `\`\`\`go
t := reflect.TypeOf(x)
v := reflect.ValueOf(x)
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "جایگزین بدون reflect",
        topicSlug: "go-reflection",
        lessonSlug: "reflection",
        path: "/tmp/go-day7-reflect.txt",
        mustContain: "codegen",
        instructionsMd: `یک مورد که تیم به reflect متوسل شده را با codegen یا interface جایگزین کنید و واژهٔ codegen را در پاسخ بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "CPU داغ در serializer سفارشی",
      path: "/tmp/go-day7-scenario.txt",
      mustContain: "reflect",
      incidentMd: "سرویس CPU بالا دارد؛ profile نشان می‌دهد hotspot در reflect.Value.Interface است.",
      symptomsMd: "هر request صدها allocation از reflection.",
      rootCause: "serialization دستی با reflect در hot path",
    }),
    exam: {
      titleFa: "آزمون روز ۷ — reflection",
      questions: [
        tf("استفاده از reflect در hot path معمولاً ارزان است.", false, "هزینهٔ runtime و allocation دارد.", "go-reflection"),
        mc(
          "کدام پکیج استاندارد به شدت به reflect وابسته است؟",
          ["fmt فقط", "encoding/json", "math", "os"],
          "encoding/json",
          "json از tag و reflect استفاده می‌کند.",
          "go-reflection",
        ),
      ],
    },
  },
  {
    dayNumber: 8,
    phaseSlug: "go-fundamentals",
    titleFa: "جمع‌بندی Module 1 و تمرین یکپارچه",
    objectiveFa: "مفاهیم Module 1 را در یک تمرین طراحی کوچک جمع کنید.",
    topicSlugs: ["go-structs", "go-errors", "go-interfaces", "go-alloc"],
    lessons: [
      goLesson({
        slug: "module1-capstone",
        topicSlug: "go-interfaces",
        titleFa: "طراحی کلاینت HTTP تمیز",
        objectiveFa: "ساختاری با timeout، error wrapping و interface تست‌پذیر پیشنهاد دهید.",
        theoryMd: `## پروژهٔ کوچک
یک HTTP client قابل استفاده مجدد با:
- \`context.Context\`
- timeout پیش‌فرض
- errorهای دامنه
- interface برای transport در تست

## چک‌لیست مصاحبه
- zero values امن؟
- escape در hot path؟
- interface کوچک؟
- wrap خطا؟`,
        practicalMd: `اسکلت پکیج را در یادداشت بنویسید: types، client، errors.`,
        exampleMd: `\`\`\`go
type Doer interface {
  Do(req *http.Request) (*http.Response, error)
}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی کلاینت و خطای دامنه",
        topicSlug: "go-errors",
        lessonSlug: "module1-capstone",
        path: "/tmp/go-day8-client.txt",
        mustContain: "context.Context",
        instructionsMd: `API عمومی کلاینت را طوری بنویسید که context.Context بگیرد و خطاها wrap شوند. طرح را در فایل ثبت کنید.`,
        difficulty: "hard",
        maxScore: 20,
      }),
      noteExercise({
        titleFa: "تحلیل تخصیص در hot path",
        topicSlug: "go-alloc",
        lessonSlug: "module1-capstone",
        path: "/tmp/go-day8-alloc.txt",
        mustContain: "alloc",
        instructionsMd: `سه منبع رایج allocation در HTTP client را لیست کنید و یک راهکار کاهش (pool/buffer) پیشنهاد دهید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Timeoutهای پراکنده در downstream",
      path: "/tmp/go-day8-scenario.txt",
      mustContain: "context",
      incidentMd: "فراخوانی‌های وابسته گاهی دقیقه‌ها hang می‌مانند.",
      symptomsMd: "goroutineها در net/http منتظر می‌مانند؛ deadline مشترک نیست.",
      rootCause: "عدم عبور context و timeout یکپارچه به downstream",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون پایانی Module 1",
      questions: [
        mc(
          "کدام ترکیب برای کلاینت production بهتر است؟",
          ["بدون context و global http.DefaultClient", "context + timeout + client اختصاصی", "panic روی هر خطا", "فقط reflect برای encode"],
          "context + timeout + client اختصاصی",
          "DefaultClient و نبود deadline در production خطرناک است.",
          "go-interfaces",
        ),
        tf("Module 1 فقط syntax پایه است و برای مصاحبه Senior کافی نیست.", false, "جزئیات memory/interface/error دقیقاً سؤال Senior هستند.", "go-memory-model"),
        sa("برای کاهش allocation مکرر []byte چه الگویی رایج است؟", "sync.Pool", "buffer pool / sync.Pool", "go-alloc"),
        tf("Wrapping خطا با %w به errors.Is کمک می‌کند.", true, "%w زنجیره را حفظ می‌کند.", "go-errors"),
      ],
    },
  },
];
