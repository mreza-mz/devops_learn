import { days } from "./day1";

type DaySeed = (typeof days)[number];

function mc(
  promptFa: string,
  options: string[],
  correctAnswer: string,
  explanationFa: string,
  topicSlug: string,
) {
  return { type: "MULTIPLE_CHOICE", promptFa, options, correctAnswer, explanationFa, points: 3, topicSlug };
}

function tf(promptFa: string, correct: boolean, explanationFa: string, topicSlug: string) {
  return {
    type: "TRUE_FALSE",
    promptFa,
    options: ["درست", "نادرست"],
    correctAnswer: correct ? "درست" : "نادرست",
    explanationFa,
    points: 3,
    topicSlug,
  };
}

function cmd(promptFa: string, correctAnswer: string, explanationFa: string, topicSlug: string) {
  return { type: "COMMAND", promptFa, correctAnswer, explanationFa, points: 3, topicSlug };
}

function sa(promptFa: string, correctAnswer: string, explanationFa: string, topicSlug: string) {
  return { type: "SHORT_ANSWER", promptFa, correctAnswer, explanationFa, points: 3, topicSlug };
}

function ts(promptFa: string, correctAnswer: string, explanationFa: string, topicSlug: string) {
  return { type: "TROUBLESHOOTING", promptFa, correctAnswer, explanationFa, points: 3, topicSlug };
}

