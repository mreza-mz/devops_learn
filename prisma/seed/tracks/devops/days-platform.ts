import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "./types";

/**
 * درس‌ها و تمرین‌های این فایل فقط از منابع انگلیسی و فارسی اینترنت استخراج شده‌اند.
 * هیچ محتوای آموزشی خودساخته اضافه نشده؛ فقط نقل قول / سرفصل / گام‌های تمرین همان منابع.
 */

export const platformDays: DaySeed[] = [
  {
    dayNumber: 39,
    phaseSlug: "platform-tools",
    titleFa: "Argo CD و GitOps از منابع رسمی و فارسی",
    objectiveFa: "نصب، Application، Sync و GitOps را طبق Getting Started رسمی Argo CD و راهنمای Redis.io، به‌همراه سرفصل دوره‌های فارسی داناپ/آکادمی همراه یاد بگیرید.",
    topicSlugs: ["argocd"],
    lessons: [
      {
        slug: "argocd-getting-started",
        topicSlug: "argocd",
        titleFa: "Getting Started — Argo CD (رسمی)",
        objectiveFa: "گام‌های نصب و guestbook را از مستندات رسمی Argo CD اجرا کنید.",
        theoryMd: `## منبع انگلیسی
[Argo CD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)

> This guide assumes you have a grounding in the tools that Argo CD is based on.

### Requirements (از همان صفحه)
- Installed kubectl command-line tool.
- Have a kubeconfig file (default location is \`~/.kube/config\`).

### 1. Install Argo CD
\`\`\`bash
kubectl create namespace argocd
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
\`\`\`

> This will create a new \`argocd\` namespace where all Argo CD services and application resources will reside. … Using a pinned version (like \`v3.2.0\`) is recommended for production.

### 3. Access — Port Forwarding
\`\`\`bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
\`\`\`
> The API server can then be accessed using https://localhost:8080

### 4. Log in
\`\`\`bash
argocd admin initial-password -n argocd
argocd login <ARGOCD_SERVER>
argocd account update-password
\`\`\`

### 6–7. Create & Sync guestbook
\`\`\`bash
argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git --path guestbook --dest-server https://kubernetes.default.svc --dest-namespace default
argocd app sync guestbook
\`\`\`

> The application status is initially in \`OutOfSync\` state since the application has yet to be deployed… To sync (deploy) the application, run: \`argocd app sync guestbook\`

## منبع فارسی — سرفصل دوره داناپ
[آموزش GitOps با استفاده از Argo CD | داناپ](https://danup.ir/courses/mastering-gitops-with-argo-cd/)

از معرفی دوره داناپ (نقل قول):
> Argo CD نیز یکی از محبوب ترین ابزارهای اپن سورس برای پیاده سازی GitOps در محیط های کوبرنتیز (Kubernetes) است. این ابزار با بررسی مداوم مخزن Git و مقایسه آن با وضعیت واقعی کلاستر، به صورت خودکار تغییرات را اعمال یا مشکلات همگام سازی را گزارش می کند.

سرفصل‌های اعلام‌شده در همان صفحه داناپ:
- آشنایی کامل با Argo CD، معماری و اجزای کلیدی آن
- نصب Argo CD روی کلاستر
- همگام سازی (Sync) و بازگردانی (Rollback) در Argo CD
- استقرار چندکلاستری (Multi-cluster deployment)، مدل Canary و Blue-Green
- مدیریت اطلاعات حساس (Secrets) در GitOps`,
        practicalMd: `تمرین از Getting Started رسمی Argo CD:
1) namespace و install.yaml را اعمال کنید
2) port-forward به argocd-server
3) initial-password بگیرید و login کنید
4) guestbook را create و sync کنید
5) وضعیت OutOfSync → Synced را با \`argocd app get guestbook\` ببینید`,
        exampleMd: `\`\`\`bash
kubectl create namespace argocd
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git --path guestbook --dest-server https://kubernetes.default.svc --dest-namespace default
argocd app sync guestbook
\`\`\`
منبع: https://argo-cd.readthedocs.io/en/stable/getting_started/`,
        commands: [
          "kubectl create namespace argocd",
          "kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml",
          "kubectl port-forward svc/argocd-server -n argocd 8080:443",
          "argocd app sync guestbook",
        ],
      },
      {
        slug: "argocd-redis-gitops",
        topicSlug: "argocd",
        titleFa: "GitOps با Argo CD برای Redis — Redis.io",
        objectiveFa: "تعریف GitOps و قابلیت‌های Argo CD را از آموزش رسمی Redis بخوانید و تمرین استقرار Redis را دنبال کنید.",
        theoryMd: `## منبع انگلیسی
[Argo CD with Redis: GitOps CI/CD Pipeline Setup Guide](https://redis.io/tutorials/operate/ci-cd/argo-cd/)

> Argo CD is a declarative, GitOps-based continuous delivery tool for Kubernetes. It monitors a Git repository for changes to Kubernetes manifests and automatically syncs them to your cluster.

> Argo CD follows the GitOps methodology, which uses Git as the single source of truth for declarative infrastructure and application configuration. It watches a remote Git repository for new or updated manifest files and synchronizes those changes with the cluster.

> Instead of pushing changes to the Kubernetes cluster, Argo CD pulls Kubernetes manifest changes and applies them.

> Argo CD also watches the cluster for changes. If someone updates the cluster manually, Argo CD detects the divergence between the desired state in Git and the actual state in the cluster, then syncs the Git-defined state back to the cluster—guaranteeing that the Git repo remains the single source of truth.

### Capabilities (از همان صفحه Redis.io)
- Easy rollback
- Web UI
- Multiple manifest formats: Kubernetes YAML, Helm Charts, Kustomize
- CLI and metrics
- Disaster recovery: Point a new cluster to the Git repo and Argo CD will automatically recreate the same exact state
- Access control via Git

## منبع فارسی — آکادمی همراه
[بوت کمپ DevOps ۲](https://hamrah.academy/bootcamps/3900/)
ابزارهای ذکرشده در معرفی بوت‌کمپ: Git ،GitLab ،ArgoCD ،Grafana ،Docker ،Kubernetes ،Ansible و Prometheus.`,
        practicalMd: `تمرین از همان آموزش Redis.io (Steps):
1) \`brew install argocd\`
2) \`kubectl create namespace argocd\`
3) \`kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml\`
4) \`kubectl get po -n argocd\` تا Running
5) port-forward و login
6) Create Redis application و \`argocd app list\`
7) \`argocd app delete redisdemo\``,
        exampleMd: `\`\`\`bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl get po -n argocd
kubectl port-forward svc/argocd-server -n argocd 8080:443
argocd app list
\`\`\`
منبع: https://redis.io/tutorials/operate/ci-cd/argo-cd/`,
        commands: ["kubectl get po -n argocd", "argocd app list"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "تمرین guestbook از Getting Started رسمی",
        topicSlug: "argocd",
        lessonSlug: "argocd-getting-started",
        path: "/tmp/day39-argocd-guestbook.txt",
        mustContain: "OutOfSync",
        instructionsMd: `طبق https://argo-cd.readthedocs.io/en/stable/getting_started/ بنویسید: پس از \`argocd app create guestbook\` وضعیت اولیه Sync Status چیست و فرمان sync چیست؟ پاسخ را در فایل ثبت کنید.`,
      }),
      noteExercise({
        titleFa: "تعریف GitOps از Redis.io",
        topicSlug: "argocd",
        lessonSlug: "argocd-redis-gitops",
        path: "/tmp/day39-gitops.txt",
        mustContain: "single source of truth",
        instructionsMd: `از https://redis.io/tutorials/operate/ci-cd/argo-cd/ نقل کنید: GitOps چه نقشی برای Git قائل است و Argo CD چگونه divergence دستی کلاستر را مدیریت می‌کند؟`,
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "سناریو از Redis.io — drift دستی در کلاستر",
      path: "/tmp/day39-scenario.txt",
      mustContain: "divergence",
      incidentMd: `طبق توضیح Redis.io: کسی کلاستر را دستی تغییر داده. Argo CD چه تشخیصی می‌دهد و چه واکنشی می‌تواند داشته باشد؟`,
      symptomsMd: "حالت مطلوب در Git با وضعیت واقعی کلاستر یکی نیست.",
      rootCause: "divergence between the desired state in Git and the actual state in the cluster",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۳۹ — منابع Argo CD",
      questions: [
        mc("طبق Getting Started رسمی، guestbook از کدام repo ساخته می‌شود؟", ["argocd-example-apps", "kubernetes/kubernetes", "redis/redis", "grafana/grafana"], "argocd-example-apps", "منبع: argo-cd.readthedocs.io Getting Started", "argocd"),
        sa("فرمان sync رسمی guestbook چیست؟", "argocd app sync guestbook", "منبع: Argo CD Getting Started §7", "argocd"),
        tf("طبق Redis.io، Argo CD به جای push، تغییرات manifest را pull می‌کند.", true, "منبع: redis.io Argo CD tutorial", "argocd"),
        mc("سرفصل داناپ کدام مورد را برای GitOps ذکر کرده؟", ["Sync و Rollback", "فقط Terraform", "فقط Zookeeper", "فقط Memcached"], "Sync و Rollback", "منبع: danup.ir دوره Argo CD", "argocd"),
      ],
    },
  },
  {
    dayNumber: 40,
    phaseSlug: "platform-tools",
    titleFa: "Redis برای عملیات DevOps — نصب رسمی",
    objectiveFa: "نصب Redis Open Source را از مستندات رسمی Redis و نقش Redis در GitOps/K8s را از آموزش Argo CD همان سایت یاد بگیرید.",
    topicSlugs: ["redis"],
    lessons: [
      {
        slug: "redis-install-official",
        topicSlug: "redis",
        titleFa: "Install Redis Open Source (رسمی)",
        objectiveFa: "Quick start با Docker و گزینه‌های نصب پلتفرم را از docs.redis.io اجرا کنید.",
        theoryMd: `## منبع انگلیسی
[Install Redis Open Source](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/)

### Quick start with Docker
> The fastest way to run Redis is with Docker:

\`\`\`bash
docker run -d --name redis -p 6379:6379 redis
\`\`\`

> See the Docker page for full details, including data persistence, custom configuration, and connecting with \`redis-cli\`.

### APT — Ubuntu / Debian (از همان صفحه)
\`\`\`bash
sudo apt-get install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
\`\`\`

### Homebrew (macOS)
\`\`\`bash
brew install redis
brew services start redis
\`\`\`

> You can also download Redis Insight, a free developer companion tool with an intuitive GUI and advanced CLI…

## منبع انگلیسی — Kubernetes
[Redis Enterprise for Kubernetes](https://redis.io/docs/latest/operate/kubernetes/)

> Redis Enterprise for Kubernetes brings Redis Enterprise to Kubernetes environments through the Redis Enterprise operator. You can deploy, scale, and manage Redis Enterprise clusters and databases by using native Kubernetes resources and workflows.

> The Redis Enterprise operator simplifies deployment and management by providing custom resource definitions (CRDs) for Redis Enterprise clusters (REC) and databases (REDB). This approach enables GitOps workflows and Kubernetes-native operations.`,
        practicalMd: `تمرین از Install Redis Open Source:
1) \`docker run -d --name redis -p 6379:6379 redis\`
2) با \`redis-cli\` به localhost:6379 وصل شوید (طبق لینک Docker همان docs)
3) برای مسیر K8s، صفحه Redis Enterprise for Kubernetes را بخوانید: REC و REDB`,
        exampleMd: `\`\`\`bash
docker run -d --name redis -p 6379:6379 redis
\`\`\`
منبع: https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/`,
        commands: ["docker run -d --name redis -p 6379:6379 redis"],
      },
      {
        slug: "redis-in-voting-app",
        topicSlug: "redis",
        titleFa: "Redis به‌عنوان queue در Voting App — Redis.io",
        objectiveFa: "نقش Redis در نمونهٔ multi-service آموزش Argo CD را از همان صفحه استخراج کنید.",
        theoryMd: `## منبع
[Argo CD with Redis](https://redis.io/tutorials/operate/ci-cd/argo-cd/) — بخش Example: Voting app

نقل قول از همان صفحه:
> Let's try to deploy a voting app. The voting application only accepts one vote per client.

اجزای اعلام‌شده در همان بخش:
- A Python web app which lets you vote between two options
- A Redis queue that collects new votes
- A .NET worker which consumes votes and stores them in…
- A Postgres database backed by a Docker volume
- A Node.js web app that shows the results of the voting in real time

> Access the app via http://localhost:31000/.
> The results are accessible via http://localhost:31001/.

Next steps اعلام‌شده در همان صفحه برای DevOps:
- Redis Kubernetes Operator
- Auto-sync policies
- Health checks
- Notifications`,
        practicalMd: `طبق همان آموزش: در داشبورد Argo CD اپ Voting را با repo/path مناسب Create کنید، Group by Node را ببینید و Events را بررسی کنید.`,
        exampleMd: `از همان صفحه Redis.io:
- Redis queue that collects new votes
- Access: http://localhost:31000/ و results: http://localhost:31001/`,
        commands: ["argocd app list"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "فرمان Docker رسمی Redis",
        topicSlug: "redis",
        lessonSlug: "redis-install-official",
        path: "/tmp/day40-redis-docker.txt",
        mustContain: "6379",
        instructionsMd: `از https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/ فرمان Quick start with Docker را عیناً بنویسید.`,
      }),
      noteExercise({
        titleFa: "نقش Redis در Voting app",
        topicSlug: "redis",
        lessonSlug: "redis-in-voting-app",
        path: "/tmp/day40-redis-queue.txt",
        mustContain: "queue",
        instructionsMd: `از https://redis.io/tutorials/operate/ci-cd/argo-cd/ بنویسید Redis در Voting app چه نقشی دارد (عبارت انگلیسی منبع).`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Redis بدون persistence در Docker",
      path: "/tmp/day40-scenario.txt",
      mustContain: "persistence",
      incidentMd: `مستندات Redis می‌گوید Docker page شامل data persistence است. اگر فقط \`docker run -d --name redis -p 6379:6379 redis\` بدون persistence اجرا شود، ریسک عملیات چیست؟ پاسخ را بر اساس اشارهٔ همان docs بنویسید.`,
      symptomsMd: "پس از حذف کانتینر داده‌ها از بین می‌روند.",
      rootCause: "default quick-start container without documented persistence configuration",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "آزمون روز ۴۰ — Redis",
      questions: [
        sa("پورت پیش‌فرض در فرمان Docker رسمی Redis چیست؟", "6379", "منبع: redis.io Install Redis Open Source", "redis"),
        tf("طبق Redis Enterprise for Kubernetes، operator با CRDهای REC/REDB از GitOps پشتیبانی می‌کند.", true, "منبع: redis.io/docs operate/kubernetes", "redis"),
        mc("در Voting app آموزش Redis.io، Redis چه نقشی دارد؟", ["queue that collects new votes", "فقط DNS", "فقط Ingress", "فقط etcd"], "queue that collects new votes", "منبع: redis.io Argo CD tutorial", "redis"),
        mc("Next steps همان آموزش کدام است؟", ["Redis Kubernetes Operator", "فقط FTP", "فقط SVN", "فقط NIS"], "Redis Kubernetes Operator", "منبع: redis.io Argo CD tutorial", "redis"),
      ],
    },
  },
  {
    dayNumber: 41,
    phaseSlug: "platform-tools",
    titleFa: "RabbitMQ برای DevOps — Hello World و Production Checklist",
    objectiveFa: "مدل queue/producer/consumer را از Tutorial رسمی و توصیه‌های production را از Production Deployment Guidelines رسمی یاد بگیرید.",
    topicSlugs: ["rabbitmq"],
    lessons: [
      {
        slug: "rabbitmq-hello-world",
        topicSlug: "rabbitmq",
        titleFa: "Tutorial One — Hello World (رسمی)",
        objectiveFa: "تعاریف queue، producer و consumer و تمرین send/receive را از rabbitmq.com دنبال کنید.",
        theoryMd: `## منبع انگلیسی
[RabbitMQ tutorial - "Hello world!"](https://www.rabbitmq.com/tutorials/tutorial-one-python)

> A queue is the name for the post box in RabbitMQ. Although messages flow through RabbitMQ and your applications, they can only be stored inside a queue. A queue is only bound by the host's memory & disk limits, it's essentially a large message buffer.

> Many producers can send messages that go to one queue, and many consumers can try to receive data from one queue.

> Consuming has a similar meaning to receiving. A consumer is a program that mostly waits to receive messages.

> Note that the producer, consumer, and broker do not have to reside on the same host; indeed in most applications they don't.

> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1…

> In RabbitMQ a message can never be sent directly to the queue, it always needs to go through an exchange.

Listing queues (از همان tutorial):
\`\`\`bash
sudo rabbitmqctl list_queues
\`\`\`

## منبع فارسی — مقایسه با Kafka
[Kafka چیست؟ (چه تفاوتی با RabbitMQ دارد؟) — ۷لرن](https://7learn.com/blog/what-is-kafka)

> RabbitMQ بیشتر برای پردازش‌های کوچک و متوسط مناسبه. این ابزار به خاطر سادگی و راحتی در راه اندازی و مدیریت، گزینه خوبی برای پروژه هایی هست که نیاز به پیچیدگی کمتری دارن. RabbitMQ برای صف پیام و ارتباطات بین سیستمی خیلی مناسبه.

جدول همان مقاله ۷لرن (خلاصهٔ ستون‌ها):
| ویژگی | Kafka | RabbitMQ |
| مقیاس پذیری | خیلی بالا | متوسط |
| پیچیدگی | بالا | متوسط |
| استفاده اصلی | جریان سازی داده | صف پیام |`,
        practicalMd: `تمرین از Tutorial رسمی:
1) \`python -m pip install pika --upgrade\`
2) \`receive.py\` را اجرا کنید تا Waiting for messages بماند
3) \`send.py\` را اجرا کنید تا \`[x] Sent 'Hello World!'\`
4) \`sudo rabbitmqctl list_queues\` را برای دیدن صف‌ها اجرا کنید`,
        exampleMd: `\`\`\`bash
sudo rabbitmqctl list_queues
python receive.py
python send.py
\`\`\`
منبع کد و توضیح: https://www.rabbitmq.com/tutorials/tutorial-one-python`,
        commands: ["sudo rabbitmqctl list_queues"],
      },
      {
        slug: "rabbitmq-production",
        topicSlug: "rabbitmq",
        titleFa: "Production Deployment Guidelines (رسمی)",
        objectiveFa: "چک‌لیست production رسمی RabbitMQ را برای عملیات DevOps بخوانید.",
        theoryMd: `## منبع انگلیسی
[Production Deployment Guidelines](https://www.rabbitmq.com/docs/production-checklist)

> Monitoring and metrics are the foundation of a production-grade system. Besides helping detect issues, it provides the operator data that can be used to size and configure both RabbitMQ nodes and applications.

Areas covered (از همان صفحه):
- Storage considerations for node data directories
- Networking-related recommendations
- Recommendations related to virtual hosts, users and permissions
- Monitoring and resource usage
- Configurable limits
- Security
- Clustering and multi-node deployments
- Application-level practices and considerations

### Minimum Hardware Requirements (نقل قول)
- No colocation with other data services (e.g. data stores) or disk, network I/O heavy applications
- 4 CPU cores
- 4 GiB of RAM

> RabbitMQ was not designed to run in environments with a single CPU core, or being colocated with other disk and network I/O-heavy tools.

### Users (نقل قول)
> For production environments, delete the default user (\`guest\`). … Instead of enabling remote connections, consider creating a separate user with administrative permissions and a generated password.

> It is recommended to use a separate user per application.

### Definition import
> The recommended way of doing this at deployment time is via definition import.`,
        practicalMd: `طبق Production Checklist:
1) حداقل سخت‌افزار per node را یادداشت کنید
2) guest را حذف و user جدا per application بسازید
3) monitoring/metrics را به‌عنوان foundation در نظر بگیرید
4) definition import را برای seeding vhost/users/policies برنامه‌ریزی کنید`,
        exampleMd: `حداقل per node از مستندات رسمی:
- 4 CPU cores
- 4 GiB of RAM
- No colocation with other data services
منبع: https://www.rabbitmq.com/docs/production-checklist`,
        commands: ["rabbitmqctl list_users", "rabbitmqctl status"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "تعریف queue از Tutorial رسمی",
        topicSlug: "rabbitmq",
        lessonSlug: "rabbitmq-hello-world",
        path: "/tmp/day41-queue.txt",
        mustContain: "message buffer",
        instructionsMd: `از https://www.rabbitmq.com/tutorials/tutorial-one-python تعریف queue را نقل کنید (شامل عبارت message buffer).`,
      }),
      noteExercise({
        titleFa: "حداقل سخت‌افزار production",
        topicSlug: "rabbitmq",
        lessonSlug: "rabbitmq-production",
        path: "/tmp/day41-prod.txt",
        mustContain: "4 GiB",
        instructionsMd: `از https://www.rabbitmq.com/docs/production-checklist حداقل CPU و RAM per node را بنویسید و توصیهٔ حذف user پیش‌فرض guest را ذکر کنید.`,
        difficulty: "hard",
      }),
    ],
    scenario: noteScenario({
      titleFa: "guest در production",
      path: "/tmp/day41-scenario.txt",
      mustContain: "guest",
      incidentMd: `طبق Production Guidelines رسمی: default user guest در محیط تولید چه مشکلی دارد و توصیه چیست؟`,
      symptomsMd: "credential شناخته‌شده و محدودیت localhost برای guest.",
      rootCause: "default user guest with well-known credentials should be deleted in production",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "آزمون روز ۴۱ — RabbitMQ",
      questions: [
        tf("طبق Tutorial رسمی، پیام مستقیماً به queue نمی‌رود و از exchange عبور می‌کند.", true, "منبع: rabbitmq.com tutorial one", "rabbitmq"),
        sa("ابزار لیست صف‌ها در tutorial چیست؟", "rabbitmqctl list_queues", "منبع: rabbitmq.com tutorial one", "rabbitmq"),
        mc("حداقل RAM رسمی per node production؟", ["4 GiB", "256 MiB", "64 MiB", "1 MiB"], "4 GiB", "منبع: Production Deployment Guidelines", "rabbitmq"),
        mc("طبق ۷لرن، استفاده اصلی RabbitMQ کدام است؟", ["صف پیام", "فقط full-text search", "فقط object storage", "فقط CDN"], "صف پیام", "منبع: 7learn.com/blog/what-is-kafka", "rabbitmq"),
      ],
    },
  },
  {
    dayNumber: 42,
    phaseSlug: "platform-tools",
    titleFa: "Apache Kafka برای DevOps — Quickstart رسمی و منبع فارسی",
    objectiveFa: "topic، produce/consume و Connect را از Quickstart رسمی Kafka و تعریف/مقایسه را از مقالهٔ فارسی ۷لرن یاد بگیرید.",
    topicSlugs: ["kafka"],
    lessons: [
      {
        slug: "kafka-quickstart",
        topicSlug: "kafka",
        titleFa: "Apache Kafka Quickstart (رسمی)",
        objectiveFa: "گام‌های رسمی get Kafka تا consume را اجرا کنید.",
        theoryMd: `## منبع انگلیسی
[Quickstart | Apache Kafka](https://kafka.apache.org/quickstart/)

> NOTE: Your local environment must have Java 17+ installed.

### Docker
\`\`\`bash
docker pull apache/kafka:4.3.1
docker run -p 9092:9092 apache/kafka:4.3.1
\`\`\`

### Topic
> Kafka is a distributed event streaming platform that lets you read, write, store, and process events (also called records or messages in the documentation) across many machines.

> Very simplified, a topic is similar to a folder in a filesystem, and the events are the files in that folder.

\`\`\`bash
bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092
bin/kafka-topics.sh --describe --topic quickstart-events --bootstrap-server localhost:9092
\`\`\`

### Produce / Consume
\`\`\`bash
bin/kafka-console-producer.sh --topic quickstart-events --bootstrap-server localhost:9092
bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092
\`\`\`

> Because events are durably stored in Kafka, they can be read as many times and by as many consumers as you want.

### Kafka Connect (خلاصهٔ §6)
> Kafka Connect allows you to continuously ingest data from external systems into Kafka, and vice versa.`,
        practicalMd: `تمرین از kafka.apache.org/quickstart:
1) Docker image را run کنید یا server محلی را start کنید
2) topic \`quickstart-events\` بسازید
3) با console-producer دو event بنویسید
4) با console-consumer از beginning بخوانید
5) consumer دوم را باز کنید تا durability را ببینید`,
        exampleMd: `\`\`\`bash
docker run -p 9092:9092 apache/kafka:4.3.1
bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092
bin/kafka-console-producer.sh --topic quickstart-events --bootstrap-server localhost:9092
bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092
\`\`\`
منبع: https://kafka.apache.org/quickstart/`,
        commands: [
          "docker run -p 9092:9092 apache/kafka:4.3.1",
          "bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092",
        ],
      },
      {
        slug: "kafka-fa-7learn",
        topicSlug: "kafka",
        titleFa: "Kafka چیست؟ — منبع فارسی ۷لرن",
        objectiveFa: "تعریف، مزایا و تفاوت با RabbitMQ را از مقالهٔ ۷لرن بخوانید.",
        theoryMd: `## منبع فارسی
[Kafka چیست؟ (چه تفاوتی با RabbitMQ دارد؟)](https://7learn.com/blog/what-is-kafka)

> کافکا معروف به Apache Kafka یه سیستم ذخیره سازی رویداد توزیع شده و پلتفرم پردازش جریان داده هست که توسط Apache Software Foundation توسعه داده شده و به زبان‌های جاوا و اسکالا نوشته شده. Kafka می‌تونه به سیستم‌های خارجی از طریق Kafka Connect وصل بشه و کتابخانه‌های Kafka Streams رو برای برنامه‌های پردازش جریان داده‌ها فراهم کنه.

### مزایای اعلام‌شده در همان مقاله
1. مقیاس پذیری بالا — > Kafka می‌تونه حجم عظیمی از داده‌ها رو بدون افت کارایی پردازش کنه.
2. پایداری — > Kafka داده‌ها رو به صورت پایدار ذخیره و مدیریت می‌کنه، به طوری که از دست رفتن داده‌ها به حداقل می‌رسه.
3. انعطاف پذیری — > Kafka با انواع مختلف سیستم‌ها و برنامه‌ها سازگاری داره

### مقایسه (نقل از جدول مقاله)
| ویژگی | Kafka | RabbitMQ |
| --- | --- | --- |
| مقیاس پذیری | خیلی بالا | متوسط |
| پیچیدگی | بالا | متوسط |
| تأخیر | خیلی کم | کم |
| استفاده اصلی | جریان سازی داده | صف پیام |

> برای پردازش و مدیریت حجم بالای داده‌ها و کاربردهای بلادرنگ مثل جمع آوری لاگ‌ها و تحلیل‌های لحظه ای → Kafka مناسب‌تر معرفی شده است.`,
        practicalMd: `از مقالهٔ ۷لرن: سه مزیت (مقیاس‌پذیری، پایداری، انعطاف‌پذیری) و تفاوت «جریان سازی داده» در برابر «صف پیام» را یادداشت کنید؛ سپس با Quickstart رسمی یک produce/consume انجام دهید.`,
        exampleMd: `نقل از ۷لرن: استفاده اصلی Kafka = جریان سازی داده؛ RabbitMQ = صف پیام.
https://7learn.com/blog/what-is-kafka`,
        commands: ["bin/kafka-topics.sh --describe --topic quickstart-events --bootstrap-server localhost:9092"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "تعریف topic از Quickstart رسمی",
        topicSlug: "kafka",
        lessonSlug: "kafka-quickstart",
        path: "/tmp/day42-topic.txt",
        mustContain: "folder",
        instructionsMd: `از https://kafka.apache.org/quickstart/ تشبیه topic به filesystem را نقل کنید.`,
      }),
      noteExercise({
        titleFa: "مقایسه Kafka و RabbitMQ از ۷لرن",
        topicSlug: "kafka",
        lessonSlug: "kafka-fa-7learn",
        path: "/tmp/day42-compare.txt",
        mustContain: "جریان سازی",
        instructionsMd: `از https://7learn.com/blog/what-is-kafka بنویسید استفاده اصلی Kafka و RabbitMQ در جدول مقایسه چیست.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "نیاز به چندبار خواندن همان event",
      path: "/tmp/day42-scenario.txt",
      mustContain: "durably",
      incidentMd: `طبق Quickstart رسمی Kafka: چرا چند consumer می‌توانند همان eventها را دوباره بخوانند؟`,
      symptomsMd: "باز کردن consumer دوم همان پیام‌های from-beginning را می‌بیند.",
      rootCause: "events are durably stored in Kafka and can be read as many times and by as many consumers as you want",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "آزمون روز ۴۲ — Kafka",
      questions: [
        tf("طبق Quickstart، Java 17+ لازم است.", true, "منبع: kafka.apache.org/quickstart", "kafka"),
        sa("نام topic نمونه در Quickstart چیست؟", "quickstart-events", "منبع: Kafka Quickstart Step 3", "kafka"),
        mc("طبق ۷لرن، استفاده اصلی Kafka؟", ["جریان سازی داده", "فقط DHCP", "فقط LDAP", "فقط SMTP"], "جریان سازی داده", "منبع: 7learn.com", "kafka"),
        tf("طبق Quickstart، Kafka Connect برای ingest از سیستم‌های خارجی است.", true, "منبع: Kafka Quickstart Step 6", "kafka"),
      ],
    },
  },
  {
    dayNumber: 43,
    phaseSlug: "platform-tools",
    titleFa: "Elasticsearch برای DevOps — نصب محلی و سرفصل ELK فارسی",
    objectiveFa: "راه‌اندازی محلی رسمی Elastic و سرفصل DevOps خانه لینوکس ایران (آنیسا) برای Elastic Stack را پوشش دهید.",
    topicSlugs: ["elasticsearch"],
    lessons: [
      {
        slug: "elasticsearch-local",
        topicSlug: "elasticsearch",
        titleFa: "Install Elasticsearch locally (رسمی)",
        objectiveFa: "اسکریپت start-local رسمی را برای توسعه محلی اجرا کنید.",
        theoryMd: `## منبع انگلیسی
[Install Elasticsearch locally (quickstart)](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/local-development-installation-quickstart)

> DO NOT USE THESE INSTRUCTIONS FOR PRODUCTION DEPLOYMENTS The instructions on this page are for local development only. Do not use this configuration for production deployments, because it is not secure.

Prerequisites (از همان صفحه):
- Install Docker Compose (Docker Desktop یا Docker Engine)
- Docker Compose V2 or later is recommended
- On Windows: install WSL

### Step 1
\`\`\`sh
curl -fsSL https://elastic.co/start-local | sh
\`\`\`

> After running the script, you can access Elastic services at the following endpoints:
> - Elasticsearch: http://localhost:9200
> - Kibana: http://localhost:5601

> That's it! There's no step 2.

همچنین از صفحه Get started with search:
[Get started with search](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html)
tutorialهای پیشنهادی رسمی: Index and search basics، Keyword search with Python، Semantic search.`,
        practicalMd: `تمرین از quickstart رسمی:
1) Docker Compose را آماده کنید
2) \`curl -fsSL https://elastic.co/start-local | sh\`
3) http://localhost:9200 و http://localhost:5601 را باز کنید
4) هشدار «not for production / not secure» را در یادداشت عملیات ثبت کنید`,
        exampleMd: `\`\`\`sh
curl -fsSL https://elastic.co/start-local | sh
\`\`\`
Endpoints: :9200 Elasticsearch ، :5601 Kibana
منبع: elastic.co local-development-installation-quickstart`,
        commands: ["curl -fsSL https://elastic.co/start-local | sh"],
      },
      {
        slug: "elk-anisa-outline",
        topicSlug: "elasticsearch",
        titleFa: "سرفصل Elastic Stack برای DevOps — آنیسا",
        objectiveFa: "آنچه خانه لینوکس ایران برای مهندسان DevOps در ELK اعلام کرده را به‌عنوان مسیر یادگیری استفاده کنید.",
        theoryMd: `## منبع فارسی
[دوره آموزش ELK Stack — فناوران آنیسا / خانه لینوکس ایران](https://anisa.co.ir/courses/devops/monitoring/elastic-stack.html)

از معرفی دوره (نقل قول):
> این دوره یک آموزش کامل از Elastic Stack (که قبلاً به عنوان ELK Stack شناخته می‌شد) را شامل Elasticsearch ،Logstash ،Kibana و Beats ارائه می‌دهد.

> قابلیت‌های بی‌نظیر Elastic Stack برای مهندسان شبکه، دواپس و تحلیل داده در مدیریت لاگ‌ها، نظارت بر زیرساخت و تحلیل‌های امنیتی

### آنچه خواهید آموخت (از همان صفحه)
- Elasticsearch: آشنایی با معماری، جستجوهای ساده و پیشرفته و ارتباط آن با سایر اجزا.
- Logstash: پیکربندی و مدیریت پایپ‌لاین‌های داده برای پردازش و توزیع داده ها.
- Kibana: ایجاد ابزارهای بصری پویا … داشبوردهای سفارشی و تعریف هشدارها
- Beats و Elastic Agent: جمع‌آوری داده‌ها از شبکه، برنامه‌ها و منابع دیگر.
- امنیت و نظارت: کنترل دسترسی مبتنی بر نقش، ارتباطات ایمن و استفاده از Elastic Stack برای تحلیل‌های امنیتی جامع

### Course Outline (انگلیسی همان صفحه، September 2024)
Introduction to Elastic Stack — Common Use Cases: Log Management, Business Analysis, Security Analytics, Monitoring

Deep Dive into Elasticsearch:
- Elasticsearch Architecture: Nodes, Clusters, and Indexes
- CRUD Operations
- Search Queries: Term, Match, Range, Aggregations
- Performance Tuning with Sharding, Replication, Caching, and Index Management

> با این حال، برای مدیریت خطوط لوله پیچیده تر … اجزای اضافی برای انعطاف پذیری (Kafka ، RabbitMQ ، Redis) و امنیت (nginx) به معماری لاگهای شما اضافه می‌شوند`,
        practicalMd: `مسیر تمرین بر اساس سرفصل آنیسا (DevOps):
1) Use cases: Log Management و Monitoring را از outline جدا کنید
2) معماری Nodes/Clusters/Indexes را از Deep Dive یادداشت کنید
3) نقش Beats/Agent در جمع‌آوری و Kibana برای هشدار را مشخص کنید
4) اشارهٔ همان صفحه به Kafka/RabbitMQ/Redis در پایپ‌لاین لاگ را ثبت کنید`,
        exampleMd: `Use Cases از outline آنیسا: Log Management, Business Analysis, Security Analytics, Monitoring
منبع: https://anisa.co.ir/courses/devops/monitoring/elastic-stack.html`,
        commands: ["curl -s http://localhost:9200"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "هشدار production در quickstart رسمی",
        topicSlug: "elasticsearch",
        lessonSlug: "elasticsearch-local",
        path: "/tmp/day43-local.txt",
        mustContain: "production",
        instructionsMd: `از https://www.elastic.co/docs/deploy-manage/deploy/self-managed/local-development-installation-quickstart هشدار DO NOT USE … FOR PRODUCTION را نقل کنید و endpointهای 9200/5601 را بنویسید.`,
      }),
      noteExercise({
        titleFa: "Use cases از سرفصل آنیسا",
        topicSlug: "elasticsearch",
        lessonSlug: "elk-anisa-outline",
        path: "/tmp/day43-usecases.txt",
        mustContain: "Log Management",
        instructionsMd: `از https://anisa.co.ir/courses/devops/monitoring/elastic-stack.html چهار Common Use Cases بخش Introduction را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "start-local در production",
      path: "/tmp/day43-scenario.txt",
      mustContain: "not secure",
      incidentMd: `طبق صفحه رسمی local quickstart، چرا نباید همین دستور را برای production استفاده کرد؟`,
      symptomsMd: "پیکربندی توسعه روی محیط تولید اعمال شده است.",
      rootCause: "local development configuration is not secure and not for production deployments",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "آزمون روز ۴۳ — Elasticsearch",
      questions: [
        sa("پورت پیش‌فرض Elasticsearch در start-local چیست؟", "9200", "منبع: Elastic local quickstart", "elasticsearch"),
        sa("پورت Kibana در همان quickstart؟", "5601", "منبع: Elastic local quickstart", "elasticsearch"),
        tf("طبق آنیسا، مخاطبان دوره شامل متخصصان DevOps هستند.", true, "منبع: anisa.co.ir ELK course", "elasticsearch"),
        mc("طبق outline آنیسا کدام use case آمده؟", ["Log Management", "فقط DHCP", "فقط SMTP", "فقط FTP"], "Log Management", "منبع: anisa ELK outline", "elasticsearch"),
      ],
    },
  },
  {
    dayNumber: 44,
    phaseSlug: "platform-tools",
    titleFa: "Prometheus از First Steps رسمی و DockerMe فارسی",
    objectiveFa: "نصب، scrape و PromQL پایه را از prometheus.io و استک مانیتورینگ داکر را از مقالهٔ فارسی DockerMe یاد بگیرید.",
    topicSlugs: ["prometheus-sourced"],
    lessons: [
      {
        slug: "prometheus-first-steps",
        topicSlug: "prometheus-sourced",
        titleFa: "First steps with Prometheus (رسمی)",
        objectiveFa: "گام‌های رسمی download تا expression browser را دنبال کنید.",
        theoryMd: `## منبع انگلیسی
[First steps with Prometheus](https://prometheus.io/docs/introduction/first_steps/)

> Prometheus is a monitoring platform that collects metrics from monitored targets by scraping metrics HTTP endpoints on these targets.

### نمونه prometheus.yml (از همان صفحه)
\`\`\`yaml
global:
  scrape_interval:     15s
  evaluation_interval: 15s

rule_files:
  # - "first.rules"
  # - "second.rules"

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
\`\`\`

> The \`global\` block controls the Prometheus server's global configuration. … \`scrape_interval\` … scrape every 15 seconds. The \`evaluation_interval\` option controls how often Prometheus will evaluate rules.

> Prometheus expects metrics to be available on targets on a path of \`/metrics\`. So this default job is scraping via the URL: http://localhost:9090/metrics .

Start:
\`\`\`bash
./prometheus --config.file=prometheus.yml
\`\`\`

Expression examples از همان صفحه:
\`\`\`
promhttp_metric_handler_requests_total
promhttp_metric_handler_requests_total{code="200"}
count(promhttp_metric_handler_requests_total)
rate(promhttp_metric_handler_requests_total{code="200"}[1m])
\`\`\``,
        practicalMd: `تمرین از First steps رسمی:
1) Prometheus را extract و \`prometheus.yml\` را بررسی کنید
2) \`./prometheus --config.file=prometheus.yml\`
3) http://localhost:9090 و /metrics را باز کنید
4) queryهای بالا را در expression browser اجرا کنید
5) برای هدف بعدی: Monitoring Linux host metrics using node exporter (لینک همان صفحه)`,
        exampleMd: `\`\`\`bash
./prometheus --config.file=prometheus.yml
\`\`\`
منبع: https://prometheus.io/docs/introduction/first_steps/`,
        commands: ["./prometheus --config.file=prometheus.yml"],
      },
      {
        slug: "prometheus-dockerme-fa",
        topicSlug: "prometheus-sourced",
        titleFa: "راه‌اندازی مانیتورینگ با داکر — DockerMe",
        objectiveFa: "کامپوننت‌ها و روش pull/alert را از مقالهٔ فارسی احمد رفیعی / DockerMe استخراج کنید.",
        theoryMd: `## منبع فارسی
[راه‌اندازی مانیتورینگ با استفاده از داکر — ویرگول / DockerMe](https://virgool.io/DockerMe/monitoring-alcoarvbnr5w)

> مانیتورینگ و لاگینگ چشم و گوش ما برای دیدن سرورها و سرویس‌های خودمون هستند.

لیست کامپوننت‌ها (نقل قول):
- سرویس Prometheus: برای مانیتورینگ و جمع‌آوری متریک‌ها استفاده می‌شود.
- سرویس Alertmanager: برای ایجاد اعلان‌ها و اطلاع‌رسانی‌ آن‌ها استفاده می‌شود.
- سرویس Grafana: برای Visualize کردن متریک‌ها و لاگ‌ها می‌باشد.
- سرویس CAdvisor: برای مانیتورینگ و گزارش متریک‌های کانتینرها می‌باشد.
- سرویس Node-Exporter: برای مانیتورینگ و گزارش متریک‌های سیستم‌عامل لینوکس کاربرد دارد.

> قسمت اصلی و مرکزی Prometheus server می‌باشد که تمام متریک‌ها از طریق Exporterها آماده می‌شود و خود Prometheus server آن‌ها را Pull می‌کند.

> یکی از موارد دیگه که در prometheus کانفیگ می‌شود ruleهای مربوط به alerting می‌باشد … این موارد به سمت alertmanager ارسال می‌شود.

راه‌اندازی از همان مقاله:
\`\`\`bash
git clone https://gitlab.com/scenario1/docker/monitoring.git
docker-compose config
docker-compose up -d
docker-compose ps
docker-compose logs -f --tail 100
\`\`\`

> یک نکته‌ی مهم دیگه اینکه سرویس مانیتورینگ و کل استک آن می‌بایست در شبکه‌ی داخلی شما و پشت فایروال‌های شما در دسترس باشند. هیچ‌گاه نباید آن‌ها به صورت public در دسترس باشد

## منبع فارسی تکمیلی
[Prometheus - آکادمی همراه](https://hamrah.academy/course/3880/prometheus/)
سرفصل اعلام‌شده: معماری Prometheus، نصب با Docker، PromQL، اتصال به Grafana، Kubernetes-Prometheus Stack، Exporterهایی مانند Redis، Alertmanager.`,
        practicalMd: `تمرین از DockerMe:
1) مخزن monitoring را clone کنید
2) DOMAIN را در compose تنظیم کنید
3) \`docker-compose config && docker-compose up -d\`
4) در Prometheus → Status → Targets سلامت scrape را ببینید
5) هشدار امنیتی «public نباشد» را در runbook بنویسید`,
        exampleMd: `\`\`\`bash
git clone https://gitlab.com/scenario1/docker/monitoring.git
docker-compose config
docker-compose up -d
\`\`\`
منبع: https://virgool.io/DockerMe/monitoring-alcoarvbnr5w`,
        commands: ["docker-compose config", "docker-compose up -d", "docker-compose ps"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "scrape_interval از First steps",
        topicSlug: "prometheus-sourced",
        lessonSlug: "prometheus-first-steps",
        path: "/tmp/day44-scrape.txt",
        mustContain: "15s",
        instructionsMd: `از https://prometheus.io/docs/introduction/first_steps/ مقدار scrape_interval نمونه و مسیر \`/metrics\` را بنویسید.`,
      }),
      noteExercise({
        titleFa: "مدل Pull از DockerMe",
        topicSlug: "prometheus-sourced",
        lessonSlug: "prometheus-dockerme-fa",
        path: "/tmp/day44-pull.txt",
        mustContain: "Pull",
        instructionsMd: `از https://virgool.io/DockerMe/monitoring-alcoarvbnr5w توضیح دهید Prometheus متریک Exporterها را چگونه دریافت می‌کند و چرا استک نباید public باشد.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "مانیتورینگ public بدون auth",
      path: "/tmp/day44-scenario.txt",
      mustContain: "فایروال",
      incidentMd: `طبق هشدار مقالهٔ DockerMe: اگر استک مانیتورینگ public باشد چه باید کرد؟`,
      symptomsMd: "داشبوردها از اینترنت باز هستند.",
      rootCause: "monitoring stack exposed publicly without firewall and authentication controls",
      difficulty: "hard",
    }),
    exam: {
      titleFa: "آزمون روز ۴۴ — Prometheus",
      questions: [
        tf("طبق First steps، Prometheus با scrape از HTTP endpoint متریک جمع می‌کند.", true, "منبع: prometheus.io first_steps", "prometheus-sourced"),
        sa("مقدار scrape_interval در نمونهٔ رسمی چیست؟", "15s", "منبع: prometheus.yml نمونه First steps", "prometheus-sourced"),
        mc("طبق DockerMe کدام سرویس Visualize می‌کند؟", ["Grafana", "فقط iptables", "فقط bind", "فقط cron"], "Grafana", "منبع: virgool DockerMe", "prometheus-sourced"),
        tf("طبق DockerMe، Prometheus متریک‌ها را از Exporterها Pull می‌کند.", true, "منبع: DockerMe monitoring post", "prometheus-sourced"),
      ],
    },
  },
  {
    dayNumber: 45,
    phaseSlug: "platform-tools",
    titleFa: "Grafana + Prometheus از مستندات Grafana و DockerMe",
    objectiveFa: "اتصال data source، Explore و داشبورد را از grafana.com و import داشبورد را از مقالهٔ فارسی DockerMe یاد بگیرید.",
    topicSlugs: ["grafana-sourced"],
    lessons: [
      {
        slug: "grafana-prometheus-official",
        topicSlug: "grafana-sourced",
        titleFa: "Get started with Grafana and Prometheus (رسمی)",
        objectiveFa: "گام‌های رسمی Node exporter تا ساخت داشبورد را دنبال کنید.",
        theoryMd: `## منبع انگلیسی
[Get started with Grafana and Prometheus](https://grafana.com/docs/grafana/latest/getting-started/get-started-grafana-prometheus/)

> Prometheus is an open source monitoring system for which Grafana provides out-of-the-box support.

Steps listed on that page:
1. Download Prometheus and Node exporter
2. Install Prometheus Node exporter
3. Install and configure Prometheus
4. Configure Prometheus for Grafana
5. Check Prometheus metrics in Grafana Explore view
6. Start building dashboards

> When you run Node exporter locally, navigate to \`http://localhost:9100/metrics\` to check that it is exporting metrics.

نمونه scrape برای node (از همان صفحه):
\`\`\`yaml
scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
\`\`\`

Start Prometheus:
\`\`\`bash
./prometheus --config.file=./prometheus.yml
\`\`\`
> Confirm that Prometheus is running by navigating to \`http://localhost:9090\`.

Troubleshooting نقل‌شده از همان صفحه:
\`\`\`bash
sudo systemctl status prometheus
curl -s http://localhost:9090/-/ready
curl http://localhost:9090/metrics
\`\`\`

> Now that you have a curated list of queries, create dashboards to render system metrics monitored by Prometheus.`,
        practicalMd: `تمرین از grafana.com docs:
1) Node exporter را نصب و :9100/metrics را چک کنید
2) job \`node\` را به prometheus.yml اضافه کنید
3) Prometheus را start کنید
4) در Grafana، Prometheus data source بسازید
5) در Explore متریک‌ها را ببینید و داشبورد بسازید`,
        exampleMd: `\`\`\`yaml
- job_name: 'node'
  static_configs:
    - targets: ['localhost:9100']
\`\`\`
منبع: https://grafana.com/docs/grafana/latest/getting-started/get-started-grafana-prometheus/`,
        commands: ["./prometheus --config.file=./prometheus.yml", "curl http://localhost:9100/metrics"],
      },
      {
        slug: "grafana-dockerme-import",
        topicSlug: "grafana-sourced",
        titleFa: "Data source و Import داشبورد — DockerMe",
        objectiveFa: "مراحل فارسی افزودن Prometheus به Grafana و import داشبورد را از DockerMe اجرا کنید.",
        theoryMd: `## منبع فارسی
[راه‌اندازی مانیتورینگ با استفاده از داکر](https://virgool.io/DockerMe/monitoring-alcoarvbnr5w)

> یکی از مزایای خوب grafana اینه که داشبوردهای آماده خیلی زیاد دارد؛ از این رو می‌توانیم با import کردن آنها به راحتی داشبورد داشته باشیم

گام‌های نقل‌شده از همان مقاله:
1) لاگین Grafana با admin و عوض کردن پسورد پیش‌فرض
2) Add data source → Prometheus → Save & Test تا پیام Data source is working
3) Import dashboard برای cadvisor و node-exporter از پوشهٔ grafana-dashboard مخزن
4) مشاهدهٔ داشبوردها از منوی Dashboards
5) بررسی alertها در داشبورد Alertmanager

> دقت کنید که حتما Data source is working را دریافت کنید.`,
        practicalMd: `تمرین عیناً از DockerMe: data source Prometheus را Save & Test کنید، دو داشبورد cadvisor و node-exporter را import کنید، سپس targets سبز Prometheus را تأیید کنید.`,
        exampleMd: `از DockerMe: Add data source → Prometheus → Save & Test → Import dashboard
منبع: https://virgool.io/DockerMe/monitoring-alcoarvbnr5w`,
        commands: ["docker-compose ps"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "پورت Node exporter از docs Grafana",
        topicSlug: "grafana-sourced",
        lessonSlug: "grafana-prometheus-official",
        path: "/tmp/day45-node.txt",
        mustContain: "9100",
        instructionsMd: `از https://grafana.com/docs/grafana/latest/getting-started/get-started-grafana-prometheus/ آدرس metrics مربوط به Node exporter محلی را بنویسید.`,
      }),
      noteExercise({
        titleFa: "Save & Test از DockerMe",
        topicSlug: "grafana-sourced",
        lessonSlug: "grafana-dockerme-import",
        path: "/tmp/day45-datasource.txt",
        mustContain: "Data source is working",
        instructionsMd: `از مقالهٔ DockerMe پیام موفقیت افزودن data source و نام دو داشبورد importشده را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "پسورد پیش‌فرض admin در Grafana",
      path: "/tmp/day45-scenario.txt",
      mustContain: "پسورد",
      incidentMd: `طبق DockerMe پس از اولین لاگین Grafana چه اقدامی برای پسورد admin لازم است؟`,
      symptomsMd: "هنوز پسورد پیش‌فرض استفاده می‌شود.",
      rootCause: "default Grafana admin password not changed after first login as required by the DockerMe guide",
      difficulty: "easy",
    }),
    exam: {
      titleFa: "آزمون روز ۴۵ — Grafana",
      questions: [
        sa("پورت metrics مربوط به Node exporter در راهنمای Grafana؟", "9100", "منبع: grafana.com get-started-grafana-prometheus", "grafana-sourced"),
        tf("طبق Grafana docs، Grafana برای Prometheus پشتیبانی out-of-the-box دارد.", true, "منبع: grafana.com", "grafana-sourced"),
        mc("پیام موفقیت data source در DockerMe؟", ["Data source is working", "404 Not Found", "Connection refused", "Permission denied"], "Data source is working", "منبع: DockerMe", "grafana-sourced"),
        mc("کدام داشبوردها در DockerMe import می‌شوند؟", ["cadvisor و node-exporter", "فقط WordPress", "فقط MySQL dump", "فقط Bind"], "cadvisor و node-exporter", "منبع: DockerMe", "grafana-sourced"),
      ],
    },
  },
  {
    dayNumber: 46,
    phaseSlug: "platform-tools",
    titleFa: "Kubernetes برای DevOps — Basics رسمی",
    objectiveFa: "اهداف و ماژول‌های Learn Kubernetes Basics و گزینه‌های learning environment را از kubernetes.io استخراج کنید.",
    topicSlugs: ["k8s-sourced"],
    lessons: [
      {
        slug: "k8s-basics-modules",
        topicSlug: "k8s-sourced",
        titleFa: "Learn Kubernetes Basics (رسمی)",
        objectiveFa: "اهداف tutorial رسمی و ماژول‌ها را دنبال کنید.",
        theoryMd: `## منبع انگلیسی
[Learn Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

Objectives (نقل قول):
> This tutorial provides a walkthrough of the basics of the Kubernetes cluster orchestration system. Each module contains some background information on major Kubernetes features and concepts, and a tutorial for you to follow along.

Using the tutorials, you can learn to:
- Deploy a containerized application on a cluster.
- Scale the deployment.
- Update the containerized application with a new software version.
- Debug the containerized application.

> With modern web services, users expect applications to be available 24/7, and developers expect to deploy new versions of those applications several times a day. … Kubernetes helps you make sure those containerized applications run where and when you want…

### Kubernetes Basics Modules (از همان صفحه)
1. Create a Kubernetes cluster
2. Deploy an app
3. Explore your app

## Tutorials index
[Tutorials | Kubernetes](https://kubernetes.io/docs/tutorials/)
نمونه‌های مرتبط با DevOps از فهرست رسمی:
- Configuring Redis Using a ConfigMap
- Example: Deploying PHP Guestbook application with Redis
- StatefulSet Basics
- Example: WordPress and MySQL with Persistent Volumes`,
        practicalMd: `تمرین از kubernetes.io Basics + Tutorials:
1) ماژول Create a cluster را انجام دهید
2) Deploy an app و Explore your app
3) از فهرست tutorials: Configuring Redis Using a ConfigMap یا Guestbook with Redis را اجرا کنید
4) Scale و Update را طبق اهداف Basics تمرین کنید`,
        exampleMd: `اهداف رسمی Basics: Deploy → Scale → Update → Debug
منبع: https://kubernetes.io/docs/tutorials/kubernetes-basics/`,
        commands: ["kubectl get nodes", "kubectl get deployments", "kubectl get pods"],
      },
      {
        slug: "k8s-learning-environment",
        topicSlug: "k8s-sourced",
        titleFa: "Learning environment (رسمی)",
        objectiveFa: "گزینه‌های تمرین محلی و playground را از صفحهٔ رسمی setup بخوانید.",
        theoryMd: `## منبع انگلیسی
[Learning environment](https://kubernetes.io/docs/setup/learning-environment/)

> If you are learning Kubernetes, you need a place to practice.

> Running Kubernetes locally gives you a safe environment to learn and experiment. You can set up and tear down clusters without worrying about costs or affecting production systems.

ابزارهای ذکرشده در همان صفحه:
- kind (Kubernetes IN Docker)
- minikube
- Online playgrounds: Killercoda
- برای production-like: kubeadm (advanced)

> Setting up a production-like cluster is significantly more complex than the learning environments described above. Start with kind, minikube, or an online playground first.

What's next (نقل قول همان صفحه):
- Follow the Hello Minikube tutorial to deploy your first application
- Learn about Kubernetes components
- Explore kubectl commands

## منبع فارسی مسیر سازمانی
[بوت کمپ DevOps آکادمی همراه](https://hamrah.academy/bootcamps/3900/)
سرفصل‌های مرتبط اعلام‌شده: راه‌اندازی محیط Kubernetes (Cluster Setup)، معماری کانتینرها و Kubernetes، به‌همراه ArgoCD و Ansible.`,
        practicalMd: `طبق Learning environment رسمی: یکی از kind یا minikube یا Killercoda را انتخاب کنید، سپس Hello Minikube را دنبال کنید.`,
        exampleMd: `گزینه‌های رسمی: kind ، minikube ، Killercoda ؛ سپس Hello Minikube
منبع: https://kubernetes.io/docs/setup/learning-environment/`,
        commands: ["minikube start", "kubectl cluster-info"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "چهار هدف Basics رسمی",
        topicSlug: "k8s-sourced",
        lessonSlug: "k8s-basics-modules",
        path: "/tmp/day46-basics.txt",
        mustContain: "Scale",
        instructionsMd: `از https://kubernetes.io/docs/tutorials/kubernetes-basics/ چهار مهارت Deploy/Scale/Update/Debug را بنویسید.`,
      }),
      noteExercise({
        titleFa: "محیط تمرین رسمی",
        topicSlug: "k8s-sourced",
        lessonSlug: "k8s-learning-environment",
        path: "/tmp/day46-env.txt",
        mustContain: "minikube",
        instructionsMd: `از https://kubernetes.io/docs/setup/learning-environment/ سه گزینهٔ kind، minikube و Killercoda را ذکر کنید و بگویید قبل از kubeadm از کجا شروع کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "شروع با kubeadm به‌جای محیط یادگیری",
      path: "/tmp/day46-scenario.txt",
      mustContain: "kind",
      incidentMd: `طبق صفحهٔ Learning environment رسمی، برای یادگیری ابتدا چه باید کرد به‌جای ساخت فوری کلاستر production-like با kubeadm؟`,
      symptomsMd: "یادگیرنده مستقیماً سراغ kubeadm چندماشینه رفته است.",
      rootCause: "official docs say start with kind, minikube, or an online playground first",
      difficulty: "easy",
    }),
    exam: {
      titleFa: "آزمون روز ۴۶ — Kubernetes منابع وب",
      questions: [
        mc("کدام هدف در Basics رسمی نیست؟", ["Compile the Linux kernel from scratch", "Deploy a containerized application", "Scale the deployment", "Debug the application"], "Compile the Linux kernel from scratch", "منبع: kubernetes.io Basics", "k8s-sourced"),
        tf("طبق Learning environment، kind برای یادگیری محلی مناسب است.", true, "منبع: kubernetes.io learning-environment", "k8s-sourced"),
        mc("کدام tutorial رسمی با Redis مرتبط است؟", ["Configuring Redis Using a ConfigMap", "فقط Sendmail", "فقط NIS", "فقط CUPS"], "Configuring Redis Using a ConfigMap", "منبع: kubernetes.io/docs/tutorials", "k8s-sourced"),
        sa("ابزار advanced برای production-like در همان صفحه چیست؟", "kubeadm", "منبع: learning-environment", "k8s-sourced"),
      ],
    },
  },
  {
    dayNumber: 47,
    phaseSlug: "platform-tools",
    titleFa: "Ansible برای DevOps — Inventory و Playbook از مستندات رسمی",
    objectiveFa: "Control node/Inventory/Managed node، ساخت inventory و اولین playbook را از Ansible Community Documentation و Red Hat docs استخراج کنید.",
    topicSlugs: ["ansible-sourced"],
    lessons: [
      {
        slug: "ansible-concepts-inventory",
        topicSlug: "ansible-sourced",
        titleFa: "Getting started — Concepts و Inventory",
        objectiveFa: "سه جزء اصلی Ansible و ساخت inventory را از مستندات community دنبال کنید.",
        theoryMd: `## منبع انگلیسی
[Getting started with Ansible](https://docs.ansible.com/projects/ansible/13/getting_started/index.html)

> Ansible automates the management of remote systems and controls their desired state.

Most Ansible environments have three main components:
- **Control node** — A system on which Ansible is installed. You run Ansible commands such as \`ansible\` or \`ansible-inventory\` on a control node.
- **Inventory** — A list of managed nodes that are logically organized.
- **Managed node** — A remote system, or host, that Ansible controls.

## Building an inventory
[Building an inventory](https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_inventory.html)

> Inventories organize managed nodes in centralized files that provide Ansible with system information and network locations. Using an inventory file, Ansible can manage a large number of hosts with a single command.

گام‌های رسمی:
1. Create \`inventory.ini\`
2. Add \`[myhosts]\` group with IP/FQDN
3. Verify: \`ansible-inventory -i inventory.ini --list\`
4. Ping: \`ansible myhosts -m ping -i inventory.ini\`

> You can create inventories in either INI files or in YAML. … INI files are straightforward … Creating an inventory in YAML format becomes a sensible option as the number of managed nodes increases.

## Red Hat docs (هم‌راستا)
[Define which hosts to manage in an inventory file](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.7/html-single/developing_automation_content/index)

> To complete the following steps, you need the IP address or fully qualified domain name (FQDN) of at least one host system. … ensure that your public SSH key is added to the \`authorized_keys\` file on each host.`,
        practicalMd: `تمرین از Ansible docs:
1) \`inventory.ini\` با گروه \`[myhosts]\` بسازید
2) \`ansible-inventory -i inventory.ini --list\`
3) \`ansible myhosts -m ping -i inventory.ini\`
4) پیش‌نیاز SSH key در authorized_keys را طبق docs رعایت کنید`,
        exampleMd: `\`\`\`bash
ansible-inventory -i inventory.ini --list
ansible myhosts -m ping -i inventory.ini
\`\`\`
منبع: docs.ansible.com getting_started inventory`,
        commands: ["ansible-inventory -i inventory.ini --list", "ansible myhosts -m ping -i inventory.ini"],
      },
      {
        slug: "ansible-first-playbook",
        topicSlug: "ansible-sourced",
        titleFa: "Creating a playbook (رسمی)",
        objectiveFa: "اولین playbook ping/debug را از مستندات community اجرا کنید.",
        theoryMd: `## منبع انگلیسی
[Creating a playbook](https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_playbook.html)

> Playbooks are automation blueprints, in YAML format, that Ansible uses to deploy and configure managed nodes.

نمونهٔ رسمی playbook.yaml:
\`\`\`yaml
- name: My first play
  hosts: myhosts
  tasks:
    - name: Ping my hosts
      ansible.builtin.ping:

    - name: Print message
      ansible.builtin.debug:
        msg: Hello world
\`\`\`

Run:
\`\`\`bash
ansible-playbook -i inventory.ini playbook.yaml
\`\`\`

از توضیح خروجی همان صفحه:
> The names that you give the play and each task. You should always use descriptive names…
> The “Gathering Facts” task runs implicitly.
> The play recap that summarizes results of all tasks in the playbook per host.

## Red Hat — Get started automating with playbooks
> An Ansible Playbook is a blueprint for automation tasks… Playbooks tell Ansible what to do on which devices.
> Playbooks are regularly used to automate IT infrastructure, such as operating systems, Kubernetes platforms, networks, security systems, and code repositories such as GitHub.

## منبع فارسی مسیر
[دوره خودکارسازی Kubernetes با GitOps — لیندکده](https://lyndakade.ir/learning/automating-kubernetes-with-gitops)
سرفصل‌های اعلام‌شده مرتبط: راه‌اندازی Ansible، مدیریت پیکربندی به‌عنوان کد با Ansible، Ansible و GitOps، راه‌اندازی AWX، استفاده از Argo CD.`,
        practicalMd: `تمرین از Creating a playbook رسمی:
1) \`playbook.yaml\` با ping و debug بسازید
2) \`ansible-playbook -i inventory.ini playbook.yaml\`
3) در recap مقدار ok را تفسیر کنید
4) نام‌های descriptive برای play/task بگذارید`,
        exampleMd: `\`\`\`bash
ansible-playbook -i inventory.ini playbook.yaml
\`\`\`
منبع: docs.ansible.com get_started_playbook`,
        commands: ["ansible-playbook -i inventory.ini playbook.yaml"],
      },
    ],
    exercises: [
      noteExercise({
        titleFa: "سه جزء Ansible از Getting started",
        topicSlug: "ansible-sourced",
        lessonSlug: "ansible-concepts-inventory",
        path: "/tmp/day47-concepts.txt",
        mustContain: "Control node",
        instructionsMd: `از https://docs.ansible.com/projects/ansible/13/getting_started/index.html سه جزء Control node، Inventory و Managed node را بنویسید.`,
      }),
      noteExercise({
        titleFa: "اولین playbook رسمی",
        topicSlug: "ansible-sourced",
        lessonSlug: "ansible-first-playbook",
        path: "/tmp/day47-playbook.txt",
        mustContain: "Hello world",
        instructionsMd: `از https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_playbook.html فرمان اجرای playbook و پیام debug رسمی را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "ping بدون SSH key",
      path: "/tmp/day47-scenario.txt",
      mustContain: "authorized_keys",
      incidentMd: `طبق پیش‌نیاز Red Hat/Ansible docs، اگر public SSH key روی host نباشد چه پیش‌نیازی نقض شده؟`,
      symptomsMd: "\`ansible myhosts -m ping\` شکست می‌خورد.",
      rootCause: "public SSH key not added to authorized_keys on managed hosts",
      difficulty: "medium",
    }),
    exam: {
      titleFa: "آزمون روز ۴۷ — Ansible منابع وب",
      questions: [
        mc("Control node کجاست؟", ["سیستمی که Ansible روی آن نصب است", "فقط etcd", "فقط Ingress", "فقط CNI"], "سیستمی که Ansible روی آن نصب است", "منبع: Ansible getting started", "ansible-sourced"),
        sa("فرمان verify inventory رسمی؟", "ansible-inventory -i inventory.ini --list", "منبع: Building an inventory", "ansible-sourced"),
        sa("فرمان اجرای playbook رسمی؟", "ansible-playbook -i inventory.ini playbook.yaml", "منبع: Creating a playbook", "ansible-sourced"),
        tf("طبق Red Hat، playbookها برای automate کردن Kubernetes platforms هم استفاده می‌شوند.", true, "منبع: Red Hat playbooks intro", "ansible-sourced"),
      ],
    },
  },
];
