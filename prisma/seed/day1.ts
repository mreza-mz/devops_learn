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
    objectiveFa: "معماری لینوکس، سیستم فایل، فرمان‌های پایه، کاربران و فرآیندها را بشناسید و روی یک سرور کند عیب‌یابی کنید.",
    topicSlugs: ["linux-filesystem", "users-groups", "processes", "cpu", "memory", "disk"],
    lessons: [
      {
        slug: "linux-architecture",
        topicSlug: "linux-filesystem",
        titleFa: "معماری لینوکس",
        objectiveFa: "لایه‌های کرنل، شل و فضای کاربر را تشخیص دهید.",
        theoryMd: `لینوکس یک سیستم‌عامل شبه یونیکس است. سه لایه را همیشه جدا کنید:

1. **کرنل**: سخت‌افزار، فرآیند، حافظه، دیسک و شبکه را مدیریت می‌کند.
2. **فضای کاربر (user space)**: برنامه‌ها، شل، systemd و سرویس‌ها.
3. **شل**: واسط بین شما و کرنل؛ معمولاً Bash.

در تولید، وقتی سرور «کند» است، مشکل ممکن است در کرنل (I/O wait)، در فضای کاربر (فرآیند بد)، یا در پیکربندی باشد. بدون این مدل ذهنی، دستورها را شانسی اجرا می‌کنید.`,
        practicalMd: `با \`uname -a\` نسخه کرنل را ببینید. \`ls /proc\` نشان می‌دهد کرنل چه اطلاعاتی را به صورت فایل نمایش می‌دهد. \`echo $SHELL\` شل فعلی را مشخص می‌کند.`,
        exampleMd: `\`\`\`bash
uname -a
cat /etc/os-release
echo $SHELL
ls /proc | head
\`\`\``,
        commands: ["uname -a", "cat /etc/os-release", "echo $SHELL"],
      },
      {
        slug: "filesystem",
        topicSlug: "linux-filesystem",
        titleFa: "سیستم فایل",
        objectiveFa: "درخت FHS را بشناسید و بین فایل، دایرکتوری و لینک فرق بگذارید.",
        theoryMd: `در لینوکس «همه‌چیز فایل است». درخت استاندارد (FHS):

- \`/\` ریشه
- \`/bin\` و \`/usr/bin\` فرمان‌ها
- \`/etc\` پیکربندی
- \`/home\` خانه کاربران
- \`/var\` داده متغیر مثل لاگ
- \`/tmp\` موقت
- \`/proc\` و \`/sys\` واسط کرنل

مسیر مطلق از \`/\` شروع می‌شود. مسیر نسبی از دایرکتوری فعلی است. \`.\` همین‌جا و \`..\` والد است.`,
        practicalMd: `با \`pwd\`, \`ls -la\`, \`cd\`, \`find\` و \`tree\` (اگر نصب باشد) حرکت کنید. هرگز در تولید بدون تأیید در \`/\` فایل نسازید.`,
        exampleMd: `\`\`\`bash
pwd
ls -la /
cd /etc && ls
ls /var/log | head
\`\`\``,
        commands: ["pwd", "ls -la /", "cd /etc", "ls /var/log"],
      },
      {
        slug: "basic-commands",
        topicSlug: "linux-filesystem",
        titleFa: "فرمان‌های پایه",
        objectiveFa: "ساخت، مشاهده، کپی و جست‌وجوی فایل را انجام دهید.",
        theoryMd: `فرمان‌های روزمره SRE:

- \`ls\`, \`cd\`, \`pwd\`
- \`mkdir\`, \`touch\`, \`cp\`, \`mv\`, \`rm\`
- \`cat\`, \`less\`, \`head\`, \`tail\`
- \`grep\`, \`find\`, \`wc\`

\`rm -rf\` بدون مسیر دقیق خطرناک است. در آزمایشگاه هم عادت تأیید مسیر را تمرین کنید.`,
        practicalMd: `یک فضای کار در \`/home/student/workspace\` بسازید، فایل یادداشت ایجاد کنید و محتوا را با \`cat\` ببینید.`,
        exampleMd: `\`\`\`bash
mkdir -p /home/student/workspace
echo "hello" > /home/student/workspace/notes.txt
cat /home/student/workspace/notes.txt
\`\`\``,
        commands: ["mkdir -p /home/student/workspace", "echo hello > /home/student/workspace/notes.txt", "cat /home/student/workspace/notes.txt"],
      },
      {
        slug: "users",
        topicSlug: "users-groups",
        titleFa: "کاربران",
        objectiveFa: "مدل کاربر، گروه و شل ورود را بفهمید.",
        theoryMd: `هر فرآیند با یک UID اجرا می‌شود. فایل \`/etc/passwd\` کاربران را نگه می‌دارد و \`/etc/shadow\` هش رمز را. گروه در \`/etc/group\` است.

کاربر سیستمی (مثل \`www-data\`) برای سرویس است؛ کاربر انسانی شل ورود دارد. در تولید، سرویس را با root اجرا نکنید.`,
        practicalMd: `\`id\`, \`whoami\`, \`getent passwd\` و \`useradd\` را بشناسید. برای ساخت کاربر سرویس از \`--create-home\` و شل مشخص استفاده کنید.`,
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
        titleFa: "فرآیندها",
        objectiveFa: "PID، والد، وضعیت و مصرف منابع را بخوانید.",
        theoryMd: `هر برنامه در حال اجرا یک فرآیند است با PID. \`ps\` عکس لحظه‌ای می‌گیرد، \`top\` زنده است. ستون‌های مهم: \`%CPU\`, \`%MEM\`, \`STAT\`, \`COMMAND\`.

STAT رایج: \`R\` در حال اجرا، \`S\` خواب، \`Z\` زامبی، \`D\` خواب غیرقابل‌وقفه (معمولاً I/O).`,
        practicalMd: `با \`ps aux --sort=-%cpu | head\` پرمصرف‌ها را پیدا کنید. \`free -m\` حافظه و \`df -h\` دیسک را نشان می‌دهد.`,
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
        titleFa: "پیمایش سیستم فایل",
        topicSlug: "linux-filesystem",
        instructionsMd: `دایرکتوری \`/home/student/workspace\` را بسازید. سپس فایل \`/home/student/workspace/pwd.txt\` را ایجاد کنید و خروجی \`pwd\` را وقتی داخل همان دایرکتوری هستید در آن بنویسید.`,
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
        titleFa: "ساخت دایرکتوری و فایل",
        topicSlug: "linux-filesystem",
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
        titleFa: "بررسی فرآیندها",
        topicSlug: "processes",
        instructionsMd: `خروجی \`ps aux\` را در \`/tmp/ps.txt\` ذخیره کنید.`,
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
        titleFa: "مصرف منابع",
        topicSlug: "memory",
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
      {
        titleFa: "ایجاد کاربر لینوکس",
        topicSlug: "users-groups",
        instructionsMd: `کاربری به نام \`deploy\` با شل \`/bin/bash\` بسازید. خانه کاربر لازم نیست پیچیده باشد؛ مهم این است که کاربر وجود داشته باشد و شل درست باشد.`,
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
