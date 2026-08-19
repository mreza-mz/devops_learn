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

اگر روزی گفتند «سرور کند است»، ترتیب ساده این است: \`uptime\` → \`ps\` یا \`top\` → \`free\` → \`df\`. امروز فقط نگاه کردن را تمرین می‌کنید؛ کشتن فرآیند را در روزهای بعد می‌بینید.`,
        practicalMd: `\`ps aux --sort=-%cpu | head\` پرمصرف‌ترین‌ها را بالای فهرست می‌آورد. \`free -m\` و \`df -h\` را هم یک‌بار ذخیره کنید تا بعداً با خروجی آشنا شوید.`,
        exampleMd: `\`\`\`bash
ps aux --sort=-%cpu | head
free -m
df -h
uptime
\`\`\``,
        commands: ["ps aux --sort=-%cpu | head", "free -m", "df -h", "uptime"],
      },
    ],
    exercises: [
      {
        titleFa: "نسخهٔ کرنل را ذخیره کنید",
        topicSlug: "linux-filesystem",
        lessonSlug: "linux-architecture",
        instructionsMd: `خروجی فرمان \`uname -a\` را در فایل \`/tmp/uname.txt\` ذخیره کنید.

**مسیر مهم است.** اسلش اول یعنی از ریشه:

- \`tmp/uname.txt\` یعنی پوشهٔ tmp همین‌جا (معمولاً \`/root/tmp\`) — اعتبارسنجی این را قبول نمی‌کند.
- \`/tmp/uname.txt\` یعنی پوشهٔ موقت سیستم — همین را می‌خواهیم.

\`/tmp\` از قبل وجود دارد؛ \`mkdir\` لازم نیست.

\`\`\`bash
uname -a > /tmp/uname.txt
cat /tmp/uname.txt
\`\`\``,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/uname.txt" },
            { type: "fileContains", path: "/tmp/uname.txt", text: "Linux" },
          ],
        },
        hints: [
          { level: 1, textFa: "مسیر باید با / شروع شود: /tmp نه tmp." },
          { level: 2, textFa: "پوشهٔ /tmp از قبل هست؛ فقط خروجی را با > در /tmp/uname.txt بنویسید." },
          { level: 3, textFa: "uname -a > /tmp/uname.txt" },
        ],
      },
      {
        titleFa: "شل فعلی را پیدا کنید",
        topicSlug: "linux-filesystem",
        lessonSlug: "linux-architecture",
        instructionsMd: `مقدار شل فعلی را در \`/tmp/shell.txt\` بنویسید (با اسلش اول؛ نه \`tmp/shell.txt\`).

متغیر \`SHELL\` را با \`echo\` چاپ کنید و به همان فایل بفرستید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/shell.txt" },
            { type: "fileContains", path: "/tmp/shell.txt", text: "bin" },
          ],
        },
        hints: [
          { level: 1, textFa: "نام متغیر را با $ می‌نویسند؛ مثلاً $SHELL." },
          { level: 2, textFa: "echo مقدار را چاپ می‌کند؛ با > آن را در فایل بگذارید." },
          { level: 3, textFa: "echo $SHELL > /tmp/shell.txt" },
        ],
      },
      {
        titleFa: "توزیع سیستم‌عامل را ثبت کنید",
        topicSlug: "linux-filesystem",
        lessonSlug: "linux-architecture",
        instructionsMd: `محتوای \`/etc/os-release\` را در \`/tmp/os-release.txt\` کپی کنید تا بعداً ببینید این ماشین چه توزیعی است.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/os-release.txt" },
            { type: "fileContains", path: "/tmp/os-release.txt", text: "Ubuntu" },
          ],
        },
        hints: [
          { level: 1, textFa: "cat فایل را می‌خواند؛ خروجی‌اش را می‌توانید redirect کنید." },
          { level: 2, textFa: "مبدأ /etc/os-release است و مقصد /tmp/os-release.txt." },
          { level: 3, textFa: "cat /etc/os-release > /tmp/os-release.txt" },
        ],
      },
      {
        titleFa: "پیمایش سیستم فایل",
        topicSlug: "linux-filesystem",
        lessonSlug: "filesystem",
        instructionsMd: `دایرکتوری \`/home/student/workspace\` را بسازید (اگر نیست). سپس وارد همان دایرکتوری شوید و خروجی \`pwd\` را در \`/home/student/workspace/pwd.txt\` بنویسید.`,
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
          { level: 1, textFa: "اول با mkdir دایرکتوری بسازید و بعد با cd وارد آن شوید." },
          { level: 2, textFa: "خروجی یک فرمان را می‌توانید با > به فایل بفرستید." },
          { level: 3, textFa: "mkdir -p /home/student/workspace && cd /home/student/workspace && pwd > pwd.txt" },
        ],
      },
      {
        titleFa: "فهرست ریشه را ببینید",
        topicSlug: "linux-filesystem",
        lessonSlug: "filesystem",
        instructionsMd: `خروجی \`ls /\` را در \`/home/student/workspace/root-listing.txt\` ذخیره کنید.

بعد از ذخیره، فایل را با \`cat\` باز کنید و پوشه‌هایی مثل \`etc\` و \`var\` را پیدا کنید.`,
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
          { level: 1, textFa: "اول مطمئن شوید /home/student/workspace وجود دارد." },
          { level: 2, textFa: "ls / را به فایل workspace هدایت کنید." },
          { level: 3, textFa: "mkdir -p /home/student/workspace && ls / > /home/student/workspace/root-listing.txt" },
        ],
      },
      {
        titleFa: "مسیر لاگ‌ها را بنویسید",
        topicSlug: "linux-filesystem",
        lessonSlug: "filesystem",
        instructionsMd: `طبق درخت سیستم فایل، لاگ‌های سنتی لینوکس در کدام مسیر هستند؟ همان مسیر را (فقط خود مسیر) در \`/home/student/workspace/logs-path.txt\` بنویسید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/home/student/workspace/logs-path.txt" },
            { type: "fileContains", path: "/home/student/workspace/logs-path.txt", text: "/var/log" },
          ],
        },
        hints: [
          { level: 1, textFa: "پوشهٔ var برای داده‌های متغیر مثل لاگ است." },
          { level: 2, textFa: "مسیر کامل با / شروع می‌شود." },
          { level: 3, textFa: "echo /var/log > /home/student/workspace/logs-path.txt" },
        ],
      },
      {
        titleFa: "ساخت دایرکتوری و فایل",
        topicSlug: "linux-filesystem",
        lessonSlug: "basic-commands",
        instructionsMd: `مسیر \`/opt/app/data\` را بسازید و فایل \`/opt/app/README.txt\` با متن \`devops-learn\` ایجاد کنید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "directoryExists", path: "/opt/app/data" },
            { type: "fileContains", path: "/opt/app/README.txt", text: "devops-learn" },
          ],
        },
        hints: [
          { level: 1, textFa: "mkdir -p چند سطح را یکجا می‌سازد." },
          { level: 2, textFa: "از echo یا tee برای نوشتن متن استفاده کنید." },
          { level: 3, textFa: "mkdir -p /opt/app/data && echo devops-learn > /opt/app/README.txt" },
        ],
      },
      {
        titleFa: "کپی یک فایل یادداشت",
        topicSlug: "linux-filesystem",
        lessonSlug: "basic-commands",
        instructionsMd: `فایل \`/home/student/workspace/notes.txt\` را با متن \`hello\` بسازید. سپس یک کپی از آن به نام \`/home/student/workspace/notes.bak\` بگیرید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileContains", path: "/home/student/workspace/notes.txt", text: "hello" },
            { type: "fileContains", path: "/home/student/workspace/notes.bak", text: "hello" },
          ],
        },
        hints: [
          { level: 1, textFa: "اول فایل را با echo بسازید." },
          { level: 2, textFa: "فرمان کپی cp است: cp مبدأ مقصد." },
          { level: 3, textFa: "echo hello > /home/student/workspace/notes.txt && cp /home/student/workspace/notes.txt /home/student/workspace/notes.bak" },
        ],
      },
      {
        titleFa: "هویت کاربر فعلی",
        topicSlug: "users-groups",
        lessonSlug: "users",
        instructionsMd: `خروجی \`whoami\` را در \`/tmp/whoami.txt\` و خروجی \`id\` را در \`/tmp/id.txt\` ذخیره کنید.`,
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
          { level: 1, textFa: "هر فرمان را جداگانه به فایل خودش بفرستید." },
          { level: 2, textFa: "whoami نام را می‌دهد؛ id جزئیات UID را." },
          { level: 3, textFa: "whoami > /tmp/whoami.txt && id > /tmp/id.txt" },
        ],
      },
      {
        titleFa: "ایجاد کاربر لینوکس",
        topicSlug: "users-groups",
        lessonSlug: "users",
        instructionsMd: `کاربری به نام \`deploy\` با شل \`/bin/bash\` بسازید. خانهٔ کاربر لازم نیست پیچیده باشد؛ مهم این است که کاربر وجود داشته باشد و شل درست باشد.`,
        difficulty: "medium",
        maxScore: 6,
        validation: {
          checks: [{ type: "userExists", name: "deploy", shell: "/bin/bash" }],
        },
        hints: [
          { level: 1, textFa: "ساخت کاربر با useradd انجام می‌شود." },
          { level: 2, textFa: "گزینه -s شل ورود را مشخص می‌کند." },
          { level: 3, textFa: "useradd -s /bin/bash deploy" },
        ],
      },
      {
        titleFa: "بررسی فرآیندها",
        topicSlug: "processes",
        lessonSlug: "processes",
        instructionsMd: `خروجی \`ps aux\` را در \`/tmp/ps.txt\` ذخیره کنید تا فهرست فرآیندها را داشته باشید.`,
        difficulty: "easy",
        maxScore: 6,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/ps.txt" },
            { type: "fileContains", path: "/tmp/ps.txt", text: "PID" },
          ],
        },
        hints: [
          { level: 1, textFa: "ps aux را به فایل redirect کنید." },
          { level: 2, textFa: "از > /tmp/ps.txt استفاده کنید." },
          { level: 3, textFa: "ps aux > /tmp/ps.txt" },
        ],
      },
      {
        titleFa: "مصرف حافظه و دیسک",
        topicSlug: "memory",
        lessonSlug: "processes",
        instructionsMd: `خروجی \`free -m\` را در \`/tmp/free.txt\` و خروجی \`df -h\` را در \`/tmp/df.txt\` ذخیره کنید.`,
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
          { level: 1, textFa: "دو فرمان جدا را به دو فایل بفرستید." },
          { level: 2, textFa: "free حافظه و df دیسک را نشان می‌دهد." },
          { level: 3, textFa: "free -m > /tmp/free.txt && df -h > /tmp/df.txt" },
        ],
      },
    ],
    scenario: {
      titleFa: "سرور تولید کند شده است",
      incidentMd: `تیم محصول گزارش داده صفحه اصلی با تأخیر باز می‌شود. شما SRE شیفت هستید. علت ریشه‌ای را پیدا و برطرف کنید. تا وقتی مسئله حل نشده، علت را حدس نزنید؛ با داده جلو بروید.`,
      symptomsMd: `- پاسخ‌دهی کند\n- کاربران از «سنگین بودن سرور» می‌گویند\n- هشدار دقیق متریک هنوز تنظیم نشده`,
      observabilityMd: `ابزارهای موجود: \`top\`, \`ps\`, \`free -m\`, \`df -h\`, \`uptime\`. داشبورد خارجی ندارید؛ همین باکس تنها منبع حقیقت است.`,
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
