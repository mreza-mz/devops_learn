import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "./types";

export const cicdDays: DaySeed[] = [
  {
    dayNumber: 15,
    phaseSlug: "cicd",
    titleFa: "مبانی Pipeline در GitLab CI/CD",
    objectiveFa: "چرخهٔ build، test و deploy را طراحی کنید و علت fail-fast و جداسازی stageها را در مصاحبه توضیح دهید.",
    topicSlugs: ["pipelines", "gitlab-cicd"],
    lessons: [
      {
        slug: "pipeline-fundamentals",
        topicSlug: "pipelines",
        titleFa: "Pipeline از commit تا بازخورد",
        objectiveFa: "job، stage و ترتیب اجرای خط لوله را از پایه تا طراحی سازمانی بشناسید.",
        theoryMd: `## مبتدی
Pipeline زنجیره‌ای خودکار از کارهاست که با یک رویداد، معمولاً push یا merge request، آغاز می‌شود. هر **job** یک کار مانند کامپایل یا آزمون است و jobها در **stage**هایی مثل \`build\`، \`test\` و \`deploy\` گروه‌بندی می‌شوند. stage بعدی فقط وقتی شروع می‌شود که stage قبلی موفق باشد؛ jobهای یک stage می‌توانند موازی اجرا شوند.

## کارورز
هدف جداسازی stageها بازخورد سریع و مرز مسئولیت روشن است. build باید خروجی قابل تکرار بسازد، test همان خروجی را اعتبارسنجی کند و deploy نسخهٔ تأییدشده را منتشر کند. آزمون ارزان را جلوتر بگذارید تا pipeline روی خطای ساده زود متوقف شود. cache برای سرعت است، اما artifact خروجی رسمی بین jobهاست.

## سنیور
در طراحی سازمانی، pipeline فقط چند فرمان نیست؛ یک کنترل تغییر است. برای merge request آزمون و اسکن اجرا می‌شود، برای شاخهٔ اصلی artifact نسخه‌دار تولید می‌شود و استقرار production با approval و محیط محافظت‌شده انجام می‌گیرد. معیارهای مهم زمان بازخورد، نرخ شکست کاذب، قابلیت تکرار و امکان ردیابی commit تا deployment هستند. در مصاحبه توضیح دهید که deploy مستقیم از workspace یک runner، زنجیرهٔ تأمین را غیرقابل حسابرسی می‌کند.`,
        practicalMd: `یک pipeline سه‌مرحله‌ای رسم کنید. برای هر stage ورودی، خروجی و شرط شکست را بنویسید و مشخص کنید کدام jobها قابلیت اجرای موازی دارند.`,
        exampleMd: `\`\`\`yaml
stages: [build, test, deploy]
build:
  stage: build
  script: ["npm ci", "npm run build"]
test:
  stage: test
  script: ["npm test"]
deploy:
  stage: deploy
  script: ["./deploy.sh"]
\`\`\``,
        commands: ["git status", "git rev-parse HEAD"],
      },
      {
        slug: "gitlab-pipeline",
        topicSlug: "gitlab-cicd",
        titleFa: "ساختار .gitlab-ci.yml و قواعد اجرا",
        objectiveFa: "یک پیکربندی GitLab CI قابل نگهداری با rules و وابستگی روشن تحلیل کنید.",
        theoryMd: `## مبتدی
GitLab فایل \`.gitlab-ci.yml\` را از ریشهٔ مخزن می‌خواند. کلید \`stages\` ترتیب مرحله‌ها و هر کلید job، image، script و stage آن را مشخص می‌کند. خروج صفر فرمان موفقیت و خروج غیرصفر شکست job است.

## کارورز
\`rules\` تعیین می‌کند job در merge request، شاخهٔ اصلی یا tag اجرا شود. قاعده باید صریح باشد؛ اجرای deploy روی هر branch هم پرهزینه و هم خطرناک است. \`needs\` می‌تواند DAG بسازد تا job بدون انتظار برای تمام stage قبلی، به محض آماده شدن وابستگی‌اش اجرا شود.

## سنیور
فایل CI را مانند کد محصول review کنید: template مشترک، نسخهٔ ثابت image، timeout، retry محدود و defaultهای شفاف. include بدون pin کردن نسخه ریسک تغییر ناگهانی دارد. pipeline باید idempotent باشد؛ اجرای دوباره نباید محیط را به وضعیت ناشناخته ببرد. برای تشخیص خطا، اول job log، متغیرهای rule و commit SHA را بررسی کنید، نه اینکه کورکورانه retry بزنید.`,
        practicalMd: `برای merge request یک test job و برای شاخهٔ اصلی یک deploy job تعریف ذهنی کنید. اثر ترتیب rules و شرط \`CI_COMMIT_BRANCH == CI_DEFAULT_BRANCH\` را توضیح دهید.`,
        exampleMd: `\`\`\`yaml
test:
  stage: test
  script: npm test
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
deploy:
  stage: deploy
  script: ./deploy.sh
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
\`\`\``,
        commands: ["git diff -- .gitlab-ci.yml"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی سه مرحلهٔ خط لوله",
        topicSlug: "pipelines",
        lessonSlug: "pipeline-fundamentals",
        path: "/tmp/day15-pipeline.txt",
        mustContain: "build",
        instructionsMd: "هدف این است که یک pipeline شامل build، test و deploy طراحی کنید؛ ورودی و خروجی هر مرحله و دلیل fail-fast بودن آن را توضیح دهید. پاسخ را در آزمایشگاه ثبت کنید.",
      }),
      noteExercise({
        titleFa: "قواعد GitLab برای شاخه‌ها",
        topicSlug: "gitlab-cicd",
        lessonSlug: "gitlab-pipeline",
        path: "/tmp/day15-rules.txt",
        mustContain: "rules",
        instructionsMd: "سؤال مصاحبه: چگونه قواعد pipeline را طوری طراحی می‌کنید که test برای merge request و deploy فقط برای شاخهٔ اصلی اجرا شود؟ پاسخ را در آزمایشگاه ثبت کنید.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "استقرار ناخواسته از feature branch",
      path: "/tmp/day15-scenario.txt",
      mustContain: "rules",
      incidentMd: "با هر push، job استقرار production اجرا شده و نسخهٔ آزمایشی منتشر می‌شود. مسیر تصمیم‌گیری امن و اصلاح شرط اجرا را ثبت کنید.",
      symptomsMd: "Deploymentهای متعدد با commitهای خارج از شاخهٔ اصلی و نبود approval.",
      rootCause: "Deploy job has no branch rules or protected-environment gate.",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۱۵",
      questions: [
        mc("مبتدی — در pipeline سه‌مرحله‌ای کدام ترتیب منطقی‌تر است؟", ["deploy,test,build", "build,test,deploy", "test,deploy,build", "build,deploy,test"], "build,test,deploy", "ابتدا خروجی ساخته، سپس اعتبارسنجی و بعد منتشر می‌شود.", "pipelines"),
        tf("کارورز — همهٔ jobهای یک stage الزاماً سری اجرا می‌شوند.", false, "jobهای یک stage در صورت وجود runner می‌توانند موازی باشند.", "pipelines"),
        sa("کارورز — برای محدود کردن اجرای job بر اساس branch یا نوع pipeline در GitLab از چه کلیدی استفاده می‌شود؟", "rules", "rules شرط حضور یا عدم حضور job در pipeline را تعیین می‌کند.", "gitlab-cicd"),
        sa("سنیور — چرا deploy کردن مستقیم از workspace runner ضدالگوی مهمی است؟", "چون artifact نسخه‌دار و قابل ردیابی وجود ندارد و نتیجه به وضعیت محلی runner وابسته می‌شود.", "artifact تغییرناپذیر، زنجیرهٔ commit تا استقرار را قابل تکرار و حسابرسی می‌کند.", "pipelines", 5),
      ],
    },
  },
  {
    dayNumber: 16,
    phaseSlug: "cicd",
    titleFa: "Runner، Artifact و Registry",
    objectiveFa: "محل اجرای job، انتقال خروجی و نگهداری image را با مرزهای امنیتی و عملیاتی درست طراحی کنید.",
    topicSlugs: ["runners", "artifacts", "ci-registries"],
    lessons: [
      {
        slug: "runner-operations",
        topicSlug: "runners",
        titleFa: "Runner و محیط اجرای Job",
        objectiveFa: "executor، tag و اصل runner کم‌اختیار را در سناریوهای واقعی به کار ببرید.",
        theoryMd: `## مبتدی
Runner عاملی است که job را از GitLab می‌گیرد و script آن را اجرا می‌کند. executor می‌تواند shell، Docker یا Kubernetes باشد. tagهای runner باید با tagهای job هم‌خوان باشند؛ در غیر این صورت job در وضعیت pending می‌ماند.

## کارورز
runner اشتراکی برای workload عمومی مناسب است، ولی runner استقرار production باید محافظت‌شده و محدود باشد. executor کانتینری محیط تمیزتر و تکرارپذیرتر می‌دهد؛ shell executor به ابزار و آلودگی میزبان وابسته است. پاک‌سازی workspace و محدود کردن concurrency از تداخل jobها جلوگیری می‌کند.

## سنیور
runner مرز اعتماد اجرای کد است. کد merge request غیرقابل اعتماد نباید روی runner دارای شبکهٔ production یا credential دائمی اجرا شود. runnerها را ephemeral، patch‌شده، با egress محدود و identity کوتاه‌عمر طراحی کنید. در incident، correlation بین job ID، runner ID و audit log مسیر اجرای واقعی را روشن می‌کند.`,
        practicalMd: "سناریوی pending job را با بررسی tag، وضعیت online runner، ظرفیت concurrency و protected بودن branch تحلیل کنید.",
        exampleMd: `\`\`\`yaml
deploy:
  tags: [production]
  script: ./deploy.sh
\`\`\``,
        commands: ["git rev-parse HEAD"],
      },
      {
        slug: "artifact-registry",
        topicSlug: "artifacts",
        titleFa: "Artifact قابل ردیابی و Container Registry",
        objectiveFa: "artifact، cache و image registry را از نظر چرخهٔ عمر و قابلیت تکرار تفکیک کنید.",
        theoryMd: `## مبتدی
Artifact فایل خروجی job است؛ مانند bundle، گزارش آزمون یا binary. GitLab آن را با retention مشخص نگه می‌دارد تا job بعدی یا کاربر دریافت کند. cache برای شتاب دادن dependencyهاست و تضمین خروجی رسمی نمی‌دهد.

## کارورز
برای کانتینر، registry محل ذخیرهٔ image است. image را با tag تغییرناپذیر مثل commit SHA push کنید؛ \`latest\` به‌تنهایی معلوم نمی‌کند چه کدی اجرا شده است. deploy باید همان digest آزموده‌شده را pull کند، نه اینکه دوباره build کند.

## سنیور
سیاست retention، امضای image، SBOM و اسکن آسیب‌پذیری بخشی از زنجیرهٔ تأمین است. artifact باید provenance داشته باشد: commit، pipeline و ابزار سازنده. promotion یعنی همان artifact از staging به production می‌رود؛ rebuild در هر محیط احتمال تفاوت و حمله را بالا می‌برد. دسترسی push به registry باید از pull production جدا باشد.`,
        practicalMd: "برای یک image مسیر build، scan، push و deploy-by-digest را بنویسید و تفاوت retention artifact با cache را توضیح دهید.",
        exampleMd: `\`\`\`yaml
build-image:
  script:
    - docker build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA" .
    - docker push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
  artifacts:
    reports:
      dotenv: build.env
\`\`\``,
        commands: ["docker image ls", "docker inspect"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "چک‌لیست Runner امن",
        topicSlug: "runners",
        lessonSlug: "runner-operations",
        path: "/tmp/day16-runner.txt",
        mustContain: "ephemeral",
        instructionsMd: "سؤال مصاحبه: یک runner تولید امن از نظر executor، تخصیص job، جداسازی شبکه، credential و پاک‌سازی چه ویژگی‌هایی دارد و چرا عمر کوتاه آن مهم است؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "medium",
      }),
      noteExercise({
        titleFa: "مسیر Artifact تا Registry",
        topicSlug: "ci-registries",
        lessonSlug: "artifact-registry",
        path: "/tmp/day16-artifact.txt",
        mustContain: "digest",
        instructionsMd: "سؤال مصاحبه: cache و artifact چه تفاوتی دارند و چگونه مطمئن می‌شوید همان image آزموده‌شده در محیط مقصد deploy می‌شود؟ پاسخ را در آزمایشگاه ثبت کنید.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Job برای همیشه Pending است",
      path: "/tmp/day16-scenario.txt",
      mustContain: "tag",
      incidentMd: "job استقرار pending مانده است؛ بدون retry کور، سازگاری tag و runner، ظرفیت و protected branch را بررسی کنید.",
      symptomsMd: "هیچ log اجرایی وجود ندارد و پیام نبود runner واجد شرایط دیده می‌شود.",
      rootCause: "Job requests a tag that no online eligible runner provides.",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۱۶",
      questions: [
        mc("مبتدی — چه مؤلفه‌ای script یک job را اجرا می‌کند؟", ["Registry", "Runner", "Artifact", "Merge request"], "Runner", "Runner job را دریافت و با executor اجرا می‌کند.", "runners"),
        tf("کارورز — cache جایگزین مطمئن artifact نسخه‌دار است.", false, "cache بهینه‌سازی قابل حذف است؛ artifact خروجی رسمی و قابل ردیابی است.", "artifacts"),
        sa("کارورز — برای tag کردن image به شکلی که به commit دقیق اشاره کند، کدام متغیر GitLab مناسب است؟", "CI_COMMIT_SHA", "SHA نسبت به latest مرجع روشن و تغییرناپذیرتری است.", "ci-registries"),
        sa("سنیور — چرا runner مربوط به merge request نباید credential دائمی production داشته باشد؟", "چون کد غیرقابل اعتماد می‌تواند credential را سرقت و به production دسترسی پیدا کند.", "جداسازی trust zone و هویت کوتاه‌عمر blast radius را کاهش می‌دهد.", "runners", 5),
      ],
    },
  },
  {
    dayNumber: 17,
    phaseSlug: "cicd",
    titleFa: "Secrets و امنیت CI",
    objectiveFa: "رازها را بدون افشا در log یا کد، با حداقل دسترسی و چرخهٔ عمر قابل ممیزی مدیریت کنید.",
    topicSlugs: ["secrets"],
    lessons: [
      {
        slug: "secret-handling",
        topicSlug: "secrets",
        titleFa: "مدیریت امن Secret در Pipeline",
        objectiveFa: "روش تزریق، masking، protection و rotation رازها را دقیق توضیح دهید.",
        theoryMd: `## مبتدی
secret داده‌ای مانند token، password یا private key است. راز نباید در مخزن، Dockerfile، artifact عمومی یا خروجی فرمان چاپ شود. متغیر masked در GitLab مقدار را در log پنهان می‌کند و متغیر protected فقط در refهای محافظت‌شده در دسترس است.

## کارورز
masking کنترل نمایش است، نه کنترل دسترسی؛ script مخرب هنوز می‌تواند راز را encode و خارج کند. متغیر file برای certificate و کلید چندخطی مناسب است. scope محیطی باعث می‌شود credential production در job staging ظاهر نشود. rotation باید شامل صدور مقدار جدید، rollout، ابطال مقدار قدیم و آزمون باشد.

## سنیور
بهترین الگو گرفتن credential کوتاه‌عمر با workload identity از secret manager است. این روش از راز ایستای مشترک بهتر است و audit دقیق می‌دهد. لاگ debug، shell tracing با \`set -x\`، fork pipeline و dependency آلوده مسیرهای رایج نشت هستند. در مصاحبه بین masking، encryption at rest، authorization و secret zero تمایز بگذارید.`,
        practicalMd: "یک threat model برای secret در pipeline بنویسید: چه کسی آن را می‌سازد، کدام job می‌بیند، چگونه revoke می‌شود و چه لاگی نباید ثبت شود.",
        exampleMd: `\`\`\`yaml
deploy:
  script:
    - set +x
    - ./deploy --token "$DEPLOY_TOKEN"
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
\`\`\``,
        commands: ["git log --all --oneline", "git diff --cached"],
      },
      {
        slug: "ci-security",
        topicSlug: "secrets",
        titleFa: "Threat Model و پاسخ به نشت",
        objectiveFa: "نشت credential را مهار، ریشه‌یابی و از تکرار آن جلوگیری کنید.",
        theoryMd: `## مبتدی
اگر راز در log یا commit دیده شد، فقط پاک کردن متن کافی نیست؛ باید آن را **باطل و جایگزین** کنید. هر کسی که نسخهٔ قبلی را دیده یا clone کرده ممکن است مقدار را داشته باشد.

## کارورز
روند incident: توقف job در حال اجرا، revoke فوری، بررسی audit log برای سوءاستفاده، صدور راز جدید، پاک‌سازی نمایش عمومی و سپس RCA. پاک کردن history بدون rotation امنیت را برنمی‌گرداند. dependencyها و imageهای CI را pin و scan کنید و permission job token را محدود نگه دارید.

## سنیور
کنترل‌ها لایه‌ای‌اند: protected branch و approval جلوی تغییر یک‌نفره، signed artifact جلوی جایگزینی خروجی و runner isolation جلوی حرکت جانبی را می‌گیرد. برای forkها راز ارسال نکنید. معیار بلوغ، تعداد رازهای ایستا، سن credential، زمان revoke و پوشش audit است؛ نه فقط فعال بودن گزینهٔ masked.`,
        practicalMd: "برای نشت token در job log، یک runbook پنج‌مرحله‌ای بنویسید و کنترل پیشگیرانه و آشکارساز را جدا کنید.",
        exampleMd: `\`\`\`text
contain -> revoke -> investigate -> rotate -> prevent
\`\`\``,
        commands: ["git grep -n TOKEN", "git log -p --all"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "مدل تهدید Secret",
        topicSlug: "secrets",
        lessonSlug: "secret-handling",
        path: "/tmp/day17-secrets.txt",
        mustContain: "rotation",
        instructionsMd: "سؤال مصاحبه: masked و protected بودن secret چه مسئله‌های متفاوتی را حل می‌کنند و scope محیطی، credential کوتاه‌عمر و rotation چگونه ریسک را کاهش می‌دهند؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "Runbook نشت Token",
        topicSlug: "secrets",
        lessonSlug: "ci-security",
        path: "/tmp/day17-incident.txt",
        mustContain: "revoke",
        instructionsMd: "هدف این است که برای افشای token در log یک runbook مرحله‌ای از containment تا بازیابی و پیشگیری ارائه دهید و ترتیب اقدامات را توجیه کنید. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Token در Job Log چاپ شده",
      path: "/tmp/day17-scenario.txt",
      mustContain: "revoke",
      incidentMd: "یک job با set -x مقدار token تولید را در log عمومی نمایش داده است. ترتیب containment و بازیابی را ثبت کنید.",
      symptomsMd: "مقدار credential در log قابل مشاهده و job از runner اشتراکی اجرا شده است.",
      rootCause: "Shell tracing exposed an over-privileged static production token.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۱۷",
      questions: [
        tf("مبتدی — masked بودن متغیر به‌تنهایی مانع دسترسی script به مقدار آن می‌شود.", false, "masking فقط نمایش log را کاهش می‌دهد؛ job همچنان مقدار را دریافت می‌کند.", "secrets"),
        mc("کارورز — اولین اقدام پس از افشای token فعال چیست؟", ["ویرایش README", "revoke یا غیرفعال‌سازی token", "retry pipeline", "فقط پاک کردن log"], "revoke یا غیرفعال‌سازی token", "تا token معتبر است مهاجم می‌تواند از آن استفاده کند.", "secrets"),
        sa("کارورز — برای محدود کردن secret تولید به jobهای ref محافظت‌شده چه ویژگی‌ای لازم است؟", "protected", "Protected variable فقط در ref واجد شرایط تزریق می‌شود.", "secrets"),
        sa("سنیور — مزیت اصلی workload identity نسبت به secret ایستای مشترک چیست؟", "credential کوتاه‌عمر و محدود به workload با audit و بدون توزیع راز دائمی فراهم می‌کند.", "کاهش عمر و دامنهٔ credential احتمال سوءاستفاده و هزینهٔ rotation را کم می‌کند.", "secrets", 5),
      ],
    },
  },
  {
    dayNumber: 18,
    phaseSlug: "cicd",
    titleFa: "Blue-Green، Canary و Rollback",
    objectiveFa: "استقرار تدریجی را با معیار سلامت، کنترل ترافیک و rollback کم‌ریسک اجرا و تحلیل کنید.",
    topicSlugs: ["blue-green", "canary", "rollback", "deployment"],
    lessons: [
      {
        slug: "progressive-delivery",
        topicSlug: "blue-green",
        titleFa: "Blue-Green و Canary",
        objectiveFa: "دو الگوی کاهش ریسک انتشار را بر اساس هزینه، سرعت و سیگنال انتخاب کنید.",
        theoryMd: `## مبتدی
در Blue-Green دو محیط تقریباً یکسان داریم: نسخهٔ فعلی ترافیک می‌گیرد و نسخهٔ جدید جداگانه آماده می‌شود؛ پس از آزمون، مسیر ترافیک جابه‌جا می‌شود. در Canary نسخهٔ جدید ابتدا درصد کمی از کاربران را می‌گیرد و سپس سهم آن مرحله‌ای افزایش می‌یابد.

## کارورز
Blue-Green rollback سریع با برگرداندن route می‌دهد، اما ظرفیت دوبرابر و سازگاری database می‌خواهد. Canary ظرفیت کمتری می‌خواهد و اثر واقعی را زود نشان می‌دهد، ولی routing، segmentation و تحلیل متریک پیچیده‌تر است. health check فنی کافی نیست؛ error rate، latency و شاخص کسب‌وکار باید guardrail باشند.

## سنیور
انتخاب cohort اهمیت دارد: درصد تصادفی ممکن است tenant بزرگ یا منطقهٔ خاص را پنهان کند. baseline را با نسخهٔ stable هم‌زمان مقایسه کنید تا تغییر بار عمومی با regression اشتباه نشود. schema migration باید expand/contract و backward-compatible باشد؛ وگرنه rollback کد، داده را برنمی‌گرداند. promotion خودکار بدون حداقل حجم نمونه و پنجرهٔ پایدار، canary نمایشی است.`,
        practicalMd: "برای API پرترافیک، مراحل ۱٪، ۱۰٪، ۵۰٪ و ۱۰۰٪ را همراه metric، مدت مشاهده و شرط توقف تعریف کنید.",
        exampleMd: `\`\`\`text
1% -> observe errors/latency -> 10% -> 50% -> 100%
guardrail breach -> stop traffic -> rollback
\`\`\``,
        commands: ["curl -fsS http://service/health"],
      },
      {
        slug: "rollback-deployment",
        topicSlug: "rollback",
        titleFa: "Rollback امن و آمادگی استقرار",
        objectiveFa: "rollback را از redeploy و roll-forward جدا کرده و محدودیت داده را مدیریت کنید.",
        theoryMd: `## مبتدی
deployment رساندن نسخه به محیط هدف است. rollback بازگرداندن سرویس به نسخهٔ سالم قبلی است؛ باید نسخهٔ دقیق، دستور، مالک تصمیم و روش تأیید سلامت از قبل معلوم باشد.

## کارورز
rollback همیشه پاسخ درست نیست. اگر migration تخریبی اجرا شده باشد، باینری قدیمی شاید با schema جدید کار نکند. گاهی roll-forward کوچک امن‌تر است. feature flag می‌تواند قابلیت معیوب را بدون بازسازی نسخه خاموش کند. artifact قبلی باید در registry باقی مانده و قابل verify باشد.

## سنیور
تصمیم rollback بر اساس SLO و error budget است، نه احساس. freeze تغییرات، ثبت timeline، حفظ evidence و ارتباط با ذی‌نفعان بخش incident هستند. rollback plan را در staging تمرین کنید و زمان واقعی بازیابی را بسنجید. استقرار موفق یعنی متریک‌ها در پنجرهٔ soak پایدار بمانند، نه فقط اینکه فرمان deploy خروج صفر بدهد.`,
        practicalMd: "یک runbook شامل trigger، دستور بازگشت، محدودیت migration، validation و ارتباطات incident تدوین کنید.",
        exampleMd: `\`\`\`text
trigger: error_rate > 2%
action: route to stable digest
verify: health + latency + business transaction
\`\`\``,
        commands: ["git tag --list", "git show --stat"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طرح Canary مرحله‌ای",
        topicSlug: "canary",
        lessonSlug: "progressive-delivery",
        path: "/tmp/day18-canary.txt",
        mustContain: "error rate",
        instructionsMd: "هدف این است که یک rollout قناری مرحله‌ای طراحی کنید؛ سهم ترافیک، پنجرهٔ مشاهده، شاخص‌های سلامت و معیارهای promotion یا abort را توضیح دهید. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "Runbook Rollback",
        topicSlug: "rollback",
        lessonSlug: "rollback-deployment",
        path: "/tmp/day18-rollback.txt",
        mustContain: "migration",
        instructionsMd: "سؤال مصاحبه: یک runbook rollback امن باید چه triggerها، artifactها و اعتبارسنجی‌هایی داشته باشد و migration ناسازگار چگونه تصمیم را تغییر می‌دهد؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Canary با افزایش خطای پرداخت",
      path: "/tmp/day18-scenario.txt",
      mustContain: "rollback",
      incidentMd: "پس از رساندن canary به ۱۰٪، error rate پرداخت از baseline عبور کرده است. تصمیم توقف، rollback و جمع‌آوری شواهد را ثبت کنید.",
      symptomsMd: "سلامت عمومی سبز است اما تراکنش پرداخت نسخهٔ canary خطای بیشتری دارد.",
      rootCause: "A new payment client times out under production traffic despite passing shallow health checks.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۱۸",
      questions: [
        mc("مبتدی — در Blue-Green معمولاً چگونه نسخهٔ جدید فعال می‌شود؟", ["بازسازی مستقیم سرور فعلی", "جابه‌جایی ترافیک به محیط آمادهٔ جدید", "حذف هر دو محیط", "تغییر رمز"], "جابه‌جایی ترافیک به محیط آمادهٔ جدید", "محیط جدید پیشاپیش آماده و آزموده می‌شود.", "blue-green"),
        tf("کارورز — سبز بودن health endpoint به‌تنهایی برای promotion canary کافی است.", false, "متریک‌های کاربرمحور، latency و error rate نیز لازم‌اند.", "canary"),
        sa("کارورز — الگویی برای migration سازگار با نسخهٔ قدیم و جدید نام ببرید.", "expand/contract", "ابتدا تغییر افزایشی سازگار، سپس مهاجرت مصرف‌کننده و در پایان حذف قدیمی انجام می‌شود.", "deployment"),
        sa("سنیور — چه زمانی roll-forward می‌تواند از rollback امن‌تر باشد؟", "وقتی تغییر داده یا schema با نسخهٔ قبلی ناسازگار است و اصلاح کوچک رو به جلو ریسک کمتری دارد.", "rollback باینری بدون سازگاری داده ممکن است خرابی را تشدید کند.", "rollback", 5),
      ],
    },
  },
  {
    dayNumber: 19,
    phaseSlug: "cicd",
    titleFa: "راهبرد استقرار و مصاحبهٔ GitOps",
    objectiveFa: "راهبرد انتشار را متناسب با ریسک انتخاب و مدل reconciliation در GitOps را در سطح سنیور دفاع کنید.",
    topicSlugs: ["deploy-strategies"],
    lessons: [
      {
        slug: "deployment-strategies",
        topicSlug: "deploy-strategies",
        titleFa: "انتخاب راهبرد استقرار",
        objectiveFa: "Recreate، rolling، blue-green و canary را با معیارهای عملی مقایسه کنید.",
        theoryMd: `## مبتدی
در Recreate نسخهٔ قدیم متوقف و نسخهٔ جدید شروع می‌شود؛ ساده ولی همراه downtime است. Rolling instanceها را کم‌کم جایگزین می‌کند. Blue-Green محیط دوم و سوییچ ترافیک دارد. Canary سهم ترافیک نسخهٔ جدید را مرحله‌ای زیاد می‌کند.

## کارورز
هیچ راهبردی مطلقاً بهترین نیست. سرویس stateless با replica زیاد برای rolling مناسب است؛ تغییر پرریسک با telemetry خوب از canary سود می‌برد؛ سامانه‌ای با نیاز rollback فوری و ظرفیت کافی blue-green را ترجیح می‌دهد. readiness، connection draining، ظرفیت surge و backward compatibility تعیین‌کننده‌اند.

## سنیور
راهبرد را با blast radius، RTO، هزینه، مدل داده و بلوغ مشاهده‌پذیری انتخاب کنید. deployment و release یک چیز نیستند: کد می‌تواند deploy شود ولی با feature flag هنوز release نشده باشد. سیاست سازمان باید threshold خودکار، approval برای ریسک بالا و evidence قابل audit تعریف کند. پاسخ خوب مصاحبه با محدودیت‌ها شروع می‌شود، نه نام یک ابزار.`,
        practicalMd: "برای سه سرویس بانک، وبلاگ و worker صف، راهبرد متفاوت پیشنهاد دهید و trade-off هر انتخاب را بنویسید.",
        exampleMd: `\`\`\`text
strategy = f(blast radius, RTO, data compatibility, capacity, observability)
\`\`\``,
        commands: ["git log --decorate -5"],
      },
      {
        slug: "gitops-interview",
        topicSlug: "deploy-strategies",
        titleFa: "GitOps، Desired State و Reconciliation",
        objectiveFa: "GitOps را فراتر از «استقرار با Git» و با کنترل drift، امنیت و بازیابی توضیح دهید.",
        theoryMd: `## مبتدی
در GitOps وضعیت مطلوب سیستم به‌صورت declarative در Git نگهداری می‌شود. یک controller دائماً وضعیت واقعی را با desired state مقایسه و اختلاف را reconcile می‌کند. تغییر معمولاً از pull request عبور می‌کند، بنابراین history و review داریم.

## کارورز
در مدل pull، agent داخل محیط تغییر را از مخزن می‌گیرد؛ CI لازم نیست credential پرقدرت کلاستر را داشته باشد. drift یا به وضعیت Git برگردانده می‌شود یا هشدار می‌دهد. rollback اغلب revert یک commit است، اما فقط وقتی artifact و تغییر داده هنوز سازگار باشند. secret خام نباید در Git قرار گیرد؛ از encryption یا reference به secret manager استفاده می‌شود.

## سنیور
Git منبع حقیقت desired state است، نه لزوماً حقیقت عملیات لحظه‌ای. controller compromise، دسترسی write به repo و dependency chart تهدیدهای جدی‌اند؛ امضا، policy، branch protection و تفکیک repoها دفاع می‌سازند. reconciliation باید idempotent و observable باشد. در disaster recovery، بازسازی از Git فقط بخشی از کار است؛ stateful data، کلید رمزنگاری و bootstrap identity باید جداگانه بازیابی شوند. GitOps موفق lead time را کم می‌کند بدون اینکه change failure rate را پنهان کند.`,
        practicalMd: "در پاسخ مصاحبه، جریان PR تا reconciliation، تشخیص drift، secret، rollback و disaster recovery را در یک معماری pull-based توضیح دهید.",
        exampleMd: `\`\`\`text
PR -> review/policy -> merge -> controller detects revision
-> apply desired state -> report health/drift
\`\`\``,
        commands: ["git revert --no-commit HEAD", "git status"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "ماتریس انتخاب راهبرد",
        topicSlug: "deploy-strategies",
        lessonSlug: "deployment-strategies",
        path: "/tmp/day19-strategies.txt",
        mustContain: "blast radius",
        instructionsMd: "سؤال مصاحبه: Recreate، rolling، blue-green و canary را چگونه بر اساس downtime، هزینه، دامنهٔ اثر و قابلیت بازگشت مقایسه می‌کنید؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "پاسخ مصاحبهٔ GitOps",
        topicSlug: "deploy-strategies",
        lessonSlug: "gitops-interview",
        path: "/tmp/day19-gitops.txt",
        mustContain: "reconciliation",
        instructionsMd: "توضیح دهید GitOps چگونه desired state را با وضعیت واقعی همگام می‌کند و در طراحی pull-based با drift، secret، rollback و بازیابی بحران چه می‌کنید. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Drift دستی در محیط Production",
      path: "/tmp/day19-scenario.txt",
      mustContain: "Git",
      incidentMd: "مهندس شیفت برای رفع فوری، replica را دستی تغییر داده و controller آن را برمی‌گرداند. روش امن incident، ثبت تغییر و بازگشت به منبع حقیقت را تحلیل کنید.",
      symptomsMd: "وضعیت واقعی چند دقیقه پس از تغییر دستی دوباره با manifest مخزن یکسان می‌شود.",
      rootCause: "GitOps reconciler correctly overwrites an out-of-band manual change absent from desired state.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ سنیور روز ۱۹",
      questions: [
        mc("مبتدی — کدام راهبرد معمولاً ساده‌ترین ولی همراه downtime است؟", ["Canary", "Recreate", "Blue-Green", "Rolling"], "Recreate", "نسخهٔ قدیم متوقف و سپس نسخهٔ جدید آغاز می‌شود.", "deploy-strategies"),
        tf("کارورز — در GitOps هر تغییر دستی production باید برای همیشه بر desired state غلبه کند.", false, "controller معمولاً drift را به وضعیت ثبت‌شده در Git برمی‌گرداند.", "deploy-strategies"),
        sa("کارورز — فرایند پیوستهٔ همسان کردن actual state با desired state چه نام دارد؟", "reconciliation", "controller با reconciliation اختلاف را تشخیص و اصلاح می‌کند.", "deploy-strategies"),
        sa("سنیور — چرا revert کردن commit همیشه rollback کامل عملیاتی نیست؟", "چون داده، migration، سرویس‌های خارجی یا artifact حذف‌شده ممکن است با وضعیت قبلی قابل بازگشت نباشند.", "Git desired state را برمی‌گرداند، اما stateful side effect به برنامهٔ بازیابی جدا نیاز دارد.", "deploy-strategies", 5),
      ],
    },
  },
];
