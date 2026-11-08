type DaySeed = {
  dayNumber: number;
  titleFa: string;
  objectiveFa: string;
  topicSlugs: string[];
  lessons: {
    slug: string;
    topicSlug: string;
    titleFa: string;
    objectiveFa: string;
    theoryMd: string;
    practicalMd: string;
    exampleMd: string;
    commands: string[];
  }[];
  exercises: {
    titleFa: string;
    topicSlug: string;
    lessonSlug?: string;
    instructionsMd: string;
    difficulty: string;
    maxScore: number;
    labSetup?: { commands: string[] };
    validation: { checks: unknown[] };
    hints: { level: number; textFa: string }[];
  }[];
  scenario: {
    titleFa: string;
    incidentMd: string;
    symptomsMd: string;
    observabilityMd: string;
    environmentMd: string;
    hiddenRootCause: string;
    investigationPath: string[];
    validation: { checks: unknown[] };
    labSetup: { commands: string[] };
    difficulty: string;
  };
  exam: {
    titleFa: string;
    questions: {
      type: string;
      promptFa: string;
      options?: string[];
      correctAnswer: string;
      explanationFa: string;
      points: number;
      topicSlug: string;
    }[];
  };
};

export const days: DaySeed[] = [
  {
    dayNumber: 1,
    titleFa: "مبانی لینوکس",
    objectiveFa:
      "از صفر، قدم‌به‌قدم لینوکس را بشناسید: لایه‌ها، پوشه‌ها، فرمان‌های روزمره، کاربر و فرآیند. بعد از هر قدم چند تمرین کوتاه انجام می‌دهید.",
    topicSlugs: ["linux-filesystem", "users-groups", "processes", "cpu", "memory", "disk"],
    lessons: [
      {
        slug: "linux-architecture",
        topicSlug: "linux-filesystem",
        titleFa: "لینوکس از چه ساخته شده؟",
        objectiveFa: "سه لایهٔ کرنل، فضای کاربر و شل را با مثال ساده از هم جدا کنید.",
        theoryMd: `لینوکس یک سیستم‌عامل است؛ یعنی برنامه‌ای که بین شما و سخت‌افزار می‌ایستد و اجازه می‌دهد از CPU، حافظه، دیسک و شبکه استفاده کنید.

مثل یک ساختمان فکر کنید:

1. **کرنل (هسته)**: مدیر ساختمان. سخت‌افزار را او مدیریت می‌کند. شما مستقیم با کرنل حرف نمی‌زنید.
2. **فضای کاربر**: ساکنان ساختمان. برنامه‌ها، سرویس‌ها و فایل‌های شما این‌جا هستند.
3. **شل**: میز پذیرش. شما فرمان می‌نویسید؛ شل آن را به کرنل می‌رساند. در این دوره شل معمولاً **Bash** است.

سه سؤال ساده که با فرمان جواب داده می‌شوند:

- این ماشین چه کرنلی دارد؟ → \`uname -a\`
- چه توزیعی نصب است (مثلاً اوبونتو)؟ → \`cat /etc/os-release\`
- شل فعلی من چیست؟ → \`echo $SHELL\`

فعلاً لازم نیست تولید یا عیب‌یابی سرور را بلد باشید. فقط این مدل سه‌لایه را در ذهن نگه دارید؛ بقیهٔ فرمان‌ها روی همین مدل سوار می‌شوند.`,
        practicalMd: `در آزمایشگاه این دوره، ترمینال معمولاً با کاربر \`root\` باز می‌شود و شما در \`/root\` هستید (علامت \`~\`). اول همین سه فرمان را اجرا کنید و خروجی را بخوانید؛ لازم نیست همهٔ کلمات را بفهمید.

وقتی تمرین می‌گوید \`/tmp/...\` یعنی مسیر مطلق از ریشه. اگر بنویسید \`tmp/...\` فایل کنار خودتان ساخته می‌شود و اعتبارسنجی آن را نمی‌بیند.

بعد از خواندن این قدم، تمرین‌های همین بخش را انجام دهید.`,
        exampleMd: `\`\`\`bash
uname -a
cat /etc/os-release
echo $SHELL
\`\`\`

\`uname\` یعنی «تو کی هستی؟» برای کرنل. \`echo $SHELL\` مقدار متغیر محیطی شل را چاپ می‌کند.`,
        commands: ["uname -a", "cat /etc/os-release", "echo $SHELL"],
      },
      {
        slug: "filesystem",
        topicSlug: "linux-filesystem",
        titleFa: "پوشه‌ها و مسیرها",
        objectiveFa: "از ریشه (/) حرکت کنید و فرق مسیر مطلق و نسبی را بفهمید.",
        theoryMd: `در لینوکس تقریباً **همه‌چیز مثل فایل دیده می‌شود**: پوشه، دستگاه، حتی اطلاعات کرنل.

همه چیز از یک ریشه شروع می‌شود: \`/\`

چند پوشهٔ مهم که همین هفته با آن‌ها کار می‌کنید:

| مسیر | یعنی چه؟ |
| --- | --- |
| \`/\` | ریشه؛ بالای درخت |
| \`/home\` | خانهٔ کاربران معمولی |
| \`/etc\` | فایل‌های پیکربندی |
| \`/var/log\` | لاگ‌ها |
| \`/tmp\` | فایل موقت |
| \`/bin\` و \`/usr/bin\` | فرمان‌های اجرایی |

**مسیر مطلق** از \`/\` شروع می‌شود. مثال: \`/home/student/workspace\`

**مسیر نسبی** از جایی که الان هستید حساب می‌شود.

دو میانبر همیشگی:

- \`.\` یعنی همین پوشه
- \`..\` یعنی پوشهٔ والد (یک سطح بالاتر)

سه فرمان حرکت:

- \`pwd\`: الان کجا هستم؟
- \`ls\`: این‌جا چه چیزی هست؟ \`ls -la\` جزئیات و فایل‌های مخفی را هم نشان می‌دهد
- \`cd\`: برو به پوشهٔ دیگر`,
        practicalMd: `اول \`pwd\` بزنید تا بفهمید کجا ایستاده‌اید. بعد \`ls -la /\` را ببینید؛ همان پوشه‌های جدول بالا را در خروجی پیدا کنید.

با \`cd /etc\` وارد پیکربندی شوید و دوباره \`pwd\` بزنید. با \`cd ..\` یک سطح برگردید.

هرگز در \`/\` فایل تمرینی نسازید؛ فضای کار شما \`/home/student/workspace\` است.`,
        exampleMd: `\`\`\`bash
pwd
ls -la /
cd /etc
pwd
ls | head
cd /home/student/workspace
pwd
\`\`\``,
        commands: ["pwd", "ls -la /", "cd /etc", "ls /var/log"],
      },
      {
        slug: "basic-commands",
        topicSlug: "linux-filesystem",
        titleFa: "فرمان‌های ساخت و مشاهدهٔ فایل",
        objectiveFa: "پوشه و فایل بسازید، محتوا را ببینید و کپی کنید.",
        theoryMd: `حالا که می‌توانید حرکت کنید، نوبت ساختن و خواندن است. فرمان‌ها را در سه گروه یاد بگیرید؛ همه را یک‌جا حفظ نکنید.

**گروه ۱ — ساختن**

- \`mkdir نام\`: پوشه بساز
- \`mkdir -p مسیر/تو در تو\`: چند سطح را یکجا بساز؛ اگر وجود داشته باشد خطا نمی‌دهد
- \`touch فایل\`: فایل خالی بساز
- \`echo متن > فایل\`: متن را در فایل بنویس (اگر فایل باشد، محتوایش عوض می‌شود)

**گروه ۲ — خواندن**

- \`cat فایل\`: کل محتوا
- \`head فایل\`: چند خط اول
- \`tail فایل\`: چند خط آخر
- \`wc -l فایل\`: تعداد خط

**گروه ۳ — جابه‌جایی**

- \`cp مبدأ مقصد\`: کپی
- \`mv مبدأ مقصد\`: جابه‌جا یا تغییر نام
- \`rm فایل\`: حذف فایل

\`rm -rf\` کل یک درخت را بدون سؤال پاک می‌کند. حتی در آزمایشگاه، قبل از Enter مسیر را دوباره بخوانید.

علامت \`>\` خروجی فرمان را به فایل می‌فرستد. این همان کاری است که در تمرین‌ها زیاد انجام می‌دهید.`,
        practicalMd: `یک فضای کار بسازید، یک فایل یادداشت بنویسید، با \`cat\` بخوانید، بعد یک کپی بگیرید.

اگر فرمان را اشتباه زدید، نگران نباشید؛ فایل را دوباره با \`echo\` بنویسید.`,
        exampleMd: `\`\`\`bash
mkdir -p /home/student/workspace
echo "سلام لینوکس" > /home/student/workspace/notes.txt
cat /home/student/workspace/notes.txt
cp /home/student/workspace/notes.txt /home/student/workspace/notes.bak
ls /home/student/workspace
\`\`\``,
        commands: [
          "mkdir -p /home/student/workspace",
          "echo hello > /home/student/workspace/notes.txt",
          "cat /home/student/workspace/notes.txt",
        ],
      },
      {
        slug: "users",
        topicSlug: "users-groups",
        titleFa: "کاربر یعنی چه؟",
        objectiveFa: "بفهمید با چه هویتی وارد شده‌اید و کاربر جدید چطور ساخته می‌شود.",
        theoryMd: `هر کاری در لینوکس **از طرف یک کاربر** انجام می‌شود. فایل‌ها مالک دارند؛ برنامه‌ها هم با هویت یک کاربر اجرا می‌شوند.

دو فرمان اول هویت:

- \`whoami\`: نام کاربر فعلی
- \`id\`: شناسهٔ عددی (UID)، گروه اصلی و گروه‌ها

در این آزمایشگاه معمولاً \`whoami\` مقدار \`root\` می‌دهد. \`root\` مدیر کل سیستم است و تقریباً هر کاری می‌تواند بکند. در سرور واقعی، کار روزمره را با کاربر معمولی انجام می‌دهند و \`root\` را فقط وقتی لازم است استفاده می‌کنند.

فهرست کاربران در \`/etc/passwd\` است. هر خط یک کاربر است. برای دیدن یک کاربر مشخص:

\`getent passwd root\`

کاربر انسانی معمولاً شل ورود دارد (مثلاً \`/bin/bash\`). کاربر سرویس (مثل \`www-data\`) برای اجرای برنامه است، نه برای نشستن پشت ترمینال.

ساخت کاربر جدید با \`useradd\` است. گزینهٔ \`-s\` شل ورود را مشخص می‌کند. گروه‌ها و مجوز فایل را فردا دقیق‌تر می‌بینید.`,
        practicalMd: `اول \`whoami\` و \`id\` را اجرا کنید و خروجی را بخوانید.

بعد \`getent passwd root\` را ببینید؛ فیلد آخر معمولاً شل ورود است.

در تمرین، یک کاربر به نام \`deploy\` می‌سازید؛ این الگوی رایجی برای استقرار برنامه است.`,
        exampleMd: `\`\`\`bash
whoami
id
getent passwd root
\`\`\``,
        commands: ["whoami", "id", "getent passwd root"],
      },
      {
        slug: "processes",
        topicSlug: "processes",
        titleFa: "فرآیند: برنامهٔ در حال اجرا",
        objectiveFa: "PID را بشناسید و CPU، حافظه و دیسک را با یک نگاه چک کنید.",
        theoryMd: `وقتی برنامه‌ای را اجرا می‌کنید، لینوکس یک **فرآیند** می‌سازد. هر فرآیند یک شمارهٔ یکتا دارد: **PID** (مثل کد ملی برای برنامه).

دو ابزار رایج:

- \`ps\`: عکس لحظه‌ای از فرآیندها. \`ps aux\` فهرست کامل است.
- \`top\`: نمای زنده. با \`q\` خارج می‌شوید.

در خروجی \`ps\` این ستون‌ها را ببینید: \`PID\`، \`%CPU\`، \`%MEM\`، \`COMMAND\`.

وضعیت کوتاه فرآیند (\`STAT\`):

- \`R\`: در حال اجرا یا آمادهٔ اجرا
- \`S\`: خواب (منتظر چیزی)
- \`Z\`: زامبی (تمام شده ولی هنوز جمع نشده)

برای سلامت کلی ماشین، سه فرمان کمکی:

- \`uptime\`: از کی روشن است و بار سیستم چقدر است
- \`free -m\`: حافظه به مگابایت
- \`df -h\`: فضای دیسک با واحد خوانا

اگر روزی گفتند «سرور کند است»، ترتیب ساده این است: \`uptime\` → \`ps\` یا \`top\` → \`free\` → \`df\`.

اگر فرآیندی CPU را بی‌دلیل پر کرده، آن را متوقف کنید:

- \`kill PID\`: درخواست مؤدبانه برای خروج (SIGTERM)
- اگر نرفت: \`kill -9 PID\` (اجباری؛ فقط وقتی لازم است)

\`PID\` همان عدد ستون فرآیند است. مثال: اگر \`yes\` با PID ۱۲۳۴ دیدید، \`kill 1234\`.`,
        practicalMd: `\`ps aux --sort=-%cpu | head\` پرمصرف‌ترین‌ها را بالای فهرست می‌آورد. اگر یک فرمان بی‌ربط مثل \`yes\` بالای لیست بود و %CPU نزدیک ۱۰۰ بود، همان را با \`kill\` متوقف کنید.`,
        exampleMd: `\`\`\`bash
ps aux --sort=-%cpu | head
kill 1234
free -m
df -h
uptime
\`\`\``,
        commands: ["ps aux --sort=-%cpu | head", "kill 1234", "free -m", "df -h", "uptime"],
      },
    ],
    exercises: [
      {
        titleFa: "نسخهٔ کرنل را ذخیره کنید",
        topicSlug: "linux-filesystem",
        lessonSlug: "linux-architecture",
        instructionsMd: `چطور می‌توانید اطلاعات نسخهٔ کرنل این ماشین را پیدا کنید و نتیجه را در \`/tmp/uname.txt\` ثبت کنید؟

**مسیر مطلق مهم است:** فایل باید دقیقاً داخل \`/tmp\` سیستم ساخته شود، نه در یک پوشهٔ نسبی به نام \`tmp\`.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/uname.txt" },
            { type: "fileContains", path: "/tmp/uname.txt", text: "Linux" },
          ],
        },
        hints: [
          { level: 1, textFa: "کدام ابزار اطلاعات کرنل را گزارش می‌کند؟ به تفاوت مسیر مطلق و نسبی هم دقت کنید." },
          { level: 2, textFa: "نمایش کامل اطلاعات کرنل به یک گزینه نیاز دارد؛ خروجی را با تغییر مسیر خروجی در فایل مقصد ثبت کنید." },
          { level: 3, textFa: "uname -a > /tmp/uname.txt" },
        ],
      },
      {
        titleFa: "شل فعلی را پیدا کنید",
        topicSlug: "linux-filesystem",
        lessonSlug: "linux-architecture",
        instructionsMd: `شل فعلی در کدام متغیر محیطی نگه‌داری می‌شود؟ مقدار آن را پیدا کنید و در مسیر مطلق \`/tmp/shell.txt\` ثبت کنید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/shell.txt" },
            { type: "fileContains", path: "/tmp/shell.txt", text: "bin" },
          ],
        },
        hints: [
          { level: 1, textFa: "متغیرهای محیطی و ابزاری برای چاپ مقدارشان را به یاد بیاورید." },
          { level: 2, textFa: "برای خواندن مقدار متغیر SHELL به پیشوند $ نیاز دارید؛ خروجی باید جایگزین محتوای فایل مقصد شود." },
          { level: 3, textFa: "echo $SHELL > /tmp/shell.txt" },
        ],
      },
      {
        titleFa: "توزیع سیستم‌عامل را ثبت کنید",
        topicSlug: "linux-filesystem",
        lessonSlug: "linux-architecture",
        instructionsMd: `چطور می‌توانید اطلاعات توزیع سیستم‌عامل را از \`/etc/os-release\` بخوانید و نسخه‌ای از محتوای آن را در \`/tmp/os-release.txt\` ثبت کنید؟`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/os-release.txt" },
            { type: "fileContains", path: "/tmp/os-release.txt", text: "Ubuntu" },
          ],
        },
        hints: [
          { level: 1, textFa: "به ابزارهای خواندن فایل و هدایت خروجی فکر کنید." },
          { level: 2, textFa: "فایل مبدأ را بخوانید و خروجی را به‌جای ترمینال در مسیر مقصد بنویسید." },
          { level: 3, textFa: "cat /etc/os-release > /tmp/os-release.txt" },
        ],
      },
      {
        titleFa: "پیمایش سیستم فایل",
        topicSlug: "linux-filesystem",
        lessonSlug: "filesystem",
        instructionsMd: `آیا می‌توانید فضای کار \`/home/student/workspace\` را طوری آماده کنید که نبودن پوشه‌های والد مانع نشود؟ سپس وارد آن شوید، مسیر فعلی را کشف کنید و نتیجه را در \`/home/student/workspace/pwd.txt\` ثبت کنید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "directoryExists", path: "/home/student/workspace" },
            { type: "fileExists", path: "/home/student/workspace/pwd.txt" },
            { type: "fileContains", path: "/home/student/workspace/pwd.txt", text: "/home/student/workspace" },
          ],
        },
        hints: [
          { level: 1, textFa: "به خانوادهٔ ابزارهای ساخت پوشه، جابه‌جایی و نمایش مسیر فعلی فکر کنید." },
          { level: 2, textFa: "ساخت پوشه‌های تودرتو به گزینهٔ والدها نیاز دارد؛ پس از ورود، خروجی مسیر فعلی را در فایل بنویسید." },
          { level: 3, textFa: "mkdir -p /home/student/workspace && cd /home/student/workspace && pwd > pwd.txt" },
        ],
      },
      {
        titleFa: "فهرست ریشه را ببینید",
        topicSlug: "linux-filesystem",
        lessonSlug: "filesystem",
        instructionsMd: `در ریشهٔ سیستم چه پوشه‌هایی وجود دارند؟ فهرست آن را در \`/home/student/workspace/root-listing.txt\` ثبت کنید و بررسی کنید که نام‌هایی مانند \`etc\` و \`var\` در نتیجه دیده می‌شوند.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/home/student/workspace/root-listing.txt" },
            { type: "fileContains", path: "/home/student/workspace/root-listing.txt", text: "etc" },
            { type: "fileContains", path: "/home/student/workspace/root-listing.txt", text: "var" },
          ],
        },
        hints: [
          { level: 1, textFa: "از ابزار فهرست‌کردن دایرکتوری‌ها استفاده کنید و در صورت نیاز فضای کار را بسازید." },
          { level: 2, textFa: "دایرکتوری هدف برای فهرست‌کردن، ریشه است؛ خروجی را در فایل مقصد جایگزین کنید." },
          { level: 3, textFa: "mkdir -p /home/student/workspace && ls / > /home/student/workspace/root-listing.txt" },
        ],
      },
      {
        titleFa: "مسیر لاگ‌ها را بنویسید",
        topicSlug: "linux-filesystem",
        lessonSlug: "filesystem",
        instructionsMd: `طبق درخت سیستم فایل، لاگ‌های سنتی لینوکس در کدام مسیر مطلق نگه‌داری می‌شوند؟ فقط همان مسیر را در \`/home/student/workspace/logs-path.txt\` ثبت کنید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/home/student/workspace/logs-path.txt" },
            { type: "fileContains", path: "/home/student/workspace/logs-path.txt", text: "/var/log" },
          ],
        },
        hints: [
          { level: 1, textFa: "به بخشی از درخت فایل‌سیستم فکر کنید که داده‌های متغیر سرویس‌ها را نگه می‌دارد." },
          { level: 2, textFa: "پاسخ زیر شاخهٔ var است و باید به‌صورت مسیر مطلق، با اسلش آغازین، نوشته شود." },
          { level: 3, textFa: "echo /var/log > /home/student/workspace/logs-path.txt" },
        ],
      },
      {
        titleFa: "ساخت دایرکتوری و فایل",
        topicSlug: "linux-filesystem",
        lessonSlug: "basic-commands",
        instructionsMd: `چطور مسیر تودرتوی \`/opt/app/data\` را حتی در صورت نبودن والدها می‌سازید؟ سپس فایل \`/opt/app/README.txt\` را طوری ایجاد کنید که شامل متن \`devops-learn\` باشد.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "directoryExists", path: "/opt/app/data" },
            { type: "fileContains", path: "/opt/app/README.txt", text: "devops-learn" },
          ],
        },
        hints: [
          { level: 1, textFa: "به ابزار ساخت دایرکتوری و یک ابزار نوشتن متن در فایل نیاز دارید." },
          { level: 2, textFa: "برای ساخت والدهای غایب از گزینهٔ مناسب ساخت پوشه استفاده کنید؛ سپس متن را به فایل مقصد هدایت کنید." },
          { level: 3, textFa: "mkdir -p /opt/app/data && echo devops-learn > /opt/app/README.txt" },
        ],
      },
      {
        titleFa: "کپی یک فایل یادداشت",
        topicSlug: "linux-filesystem",
        lessonSlug: "basic-commands",
        instructionsMd: `فایل \`/home/student/workspace/notes.txt\` باید شامل متن \`hello\` باشد و یک نسخهٔ پشتیبان هم در \`/home/student/workspace/notes.bak\` داشته باشد. با چه ابزارهایی متن را ثبت و فایل را کپی می‌کنید؟`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileContains", path: "/home/student/workspace/notes.txt", text: "hello" },
            { type: "fileContains", path: "/home/student/workspace/notes.bak", text: "hello" },
          ],
        },
        hints: [
          { level: 1, textFa: "ابتدا با ابزار نوشتن متن فایل اصلی را بسازید، سپس از خانوادهٔ ابزارهای کپی کمک بگیرید." },
          { level: 2, textFa: "در عملیات کپی، ترتیب آرگومان‌ها مبدأ و سپس مقصد است؛ مطمئن شوید فضای کار وجود دارد." },
          { level: 3, textFa: "echo hello > /home/student/workspace/notes.txt && cp /home/student/workspace/notes.txt /home/student/workspace/notes.bak" },
        ],
      },
      {
        titleFa: "هویت کاربر فعلی",
        topicSlug: "users-groups",
        lessonSlug: "users",
        instructionsMd: `چطور نام کاربر فعلی و جزئیات شناسه‌ها و گروه‌های او را پیدا می‌کنید؟ نام را در \`/tmp/whoami.txt\` و جزئیات هویت را در \`/tmp/id.txt\` ثبت کنید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/whoami.txt" },
            { type: "fileExists", path: "/tmp/id.txt" },
            { type: "fileContains", path: "/tmp/whoami.txt", text: "root" },
            { type: "fileContains", path: "/tmp/id.txt", text: "uid=" },
          ],
        },
        hints: [
          { level: 1, textFa: "دو ابزار هویتی لازم دارید: یکی برای نام فعلی و دیگری برای UID و گروه‌ها." },
          { level: 2, textFa: "خروجی هر ابزار را جداگانه و با دقت در فایل متناظر خودش جایگزین کنید." },
          { level: 3, textFa: "whoami > /tmp/whoami.txt && id > /tmp/id.txt" },
        ],
      },
      {
        titleFa: "ایجاد کاربر لینوکس",
        topicSlug: "users-groups",
        lessonSlug: "users",
        instructionsMd: `چطور یک حساب کاربری به نام \`deploy\` ایجاد می‌کنید که شل ورود آن \`/bin/bash\` باشد؟ ساخت دایرکتوری خانه جزو این تمرین نیست؛ وجود کاربر و شل درست ارزیابی می‌شود.`,
        difficulty: "medium",
        maxScore: 6,
        validation: {
          checks: [{ type: "userExists", name: "deploy", shell: "/bin/bash" }],
        },
        hints: [
          { level: 1, textFa: "به ابزارهای مدیریت حساب‌های کاربری لینوکس فکر کنید." },
          { level: 2, textFa: "ابزار ساخت کاربر گزینه‌ای برای تعیین login shell دارد؛ مقدار آن باید /bin/bash باشد." },
          { level: 3, textFa: "useradd -s /bin/bash deploy" },
        ],
      },
      {
        titleFa: "بررسی فرآیندها",
        topicSlug: "processes",
        lessonSlug: "processes",
        instructionsMd: `چطور می‌توانید تصویری کامل از فرآیندهای همهٔ کاربران، همراه با جزئیات آن‌ها، تهیه کنید؟ نتیجه را در \`/tmp/ps.txt\` ثبت کنید تا ستون \`PID\` در فایل دیده شود.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/ps.txt" },
            { type: "fileContains", path: "/tmp/ps.txt", text: "PID" },
          ],
        },
        hints: [
          { level: 1, textFa: "از ابزار نمایش لحظه‌ای فرآیندها استفاده کنید." },
          { level: 2, textFa: "نمایش همهٔ کاربران با قالب جزئی به مجموعه گزینه‌های رایج این ابزار نیاز دارد؛ خروجی را در فایل مقصد بنویسید." },
          { level: 3, textFa: "ps aux > /tmp/ps.txt" },
        ],
      },
      {
        titleFa: "مصرف حافظه و دیسک",
        topicSlug: "memory",
        lessonSlug: "processes",
        instructionsMd: `برای بررسی منابع ماشین، چگونه وضعیت حافظه را با واحد مگابایت و فضای فایل‌سیستم‌ها را با واحدهای خوانا گزارش می‌کنید؟ گزارش حافظه را در \`/tmp/free.txt\` و گزارش دیسک را در \`/tmp/df.txt\` ثبت کنید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/free.txt" },
            { type: "fileExists", path: "/tmp/df.txt" },
            { type: "fileContains", path: "/tmp/free.txt", text: "Mem" },
          ],
        },
        hints: [
          { level: 1, textFa: "یک ابزار گزارش حافظه و یک ابزار گزارش فضای فایل‌سیستم لازم دارید." },
          { level: 2, textFa: "برای حافظه واحد مگابایت و برای دیسک قالب human-readable را انتخاب کنید؛ هر خروجی در فایل خودش قرار می‌گیرد." },
          { level: 3, textFa: "free -m > /tmp/free.txt && df -h > /tmp/df.txt" },
        ],
      },
    ],
    scenario: {
      titleFa: "سرور تولید کند شده است",
      incidentMd: `تیم محصول گزارش داده صفحه اصلی با تأخیر باز می‌شود. شما SRE شیفت هستید.

حدس نزنید؛ با داده جلو بروید. در روز اول معمولاً یک فرآیند، CPU را پر کرده است.`,
      symptomsMd: `- پاسخ‌دهی کند\n- کاربران از «سنگین بودن سرور» می‌گویند\n- هشدار دقیق متریک هنوز تنظیم نشده`,
      observabilityMd: `برای بررسی از ابزارهای مشاهدهٔ بار سیستم، فرآیندها، حافظه و دیسک کمک بگیرید.

- آیا بار کلی ماشین غیرعادی است؟
- کدام فرآیند بیشترین CPU را مصرف می‌کند و PID آن چیست؟
- آیا کمبود حافظه یا فضای دیسک می‌تواند علت کندی باشد؟
- پس از شناسایی فرآیند مسئله‌دار، چگونه آن را به‌صورت مؤدبانه متوقف می‌کنید؟
- با چه مشاهده‌ای مطمئن می‌شوید مصرف غیرعادی برطرف شده است؟

اگر از نمای زندهٔ فرآیندها استفاده کردید، روش خروج از آن را هم به یاد داشته باشید.`,
      environmentMd: `کانتینر لینوکس ایزوله شبیه سرور تولید روز اول.`,
      hiddenRootCause: "A runaway `yes` process is consuming CPU in the background.",
      investigationPath: ["uptime", "ps aux --sort=-%cpu", "identify yes process", "kill the process"],
      validation: {
        checks: [{ type: "processNotRunning", name: "yes" }],
      },
      labSetup: {
        commands: ["bash -lc 'nohup yes >/dev/null 2>&1 &'"],
      },
      difficulty: "medium",
    },
    exam: {
      titleFa: "آزمون پایان روز ۱",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          promptFa: "کدام مسیر پیکربندی سیستم را نگه می‌دارد؟",
          options: ["/var", "/etc", "/home", "/tmp"],
          correctAnswer: "/etc",
          explanationFa: "طبق FHS پیکربندی در /etc است.",
          points: 3,
          topicSlug: "linux-filesystem",
        },
        {
          type: "TRUE_FALSE",
          promptFa: "در لینوکس کرنل و شل یک چیز هستند.",
          options: ["درست", "نادرست"],
          correctAnswer: "نادرست",
          explanationFa: "کرنل هسته سیستم‌عامل است؛ شل واسط کاربری است.",
          points: 3,
          topicSlug: "linux-filesystem",
        },
        {
          type: "MULTIPLE_CHOICE",
          promptFa: "کدام فرمان مسیر فعلی را چاپ می‌کند؟",
          options: ["ls", "pwd", "cd", "whoami"],
          correctAnswer: "pwd",
          explanationFa: "pwd یعنی print working directory.",
          points: 3,
          topicSlug: "linux-filesystem",
        },
        {
          type: "COMMAND",
          promptFa: "فرمان ساخت دایرکتوری تودرتو /opt/app/data را بنویسید.",
          correctAnswer: "mkdir -p /opt/app/data",
          explanationFa: "-p والدین را هم می‌سازد.",
          points: 3,
          topicSlug: "linux-filesystem",
        },
        {
          type: "MULTIPLE_CHOICE",
          promptFa: "اطلاعات کاربر در کدام فایل است؟",
          options: ["/etc/hosts", "/etc/passwd", "/var/log/syslog", "/proc/cpuinfo"],
          correctAnswer: "/etc/passwd",
          explanationFa: "passwd فهرست کاربران است.",
          points: 3,
          topicSlug: "users-groups",
        },
        {
          type: "SHORT_ANSWER",
          promptFa: "شناسه یکتای هر فرآیند در لینوکس چه نام دارد؟ (مخفف انگلیسی)",
          correctAnswer: "PID",
          explanationFa: "Process ID.",
          points: 3,
          topicSlug: "processes",
        },
        {
          type: "MULTIPLE_CHOICE",
          promptFa: "برای دیدن مصرف زنده CPU معمولاً از کدام ابزار استفاده می‌شود؟",
          options: ["cat", "top", "mkdir", "chmod"],
          correctAnswer: "top",
          explanationFa: "top نمای زنده فرآیندها است.",
          points: 3,
          topicSlug: "cpu",
        },
        {
          type: "TRUE_FALSE",
          promptFa: "فرمان free میزان حافظه را نشان می‌دهد.",
          options: ["درست", "نادرست"],
          correctAnswer: "درست",
          explanationFa: "free حافظه و swap را گزارش می‌کند.",
          points: 3,
          topicSlug: "memory",
        },
        {
          type: "TROUBLESHOOTING",
          promptFa: "اگر سرور کند است، اولین فرمان منطقی برای دیدن بار سیستم چیست؟",
          correctAnswer: "uptime",
          explanationFa: "uptime بار ۱/۵/۱۵ دقیقه را نشان می‌دهد. ps و top هم پذیرفته‌اند اگر دقیق نوشته شوند.",
          points: 3,
          topicSlug: "troubleshooting",
        },
        {
          type: "SCENARIO",
          promptFa: "فرآیندی CPU را پر کرده. پس از شناسایی PID، برای توقف مؤدبانه معمولاً چه سیگنالی می‌فرستید؟",
          correctAnswer: "SIGTERM",
          explanationFa: "ابتدا SIGTERM (kill بدون -9) سپس در صورت نیاز SIGKILL.",
          points: 3,
          topicSlug: "processes",
        },
      ],
    },
  },
];
