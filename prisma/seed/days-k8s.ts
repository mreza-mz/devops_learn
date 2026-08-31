import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "./types";

export const k8sDays: DaySeed[] = [
  {
    dayNumber: 20,
    phaseSlug: "kubernetes",
    titleFa: "معماری Kubernetes و واحدهای پایه",
    objectiveFa: "مسیر درخواست در control plane و جایگاه cluster، node، pod و namespace را از پایه تا عملیات تولید توضیح دهید.",
    topicSlugs: ["k8s-architecture", "cluster", "node", "pod", "namespace"],
    lessons: [
      {
        slug: "control-plane",
        topicSlug: "k8s-architecture",
        titleFa: "Control Plane و حلقه‌های آشتی",
        objectiveFa: "نقش API Server، etcd، scheduler و controllerها را در معماری کلاستر تحلیل کنید.",
        theoryMd: `## مبتدی
Kubernetes سامانه‌ای برای نگهداری **وضعیت مطلوب** workloadهاست. \`kube-apiserver\` دروازهٔ تمام درخواست‌هاست، \`etcd\` وضعیت پایدار کلاستر را ذخیره می‌کند، scheduler برای Pod بدون Node میزبان انتخاب می‌کند و controllerها اختلاف وضعیت واقعی و مطلوب را کاهش می‌دهند.

## کارورز
\`kubectl\` مستقیماً کانتینر را اجرا نمی‌کند؛ درخواست declarative را به API می‌فرستد. admission پس از احراز هویت و مجوز می‌تواند درخواست را validate یا mutate کند. scheduler فقط binding می‌سازد؛ kubelet روی Node اجرای Pod را از container runtime می‌خواهد و وضعیت را گزارش می‌دهد.

## سنیور
معماری بر reconciliation و eventual consistency بنا شده است. HA control plane به چند API server و quorum سالم etcd نیاز دارد. پشتیبان‌گیری etcd بدون آزمون restore کافی نیست. در incident بین unavailable بودن API، تأخیر scheduler و خرابی workload تمایز بگذارید: Podهای موجود ممکن است هنگام قطع control plane همچنان سرویس بدهند، اما تغییر و self-healing جدید محدود می‌شود.`,
        practicalMd: "مسیر ایجاد Pod را از kubectl تا admission، ذخیره در etcd، scheduling و اجرای kubelet مرحله‌به‌مرحله بنویسید.",
        exampleMd: `\`\`\`bash
kubectl cluster-info
kubectl get --raw=/readyz
kubectl get events --sort-by=.metadata.creationTimestamp
\`\`\``,
        commands: ["kubectl cluster-info", "kubectl get nodes"],
      },
      {
        slug: "nodes-pods-namespaces",
        topicSlug: "pod",
        titleFa: "Cluster، Node، Pod و Namespace",
        objectiveFa: "مرزهای اجرا و سازمان‌دهی منابع را بدون اشتباه گرفتن namespace با امنیت کامل بشناسید.",
        theoryMd: `## مبتدی
Cluster مجموعهٔ control plane و Nodeهای worker است. Node ماشین اجرای workload و Pod کوچک‌ترین واحد زمان‌بندی Kubernetes است. کانتینرهای یک Pod شبکه و volume مشترک دارند و معمولاً یک چرخهٔ عمر را دنبال می‌کنند. Namespace منابع نام‌دار را گروه‌بندی می‌کند.

## کارورز
IP پاد موقتی است؛ با بازسازی Pod ممکن است تغییر کند. چند کانتینر را فقط وقتی در یک Pod بگذارید که coupling نزدیک، ارتباط localhost و lifecycle مشترک دارند. Namespace نام‌ها و quota را جدا می‌کند، اما به‌تنهایی مرز امنیت شبکه یا دسترسی نیست.

## سنیور
ظرفیت Node فقط CPU و RAM نیست؛ pod density، محدودیت IP، topology و failure domain مهم‌اند. taint و affinity محل اجرای workload را هدایت می‌کنند، اما طراحی ضعیف می‌تواند scheduler را بی‌گزینه کند. برای multi-tenancy باید namespace را با RBAC، quota، policy شبکه و policy admission ترکیب کرد.`,
        practicalMd: "منابع همهٔ namespaceها را مشاهده کنید و توضیح دهید چرا IP یا نام یک Pod نباید endpoint پایدار برنامه باشد.",
        exampleMd: `\`\`\`bash
kubectl get nodes -o wide
kubectl get pods -A -o wide
kubectl get namespaces
\`\`\``,
        commands: ["kubectl get nodes -o wide", "kubectl get pods -A"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "مسیر ایجاد Pod",
        topicSlug: "k8s-architecture",
        lessonSlug: "control-plane",
        path: "/tmp/day20-control-plane.txt",
        mustContain: "scheduler",
        instructionsMd: "مسیر درخواست ساخت Pod و نقش API Server، etcd، scheduler و kubelet را در `/tmp/day20-control-plane.txt` ثبت کنید.",
      }),
      noteExercise({
        titleFa: "مرز Pod و Namespace",
        topicSlug: "namespace",
        lessonSlug: "nodes-pods-namespaces",
        path: "/tmp/day20-resources.txt",
        mustContain: "namespace",
        instructionsMd: "تفاوت cluster، node، pod و namespace و محدودیت namespace به‌عنوان مرز امنیت را در `/tmp/day20-resources.txt` بنویسید.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Pod جدید Pending ولی سرویس‌های قدیمی سالم‌اند",
      path: "/tmp/day20-scenario.txt",
      mustContain: "scheduler",
      incidentMd: "API درخواست را پذیرفته اما Pod جدید Node ندارد. ترتیب بررسی events، scheduler، منابع و constraintها را بنویسید.",
      symptomsMd: "Podهای قبلی Running هستند؛ Pod جدید Pending و مقدار NODE خالی است.",
      rootCause: "Scheduler cannot find a node satisfying resource and placement constraints.",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۲۰",
      questions: [
        mc("مبتدی — وضعیت پایدار کلاستر در کدام مؤلفه ذخیره می‌شود؟", ["kubelet", "etcd", "scheduler", "Pod"], "etcd", "etcd پایگاه کلید-مقدار سازگار control plane است.", "k8s-architecture"),
        tf("کارورز — scheduler کانتینر را مستقیماً روی Node اجرا می‌کند.", false, "scheduler Node را انتخاب می‌کند؛ kubelet اجرای Pod را هماهنگ می‌کند.", "node"),
        sa("کارورز — کوچک‌ترین واحد زمان‌بندی Kubernetes چیست؟", "Pod", "scheduler یک Pod را به Node bind می‌کند، نه کانتینر منفرد را.", "pod"),
        sa("سنیور — چرا Namespace به‌تنهایی مرز کامل multi-tenancy نیست؟", "چون بدون RBAC، NetworkPolicy، quota و admission جداسازی دسترسی، شبکه و مصرف منابع را تضمین نمی‌کند.", "Namespace سازمان‌دهی و scope نام فراهم می‌کند، اما کنترل امنیتی جامع نیست.", "namespace", 5),
      ],
    },
  },
  {
    dayNumber: 21,
    phaseSlug: "kubernetes",
    titleFa: "Deployment، ReplicaSet و انتخاب‌گرها",
    objectiveFa: "چرخهٔ rollout و ارتباط label/selector را طوری مدیریت کنید که controllerها مالکیت مبهم یا downtime نسازند.",
    topicSlugs: ["deployment", "replicaset", "labels", "selectors"],
    lessons: [
      {
        slug: "deployment-rollout",
        topicSlug: "deployment",
        titleFa: "Deployment و ReplicaSet",
        objectiveFa: "زنجیرهٔ مالکیت Deployment تا Pod و رفتار rolling update را عیب‌یابی کنید.",
        theoryMd: `## مبتدی
Deployment وضعیت مطلوب برنامهٔ stateless را تعریف می‌کند و ReplicaSet تعداد Podهای مطابق را حفظ می‌کند. با تغییر template، Deployment یک ReplicaSet جدید می‌سازد و rollout را هدایت می‌کند. حذف دستی یک Pod درمان پایدار نیست؛ controller جای آن را می‌سازد.

## کارورز
\`maxSurge\` تعداد Pod اضافه هنگام rollout و \`maxUnavailable\` میزان کاهش موقت ظرفیت را کنترل می‌کند. readiness تعیین می‌کند Pod جدید چه زمانی قابل شمارش و دریافت ترافیک است. \`kubectl rollout status\` پیشرفت و \`rollout history\` revisionها را نشان می‌دهد.

## سنیور
rollout سالم به ظرفیت کلاستر، terminationGracePeriod، connection draining و سازگاری نسخه‌ها وابسته است. اگر quota اجازهٔ surge ندهد و maxUnavailable صفر باشد، rollout گیر می‌کند. rollback Deployment فقط template را برمی‌گرداند؛ side effect خارجی یا migration داده را برنمی‌گرداند. علت را از conditions، events و ReplicaSetها استخراج کنید.`,
        practicalMd: "یک rolling update با maxSurge=1 و maxUnavailable=0 را در حالت کمبود ظرفیت تحلیل کنید و مسیر رفع بدون downtime را بنویسید.",
        exampleMd: `\`\`\`bash
kubectl get deploy,rs,pods
kubectl rollout status deployment/api
kubectl rollout history deployment/api
\`\`\``,
        commands: ["kubectl get deployments", "kubectl get replicasets"],
      },
      {
        slug: "labels-selectors",
        topicSlug: "selectors",
        titleFa: "Label و Selector؛ قرارداد اتصال منابع",
        objectiveFa: "labelهای پایدار و selectorهای بدون هم‌پوشانی طراحی کنید.",
        theoryMd: `## مبتدی
Label جفت کلید-مقداری روی resource است؛ مثل \`app=api\` یا \`tier=backend\`. Selector منابع دارای label مشخص را انتخاب می‌کند. Deployment و ReplicaSet با selector می‌فهمند کدام Podها متعلق به آن‌ها هستند.

## کارورز
\`spec.selector\` Deployment باید با labelهای \`spec.template.metadata.labels\` منطبق باشد و پس از ساخت immutable است. label برای هویت و گروه‌بندی است؛ annotation برای metadata غیرانتخابی و بزرگ‌تر. selector بیش از حد عمومی ممکن است Pod ناخواسته را وارد مجموعه کند.

## سنیور
قرارداد label باید سازمانی و کم‌تغییر باشد: نام برنامه، component، instance و version. دو controller با selector هم‌پوشان می‌توانند بر سر مالکیت رقابت کنند. version label برای مشاهده و routing مفید است، اما selector مالکیت Deployment معمولاً نباید با هر release تغییر کند. قبل از تغییر label، اثر آن بر Service و policyها را بررسی کنید.`,
        practicalMd: "با `kubectl get pods -l app=api --show-labels` انتخاب را بررسی و تفاوت selector مالکیت و label نسخه را توضیح دهید.",
        exampleMd: `\`\`\`yaml
selector:
  matchLabels:
    app: api
template:
  metadata:
    labels:
      app: api
      version: v2
\`\`\``,
        commands: ["kubectl get pods --show-labels", "kubectl get pods -l app=api"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "تحلیل Rolling Update",
        topicSlug: "deployment",
        lessonSlug: "deployment-rollout",
        path: "/tmp/day21-rollout.txt",
        mustContain: "maxSurge",
        instructionsMd: "رابطهٔ Deployment، ReplicaSet، revision، maxSurge و maxUnavailable را در `/tmp/day21-rollout.txt` شرح دهید.",
      }),
      noteExercise({
        titleFa: "قرارداد Label",
        topicSlug: "labels",
        lessonSlug: "labels-selectors",
        path: "/tmp/day21-labels.txt",
        mustContain: "selector",
        instructionsMd: "یک قرارداد label و خطر selector عمومی یا هم‌پوشان را در `/tmp/day21-labels.txt` ثبت کنید.",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Rollout روی Replica جدید متوقف شده",
      path: "/tmp/day21-scenario.txt",
      mustContain: "ReplicaSet",
      incidentMd: "Deployment نسخهٔ جدید ساخته اما rollout کامل نمی‌شود. conditions، ReplicaSet جدید، readiness و ظرفیت surge را تحلیل کنید.",
      symptomsMd: "ReplicaSet قدیم هنوز replica دارد و Podهای جدید Ready نمی‌شوند.",
      rootCause: "New pods fail readiness, so Deployment cannot safely scale down the old ReplicaSet.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۲۱",
      questions: [
        mc("مبتدی — Deployment برای حفظ replicaهای Pod از چه منبعی استفاده می‌کند؟", ["Service", "ReplicaSet", "ConfigMap", "Node"], "ReplicaSet", "Deployment ReplicaSetها را برای revisionهای مختلف مدیریت می‌کند.", "replicaset"),
        tf("کارورز — selector یک Deployment می‌تواند بدون محدودیت بعد از ساخت تغییر کند.", false, "selector Deployment immutable است و باید با label template منطبق باشد.", "selectors"),
        sa("کارورز — فرمان متداول مشاهدهٔ پیشرفت rollout چیست؟", "kubectl rollout status deployment/<name>", "این فرمان تا موفقیت یا شکست rollout وضعیت را دنبال می‌کند.", "deployment"),
        sa("سنیور — چرا maxUnavailable=0 همراه با maxSurge=0 پیکربندی نامعتبر یا غیرقابل پیشرفت است؟", "چون نه اجازهٔ کم کردن Pod قدیمی وجود دارد و نه ساخت Pod اضافه، پس rollout راهی برای جایگزینی ندارد.", "حداقل یکی از surge یا unavailable باید امکان حرکت rollout را بدهد.", "deployment", 5),
      ],
    },
  },
  {
    dayNumber: 22,
    phaseSlug: "kubernetes",
    titleFa: "Service، Ingress و پیکربندی",
    objectiveFa: "کشف سرویس، ورودی HTTP و تزریق تنظیمات و راز را با مرزهای پایداری و امنیت درست پیاده کنید.",
    topicSlugs: ["service", "ingress", "configmap", "k8s-secret"],
    lessons: [
      {
        slug: "service-ingress",
        topicSlug: "service",
        titleFa: "Service و Ingress",
        objectiveFa: "مسیر ترافیک از DNS و Ingress تا endpointهای Pod را عیب‌یابی کنید.",
        theoryMd: `## مبتدی
Podها موقتی‌اند، پس Service یک نام DNS و virtual IP پایدار برای مجموعه‌ای از Podها فراهم می‌کند. selector Service باید label Podها را انتخاب کند. \`port\` پورتی است که Service عرضه می‌کند و \`targetPort\` پورت واقعی کانتینر است.

## کارورز
ClusterIP فقط داخل کلاستر، NodePort روی پورت Nodeها و LoadBalancer معمولاً از زیرساخت load balancer می‌گیرد. Ingress قواعد HTTP/HTTPS مبتنی بر host و path را تعریف می‌کند، اما بدون Ingress Controller صرفاً یک resource بی‌اثر است. TLS termination و rewrite باید صریح بررسی شوند.

## سنیور
عیب‌یابی را لایه‌ای انجام دهید: DNS، Service، EndpointSlice، readiness پاد، targetPort و سپس خود برنامه. اگر selector اشتباه باشد Service وجود دارد ولی endpoint ندارد. Ingress 503 اغلب از backend بدون endpoint یا protocol mismatch می‌آید. برای ترافیک شمال-جنوب و شرق-غرب، timeout، retry و حفظ source identity trade-off دارند.`,
        practicalMd: "مسیر یک درخواست `api.example.com/v1` را تا Pod رسم کنید و فرمان‌های بررسی Service، EndpointSlice و Ingress را بنویسید.",
        exampleMd: `\`\`\`bash
kubectl get svc,endpointslice
kubectl describe service api
kubectl describe ingress api
\`\`\``,
        commands: ["kubectl get services", "kubectl get endpointslices"],
      },
      {
        slug: "configuration-secrets",
        topicSlug: "configmap",
        titleFa: "ConfigMap و Secret",
        objectiveFa: "تنظیمات غیرمحرمانه و credential را با روش تزریق و rollout مناسب جدا کنید.",
        theoryMd: `## مبتدی
ConfigMap برای پیکربندی غیرمحرمانه و Secret برای دادهٔ حساس است. هر دو می‌توانند به شکل environment variable یا فایل volume وارد Pod شوند. مقدار Secret در manifest غالباً base64 است؛ base64 رمزنگاری نیست.

## کارورز
env از ConfigMap یا Secret در زمان ساخت process خوانده می‌شود و با تغییر resource خودکار عوض نمی‌شود؛ معمولاً rollout لازم است. volume ممکن است با تأخیر به‌روزرسانی شود، ولی برنامه باید reload را پشتیبانی کند. \`immutable: true\` از تغییر تصادفی جلوگیری می‌کند و نسخه‌گذاری نام config rollout قابل ردیابی می‌دهد.

## سنیور
Secret باید در etcd با encryption at rest، RBAC حداقلی و ترجیحاً secret manager خارجی محافظت شود. secret در env ممکن است در dump یا ابزارهای process دیده شود؛ فایل با permission مناسب گاهی بهتر است. rotation بدون هماهنگی consumer و producer می‌تواند outage بسازد. checksum annotation روی Pod template راه رایج trigger کردن rollout پس از تغییر config است.`,
        practicalMd: "برای تغییر database credential، روند dual credential، rollout مصرف‌کننده، revoke مقدار قدیمی و بررسی audit را طراحی کنید.",
        exampleMd: `\`\`\`bash
kubectl get configmap app-config -o yaml
kubectl describe secret db-credentials
\`\`\`
از چاپ مقدار decoded راز در ترمینال مشترک خودداری کنید.`,
        commands: ["kubectl get configmaps", "kubectl get secrets"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "عیب‌یابی مسیر Service",
        topicSlug: "service",
        lessonSlug: "service-ingress",
        path: "/tmp/day22-network.txt",
        mustContain: "EndpointSlice",
        instructionsMd: "مسیر DNS، Ingress، Service، EndpointSlice، readiness و targetPort را در `/tmp/day22-network.txt` بنویسید.",
      }),
      noteExercise({
        titleFa: "چرخهٔ عمر Secret",
        topicSlug: "k8s-secret",
        lessonSlug: "configuration-secrets",
        path: "/tmp/day22-config.txt",
        mustContain: "base64",
        instructionsMd: "در `/tmp/day22-config.txt` تفاوت ConfigMap و Secret، نادرستی تلقی base64 به‌عنوان encryption و روش rotation را شرح دهید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Ingress پاسخ 503 می‌دهد",
      path: "/tmp/day22-scenario.txt",
      mustContain: "endpoint",
      incidentMd: "Ingress موجود است اما backend پاسخ نمی‌دهد. بدون شروع از controller restart، Service و endpointها را بررسی کنید.",
      symptomsMd: "Ingress Controller خطای no active endpoint و Service فهرست endpoint خالی دارد.",
      rootCause: "Service selector does not match the application pod labels.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۲۲",
      questions: [
        mc("مبتدی — کدام resource یک endpoint پایدار برای Podهای موقت فراهم می‌کند؟", ["ConfigMap", "Service", "Secret", "Node"], "Service", "Service با selector و DNS پایدار به backendها متصل می‌شود.", "service"),
        tf("کارورز — ساختن Ingress بدون نصب Ingress Controller برای مسیریابی کافی است.", false, "resource باید توسط controller پیاده‌سازی و به data plane تبدیل شود.", "ingress"),
        sa("کارورز — برای دیدن backendهای انتخاب‌شدهٔ Service کدام resource را بررسی می‌کنید؟", "EndpointSlice", "EndpointSlice آدرس endpointهای آمادهٔ Service را نشان می‌دهد.", "service"),
        sa("سنیور — چرا base64 موجود در Secret کنترل محرمانگی محسوب نمی‌شود؟", "چون encoding برگشت‌پذیر است و هر دارندهٔ دسترسی می‌تواند مقدار را decode کند.", "محرمانگی به encryption at rest، RBAC، انتقال امن و مدیریت کلید وابسته است.", "k8s-secret", 5),
      ],
    },
  },
  {
    dayNumber: 23,
    phaseSlug: "kubernetes",
    titleFa: "Probe، منابع و HPA",
    objectiveFa: "سلامت، ظرفیت و مقیاس‌پذیری workload را بدون ساخت restart loop یا throttling پنهان تنظیم کنید.",
    topicSlugs: ["probes", "k8s-resources", "hpa"],
    lessons: [
      {
        slug: "health-probes",
        topicSlug: "probes",
        titleFa: "Readiness، Liveness و Startup Probe",
        objectiveFa: "هر probe را برای مسئلهٔ درست انتخاب و failure mode آن را تحلیل کنید.",
        theoryMd: `## مبتدی
readiness می‌گوید Pod آمادهٔ دریافت ترافیک است؛ شکست آن Pod را از endpointهای Service خارج می‌کند. liveness می‌گوید process گیر کرده و kubelet باید container را restart کند. startup به برنامهٔ کند فرصت آغاز می‌دهد و تا موفقیت آن، probeهای دیگر مداخله نمی‌کنند.

## کارورز
liveness نباید dependency خارجی مانند database را معیار قرار دهد؛ قطعی database می‌تواند همهٔ Podها را هم‌زمان restart و outage را بدتر کند. readiness می‌تواند وابستگی لازم برای پاسخ سالم را بسنجد. timeout، period و failureThreshold باید با رفتار واقعی برنامه هماهنگ باشند.

## سنیور
probe بخشی از feedback loop است و تنظیم تهاجمی می‌تواند positive feedback بسازد: بار بالا، timeout probe، restart، cold start و بار بیشتر. endpoint probe باید سبک و مستقل از مسیرهای گران باشد. startup probe برای JVM کند بهتر از initialDelay بسیار بزرگ است، چون پس از آماده شدن liveness سریع‌تر فعال می‌شود.`,
        practicalMd: "برای برنامه‌ای با startup دو دقیقه‌ای و dependency دیتابیس، سه probe را طراحی و علت هر dependency را توضیح دهید.",
        exampleMd: `\`\`\`yaml
startupProbe:
  httpGet: { path: /startup, port: 8080 }
  failureThreshold: 30
  periodSeconds: 5
readinessProbe:
  httpGet: { path: /ready, port: 8080 }
\`\`\``,
        commands: ["kubectl describe pod", "kubectl get events"],
      },
      {
        slug: "resources-autoscaling",
        topicSlug: "k8s-resources",
        titleFa: "Request، Limit و HPA",
        objectiveFa: "زمان‌بندی و autoscaling را بر مبنای request درست و متریک قابل اعتماد تنظیم کنید.",
        theoryMd: `## مبتدی
request مقدار منبعی است که scheduler برای جای‌گذاری Pod حساب می‌کند؛ limit سقف مصرف است. عبور حافظه از limit معمولاً OOMKill و عبور CPU از limit throttling ایجاد می‌کند. نبود request باعث می‌شود برنامه‌ریزی ظرفیت و HPA گمراه‌کننده شود.

## کارورز
HPA تعداد replica را بر اساس متریک‌هایی مانند CPU افزایش یا کاهش می‌دهد. CPU utilization معمولاً نسبت مصرف به **CPU request** است؛ request غیرواقعی نتیجهٔ scaling را منحرف می‌کند. HPA به metrics pipeline سالم، min/max منطقی و readiness نیاز دارد.

## سنیور
autoscaling درمان کمبود ظرفیت downstream نیست. افزایش replica در برابر database اشباع‌شده ممکن است فشار را بیشتر کند. stabilization window و scale policy از نوسان جلوگیری می‌کنند. درخواست‌ها را با مشاهدهٔ تاریخی و percentile تنظیم کنید، اما headroom و burst را حفظ کنید. هم‌زمانی HPA و تغییر request توسط ابزار دیگر می‌تواند حلقهٔ کنترل متعارض بسازد.`,
        practicalMd: "اثر نصف کردن CPU request بر HPA با target utilization ثابت را تحلیل و خطر scaling کاذب را توضیح دهید.",
        exampleMd: `\`\`\`bash
kubectl top pods
kubectl get hpa
kubectl describe hpa api
\`\`\``,
        commands: ["kubectl top pods", "kubectl get hpa"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی Probe ایمن",
        topicSlug: "probes",
        lessonSlug: "health-probes",
        path: "/tmp/day23-probes.txt",
        mustContain: "readiness",
        instructionsMd: "readiness، liveness و startup را برای API کند طراحی و خطر وابسته کردن liveness به دیتابیس را در `/tmp/day23-probes.txt` بنویسید.",
      }),
      noteExercise({
        titleFa: "تحلیل منابع و HPA",
        topicSlug: "hpa",
        lessonSlug: "resources-autoscaling",
        path: "/tmp/day23-hpa.txt",
        mustContain: "request",
        instructionsMd: "رابطهٔ CPU request، utilization، limit، throttling و رفتار HPA را در `/tmp/day23-hpa.txt` تحلیل کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "Restart Loop هنگام کندی Database",
      path: "/tmp/day23-scenario.txt",
      mustContain: "liveness",
      incidentMd: "با کند شدن database همهٔ replicaها restart می‌شوند. probeها و eventها را تحلیل و اصلاحی پیشنهاد کنید که ترافیک ناسالم را جدا کند ولی process سالم را نکشد.",
      symptomsMd: "Liveness timeout هم‌زمان در همهٔ Podها و افزایش restartCount دیده می‌شود.",
      rootCause: "Liveness probe incorrectly depends on a slow external database.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۲۳",
      questions: [
        mc("مبتدی — شکست کدام probe Pod را از endpointهای Service خارج می‌کند؟", ["liveness", "readiness", "startup همیشه", "هیچ‌کدام"], "readiness", "readiness ترافیک را کنترل می‌کند و لزوماً restart نمی‌سازد.", "probes"),
        tf("کارورز — عبور مصرف حافظه از limit معمولاً با CPU throttling پاسخ داده می‌شود.", false, "برای حافظه معمولاً OOMKill؛ throttling رفتار CPU limit است.", "k8s-resources"),
        sa("کارورز — HPA برای محاسبهٔ CPU utilization معمولاً مصرف را نسبت به چه مقداری می‌سنجد؟", "CPU request", "request نادرست درصد utilization و تصمیم scaling را منحرف می‌کند.", "hpa"),
        sa("سنیور — چرا liveness وابسته به database خطرناک است؟", "قطعی مشترک database باعث restart هم‌زمان Podهای سالم و تشدید outage از طریق cold start می‌شود.", "liveness باید سلامت داخلی process را بسنجد؛ readiness برای قطع ترافیک مناسب‌تر است.", "probes", 5),
      ],
    },
  },
  {
    dayNumber: 24,
    phaseSlug: "kubernetes",
    titleFa: "ذخیره‌سازی پایدار و StatefulSet",
    objectiveFa: "PV/PVC، StorageClass و هویت StatefulSet را با چرخهٔ داده و بازیابی واقعی طراحی کنید.",
    topicSlugs: ["pv", "pvc", "storage", "statefulset"],
    lessons: [
      {
        slug: "persistent-storage",
        topicSlug: "storage",
        titleFa: "PV، PVC و StorageClass",
        objectiveFa: "binding، provisioning و reclaim policy را بدون خطر حذف داده مدیریت کنید.",
        theoryMd: `## مبتدی
PV نمای یک منبع ذخیره‌سازی در کلاستر و PVC درخواست workload برای ظرفیت و access mode است. Pod معمولاً PVC را mount می‌کند، نه PV مشخص را. StorageClass نوع storage و provisioner را تعریف می‌کند و dynamic provisioning می‌تواند PV مناسب بسازد.

## کارورز
binding بر اساس ظرفیت، access mode، StorageClass و topology انجام می‌شود. \`ReadWriteOnce\` به معنی mount خواندن/نوشتن توسط یک Node است، نه الزاماً یک Pod. reclaim policy برابر Retain داده را پس از حذف claim نگه می‌دارد؛ Delete ممکن است volume زیرساخت را حذف کند.

## سنیور
storage topology باید با scheduling هماهنگ باشد؛ volume یک zone و Pod در zone دیگر Pending می‌ماند. \`WaitForFirstConsumer\` انتخاب volume را تا دانستن محل Pod عقب می‌اندازد. snapshot جای backup مستقل و آزموده‌شده را نمی‌گیرد. expansion، latency، IOPS، encryption و restore time بخشی از SLO داده‌اند.`,
        practicalMd: "یک PVC Pending را با بررسی StorageClass، access mode، provisioner، event و topology تحلیل کنید.",
        exampleMd: `\`\`\`bash
kubectl get pv,pvc
kubectl describe pvc data-db-0
kubectl get storageclass
\`\`\``,
        commands: ["kubectl get pv", "kubectl get pvc", "kubectl get storageclass"],
      },
      {
        slug: "stateful-workloads",
        topicSlug: "statefulset",
        titleFa: "StatefulSet و هویت پایدار",
        objectiveFa: "هویت شبکه و volume اختصاصی replicaهای stateful را در rollout و بازیابی حفظ کنید.",
        theoryMd: `## مبتدی
StatefulSet برای workloadهایی است که به هویت پایدار و storage اختصاصی نیاز دارند. Podها نام ترتیبی مثل \`db-0\` دارند و \`volumeClaimTemplates\` برای هر replica یک PVC جدا می‌سازد. Headless Service کشف DNS پایدار هر عضو را فراهم می‌کند.

## کارورز
ساخت و حذف معمولاً ترتیبی است. scale down به‌طور پیش‌فرض PVC را حذف نمی‌کند تا داده ناخواسته از بین نرود. StatefulSet خودِ replication دیتابیس یا backup را پیاده نمی‌کند؛ فقط primitiveهای orchestration می‌دهد.

## سنیور
برای quorum system، ترتیب rollout و disruption budget باید با پروتکل اجماع هماهنگ باشد. rolling update معیوب ممکن است نیازمند partition باشد تا ابتدا یک عضو canary شود. restore باید هویت عضو، metadata کلاستر و ترتیب bootstrap را رعایت کند. قبل از کاهش replica، از انتقال leadership و سلامت quorum مطمئن شوید.`,
        practicalMd: "برای دیتابیس سه‌عضوی، خطر حذف db-0، scale down و rollout هم‌زمان را تحلیل و ترتیب امن نگهداری را بنویسید.",
        exampleMd: `\`\`\`bash
kubectl get statefulset,pods,pvc
kubectl rollout status statefulset/db
\`\`\``,
        commands: ["kubectl get statefulsets", "kubectl get pvc"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "چرخهٔ PV و PVC",
        topicSlug: "pvc",
        lessonSlug: "persistent-storage",
        path: "/tmp/day24-storage.txt",
        mustContain: "reclaim",
        instructionsMd: "binding، StorageClass، access mode، topology و reclaim policy را در `/tmp/day24-storage.txt` توضیح دهید.",
      }),
      noteExercise({
        titleFa: "Runbook StatefulSet",
        topicSlug: "statefulset",
        lessonSlug: "stateful-workloads",
        path: "/tmp/day24-statefulset.txt",
        mustContain: "quorum",
        instructionsMd: "هویت ترتیبی، PVC اختصاصی، Headless Service، quorum و rollout امن را در `/tmp/day24-statefulset.txt` ثبت کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "PVC در حالت Pending",
      path: "/tmp/day24-scenario.txt",
      mustContain: "StorageClass",
      incidentMd: "Pod دیتابیس زمان‌بندی نمی‌شود و PVC آن Pending است. eventها، StorageClass، provisioner، access mode و topology را بررسی کنید.",
      symptomsMd: "پیام no persistent volumes available and no storage class is set دیده می‌شود.",
      rootCause: "PVC requests no valid StorageClass and no matching static PV exists.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ روز ۲۴",
      questions: [
        mc("مبتدی — workload معمولاً برای درخواست فضای پایدار کدام resource را reference می‌کند؟", ["PV مستقیم", "PVC", "Node", "ReplicaSet"], "PVC", "PVC درخواست مصرف‌کننده است و به PV مناسب bind می‌شود.", "pvc"),
        tf("کارورز — حذف StatefulSet همیشه PVCهای آن را نیز خودکار حذف می‌کند.", false, "حفظ PVC به جلوگیری از حذف تصادفی داده کمک می‌کند و policy باید صریح باشد.", "statefulset"),
        sa("کارورز — کدام تنظیم StorageClass می‌تواند binding را تا زمان انتخاب محل Pod عقب بیندازد؟", "WaitForFirstConsumer", "این mode topology volume را با scheduling مصرف‌کننده هماهنگ می‌کند.", "storage"),
        sa("سنیور — چرا snapshot به‌تنهایی استراتژی backup کامل نیست؟", "ممکن است در همان failure domain باشد، سازگاری برنامه‌ای نداشته باشد و restore آن آزموده نشده باشد.", "backup باید مستقل، دارای retention و با restore drill و هدف RPO/RTO اعتبارسنجی شود.", "pv", 5),
      ],
    },
  },
  {
    dayNumber: 25,
    phaseSlug: "kubernetes",
    titleFa: "RBAC و NetworkPolicy",
    objectiveFa: "دسترسی API و ارتباط شبکه را با least privilege، default deny و آزمون اثربخشی در سطح میانی تا سنیور کنترل کنید.",
    topicSlugs: ["rbac", "networkpolicy"],
    lessons: [
      {
        slug: "rbac-least-privilege",
        topicSlug: "rbac",
        titleFa: "RBAC و اصل کمترین دسترسی",
        objectiveFa: "Role، ClusterRole و Bindingها را با scope صحیح طراحی و ممیزی کنید.",
        theoryMd: `## مبتدی
RBAC پاسخ می‌دهد چه subjectی روی چه resource و با کدام verb مجاز است. Role در یک namespace و ClusterRole در سطح کلاستر یا به‌عنوان مجموعه permission قابل استفاده در namespace است. RoleBinding permission را در namespace و ClusterRoleBinding آن را cluster-wide اعطا می‌کند.

## کارورز
ServiceAccount هویت workload است. از wildcard در resource و verb پرهیز کنید و \`get/list/watch\` را با \`create/update/delete\` یکی ندانید. permission روی Secret بسیار حساس است؛ توانایی ساخت Pod نیز ممکن است به سرقت ServiceAccount قدرتمند منجر شود. \`kubectl auth can-i\` آزمون عملی authorization است.

## سنیور
RBAC فقط allow دارد و deny صریح ندارد؛ طراحی باید از نبود binding اضافی شروع شود. privilege escalation از امکان bind یا escalate کردن roleها، impersonate و مدیریت webhookها می‌آید. groupهای پیش‌فرض، tokenهای ServiceAccount و audit log را دوره‌ای بازبینی کنید. break-glass باید زمان‌دار، تأییدشده و قابل ممیزی باشد، نه یک kubeconfig ادمین دائمی.`,
        practicalMd: "برای اپی که فقط ConfigMap خودش را می‌خواند Role حداقلی طراحی و با `auth can-i --as` آزمون مثبت و منفی تعریف کنید.",
        exampleMd: `\`\`\`bash
kubectl auth can-i get configmaps --as=system:serviceaccount:team-a:api -n team-a
kubectl auth can-i get secrets --as=system:serviceaccount:team-a:api -n team-a
\`\`\``,
        commands: ["kubectl auth can-i --list", "kubectl get rolebindings -A"],
      },
      {
        slug: "network-policy",
        topicSlug: "networkpolicy",
        titleFa: "NetworkPolicy و Default Deny",
        objectiveFa: "ورودی و خروجی Podها را با شناخت محدودیت CNI و DNS محدود کنید.",
        theoryMd: `## مبتدی
NetworkPolicy مشخص می‌کند Podهای انتخاب‌شده چه ingress یا egress مجازی داشته باشند. بدون policy، مدل پیش‌فرض معمولاً allow است. یک policy خالی که همهٔ Podها را انتخاب کند می‌تواند default deny بسازد، به شرط پشتیبانی CNI.

## کارورز
policyها additive هستند؛ یک policy allow می‌تواند مسیر لازم را باز کند و ترتیب ruleها مانند firewall سنتی نیست. selector namespace و Pod را دقیق بنویسید. پس از default-deny egress باید DNS و مقصدهای لازم را مجاز کنید، وگرنه برنامه با خطای resolve از کار می‌افتد.

## سنیور
NetworkPolicy هویت لایهٔ ۳/۴ و IP را کنترل می‌کند، نه authorization کاربردی یا TLS. بعضی رفتارها مثل hostNetwork، Node traffic یا FQDN policy به CNI وابسته‌اند. policy را با تست اتصال از source واقعی و مشاهدهٔ flow log اعتبارسنجی کنید. هدف micro-segmentation کاهش حرکت جانبی است، اما policy بیش از حد پیچیده و بدون مالکیت به outage تبدیل می‌شود.`,
        practicalMd: "برای frontend که فقط به api و DNS نیاز دارد، default-deny ingress/egress و allowهای حداقلی را به‌صورت متنی طراحی کنید.",
        exampleMd: `\`\`\`bash
kubectl get networkpolicy -A
kubectl describe networkpolicy default-deny -n team-a
\`\`\``,
        commands: ["kubectl get networkpolicies -A"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "ممیزی RBAC",
        topicSlug: "rbac",
        lessonSlug: "rbac-least-privilege",
        path: "/tmp/day25-rbac.txt",
        mustContain: "least privilege",
        instructionsMd: "Role/ClusterRole، Bindingها، ServiceAccount، wildcard و آزمون auth can-i را با اصل least privilege در `/tmp/day25-rbac.txt` تحلیل کنید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "طراحی Default Deny",
        topicSlug: "networkpolicy",
        lessonSlug: "network-policy",
        path: "/tmp/day25-networkpolicy.txt",
        mustContain: "DNS",
        instructionsMd: "default deny و allowهای لازم برای DNS و API را در `/tmp/day25-networkpolicy.txt` بنویسید و وابستگی به CNI را ذکر کنید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "برنامه پس از Default Deny نام‌ها را resolve نمی‌کند",
      path: "/tmp/day25-scenario.txt",
      mustContain: "egress",
      incidentMd: "پس از فعال شدن policy سخت‌گیرانه، اتصال با IP ممکن ولی نام سرویس resolve نمی‌شود. مسیر DNS و egress را تحلیل کنید.",
      symptomsMd: "timeout روی DNS و نبود ترافیک UDP/TCP پورت 53 به resolver کلاستر.",
      rootCause: "Default-deny egress was applied without allowing DNS traffic.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ میانی-سنیور روز ۲۵",
      questions: [
        mc("مبتدی — کدام Binding دسترسی را در تمام کلاستر اعطا می‌کند؟", ["RoleBinding همیشه", "ClusterRoleBinding", "ConfigMap", "NetworkPolicy"], "ClusterRoleBinding", "ClusterRoleBinding subject را به ClusterRole در scope کلاستر متصل می‌کند.", "rbac"),
        tf("کارورز — NetworkPolicyها به ترتیب نوشته‌شدن evaluate و در اولین match متوقف می‌شوند.", false, "policyهای Kubernetes additive هستند و semantics آن‌ها ترتیب firewall rule سنتی نیست.", "networkpolicy"),
        sa("کارورز — فرمان بررسی اینکه یک هویت اجازهٔ یک عمل را دارد چیست؟", "kubectl auth can-i", "با --as و namespace می‌توان subject و scope موردنظر را آزمود.", "rbac"),
        sa("سنیور — چرا اجازهٔ create pod می‌تواند از نظر privilege escalation حساس باشد؟", "چون کاربر ممکن است Podی با ServiceAccount قدرتمند یا mountهای حساس بسازد و credential آن را مصرف کند.", "مجوزهای غیرمستقیم باید همراه admission policy و محدودیت ServiceAccount بررسی شوند.", "rbac", 5),
      ],
    },
  },
  {
    dayNumber: 26,
    phaseSlug: "kubernetes",
    titleFa: "Helm و عیب‌یابی سنیور Kubernetes",
    objectiveFa: "releaseهای Helm را قابل تکرار مدیریت و incidentهای Kubernetes را با شواهد لایه‌ای در سطح مصاحبهٔ سنیور حل کنید.",
    topicSlugs: ["helm", "k8s-troubleshooting"],
    lessons: [
      {
        slug: "helm-releases",
        topicSlug: "helm",
        titleFa: "Chart، Values و Release در Helm",
        objectiveFa: "render، upgrade و rollback را با کنترل drift و secret ایمن انجام دهید.",
        theoryMd: `## مبتدی
Helm مدیر بستهٔ Kubernetes است. Chart شامل templateها، \`Chart.yaml\` و values پیش‌فرض است. نصب chart با values مشخص یک **release** نسخه‌دار می‌سازد. \`helm template\` manifest رندرشده را بدون اعمال در کلاستر نشان می‌دهد.

## کارورز
ترتیب merge شدن values و نوع داده‌ها مهم است؛ یک string به‌جای boolean می‌تواند template متفاوت بسازد. پیش از upgrade از \`helm lint\`، template، diff و dry-run استفاده کنید. \`--atomic\` در شکست upgrade تلاش می‌کند release را rollback کند، اما side effect hook یا migration خارجی لزوماً برنمی‌گردد.

## سنیور
chart dependency را نسخه‌دار و provenance آن را verify کنید. values محرمانه را خام در Git یا command history نگذارید. rollback Helm revision قبلی manifest را اعمال می‌کند، نه اینکه داده و CRD را به‌طور جادویی بازگرداند. ownership resource، hook idempotency و تفاوت live state با rendered state از پرسش‌های مهم مصاحبه‌اند. CRD lifecycle را جدا و محافظه‌کارانه مدیریت کنید.`,
        practicalMd: "یک release را با lint، template، policy check، upgrade atomic، verification و rollback plan طراحی کنید.",
        exampleMd: `\`\`\`bash
helm lint ./chart
helm template api ./chart -f values-prod.yaml
helm upgrade --install api ./chart -f values-prod.yaml --atomic --wait
\`\`\``,
        commands: ["helm list -A", "helm history api"],
      },
      {
        slug: "senior-troubleshooting",
        topicSlug: "k8s-troubleshooting",
        titleFa: "روش لایه‌ای عیب‌یابی Kubernetes",
        objectiveFa: "از symptom تا root cause با events، status، log و تغییرات اخیر حرکت کنید.",
        theoryMd: `## مبتدی
از وضعیت شروع کنید: \`kubectl get pods\`، سپس \`describe\` برای condition و event، و \`logs\` برای خروجی برنامه. \`CrashLoopBackOff\` علت نیست؛ علامت restartهای متوالی است. برای نمونهٔ قبلی کانتینر از \`kubectl logs --previous\` استفاده کنید.

## کارورز
Pending را با scheduler event و request/taint/PVC بررسی کنید؛ ImagePullBackOff را با نام image، registry و credential؛ 503 را از Ingress به Service، EndpointSlice، readiness و Pod دنبال کنید. همیشه namespace، context و زمان تغییر اخیر را تأیید کنید. eventها retention محدود دارند، پس evidence را زود جمع کنید.

## سنیور
incident را با blast radius و timeline آغاز کنید: آیا یک Pod، یک Node، یک zone یا کل control plane درگیر است؟ تغییرات را freeze، فرضیه‌ها را رتبه‌بندی و هر اقدام را با انتظار قابل ابطال اجرا کنید. restart می‌تواند evidence را پاک کند. برای Node فشار، conditionها، eviction و daemonها را ببینید؛ برای latency مسیر شبکه، DNS، throttling و dependency را همبسته کنید. پاسخ سنیور شامل mitigation کم‌ریسک، RCA و کنترل پیشگیرانه است.`,
        practicalMd: "برای CrashLoopBackOff، Pending و 503 سه درخت تصمیم کوتاه بنویسید و در هر مرحله فرمان، انتظار و شاخهٔ بعد را مشخص کنید.",
        exampleMd: `\`\`\`bash
kubectl get pods -A -o wide
kubectl describe pod api-xxx
kubectl logs api-xxx --previous
kubectl get events --sort-by=.metadata.creationTimestamp
\`\`\``,
        commands: ["kubectl get pods -A", "kubectl get events --sort-by=.metadata.creationTimestamp"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "Runbook انتشار Helm",
        topicSlug: "helm",
        lessonSlug: "helm-releases",
        path: "/tmp/day26-helm.txt",
        mustContain: "atomic",
        instructionsMd: "مراحل lint، render، policy، upgrade با atomic، verify و محدودیت rollback را در `/tmp/day26-helm.txt` بنویسید.",
        difficulty: "hard",
      }),
      noteExercise({
        titleFa: "درخت تصمیم Incident",
        topicSlug: "k8s-troubleshooting",
        lessonSlug: "senior-troubleshooting",
        path: "/tmp/day26-troubleshooting.txt",
        mustContain: "events",
        instructionsMd: "برای Pending، CrashLoopBackOff و 503 در `/tmp/day26-troubleshooting.txt` درخت تصمیم مبتنی بر events، describe، logs و endpoint بنویسید.",
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "پس از Helm Upgrade سرویس 503 می‌دهد",
      path: "/tmp/day26-scenario.txt",
      mustContain: "rollback",
      incidentMd: "upgrade موفق گزارش شده، اما ترافیک 503 است. revision، manifest، readiness، Service endpoint و تغییر values را بررسی و معیار rollback را تعیین کنید.",
      symptomsMd: "release deployed است ولی Podهای جدید Ready نیستند و EndpointSlice backend آماده ندارد.",
      rootCause: "A values type error rendered the readiness path incorrectly; Helm considered resources applied but workload never became ready.",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "مصاحبهٔ سنیور روز ۲۶",
      questions: [
        mc("مبتدی — کدام فرمان manifest رندرشدهٔ chart را بدون نصب نشان می‌دهد؟", ["helm delete", "helm template", "helm repo remove", "kubectl drain"], "helm template", "این فرمان برای review خروجی template پیش از اعمال مفید است.", "helm"),
        tf("کارورز — موفق بودن `helm upgrade` بدون `--wait` تضمین می‌کند workload آمادهٔ سرویس‌دهی است.", false, "اعمال شدن resource با Ready شدن workload متفاوت است.", "helm"),
        sa("کارورز — برای دیدن log اجرای قبلی کانتینر restartشده چه گزینه‌ای می‌زنید؟", "kubectl logs <pod> --previous", "این گزینه log instance قبلی را پیش از restart بعدی بازیابی می‌کند.", "k8s-troubleshooting"),
        sa("سنیور — در پاسخ مصاحبه برای 503 Kubernetes چه زنجیره‌ای را بررسی می‌کنید؟", "Ingress، Service، EndpointSlice، readiness، Pod و سپس log و dependency برنامه.", "حرکت لایه‌ای محل قطع مسیر را مشخص می‌کند و از restart کور جلوگیری می‌کند.", "k8s-troubleshooting", 5),
      ],
    },
  },
];
