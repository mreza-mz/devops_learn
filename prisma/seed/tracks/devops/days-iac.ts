import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "./types";

export const iacDays: DaySeed[] = [
  {
    dayNumber: 27,
    phaseSlug: "iac",
    titleFa: "مبانی Terraform: از Provider تا Output",
    objectiveFa: "مدل اعلانی Terraform، نقش provider و resource، ورودی‌های امن و خروجی‌های قابل‌مصرف را از سطح مبتدی تا پرسش‌های مصاحبه یاد بگیرید.",
    topicSlugs: ["tf-providers", "tf-resources", "tf-variables", "tf-outputs"],
    lessons: [
      {
        slug: "terraform-provider-resource",
        topicSlug: "tf-providers",
        titleFa: "Provider و Resource؛ زبان زیرساخت اعلانی",
        objectiveFa: "بفهمید Terraform چگونه provider را نصب می‌کند، dependency graph می‌سازد و resource واقعی را به وضعیت مطلوب می‌رساند.",
        theoryMd: `## مبتدی
Terraform ابزار **Infrastructure as Code** اعلانی است: شما وضعیت مطلوب را در HCL می‌نویسید و Terraform اختلاف آن با دنیای واقعی را محاسبه می‌کند. بلوک \`terraform.required_providers\` منبع و بازهٔ نسخهٔ provider را مشخص می‌کند؛ بلوک \`provider\` تنظیم اتصال مانند region را می‌دهد. Provider مترجم بین Terraform و API سرویس مقصد است.

یک \`resource\` شیئی است که Terraform چرخهٔ عمرش را مدیریت می‌کند. آدرس \`aws_instance.web\` از نوع resource و نام محلی ساخته می‌شود. \`terraform init\` providerها را آماده می‌کند، \`terraform plan\` تغییر پیشنهادی را نشان می‌دهد و \`terraform apply\` آن را اجرا می‌کند.

## کارورز
نسخهٔ provider را محدود و فایل lock را در Git نگه دارید تا اجرای CI و لپ‌تاپ یکسان باشد. ارجاع یک resource به attribute دیگری، dependency ضمنی می‌سازد؛ \`depends_on\` فقط برای وابستگی پنهانی است. plan را پیش از apply بازبینی کنید: علامت‌های create، update و replace هزینه و downtime متفاوت دارند.

## زاویهٔ مصاحبهٔ سنیور
پرسش مهم این نیست که «چه فرمانی؟»، بلکه این است که چگونه blast radius را کم می‌کنید: pin کردن نسخه، plan در CI، تأیید تغییر حساس، credential کوتاه‌عمر و تقسیم state. Provider configuration نباید secret ثابت داخل کد داشته باشد. همچنین توضیح دهید Terraform API را orchestrate می‌کند و جای configuration management داخل سیستم‌عامل را کامل نمی‌گیرد.`,
        practicalMd: `یک پیکربندی کوچک با provider محلی یا cloud فرضی بنویسید. ترتیب امن را توضیح دهید: \`fmt\`، \`validate\`، \`plan\` و سپس apply بازبینی‌شده. در plan مشخص کنید کدام resource ساخته یا جایگزین می‌شود.`,
        exampleMd: `\`\`\`hcl
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}
provider "aws" { region = "eu-west-1" }
resource "aws_s3_bucket" "artifacts" {
  bucket = "team-artifacts-example"
}
\`\`\``,
        commands: ["terraform init", "terraform fmt -check", "terraform validate", "terraform plan"],
      },
      {
        slug: "terraform-input-output",
        topicSlug: "tf-variables",
        titleFa: "Variable و Output؛ قرارداد ماژول",
        objectiveFa: "ورودی type-safe، validation، مقدار حساس و output مناسب برای اتصال اجزای زیرساخت را طراحی کنید.",
        theoryMd: `## مبتدی
\`variable\` ورودی پیکربندی است و باعث می‌شود region، اندازه و نام محیط را hard-code نکنید. برای هر متغیر \`type\`، توضیح و در صورت منطقی بودن \`default\` تعیین کنید. مقدار می‌تواند از \`terraform.tfvars\`، گزینهٔ \`-var\` یا متغیر محیطی \`TF_VAR_name\` بیاید.

\`output\` بخشی از نتیجه را پس از apply نمایش می‌دهد؛ مثلاً endpoint یا شناسهٔ شبکه. خروجی، API عمومی یک root module یا child module است.

## کارورز
برای ورودی‌های مهم validation بگذارید و از objectهای ساخت‌یافته به‌جای چند متغیر مبهم استفاده کنید. \`sensitive = true\` فقط نمایش معمول را پنهان می‌کند؛ secret همچنان ممکن است داخل state باشد، پس backend و دسترسی state باید امن باشند. فایل‌های \`.tfvars\` حاوی راز را commit نکنید.

## زاویهٔ مصاحبهٔ سنیور
یک ماژول خوب contract کوچک و پایدار دارد: ورودی‌ها کم، typed و مستند؛ outputها فقط چیزهایی که مصرف‌کننده نیاز دارد. افشای کل resource به‌عنوان output coupling ایجاد می‌کند. در مصاحبه فرق «پنهان شدن در CLI» و «رمزنگاری/حفاظت واقعی secret» را صریح بیان کنید.`,
        practicalMd: `برای محیط \`staging\` یک variable رشته‌ای با validation و یک output برای نام bucket تعریف کنید. سپس توضیح دهید مقدار sensitive در state چه خطری دارد و چه کسی باید به backend دسترسی داشته باشد.`,
        exampleMd: `\`\`\`hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production"
  }
}
output "bucket_name" {
  value = aws_s3_bucket.artifacts.id
}
\`\`\``,
        commands: ["terraform validate", "terraform plan -var='environment=staging'", "terraform output"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "تحلیل چرخهٔ Provider و Resource",
        topicSlug: "tf-resources",
        lessonSlug: "terraform-provider-resource",
        path: "/tmp/day27-provider.txt",
        mustContain: "plan",
        instructionsMd: "سؤال مصاحبه: provider چه نقشی در Terraform دارد، بازبینی تغییر پیشنهادی چگونه ریسک apply را کم می‌کند و dependency ضمنی میان resourceها چگونه شکل می‌گیرد؟ پاسخ را در آزمایشگاه ثبت کنید.",
      }),
      noteExercise({
        titleFa: "طراحی قرارداد ورودی و خروجی",
        topicSlug: "tf-outputs",
        lessonSlug: "terraform-input-output",
        path: "/tmp/day27-contract.txt",
        mustContain: "sensitive",
        instructionsMd: "هدف این است که قرارداد ورودی و خروجی یک ماژول شبکه را طراحی کنید و توضیح دهید چرا پنهان کردن نمایش یک مقدار حساس، به‌تنهایی از دادهٔ state محافظت نمی‌کند. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Provider بدون کنترل نسخه در CI",
      path: "/tmp/day27-scenario.txt",
      mustContain: "lock",
      incidentMd: "plan در لپ‌تاپ بدون تغییر است اما CI پس از دانلود نسخهٔ جدید provider چند resource را replace نشان می‌دهد. تیم نزدیک است plan را بدون بررسی apply کند.",
      symptomsMd: "نسخهٔ provider بین محیط‌ها متفاوت است و plan شامل replacement غیرمنتظره است.",
      rootCause: "Provider version constraint مبهم است و فایل dependency lock در مخزن نگهداری نشده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۲۷",
      questions: [
        mc("مبتدی — وظیفهٔ اصلی provider چیست؟", ["ترجمهٔ عملیات Terraform به API مقصد", "ذخیرهٔ رمزها در Git", "جایگزینی state", "ساخت داشبورد"], "ترجمهٔ عملیات Terraform به API مقصد", "Provider پیاده‌سازی تعامل با API سرویس را فراهم می‌کند.", "tf-providers"),
        tf("کارورز — ارجاع attribute یک resource به resource دیگر dependency ضمنی می‌سازد.", true, "Terraform از referenceها dependency graph می‌سازد.", "tf-resources"),
        sa("کارورز — فرمان مشاهدهٔ تغییرات پیش از اجرا چیست؟", "terraform plan", "plan اختلاف configuration، state و زیرساخت را محاسبه می‌کند.", "tf-resources"),
        tf("سنیور — sensitive=true تضمین می‌کند secret در state ذخیره نشود.", false, "این گزینه عمدتاً نمایش را پنهان می‌کند؛ حفاظت backend همچنان ضروری است.", "tf-variables"),
      ],
    },
  },
  {
    dayNumber: 28,
    phaseSlug: "iac",
    titleFa: "State، Backend، Module و Workspace",
    objectiveFa: "state را به‌عنوان دارایی حساس مدیریت کنید، backend راه دور و locking را بشناسید و مرز درست module و workspace را در معماری تیمی انتخاب کنید.",
    topicSlugs: ["tf-state", "tf-remote-state", "tf-modules", "tf-workspaces", "tf-lifecycle"],
    lessons: [
      {
        slug: "terraform-state-backend",
        topicSlug: "tf-state",
        titleFa: "State و Remote Backend؛ حافظهٔ Terraform",
        objectiveFa: "نقش state، locking، رمزنگاری و recovery را بفهمید و از ویرایش دستی state دوری کنید.",
        theoryMd: `## مبتدی
Terraform در state نگاشت آدرس منطقی resource به شناسهٔ واقعی را نگه می‌دارد. بدون این نگاشت نمی‌داند کدام شیء را update یا delete کند. state cache ساده نیست؛ دادهٔ عملیاتی و گاهی secret دارد.

## کارورز
در کار تیمی state محلی باعث overwrite و drift می‌شود. remote backend یک نسخهٔ مشترک، دسترسی کنترل‌شده، رمزنگاری و ترجیحاً locking می‌دهد. هم‌زمانی دو apply بدون lock می‌تواند state را خراب کند. backup و versioning backend بخشی از disaster recovery است. \`terraform state\` و \`import\` ابزارهای جراحی‌اند و باید با backup و peer review استفاده شوند.

## زاویهٔ مصاحبهٔ سنیور
مرز state همان مرز blast radius و ownership است. یک state عظیم برای کل سازمان کند و پرریسک است؛ stateهای بسیار ریز نیز dependency و عملیات را پیچیده می‌کنند. state را بر اساس lifecycle، تیم مالک و نرخ تغییر تقسیم کنید. خروجی remote state اتصال ایجاد می‌کند اما coupling دارد؛ API، registry یا data source گاهی مرز بهتری است.`,
        practicalMd: `برای یک تیم سه‌نفره policy دسترسی backend، locking، versioning و روش بازیابی بنویسید. توضیح دهید هنگام failed apply ابتدا چه شواهدی جمع می‌کنید و چرا فایل state را مستقیم ادیت نمی‌کنید.`,
        exampleMd: `\`\`\`hcl
terraform {
  backend "s3" {
    bucket  = "company-tf-state"
    key     = "network/prod.tfstate"
    region  = "eu-west-1"
    encrypt = true
  }
}
\`\`\``,
        commands: ["terraform state list", "terraform state show 'aws_vpc.main'", "terraform plan -refresh-only"],
      },
      {
        slug: "terraform-modules-workspaces",
        topicSlug: "tf-modules",
        titleFa: "Module، Workspace و Lifecycle",
        objectiveFa: "کد قابل‌استفادهٔ مجدد بسازید، محدودیت workspace را تشخیص دهید و lifecycle را فقط برای نیاز روشن به‌کار ببرید.",
        theoryMd: `## مبتدی
هر پوشهٔ Terraform یک root module است؛ بلوک \`module\` یک child module را فراخوانی می‌کند. module تکرار را کم و استاندارد سازمانی ایجاد می‌کند. source و version ماژول خارجی باید مشخص و قابل‌بازتولید باشد.

Workspace چند state برای یک configuration نگه می‌دارد. برای محیط‌های کوتاه‌عمر مشابه مفید است، اما جداسازی امنیتی کامل نیست: code، backend credentials و pipeline اغلب مشترک‌اند. production و development با حساب، policy و lifecycle متفاوت معمولاً root configuration و state جدا می‌خواهند.

## کارورز
\`lifecycle.create_before_destroy\` downtime replacement را کم می‌کند ولی ممکن است به ظرفیت یا نام یکتا نیاز داشته باشد. \`prevent_destroy\` حفاظ کمکی است، نه جای policy و backup. \`ignore_changes\` اگر بی‌رویه باشد drift واقعی را پنهان می‌کند.

## زاویهٔ مصاحبهٔ سنیور
از ماژول «همه‌کاره» با ده‌ها flag پرهیز کنید. نسخه‌گذاری semantic، changelog، تست plan و migration guide برای مصرف‌کنندگان لازم است. در پاسخ مصاحبه بگویید workspace ابزار namespace برای state است، نه مرز امنیتی و نه راه‌حل خودکار promotion بین محیط‌ها.`,
        practicalMd: `یک ماژول سرویس با ورودی image و replicas و خروجی endpoint طراحی کنید. سپس تصمیم بگیرید dev و prod workspace باشند یا root جدا؛ تصمیم را با blast radius و سطح دسترسی توجیه کنید.`,
        exampleMd: `\`\`\`hcl
module "service" {
  source   = "./modules/service"
  image    = var.image
  replicas = 3
}
resource "aws_instance" "node" {
  lifecycle { create_before_destroy = true }
}
\`\`\``,
        commands: ["terraform workspace list", "terraform workspace select staging", "terraform plan"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طرح Remote State امن",
        topicSlug: "tf-remote-state",
        lessonSlug: "terraform-state-backend",
        path: "/tmp/day28-state.txt",
        mustContain: "locking",
        instructionsMd: "هدف این است که برای state تیمی یک backend امن و بازیابی‌پذیر طراحی کنید و توضیح دهید اجرای هم‌زمان چند writer چه خطری دارد. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "مرزبندی Module و Workspace",
        topicSlug: "tf-workspaces",
        lessonSlug: "terraform-modules-workspaces",
        path: "/tmp/day28-workspace.txt",
        mustContain: "blast radius",
        instructionsMd: "سؤال مصاحبه: برای dev و production چه زمانی workspace و چه زمانی root و state جدا انتخاب می‌کنید؟ اثر قرارداد module و مرز state بر دامنهٔ تغییر را توضیح دهید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "دو Apply هم‌زمان و State ناسازگار",
      path: "/tmp/day28-scenario.txt",
      mustContain: "lock",
      incidentMd: "دو pipeline روی یک state بدون هماهنگی apply شده‌اند. یکی موفق گزارش شده اما resourceهای واقعی با خروجی state سازگار نیستند.",
      symptomsMd: "plan بعدی تغییرات غیرمنتظره دارد و چند شناسه در state با cloud هم‌خوان نیست.",
      rootCause: "Backend فاقد locking مؤثر بوده و دو writer هم‌زمان state را تغییر داده‌اند.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۲۸",
      questions: [
        mc("مبتدی — state چه نگاشتی را نگه می‌دارد؟", ["resource منطقی به شیء واقعی", "کاربر به رمز", "داشبورد به alert", "لاگ به trace"], "resource منطقی به شیء واقعی", "Terraform با این نگاشت چرخهٔ عمر resource را دنبال می‌کند.", "tf-state"),
        tf("کارورز — remote backend دارای locking ریسک apply هم‌زمان را کاهش می‌دهد.", true, "Lock مانع writerهای هم‌زمان روی state مشترک می‌شود.", "tf-remote-state"),
        mc("سنیور — workspace به‌تنهایی چه چیزی نیست؟", ["namespace برای state", "مرز امنیتی کامل", "دارای state جدا", "قابل انتخاب با CLI"], "مرز امنیتی کامل", "credential و pipeline می‌توانند مشترک بمانند؛ جداسازی قوی‌تر لازم است.", "tf-workspaces"),
        tf("سنیور — ignore_changes بی‌رویه می‌تواند drift را پنهان کند.", true, "نادیده گرفتن attributeها visibility تغییرات واقعی را کم می‌کند.", "tf-lifecycle"),
      ],
    },
  },
  {
    dayNumber: 29,
    phaseSlug: "iac",
    titleFa: "Ansible: از Inventory تا Role",
    objectiveFa: "میزبان‌ها را گروه‌بندی کنید، playbook قابل‌خواندن بنویسید و با handler، variable، template و role اتوماسیون نگهداشت‌پذیر بسازید.",
    topicSlugs: ["ansible-inventory", "ansible-playbooks", "ansible-tasks", "ansible-handlers", "ansible-vars", "ansible-templates", "ansible-roles"],
    lessons: [
      {
        slug: "ansible-inventory-playbook",
        topicSlug: "ansible-inventory",
        titleFa: "Inventory، Playbook و Task",
        objectiveFa: "مدل agentless انسیبل، گروه‌های inventory، play و taskهای مبتنی بر module را درست به هم وصل کنید.",
        theoryMd: `## مبتدی
Ansible معمولاً agentless است و از SSH به managed node وصل می‌شود. Inventory میزبان‌ها و گروه‌ها را تعریف می‌کند. Playbook فایل YAML است؛ هر play گروه میزبان، privilege و فهرست taskها را تعیین می‌کند. هر task بهتر است یک module مانند \`package\`، \`service\` یا \`copy\` را فراخوانی کند.

## کارورز
پیش از اجرا \`ansible-inventory --graph\` و \`ansible all -m ping\` را بررسی کنید. از module به‌جای \`shell\` خام استفاده کنید چون module وضعیت فعلی را می‌فهمد و changed دقیق‌تری می‌دهد. \`--check --diff\` پیش‌نمایش مفید است، هرچند همهٔ moduleها check mode کامل ندارند. نام task باید نیت را بگوید، نه صرفاً فرمان را.

## زاویهٔ مصاحبهٔ سنیور
Inventory فقط فهرست IP نیست؛ مرز rollout است. گروه‌بندی بر اساس نقش و محیط، serial deployment و limit کردن اجرا blast radius را کم می‌کند. dynamic inventory برای cloud مناسب‌تر از فایل دستی است. دربارهٔ SSH host key، become با کمترین دسترسی و secretهای Vault نیز صحبت کنید.`,
        practicalMd: `یک inventory با گروه‌های web و db و playbook نصب وب‌سرور طراحی کنید. فرمان‌های syntax-check، check mode و اجرای محدود به staging را بنویسید و نتیجهٔ changed را تفسیر کنید.`,
        exampleMd: `\`\`\`yaml
- name: Configure web nodes
  hosts: web
  become: true
  tasks:
    - name: Ensure nginx is installed
      ansible.builtin.package:
        name: nginx
        state: present
\`\`\``,
        commands: ["ansible-inventory --graph", "ansible all -m ping", "ansible-playbook site.yml --syntax-check", "ansible-playbook site.yml --check --diff"],
      },
      {
        slug: "ansible-reuse",
        topicSlug: "ansible-roles",
        titleFa: "Handler، Variable، Template و Role",
        objectiveFa: "تغییرات را شرطی notify کنید، precedence متغیرها را مدیریت کنید و ساختار reusable role بسازید.",
        theoryMd: `## مبتدی
Variable داده را از منطق جدا می‌کند. Template با Jinja2 فایل پیکربندی را از variableها می‌سازد. اگر template تغییر کرد، task با \`notify\` یک handler را خبر می‌کند؛ handler معمولاً فقط یک بار و در پایان play اجرا می‌شود. بنابراین سرویس بی‌دلیل restart نمی‌شود.

Role ساختار استانداردی برای \`tasks\`، \`handlers\`، \`templates\`، defaults و metadata است. role کمک می‌کند قابلیت‌هایی مثل nginx یا hardening مستقل تست و نسخه‌گذاری شوند.

## کارورز
precedence متغیرها را تصادفی نکنید: defaultهای role کم‌اولویت و قابل override هستند؛ variableهای محیط در group_vars قرار می‌گیرند؛ secretها باید رمزگذاری شوند. داخل template مقدار پیش‌فرض و validation معقول بگذارید. handler فقط وقتی task واقعاً changed باشد اجرا می‌شود.

## زاویهٔ مصاحبهٔ سنیور
Role خوب interface روشن، default امن، وابستگی کم و تست دارد. انباشت شرط‌ها برای چند سیستم‌عامل maintenance را سخت می‌کند. restart جمعی می‌تواند outage بسازد؛ با serial، health check و handler کنترل‌شده rollout کنید. extra-vars اولویت بالایی دارد و می‌تواند policy را دور بزند، پس در pipeline کنترل شود.`,
        practicalMd: `یک role برای nginx طراحی کنید که port را از defaults بگیرد، template بسازد و فقط در صورت تغییر config handler reload را notify کند. محل secret و متغیر محیطی را جدا مشخص کنید.`,
        exampleMd: `\`\`\`yaml
- name: Render nginx config
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    mode: "0644"
  notify: Reload nginx

handlers:
  - name: Reload nginx
    ansible.builtin.service:
      name: nginx
      state: reloaded
\`\`\``,
        commands: ["ansible-playbook site.yml --list-tasks", "ansible-playbook site.yml --check --diff", "ansible-playbook site.yml --limit web"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی Inventory و Play",
        topicSlug: "ansible-playbooks",
        lessonSlug: "ansible-inventory-playbook",
        path: "/tmp/day29-playbook.txt",
        mustContain: "check",
        instructionsMd: "هدف این است که یک inventory گروه‌بندی‌شده و playbook کوتاه طراحی کنید و توضیح دهید چگونه پیش از اجرا صحت آن را می‌سنجید و دامنهٔ rollout را محدود می‌کنید. پاسخ را در آزمایشگاه ثبت کنید.",
      }),
      noteExercise({
        titleFa: "قرارداد Role و Handler",
        topicSlug: "ansible-handlers",
        lessonSlug: "ansible-reuse",
        path: "/tmp/day29-role.txt",
        mustContain: "notify",
        instructionsMd: "سؤال مصاحبه: یک role نگهداشت‌پذیر چه ساختاری دارد و رابطهٔ تغییر واقعی، notify و handler چگونه از restart غیرضروری جلوگیری می‌کند؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Restart هم‌زمان همهٔ وب‌سرورها",
      path: "/tmp/day29-scenario.txt",
      mustContain: "serial",
      incidentMd: "playbook پس از render کردن config روی همهٔ web nodeها، حتی بدون تغییر، nginx را هم‌زمان restart کرده و سرویس قطع شده است.",
      symptomsMd: "تمام nodeها در یک بازه unavailable شده‌اند و recap تعداد changed غیرمنتظره نشان می‌دهد.",
      rootCause: "Restart به‌صورت task دائمی و rollout بدون serial/handler نوشته شده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۲۹",
      questions: [
        mc("مبتدی — inventory چه چیزی را تعریف می‌کند؟", ["میزبان‌ها و گروه‌ها", "فقط template", "فقط secret", "state Terraform"], "میزبان‌ها و گروه‌ها", "Inventory مقصدهای اجرای play را سازمان می‌دهد.", "ansible-inventory"),
        tf("کارورز — استفاده از module معمولاً از shell خام idempotentتر و قابل‌مشاهده‌تر است.", true, "Module وضعیت مطلوب و changed را بهتر مدل می‌کند.", "ansible-tasks"),
        sa("کارورز — گزینهٔ پیش‌نمایش playbook بدون اعمال معمولاً چیست؟", "--check", "Check mode تغییر احتمالی را شبیه‌سازی می‌کند، هرچند پشتیبانی moduleها متفاوت است.", "ansible-playbooks"),
        tf("سنیور — handler باید در هر اجرای play بدون توجه به changed اجرا شود.", false, "Handler با notify ناشی از تغییر واقعی اجرا می‌شود.", "ansible-handlers"),
      ],
    },
  },
  {
    dayNumber: 30,
    phaseSlug: "iac",
    titleFa: "Idempotency و انتخاب Terraform یا Ansible",
    objectiveFa: "اجرای تکرارشوندهٔ امن را تحلیل کنید و در مصاحبهٔ سنیور مرز provisioning، configuration management و ترکیب دو ابزار را با استدلال توضیح دهید.",
    topicSlugs: ["idempotency", "tf-modules", "ansible-roles"],
    lessons: [
      {
        slug: "iac-idempotency",
        topicSlug: "idempotency",
        titleFa: "Idempotency؛ اجرای دوباره بدون تغییر بی‌دلیل",
        objectiveFa: "معنای همگرایی به وضعیت مطلوب را بفهمید و منابع رایج non-idempotent بودن را پیدا کنید.",
        theoryMd: `## مبتدی
Idempotency یعنی اجرای دوباره با همان ورودی، پس از رسیدن به وضعیت مطلوب، اثر جانبی تازه‌ای نسازد. در Terraform plan دوم ideally باید \`No changes\` باشد؛ در Ansible recap دوم باید changed غیرمنتظره نداشته باشد.

## کارورز
فرمان‌هایی مانند \`echo ... >> file\`، ساخت timestamp، restart دائمی و script بدون guard معمولاً non-idempotent هستند. به‌جای آن‌ها از resource/moduleهای declarative، \`lineinfile\`، handler و شرط‌های دقیق استفاده کنید. در Terraform provider رفتار desired state را پیاده می‌کند؛ داده‌های ناپایدار و نام‌های تصادفی می‌توانند perpetual diff بسازند.

## زاویهٔ مصاحبهٔ سنیور
Idempotent بودن مساوی بی‌خطر بودن نیست: حذف اعلانی resource هنوز تکرارشونده اما مخرب است. convergence، drift detection، transaction نبودن apply و failure میانی را توضیح دهید. تست خوب شامل اجرای دوم، plan خالی، check mode و assertion روی سرویس است.`,
        practicalMd: `سه نمونهٔ non-idempotent را به نسخهٔ همگرا تبدیل کنید. معیار پذیرش بنویسید: اجرای اول تغییر می‌دهد، اجرای دوم تغییر صفر دارد و سرویس health check را پاس می‌کند.`,
        exampleMd: `\`\`\`yaml
- name: Ensure application setting exists once
  ansible.builtin.lineinfile:
    path: /etc/app.conf
    regexp: '^MODE='
    line: MODE=production
  notify: Reload application
\`\`\``,
        commands: ["terraform plan -detailed-exitcode", "ansible-playbook site.yml --check --diff"],
      },
      {
        slug: "terraform-vs-ansible",
        topicSlug: "tf-modules",
        titleFa: "Terraform یا Ansible؟ پاسخ معماری، نه تعصب ابزار",
        objectiveFa: "provisioning زیرساخت را از پیکربندی میزبان جدا کنید و قرارداد handoff بین module و role را بسازید.",
        theoryMd: `## مبتدی
Terraform معمولاً برای lifecycle زیرساخت و APIهای cloud قوی است: شبکه، VM، load balancer و managed service. Ansible برای پیکربندی سیستم‌عامل و نرم‌افزار روی میزبان‌ها مناسب است: package، file، service و rollout.

## کارورز
الگوی رایج: Terraform زیرساخت را می‌سازد و output یا dynamic inventory اطلاعات لازم را به Ansible می‌دهد؛ Ansible سرویس را configure می‌کند. مسئولیت یک resource را بین هر دو ابزار پخش نکنید، چون ownership مبهم و drift ایجاد می‌شود. برای image immutable ممکن است Packer و redeploy جای تغییر درجا را بگیرد.

## زاویهٔ مصاحبهٔ سنیور
پاسخ «همیشه هر دو» کافی نیست. معیارها را بگویید: نوع API، desired-state quality، lifecycle، سرعت تغییر، مهارت تیم، rollback، audit و blast radius. Terraform stateful و graph-based است؛ Ansible عمدتاً procedural با moduleهای idempotent و inventory محور است. قرارداد بین module و role باید versioned، کم‌coupling و بدون انتقال secret در خروجی plaintext باشد.`,
        practicalMd: `برای ساخت سه VM و نصب برنامه مرز مالکیت بنویسید: شبکه/VM/امنیت با کدام ابزار، package/config/service با کدام؛ handoff و rollback هر مرحله را نیز مشخص کنید.`,
        exampleMd: `\`\`\`text
Terraform module outputs: private_ip, host_group
        │
        └── dynamic inventory
              └── Ansible role: package, config, service, health check
\`\`\``,
        commands: ["terraform output -json", "ansible-inventory --graph", "ansible-playbook deploy.yml --limit canary"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "آزمون اجرای دوم",
        topicSlug: "idempotency",
        lessonSlug: "iac-idempotency",
        path: "/tmp/day30-idempotency.txt",
        mustContain: "اجرای دوم",
        instructionsMd: "توضیح دهید idempotency چیست، چه ضدالگوهایی آن را نقض می‌کنند و چگونه با یک طرح آزمون نشان می‌دهید تکرار اجرا تغییر غیرمنتظره نمی‌سازد. پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "پاسخ مصاحبهٔ Terraform در برابر Ansible",
        topicSlug: "ansible-roles",
        lessonSlug: "terraform-vs-ansible",
        path: "/tmp/day30-interview.txt",
        mustContain: "ownership",
        instructionsMd: "سؤال مصاحبه: بر چه اساسی Terraform، Ansible یا ترکیب آن‌ها را انتخاب می‌کنید و چگونه مرز مالکیت، handoff، drift، rollback و دامنهٔ اثر را مدیریت می‌کنید؟ پاسخ را در آزمایشگاه ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "اتوماسیون هر بار سرویس را تغییر می‌دهد",
      path: "/tmp/day30-scenario.txt",
      mustContain: "idempotent",
      incidentMd: "pipeline روزانه بدون تغییر ورودی، config را append می‌کند و همهٔ سرویس‌ها را restart می‌کند. هم‌زمان Terraform و Ansible هر دو یک security rule را مدیریت می‌کنند.",
      symptomsMd: "فایل config خطوط تکراری دارد، changed همیشگی است و rule بین دو مقدار نوسان می‌کند.",
      rootCause: "Taskها non-idempotent هستند و ownership یک resource بین دو ابزار تقسیم شده است.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۰",
      questions: [
        tf("مبتدی — اجرای دوم idempotent با ورودی یکسان نباید تغییر بی‌دلیل بسازد.", true, "پس از convergence، اجرای مجدد باید بدون اثر تازه باشد.", "idempotency"),
        mc("کارورز — کدام کار معمولاً non-idempotent است؟", ["append بدون guard در هر اجرا", "package state=present", "template ثابت", "resource مطلوب"], "append بدون guard در هر اجرا", "هر اجرا خط تازه می‌افزاید و نتیجه را تغییر می‌دهد.", "idempotency"),
        mc("سنیور — مرز رایج مسئولیت چیست؟", ["Terraform زیرساخت، Ansible پیکربندی میزبان", "هر دو مالک یک resource", "Ansible فقط state", "Terraform فقط shell"], "Terraform زیرساخت، Ansible پیکربندی میزبان", "این مرز ownership را روشن و drift متقابل را کمتر می‌کند.", "tf-modules"),
        tf("سنیور — idempotent بودن تضمین می‌کند عملیات مخرب نیست.", false, "حذف declarative می‌تواند idempotent ولی مخرب باشد؛ review و guardrail لازم است.", "idempotency"),
      ],
    },
  },
];