export const extraDays: DaySeed[] = [
  {
    dayNumber: 2,
    titleFa: "کاربران، گروه‌ها و مجوزها",
    objectiveFa:
      "از هویت کاربر تا chmod، chown و umask را قدم‌به‌قدم یاد بگیرید؛ بعد از هر قدم همان مهارت را در ترمینال تمرین می‌کنید.",
    topicSlugs: ["users-groups", "permissions"],
    lessons: [
      {
        slug: "groups",
        topicSlug: "users-groups",
        titleFa: "گروه یعنی چه و چرا به آن نیاز داریم؟",
        objectiveFa: "گروه اصلی، گروه‌های فرعی و فرمان‌های id، groupadd و usermod را از صفر بشناسید.",
        theoryMd: `دیروز کاربر ساختید. امروز می‌فهمید **گروه** چیست و چرا در سرور واقعی بدون آن کار نمی‌کنید.

هر فایل دو هویت دارد: **مالک** (یک کاربر) و **گروه**. اگر چند نفر باید یک پوشه را بخوانند، آن‌ها را در یک گروه می‌گذارید؛ لازم نیست به «همهٔ دنیا» دسترسی بدهید.

## مبتدی — هویت را بخوانید

دو فرمان اول:

- \`id\`: UID (شمارهٔ کاربر)، GID (گروه اصلی) و فهرست گروه‌ها
- \`groups\`: فقط نام گروه‌ها

در خروجی \`id\` این فیلدها را ببینید:

| فیلد | یعنی چه؟ |
| --- | --- |
| \`uid=\` | شمارهٔ کاربر. **root همیشه UID صفر** دارد |
| \`gid=\` | **گروه اصلی** همین کاربر |
| \`groups=\` | همهٔ گروه‌ها؛ اولی معمولاً همان گروه اصلی است |

فهرست گروه‌های سیستم در \`/etc/group\` است. هر خط یک گروه است. برای دیدن یک گروه مشخص: \`getent group ops\`

## کارورز — گروه بسازید و عضو کنید

- \`groupadd ops\`: گروه \`ops\` را بساز
- \`useradd -s /bin/bash deploy\`: کاربر بساز (اگر دیروز ساخته‌اید، این خط را تکرار نکنید)
- \`usermod -aG ops deploy\`: کاربر \`deploy\` را **اضافه** کن به گروه \`ops\`

علامت \`-a\` یعنی **append** (اضافه کن). اگر \`-a\` را نگذارید و بنویسید \`usermod -G ops deploy\`، لینوکس گروه‌های فرعی قبلی را پاک می‌کند و فقط \`ops\` می‌ماند. در تولید این اشتباه رایج است؛ همیشه \`-aG\` را با هم استفاده کنید.

گروه \`sudo\` (دبیان/اوبونتو) یا \`wheel\` (رد‌هت) برای کار مدیریتی است. عضویت در آن یعنی می‌توان با \`sudo\` فرمان root زد — نه اینکه خود کاربر root شود.

## سنیور — الگوی عملیاتی

روی سرور تولید، برنامه را با \`root\` اجرا نمی‌کنند. یک کاربر سرویس (مثلاً \`deploy\`) می‌سازند، آن را در گروه کاری (\`ops\`) می‌گذارند، و فقط همان گروه به \`/opt/app\` دسترسی دارد. فردا مجوز فایل را دقیق می‌چینید؛ امروز فقط هویت را درست کنید.`,
        practicalMd: `اول \`id\` و \`groups\` را بزنید و فیلد \`gid=\` را پیدا کنید.

بعد \`getent group\` را ببینید. برای ساخت گروه در تمرین، \`groupadd\` لازم است و معمولاً فقط root می‌تواند آن را بزند — در این آزمایشگاه شما root هستید.

اگر کاربر از قبل وجود دارد، \`useradd\` خطا می‌دهد؛ اشکالی ندارد. مهم این است که در نهایت \`id deploy\` گروه \`ops\` را نشان بدهد.`,
        exampleMd: `\`\`\`bash
id
groups
getent group
groupadd ops
id ci || useradd -s /bin/bash ci
usermod -aG ops deploy
id deploy
\`\`\`

\`id deploy\` باید \`ops\` را در فهرست \`groups=\` نشان بدهد.`,
        commands: ["id", "groups", "getent group", "groupadd ops", "usermod -aG ops deploy"],
      },
      {
        slug: "permissions",
        topicSlug: "permissions",
        titleFa: "مجوز فایل: rwx و chmod",
        objectiveFa: "سه دستهٔ مالک/گروه/دیگران و عددهایی مثل 644 و 600 را بخوانید و اعمال کنید.",
        theoryMd: `حالا که کاربر و گروه دارید، لینوکس می‌پرسد: **چه کسی حق دارد این فایل را بخواند، بنویسد یا اجرا کند؟**

## مبتدی — سه حرف، سه دسته

هر فایل سه دستهٔ دسترسی دارد:

1. **مالک (user / owner)** — کسی که فایل مال اوست
2. **گروه (group)** — اعضای گروه فایل
3. **دیگران (other)** — بقیهٔ کاربران سیستم

برای هر دسته سه حرف:

| حرف | معنی | عدد |
| --- | --- | --- |
| \`r\` | خواندن (read) | ۴ |
| \`w\` | نوشتن (write) | ۲ |
| \`x\` | اجرا (execute) | ۱ |
| \`-\` | آن حق را ندارد | ۰ |

عدد هر دسته جمع همین سه تا است. مثال: خواندن+نوشتن = ۴+۲ = **۶**. فقط خواندن = **۴**. هیچ‌کدام = **۰**. اجرا برای پوشه یعنی «وارد شدن».

فرمان دیدن مجوز: \`ls -l فایل\`

نمونهٔ خروجی: \`-rw-r----- 1 alice ops 12 ... secret.env\`

از چپ: نوع (\`-\` یعنی فایل)، بعد ۹ حرف مجوز (\`rw-r-----\`)، بعد مالک، بعد گروه.

## کارورز — chmod با عدد

\`chmod\` مجوز را عوض می‌کند. سه رقم پشت‌سرهم: مالک، گروه، دیگران.

| عدد | حروف | یعنی چه؟ |
| --- | --- | --- |
| \`644\` | \`rw-r--r--\` | مالک بخواند و بنویسد؛ بقیه فقط بخوانند. فایل معمولی وب/مستند |
| \`640\` | \`rw-r-----\` | مالک rw؛ گروه فقط بخواند؛ دیگران هیچ. مناسب تنظیمات تیمی |
| \`600\` | \`rw-------\` | فقط مالک. مناسب راز، کلید، \`.env\` |
| \`755\` | \`rwxr-xr-x\` | پوشه یا اسکریپت عمومی: مالک همه‌کاره، بقیه اجرا/ورود |

پس \`chmod 640 /tmp/secret\` یعنی دقیقاً \`rw-r-----\`.

\`chmod 600 a.txt\` یعنی فقط مالک بخواند و بنویسد.

## سنیور — انتخاب مجوز در تولید

قانون ساده: **کمترین دسترسی که کار را راه بیندازد.** فایل راز را \`644\` نگذارید؛ \`600\` یا حداکثر \`640\` اگر گروه ops باید بخواند. \`chmod 777\` تقریباً هیچ‌وقت پاسخ درست در تولید نیست.

پوشه بدون \`x\` حتی اگر \`r\` داشته باشد، قابل ورود نیست. اگر اسکریپت \`Permission denied\` داد، گاهی مشکل \`x\` است نه مالک — قدم بعد \`ls -l\` را برای عیب‌یابی کامل می‌کند.`,
        practicalMd: `یک فایل در \`/tmp\` بسازید، \`chmod 640\` بزنید، بعد \`ls -l\` را بخوانید. باید \`rw-r-----\` ببینید.

برای راز برنامه از \`600\` استفاده کنید. مسیر تمرین‌ها مطلق است: \`/opt/app/...\` نه \`opt/app\`.`,
        exampleMd: `\`\`\`bash
touch /tmp/secret
chmod 640 /tmp/secret
ls -l /tmp/secret
chmod 600 /tmp/secret
ls -l /tmp/secret
\`\`\``,
        commands: ["touch /tmp/secret", "chmod 640 /tmp/secret", "ls -l /tmp/secret", "chmod 600 /tmp/secret"],
      },
      {
        slug: "ownership",
        topicSlug: "permissions",
        titleFa: "مالکیت، umask و Permission denied",
        objectiveFa: "chown، umask و اولین فرمان عیب‌یابی دسترسی را طوری یاد بگیرید که در آزمون غافلگیر نشوید.",
        theoryMd: `\`chmod\` می‌گوید *چه حقی*. \`chown\` می‌گوید *مال چه کسی*. این دو را قاطی نکنید.

## مبتدی — دیدن مالک، عوض کردن مالک

\`ls -l فایل\` ستون سوم مالک و ستون چهارم گروه است.

فرمان تغییر مالکیت:

\`chown کاربر:گروه فایل\`

مثال دقیق که در آزمون هم می‌آید:

\`chown alice:ops file\`

یعنی: مالک فایل بشود \`alice\` و گروه فایل بشود \`ops\`. نه «فقط گروه»، نه تغییر مجوز.

اگر فقط گروه را بخواهید عوض کنید: \`chown :ops file\` یا \`chgrp ops file\`. اگر فقط کاربر: \`chown alice file\`.

## کارورز — فایل جدید چرا ۶۴۴ می‌شود؟ umask

وقتی \`touch\` یا \`echo > فایل\` می‌زنید، لینوکس از یک **مجوز پایه** شروع می‌کند و بعد **umask** را از آن کم می‌کند.

- پایهٔ رایج فایل: \`666\` (rw برای همه)
- پایهٔ رایج پوشه: \`777\`

\`umask\` بیت‌هایی است که **برداشته می‌شوند**. umask رایج \`022\` یعنی از دیگران و گروه، نوشتن را می‌گیرد → فایل جدید معمولاً \`644\` می‌شود. umask \`077\` سخت‌گیرانه‌تر است → فایل جدید \`600\`.

پس جملهٔ درست این است: **umask مجوز پیش‌فرض فایل‌های جدید را تحت تأثیر قرار می‌دهد.** chmod روی فایل موجود اثر می‌گذارد؛ umask روی فایل‌هایی که از این به بعد ساخته می‌شوند.

دیدن umask فعلی: \`umask\`

## کارورز — Permission denied؛ اول چه کار کنید؟

خطای \`Permission denied\` یعنی هویت فعلی شما حق آن کار را ندارد — خواندن، نوشتن، اجرا، یا ورود به پوشه.

**اولین فرمان بررسی همیشه این است:** \`ls -l\` (روی همان فایل یا پوشه).

از خروجی بفهمید:

1. مالک کیست؟ گروه چیست؟
2. نه حرف مجوز چیست؟
3. شما \`whoami\` هستید یا عضو آن گروه؟

بعد تازه \`chmod\` یا \`chown\` یا \`usermod -aG\`. حدس نزنید و \`chmod 777\` نزنید.

## سنیور — بیت‌های ویژه در تولید

سه بیت اضافی روی همان \`ls -l\` دیده می‌شوند:

| بیت | کار | مثال واقعی |
| --- | --- | --- |
| **SUID** | برنامه با حق مالک اجرا می‌شود | \`passwd\` باید فایل سایه را عوض کند |
| **SGID** روی پوشه | فایل جدید گروه پوشه را می‌گیرد | پوشهٔ مشترک تیم |
| **sticky** روی پوشه | فقط مالک فایل (یا root) می‌تواند فایل را پاک کند | \`/tmp\` |

در روزهای اول لازم نیست این‌ها را با عدد \`4xxx\` حفظ کنید؛ فقط بدانید وجود دارند و در تولید (به‌خصوص SUID روی باینری ناشناس) مهم‌اند. اگر فایلی راز است، بعد از کپی حتماً \`ls -l\` را دوباره ببینید — کپی گاهی مجوز را عوض می‌کند.`,
        practicalMd: `یک فایل بسازید، \`ls -l\` را بخوانید، بعد \`chown\` را روی کاربر و گروهی که ساخته‌اید بزنید. دوباره \`ls -l\`.

\`umask\` را بدون آرگومان اجرا کنید تا عدد فعلی را ببینید. اگر \`Permission denied\` دیدید، همان فایل را با \`ls -l\` نگاه کنید؛ اولین واکنش این است.`,
        exampleMd: `\`\`\`bash
echo TOKEN=local > /tmp/owned.txt
ls -l /tmp/owned.txt
chown deploy:ops /tmp/owned.txt
ls -l /tmp/owned.txt
umask
\`\`\``,
        commands: ["ls -l /tmp/owned.txt", "chown deploy:ops /tmp/owned.txt", "umask"],
      },
    ],
    exercises: [
      {
        titleFa: "ساخت گروه ops",
        topicSlug: "users-groups",
        lessonSlug: "groups",
        instructionsMd: `چگونه یک گروه کاری بسازید و کاربر سرویس را بدون از دست رفتن عضویت‌های قبلی به آن اضافه کنید؟

هدف این است که گروه \`ops\` و کاربر \`deploy\` وجود داشته باشند، شل کاربر \`/bin/bash\` باشد و \`deploy\` در فهرست اعضای \`ops\` دیده شود. اگر کاربر از قبل وجود دارد، همان کاربر را اصلاح کنید و کاربر تکراری نسازید.`,
        difficulty: "medium",
        maxScore: 10,
        validation: {
          checks: [
            { type: "commandExitCode", command: "getent group ops", expected: 0 },
            { type: "userExists", name: "deploy", group: "ops" },
          ],
        },
        hints: [
          { level: 1, textFa: "ابتدا هویت‌های لازم را آماده کنید، سپس عضویت گروهی کاربر را تغییر دهید." },
          { level: 2, textFa: "برای افزودن گروه فرعی، گزینهٔ append را همراه گزینهٔ گروه‌ها به‌کار ببرید؛ حذف آن عضویت‌های قبلی را جایگزین می‌کند." },
          { level: 3, textFa: "groupadd ops; useradd -s /bin/bash deploy; usermod -aG ops deploy" },
        ],
      },
      {
        titleFa: "کاربر ci با شل bash",
        topicSlug: "users-groups",
        lessonSlug: "groups",
        instructionsMd: `چگونه کاربر خط لوله‌ای بسازید که شل ورود مشخصی داشته باشد؟

هدف این است که کاربر \`ci\` وجود داشته باشد و شل ثبت‌شدهٔ آن دقیقاً \`/bin/bash\` باشد. اگر کاربر از قبل وجود دارد، نتیجهٔ نهایی را اصلاح کنید؛ ساخت home سفارشی لازم نیست.`,
        difficulty: "easy",
        maxScore: 10,
        validation: { checks: [{ type: "userExists", name: "ci", shell: "/bin/bash" }] },
        hints: [
          { level: 1, textFa: "هنگام ایجاد یا اصلاح کاربر، شل ورود بخشی از مشخصات حساب است." },
          { level: 2, textFa: "گزینهٔ تعیین شل را فراموش نکنید؛ مقدار باید دقیقاً /bin/bash باشد." },
          { level: 3, textFa: "id ci || useradd -s /bin/bash ci" },
        ],
      },
      {
        titleFa: "مجوز محرمانه",
        topicSlug: "permissions",
        lessonSlug: "permissions",
        instructionsMd: `چگونه یک راز برنامه را در مسیر درست ایجاد کنید تا فقط مالک بتواند آن را بخواند و تغییر دهد؟

هدف این است که فایل \`/opt/app/secret.env\` شامل متن دقیق \`TOKEN=local\` باشد و mode آن دقیقاً \`600\` (\`rw-------\`) ثبت شود. در صورت نبودن پوشهٔ والد، آن را نیز ایجاد کنید.`,
        difficulty: "easy",
        maxScore: 10,
        validation: {
          checks: [
            { type: "fileContains", path: "/opt/app/secret.env", text: "TOKEN=local" },
            { type: "commandOutputContains", command: "stat -c %a /opt/app/secret.env", text: "600" },
          ],
        },
        hints: [
          { level: 1, textFa: "این کار سه بخش دارد: آماده‌کردن مسیر، نوشتن مقدار راز و محدودکردن دسترسی." },
          { level: 2, textFa: "مسیر مطلق /opt/app را بررسی کنید و mode را روی 600 بگذارید؛ دیگران نباید هیچ دسترسی داشته باشند." },
          { level: 3, textFa: "mkdir -p /opt/app && echo TOKEN=local > /opt/app/secret.env && chmod 600 /opt/app/secret.env" },
        ],
      },
      {
        titleFa: "مالک و گروه فایل",
        topicSlug: "permissions",
        lessonSlug: "ownership",
        instructionsMd: `چگونه مالکیت یک فایل را به هویت کاربر و گروه مناسب واگذار کنید؟

هدف این است که فایل \`/tmp/owned.txt\` وجود داشته باشد، مالک آن \`deploy\` و گروه آن \`ops\` باشد. اگر این کاربر یا گروه هنوز وجود ندارد، ابتدا پیش‌نیازها را فراهم کنید.`,
        difficulty: "medium",
        maxScore: 10,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/owned.txt" },
            { type: "commandOutputContains", command: "stat -c %U:%G /tmp/owned.txt", text: "deploy:ops" },
          ],
        },
        hints: [
          { level: 1, textFa: "مجوز فایل و مالکیت آن دو مفهوم جدا هستند؛ این تمرین دربارهٔ مالکیت است." },
          { level: 2, textFa: "کاربر deploy و گروه ops باید پیش از تغییر مالکیت وجود داشته باشند؛ قالب مالک و گروه با دونقطه جدا می‌شود." },
          { level: 3, textFa: "echo owned > /tmp/owned.txt && chown deploy:ops /tmp/owned.txt" },
        ],
      },
    ],
    scenario: {
      titleFa: "فایل محرمانه برای همه خوانا است",
      incidentMd: `ممیزی امنیت گزارش داده فایل اسرار برنامه بیش از حد باز است.

چگونه مجوز فعلی \`/opt/app/open.env\` را بررسی و آن را با اصل کمترین دسترسی اصلاح می‌کنید؟ هدف این است که فقط مالک امکان خواندن و نوشتن داشته باشد و mode نهایی دقیقاً \`600\` باشد.`,
      symptomsMd: "هر کاربر محلی می‌تواند راز را بخواند.",
      observabilityMd: "پیش از تغییر، مالک، گروه و نه بیت مجوز فایل را مشاهده کنید. mode اولیه 666 است؛ نتیجهٔ پذیرفته‌شده 600 است.",
      environmentMd: "سرور لینوکس با /opt/app/open.env",
      hiddenRootCause: "File mode 666 on /opt/app/open.env",
      investigationPath: ["بررسی مجوز فعلی فایل راز", "اعمال کمترین دسترسی و تأیید mode برابر 600"],
      validation: {
        checks: [{ type: "commandOutputContains", command: "stat -c %a /opt/app/open.env", text: "600" }],
      },
      labSetup: {
        commands: ["mkdir -p /opt/app", "echo SECRET=bad > /opt/app/open.env", "chmod 666 /opt/app/open.env"],
      },
      difficulty: "easy",
    },
    exam: {
      titleFa: "آزمون روز ۲",
      questions: [
        mc(
          "مبتدی — chmod 644 معمولاً معادل کدام مجوز حرفی است؟",
          ["rwxrwxrwx", "rw-r--r--", "rw-------", "r-x------"],
          "rw-r--r--",
          "۶ یعنی rw برای مالک، ۴ یعنی فقط r برای گروه و دیگران.",
          "permissions",
        ),
        sa(
          "مبتدی — سه حرف مجوز خواندن، نوشتن و اجرا را به انگلیسی و پشت‌سرهم بنویسید.",
          "rwx",
          "r=read ، w=write ، x=execute.",
          "permissions",
        ),
        mc(
          "مبتدی — گروه اصلی کاربر در خروجی فرمان id کدام فیلد است؟",
          ["uid", "gid", "pid", "ppid"],
          "gid",
          "gid یعنی group id؛ گروه اصلی کاربر است. groups= فهرست همهٔ گروه‌هاست.",
          "users-groups",
        ),
        tf(
          "مبتدی — کاربر root همیشه UID صفر دارد.",
          true,
          "UID 0 یعنی root؛ این قرارداد لینوکس است نه یک نام تصادفی.",
          "users-groups",
        ),
        mc(
          "کارورز — فهرست گروه‌های سیستم در کدام فایل است؟",
          ["/etc/group", "/etc/hosts", "/etc/fstab", "/var/group"],
          "/etc/group",
          "هر خط یک گروه است. با getent group هم می‌توان خواند.",
          "users-groups",
        ),
        tf(
          "کارورز — usermod -aG گروه را جایگزین همهٔ گروه‌های فرعی می‌کند.",
          false,
          "برعکس: -a یعنی append و گروه را اضافه می‌کند. بدون -a مقدار -G جایگزین کل گروه‌های فرعی می‌شود.",
          "users-groups",
        ),
        cmd(
          "کارورز — فرمان تغییر مجوز فایل a.txt به ۶۰۰ (فقط مالک) را بنویسید.",
          "chmod 600 a.txt",
          "۶۰۰ یعنی rw------- ؛ chmod مجوز را عوض می‌کند نه مالک را.",
          "permissions",
        ),
        mc(
          "کارورز — فرمان chown alice:ops file چه می‌کند؟",
          ["فقط گروه فایل را عوض می‌کند", "مالک را alice و گروه را ops می‌کند", "فقط مجوز را عوض می‌کند", "فایل را حذف می‌کند"],
          "مالک را alice و گروه را ops می‌کند",
          "الگوی chown کاربر:گروه فایل است. chmod مجوز است؛ chown مالکیت است.",
          "permissions",
        ),
        tf(
          "سنیور — umask مجوز پیش‌فرض فایل‌های جدید را تحت تأثیر قرار می‌دهد.",
          true,
          "umask بیت‌هایی را از مجوز پایه کم می‌کند. chmod روی فایل موجود اثر می‌گذارد؛ umask روی فایل‌هایی که بعداً ساخته می‌شوند.",
          "permissions",
        ),
        ts(
          "سنیور — اگر Permission denied گرفتید، اولین فرمان بررسی چیست؟ (همان فایلی که خطا داده)",
          "ls -l",
          "اول مالک و نه حرف مجوز را با ls -l ببینید؛ بعد chmod یا chown. chmod 777 اولین پاسخ نیست.",
          "permissions",
        ),
      ],
    },
  },
  {
    dayNumber: 3,
    titleFa: "فرآیندها و سیگنال‌ها",
    objectiveFa:
      "فرآیند در حال اجرا را پیدا کنید، سیگنال درست بفرستید، و فرق TERM و KILL و اولویت nice را از مبتدی تا تولید بفهمید.",
    topicSlugs: ["processes", "signals", "cpu"],
    lessons: [
      {
        slug: "signals",
        topicSlug: "signals",
        titleFa: "سیگنال: پیام به فرآیند",
        objectiveFa: "شماره و معنی SIGTERM و SIGKILL را حفظ کنید و ترتیب توقف امن را یاد بگیرید.",
        theoryMd: `دیروز فایل را مدیریت کردید. امروز برنامهٔ **در حال اجرا** را مدیریت می‌کنید.

وقتی برنامه‌ای اجرا می‌شود، یک فرآیند با PID می‌سازد. **سیگنال** پیامی است که به آن فرآیند می‌فرستید: بایست، ادامه بده، خارج شو.

## مبتدی — دو سیگنال که باید حفظ کنید

| نام | شماره | یعنی چه؟ |
| --- | --- | --- |
| \`SIGTERM\` | **۱۵** | درخواست مؤدبانه: کارهایت را تمام کن و خارج شو |
| \`SIGKILL\` | **۹** | اجباری؛ فرآیند نمی‌تواند آن را بگیرد یا رد کند |
| \`SIGHUP\` | ۱ | قطع نشست / از نو بخوان پیکربندی (بسته به برنامه) |
| \`SIGINT\` | ۲ | همان Ctrl+C |

فهرست کامل: \`kill -l\` — در خروجی \`TERM\` و \`KILL\` را پیدا کنید.

فرمان ارسال:

- \`kill 42\` یعنی به PID ۴۲ سیگنال **TERM** بفرست (پیش‌فرض ۱۵ است؛ لازم نیست \`-15\` بنویسید)
- \`kill -9 42\` یعنی KILL

## کارورز — ترتیب توقف امن

همیشه: **اول TERM، چند ثانیه صبر، اگر نرفت KILL.**

KILL فرصت بستن فایل و ذخیره را نمی‌دهد؛ در دیتابیس می‌تواند فساد بیاورد. برای تمرین \`sleep\` اشکالی ندارد؛ در تولید عادت TERM را نگه دارید.

\`SIGKILL\` **قابل catch شدن نیست**؛ برنامه نمی‌تواند handler برای ۹ بنویسد. TERM را می‌توان گرفت و تمیز خارج شد.

## سنیور — در تولید

روی سرور واقعی به‌جای \`kill\` دستی، \`systemctl stop\` سرویس را با TERM می‌بندد و بعد از timeout به KILL می‌رود. \`kill -9\` آخرین ابزار شیفت است نه اولین.`,
        practicalMd: `\`kill -l\` را بزنید و TERM و KILL را ببینید. یک \`sleep\` در پس‌زمینه راه بیندازید و با \`kill\` (بدون ۹) تمامش کنید.`,
        exampleMd: `\`\`\`bash
kill -l
sleep 100 &
kill $!
\`\`\`

\`$!\` PID آخرین فرآیند پس‌زمینه است.`,
        commands: ["kill -l", "ps aux | head"],
      },
      {
        slug: "jobs",
        topicSlug: "processes",
        titleFa: "پس‌زمینه، nohup و وضعیت فرآیند",
        objectiveFa: "فرآیند را پس‌زمینه ببرید و معنی STAT مثل Z را بخوانید.",
        theoryMd: `تا وقتی ترمینال باز است، برنامهٔ پیش‌زمینه آن را اشغال می‌کند. با \`&\` کار را به **پس‌زمینه** می‌فرستید و ترمینال آزاد می‌ماند.

## مبتدی — جاب

- \`sleep 30 &\`: اجرا در پس‌زمینه
- \`jobs\`: جاب‌های همین شل
- \`ps aux\`: فهرست فرآیندها. \`a\` و \`x\` یعنی همهٔ کاربران و حتی بدون ترمینال — بنابراین **\`ps aux\` همهٔ فرآیندها را نشان می‌دهد.**

ستون \`STAT\` در \`ps\`:

| حرف | معنی |
| --- | --- |
| \`R\` | در حال اجرا یا آماده |
| \`S\` | خواب (منتظر) |
| \`Z\` | **زامبی**: تمام شده ولی پدر هنوز wait نکرده |
| \`T\` | متوقف |

پس \`STAT\` برابر \`Z\` یعنی زامبی، نه «در حال اجرا».

## کارورز — nohup و HUP

اگر ترمینال را ببندید، شل معمولاً \`SIGHUP\` می‌فرستد و فرآیندهای وابسته می‌میرند. \`nohup فرمان &\` در برابر **HUP** مقاوم است (نه در برابر KILL). خروجی را اغلب به \`nohup.out\` می‌نویسد.

مثال: \`nohup sleep 300 >/dev/null 2>&1 &\`

## سنیور — systemd جایگزین nohup است

در تولید، سرویس را با unit فایل systemd نگه می‌دارند نه با nohup روی SSH. nohup برای آزمایشگاه و اسکریپت موقت است. اگر فرآیندی بعد از قطع SSH مُرد، اول HUP را چک کنید نه کرنل را.`,
        practicalMd: `یک \`sleep 300 &\` بزنید، \`jobs\` و \`ps\` را ببینید. در تمرین از شما می‌خواهیم \`sleep\` در \`ps\` دیده شود.`,
        exampleMd: `\`\`\`bash
sleep 30 &
jobs
ps aux | grep sleep
\`\`\``,
        commands: ["sleep 2 &", "jobs", "ps aux | head"],
      },
      {
        slug: "priority",
        topicSlug: "cpu",
        titleFa: "CPU، top و اولویت nice",
        objectiveFa: "بار CPU را زنده ببینید و بفهمید عدد nice پایین‌تر یعنی سهم بیشتر.",
        theoryMd: `اگر سرور کند است، بعد از \`uptime\` معمولاً \`top\` یا \`ps\` را می‌زنید.

## مبتدی — top

\`top\` نمای **زنده** CPU و فرآیندهاست. با \`q\` خارج می‌شوید. برای عکس لحظه‌ای همان \`ps aux --sort=-%cpu | head\` کافی است.

پس اگر پرسیدند ابزار تعاملی دیدن CPU چیست، جواب \`top\` است (htop هم همان کار را می‌کند اگر نصب باشد).

## کارورز — nice

هر فرآیند یک مقدار **nice** دارد (معمولاً از ۲۰- تا ۱۹).

- nice **کمتر** (مثلاً ۵-): اولویت **بالاتر** → سهم CPU بیشتر
- nice **بیشتر** (مثلاً ۱۰): مؤدب‌تر → سهم کمتر وقتی دیگران هم کار دارند

پس جملهٔ درست: **اولویت nice کمتر یعنی سهم CPU بیشتر.**

\`nice -n 10 فرمان\` فرآیند جدید را با nice ۱۰ شروع می‌کند. \`renice\` برای فرآیند موجود است.

## سنیور — شیفت تولید

قبل از renice روی جاوا یا دیتابیس، بفهمید چرا CPU پر است. پایین آوردن nice یک گزارش‌گیر ممکن است API را نجات بدهد؛ بالا بردن اولویت یک کران‌جاب ممکن است سایت را خفه کند. اول \`top\`، بعد تصمیم.`,
        practicalMd: `\`top\` را باز کنید، یک نگاه به \`%CPU\` بیندازید، با \`q\` خارج شوید. \`uptime\` را هم کنارش ببینید.`,
        exampleMd: `\`\`\`bash
uptime
ps aux --sort=-%cpu | head
\`\`\`

اگر \`top\` را در اسکریپت می‌گذارید، از \`top -b -n 1\` برای یک عکس غیرتعاملی استفاده کنید.`,
        commands: ["uptime", "ps aux --sort=-%cpu | head"],
      },
    ],
    exercises: [
      {
        titleFa: "ثبت سیگنال‌ها",
        topicSlug: "signals",
        lessonSlug: "signals",
        instructionsMd: `چگونه فهرست سیگنال‌های سیستم را برای بررسی بعدی در یک فایل ثبت می‌کنید؟

هدف این است که فایل \`/tmp/signals.txt\` ایجاد شود و خروجی فهرست سیگنال‌ها را در خود داشته باشد؛ متن \`TERM\` باید داخل فایل دیده شود.`,
        difficulty: "easy",
        maxScore: 15,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/signals.txt" },
            { type: "fileContains", path: "/tmp/signals.txt", text: "TERM" },
          ],
        },
        hints: [
          { level: 1, textFa: "از قابلیت نمایش فهرست سیگنال‌ها استفاده کنید و خروجی آن را ثبت کنید." },
          { level: 2, textFa: "به‌جای چاپ روی ترمینال، stdout را با عملگر بازنویسی به مسیر دقیق /tmp/signals.txt هدایت کنید." },
          { level: 3, textFa: "kill -l > /tmp/signals.txt" },
        ],
      },
      {
        titleFa: "شناسایی فرآیند sleep",
        topicSlug: "processes",
        lessonSlug: "jobs",
        instructionsMd: `چگونه یک فرآیند انتظار را طوری اجرا می‌کنید که ترمینال آزاد بماند؟

هدف این است که یک فرآیند با نام \`sleep\` و مدت \`300\` ثانیه در پس‌زمینه در حال اجرا باشد و در فهرست فرآیندها دیده شود.`,
        difficulty: "easy",
        maxScore: 15,
        labSetup: { commands: [] },
        validation: { checks: [{ type: "processRunning", name: "sleep" }] },
        hints: [
          { level: 1, textFa: "شل می‌تواند یک کار را بدون اشغال پیش‌زمینه اجرا کند." },
          { level: 2, textFa: "عملگر & باید پس از فرمان قرار بگیرد؛ مدت انتظار دقیقاً 300 ثانیه است." },
          { level: 3, textFa: "sleep 300 &" },
        ],
      },
    ],
    scenario: {
      titleFa: "فرآیند زامبی‌نما CPU را قفل کرده",
      incidentMd: `بار CPU بالا مانده و یک فرآیند تست متوقف نشده است.

چگونه فرآیند پرمصرف \`yes\` را پیدا و با کم‌خطرترین سیگنال متوقف می‌کنید؟ ابتدا وضعیت و PID را مشاهده کنید، توقف مؤدبانه را امتحان کنید و فقط اگر فرآیند باقی ماند سراغ توقف اجباری بروید. معیار پذیرش این است که هیچ فرآیند \`yes\` در حال اجرا نباشد.`,
      symptomsMd: "load بالا، پاسخ کند",
      observabilityMd: "بار سیستم، فهرست فرآیندها و PID فرآیند yes را پیش از ارسال سیگنال بررسی کنید.",
      environmentMd: "sandbox لینوکس",
      hiddenRootCause: "Background yes process",
      investigationPath: ["مشاهدهٔ بار و فرآیندهای فعال", "یافتن PID مربوط به yes", "ارسال TERM و بررسی نتیجه پیش از KILL"],
      validation: { checks: [{ type: "processNotRunning", name: "yes" }] },
      labSetup: { commands: ["bash -lc 'nohup yes >/dev/null 2>&1 &'"] },
      difficulty: "medium",
    },
    exam: {
      titleFa: "آزمون روز ۳",
      questions: [
        mc("مبتدی — شمارهٔ سیگنال SIGKILL چیست؟", ["9", "15", "1", "2"], "9", "SIGKILL همیشه ۹ است و اجباری است.", "signals"),
        mc("مبتدی — شمارهٔ سیگنال SIGTERM چیست؟", ["9", "15", "19", "20"], "15", "TERM=۱۵ ؛ پیش‌فرض فرمان kill همین است.", "signals"),
        sa("مبتدی — فرمان فهرست کردن سیگنال‌ها چیست؟", "kill -l", "kill -l نام و شمارهٔ سیگنال‌ها را چاپ می‌کند.", "signals"),
        tf("کارورز — SIGKILL قابل catch شدن است.", false, "فرآیند نمی‌تواند سیگنال ۹ را بگیرد یا نادیده بگیرد.", "signals"),
        cmd(
          "کارورز — فرمان ارسال TERM به PID ۴۲ را بنویسید (پیش‌فرض kill).",
          "kill 42",
          "kill بدون شماره یعنی SIGTERM. kill -9 42 یعنی KILL.",
          "signals",
        ),
        tf("کارورز — ps aux همهٔ فرآیندها را نشان می‌دهد.", true, "a کاربران دیگر و x فرآیند بدون tty را هم می‌آورد.", "processes"),
        mc("کارورز — در خروجی ps مقدار STAT برابر Z یعنی چه؟", ["در حال اجرا", "زامبی", "توقف", "خواب"], "زامبی", "Z=zombie ؛ فرآیند تمام شده ولی جمع نشده.", "processes"),
        mc("کارورز — nohup در برابر کدام سیگنال مقاوم است؟", ["KILL", "HUP", "STOP", "INT"], "HUP", "nohup یعنی no hangup؛ در برابر KILL مقاوم نیست.", "signals"),
        tf(
          "سنیور — اولویت nice کمتر یعنی سهم CPU بیشتر.",
          true,
          "nice پایین‌تر = اولویت بالاتر. nice ۱۰ مؤدب‌تر از nice صفر است.",
          "cpu",
        ),
        ts("سنیور — ابزار تعاملی دیدن زندهٔ CPU چیست؟", "top", "top نمای زنده است. با q خارج می‌شوید. htop هم پذیرفته است اگر همان را بنویسید.", "cpu"),
      ],
    },
  },
  {
    dayNumber: 4,
    titleFa: "دیسک، حافظه و I/O",
    objectiveFa: "فرق پر شدن فضا و inode، ستون available حافظه، و iowait را طوری یاد بگیرید که هشدار دیسک را حدس نزنید.",
    topicSlugs: ["disk", "memory", "io"],
    lessons: [
      {
        slug: "disk",
        topicSlug: "disk",
        titleFa: "فضای دیسک و inode",
        objectiveFa: "df و du را از هم جدا کنید و خطای No space left on device را بشناسید.",
        theoryMd: `وقتی برنامه نمی‌تواند بنویسد، اولین حدس «دیسک پر است» است. گاهی درست است؛ گاهی inode تمام شده و فضا هنوز خالی است.

## مبتدی — دو فرمان

| فرمان | چه چیزی را می‌گوید؟ |
| --- | --- |
| \`df -h\` | فضای **فایل‌سیستم‌ها** (کل دیسک‌های سوارشده)، واحد خوانا |
| \`df -i\` | تعداد **inode** آزاد/مصرف‌شده |
| \`du -sh مسیر\` | مصرف **همان مسیر** (یک پوشه یا فایل) |

\`df\` برای کل دیسک است؛ \`du\` برای «این پوشه چقدر گرفته؟». اگر \`df\` پر است، با \`du -sh /*\` بگردید کجا.

\`/tmp\` طبق FHS برای دادهٔ **موقت** است؛ فایل پرکننده را همین‌جا زیاد می‌بینید.

## کارورز — دو جور پر شدن

1. فضا پر: \`df -h\` نزدیک ۱۰۰٪. خطای معروف انگلیسی: **\`No space left on device\`**
2. inode پر: \`df -h\` جا دارد ولی \`df -i\` ۱۰۰٪ است. معمولاً میلیون‌ها فایل کوچک.

اولین فرمان بررسی پر بودن ریشه: \`df -h\` (یا \`df -h /\`).

## سنیور — شیفت تولید

لاگ در \`/var/log\`، کانتینر در \`/var/lib/docker\`، و \`/tmp\` سه مظنون همیشگی‌اند. قبل از پاک کردن، \`du -sh\` روی همان مسیر. فایل بازِ حذف‌شده هنوز فضا می‌گیرد تا فرآیند بسته شود — \`lsof\` در روزهای بعد.`,
        practicalMd: `\`df -h\` و \`df -i\` را مقایسه کنید. \`du -sh /tmp\` را ببینید. اگر فایل \`/tmp/fill.dat\` دیدید همان پرکنندهٔ تمرین است.`,
        exampleMd: `\`\`\`bash
df -h
df -i
du -sh /tmp
ls -lh /tmp
\`\`\``,
        commands: ["df -h", "df -i", "du -sh /tmp"],
      },
      {
        slug: "memory-io",
        topicSlug: "memory",
        titleFa: "حافظه، cache و iowait",
        objectiveFa: "ستون available را از free جدا کنید و iowait را با کمبود RAM اشتباه نگیرید.",
        theoryMd: `لینوکس RAM بیکار را برای **cache** فایل‌ها استفاده می‌کند. این خوب است؛ یعنی دیسک کمتر خوانده می‌شود.

## مبتدی — free

\`free -m\` حافظه را به **مگابایت** نشان می‌دهد.

ستون‌هایی که باید بشناسید:

| ستون | معنی |
| --- | --- |
| used | در اختیار برنامه‌ها و کرنل |
| buff/cache | بافر و کش؛ در فشار قابل آزاد شدن است |
| **available** | تخمین «چقدر برای برنامهٔ جدید جا هست» — برای شما مفیدتر از free خام است |

پس **cache بودن RAM همیشه یعنی کمبود حافظه نیست.** و ستونی که برای برنامه‌ها مفیدتر است \`available\` است نه \`used\`.

## کارورز — iowait

\`vmstat 1 3\` چند نمونه در یک ثانیه می‌دهد. ستون \`wa\` یعنی **iowait**: CPU بیکار است چون منتظر دیسک است. بار بالا با iowait بالا یعنی دیسک کند یا پر از نوشتن؛ لزوماً CPU محاسباتی نیست.

## سنیور — تشخیص سریع کندی

ترتیب شیفت: \`uptime\` → \`free -m\` (available و swap) → \`df -h\` → \`vmstat\` یا \`iostat\`. اگر swap مدام در حال نوشتن است، RAM کم است. اگر available خوب است ولی wa بالاست، به دیسک و لاگ‌نویسی نگاه کنید نه به «اضافه کردن CPU».`,
        practicalMd: `\`free -m\` را بخوانید و ستون available را پیدا کنید. \`vmstat 1 3\` را یک‌بار اجرا کنید و \`wa\` را ببینید.`,
        exampleMd: `\`\`\`bash
free -m
vmstat 1 3
\`\`\``,
        commands: ["free -m", "vmstat 1 3"],
      },
    ],
    exercises: [
      {
        titleFa: "گزارش دیسک",
        topicSlug: "disk",
        lessonSlug: "disk",
        instructionsMd: `چگونه گزارش خوانای فضای فایل‌سیستم‌ها را برای بررسی بعدی ذخیره می‌کنید؟

هدف این است که فایل \`/tmp/disk.txt\` ایجاد شود و گزارش فضای دیسک با واحدهای خوانا را در خود داشته باشد؛ خط عنوان \`Filesystem\` باید داخل فایل باشد.`,
        difficulty: "easy",
        maxScore: 15,
        validation: {
          checks: [
            { type: "fileExists", path: "/tmp/disk.txt" },
            { type: "fileContains", path: "/tmp/disk.txt", text: "Filesystem" },
          ],
        },
        hints: [
          { level: 1, textFa: "به گزارشی نیاز دارید که وضعیت کل فایل‌سیستم‌ها را با واحد خوانا نشان دهد." },
          { level: 2, textFa: "گزینهٔ human-readable و هدایت stdout به مسیر دقیق /tmp/disk.txt را فراموش نکنید." },
          { level: 3, textFa: "df -h > /tmp/disk.txt" },
        ],
      },
      {
        titleFa: "پاکسازی فایل پرکننده",
        topicSlug: "disk",
        lessonSlug: "disk",
        instructionsMd: `چگونه عامل مصرف غیرضروری فضای موقت را شناسایی و پاک می‌کنید؟

پیش از تغییر، محتویات \`/tmp\` و وضعیت فضای فایل‌سیستم را بررسی کنید. هدف این است که فایل \`/tmp/fill.dat\` دیگر وجود نداشته باشد و حذف فایلِ غایب نیز باعث توقف کار نشود.`,
        difficulty: "easy",
        maxScore: 15,
        labSetup: { commands: ["dd if=/dev/zero of=/tmp/fill.dat bs=1M count=20"] },
        validation: { checks: [{ type: "commandExitCode", command: "test ! -f /tmp/fill.dat", expected: 0 }] },
        hints: [
          { level: 1, textFa: "ابتدا مصرف فضا و فایل‌های بزرگ مسیر موقت را مشاهده کنید، سپس فقط عامل مشخص‌شده را پاک کنید." },
          { level: 2, textFa: "مسیر هدف دقیقاً /tmp/fill.dat است؛ گزینهٔ force حذف فایلِ غایب را بی‌خطا می‌کند." },
          { level: 3, textFa: "rm -f /tmp/fill.dat" },
        ],
      },
    ],
    scenario: {
      titleFa: "دیسک در حال پر شدن است",
      incidentMd: `برای فضای \`/tmp\` هشدار صادر شده و سرویس در نوشتن لاگ شکست می‌خورد.

چگونه ابتدا مصرف فایل‌سیستم را تأیید و سپس فایل غیرضروری را پیدا می‌کنید؟ هدف این است که فقط \`/tmp/fill.dat\` حذف شود و در پایان دیگر وجود نداشته باشد.`,
      symptomsMd: "No space left on device در برخی فرمان‌ها ممکن است دیده شود.",
      observabilityMd: "فضای فایل‌سیستم، مصرف مسیر /tmp و اندازهٔ فایل‌های آن را پیش از پاک‌سازی مقایسه کنید.",
      environmentMd: "فایل پرکننده در /tmp",
      hiddenRootCause: "/tmp/fill.dat consuming space",
      investigationPath: ["بررسی فضای فایل‌سیستم", "یافتن مصرف‌کننده در /tmp", "حذف فقط fill.dat و تأیید نتیجه"],
      validation: { checks: [{ type: "commandExitCode", command: "test ! -f /tmp/fill.dat", expected: 0 }] },
      labSetup: { commands: ["dd if=/dev/zero of=/tmp/fill.dat bs=1M count=40"] },
      difficulty: "medium",
    },
    exam: {
      titleFa: "آزمون روز ۴",
      questions: [
        mc("مبتدی — کدام فرمان فضای فایل‌سیستم را نشان می‌دهد؟", ["du", "df", "ps", "id"], "df", "df برای کل فایل‌سیستم؛ du برای یک مسیر.", "disk"),
        tf("مبتدی — df -i مربوط به inode است.", true, "گزینهٔ -i تعداد inode را نشان می‌دهد نه بایت را.", "disk"),
        tf("مبتدی — /tmp برای دادهٔ موقت است.", true, "طبق FHS فایل موقت اینجاست و ممکن است با ریبوت پاک شود.", "disk"),
        mc("کارورز — du چه چیزی را اندازه می‌گیرد؟", ["کل دیسک", "یک مسیر", "RAM", "CPU"], "یک مسیر", "du -sh /var مصرف همان مسیر است.", "disk"),
        cmd("کارورز — فرمان نمایش حافظه به مگابایت را بنویسید.", "free -m", "free بدون -m معمولاً کیلوبایت است؛ -m مگابایت می‌دهد.", "memory"),
        sa("کارورز — خطای معروف پر بودن دیسک را به انگلیسی بنویسید.", "No space left on device", "همین متن را کرنل وقتی ENOSPC رخ دهد چاپ می‌کند.", "disk"),
        tf("کارورز — cache بودن RAM همیشه یعنی کمبود حافظه.", false, "کش قابل بازیابی است. ستون available را ببینید.", "memory"),
        mc(
          "سنیور — iowait یعنی چه؟",
          ["CPU بیکار منتظر دیسک", "RAM پر", "شبکه قطع", "کاربر زیاد"],
          "CPU بیکار منتظر دیسک",
          "ستون wa در vmstat. بار بالا با iowait بالا یعنی دیسک نه لزوماً محاسبه.",
          "io",
        ),
        mc(
          "سنیور — کدام ستون free برای برنامه‌ها مفیدتر است؟",
          ["used", "available", "shared", "buff"],
          "available",
          "available تخمین حافظهٔ قابل استفاده است؛ free خام کش را کم حساب می‌کند.",
          "memory",
        ),
        ts("سنیور — اولین فرمان بررسی پر بودن ریشه چیست؟", "df -h", "df -h یا df -h / فضای فایل‌سیستم ریشه را نشان می‌دهد.", "disk"),
      ],
    },
  },
  {
    dayNumber: 5,
    titleFa: "Bash و متغیر محیطی",
    objectiveFa: "اسکریپت با shebang، کد خروج، pipe و export را از فرمان ساده تا راز در تولید یاد بگیرید.",
    topicSlugs: ["bash", "shell-scripting", "env-vars"],
    lessons: [
      {
        slug: "bash",
        topicSlug: "bash",
        titleFa: "Bash: pipe، redirect و کد خروج",
        objectiveFa: "معنی $? ، | و 2> را با مثال بفهمید و اسکریپت را قابل‌اجرا کنید.",
        theoryMd: `شل همان میز پذیرش روز اول است. امروز فرمان‌ها را به هم وصل می‌کنید و اسکریپت می‌نویسید.

## مبتدی — موفقیت یعنی صفر

بعد از هر فرمان، متغیر \`$?\` کد خروج آخرین فرمان است.

- **صفر = موفقیت**
- غیرصفر = خطا

\`false; echo $?\` معمولاً ۱ چاپ می‌کند. پس «کد خروج صفر یعنی خطا» نادرست است.

خط اول اسکریپت bash رایج: \`#!/bin/bash\` (shebang). بدون آن ممکن است شل دیگری فایل را اجرا کند.

برای اجرا، بیت اجرا لازم است: \`chmod +x فایل\`. \`chmod +x\` بیت \`x\` را روشن می‌کند. اگر \`Permission denied\` هنگام اجرا دیدید، اول \`ls -l\` — اغلب \`x\` خاموش است.

## کارورز — pipe و redirect

| نماد | کار |
| --- | --- |
| \`|\` | pipe: خروجی فرمان قبل = ورودی فرمان بعد |
| \`>\` | stdout را روی فایل بنویس (جایگزین) |
| \`>>\` | به انتهای فایل اضافه کن |
| \`2>\` | **خطای استاندارد (stderr)** را جداگانه بفرست |
| \`<\` | فایل را به stdin بده |

stderr شمارهٔ ۲ است؛ برای همین \`2>\` خطا را جدا می‌کند نه \`>\` تنها.

## سنیور — اسکریپت استقرار

در تولید: \`set -euo pipefail\`، لاگ کردن \`$?\`، و هرگز راز را داخل اسکریپت در گیت نگذارید. shebang را صریح بنویسید. مسیر کامل فرمان در cron پایدارتر از تکیه به PATH است.`,
        practicalMd: `\`echo $PATH\` و \`echo $?\` را ببینید. یک فایل با shebang بسازید، \`chmod +x\` بزنید، اجرا کنید.`,
        exampleMd: `\`\`\`bash
echo $PATH
false; echo $?
true; echo $?
\`\`\``,
        commands: ["echo $PATH", "echo $?"],
      },
      {
        slug: "env",
        topicSlug: "env-vars",
        titleFa: "متغیر محیطی و PATH",
        objectiveFa: "فرق متغیر محلی با export را بدانید و محیط را با env ببینید.",
        theoryMd: `برنامه تنظیمات را از **محیط** می‌خواند: \`HOME\`، \`PATH\`، \`APP_ENV\`.

## مبتدی — چاپ و PATH

- \`echo $HOME\`: خانهٔ کاربر فعلی
- \`echo $PATH\`: فهرست دایرکتوری‌هایی که شل در آن‌ها فرمان می‌جوید

**PATH فهرست دایرکتوری جست‌وجوی فرمان است.** اگر فرمان پیدا نشد، یا نصب نیست یا PATH آن پوشه را ندارد.

دیدن کل محیط: \`env\` (یا \`printenv\`).

## کارورز — export

\`APP_ENV=lab\` فقط در همین شل است. **\`export\` متغیر را به فرآیند فرزند می‌دهد**؛ بدون export، اسکریپت یا برنامهٔ فرزند آن را نمی‌بیند.

\`\`\`bash
export APP_ENV=lab
env | grep APP_ENV
\`\`\`

## سنیور — راز

در سرویس‌ها راز را در env سیستم، secret manager یا فایل \`600\` بگذارید **نه در گیت**. \`env\` روی سرور مشترک همهٔ رازهای فرآیند را نشان می‌دهد؛ روی لپ‌تاپ همکار \`env | grep KEY\` را بی‌دلیل پیست نکنید.`,
        practicalMd: `\`export APP_ENV=lab\` بزنید و با \`env | grep APP_ENV\` تأیید کنید. خروجی \`echo $PATH\` را در تمرین در فایل ذخیره می‌کنید.`,
        exampleMd: `\`\`\`bash
export APP_ENV=lab
env | grep APP_ENV
echo $HOME
\`\`\``,
        commands: ["export APP_ENV=lab", "env | grep APP_ENV", "echo $HOME"],
      },
    ],
    exercises: [
      {
        titleFa: "اسکریپت سلام",
        topicSlug: "shell-scripting",
        lessonSlug: "bash",
        instructionsMd: `چگونه یک اسکریپت Bash قابل‌اجرا بسازید که خروجی مشخصی تولید کند؟

هدف این است که فایل \`/usr/local/bin/hello.sh\` با shebang دقیق \`#!/bin/bash\` آغاز شود، هنگام اجرا \`hello-sre\` چاپ کند و بیت اجرا برای آن فعال باشد.`,
        difficulty: "medium",
        maxScore: 15,
        validation: {
          checks: [
            { type: "fileContains", path: "/usr/local/bin/hello.sh", text: "hello-sre" },
            { type: "commandOutputContains", command: "/usr/local/bin/hello.sh", text: "hello-sre" },
          ],
        },
        hints: [
          { level: 1, textFa: "اسکریپت به مفسر مشخص، بدنهٔ چاپ خروجی و اجازهٔ اجرا نیاز دارد." },
          { level: 2, textFa: "خط اول باید دقیقاً #!/bin/bash باشد و بیت x فایل فعال شود؛ وگرنه اجرای مستقیم خطا می‌دهد." },
          { level: 3, textFa: "printf '%s\\n' '#!/bin/bash' 'echo hello-sre' > /usr/local/bin/hello.sh && chmod +x /usr/local/bin/hello.sh" },
        ],
      },
      {
        titleFa: "ثبت PATH",
        topicSlug: "env-vars",
        lessonSlug: "env",
        instructionsMd: `چگونه مقدار متغیر محیطی مسیر جست‌وجوی فرمان‌ها را در یک فایل ثبت می‌کنید؟

هدف این است که فایل \`/tmp/path.txt\` ایجاد شود و مقدار فعلی \`PATH\` را در خود داشته باشد.`,
        difficulty: "easy",
        maxScore: 15,
        validation: { checks: [{ type: "fileExists", path: "/tmp/path.txt" }] },
        hints: [
          { level: 1, textFa: "مقدار متغیر PATH همان فهرست مسیرهای جست‌وجوی فرمان است." },
          { level: 2, textFa: "هنگام خواندن متغیر علامت $ و هنگام ذخیره هدایت stdout به /tmp/path.txt را فراموش نکنید." },
          { level: 3, textFa: "echo $PATH > /tmp/path.txt" },
        ],
      },
    ],
    scenario: {
      titleFa: "اسکریپت استقرار اجرا نمی‌شود",
      incidentMd: `اسکریپت \`/opt/app/deploy.sh\` با خطای مجوز اجرا روبه‌رو است.

چگونه مجوزها و shebang را بررسی و امکان اجرای مستقیم را برقرار می‌کنید؟ هدف این است که بیت اجرا فعال باشد و اجرای فایل متن \`deploy-ok\` تولید کند.`,
      symptomsMd: "Permission denied هنگام اجرا",
      observabilityMd: "پیش از تغییر، بیت‌های مجوز فایل و خط نخست اسکریپت را بررسی کنید.",
      environmentMd: "فایل موجود بدون بیت اجرا",
      hiddenRootCause: "Missing execute bit",
      investigationPath: ["بررسی مجوز و shebang اسکریپت", "فعال‌کردن بیت اجرا", "اجرای فایل و تأیید deploy-ok"],
      validation: {
        checks: [{ type: "commandOutputContains", command: "/opt/app/deploy.sh", text: "deploy-ok" }],
      },
      labSetup: {
        commands: [
          "mkdir -p /opt/app",
          "printf '%s\\n' '#!/bin/bash' 'echo deploy-ok' > /opt/app/deploy.sh",
          "chmod 644 /opt/app/deploy.sh",
        ],
      },
      difficulty: "easy",
    },
    exam: {
      titleFa: "آزمون روز ۵",
      questions: [
        mc("مبتدی — shebang رایج bash کدام است؟", ["#!/bin/bash", "#bash", ">>bash", "exec bash"], "#!/bin/bash", "خط اول اسکریپت مفسر را مشخص می‌کند.", "bash"),
        tf("مبتدی — کد خروج صفر یعنی خطا.", false, "صفر موفقیت است؛ غیرصفر یعنی شکست.", "bash"),
        sa("مبتدی — نام متغیر کد خروج آخرین فرمان چیست؟", "$?", "بعد از هر فرمان echo $? را بزنید.", "bash"),
        mc("کارورز — pipe با کدام نماد است؟", ["|", ">", "&", ";"], "|", "خروجی چپ می‌رود به ورودی راست.", "bash"),
        mc("کارورز — redirect خطای استاندارد کدام است؟", [">", "2>", "<", "|"], "2>", "stderr فایل‌دسکریپتور ۲ است.", "bash"),
        cmd("کارورز — فرمان چاپ متغیر HOME را بنویسید.", "echo $HOME", "علامت $ مقدار متغیر را می‌گیرد.", "env-vars"),
        tf("کارورز — PATH فهرست دایرکتوری جست‌وجوی فرمان است.", true, "شل به ترتیب PATH دنبال فرمان می‌گردد.", "env-vars"),
        mc(
          "کارورز — export چه می‌کند؟",
          ["متغیر را به فرآیند فرزند می‌دهد", "فایل را پاک می‌کند", "کاربر می‌سازد", "پورت باز می‌کند"],
          "متغیر را به فرآیند فرزند می‌دهد",
          "بدون export متغیر محلی می‌ماند و اسکریپت فرزند آن را نمی‌بیند.",
          "env-vars",
        ),
        tf("سنیور — chmod +x بیت اجرا را روشن می‌کند.", true, "برای اسکریپت و باینری لازم است؛ وگرنه Permission denied می‌گیرید.", "shell-scripting"),
        ts("سنیور — فرمان دیدن کل محیط متغیرها چیست؟", "env", "env یا printenv. برای یک متغیر echo $NAME کافی است.", "env-vars"),
      ],
    },
  },
  {
    dayNumber: 6,
    titleFa: "شبکه پایه: پورت، DNS، HTTP",
    objectiveFa: "از پورت listen تا hosts و فرق TCP با HTTP را طوری یاد بگیرید که نام داخلی resolveنشده را درست عیب‌یابی کنید.",
    topicSlugs: ["tcpip", "ports", "dns", "http"],
    lessons: [
      {
        slug: "ports",
        topicSlug: "ports",
        titleFa: "TCP، پورت و listen",
        objectiveFa: "ss -lnt و پورت‌های ۲۲، ۸۰، ۴۴۳ را بشناسید و TCP را از UDP جدا کنید.",
        theoryMd: `برنامه روی شبکه با یک **آدرس IP و شمارهٔ پورت** شناخته می‌شود. کلاینت به همان جفت وصل می‌شود.

## مبتدی — پورت‌های معروف

| پورت | سرویس |
| --- | --- |
| ۲۲ | SSH |
| ۸۰ | HTTP |
| ۴۴۳ | HTTPS |
| ۵۳ | DNS (عمدتاً UDP) |

سرویس در حالت **listen** منتظر اتصال است. \`ss -lnt\` سوکت‌های **TCP در listen** را نشان می‌دهد (\`l\`=listen، \`n\`=عدد، \`t\`=TCP). اگر \`ss\` نبود، \`netstat -lnt\` معادل قدیمی است.

## کارورز — TCP یعنی چه؟

**TCP اتصال‌گرا و قابل‌اطمینان است**: دست‌دادن، شماره ترتیب، بازارسال. UDP بدون اتصال و سبک‌تر است (DNS، بعضی بازی‌ها). وقتی می‌گوییم وب روی ۸۰/۴۴۳، معمولاً TCP است.

\`ss -lnt\` فرآیند را لزوماً نشان نمی‌دهد؛ برای نام برنامه اغلب \`ss -lntp\` (اگر مجوز باشد).

## سنیور — عیب‌یابی اتصال

«پورت باز نیست» با «فایروال بسته است» فرق دارد. اول روی خود سرور \`ss -lnt\` : آیا سرویس اصلاً listen کرده؟ بعد از بیرون. سرویس روی \`127.0.0.1\` فقط محلی است؛ روی \`0.0.0.0\` از اینترفیس‌ها قابل دیدن است.`,
        practicalMd: `\`ss -lnt\` را بزنید یا اگر خطا داد \`netstat -lnt\`. خروجی را در تمرین در فایل ذخیره می‌کنید.`,
        exampleMd: `\`\`\`bash
ss -lnt || netstat -lnt
\`\`\``,
        commands: ["ss -lnt"],
      },
      {
        slug: "dns-http",
        topicSlug: "dns",
        titleFa: "DNS، hosts و HTTP",
        objectiveFa: "نام را به IP برسانید و HTTP را از HTTPS جدا کنید بدون اینکه شبکهٔ خارجی لازم باشد.",
        theoryMd: `انسان نام می‌فهمد (\`db.internal\`)؛ ماشین IP می‌خواهد. **DNS پروتکل ترجمهٔ نام به IP** است و معمولاً روی **پورت ۵۳** کار می‌کند.

## مبتدی — دو فایل محلی

| فایل | کار |
| --- | --- |
| \`/etc/hosts\` | نگاشت دستی نام → IP روی همین ماشین؛ **اولویت محلی** دارد |
| \`/etc/resolv.conf\` | **resolver**: به کدام nameserver بپرس |

دیدن: \`cat /etc/hosts\` و \`cat /etc/resolv.conf\`.

در این آزمایشگاه شبکهٔ خارجی ممکن است خاموش باشد؛ پس تمرین واقعی شما hosts است نه dig به اینترنت.

## کارورز — HTTP و HTTPS

HTTP متنی است (درخواست GET و پاسخ). **HTTPS همان HTTP روی TLS** است؛ پورت پیش‌فرض HTTPS **۴۴۳** است، HTTP معمولاً ۸۰. از نظر لایهٔ کاربرد مشابه‌اند؛ تفاوت رمزنگاری حمل‌ونقل است.

## سنیور — نام داخلی resolve نمی‌شود

ترتیب: \`cat /etc/hosts\` → آیا خط هست؟ → \`cat /etc/resolv.conf\` → آیا nameserver درست است؟ در کانتینر بدون DNS، اضافه کردن \`10.0.0.20 db.internal\` به hosts همان کاری است که در سناریوی امروز می‌کنید. در تولید Kubernetes این کار را با Service DNS می‌کنند نه با ویرایش دستی همهٔ پادها.`,
        practicalMd: `هر دو فایل را بخوانید. در تمرین یک نام داخلی به hosts اضافه می‌کنید. مسیر \`/etc/hosts\` است نه \`etc/hosts\`.`,
        exampleMd: `\`\`\`bash
cat /etc/hosts
cat /etc/resolv.conf
\`\`\``,
        commands: ["cat /etc/hosts", "cat /etc/resolv.conf"],
      },
    ],
    exercises: [
      {
        titleFa: "hosts محلی",
        topicSlug: "dns",
        lessonSlug: "dns-http",
        instructionsMd: `چگونه یک نام داخلی را بدون DNS خارجی روی همین میزبان قابل resolve می‌کنید؟

هدف این است که فایل \`/etc/hosts\` نگاشتی برای نام \`app.internal\` به IP دقیق \`10.0.0.10\` داشته باشد. محتوای فعلی فایل باید حفظ شود.`,
        difficulty: "medium",
        maxScore: 15,
        validation: { checks: [{ type: "fileContains", path: "/etc/hosts", text: "app.internal" }] },
        hints: [
          { level: 1, textFa: "نگاشت محلی نام به IP در فایل hosts این میزبان نگهداری می‌شود." },
          { level: 2, textFa: "مسیر دقیق /etc/hosts است و باید از append استفاده کنید تا خطوط فعلی بازنویسی نشوند." },
          { level: 3, textFa: "echo '10.0.0.10 app.internal' >> /etc/hosts" },
        ],
      },
      {
        titleFa: "گزارش پورت‌ها",
        topicSlug: "ports",
        lessonSlug: "ports",
        instructionsMd: `چگونه گزارشی از سوکت‌های TCP در حالت listen تهیه و ذخیره می‌کنید؟

هدف این است که فایل \`/tmp/listen.txt\` با خروجی ابزار موجود روی سیستم ایجاد شود. گزارش باید آدرس‌ها را عددی نشان دهد؛ اگر ابزار جدید در دسترس نبود، از ابزار قدیمی هم‌ارز استفاده کنید.`,
        difficulty: "easy",
        maxScore: 15,
        validation: { checks: [{ type: "fileExists", path: "/tmp/listen.txt" }] },
        hints: [
          { level: 1, textFa: "ابزار شبکه باید فقط سوکت‌های TCP در حال گوش را با آدرس عددی گزارش کند." },
          { level: 2, textFa: "ترکیب گزینه‌های listen، numeric و TCP لازم است؛ خروجی هر ابزار موجود باید به /tmp/listen.txt برود." },
          { level: 3, textFa: "ss -lnt > /tmp/listen.txt || netstat -lnt > /tmp/listen.txt" },
        ],
      },
    ],
    scenario: {
      titleFa: "نام داخلی resolve نمی‌شود",
      incidentMd: `برنامه نمی‌تواند نام \`db.internal\` را resolve کند.

چگونه نگاشت محلی نام را بررسی و در صورت نبودن اصلاح می‌کنید؟ هدف این است که \`db.internal\` در \`/etc/hosts\` به IP آزمایشگاهی \`10.0.0.20\` نگاشت شود و خطوط موجود فایل حفظ شوند.`,
      symptomsMd: "نام میزبان ناشناخته است.",
      observabilityMd: "محتوای /etc/hosts را بررسی کنید؛ در شبکهٔ ایزوله، موفق‌نبودن ping معیار مناسبی برای این تمرین نیست.",
      environmentMd: "بدون DNS خارجی",
      hiddenRootCause: "Missing hosts entry for db.internal",
      investigationPath: ["بررسی نگاشت‌های فعلی hosts", "افزودن نگاشت db.internal بدون بازنویسی فایل", "تأیید IP برابر 10.0.0.20"],
      validation: { checks: [{ type: "fileContains", path: "/etc/hosts", text: "db.internal" }] },
      labSetup: { commands: ["true"] },
      difficulty: "medium",
    },
    exam: {
      titleFa: "آزمون روز ۶",
      questions: [
        mc("مبتدی — SSH معمولاً کدام پورت است؟", ["21", "22", "25", "80"], "22", "پورت پیش‌فرض OpenSSH برابر ۲۲ است.", "ports"),
        mc("مبتدی — پورت پیش‌فرض HTTPS چیست؟", ["80", "443", "22", "53"], "443", "HTTP معمولاً ۸۰ و HTTPS برابر ۴۴۳ است.", "http"),
        tf("مبتدی — DNS روی پورت ۵۳ کار می‌کند.", true, "عمدتاً ۵۳/udp ؛ گاهی TCP برای پاسخ بزرگ.", "dns"),
        sa("مبتدی — پروتکل ترجمهٔ نام به IP چیست؟ (مخفف انگلیسی)", "DNS", "Domain Name System.", "dns"),
        mc("کارورز — ss -lnt چه را نشان می‌دهد؟", ["فقط UDP", "TCP listen", "فقط فرآیند", "دیسک"], "TCP listen", "l=listen ، n=numeric ، t=TCP.", "ports"),
        cmd("کارورز — فرمان دیدن فایل hosts را بنویسید.", "cat /etc/hosts", "نگاشت محلی نام به IP در /etc/hosts است.", "dns"),
        tf("کارورز — /etc/resolv.conf مشخص می‌کند resolver به کجا بپرسد.", true, "nameserver داخل همین فایل است.", "dns"),
        tf(
          "کارورز — HTTP و HTTPS از نظر کاربرد لایهٔ کاربرد مشابه‌اند.",
          true,
          "HTTPS همان HTTP است روی TLS؛ پورت و رمزنگاری فرق می‌کند.",
          "http",
        ),
        mc(
          "سنیور — ویژگی اصلی TCP چیست؟",
          ["بدون اتصال", "قابل اطمینان و اتصال‌گرا", "فقط broadcast", "لایه ۲"],
          "قابل اطمینان و اتصال‌گرا",
          "TCP اتصال می‌سازد و داده را با بازارسال قابل‌اطمینان می‌فرستد. UDP بدون اتصال است.",
          "tcpip",
        ),
        ts("سنیور — فرمان دیدن سوکت‌های TCP در حال گوش چیست؟", "ss -lnt", "ss -lnt یا netstat -lnt. اول روی خود میزبان listen را چک کنید.", "ports"),
      ],
    },
  },
  {
    dayNumber: 7,
    titleFa: "لاگ و عیب‌یابی روزمره",
    objectiveFa: "از /var/log تا journalctl و چک‌لیست سلامت را طوری یاد بگیرید که قبل از reboot evidance جمع کنید.",
    topicSlugs: ["logs", "journalctl", "troubleshooting", "systemd"],
    lessons: [
      {
        slug: "logs",
        topicSlug: "logs",
        titleFa: "کجا لاگ را پیدا کنیم؟",
        objectiveFa: "مسیر /var/log ، نقش systemd و journalctl را از مبتدی تا کانتینر بفهمید.",
        theoryMd: `وقتی چیزی می‌شکند، لاگ شاهد است — به شرطی که زمان‌مهر داشته باشد و شما جایش را بلد باشید.

## مبتدی — مسیر سنتی

مسیر سنتی لاگ لینوکس: \`/var/log\`. فهرست: \`ls /var/log\`.

برنامهٔ خودتان اغلب \`/var/log/app/app.log\` می‌نویسد؛ اگر پوشه نباشد، نوشتن شکست می‌خورد.

**لاگ بدون زمان‌مهر برای RCA ضعیف است.** بدون ساعت نمی‌فهمید کدام خط مال قبل از استقرار است.

## کارورز — systemd و journal

روی توزیع‌های مدرن، **systemd مدیر سرویس و بوت** است (نه فایروال و نه کامپایلر). لاگ واحدهای آن در journal ذخیره می‌شود. خواندن: **\`journalctl\`**.

مثال‌ها (اگر journal در آزمایشگاه خالی بود، باز هم فرمان را بشناسید):

- \`journalctl -u ssh\` لاگ یک سرویس
- \`journalctl -xe\` خطاهای اخیر

در کانتینر گاهی فقط stdout است و \`/var/log\` تقریباً خالی؛ آن‌وقت \`docker logs\` یا لاگ کوبرنتیز جای journal را می‌گیرد.

## سنیور — کیفیت لاگ

چهار چیز را در تولید بخواهید: زمان (UTC)، شدت، نام سرویس، شناسهٔ درخواست. \`logger 'devops-learn test'\` یک خط آزمایشی به syslog می‌فرستد. هرگز راز را در لاگ ننویسید.`,
        practicalMd: `\`ls /var/log\` را بزنید. در تمرین پوشهٔ \`/var/log/app\` و فایل لاگ می‌سازید — همان کاری که اپلیکیشن انتظار دارد.`,
        exampleMd: `\`\`\`bash
ls /var/log
logger 'devops-learn test'
\`\`\``,
        commands: ["ls /var/log"],
      },
      {
        slug: "troubleshoot",
        topicSlug: "troubleshooting",
        titleFa: "روش عیب‌یابی: از علامت به علت",
        objectiveFa: "قبل از restart کور، load و منابع را ببینید و چک‌لیست uptime+free+df را حفظ کنید.",
        theoryMd: `عیب‌یابی حدس زدن نیست. از چیزی که *الان می‌بینید* به علت می‌رسید.

## مبتدی — پنج سؤال

1. دقیقاً چه چیزی شکسته؟ (خطا، کندی، ۵۰۳)
2. از کی؟ (قبل/بعد استقرار)
3. CPU / RAM / Disk / شبکه؟
4. لاگ چه می‌گوید؟
5. آخرین تغییر چه بود؟

**restart بدون داده همیشه بهترین کار نیست.** ممکن است شاهد را پاک کند.

فرمان بار سیستم: \`uptime\` (load ۱/۵/۱۵ دقیقه). فرمان زندهٔ فرآیند و CPU: \`top\`.

## کارورز — حداقل چک سلامت

ترکیب طلایی محلی: **\`uptime\` + \`free\` + \`df\`**. یک خط عملی:

\`uptime; free -m; df -h; ps aux --sort=-%cpu | head\`

اولین قدم منطقی کندی: **دیدن load و منابع** نه حذف \`/\` و نه reboot فوری.

## سنیور — شیفت

بدون همبستگی زمانی بین استقرار، متریک و لاگ، RCA داستان است نه مهندسی. اگر فقط CPU بالاست به فرآیند بروید؛ اگر دیسک پر است لاگ را بچرخانید؛ اگر بعد از تغییر DNS است به شبکهٔ روز ۶ برگردید. systemd را برای \`systemctl status\` سرویس نگه دارید نه برای reboot کل VM.`,
        practicalMd: `همان یک خط چک سلامت را اجرا کنید. خروجی \`uptime\` را در تمرین در \`/tmp/health.txt\` می‌گذارید.`,
        exampleMd: `\`\`\`bash
uptime
free -m
df -h
ps aux --sort=-%cpu | head
\`\`\``,
        commands: ["uptime", "free -m", "df -h"],
      },
    ],
    exercises: [
      {
        titleFa: "ثبت لاگ",
        topicSlug: "logs",
        lessonSlug: "logs",
        instructionsMd: `چگونه مسیر لاگ مورد انتظار برنامه را آماده و نخستین وضعیت را ثبت می‌کنید؟

هدف این است که پوشهٔ \`/var/log/app\` و فایل \`/var/log/app/app.log\` وجود داشته باشند و فایل شامل خط \`ready\` باشد.`,
        difficulty: "easy",
        maxScore: 15,
        validation: {
          checks: [
            { type: "directoryExists", path: "/var/log/app" },
            { type: "fileContains", path: "/var/log/app/app.log", text: "ready" },
          ],
        },
        hints: [
          { level: 1, textFa: "برنامه پیش از نوشتن لاگ به پوشهٔ والد و فایل مقصد نیاز دارد." },
          { level: 2, textFa: "مسیر پوشه دقیقاً /var/log/app و متن مورد انتظار فایل دقیقاً ready است؛ نبودن والدها نباید خطا ایجاد کند." },
          { level: 3, textFa: "mkdir -p /var/log/app && echo ready > /var/log/app/app.log" },
        ],
      },
      {
        titleFa: "چک‌لیست عیب‌یابی",
        topicSlug: "troubleshooting",
        lessonSlug: "troubleshoot",
        instructionsMd: `چگونه وضعیت زمان روشن‌بودن و بار سیستم را برای گزارش سلامت ثبت می‌کنید؟

هدف این است که فایل \`/tmp/health.txt\` ایجاد شود و خروجی ابزار نمایش uptime و load را در خود داشته باشد.`,
        difficulty: "easy",
        maxScore: 15,
        validation: { checks: [{ type: "fileExists", path: "/tmp/health.txt" }] },
        hints: [
          { level: 1, textFa: "برای این گزارش به ابزار خلاصهٔ زمان روشن‌بودن و load سیستم نیاز دارید." },
          { level: 2, textFa: "stdout گزارش را با عملگر بازنویسی به مسیر دقیق /tmp/health.txt هدایت کنید." },
          { level: 3, textFa: "uptime > /tmp/health.txt" },
        ],
      },
    ],
    scenario: {
      titleFa: "سرویس لاگ نمی‌نویسد",
      incidentMd: `اپلیکیشن باید در \`/var/log/app/app.log\` بنویسد، اما مسیر مورد انتظار وجود ندارد.

چگونه ساختار فعلی لاگ‌ها را بررسی و مقصد لازم را آماده می‌کنید؟ هدف این است که پوشهٔ \`/var/log/app\` و فایل \`app.log\` درون آن وجود داشته باشند.`,
      symptomsMd: "خطا در نوشتن لاگ",
      observabilityMd: "پیش از ایجاد مسیر، محتویات /var/log را مشاهده کنید و فقط ساختار مورد نیاز برنامه را اضافه کنید.",
      environmentMd: "مسیر لاگ ساخته نشده",
      hiddenRootCause: "Missing /var/log/app directory",
      investigationPath: ["بررسی ساختار فعلی /var/log", "ایجاد پوشهٔ app", "ایجاد app.log و تأیید وجود آن"],
      validation: { checks: [{ type: "fileExists", path: "/var/log/app/app.log" }] },
      labSetup: { commands: ["true"] },
      difficulty: "easy",
    },
    exam: {
      titleFa: "آزمون روز ۷",
      questions: [
        mc("مبتدی — مسیر سنتی لاگ لینوکس کدام است؟", ["/etc/log", "/var/log", "/home/log", "/opt/log"], "/var/log", "طبق FHS لاگ‌های متغیر در /var/log هستند.", "logs"),
        cmd("مبتدی — فرمان فهرست کردن /var/log را بنویسید.", "ls /var/log", "ls محتویات پوشه را نشان می‌دهد.", "logs"),
        ts("مبتدی — فرمان دیدن بار سیستم چیست؟", "uptime", "uptime زمان روشن بودن و load را می‌دهد.", "troubleshooting"),
        tf("کارورز — journalctl لاگ systemd را می‌خواند.", true, "journalctl رابط خواندن journal است.", "journalctl"),
        mc(
          "کارورز — systemd چه نقشی دارد؟",
          ["فقط فایروال", "مدیریت سرویس و بوت", "فقط DNS", "کامپایلر"],
          "مدیریت سرویس و بوت",
          "init مدرن: سرویس، وابستگی، journal.",
          "systemd",
        ),
        tf("کارورز — restart بدون داده همیشه بهترین کار است.", false, "اول مشاهده کنید؛ reboot ممکن است شاهد را پاک کند.", "troubleshooting"),
        tf("کارورز — لاگ بدون زمان‌مهر برای RCA ضعیف است.", true, "بدون timestamp ترتیب علت و معلول مشخص نمی‌شود.", "logs"),
        sa("کارورز — فرمان زندهٔ دیدن فرآیند و CPU چیست؟", "top", "top تعاملی است. ps عکس لحظه‌ای است.", "troubleshooting"),
        mc(
          "سنیور — اولین قدم منطقی عیب‌یابی کندی چیست؟",
          ["حذف /", "دیدن load و منابع", "reboot فوری", "تغییر DNS"],
          "دیدن load و منابع",
          "uptime و free و df و ps/top قبل از هر تغییر مخرب.",
          "troubleshooting",
        ),
        mc(
          "سنیور — کدام ترکیب حداقل چک سلامت محلی است؟",
          ["uptime+free+df", "فقط rm", "فقط chmod 777", "فقط reboot"],
          "uptime+free+df",
          "بار، حافظه، دیسک؛ سه سیگنال طلایی روی خود ماشین.",
          "troubleshooting",
        ),
      ],
    },
  },
];
