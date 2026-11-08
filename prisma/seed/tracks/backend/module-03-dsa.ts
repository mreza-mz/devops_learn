import { day, goLesson, mc, noteExercise, noteScenario, sa, tf, type DaySeed } from "./helpers";

export const dsaDays: DaySeed[] = [
  day({
    dayNumber: 15,
    phaseSlug: "dsa",
    titleFa: "پیچیدگی و تحلیل الگوریتم",
    objectiveFa: "Big O، فضای کمکی و مقایسهٔ ساختارها را در پاسخ مصاحبه دقیق بیان کنید.",
    topicSlugs: ["algo-complexity"],
    lessons: [
      goLesson({
        slug: "big-o-analysis",
        topicSlug: "algo-complexity",
        titleFa: "Big O و amortized",
        objectiveFa: "worst/average/best و هزینهٔ پنهان slice/map را تحلیل کنید.",
        theoryMd: `## اهداف یادگیری
- O(1), O(log n), O(n), O(n log n), O(n²)
- amortized هزینهٔ append روی slice
- space complexity و recursion stack

## توضیح مفهوم
Big O رفتار asymptotic را می‌سنجد نه ثابت‌ها. در Go، map lookup تقریباً O(1)؛ sort.Slice O(n log n).

## کاربرد واقعی
انتخاب ساختار قبل از پیاده‌سازی؛ justify کردن redesign وقتی n از 1K به 10M می‌رود.

## اشتباهات رایج
- فرض sorted بودن map iteration
- n² پنهان در nested loop روی همان مجموعه
- optimize زودهنگام بدون profile

## سؤالات مصاحبه
1. پیچیدگی sort پیش‌فرض Go؟
2. چه زمانی hash map به‌جای slice linear search؟
3. trade-off memory vs time؟`,
        practicalMd: `برای جستجو در 1M رکورد: slice sorted vs map را از نظر زمان/حافظه مقایسه کنید.`,
        exampleMd: `\`\`\`go
// O(n) scan
for _, v := range s { if v == target { return true } }
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "تحلیل پیچیدگی حلقه",
        topicSlug: "algo-complexity",
        lessonSlug: "big-o-analysis",
        path: "/tmp/dsa-day15-complexity.txt",
        mustContain: "O(n)",
        instructionsMd: `دو حلقه تو در تو روی n عنصر بنویسید و پیچیدگی را استدلال کنید. باید شامل O(n) یا O(n²) با توجیه باشد.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "صف batch که منفجر شد",
      path: "/tmp/dsa-day15-scenario.txt",
      mustContain: "quadratic",
      incidentMd: "job هر شب ۴ ساعت طول می‌کشد؛ قبلاً ۲۰ دقیقه بود.",
      symptomsMd: "O(n²) dedupe با nested loop روی آرایه رشد یافته.",
      rootCause: "الگوریتم O(n²) بدون refactor با رشد داده",
    }),
    exam: {
      titleFa: "آزمون روز ۱۵ — پیچیدگی",
      questions: [
        mc(
          "جستجوی دودویی روی آرایه مرتب؟",
          ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          "O(log n)",
          "هر iteration نصف می‌شود.",
          "algo-complexity",
        ),
        tf("append روی slice همیشه O(1) است.", false, "گاه reallocate → amortized O(1) نه هر بار.", "algo-complexity"),
        sa("پیچیدگی معمول sort.Ints؟", "O(n log n)", "الگوریتم comparison sort.", "algo-complexity"),
        mc(
          "بهترین برای membership test تکراری؟",
          ["[]int scan", "map[int]struct{}", "sort+linear", "stack"],
          "map[int]struct{}",
          "Lookup تقریباً O(1).",
          "algo-complexity",
        ),
      ],
    },
  }),
  day({
    dayNumber: 16,
    phaseSlug: "dsa",
    titleFa: "آرایه، رشته، hash و دو اشاره‌گر",
    objectiveFa: "two pointers، sliding window و map در مسائل مصاحبه Go را حل کنید.",
    topicSlugs: ["algo-arrays"],
    lessons: [
      goLesson({
        slug: "arrays-strings-maps",
        topicSlug: "algo-arrays",
        titleFa: "Arrays, strings, hash maps",
        objectiveFa: "رشته immutable، rune و map برای frequency را بیاموزید.",
        theoryMd: `## اهداف یادگیری
- string as read-only byte slice؛ هزینه substring
- map برای count/frequency؛ struct{} برای set
- byte vs rune در Unicode

## کاربرد واقعی
dedupe، anagram، counting، cache key

## اشتباهات رایج
- concatenate string در loop با + (O(n²) allocation)
- استفاده از map بدون initialize

## سؤالات مصاحبه
1. چطور anagram با یک map حل می‌کنید؟
2. strings.Builder چه می‌دهد؟`,
        practicalMd: `مسئلهٔ two sum: map complement را طراحی کنید.`,
        exampleMd: `\`\`\`go
seen := make(map[int]int) // complement → index
\`\`\``,
      }),
      goLesson({
        slug: "two-pointers-window",
        topicSlug: "algo-arrays",
        titleFa: "Two pointers و sliding window",
        objectiveFa: "subarray با شرط و longest substring بدون تکرار را الگو بگیرید.",
        theoryMd: `## اهداف یادگیری
- دو اشاره‌گر از ابتدا/انتها یا هم‌جهت
- window با expand/shrink و invariant
- O(n) برای many substring problems

## کاربرد واقعی
rate window، log parsing، stream metrics

## اشتباهات رایج
- shrink window بدون به‌روز map frequency
- off-by-one در index

## سؤالات مصاحبه
1. تفاوت fixed vs variable window؟
2. پیچیدگی longest substring distinct؟`,
        practicalMd: `longest substring بدون تکرار با map آخرین index را شبه‌کد Go بنویسید.`,
        exampleMd: `\`\`\`go
// window [l,r] with map[rune]int last index
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی two sum",
        topicSlug: "algo-arrays",
        lessonSlug: "arrays-strings-maps",
        path: "/tmp/dsa-day16-twosum.txt",
        mustContain: "map",
        instructionsMd: `الگوریتم two sum با hash map را گام‌به‌گام بنویسید و map را ذکر کنید.`,
      }),
      noteExercise({
        titleFa: "sliding window",
        topicSlug: "algo-arrays",
        lessonSlug: "two-pointers-window",
        path: "/tmp/dsa-day16-window.txt",
        mustContain: "window",
        instructionsMd: `مسئلهٔ max sum subarray طول k را با sliding window توضیح دهید و window را در فایل بیاورید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "GC spike در concat",
      path: "/tmp/dsa-day16-scenario.txt",
      mustContain: "Builder",
      incidentMd: "API گزارش CSV string می‌سازد؛ latency p99 بالا.",
      symptomsMd: "alloc زیاد؛ loop با s += row.",
      rootCause: "string concatenation در حلقه به‌جای strings.Builder",
    }),
    exam: {
      titleFa: "آزمون روز ۱۶ — آرایه و رشته",
      questions: [
        mc(
          "two sum بهینه با؟",
          ["sort+two pointer O(n log n)", "hash map O(n)", "brute O(n³)", "stack"],
          "hash map O(n)",
          "یک pass با map complement.",
          "algo-arrays",
        ),
        tf("range روی string به rune iterate می‌کند.", true, "Unicode code point.", "algo-arrays"),
        sa("تایپ set idiomatic در Go؟", "map[T]struct{}", "حافظهٔ کمتر از bool map.", "algo-arrays"),
      ],
    },
  }),
  day({
    dayNumber: 17,
    phaseSlug: "dsa",
    titleFa: "لیست، stack، queue و مرتب‌سازی",
    objectiveFa: "ساختارهای خطی و sort/search کلاسیک را با Go پیاده و تحلیل کنید.",
    topicSlugs: ["algo-arrays", "algo-complexity"],
    lessons: [
      goLesson({
        slug: "linked-stack-queue",
        topicSlug: "algo-arrays",
        titleFa: "Linked list، stack و queue",
        objectiveFa: "لیست ساده با pointer و queue با slice ring یا chan را بشناسید.",
        theoryMd: `## اهداف یادگیری
- singly linked list؛ dummy head
- stack با slice؛ queue با slice (shift costly) یا ring buffer
- container/list در stdlib (کمتر در مصاحبه)

## کاربرد واقعی
undo stack، BFS queue، parser bracket matching

## اشتباهات رایج
- queue با slice و pop از front O(n)
- leak pointer در list اگر cycle بسازید

## سؤالات مصاحبه
1. reverse linked list iterative؟
2. valid parentheses با stack؟`,
        practicalMd: `reverse list را iterative با سه pointer بنویسید.`,
        exampleMd: `\`\`\`go
type Node struct{ Val int; Next *Node }
\`\`\``,
      }),
      goLesson({
        slug: "sort-search",
        topicSlug: "algo-complexity",
        titleFa: "Sorting و binary search",
        objectiveFa: "sort.Slice، slices.BinarySearch و مرزها را در Go 1.21+ بدانید.",
        theoryMd: `## اهداف یادگیری
- comparison sort حداقل O(n log n)
- binary search روی sorted data
- custom less func stability (sort.Slice stable نیست)

## کاربرد واقعی
ranking، pagination cursor، time-series query

## سؤالات مصاحبه
1. چه زمانی radix/count sort؟
2. off-by-one در binary search؟`,
        practicalMd: `تابع lower bound با sort.Search را برای slice int طراحی کنید.`,
        exampleMd: `\`\`\`go
sort.Slice(a, func(i, j int) bool { return a[i] < a[j] })
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "valid parentheses",
        topicSlug: "algo-arrays",
        lessonSlug: "linked-stack-queue",
        path: "/tmp/dsa-day17-stack.txt",
        mustContain: "stack",
        instructionsMd: `الگوریتم bracket matching با stack را توضیح دهید و stack را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "Queue کند در hot path",
      path: "/tmp/dsa-day17-scenario.txt",
      mustContain: "slice",
      incidentMd: "event processor CPU بالا؛ dequeue کند.",
      symptomsMd: "pop از index 0 روی slice بزرگ.",
      rootCause: "queue با slice و shift O(n) به‌جای ring buffer یا linked list",
    }),
    exam: {
      titleFa: "آزمون روز ۱۷ — ساختار خطی",
      questions: [
        mc("پیچیدگی pop از ابتدای slice؟", ["O(1)", "O(log n)", "O(n)", "O(n²)"], "O(n)", "copy elements.", "algo-arrays"),
        tf("sort.Slice در Go stable است.", false, "ترتیب equal ثابت تضمین نمی‌شود.", "algo-complexity"),
        mc("LIFO با؟", ["queue", "stack", "map", "heap min"], "stack", "آخرین وارد اول خارج.", "algo-arrays"),
        sa("تابع stdlib برای binary search روی sorted slice؟", "sort.Search", "یا slices.BinarySearch در newer Go.", "algo-complexity"),
      ],
    },
  }),
  day({
    dayNumber: 18,
    phaseSlug: "dsa",
    titleFa: "درخت، BST و heap",
    objectiveFa: "traverse درخت، BST invariant و heap برای top-K را توضیح دهید.",
    topicSlugs: ["algo-trees"],
    lessons: [
      goLesson({
        slug: "trees-bst",
        topicSlug: "algo-trees",
        titleFa: "Tree traversal و BST",
        objectiveFa: "in/pre/post-order و جستجو/درج در BST را پیاده کنید.",
        theoryMd: `## اهداف یادگیری
- recursive و iterative با stack
- BST: left < root < right
- balanced tree (AVL/red-black) مفهومی؛ Go stdlib tree ندارد

## کاربرد واقعی
فایل‌سیستم، org chart، interval tree مفهومی

## اشتباهات رایج
- BST نامتوازن → O(n) worst
- forget nil check

## سؤالات مصاحبه
1. DFS vs BFS روی tree؟
2. validate BST با range؟`,
        practicalMd: `inorder traversal iterative را طرح کنید.`,
        exampleMd: `\`\`\`go
type TreeNode struct {
  Val   int
  Left, Right *TreeNode
}
\`\`\``,
      }),
      goLesson({
        slug: "heaps",
        topicSlug: "algo-trees",
        titleFa: "Heap و container/heap",
        objectiveFa: "min/max heap با heap.Interface و پیچیدگی push/pop.",
        theoryMd: `## اهداف یادگیری
- heap array-based؛ parent/child index
- container/heap برای priority queue
- top K با heap O(n log k)

## کاربرد واقعی
scheduler، merge k sorted streams، Dijkstra

## سؤالات مصاحبه
1. چرا heap برای top-K بهتر از sort کل؟`,
        practicalMd: `k بزرگ‌ترین با min-heap اندازه k را توضیح دهید.`,
        exampleMd: `\`\`\`go
import "container/heap"
// implement heap.Interface on IntHeap
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "سطح‌بندی درخت",
        topicSlug: "algo-trees",
        lessonSlug: "trees-bst",
        path: "/tmp/dsa-day18-level.txt",
        mustContain: "BFS",
        instructionsMd: `level-order traversal را با queue (BFS) توضیح دهید و BFS را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "BST degenerate",
      path: "/tmp/dsa-day18-scenario.txt",
      mustContain: "balanced",
      incidentMd: "in-order search در job scheduling کند شده.",
      symptomsMd: "داده sorted insert شده؛ عمق = n.",
      rootCause: "BST بدون balance روی ورودی sorted",
    }),
    exam: {
      titleFa: "آزمون روز ۱۸ — درخت",
      questions: [
        mc("inorder BST چه خروجی می‌دهد؟", ["random", "sorted values", "reverse only", "BFS order"], "sorted values", "نمایش مرتب.", "algo-trees"),
        tf("heap push/pop هر دو O(log n).", true, "sift up/down.", "algo-trees"),
        mc("top K با n بزرگ؟", ["sort O(n log n)", "min-heap size K", "map only", "stack"], "min-heap size K", "کارآمدتر برای K کوچک.", "algo-trees"),
      ],
    },
  }),
  day({
    dayNumber: 19,
    phaseSlug: "dsa",
    titleFa: "گراف — BFS و DFS",
    objectiveFa: "نمایش گراف، shortest path unweighted و cycle detection را حل کنید.",
    topicSlugs: ["algo-trees"],
    lessons: [
      goLesson({
        slug: "graph-bfs-dfs",
        topicSlug: "algo-trees",
        titleFa: "Graph BFS/DFS",
        objectiveFa: "adjacency list با map یا slice و visited set را پیاده کنید.",
        theoryMd: `## اهداف یادگیری
- adjacency list: map[int][]int
- BFS برای shortest path در unweighted
- DFS برای connected components / cycle (directed)

## کاربرد واقعی
dependency resolution، network reachability، maze

## اشتباهات رایج
- visited را mutate اشتباه
- stack overflow recursion عميق

## سؤالات مصاحبه
1. topological sort کجا؟
2. BFS با queue پیاده در Go؟`,
        practicalMd: `مسیر کوتاه از s تا t با BFS را شبه‌کد بنویسید.`,
        exampleMd: `\`\`\`go
graph := map[int][]int{1: {2, 3}, 2: {4}}
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "cycle detection",
        topicSlug: "algo-trees",
        lessonSlug: "graph-bfs-dfs",
        path: "/tmp/dsa-day19-cycle.txt",
        mustContain: "DFS",
        instructionsMd: `تشخیص cycle در directed graph با DFS و سه رنگ را خلاصه کنید؛ DFS را بنویسید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "deadlock وابستگی",
      path: "/tmp/dsa-day19-scenario.txt",
      mustContain: "cycle",
      incidentMd: "deploy serviceها hang در waiting.",
      symptomsMd: "گراف وابستگی حلقه دارد.",
      rootCause: "cycle در dependency graph شناسایی نشده",
    }),
    exam: {
      titleFa: "آزمون روز ۱۹ — گراف",
      questions: [
        mc("کوتاه‌ترین مسیر unweighted؟", ["DFS", "BFS", "sort", "heap only"], "BFS", "اولین بار رسیدن کوتاه‌ترین است.", "algo-trees"),
        tf("DFS همیشه shortest path می‌دهد.", false, "فقط BFS در unweighted.", "algo-trees"),
        sa("ساختار دادهٔ رایج sparse graph؟", "adjacency list", "فشرده برای یال کم.", "algo-trees"),
        mc("topological sort نیاز به؟", ["DAG", "complete graph only", "tree only", "no edges"], "DAG", "grap directed acyclic.", "algo-trees"),
      ],
    },
  }),
  day({
    dayNumber: 20,
    phaseSlug: "dsa",
    titleFa: "Recursion، DP و Greedy",
    objectiveFa: "درخت بازگشت، memoization و انتخاب greedy درست را در مصاحبه نشان دهید.",
    topicSlugs: ["algo-dp"],
    lessons: [
      goLesson({
        slug: "recursion-dp",
        topicSlug: "algo-dp",
        titleFa: "Dynamic programming",
        objectiveFa: "overlapping subproblems، memo/tabulation و state design.",
        theoryMd: `## اهداف یادگیری
- top-down memo با map
- bottom-up table
- classic: coin change, LIS, knapsack 0/1

## کاربرد واقعی
pricing combo، resource allocation، edit distance

## اشتباهات رایج
- state ناقص → wrong answer
- stack overflow در recursion عمیق

## سؤالات مصاحبه
1. تفاوت memo و tabulation؟
2. space optimize DP یک بعدی؟`,
        practicalMd: `Fibonacci با memo vs iterative را مقایسه کنید.`,
        exampleMd: `\`\`\`go
func fib(n int, memo map[int]int) int {
  if v, ok := memo[n]; ok { return v }
  // ...
}
\`\`\``,
      }),
      goLesson({
        slug: "greedy",
        topicSlug: "algo-dp",
        titleFa: "Greedy و trade-offs",
        objectiveFa: "وقتی greedy optimal است و counterexample بسازید.",
        theoryMd: `## اهداف یادگیری
- greedy choice property
- interval scheduling، Huffman مفهومی
- اثبات با exchange argument (سطح مصاحبه)

## کاربرد واقعی
task scheduling، compression

## اشتباهات
- greedy روی coin change دلخواه (غلط)

## سؤالات مصاحبه
1. مثالی که greedy برای coin change fail می‌کند؟`,
        practicalMd: `intervals merge را با sort by start توضیح دهید.`,
        exampleMd: `\`\`\`go
sort.Slice(intervals, func(i,j int) bool { return intervals[i][0] < intervals[j][0] })
\`\`\``,
      }),
    ],
    exercises: [
      noteExercise({
        titleFa: "طراحی state DP",
        topicSlug: "algo-dp",
        lessonSlug: "recursion-dp",
        path: "/tmp/dsa-day20-dp.txt",
        mustContain: "memo",
        instructionsMd: `مسئلهٔ coin change را با state (amount) و memo توضیح دهید؛ memo را ذکر کنید.`,
      }),
    ],
    scenario: noteScenario({
      titleFa: "stack overflow در ETL",
      path: "/tmp/dsa-day20-scenario.txt",
      mustContain: "iterative",
      incidentMd: "parsr recursive روی JSON عمیق crash می‌کند.",
      symptomsMd: "runtime: stack overflow.",
      rootCause: "recursion بی‌حد بدون تبدیل به iterative یا limit depth",
    }),
    exam: {
      titleFa: "آزمون روز ۲۰ — DP",
      questions: [
        mc("DP مناسب وقتی؟", ["no overlapping subproblems", "optimal substructure + overlap", "only greedy", "graph without edges"], "optimal substructure + overlap", "تعریف کلاسیک DP.", "algo-dp"),
        tf("greedy همیشه برای minimum coins optimal است.", false, "بستگی به denominators.", "algo-dp"),
        mc("کاهش space در knapsack 1D؟", ["iterate dp از پشت به جلو", "BFS", "map only", "heap"], "iterate dp از پشت به جلو", "جلوگیری از reuse همان iteration.", "algo-dp"),
        sa("کلید memoization در Go؟", "map", "معمولاً map[int]int یا struct key.", "algo-dp"),
      ],
    },
  }),
];
