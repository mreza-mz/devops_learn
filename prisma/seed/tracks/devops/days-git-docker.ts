import { DaySeed, mc, tf, sa, noteExercise, noteScenario } from "./types";

export const gitDockerDays: DaySeed[] = [
  {
    dayNumber: 8,
    phaseSlug: "git-docker",
    titleFa: "مبانی Git و تاریخچهٔ تغییرات",
    objectiveFa: "چرخهٔ clone، status، diff، add و commit را بفهمید و در مصاحبه تفاوت ناحیهٔ کاری، staging و repository را دقیق توضیح دهید.",
    topicSlugs: ["git"],
    lessons: [
      {
        slug: "git-three-areas",
        topicSlug: "git",
        titleFa: "مدل ذهنی Git: سه ناحیه و commit",
        objectiveFa: "وضعیت هر فایل را در working tree، staging area و repository تشخیص دهید.",
        theoryMd: `## مبتدی

Git فقط محلی برای ذخیرهٔ فایل نیست؛ یک پایگاه داده از snapshotهای پروژه است. با \`git clone https://gitlab.com/example/devops-demo.git\` هم تاریخچه و هم working tree ساخته می‌شود. فایل ویرایش‌شده ابتدا در **working tree** است، \`git add file\` نسخهٔ فعلی آن را به **staging area** می‌برد و \`git commit -m "message"\` از stagedها یک snapshot در repository محلی می‌سازد. commit به معنی ارسال به سرور نیست؛ ارسال با \`git push\` انجام می‌شود.

\`git status\` پاسخ «الان چه وضعی داریم؟» است. فایل untracked هنوز زیر نظر Git نیست، modified با نسخهٔ commitشده فرق دارد و staged آمادهٔ commit است.

## کارورز

پاسخ خوب مصاحبه‌ای باید بگوید staging امکان ساخت commit اتمیک را می‌دهد: از ده تغییر کاری فقط تغییرهای مربوط به یک هدف را stage می‌کنیم. \`git add -p\` حتی بخش‌های یک فایل را جداگانه stage می‌کند. پیام commit باید دلیل تغییر را روشن کند، نه اینکه فقط بگوید «files updated».

## سنیور

commit شناسه‌ای بر پایهٔ محتوای snapshot و metadata و والد خود دارد؛ بنابراین تاریخچه یک گراف جهت‌دار است، نه صرفاً لیست فایل‌ها. کوچک و هدفمند بودن commitها review، revert، bisect و cherry-pick را امن‌تر می‌کند. در مصاحبه تأکید کنید که Git تغییر فایل را ذخیره نمی‌کند؛ snapshot می‌سازد و برای کارایی اشیای یکسان را دوباره استفاده می‌کند.`,
        practicalMd: `یک repository آزمایشی بسازید، یک فایل ایجاد کنید و بعد از هر مرحله \`git status --short\` را ببینید. قبل و بعد از \`git add\` تفاوت خروجی را ثبت کنید و در پایان یک commit هدفمند بسازید.`,
        exampleMd: `\`\`\`bash
mkdir -p /tmp/git-day8 && cd /tmp/git-day8
git init
printf 'v1\\n' > app.txt
git status --short
git add app.txt
git status --short
git commit -m "add initial app file"
\`\`\``,
        commands: ["git clone https://gitlab.com/example/devops-demo.git", "git init", "git status --short", "git add app.txt", "git commit -m \"add initial app file\""],
      },
      {
        slug: "git-inspection-branches",
        topicSlug: "git",
        titleFa: "دیدن تفاوت‌ها و ساخت branch",
        objectiveFa: "با diff و log تغییر را بررسی کنید و branch را به‌عنوان اشاره‌گر سبک توضیح دهید.",
        theoryMd: `## مبتدی

\`git diff\` تغییرهای working tree نسبت به staging را نشان می‌دهد؛ \`git diff --staged\` تغییر staged نسبت به commit فعلی را. این تفاوت از سؤال‌های رایج مصاحبه است. \`git log --oneline --graph --decorate\` تاریخچه، شاخه‌ها و HEAD را خلاصه نمایش می‌دهد.

branch یک کپی کامل از پروژه نیست؛ اشاره‌گری سبک به یک commit است. \`git switch -c feature/login\` شاخه می‌سازد و روی آن می‌رود. HEAD معمولاً اشاره می‌کند اکنون روی کدام branch هستید. \`git branch\` شاخه‌های محلی را نشان می‌دهد.

## کارورز

قبل از commit، هم \`git diff\` و هم \`git diff --staged\` را review کنید تا فایل ناخواسته، secret یا debug code وارد تاریخچه نشود. برای بررسی یک commit می‌توان از \`git show HASH\` استفاده کرد. \`git restore file\` تغییر unstaged را دور می‌ریزد و باید با احتیاط اجرا شود؛ \`git restore --staged file\` فقط فایل را از staging خارج می‌کند.

## سنیور

نام branch هویت مستقل ندارد و با commit جدید جلو می‌رود. حذف branch معمولاً objectهای commit را فوراً حذف نمی‌کند، اما نباید reflog را راهکار backup دانست. پاسخ حرفه‌ای میان local branch و remote-tracking branch مثل \`origin/main\` تمایز می‌گذارد: دومی تصویری محلی از آخرین وضعیت دیده‌شدهٔ remote است.`,
        practicalMd: `روی یک branch جدید دو نوع تغییر بسازید: یکی staged و دیگری unstaged. با دو شکل \`git diff\` مشخص کنید هر تغییر در کدام ناحیه قرار دارد.`,
        exampleMd: `\`\`\`bash
git switch -c feature/readme
printf 'intro\\n' >> README.md
git add README.md
printf 'draft\\n' > notes.txt
git diff
git diff --staged
git log --oneline --graph --decorate
\`\`\``,
        commands: ["git switch -c feature/readme", "git branch", "git diff", "git diff --staged", "git log --oneline --graph --decorate"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "خلاصهٔ سه ناحیهٔ Git",
        topicSlug: "git",
        lessonSlug: "git-three-areas",
        path: "/tmp/day8-areas.txt",
        mustContain: "staging",
        instructionsMd: "سؤال مصاحبه: یک فایل چگونه از working tree به staging area و سپس به یک commit می‌رسد؟ نقش هر ناحیه را توضیح دهید و پاسخ کوتاه خود را در آزمایشگاه ثبت کنید.",
      }),
      noteExercise({
        titleFa: "تفاوت دو diff",
        topicSlug: "git",
        lessonSlug: "git-inspection-branches",
        path: "/tmp/day8-diff.txt",
        mustContain: "--staged",
        instructionsMd: "سؤال مصاحبه: تفاوت `git diff` و `git diff --staged` چیست و هرکدام چه چیزی را نشان می‌دهد؟ پاسخ کوتاه خود را در آزمایشگاه ثبت کنید.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "commit شامل فایل ناخواسته",
      path: "/tmp/day8-scenario.txt",
      mustContain: "status",
      incidentMd: "پیش از commit چند فایل debug و یک فایل تنظیمات هم تغییر کرده‌اند و نمی‌خواهید همه وارد commit شوند.",
      symptomsMd: "`git status` هم‌زمان staged، modified و untracked نشان می‌دهد.",
      rootCause: "همهٔ تغییرها بدون review و تفکیک منطقی stage شده‌اند.",
    }),
    exam: {
      titleFa: "آزمون روز ۸: مبانی Git",
      questions: [
        mc("کدام فرمان تغییرهای staged را نشان می‌دهد؟", ["git status -b", "git diff", "git diff --staged", "git branch"], "git diff --staged", "این فرمان staging را با HEAD مقایسه می‌کند.", "git"),
        tf("اجرای git commit تغییرها را خودکار به remote می‌فرستد.", false, "commit محلی است و push ارسال به remote را انجام می‌دهد.", "git"),
        sa("سه ناحیهٔ اصلی Git را نام ببرید.", "working tree، staging area و repository", "فایل از working tree به staging و سپس snapshot مخزن می‌رود.", "git"),
        mc("branch در Git در اصل چیست؟", ["کپی کامل پوشه", "اشاره‌گر سبک به commit", "سرور پشتیبان", "فایل patch"], "اشاره‌گر سبک به commit", "branch با جلو رفتن commitها اشاره‌گر خود را جابه‌جا می‌کند.", "git"),
      ],
    },
  },
  {
    dayNumber: 9,
    phaseSlug: "git-docker",
    titleFa: "Branching، merge، rebase و تعارض",
    objectiveFa: "تاریخچهٔ شاخه‌ها را مدیریت کنید، merge و rebase را آگاهانه انتخاب کنید و conflict را بدون از دست دادن تغییرها حل کنید.",
    topicSlugs: ["git-branching"],
    lessons: [
      {
        slug: "merge-vs-rebase",
        topicSlug: "git-branching",
        titleFa: "Merge در برابر Rebase",
        objectiveFa: "اثر هر راهبرد بر گراف تاریخچه و ریسک بازنویسی commit را توضیح دهید.",
        theoryMd: `## مبتدی

\`git merge feature\` تاریخچه‌های دو شاخه را به هم می‌رساند. اگر شاخهٔ مقصد مستقیماً قابل جلو رفتن باشد fast-forward رخ می‌دهد؛ در غیر این صورت معمولاً merge commit با دو والد ساخته می‌شود. commitهای قبلی تغییر نمی‌کنند و تاریخچهٔ واقعی انشعاب حفظ می‌شود.

\`git rebase main\` commitهای شاخهٔ فعلی را روی نوک main دوباره اجرا می‌کند. نتیجه خطی‌تر است، اما commitهای بازسازی‌شده hash جدید دارند.

## کارورز

قاعدهٔ امن مصاحبه‌ای: روی branch خصوصی rebase مفید است؛ branch عمومی که دیگران از آن کار گرفته‌اند را بدون هماهنگی rebase و force-push نکنید. بعد از rebase شاخهٔ منتشرشده معمولاً \`git push --force-with-lease\` لازم دارد؛ این گزینه نسبت به \`--force\` از overwrite کردن کار جدید remote محافظت می‌کند.

## سنیور

انتخاب ابزار وابسته به سیاست تیم است. merge context تاریخی و مرز PR را نگه می‌دارد؛ rebase یا squash تاریخچهٔ main را خواناتر می‌کند. «همیشه rebase بهتر است» پاسخ ضعیفی است. پاسخ ارشد باید دربارهٔ auditability، bisectability، امضای commit، CI و هزینهٔ حل چندبارهٔ conflict در rebase صحبت کند.`,
        practicalMd: `یک feature branch بسازید و main را جداگانه جلو ببرید. ابتدا گراف را ببینید، سپس در یک کپی merge و در کپی دیگر rebase را امتحان و hashها را مقایسه کنید.`,
        exampleMd: `\`\`\`bash
git switch feature
git fetch origin
git rebase origin/main
git log --oneline --graph --all
# راه جایگزین روی main:
git switch main
git merge --no-ff feature
\`\`\``,
        commands: ["git fetch origin", "git merge --no-ff feature", "git rebase origin/main", "git rebase --abort", "git push --force-with-lease"],
      },
      {
        slug: "conflict-resolution",
        topicSlug: "git-branching",
        titleFa: "حل تعارض با روش قابل بازبینی",
        objectiveFa: "conflict را تشخیص، حل، stage و ادامه یا لغو کنید.",
        theoryMd: `## مبتدی

Conflict وقتی رخ می‌دهد که Git نتواند تغییرهای دو طرف را خودکار ترکیب کند؛ مثلاً هر دو یک خط را متفاوت عوض کرده‌اند. \`git status\` فایل‌های unmerged را نشان می‌دهد. داخل فایل markerهای \`<<<<<<<\`، \`=======\` و \`>>>>>>>\` دو نسخه را جدا می‌کنند. نسخهٔ درست الزاماً ours یا theirs نیست؛ گاهی ترکیبی از هر دو است.

## کارورز

فرآیند قابل اتکا: وضعیت را بخوانید، نیت هر دو تغییر را بفهمید، markerها را حذف و نتیجه را تست کنید، سپس \`git add file\` بزنید. در merge با \`git commit\` پایان می‌دهید و در rebase با \`git rebase --continue\`. اگر فرض اولیه غلط بود، \`git merge --abort\` یا \`git rebase --abort\` وضعیت قبل را بازمی‌گرداند.

## سنیور

حل conflict فقط ساکت کردن Git نیست؛ semantic conflict ممکن است بدون marker ایجاد شود، مثلاً یک branch نام تابع را عوض کند و دیگری caller جدید بسازد. پس تست، lint و review diff نهایی ضروری است. برای conflictهای تکراری \`git rerere\` می‌تواند resolution قبلی را به خاطر بسپارد، اما خروجی آن نیز باید review شود.`,
        practicalMd: `در دو branch یک خط یکسان را متفاوت ویرایش کنید، merge را آغاز کنید، با \`git status\` تعارض را پیدا کنید و پس از ترکیب معنی‌دار دو تغییر تست بگیرید.`,
        exampleMd: `\`\`\`bash
git merge feature
git status
git diff --check
# فایل را اصلاح کنید
git add config.txt
git commit
\`\`\``,
        commands: ["git status", "git diff --check", "git add config.txt", "git merge --continue", "git merge --abort"],
      },
    ],
    exercises: [
      noteExercise({ titleFa: "انتخاب merge یا rebase", topicSlug: "git-branching", lessonSlug: "merge-vs-rebase", path: "/tmp/day9-strategy.txt", mustContain: "rebase", instructionsMd: "سؤال مصاحبه: برای branch عمومی و branch خصوصی چه زمانی merge یا rebase را انتخاب می‌کنید و ریسک هر انتخاب چیست؟ پاسخ خود را در آزمایشگاه ثبت کنید." }),
      noteExercise({ titleFa: "چک‌لیست حل conflict", topicSlug: "git-branching", lessonSlug: "conflict-resolution", path: "/tmp/day9-conflict.txt", mustContain: "--abort", instructionsMd: "هدف این است که یک چک‌لیست امن برای تشخیص، حل، اعتبارسنجی و در صورت نیاز لغو conflict ارائه دهید. پاسخ را در آزمایشگاه ثبت کنید." }),
    ],
    scenario: noteScenario({ titleFa: "بازنویسی branch مشترک", path: "/tmp/day9-scenario.txt", mustContain: "force-with-lease", incidentMd: "یک توسعه‌دهنده branch مشترک را rebase کرده و قصد force-push دارد.", symptomsMd: "همکاران commitهای محلی دارند و remote نیز از آخرین fetch جلوتر رفته است.", rootCause: "تاریخچهٔ عمومی بدون هماهنگی بازنویسی شده و push اجباری ممکن است کار دیگران را حذف کند.", difficulty: "hard" }),
    exam: {
      titleFa: "آزمون روز ۹: شاخه و تعارض",
      questions: [
        mc("کدام گزینه hash commitها را معمولاً تغییر می‌دهد؟", ["fast-forward merge", "rebase", "fetch", "status"], "rebase", "rebase commitها را روی پایهٔ جدید بازسازی می‌کند.", "git-branching"),
        tf("پس از رفع conflict در rebase باید git rebase --continue اجرا شود.", true, "بعد از اصلاح و stage کردن فایل، continue عملیات را ادامه می‌دهد.", "git-branching"),
        sa("چرا force-with-lease از force امن‌تر است؟", "اگر remote برخلاف انتظار تغییر کرده باشد push را رد می‌کند.", "lease مانع overwrite ناخواستهٔ commitهای جدید remote می‌شود.", "git-branching"),
        mc("اولین فرمان مناسب پس از conflict چیست؟", ["git clean -fd", "git status", "git reset --hard", "git push"], "git status", "status فایل‌های درگیر و مرحلهٔ فعلی عملیات را نشان می‌دهد.", "git-branching"),
      ],
    },
  },
  {
    dayNumber: 10,
    phaseSlug: "git-docker",
    titleFa: "Workflow تیمی، Pull Request و GitLab CI",
    objectiveFa: "بین trunk-based و GitFlow انتخاب مستدل داشته باشید و چرخهٔ PR و مفاهیم پایهٔ pipeline در GitLab را توضیح دهید.",
    topicSlugs: ["git-workflows", "gitlab"],
    lessons: [
      {
        slug: "team-workflows-pr",
        topicSlug: "git-workflows",
        titleFa: "Trunk-based، GitFlow و PR مؤثر",
        objectiveFa: "workflow را بر اساس cadence انتشار، اندازهٔ تیم و ریسک محصول انتخاب کنید.",
        theoryMd: `## مبتدی

Pull/Merge Request پیشنهادی برای ادغام یک branch است؛ فقط یک دکمه نیست. توضیح هدف، diff کوچک، تست‌ها، review و checkهای CI بخشی از آن‌اند. branch protection می‌تواند merge مستقیم، CI قرمز یا review ناکافی را ممنوع کند.

## کارورز

در trunk-based توسعه‌دهندگان با branchهای کوتاه‌عمر و ادغام مکرر روی main کار می‌کنند؛ feature flag کد ناقص را از انتشار جدا می‌کند. GitFlow شاخه‌های long-lived مانند develop، release و hotfix دارد و برای releaseهای نسخه‌ای و کم‌تکرار ساختار بیشتری می‌دهد، اما merge و drift بیشتری ایجاد می‌کند.

## سنیور

پاسخ مصاحبه‌ای خوب workflow را مذهبی انتخاب نمی‌کند. برای SaaS با deploy روزانه، trunk-based معمولاً feedback سریع‌تر و batch کوچک‌تر می‌دهد. برای محصولی با چند نسخهٔ پشتیبانی‌شده شاید release branch لازم باشد. معیارها شامل lead time، conflict rate، امکان rollback، compliance و توان تست خودکار است. PR بزرگ review سطحی ایجاد می‌کند؛ stack کردن PRهای کوچک یا commitهای اتمیک ریسک را کاهش می‌دهد.`,
        practicalMd: `برای یک تغییر فرضی PR بنویسید: مسئله، دامنه، روش تست، ریسک و rollback. سپس مشخص کنید این branch باید چند روز عمر کند و چرا.`,
        exampleMd: `\`\`\`bash
git switch -c feat/health-check
git add .
git commit -m "add service health check"
git push -u origin feat/health-check
\`\`\``,
        commands: ["git switch -c feat/health-check", "git add .", "git commit -m \"add service health check\"", "git push -u origin feat/health-check"],
      },
      {
        slug: "gitlab-ci-concepts",
        topicSlug: "gitlab",
        titleFa: "مفاهیم GitLab CI از pipeline تا runner",
        objectiveFa: "رابطهٔ pipeline، stage، job، runner، artifact و cache را در مصاحبه شرح دهید.",
        theoryMd: `## مبتدی

GitLab فایل \`.gitlab-ci.yml\` را می‌خواند و pipeline می‌سازد. pipeline مجموعه‌ای از jobهاست؛ stage ترتیب کلی مانند build، test و deploy را تعیین می‌کند و jobهای یک stage می‌توانند موازی اجرا شوند. Runner عاملی است که job را روی shell، container یا executor دیگر اجرا می‌کند.

## کارورز

Artifact خروجی قابل انتقال یا دانلود یک job است، مثل binary یا گزارش تست. Cache برای سرعت دادن به اجرای بعدی، مثل dependencyهاست و تضمین تحویل قطعی بین jobها نیست. \`needs\` وابستگی DAG می‌سازد تا job منتظر کل stage قبلی نماند. variables باید از تنظیمات امن CI بیایند؛ secret را در YAML یا repository commit نکنید.

## سنیور

pipeline قابل اعتماد باید reproducible، کم‌اختیار و fail-fast باشد. image و dependency را pin کنید، runnerهای privileged را محدود کنید، protected variables را فقط به branch/tag محافظت‌شده بدهید و artifact را retentionدار نگه دارید. در مصاحبه تفاوت CI با CD را روشن کنید: CI ادغام و صحت مداوم است؛ delivery/deployment رساندن آماده یا خودکار به محیط‌هاست.`,
        practicalMd: `یک pipeline سه‌مرحله‌ای طراحی کنید که build خروجی را artifact کند، test آن را مصرف کند و deploy فقط روی main و پس از تأیید اجرا شود.`,
        exampleMd: `\`\`\`yaml
stages: [build, test]
build:
  stage: build
  script: ["npm ci", "npm run build"]
  artifacts:
    paths: [".next/"]
test:
  stage: test
  script: ["npm test"]
\`\`\``,
        commands: ["git add .gitlab-ci.yml", "git commit -m \"add CI pipeline\"", "git push", "gitlab-runner verify"],
      },
    ],
    exercises: [
      noteExercise({ titleFa: "انتخاب workflow", topicSlug: "git-workflows", lessonSlug: "team-workflows-pr", path: "/tmp/day10-workflow.txt", mustContain: "trunk-based", instructionsMd: "سؤال مصاحبه: برای یک SaaS با انتشار روزانه چه workflowای مناسب‌تر است و این انتخاب چه مزایا و محدودیت‌هایی دارد؟ پاسخ را در آزمایشگاه ثبت کنید." }),
      noteExercise({ titleFa: "Artifact در برابر cache", topicSlug: "gitlab", lessonSlug: "gitlab-ci-concepts", path: "/tmp/day10-ci.txt", mustContain: "artifact", instructionsMd: "سؤال مصاحبه: artifact و cache در CI چه تفاوتی در هدف، ماندگاری و انتقال خروجی میان jobها دارند؟ پاسخ را در آزمایشگاه ثبت کنید." }),
    ],
    scenario: noteScenario({ titleFa: "نشت secret در pipeline", path: "/tmp/day10-scenario.txt", mustContain: "protected", incidentMd: "توکن deploy داخل `.gitlab-ci.yml` قرار گرفته و در log یک job چاپ شده است.", symptomsMd: "توکن در تاریخچهٔ Git و خروجی pipeline قابل مشاهده است.", rootCause: "secret به‌جای masked/protected variable در repository ذخیره شده است.", difficulty: "hard" }),
    exam: {
      titleFa: "آزمون روز ۱۰: Workflow و GitLab",
      questions: [
        mc("برای ادغام‌های بسیار مکرر و branch کوتاه‌عمر کدام workflow مناسب‌تر است؟", ["GitFlow", "trunk-based", "فقط release branch", "بدون version control"], "trunk-based", "این مدل batch کوچک و feedback سریع را تشویق می‌کند.", "git-workflows"),
        tf("cache در GitLab تضمین‌شده‌ترین راه انتقال binary بین jobهاست.", false, "برای خروجی قابل اتکا میان jobها artifact مناسب است.", "gitlab"),
        sa("Runner در GitLab CI چه می‌کند؟", "jobهای pipeline را با executor پیکربندی‌شده اجرا می‌کند.", "Runner نیروی اجرایی pipeline است.", "gitlab"),
        mc("کدام مورد کیفیت PR را بیشتر می‌کند؟", ["diff کوچک و تست روشن", "هزاران خط تغییر", "حذف توضیح", "خاموش کردن CI"], "diff کوچک و تست روشن", "تغییر کوچک‌تر review عمیق‌تر و rollback ساده‌تر دارد.", "git-workflows"),
      ],
    },
  },
  {
    dayNumber: 11,
    phaseSlug: "git-docker",
    titleFa: "معماری Docker، Image و Container",
    objectiveFa: "اجزای Docker را بشناسید، image را از container تفکیک کنید و اجرای container را با ps، run و logs عیب‌یابی کنید.",
    topicSlugs: ["docker-architecture", "images", "containers"],
    lessons: [
      {
        slug: "docker-engine-architecture",
        topicSlug: "docker-architecture",
        titleFa: "Docker Engine و جداسازی لینوکسی",
        objectiveFa: "نقش client، daemon، registry، namespace و cgroup را توضیح دهید.",
        theoryMd: `## مبتدی

فرمان \`docker\` یک client است که از API با Docker daemon صحبت می‌کند. daemon imageها، containerها، networkها و volumeها را مدیریت می‌کند و برای pull/push با registry ارتباط دارد. Container ماشین مجازی کامل نیست؛ processهای ایزوله‌ای است که kernel میزبان را به اشتراک می‌گذارند.

## کارورز

namespace دید process، network، mount و hostname را جدا می‌کند؛ cgroup مصرف CPU و memory را حساب و محدود می‌کند. filesystem لایه‌ای image با یک writable layer باریک برای container ترکیب می‌شود. توقف container دادهٔ writable layer را فوراً حذف نمی‌کند، اما حذف container آن را از بین می‌برد؛ دادهٔ پایدار باید volume یا bind mount داشته باشد.

## سنیور

مرز امنیتی container از VM ضعیف‌تر است چون kernel مشترک است. daemon معمولی اختیار بالایی دارد و عضویت در گروه docker عملاً دسترسی سطح root می‌دهد. در پاسخ ارشد از rootless mode، کمینه‌سازی capabilityها، seccomp و جداسازی workloadهای نامطمئن صحبت کنید. معماری جدید معمولاً containerd و runtime سطح پایین مانند runc را زیر Docker Engine دارد.`,
        practicalMd: `نسخهٔ client و server را بررسی کنید و با \`docker info\` storage driver و cgroup را پیدا کنید. تفاوت خطای client و daemon را در خروجی توضیح دهید.`,
        exampleMd: `\`\`\`bash
docker version
docker info
docker image ls
docker network ls
docker volume ls
\`\`\``,
        commands: ["docker version", "docker info", "docker image ls", "docker network ls", "docker volume ls"],
      },
      {
        slug: "images-containers-runtime",
        topicSlug: "containers",
        titleFa: "از Image تا Container در حال اجرا",
        objectiveFa: "چرخهٔ pull، create، start، run، ps و logs را عملی کنید.",
        theoryMd: `## مبتدی

Image قالب immutable و نسخه‌دار است؛ container نمونهٔ اجرایی آن با تنظیمات runtime و writable layer است. \`docker run IMAGE\` در اصل image را در صورت نیاز pull، container را create و سپس start می‌کند. \`docker ps\` فقط در حال اجراها و \`docker ps -a\` همه را نشان می‌دهد.

## کارورز

\`docker run --name web -d -p 8080:80 nginx\` یک container پس‌زمینه می‌سازد و port میزبان 8080 را به port 80 container وصل می‌کند. \`docker logs web\` stdout/stderr process اصلی را می‌خواند و \`docker exec -it web sh\` process جدیدی داخل container فعال اجرا می‌کند. exec جای SSH و تغییر دستی تولید نیست؛ image باید reproducible باشد.

## سنیور

عمر container به PID 1 وابسته است. اگر command اصلی تمام یا crash کند container متوقف می‌شود، حتی اگر process فرعی باقی مانده باشد. PID 1 باید signalهای SIGTERM را مدیریت و childها را reap کند. health check با «process هنوز اجراست» فرق دارد. در incident ابتدا \`docker ps -a\`، سپس \`docker logs\` و \`docker inspect\` را بررسی کنید.`,
        practicalMd: `nginx را با نام مشخص اجرا کنید، port را publish کنید، logs و inspect را ببینید، سپس stop و remove انجام دهید. بررسی کنید image پس از حذف container باقی می‌ماند.`,
        exampleMd: `\`\`\`bash
docker pull nginx:alpine
docker run --name web -d -p 8080:80 nginx:alpine
docker ps
docker logs web
docker inspect web
docker rm -f web
\`\`\``,
        commands: ["docker pull nginx:alpine", "docker run --name web -d -p 8080:80 nginx:alpine", "docker ps -a", "docker logs web", "docker inspect web"],
      },
    ],
    exercises: [
      noteExercise({ titleFa: "Container در برابر VM", topicSlug: "docker-architecture", lessonSlug: "docker-engine-architecture", path: "/tmp/day11-architecture.txt", mustContain: "kernel", instructionsMd: "سؤال مصاحبه: container و ماشین مجازی از نظر جداسازی، مصرف منابع و اشتراک kernel چه تفاوتی دارند؟ پاسخ را در آزمایشگاه ثبت کنید." }),
      noteExercise({ titleFa: "چک‌لیست container متوقف‌شده", topicSlug: "containers", lessonSlug: "images-containers-runtime", path: "/tmp/day11-runtime.txt", mustContain: "logs", instructionsMd: "هدف این است که یک چک‌لیست شواهد‌محور برای عیب‌یابی container متوقف‌شده، از وضعیت اجرا تا علت خروج، ارائه دهید. پاسخ را در آزمایشگاه ثبت کنید." }),
    ],
    scenario: noteScenario({ titleFa: "Container بلافاصله خارج می‌شود", path: "/tmp/day11-scenario.txt", mustContain: "PID 1", incidentMd: "container پس از `docker run -d` بلافاصله Exited می‌شود.", symptomsMd: "`docker ps` چیزی نشان نمی‌دهد اما `docker ps -a` exit code صفر ثبت کرده است.", rootCause: "فرمان اصلی container تمام شده و با پایان PID 1 عمر container نیز پایان یافته است." }),
    exam: {
      titleFa: "آزمون روز ۱۱: معماری و اجرا",
      questions: [
        mc("کدام جزء درخواست client را اجرا و objectهای Docker را مدیریت می‌کند؟", ["registry", "daemon", "Dockerfile", "volume"], "daemon", "Docker daemon API و lifecycle objectها را مدیریت می‌کند.", "docker-architecture"),
        tf("هر container kernel مستقل کامل خود را دارد.", false, "containerها معمولاً kernel میزبان را به اشتراک می‌گذارند.", "docker-architecture"),
        sa("تفاوت image و container چیست؟", "image قالب immutable است و container نمونهٔ اجرایی آن با writable layer است.", "یک image می‌تواند مبنای چند container باشد.", "images"),
        mc("برای دیدن containerهای متوقف‌شده کدام فرمان است؟", ["docker ps", "docker ps -a", "docker top image", "docker build"], "docker ps -a", "گزینهٔ -a همهٔ وضعیت‌ها را نشان می‌دهد.", "containers"),
      ],
    },
  },
  {
    dayNumber: 12,
    phaseSlug: "git-docker",
    titleFa: "Dockerfile، لایه‌ها و Multi-stage Build",
    objectiveFa: "Dockerfile قابل cache و امن بنویسید، لایه‌ها را مدیریت کنید و با multi-stage artifact نهایی را کوچک نگه دارید.",
    topicSlugs: ["dockerfile", "multistage"],
    lessons: [
      {
        slug: "dockerfile-layers-cache",
        topicSlug: "dockerfile",
        titleFa: "دستورهای Dockerfile و Cache لایه‌ای",
        objectiveFa: "اثر FROM، COPY، RUN، CMD و ENTRYPOINT بر build و runtime را بفهمید.",
        theoryMd: `## مبتدی

\`FROM\` image پایه را تعیین می‌کند، \`WORKDIR\` مسیر کاری را، \`COPY\` فایل‌ها را وارد image و \`RUN\` هنگام build فرمان اجرا می‌کند. \`CMD\` فرمان پیش‌فرض هنگام اجرای container است. تفاوت کلیدی مصاحبه: RUN زمان build است؛ CMD/ENTRYPOINT زمان runtime.

هر دستور معمولاً لایه می‌سازد و Docker نتیجه را cache می‌کند. اگر یک لایه یا ورودی‌اش تغییر کند، آن لایه و لایه‌های بعدی دوباره ساخته می‌شوند.

## کارورز

برای cache بهتر ابتدا فایل‌های dependency مانند \`package-lock.json\` را COPY و \`npm ci\` را RUN کنید، سپس source را COPY کنید. با این ترتیب تغییر source نصب dependency را باطل نمی‌کند. فایل \`.dockerignore\` باید \`.git\`، \`node_modules\`، secretها و خروجی build را از context حذف کند.

## سنیور

تعداد لایه به‌تنهایی معیار کیفیت نیست؛ ترتیب cache، reproducibility و حذف فایل در همان RUN مهم‌تر است. حذف package cache در لایهٔ بعدی اندازهٔ لایهٔ قبلی را کم نمی‌کند. base image و dependency را pin کنید، اما برنامهٔ منظم update امنیتی داشته باشید. secret build را با BuildKit secret mount بدهید، نه ARG یا COPY که ممکن است در history بماند.`,
        practicalMd: `یک Dockerfile برای برنامهٔ Node بنویسید که lockfile را قبل از source کپی کند، با user غیرroot اجرا شود و context مناسب داشته باشد. دو بار build کنید و cache hitها را مقایسه کنید.`,
        exampleMd: `\`\`\`dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
USER node
CMD ["node", "server.js"]
\`\`\``,
        commands: ["docker build -t demo:v1 .", "docker history demo:v1", "docker image inspect demo:v1", "docker run --rm demo:v1"],
      },
      {
        slug: "multistage-production",
        topicSlug: "multistage",
        titleFa: "Multi-stage برای Image تولید",
        objectiveFa: "ابزار build را از image runtime جدا کنید و stage هدف بسازید.",
        theoryMd: `## مبتدی

در multi-stage چند \`FROM\` داریم. stage سازنده compiler و dev dependency دارد؛ stage نهایی فقط artifact لازم را با \`COPY --from=builder\` می‌گیرد. نتیجه کوچک‌تر و سطح حمله کمتر است.

## کارورز

هر stage نام‌گذاری‌شده مثل \`AS builder\` مستقل است. با \`docker build --target builder .\` می‌توان stage خاص را برای debug یا CI ساخت. برای برنامهٔ compiled فقط binary و certificateهای لازم وارد runtime می‌شوند؛ source، package manager و compiler نباید بی‌دلیل باقی بمانند.

## سنیور

کوچک بودن به‌تنهایی کافی نیست. image نهایی باید امکان مشاهده‌پذیری، timezone/certificate مورد نیاز و راه debug کنترل‌شده داشته باشد. distroless سطح حمله را کاهش می‌دهد اما shell ندارد؛ تیم باید ابزارهای ephemeral debug یا image تشخیصی جدا داشته باشد. stageها secret را خودکار امن نمی‌کنند: اگر credential وارد context یا لایه شود، همچنان خطر دارد.`,
        practicalMd: `یک build دو مرحله‌ای بسازید، اندازهٔ image تک‌مرحله‌ای و نهایی را مقایسه کنید و با \`docker history\` مطمئن شوید compiler در runtime نیست.`,
        exampleMd: `\`\`\`dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/app ./cmd/app

FROM alpine:3.22
COPY --from=builder /out/app /app
USER 65532
ENTRYPOINT ["/app"]
\`\`\``,
        commands: ["docker build --target builder -t demo:builder .", "docker build -t demo:prod .", "docker image ls demo", "docker history demo:prod"],
      },
    ],
    exercises: [
      noteExercise({ titleFa: "راهبرد cache", topicSlug: "dockerfile", lessonSlug: "dockerfile-layers-cache", path: "/tmp/day12-cache.txt", mustContain: "package-lock.json", instructionsMd: "سؤال مصاحبه: در Dockerfile یک پروژهٔ Node، ترتیب کپی فایل‌های dependency و source چگونه بر cache لایه‌ها اثر می‌گذارد؟ پاسخ را در آزمایشگاه ثبت کنید." }),
      noteExercise({ titleFa: "مزیت multi-stage", topicSlug: "multistage", lessonSlug: "multistage-production", path: "/tmp/day12-multistage.txt", mustContain: "builder", instructionsMd: "سؤال مصاحبه: چرا stage ساخت نباید همان image نهایی production باشد و multi-stage build چه مزایایی ایجاد می‌کند؟ پاسخ را در آزمایشگاه ثبت کنید." }),
    ],
    scenario: noteScenario({ titleFa: "Image بزرگ و دارای secret", path: "/tmp/day12-scenario.txt", mustContain: ".dockerignore", incidentMd: "image تولید ۱.۸ گیگابایت است و فایل `.env` در build context قرار دارد.", symptomsMd: "`docker history` لایه‌های dependency حجیم دارد و source کامل به image کپی شده است.", rootCause: "ترتیب Dockerfile، نبود multi-stage و نبود `.dockerignore` باعث image حجیم و نشت داده شده است.", difficulty: "hard" }),
    exam: {
      titleFa: "آزمون روز ۱۲: Dockerfile",
      questions: [
        mc("کدام دستور هنگام build اجرا می‌شود؟", ["CMD", "ENTRYPOINT", "RUN", "docker exec"], "RUN", "RUN خروجی build را در لایه ثبت می‌کند.", "dockerfile"),
        tf("حذف فایل secret در RUN بعدی تضمین می‌کند در لایه‌های قبلی قابل بازیابی نیست.", false, "لایهٔ قبلی immutable است و داده ممکن است در history باقی بماند.", "dockerfile"),
        sa("هدف اصلی multi-stage build چیست؟", "جدا کردن محیط build از runtime و کپی فقط artifact لازم", "این کار اندازه و سطح حملهٔ image نهایی را کم می‌کند.", "multistage"),
        mc("برای cache بهتر در پروژهٔ Node ابتدا چه چیزی COPY می‌شود؟", ["کل source", "lockfile و package.json", ".git", "node_modules میزبان"], "lockfile و package.json", "dependency layer تا وقتی manifest تغییر نکرده cache می‌ماند.", "dockerfile"),
      ],
    },
  },
  {
    dayNumber: 13,
    phaseSlug: "git-docker",
    titleFa: "Docker Compose، Network و Volume",
    objectiveFa: "سرویس‌های چندکانتینری را با Compose اجرا کنید و discovery شبکه و پایداری داده را درست طراحی کنید.",
    topicSlugs: ["compose", "docker-networking", "volumes"],
    lessons: [
      {
        slug: "compose-services",
        topicSlug: "compose",
        titleFa: "مدل declarative در Docker Compose",
        objectiveFa: "service، project، environment و lifecycle را با compose.yaml مدیریت کنید.",
        theoryMd: `## مبتدی

Compose وضعیت مطلوب چند service را در \`compose.yaml\` تعریف می‌کند: image یا build، port، environment، volume و network. \`docker compose up -d\` منابع را ایجاد/همگام و \`docker compose down\` container و network پروژه را حذف می‌کند. یک service می‌تواند چند replica/container داشته باشد.

## کارورز

\`depends_on\` در شکل ساده ترتیب start را کنترل می‌کند، اما آماده‌بودن application را تضمین نمی‌کند. برای database از healthcheck و retry در client استفاده کنید. config غیرحساس می‌تواند environment باشد، ولی secret نباید در repository یا image ذخیره شود. \`docker compose config\` فایل نهایی پس از merge و interpolation را برای review نشان می‌دهد.

## سنیور

Compose برای محیط توسعه، تست یکپارچه و deploymentهای ساده مفید است، اما scheduler کامل با reconciliation چند-node نیست. پاسخ ارشد باید دربارهٔ idempotency، health، shutdown، profileها، overrideهای محیطی و parity با production صحبت کند. bind mount source برای توسعه مناسب است ولی image immutable باید مبنای production باشد.`,
        practicalMd: `یک stack وب و database تعریف کنید. healthcheck برای database بگذارید، config نهایی را validate کنید و lifecycle را با up، ps، logs و down مشاهده کنید.`,
        exampleMd: `\`\`\`yaml
services:
  web:
    image: nginx:alpine
    ports: ["8080:80"]
    depends_on: [db]
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_PASSWORD: local-only
\`\`\``,
        commands: ["docker compose config", "docker compose up -d", "docker compose ps", "docker compose logs -f web", "docker compose down"],
      },
      {
        slug: "networks-volumes",
        topicSlug: "docker-networking",
        titleFa: "Service Discovery و دادهٔ پایدار",
        objectiveFa: "شبکهٔ bridge، publish port، named volume و bind mount را تفکیک کنید.",
        theoryMd: `## مبتدی

Compose به‌طور پیش‌فرض network می‌سازد و serviceها با نام service از DNS داخلی همدیگر را پیدا می‌کنند؛ web باید به \`db:5432\` وصل شود، نه \`localhost\`. localhost داخل container به خود همان container اشاره می‌کند. \`ports: ["8080:80"]\` port 80 container را روی میزبان publish می‌کند؛ ارتباط داخلی معمولاً publish نمی‌خواهد.

## کارورز

Named volume را Docker مدیریت می‌کند و برای دادهٔ database مناسب است. bind mount یک مسیر مشخص میزبان را متصل می‌کند و برای source توسعه یا config محلی خوب است، اما وابستگی به filesystem میزبان دارد. anonymous volume نام پایدار انسانی ندارد و مدیریت lifecycle آن سخت‌تر است.

## سنیور

Volume backup نیست؛ حذف، corruption و خطای برنامه همچنان ممکن است، پس backup سازگار و restore test لازم است. در شبکه، فقط portهای لازم را publish و backendها را روی network داخلی نگه دارید. برای عیب‌یابی DNS و اتصال از \`docker network inspect\`، logs و ابزار داخل یک container تشخیصی استفاده کنید؛ نصب دائمی ابزار در image تولید سطح حمله را بالا می‌برد.`,
        practicalMd: `دو service را روی network مشترک قرار دهید، اتصال را با نام service آزمایش کنید و دادهٔ database را پس از recreate کردن container با named volume بررسی کنید.`,
        exampleMd: `\`\`\`yaml
services:
  db:
    image: postgres:17-alpine
    volumes: ["db-data:/var/lib/postgresql/data"]
    networks: [backend]
volumes:
  db-data:
networks:
  backend:
    internal: true
\`\`\``,
        commands: ["docker network ls", "docker network inspect PROJECT_default", "docker volume ls", "docker volume inspect PROJECT_db-data", "docker compose down"],
      },
    ],
    exercises: [
      noteExercise({ titleFa: "Localhost در container", topicSlug: "docker-networking", lessonSlug: "networks-volumes", path: "/tmp/day13-network.txt", mustContain: "db:5432", instructionsMd: "سؤال مصاحبه: چرا یک سرویس داخل Compose نباید برای اتصال به سرویس دیگر از localhost استفاده کند و service discovery چگونه این مسئله را حل می‌کند؟ پاسخ را در آزمایشگاه ثبت کنید." }),
      noteExercise({ titleFa: "Volume در برابر bind mount", topicSlug: "volumes", lessonSlug: "networks-volumes", path: "/tmp/day13-storage.txt", mustContain: "backup", instructionsMd: "سؤال مصاحبه: named volume و bind mount از نظر مدیریت، portability و کاربرد چه تفاوتی دارند و چرا هیچ‌کدام جای راهبرد پشتیبان‌گیری را نمی‌گیرد؟ پاسخ را در آزمایشگاه ثبت کنید." }),
    ],
    scenario: noteScenario({ titleFa: "وب به دیتابیس وصل نمی‌شود", path: "/tmp/day13-scenario.txt", mustContain: "service name", incidentMd: "سرویس web در Compose تلاش می‌کند به `localhost:5432` وصل شود.", symptomsMd: "connection refused دیده می‌شود؛ database سالم و روی network پروژه فعال است.", rootCause: "localhost داخل web container به خودش اشاره دارد و باید از service name دیتابیس استفاده شود." }),
    exam: {
      titleFa: "آزمون روز ۱۳: Compose و ذخیره‌سازی",
      questions: [
        mc("نام میزبان مناسب برای service دیتابیس با نام db چیست؟", ["localhost", "host.docker.internal همیشه", "db", "127.0.0.1"], "db", "DNS داخلی Compose نام service را resolve می‌کند.", "docker-networking"),
        tf("depends_on ساده تضمین می‌کند database آمادهٔ query است.", false, "ترتیب start با readiness یکی نیست و health/retry لازم است.", "compose"),
        sa("تفاوت named volume و bind mount چیست؟", "named volume را Docker مدیریت می‌کند؛ bind mount به مسیر مشخص میزبان وابسته است.", "انتخاب به portability و هدف توسعه یا داده بستگی دارد.", "volumes"),
        mc("کدام فرمان config نهایی Compose را نمایش می‌دهد؟", ["docker compose config", "docker compose top", "docker inspect image", "docker buildx ls"], "docker compose config", "این فرمان merge و interpolation را resolve و validate می‌کند.", "compose"),
      ],
    },
  },
  {
    dayNumber: 14,
    phaseSlug: "git-docker",
    titleFa: "امنیت، Registry، منابع و بهینه‌سازی Image",
    objectiveFa: "در سطح مصاحبهٔ سنیور زنجیرهٔ تأمین image، محدودیت منابع، hardening container و بهینه‌سازی قابل اندازه‌گیری را تحلیل کنید.",
    topicSlugs: ["container-security", "registries", "resource-limits", "image-optimization"],
    lessons: [
      {
        slug: "registry-supply-chain",
        topicSlug: "registries",
        titleFa: "Registry و زنجیرهٔ تأمین Image",
        objectiveFa: "tag، digest، احراز هویت، اسکن و امضای image را برای انتشار امن ترکیب کنید.",
        theoryMd: `## مبتدی

Registry image را ذخیره و توزیع می‌کند؛ repository مجموعهٔ نسخه‌های یک image است. tag مانند \`:1.4\` نام قابل جابه‌جایی است، اما digest با پیشوند \`sha256:\` به محتوای دقیق اشاره می‌کند. \`docker pull\` و \`docker push\` لایه‌های لازم را دریافت و ارسال می‌کنند.

## کارورز

برای production به tag شناور \`latest\` تکیه نکنید. نسخهٔ immutable و ترجیحاً digest را deploy کنید تا rollback و provenance روشن باشد. \`docker login\` credential را مدیریت می‌کند، اما token کوتاه‌عمر و کم‌اختیار بهتر از password مشترک است. registry خصوصی باید TLS، retention، access control و audit log داشته باشد.

## سنیور

اسکن CVE لازم است ولی کافی نیست: false positive، exploitability و زمان patch باید triage شوند. pipeline باید SBOM تولید، image را sign و هنگام admission امضا و policy را verify کند. rebuild منظم حتی بدون تغییر source لازم است تا base image وصله‌شده وارد artifact شود. promotion بهتر است همان digest آزموده‌شده را بین محیط‌ها جلو ببرد، نه اینکه برای production دوباره build کند.`,
        practicalMd: `یک image را با tag نسخه‌ای بسازید، digest آن را پس از push ثبت کنید و policy فرضی promotion بنویسید که همان artifact را از staging به production می‌برد.`,
        exampleMd: `\`\`\`bash
docker build -t registry.example/app:1.4.0 .
docker login registry.example
docker push registry.example/app:1.4.0
docker image inspect registry.example/app:1.4.0
\`\`\``,
        commands: ["docker login registry.example", "docker tag app:local registry.example/app:1.4.0", "docker push registry.example/app:1.4.0", "docker pull registry.example/app@sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"],
      },
      {
        slug: "hardening-limits-optimization",
        topicSlug: "container-security",
        titleFa: "Hardening، Resource Limit و Image Optimization",
        objectiveFa: "least privilege، limit منابع و کاهش image را بدون قربانی کردن پایداری اعمال کنید.",
        theoryMd: `## مبتدی

Container را با user غیرroot اجرا کنید، secret را داخل image نگذارید و فقط port لازم را باز کنید. \`docker run --memory 512m --cpus 1 IMAGE\` مصرف را محدود می‌کند. بدون limit یک container معیوب می‌تواند منابع میزبان را تحت فشار بگذارد.

## کارورز

\`--read-only\` filesystem ریشه را فقط‌خواندنی می‌کند و مسیرهای لازم را می‌توان tmpfs یا volume داد. capabilityها را با \`--cap-drop ALL\` حذف و فقط مورد لازم را اضافه کنید؛ \`--privileged\` تقریباً همهٔ مرزها را کنار می‌زند. memory limit سخت ممکن است به OOM kill منجر شود، پس limit، reservation، درخواست واقعی و metricها باید با load test تنظیم شوند.

## سنیور

بهینه‌سازی image شامل multi-stage، context کوچک، dependency تولیدی، base حداقلی و حذف artifactهای build است؛ هدف فقط عدد مگابایت نیست، بلکه زمان pull، سطح CVE، cache و قابلیت عملیات است. برای امنیت دفاع در عمق لازم است: rootless/user namespace، seccomp/AppArmor، read-only rootfs، no-new-privileges، policy امضا و patch cadence. در incident، OOMKilled را با leak اشتباه نگیرید: usage، limit، working set و exit reason را کنار هم تحلیل کنید. محدودیت خیلی پایین نیز outage می‌سازد.`,
        practicalMd: `یک container را با user غیرroot، filesystem فقط‌خواندنی، capability حداقلی، memory و CPU limit اجرا کنید. رفتار برنامه و مسیرهای نیازمند write را بررسی و مستند کنید.`,
        exampleMd: `\`\`\`bash
docker run --rm \
  --read-only --tmpfs /tmp \
  --cap-drop ALL --security-opt no-new-privileges \
  --memory 512m --cpus 1 app:1.4.0
docker stats --no-stream
\`\`\``,
        commands: ["docker run --read-only --cap-drop ALL --memory 512m --cpus 1 app:1.4.0", "docker stats --no-stream", "docker inspect app", "docker history app:1.4.0"],
      },
    ],
    exercises: [
      noteExercise({ titleFa: "سیاست promotion امن", topicSlug: "registries", lessonSlug: "registry-supply-chain", path: "/tmp/day14-registry.txt", mustContain: "digest", instructionsMd: "سؤال مصاحبه: چرا promotion همان image آزموده‌شده با شناسهٔ تغییرناپذیر، از rebuild یا tag شناور قابل‌اتکاتر است؟ پاسخ را در آزمایشگاه ثبت کنید.", difficulty: "hard" }),
      noteExercise({ titleFa: "چک‌لیست hardening", topicSlug: "container-security", lessonSlug: "hardening-limits-optimization", path: "/tmp/day14-hardening.txt", mustContain: "cap-drop", instructionsMd: "هدف این است که یک چک‌لیست دفاع در عمق برای امنیت container و محدودیت منابع ارائه دهید و trade-offهای عملیاتی آن را توضیح دهید. پاسخ را در آزمایشگاه ثبت کنید.", difficulty: "hard" }),
    ],
    scenario: noteScenario({ titleFa: "OOM و image آسیب‌پذیر", path: "/tmp/day14-scenario.txt", mustContain: "OOMKilled", incidentMd: "نسخهٔ جدید گهگاه restart می‌شود و scanner نیز CVE بحرانی در base image گزارش کرده است.", symptomsMd: "inspect مقدار `OOMKilled=true` دارد، memory روی 256MiB محدود است و image با latest منتشر شده است.", rootCause: "memory limit بدون load test تنظیم شده و artifact با tag شناور و base image وصله‌نشده deploy شده است.", difficulty: "hard" }),
    exam: {
      titleFa: "آزمون روز ۱۴: مصاحبهٔ سنیور Docker",
      questions: [
        mc("برای اشاره به محتوای immutable image کدام مناسب‌تر است؟", ["latest", "نام container", "digest", "port"], "digest", "digest به محتوای دقیق و قابل تأیید اشاره می‌کند.", "registries"),
        tf("اجرای container با --privileged روش توصیه‌شدهٔ حل خطای permission است.", false, "privileged سطح دسترسی بسیار وسیع می‌دهد و اصل least privilege را نقض می‌کند.", "container-security"),
        sa("سه اقدام hardening برای container نام ببرید.", "اجرای non-root، حذف capabilityها و read-only کردن root filesystem", "کنترل secret، seccomp و limit منابع نیز از دفاع در عمق‌اند.", "container-security"),
        mc("پس از OOMKilled بهترین تحلیل اولیه چیست؟", ["حذف limit", "مقایسهٔ usage و limit و exit reason", "افزودن privileged", "استفاده از latest"], "مقایسهٔ usage و limit و exit reason", "باید leak، spike و limit نامتناسب را با شواهد تفکیک کرد.", "resource-limits"),
      ],
    },
  },
];
