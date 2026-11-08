import { day, goLab, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

/**
 * Module 2 — Concurrency. Every day ends in a real lab run with -race.
 * Order: goroutines → channels → select/timers → memory model & locks →
 * context → advanced primitives → production patterns.
 */
export const goConcurrencyDays: DaySeed[] = [
  day({
    dayNumber: 10,
    phaseSlug: "go-concurrency",
    titleFa: "Goroutine، چرخهٔ عمر و leak",
    objectiveFa: "هر goroutine که می‌سازید باید مسیر خروج مشخص داشته باشد؛ leak را تشخیص دهید و رفع کنید.",
    topicSlugs: ["go-goroutines", "go-patterns"],
    lessons: [
      goLesson({
        slug: "goroutine-fundamentals",
        topicSlug: "go-goroutines",
        titleFa: "Goroutine: ارزان ولی نه رایگان",
        objectiveFa: "هزینهٔ goroutine، رفتار panic و قانون «چه کسی آن را متوقف می‌کند؟» را بدانید.",
        theoryMd: `## مفهوم
- \`go f()\` یک goroutine می‌سازد: stack اولیهٔ ۲KB و قابل رشد، که scheduler روی threadها multiplex می‌کند (روز Runtime).
- ارزان است، پس می‌شود میلیون‌ها ساخت. ولی **هر goroutine حافظه، جا در scheduler و معمولاً یک connection یا buffer نگه می‌دارد.**
- \`main\` منتظر goroutineها نمی‌ماند. با برگشت main همه بدون اجرای defer کشته می‌شوند.

## قانون طلایی
> قبل از نوشتن \`go\`، جواب بدهید: **این goroutine کی و چطور تمام می‌شود و چه کسی منتظرش است؟**

## Panic
**panic بدون recover در هر goroutine، کل برنامه را می‌کشد**، نه فقط آن goroutine. recover سراسری وجود ندارد. هر goroutine که کد غیرقابل اعتماد اجرا می‌کند (پلاگین، callback، کار background در handler) recover خودش را لازم دارد و باید خطا را به جایی گزارش دهد.

## Leak
goroutine که برای همیشه روی channel، lock یا I/O بدون timeout منتظر بماند هرگز جمع نمی‌شود. GC goroutine block‌شده را آزاد نمی‌کند.

علت‌های رایج:
1. send روی channel که دیگر کسی از آن نمی‌خواند (مثلاً caller بعد از timeout رفته)
2. خواندن از channel که هرگز close نمی‌شود
3. I/O بدون deadline
4. \`time.Ticker\` که Stop نشده و goroutineای که رویش range می‌زند

## تشخیص
- متریک \`go_goroutines\` در Prometheus: رشد یکنواخت یعنی leak.
- \`/debug/pprof/goroutine?debug=2\` stackها را گروه‌بندی‌شده نشان می‌دهد.
- در تست: \`go.uber.org/goleak\`.

## سؤال مصاحبه
**«سرویس بعد از هر timeout downstream حافظه‌اش کمی بالا می‌رود و پایین نمی‌آید. حدس اول؟»**
پاسخ: goroutineای که نتیجه را روی channel بدون buffer می‌فرستد ولی caller بعد از timeout رفته است. sender برای همیشه block می‌ماند. راه‌حل: channel با buffer یک یا select روی \`ctx.Done()\` در sender.`,
        practicalMd: `قبل از لب، کد \`FirstResult\` را بخوانید و روی کاغذ بشمارید با سه fetcher و یک برنده، چند goroutine تا ابد block می‌مانند.`,
        exampleMd: `~~~go
// leak: اگر select زودتر با timeout برگردد، این send هرگز گیرنده ندارد
ch := make(chan Result)
go func() { ch <- slowCall() }()

// امن: buffer به اندازهٔ تعداد senderها
ch := make(chan Result, 1)
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "goroutine-leak",
        titleFa: "لب: FirstResult بدون leak",
        topicSlug: "go-goroutines",
        lessonSlug: "goroutine-fundamentals",
        instructionsMd: `\`FirstResult\` هم‌زمان از چند replica می‌پرسد و اولین جواب موفق را برمی‌گرداند (الگوی hedged request). این تابع در production goroutine نشت می‌دهد و وقتی همهٔ replicaها خطا بدهند، تا پایان timeout معطل می‌ماند.

چهار شرط در توضیح تابع آمده است. همه را برآورده کنید. سؤال مصاحبه: چرا cancel کردن ctx به تنهایی leak را رفع نمی‌کند؟`,
        hints: [
          "دو مشکل جدا داریم: (۱) senderهایی که دیر می‌رسند کسی را برای دریافت ندارند؛ (۲) fetcherهای کند هرگز نمی‌فهمند کار تمام شده.",
          "channel نتایج را با buffer به اندازهٔ len(fetchers) بسازید و هم موفقیت و هم خطا را بفرستید. یک ctx فرزند با WithCancel بسازید و defer cancel() کنید.",
          "در حلقه‌ای به تعداد fetcherها از channel بخوانید: اولین موفقیت را return کنید، خطاها را جمع کنید، و در پایان fmt.Errorf(\"%w: %w\", ErrAllFailed, errors.Join(errs...)) برگردانید. select روی ctx.Done() را هم نگه دارید.",
        ],
        race: true,
      }),
    ],
    scenario: noteScenario({
      titleFa: "رشد بی‌نهایت goroutine پس از کمپین",
      path: "/tmp/go-day10-scenario.txt",
      mustContain: "leak",
      incidentMd: "پس از کمپین تخفیف، RAM سرویس به ۸GB رسیده و متریک go_goroutines از ۲ هزار به ۴۰۰ هزار رسیده و پایین نمی‌آید.",
      symptomsMd: "pprof goroutine نشان می‌دهد ۳۹۰ هزار goroutine در chan send داخل تابع fetchPrice منتظرند.",
      rootCause: "fetchPrice نتیجه را روی channel بدون buffer می‌فرستد ولی handler بعد از timeout برگشته؛ هیچ گیرنده‌ای نیست",
    }),
    exam: {
      titleFa: "آزمون — Goroutine",
      questions: [
        mc(
          "panic بدون recover در یک goroutine فرزند چه می‌کند؟",
          ["فقط همان goroutine متوقف می‌شود", "کل process خاتمه می‌یابد", "به main منتقل و آنجا قابل recover است", "نادیده گرفته می‌شود"],
          "کل process خاتمه می‌یابد",
          "panic unrecovered در هر goroutine برنامه را با stack trace می‌کشد؛ recover سراسری وجود ندارد.",
          "go-goroutines",
        ),
        tf("GC goroutineهایی را که برای همیشه روی channel block شده‌اند جمع می‌کند.", false, "goroutine block‌شده زنده است و هرگز جمع نمی‌شود.", "go-goroutines"),
        mc(
          "نشانهٔ رایج goroutine leak در مانیتورینگ؟",
          ["کاهش CPU", "رشد یکنواخت go_goroutines بدون بازگشت", "کاهش heap", "افزایش زمان build"],
          "رشد یکنواخت go_goroutines بدون بازگشت",
          "goroutineهای block‌شده جمع می‌شوند و پایین نمی‌آیند.",
          "go-patterns",
        ),
        sa("کدام endpoint stackهای همهٔ goroutineها را نشان می‌دهد؟", "/debug/pprof/goroutine", "با ?debug=2 کامل.", "go-goroutines"),
        tf("با برگشت main، deferهای goroutineهای دیگر اجرا می‌شوند.", false, "process خاتمه می‌یابد و defer آن‌ها اجرا نمی‌شود.", "go-goroutines"),
      ],
    },
  }),

  day({
    dayNumber: 11,
    phaseSlug: "go-concurrency",
    titleFa: "Channel — buffered، unbuffered، close و ownership",
    objectiveFa: "معنای synchronization در channel، قوانین close و nil channel را دقیق توضیح دهید.",
    topicSlugs: ["go-channels"],
    lessons: [
      goLesson({
        slug: "channels-sync",
        topicSlug: "go-channels",
        titleFa: "Channel: ارتباط و هماهنگی",
        objectiveFa: "جدول رفتار channel در حالت‌های nil، باز و بسته را از حفظ بدانید.",
        theoryMd: `## مفهوم
- **Unbuffered:** send تا رسیدن receiver منتظر می‌ماند (rendezvous). تحویل قطعی و happens-before صریح.
- **Buffered:** send تا پر شدن buffer منتظر نمی‌ماند. نرخ تولید و مصرف را decouple می‌کند ولی **backpressure را پنهان می‌کند**.
- channel درون خود یک mutex و صف دارد (\`hchan\`)؛ جادو نیست و برای counter ساده از mutex کندتر است.

## جدول طلایی (حفظ کنید)
| عملیات | nil | باز | بسته |
|---|---|---|---|
| send | block تا ابد | block یا موفق | **panic** |
| receive | block تا ابد | block یا مقدار | zero value و \`ok=false\` (بعد از خالی شدن buffer) |
| close | **panic** | موفق | **panic** |

## Ownership
- **فقط sender (مالک) close می‌کند**، آن هم فقط وقتی receiver باید بفهمد «دیگر چیزی نمی‌آید» (\`range\`). close برای آزاد کردن حافظه لازم نیست.
- با چند sender: یک WaitGroup و یک goroutine جدا که بعد از \`wg.Wait()\` close کند.
- channel در signature را جهت‌دار کنید: \`<-chan T\` برای مصرف‌کننده و \`chan<- T\` برای تولیدکننده. کامپایلر سوءاستفاده را می‌گیرد.

## close به‌عنوان broadcast
\`close(done)\` همهٔ receiverها را هم‌زمان آزاد می‌کند. \`ctx.Done()\` دقیقاً همین است.

## سؤال مصاحبه
**«چرا buffer بزرگ (مثلاً ۱۰ هزار) راه‌حل کندی consumer نیست؟»**
پاسخ: فقط زمان رسیدن به مشکل را عقب می‌اندازد، حافظه مصرف می‌کند و با crash آن پیام‌ها گم می‌شوند. کندی باید به producer منتقل شود (backpressure) یا consumer مقیاس بگیرد.`,
        practicalMd: `pipeline سه‌مرحله‌ای generate، square و print بنویسید که هر مرحله channel خروجی‌اش را خودش close کند.`,
        exampleMd: `~~~go
func merge(cs ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	for _, c := range cs {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			for v := range c {
				out <- v
			}
		}(c)
	}
	go func() { wg.Wait(); close(out) }() // یک close، بعد از آخرین sender
	return out
}
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تشخیص deadlock در pipeline",
        topicSlug: "go-channels",
        lessonSlug: "channels-sync",
        path: "/tmp/go-day11-deadlock.txt",
        mustContain: "close",
        instructionsMd: `در ترمینال لب برنامه‌ای بنویسید که دو producer روی یک channel می‌فرستند و consumer با range می‌خواند ولی هیچ‌کس close نمی‌کند. اجرا کنید، پیام runtime را در فایل کپی و علت و الگوی درست close را توضیح دهید.`,
        answerOutlineFa:
          "پیام: fatal error: all goroutines are asleep - deadlock! — range منتظر close است. الگو: WaitGroup روی producerها و یک goroutine که بعد از wg.Wait() تنها یک بار close کند.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "panic: send on closed channel در shutdown",
      path: "/tmp/go-day11-scenario.txt",
      mustContain: "owner",
      incidentMd: "در هر deploy چند pod با panic: send on closed channel خاتمه می‌یابند.",
      symptomsMd: "تابع Stop کانال jobs را close می‌کند در حالی که handlerهای HTTP هنوز روی آن send می‌کنند.",
      rootCause: "طرف receiver یا ناظر channel را close کرد در حالی که senderها هنوز فعال بودند؛ ownership رعایت نشده بود (owner باید close کند، یا shutdown با ctx اعلام شود)",
    }),
    exam: {
      titleFa: "آزمون — Channel",
      questions: [
        tf("ارسال روی channel بسته همیشه panic می‌کند، حتی داخل select با default.", true, "default فقط وقتی انتخاب می‌شود که هیچ case آماده نباشد؛ send روی channel بسته «آماده» است و panic می‌کند.", "go-channels"),
        mc(
          "receive از nil channel چه می‌کند؟",
          ["panic فوری", "برای همیشه block می‌شود", "zero value برمی‌گرداند", "خطای کامپایل"],
          "برای همیشه block می‌شود",
          "send و receive روی nil channel همیشه block هستند.",
          "go-channels",
        ),
        mc(
          "receive از channel بسته و خالی؟",
          ["panic", "block", "zero value و ok=false", "آخرین مقدار ارسالی"],
          "zero value و ok=false",
          "range روی آن تمام می‌شود.",
          "go-channels",
        ),
        sa("چه کسی باید channel را close کند؟", "sender", "مالک یا تولیدکننده؛ هرگز receiver.", "go-channels"),
        tf("برای آزاد شدن حافظه باید همیشه channel را close کرد.", false, "GC channel بدون ارجاع را جمع می‌کند؛ close فقط سیگنال «تمام شد» است.", "go-channels"),
      ],
    },
  }),

  day({
    dayNumber: 12,
    phaseSlug: "go-concurrency",
    titleFa: "Select، timeout و timerها",
    objectiveFa: "select را برای timeout، cancel و multiplexing به‌کار ببرید و دام‌های timer را بشناسید.",
    topicSlugs: ["go-select", "go-patterns"],
    lessons: [
      goLesson({
        slug: "select-basics",
        topicSlug: "go-select",
        titleFa: "Select و timerها",
        objectiveFa: "رفتار انتخاب تصادفی، default، nil channel و Timer و Ticker را بدانید.",
        theoryMd: `## مفهوم
- \`select\` منتظر اولین case آماده می‌ماند. اگر چند case هم‌زمان آماده باشند، **تصادفی** یکی انتخاب می‌شود (اولویت وجود ندارد).
- \`default\` select را non-blocking می‌کند.
- **case روی nil channel هرگز انتخاب نمی‌شود.** با nil کردن یک channel می‌توان آن case را در حلقه غیرفعال کرد (مثلاً بعد از close شدن ورودی).
- select خالی (\`select {}\`) برای همیشه block می‌شود.

## Timer و Ticker
- \`time.After(d)\` یک channel برمی‌گرداند. ساده است ولی در هر بار اجرا timer جدید می‌سازد.
- **قبل از Go 1.23** timer ساخته‌شده با \`time.After\` تا موعدش جمع نمی‌شد. در حلقهٔ داغ با timeout طولانی، میلیون‌ها timer زنده انباشته می‌شد. از 1.23 timerهای بی‌ارجاع حتی بدون Stop جمع می‌شوند، ولی نسخهٔ Go سرویس‌ها همیشه جدید نیست.
- **الگوی امن در حلقه:** یک \`time.NewTimer\` و \`Reset\` در هر دور، یا بهتر، \`context.WithTimeout\`.
- \`time.NewTicker\` برای کار **دوره‌ای** است، نه timeout. حتماً \`defer t.Stop()\`.

## اولویت دادن
چون انتخاب تصادفی است، برای اولویت دادن به cancel قبل از کار، اول یک select non-blocking روی \`ctx.Done()\` بزنید.

## اشتباهات رایج
- \`for { select { ... default: } }\` بدون block ← busy loop با CPU صددرصد.
- \`break\` داخل select فقط از select خارج می‌شود، نه از for. از label یا return استفاده کنید.

## سؤال مصاحبه
**«چطور یک case را موقتاً در for-select غیرفعال می‌کنید؟»**
پاسخ: channel آن case را nil می‌کنیم.`,
        practicalMd: `حلقه‌ای بنویسید که دو channel ورودی را merge کند و وقتی هر دو بسته شدند خارج شود (با تکنیک nil کردن).`,
        exampleMd: `~~~go
for a != nil || b != nil {
	select {
	case v, ok := <-a:
		if !ok { a = nil; continue }
		out <- v
	case v, ok := <-b:
		if !ok { b = nil; continue }
		out <- v
	case <-ctx.Done():
		return ctx.Err()
	}
}
~~~`,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "busy loop در polling",
        topicSlug: "go-select",
        lessonSlug: "select-basics",
        path: "/tmp/go-day12-select.txt",
        mustContain: "select",
        instructionsMd: `کد زیر CPU را صددرصد می‌کند. توضیح دهید چرا و نسخهٔ درست را با ticker و ctx.Done در select بنویسید.

~~~go
for {
	select {
	case job := <-jobs:
		handle(job)
	default:
		// چیزی نیست
	}
}
~~~`,
        answerOutlineFa: "default باعث می‌شود select هیچ‌وقت block نشود؛ حلقه بی‌وقفه می‌چرخد. نسخهٔ درست default را حذف می‌کند و case <-ctx.Done() اضافه می‌کند؛ اگر polling لازم است، case <-ticker.C با defer ticker.Stop().",
      }),
    ],
    scenario: noteScenario({
      titleFa: "CPU صددرصد از busy select",
      path: "/tmp/go-day12-scenario.txt",
      mustContain: "default",
      incidentMd: "پس از افزودن polling برای کانفیگ، یک pod همیشه یک هستهٔ کامل CPU مصرف می‌کند.",
      symptomsMd: "flame graph: runtime.selectnbrecv در بالای لیست.",
      rootCause: "non-blocking select با default در حلقهٔ تنگ بدون block روی رویداد یا ticker",
    }),
    exam: {
      titleFa: "آزمون — Select",
      questions: [
        tf("اگر چند case در select هم‌زمان آماده باشند، اولین case نوشته‌شده انتخاب می‌شود.", false, "انتخاب تصادفی یکنواخت است.", "go-select"),
        mc(
          "برای غیرفعال کردن موقت یک case در for-select؟",
          ["close کردن channel", "nil کردن متغیر channel", "panic", "GOMAXPROCS=1"],
          "nil کردن متغیر channel",
          "case روی nil channel هرگز آماده نمی‌شود.",
          "go-select",
        ),
        mc(
          "timeout تکرارشونده داخل حلقهٔ داغ در Go قدیمی‌تر از 1.23؟",
          ["time.After در هر دور", "یک time.NewTimer با Reset", "time.Sleep", "time.NewTicker"],
          "یک time.NewTimer با Reset",
          "time.After در هر دور timer جدیدی می‌سازد که تا موعدش جمع نمی‌شد. Ticker برای کار دوره‌ای است نه timeout.",
          "go-select",
        ),
        tf("break داخل select حلقهٔ for بیرونی را هم می‌شکند.", false, "فقط select؛ از label استفاده کنید.", "go-select"),
      ],
    },
  }),

  day({
    dayNumber: 13,
    phaseSlug: "go-concurrency",
    titleFa: "Memory model، Mutex و atomic",
    objectiveFa: "happens-before را توضیح دهید، data race را با -race پیدا کنید و بین mutex، RWMutex و atomic درست انتخاب کنید.",
    topicSlugs: ["go-memory-model", "go-sync"],
    lessons: [
      goLesson({
        slug: "memory-model-basics",
        topicSlug: "go-memory-model",
        titleFa: "Go memory model و data race",
        objectiveFa: "بدانید چه چیزی visibility بین goroutineها را تضمین می‌کند و چه چیزی نه.",
        theoryMd: `## مفهوم
Go memory model تعیین می‌کند نوشتن یک goroutine **کی** برای goroutine دیگر قابل مشاهده است. بدون synchronization، کامپایلر و CPU می‌توانند دستورها را reorder کنند و مقدار در cache یک هسته بماند.

## چه چیزهایی happens-before می‌سازند
- send روی channel قبل از receive متناظرش
- close قبل از receiveای که zero value به خاطر close می‌گیرد
- \`Unlock\` قبل از \`Lock\` بعدی
- \`wg.Done\` قبل از برگشت \`wg.Wait\`
- \`once.Do(f)\`: اجرای f قبل از برگشت هر Do
- عملیات \`sync/atomic\` (از Go 1.19 رسماً sequentially consistent)

## چه چیزهایی **نمی‌سازند**
\`time.Sleep\`، «احتمالاً تا الان نوشته شده»، و چاپ با \`fmt\`.

## Data race در برابر race condition
- **Data race:** دسترسی هم‌زمان به یک حافظه که حداقل یکی نوشتن است و sync ندارد. رفتارش undefined است و ممکن است مقدار نیمه‌نوشته (torn) دیده شود. \`-race\` آن را می‌گیرد.
- **Race condition:** باگ منطقی ترتیب (check-then-act). حتی با mutex روی هر عملیات جدا ممکن است رخ دهد. \`-race\` آن را نمی‌گیرد.

## Race detector
- \`go test -race\` و \`go run -race\`، با هزینهٔ حدود ۵ تا ۱۰ برابر حافظه و ۲ تا ۲۰ برابر CPU.
- **فقط raceهایی را می‌گیرد که در اجرا واقعاً رخ دهند.** پس تست باید هم‌زمانی واقعی بسازد.
- در CI همیشه روشن، در production خاموش.`,
        practicalMd: `در لب امروز اول \`go test\` بدون -race و بعد با -race اجرا کنید و تفاوت خروجی را ببینید.`,
        exampleMd: `~~~go
var ready bool
var data string

go func() { data = "x"; ready = true }()
for !ready {} // data race؛ ممکن است حلقه هرگز تمام نشود یا data خالی دیده شود
fmt.Println(data)
~~~`,
      }),
      goLesson({
        slug: "waitgroup-mutex",
        topicSlug: "go-sync",
        titleFa: "Mutex، RWMutex، atomic و WaitGroup",
        objectiveFa: "برای هر حالت ابزار درست را انتخاب و invariant را محافظت کنید.",
        theoryMd: `## انتخاب ابزار
| نیاز | ابزار |
|---|---|
| یک counter یا flag تکی | \`atomic.Int64\` / \`atomic.Bool\` |
| چند فیلد که باید با هم سازگار باشند (invariant) | \`sync.Mutex\` |
| خواندن بسیار زیاد، نوشتن کم، critical section نسبتاً طولانی | \`sync.RWMutex\` |
| انتقال مالکیت داده یا pipeline | channel |
| منتظر ماندن برای یک دسته goroutine | \`sync.WaitGroup\` (یا errgroup) |

## نکات Senior
- **RWMutex همیشه سریع‌تر نیست.** برای critical section کوتاه، overhead خودش از Mutex بیشتر است و نویسنده‌ها ممکن است starve شوند. benchmark کنید.
- Mutex در Go **reentrant نیست.** Lock دوباره در همان goroutine یعنی deadlock.
- critical section را کوچک نگه دارید. I/O یا فراخوانی شبکه زیر lock نکنید.
- ترتیب ثابت گرفتن lockها از deadlock جلوگیری می‌کند.
- \`wg.Add\` باید **قبل** از \`go\` صدا زده شود، نه داخل goroutine.
- Mutex را به‌صورت فیلد unexported بگذارید، نه embedded (روز Interface).
- برای map هم‌زمان: Mutex به همراه map معمولاً کافی است. \`sync.Map\` فقط برای کلیدهای عمدتاً ثابت با خواندن خیلی زیاد یا کلیدهای جدا برای هر goroutine طراحی شده است. برای کنترل بیشتر، shard کردن (N map با N mutex).

## سؤال مصاحبه
**«چه زمانی channel و چه زمانی mutex؟»**
پاسخ: channel برای انتقال داده یا مالکیت و هماهنگی مراحل؛ mutex برای محافظت از state مشترک. «Share memory by communicating» شعار است، نه قانون. cache داخل حافظه با mutex خواناتر است.`,
        practicalMd: `نسخهٔ Mutex و atomic یک counter را benchmark کنید (\`go test -bench . -cpu 1,4\`) و نتیجه را تفسیر کنید.`,
        exampleMd: `~~~go
type Stats struct {
	mu     sync.RWMutex // unexported، embedded نیست
	counts map[string]int
}

func (s *Stats) Snapshot() map[string]int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return maps.Clone(s.counts) // هرگز map داخلی را بیرون ندهید
}
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "data-race",
        titleFa: "لب: crash تصادفی در شمارندهٔ متریک",
        topicSlug: "go-sync",
        lessonSlug: "waitgroup-mutex",
        instructionsMd: `\`Stats\` در production گاهی با \`fatal error: concurrent map writes\` سرویس را می‌کشد و اعداد داشبورد غلط‌اند. با \`go test -race\` اجرا کنید، گزارش race را بخوانید (کدام خط با کدام خط تداخل دارد) و درستش کنید.

دو باگ وجود دارد. یکی از آن‌ها حتی با mutex هم باقی می‌ماند، اگر حواستان به \`Snapshot\` نباشد.`,
        hints: [
          "گزارش race دو stack نشان می‌دهد: Previous write at ... و Read at .... هر دو را پیدا کنید.",
          "یک فیلد mu sync.RWMutex اضافه کنید؛ نوشتن با Lock و خواندن با RLock. Snapshot نباید map داخلی را برگرداند.",
          "در Snapshot زیر RLock، maps.Clone(s.counts) برگردانید؛ در Inc با Lock و defer Unlock هر دو فیلد را به‌روز کنید.",
        ],
        race: true,
      }),
    ],
    scenario: noteScenario({
      titleFa: "موجودی منفی با وجود mutex",
      path: "/tmp/go-day13-scenario.txt",
      mustContain: "race condition",
      incidentMd: "در فلش‌سیل، موجودی یک کالا در حافظهٔ سرویس منفی شده؛ همهٔ متدهای Inventory با mutex محافظت شده‌اند و -race چیزی پیدا نمی‌کند.",
      symptomsMd: "کد: if inv.Get(id) > 0 { inv.Decrement(id) } — هر متد جدا lock می‌گیرد.",
      rootCause: "race condition منطقی (check-then-act): بررسی و کاهش اتمیک نیستند؛ باید یک متد TryDecrement زیر یک lock هر دو کار را انجام دهد",
    }),
    exam: {
      titleFa: "آزمون — memory model و sync",
      questions: [
        mc(
          "کدام مورد happens-before ایجاد می‌کند؟",
          ["time.Sleep بین دو goroutine", "send و receive روی channel", "چاپ با fmt.Println", "افزایش int معمولی"],
          "send و receive روی channel",
          "send قبل از receive متناظر happens-before دارد.",
          "go-memory-model",
        ),
        tf("race detector همهٔ data raceهای ممکن در کد را پیدا می‌کند.", false, "فقط raceهایی که در اجرای واقعی رخ می‌دهند.", "go-memory-model"),
        tf("sync.Mutex در Go reentrant است.", false, "Lock دوباره در همان goroutine deadlock می‌دهد.", "go-sync"),
        mc(
          "counter ساده که میلیون‌ها بار در ثانیه افزایش می‌یابد؟",
          ["sync.RWMutex", "atomic.Int64", "channel با buffer", "sync.Map"],
          "atomic.Int64",
          "یک دستور اتمیک CPU؛ بدون lock.",
          "go-sync",
        ),
        sa("پرچم تست race detector؟", "go test -race", "instrumentation در زمان اجرا.", "go-sync"),
      ],
    },
  }),

  day({
    dayNumber: 14,
    phaseSlug: "go-concurrency",
    titleFa: "Context — لغو، deadline و propagation",
    objectiveFa: "درخت context، لغو آبشاری، deadline budget و anti-patternهای context را توضیح دهید.",
    topicSlugs: ["go-context"],
    lessons: [
      goLesson({
        slug: "context-cancellation",
        topicSlug: "go-context",
        titleFa: "Context: سیگنال لغو در کل درخت فراخوانی",
        objectiveFa: "WithCancel، WithTimeout و WithDeadline، cause و AfterFunc را بشناسید و ctx را تا آخرین I/O برسانید.",
        theoryMd: `## چرا مهم است
کاربر تب را بست یا load balancer بعد از ۳۰ ثانیه قطع کرد. اگر ctx به query دیتابیس نرسیده باشد، سرور همچنان کار بی‌فایده انجام می‌دهد و connection pool را اشغال می‌کند. این بار در یک incident اضافه، کل سرویس را می‌خواباند.

## مفهوم
- context درختی و **immutable** است. هر \`With*\` یک فرزند می‌سازد. cancel شدن والد همهٔ فرزندان را cancel می‌کند، ولی برعکس نه.
- **همیشه \`defer cancel()\`**. در غیر این صورت context و timer آن تا deadline یا لغو والد زنده می‌مانند (\`go vet\` با lostcancel هشدار می‌دهد).
- \`ctx.Err()\` بعد از لغو \`context.Canceled\` یا \`context.DeadlineExceeded\` است.
- از Go 1.20 و 1.21: \`WithCancelCause\` و \`context.Cause\` (چرا لغو شد)، \`AfterFunc\` و \`WithoutCancel\` (برای کار پس‌زمینه‌ای که نباید با پایان request لغو شود، مثل ارسال audit log).

## Deadline budget
هر hop باید deadline را **کوچک‌تر** کند. API با بودجهٔ ۲ ثانیه نباید به سرویس پایین‌دستی timeout ۵ ثانیه بدهد. gRPC deadline را خودکار propagate می‌کند و در HTTP باید خودتان این کار را بکنید.

## قوانین
1. \`ctx\` اولین پارامتر است و در struct ذخیره نمی‌شود (جز موارد خاص مثل request scope).
2. \`context.Value\` فقط برای دادهٔ request-scoped و cross-cutting است (trace id، user id احرازشده)، نه پارامتر اختیاری تابع. کلید از تایپ unexported باشد.
3. \`context.Background()\` فقط در main، init و تست. وسط کد، ctx دریافتی را پاس دهید.
4. حلقه‌های طولانی CPU-bound، \`ctx.Err()\` را دوره‌ای چک کنند.

## سؤال مصاحبه
**«اگر fn به ctx اهمیت ندهد، چطور تضمین می‌کنید caller سر موعد برمی‌گردد؟»**
پاسخ: fn را در goroutine با channel که buffer یک دارد اجرا می‌کنیم و روی نتیجه و \`ctx.Done()\` select می‌زنیم. caller به موقع برمی‌گردد ولی fn همچنان منابع مصرف می‌کند. پس راه‌حل واقعی این است که fn هم ctx را رعایت کند.`,
        practicalMd: `برای یک endpoint با بودجهٔ ۸۰۰ms که سه فراخوانی پایین‌دستی دارد، تقسیم deadline را بنویسید.`,
        exampleMd: `~~~go
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 800*time.Millisecond)
	defer cancel()

	row := h.db.QueryRowContext(ctx, q, id)      // DB لغو می‌شود
	req, _ := http.NewRequestWithContext(ctx, ...) // HTTP هم
	_ = row
	_ = req
}
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "ctx-timeout",
        titleFa: "لب: CallWithTimeout که واقعاً سر وقت برمی‌گردد",
        topicSlug: "go-context",
        lessonSlug: "context-cancellation",
        instructionsMd: `\`CallWithTimeout\` در حال حاضر timeout را نادیده می‌گیرد. تابعی بنویسید که حتی اگر \`fn\` به ctx بی‌اعتنا باشد، caller سر موعد برگردد، و هیچ goroutineای تا ابد block نماند.`,
        hints: [
          "به ctx فرزند با deadline نیاز دارید و فراموش نکنید defer cancel().",
          "fn را در goroutine اجرا کنید و نتیجه را روی channel بفرستید؛ caller روی آن channel و ctx.Done() select بزند.",
          "اگر channel نتیجه buffer نداشته باشد، goroutine بعد از timeout برای همیشه روی send می‌ماند؛ make(chan result, 1).",
        ],
        race: true,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Connection pool پر بعد از قطع کاربرها",
      path: "/tmp/go-day14-scenario.txt",
      mustContain: "QueryContext",
      incidentMd: "در زمان کندی دیتابیس، سرویس کاملاً از دسترس خارج می‌شود و حتی بعد از برطرف شدن کندی تا ۱۰ دقیقه بازنمی‌گردد.",
      symptomsMd: "sql.DBStats: InUse=50 (حداکثر) و WaitCount مدام بالا می‌رود؛ کد از db.Query(q) بدون context استفاده می‌کند.",
      rootCause: "queryها context نداشتند؛ وقتی کلاینت قطع شد، query ادامه یافت و connection را نگه داشت؛ باید QueryContext با r.Context() و timeout استفاده می‌شد",
    }),
    exam: {
      titleFa: "آزمون — Context",
      questions: [
        tf("لغو context والد همهٔ فرزندانش را لغو می‌کند.", true, "لغو به پایین درخت propagate می‌شود.", "go-context"),
        tf("لغو context فرزند والد را هم لغو می‌کند.", false, "فقط از بالا به پایین.", "go-context"),
        mc(
          "ctx.Err() بعد از پایان timeout چیست؟",
          ["nil", "context.Canceled", "context.DeadlineExceeded", "io.EOF"],
          "context.DeadlineExceeded",
          "برای cancel دستی Canceled است.",
          "go-context",
        ),
        mc(
          "کدام استفاده از context.Value مناسب است؟",
          ["پاس دادن *sql.DB", "trace id درخواست", "پارامتر اختیاری limit", "تنظیمات سرویس"],
          "trace id درخواست",
          "Value فقط برای دادهٔ request-scoped و cross-cutting.",
          "go-context",
        ),
        sa("کدام بررسی go vet فراموش کردن cancel را می‌گیرد؟", "lostcancel", "go vet -lostcancel", "go-context"),
      ],
    },
  }),

  day({
    dayNumber: 15,
    phaseSlug: "go-concurrency",
    titleFa: "هم‌زمانی پیشرفته: errgroup، singleflight، Once و Pool",
    objectiveFa: "ابزارهای سطح بالاتر sync را بشناسید و singleflight را از صفر پیاده کنید (سؤال رایج مصاحبه).",
    topicSlugs: ["go-sync", "go-patterns"],
    lessons: [
      goLesson({
        slug: "advanced-sync",
        topicSlug: "go-sync",
        titleFa: "errgroup، singleflight، Once و Pool",
        objectiveFa: "بدانید هر ابزار کدام مشکل production را حل می‌کند.",
        theoryMd: `## errgroup (\`golang.org/x/sync/errgroup\`)
WaitGroup به همراه اولین خطا و لغو ctx. با \`g.SetLimit(n)\` هم‌زمانی را محدود می‌کند.
~~~go
g, ctx := errgroup.WithContext(ctx)
g.SetLimit(8)
for _, id := range ids {
	g.Go(func() error { return fetch(ctx, id) })
}
if err := g.Wait(); err != nil { ... }
~~~
در مصاحبه بدانید زیر کاپوت چیست: WaitGroup، \`sync.Once\` برای ثبت اولین خطا، و cancel. (در لب روز بعد خودتان می‌سازیدش.)

## singleflight (\`golang.org/x/sync/singleflight\`)
**Cache stampede:** کلید داغی (مثلاً صفحهٔ محصول پرفروش) منقضی می‌شود و ۵۰۰ request هم‌زمان به دیتابیس می‌روند. singleflight فراخوانی‌های هم‌زمان با یک کلید را یکی می‌کند. نکته‌ها:
- نتیجه **cache نمی‌شود**. فقط فراخوانی‌های در جریان یکی می‌شوند.
- اگر آن یک فراخوانی کند باشد، همه کند می‌شوند. \`DoChan\` با timeout یا \`Forget\` را بشناسید.

## sync.Once، OnceValue و OnceFunc
مقداردهی lazy و thread-safe. \`sync.OnceValue(func() T)\` از Go 1.21. اگر f panic کند، Once «انجام‌شده» حساب می‌شود.

## sync.Pool
برای **کاهش allocation** اشیای موقت (\`bytes.Buffer\`، encoder). نکته‌ها:
- Pool cache نیست. GC در هر چرخه ممکن است محتوا را خالی کند.
- قبل از Put، شیء را Reset کنید و bufferهای بیش از حد بزرگ را Put نکنید (حافظه نگه می‌دارند).
- فقط بعد از profile که allocation را hotspot نشان داد.

## sync.Cond
به ندرت لازم است. معمولاً channel خواناتر است. اگر استفاده کردید، Wait همیشه داخل حلقهٔ for شرط باشد.

## سؤال مصاحبه
**«singleflight را بدون کتابخانه پیاده کنید.»**
همان لب امروز است: mutex، map از کلید به \`*call\`، و WaitGroup داخل هر call.`,
        practicalMd: `قبل از لب روی کاغذ بنویسید: اگر fn در حال اجرا panic کند، در پیاده‌سازی شما بقیهٔ منتظرها چه می‌شوند؟`,
        exampleMd: `~~~go
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}

func render(v any) []byte {
	buf := bufPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer func() {
		if buf.Cap() <= 64<<10 { // bufferهای غول‌پیکر را نگه ندارید
			bufPool.Put(buf)
		}
	}()
	_ = json.NewEncoder(buf).Encode(v)
	return bytes.Clone(buf.Bytes())
}
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "singleflight",
        titleFa: "لب: جلوگیری از cache stampede با singleflight",
        topicSlug: "go-sync",
        lessonSlug: "advanced-sync",
        instructionsMd: `\`Group.Do\` را طوری پیاده کنید که فراخوانی‌های هم‌زمان با یک کلید فقط یک بار \`fn\` را اجرا کنند. این سؤال در مصاحبه‌های Go تیم‌های بزرگ رایج است. بعد از حل، با صدای بلند توضیح دهید چرا نباید هنگام \`Wait\` قفل را نگه دارید.`,
        hints: [
          "به یک map از key به *call نیاز دارید که با mutex محافظت شود؛ call نتیجه و یک sync.WaitGroup دارد.",
          "اولین caller یک call می‌سازد، wg.Add(1) می‌کند، قفل را آزاد و fn را اجرا می‌کند. بقیه call موجود را پیدا، قفل را آزاد و wg.Wait() می‌کنند.",
          "بعد از اجرای fn: زیر قفل کلید را از map حذف کنید (تا cache نشود)، بعد wg.Done(). zero value: اگر map nil بود، داخل Do و زیر قفل make کنید.",
        ],
        race: true,
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "دیتابیس زیر بار در لحظهٔ انقضای cache",
      path: "/tmp/go-day15-scenario.txt",
      mustContain: "singleflight",
      incidentMd: "هر ۵ دقیقه یک spike کوتاه CPU دیتابیس تا ۹۵٪ دیده می‌شود و p99 صفحهٔ محصول ۳ ثانیه می‌شود.",
      symptomsMd: "TTL کلید محصولات پرفروش دقیقاً ۵ دقیقه است؛ در لحظهٔ انقضا صدها query یکسان هم‌زمان اجرا می‌شوند.",
      rootCause: "cache stampede؛ نیاز به singleflight روی کلید، و TTL با jitter تا کلیدها هم‌زمان منقضی نشوند",
    }),
    exam: {
      titleFa: "آزمون — هم‌زمانی پیشرفته",
      questions: [
        tf("singleflight نتیجه را برای فراخوانی‌های بعدی cache می‌کند.", false, "فقط فراخوانی‌های هم‌زمان را یکی می‌کند.", "go-sync"),
        mc(
          "sync.Pool برای چیست؟",
          ["cache دائمی اشیا", "کاهش allocation اشیای موقت", "محدود کردن هم‌زمانی", "pool اتصال دیتابیس"],
          "کاهش allocation اشیای موقت",
          "GC ممکن است Pool را خالی کند؛ cache نیست.",
          "go-sync",
        ),
        mc(
          "errgroup.WithContext در برابر WaitGroup چه اضافه می‌کند؟",
          ["هیچ", "اولین خطا و لغو ctx بقیه", "اجرای ترتیبی", "retry خودکار"],
          "اولین خطا و لغو ctx بقیه",
          "با SetLimit هم‌زمانی را هم محدود می‌کند.",
          "go-patterns",
        ),
        sa("از Go 1.21 کدام تابع sync مقدار lazy و thread-safe برمی‌گرداند؟", "sync.OnceValue", "OnceValue / OnceValues / OnceFunc", "go-sync"),
      ],
    },
  }),

  day({
    dayNumber: 16,
    phaseSlug: "go-concurrency",
    titleFa: "الگوهای production: worker pool، pipeline و shutdown",
    objectiveFa: "هم‌زمانی محدود، توقف روی اولین خطا، backpressure و graceful shutdown را پیاده و توضیح دهید.",
    topicSlugs: ["go-patterns", "go-goroutines", "go-context"],
    lessons: [
      goLesson({
        slug: "worker-pool-fan",
        topicSlug: "go-patterns",
        titleFa: "Worker pool، fan-out/fan-in و backpressure",
        objectiveFa: "محدود کردن parallelism و merge ایمن چند producer را پیاده کنید.",
        theoryMd: `## چرا مهم است
«برای هر آیتم یک goroutine» تا وقتی کار می‌کند که آیتم‌ها ۱۰ تا باشند. با ۱۰۰ هزار آیتم، ۱۰۰ هزار connection هم‌زمان به سرویس پایین‌دستی می‌زنید و خودتان یک DDoS درست کرده‌اید.

## دو شکل محدودسازی
1. **Worker pool ثابت:** N goroutine از یک channel jobs می‌خوانند. مناسب stream طولانی مثل consumer صف.
2. **Semaphore:** \`sem := make(chan struct{}, N)\` قبل از هر کار acquire و بعدش release. مناسب batch محدود. errgroup با \`SetLimit\` همین است.

## جزئیاتی که مصاحبه‌گر می‌سنجد
- **ترتیب خروجی:** نتیجه را در \`out[i]\` بنویسید. هر index فقط یک نویسنده دارد، پس به lock نیازی نیست.
- **توقف روی اولین خطا:** cancel کردن ctx مشترک به همراه \`sync.Once\` برای ثبت اولین خطا، و توقف تغذیهٔ jobs.
- **هیچ goroutine نباید بماند:** feeder باید روی \`ctx.Done()\` هم select کند، وگرنه وقتی workerها رفته‌اند روی send گیر می‌کند.
- **Backpressure:** channel بدون buffer یا با buffer کوچک، تا کندی consumer به producer منتقل شود.

## سؤال مصاحبه
**«۱۰۰ هزار URL را با حداکثر ۵۰ درخواست هم‌زمان crawl کنید و در اولین خطای ۵xx متوقف شوید.»**
دقیقاً لب امروز به همراه یک http.Client با timeout.`,
        practicalMd: `قبل از لب، نمودار goroutineها و channelها را بکشید: feeder، channel jobs، N worker و جای cancel.`,
        exampleMd: `~~~go
feed:
for i := range items {
	select {
	case jobs <- i:
	case <-ctx.Done():
		break feed // بدون این، feeder بعد از خطا گیر می‌کند
	}
}
close(jobs)
wg.Wait()
~~~`,
      }),
      goLesson({
        slug: "rate-limit-shutdown",
        topicSlug: "go-patterns",
        titleFa: "Graceful shutdown برای سرویس با worker",
        objectiveFa: "ترتیب درست توقف HTTP server، workerها و منابع را بدانید.",
        theoryMd: `## ترتیب درست shutdown
1. دریافت SIGTERM با \`signal.NotifyContext(ctx, syscall.SIGTERM, os.Interrupt)\`
2. readiness را fail کنید و چند ثانیه صبر کنید تا load balancer یا Kubernetes ترافیک را قطع کند.
3. \`srv.Shutdown(ctx)\` **با timeout**: listener بسته می‌شود و درخواست‌های در جریان تمام می‌شوند.
4. لغو ctx workerها، توقف دریافت پیام جدید از صف و \`wg.Wait()\` برای کارهای در جریان.
5. بستن منابع به ترتیب معکوس ساخت: producer صف، DB pool و flush لاگ و trace.
6. همه باید زیر \`terminationGracePeriodSeconds\` تمام شوند (پیش‌فرض ۳۰ ثانیه).

## خطاهای رایج
- \`srv.Shutdown(context.Background())\`: اگر درخواستی گیر کند، برای همیشه منتظر می‌ماند و در نهایت SIGKILL می‌خورد.
- \`log.Fatal(srv.ListenAndServe())\`: بعد از Shutdown، ListenAndServe بلافاصله \`http.ErrServerClosed\` برمی‌گرداند و log.Fatal بدون اجرای deferها خارج می‌شود.
- Shutdown اتصال‌های hijack‌شده (WebSocket) را نمی‌بندد. باید \`RegisterOnShutdown\` را صدا زد.

## سؤال مصاحبه
**«هنگام rolling update چند ۵۰۲ می‌بینیم. چرا؟»**
پاسخ: pod قبل از اینکه از endpointها حذف شود، connection را قطع کرده است. باید یک preStop یا تأخیر بعد از fail کردن readiness داشت، بعد Shutdown با timeout.`,
        practicalMd: `main یک سرویس با HTTP server و یک consumer صف را بنویسید که مراحل بالا را رعایت کند (فقط ساختار).`,
        exampleMd: `~~~go
ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, os.Interrupt)
defer stop()

go func() {
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Error("listen", "err", err)
		stop()
	}
}()

<-ctx.Done()
shutdownCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
defer cancel()
_ = srv.Shutdown(shutdownCtx)
workersCancel()
wg.Wait()
_ = db.Close()
~~~`,
      }),
    ],
    exercises: [
      goLab({
        lab: "worker-pool",
        titleFa: "لب: Map هم‌زمان با سقف، ترتیب و توقف روی خطا",
        topicSlug: "go-patterns",
        lessonSlug: "worker-pool-fan",
        instructionsMd: `تابع generic \`Map\` را بدون errgroup و فقط با stdlib پیاده کنید. این عملاً پیاده‌سازی errgroup با SetLimit است. تست‌ها هم‌زمانی واقعی، سقف هم‌زمانی، ترتیب نتایج، توقف روی اولین خطا، لغو ctx و نبود goroutine باقی‌مانده را با \`-race\` می‌سنجند.`,
        hints: [
          "اجزا: ctx فرزند با cancel، channel jobs از نوع اندیس (int)، N worker با WaitGroup، و sync.Once برای ثبت اولین خطا.",
          "feeder باید روی jobs <- i و ctx.Done() select کند و بعد jobs را close کند. workerها نتیجه را در out[i] بنویسند.",
          "بعد از wg.Wait(): اگر firstErr != nil آن را برگردانید؛ وگرنه اگر ctx.Err() != nil (لغو والد) آن را؛ وگرنه out. workers < 1 را برابر 1 بگیرید.",
        ],
        race: true,
        difficulty: "hard",
        maxScore: 25,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Queue backlog و OOM",
      path: "/tmp/go-day16-scenario.txt",
      mustContain: "backpressure",
      incidentMd: "consumer ارسال SMS از صف عقب افتاده و هر چند ساعت با OOM restart می‌شود.",
      symptomsMd: "کد: برای هر پیام دریافتی یک goroutine؛ prefetch صف ۱۰ هزار؛ اپراتور پیام‌رسان rate limit کرده و پاسخ‌ها کند شده‌اند.",
      rootCause: "هم‌زمانی نامحدود و prefetch بزرگ؛ نبود worker pool و backpressure به صف",
    }),
    exam: {
      titleFa: "آزمون — الگوها",
      questions: [
        mc(
          "محدود کردن به ۱۰۰ فراخوانی هم‌زمان؟",
          ["sync.Once", "chan struct{} با buffer صد به‌عنوان semaphore", "close(channel)", "runtime.Gosched"],
          "chan struct{} با buffer صد به‌عنوان semaphore",
          "الگوی کلاسیک semaphore؛ یا errgroup.SetLimit.",
          "go-patterns",
        ),
        tf("http.Server.Shutdown با context.Background() در production ایمن است.", false, "بدون timeout ممکن است برای همیشه منتظر بماند تا SIGKILL.", "go-patterns"),
        mc(
          "چرا feeder باید روی ctx.Done() هم select کند؟",
          ["برای سرعت بیشتر", "تا بعد از توقف workerها روی send گیر نکند", "برای ترتیب نتایج", "الزامی نیست"],
          "تا بعد از توقف workerها روی send گیر نکند",
          "وگرنه goroutine leak و Map هرگز برنمی‌گردد.",
          "go-patterns",
        ),
        sa("بعد از Shutdown، ListenAndServe چه خطایی برمی‌گرداند؟", "http.ErrServerClosed", "باید آن را خطای واقعی حساب نکرد.", "go-patterns"),
      ],
    },
  }),
];
