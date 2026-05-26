const categories = [
  { id: "all", label: "全部线索" },
  { id: "problem", label: "教材问题" },
  { id: "method", label: "二年级方法" },
  { id: "principle", label: "改写原则" },
  { id: "constraint", label: "现实约束" },
  { id: "excluded", label: "低相关排除" },
];

const entries = [
  {
    category: "problem",
    score: 5,
    title: "哪个旧版本的小学数学教材好啊？现在的教材实在是没法学了。",
    url: "https://www.zhihu.com/question/637089603/answer/1920828294036698206",
    votes: 9,
    tags: ["新旧教材对比", "知识碎片化", "生活化情境"],
    summary:
      "这条最像策划方案里的问题框架：现行教材有生活化、探究式和现代内容更新的优点，但争议集中在知识碎片化、基础训练不足、城乡情境脱节、教材简略导致自学困难。",
    takeaways: [
      "改写不能简单复古，应该保留生活化和探究活动，同时补足明确结论、步骤和练习梯度。",
      "情境要普适，不能只默认城市家庭和资源充足学校。",
      "二年级内容需要把“算理演示”和“计算熟练”放在同一条学习路径里。",
    ],
    detail:
      "适合作为方案的总论依据：它同时承认新教材优势和痛点，避免策划只停留在吐槽。可转化为“保留探究，补齐自学路径”的改写定位。",
  },
  {
    category: "problem",
    score: 4,
    title: "小学数学教材是用北师大的好还是人教版的好？",
    url: "https://www.zhihu.com/question/273521699/answer/1506053780",
    votes: 59,
    tags: ["版本对比", "概念讲解", "编排顺序"],
    summary:
      "回答者对北师大版评价偏负面，认为部分教材概念没有讲清楚、知识点跨度大、编排顺序弱。虽然观点情绪较强，但能反映家长对“概念清楚”和“顺序稳定”的需求。",
    takeaways: [
      "改写时应先给出单元知识地图，说明每一课在整册里的位置。",
      "概念引入要减少跳跃，不要只靠课堂讲解补全。",
    ],
    detail:
      "这类材料适合当作用户声音，不宜单独作为事实判断。它提示的关键不是某版本优劣，而是家长会敏感地感受到“跨度”和“顺序”。",
  },
  {
    category: "problem",
    score: 5,
    title: "如何评价网络观点「论教材的『防自学』设计」？",
    url: "https://www.zhihu.com/question/665966876/answer/2024486071786897412",
    votes: 336,
    tags: ["防自学", "例题断层", "过程缺失"],
    summary:
      "这条把大量用户的不满归纳为四类：逻辑链断裂、知识点碎片化、关键步骤省略、例题与课后题难度断层。观点尖锐，但非常贴合“孩子自己看不懂课本”的诉求。",
    takeaways: [
      "每个新概念要回答：为什么学、怎么来的、能解决什么问题。",
      "例题要拆出关键思考步骤，避免从条件直接跳到答案。",
      "课后练习要有坡度，从模仿到变式再到真实应用。",
    ],
    detail:
      "这条可作为“学生版教材”的反向需求清单。策划里可以把它翻译成四个设计原则：链条完整、结构可见、步骤透明、梯度连续。",
  },
  {
    category: "constraint",
    score: 4,
    title: "如何评价网络观点「论教材的『防自学』设计」？",
    url: "https://www.zhihu.com/question/665966876/answer/3620162359",
    votes: 394,
    tags: ["资源假设", "小班教学", "教师依赖"],
    summary:
      "回答者认为一些教材思路过于超前，默认教师经验丰富、小班授课、资源充足、家长有时间配合。如果作为普适教材，单靠教材端拔高可能造成学习落差。",
    takeaways: [
      "改写版要降低对教师、家长和学校资源的隐性依赖。",
      "活动设计要给低资源家庭也能执行的替代方案。",
      "不要只写开放探究，也要提供标准化的自学支架。",
    ],
    detail:
      "这条能提醒团队：适合小学生的教材，不只是内容难度合适，还包括学习条件假设要现实。",
  },
  {
    category: "problem",
    score: 3,
    title: "为什么数学书步骤不编写详细一点，让我们不再问“怎么来的”这样的问题？",
    url: "https://www.zhihu.com/question/634381823/answer/3327588729",
    votes: 140,
    tags: ["步骤详略", "算法理解", "家长分歧"],
    summary:
      "回答用方程移项举例，指出步骤写详细有时会被认为繁琐。它提示改写时要区分“算理展示”和“熟练算法”，不能只追求长篇解释。",
    takeaways: [
      "同一知识点可以分两层：先看懂算理，再给出熟练写法。",
      "页面上要清楚标注“理解用”和“熟练用”，避免家长觉得绕。",
    ],
    detail:
      "这条是少见的反向提醒：并不是步骤越多越好。二年级改写要用图、实物和流程减少文字负担。",
  },
  {
    category: "problem",
    score: 4,
    title: "为什么当今数学教材写的跟天书一样，根本看不懂？",
    url: "https://www.zhihu.com/question/389151826/answer/126171831403",
    votes: 3872,
    tags: ["自学困难", "数形结合", "老教材"],
    summary:
      "高赞回答集中表达了对教材“讲不明白”的不满，并提到小学阶段数学学习要重视数形结合，避免孩子早早失去信心。",
    takeaways: [
      "改写页要把抽象数字和图形、实物、动作绑定。",
      "错误提示要保护信心，用“下一步怎么想”替代简单判错。",
    ],
    detail:
      "适合支撑“视觉化、操作化”的产品方向，但该回答也混有资料推荐，需要筛掉教辅推广成分。",
  },
  {
    category: "problem",
    score: 4,
    title: "为什么当今数学教材写的跟天书一样，根本看不懂？",
    url: "https://www.zhihu.com/question/389151826/answer/2564199774",
    votes: 5617,
    tags: ["大白话", "篇幅", "讲明白"],
    summary:
      "回答者将老教材的优势概括为“大白话”和“不吝啬文字篇幅”。它对应的是一种清晰朴素的表达风格，而不是堆砌练习。",
    takeaways: [
      "正文语言应该像给孩子讲清楚，不像给教师列提纲。",
      "关键页可以适当增加解释篇幅，但要配图和分步，不做长段灌输。",
    ],
    detail:
      "适合转成文风规范：短句、动作动词、一步一个问题。",
  },
  {
    category: "method",
    score: 5,
    title: "小学数学知识点有哪些？",
    url: "https://www.zhihu.com/question/1923880294206936456/answer/1985460027578942001",
    votes: 1,
    tags: ["一二年级", "乘法口诀", "具象化", "十进制"],
    summary:
      "这条虽然赞同少，但对二年级非常有用：一二年级重在100以内加减、乘除入门、乘法口诀、应用题画图、十进制和进退位算理。",
    takeaways: [
      "乘法口诀要让孩子自己做表，理解乘法是重复加法。",
      "应用题要鼓励画图，先把问题具象化再计算。",
      "进位退位要让孩子摆小棒或等价操作，再进入口算熟练。",
    ],
    detail:
      "这是二年级改写的可执行素材库。可以直接转化为“每课一操作”“每题一图示”“每单元一张关系图”。",
  },
  {
    category: "method",
    score: 4,
    title: "小学数学家庭作业生活化的设计策略？",
    url: "https://www.zhihu.com/question/64999551/answer/2807434064",
    votes: 0,
    tags: ["生活化作业", "动手操作", "多元评价"],
    summary:
      "回答提出趣味作业、多元作业、拓展作业和生活实践。虽然像论文式回答，但里面的“图形设计、制作收纳盒、找生活中的数字”等例子可转为课本活动。",
    takeaways: [
      "二年级活动可以做成低门槛家庭任务：找数字、记表格、辨方向、认时间。",
      "作业不只巩固知识，还要收集学习证据，帮助孩子表达思路。",
    ],
    detail:
      "可用于策划“课本之外的一页”：家庭可完成、材料简单、第二天可分享。",
  },
  {
    category: "method",
    score: 3,
    title: "80年代小学数学教材，比现在的小学教材难吗？",
    url: "https://www.zhihu.com/question/656170731/answer/3502666159",
    votes: 13,
    tags: ["计算训练", "应用题", "老教材经验"],
    summary:
      "回答者回忆老教材更偏计算和应用题训练，提到珠算和大量练习带来的计算能力提升。它提醒改写版不能只做情境故事，也要保留基本功训练。",
    takeaways: [
      "口算训练要少量高频，避免一次性堆量引发厌烦。",
      "应用题可以从简单真实情境逐步过渡到更绕的关系题。",
    ],
    detail:
      "这条适合补充“基础训练不足”的问题背景，但不宜把珠算等旧经验照搬为改写策略。",
  },
  {
    category: "principle",
    score: 4,
    title: "教材编写需要遵循哪些原则？",
    url: "https://www.zhihu.com/question/513364026/answer/2929525966",
    votes: 3,
    tags: ["编写原则", "基础性", "内在逻辑"],
    summary:
      "回答列出教材编写的通用原则：科学性、基础性与适用性、知识内在逻辑与教学法统一、理论实践统一、编排形式有利于学习、注意纵横联系。",
    takeaways: [
      "策划方案可以把这些原则变成评审表。",
      "每个改写样章都应检查：科学准确、孩子能学、逻辑清楚、能联系生活。",
    ],
    detail:
      "这条内容短，但适合放在方案的“评审标准”部分。",
  },
  {
    category: "principle",
    score: 4,
    title: "如果让你来编排义务教育阶段至高中的数学课本，你会怎么编排？",
    url: "https://www.zhihu.com/question/348694238/answer/1918301767516546190",
    votes: 55,
    tags: ["结构化", "逻辑自洽", "顾名思义"],
    summary:
      "《悟数学》作者强调系统化、结构化、逻辑自洽、概念不回避。虽然主要面向中学，但“顾名思义”和“知识脉络”很适合转为小学教材改写原则。",
    takeaways: [
      "小学版本不应引入过多术语，但术语一旦出现就要顾名思义。",
      "章节之间要有连续脉络，避免孩子只记住孤立技巧。",
    ],
    detail:
      "可借鉴的是结构观，不是具体内容难度。二年级仍要坚持动作、图像和语言先行。",
  },
  {
    category: "principle",
    score: 4,
    title: "如果让你来编排义务教育阶段至高中的数学课本，你会怎么编排？",
    url: "https://www.zhihu.com/question/348694238/answer/2033155577749189163",
    votes: 2,
    tags: ["少而精", "简而明", "避免碎片化"],
    summary:
      "回答引用并展开“少而精、简而明、抓住本质、避免知识碎片化”的教材观。对小学改写尤其有参考价值。",
    takeaways: [
      "每课只抓一个核心本质，不把活动、技巧和拓展堆在一起。",
      "章节名和页内标题要直接暴露学习目标。",
    ],
    detail:
      "适合形成样章设计准则：一页一个任务，一课一个核心关系，一单元一张结构图。",
  },
  {
    category: "constraint",
    score: 4,
    title: "如何看待小学教材改版？",
    url: "https://www.zhihu.com/question/373400335/answer/1947247002296522185",
    votes: 21,
    tags: ["认知规律", "流程化", "体系化"],
    summary:
      "回答从一年级家长视角解释教材变化，认为破十法、凑十法等程序化方法是为了建立逻辑流程和数与物的对应关系。",
    takeaways: [
      "改写不要把程序化方法简单删掉，而要解释它们服务的算理和数感。",
      "对家长要提供“为什么这样教”的旁注，减少误解。",
    ],
    detail:
      "这条能平衡“教材变复杂”的吐槽：有些看似绕的方法，可能是在帮助孩子建立可迁移流程。",
  },
  {
    category: "constraint",
    score: 3,
    title: "如何看待小学教材改版？",
    url: "https://www.zhihu.com/question/373400335/answer/3592338129",
    votes: 1650,
    tags: ["应试", "应用", "跨学科"],
    summary:
      "回答观点比较激烈，提出教材存在防自学、防学霸、防应用的问题，同时谈到未来考试更重阅读、应用、思维和跨学科。",
    takeaways: [
      "改写应服务真实理解和迁移，而不仅是刷题。",
      "二年级的跨学科不用宏大，可从读题、表达、记录、观察生活开始。",
    ],
    detail:
      "可作为趋势型线索，但商业资料引流较多，使用时只取需求信号。",
  },
  {
    category: "principle",
    score: 3,
    title: "有没有一套数学教材或教辅，由一个人编写，贯通小学初中内容，一种风格一贯到底？",
    url: "https://www.zhihu.com/question/2003107248780640592/answer/2003338331631674305",
    votes: 84,
    tags: ["统一风格", "贯通体系", "参考书"],
    summary:
      "回答推荐伍鸿熙 K12 数学教育丛书等参考，核心诉求是贯通小学到中学、风格稳定、讲清数学本质。",
    takeaways: [
      "团队改写应先统一文风、图示规范和例题结构。",
      "可建立“术语、图形、问题链、练习坡度”四类统一模板。",
    ],
    detail:
      "适合提醒团队：多作者改写最容易风格散，必须先有样章标准。",
  },
  {
    category: "excluded",
    score: 2,
    title: "关于人教版二年级数学教材编纂问题的一些看法，你怎么看？",
    url: "https://www.zhihu.com/question/550914666/answer/1998455241054654698",
    votes: 0,
    tags: ["直搜命中", "教辅引流", "排除"],
    summary:
      "标题高度相关，但内容实际是二年级下册预习和思维训练资料引流，不适合作为教材改写依据。",
    takeaways: [
      "后续搜索不能只看标题，需要打开正文核验。",
      "二年级直搜结果噪声很高，建议依赖相邻议题归纳需求。",
    ],
    detail:
      "这是本次检索最典型的假阳性。",
  },
  {
    category: "excluded",
    score: 2,
    title: "如何领取人教版二年级数学上册电子课本（最新高清版）？",
    url: "https://www.zhihu.com/question/1923020264574292125/answer/1923028574983681100",
    votes: 3,
    tags: ["电子课本", "低相关", "排除"],
    summary:
      "这是二年级上册直接关键词命中，但核心是领取电子课本，不讨论改写诉求或解决思路。",
    takeaways: [
      "可记录为直搜样本，但不纳入策划论据。",
    ],
    detail:
      "同类命中还有多个 0 赞回答，基本都是电子课本或资料分发。",
  },
];

let selectedCategory = "all";
let query = "";

const filters = document.querySelector("#filters");
const results = document.querySelector("#results");
const resultTitle = document.querySelector("#resultTitle");
const resultCount = document.querySelector("#resultCount");
const searchInput = document.querySelector("#searchInput");

function entryMatches(entry) {
  const inCategory = selectedCategory === "all" || entry.category === selectedCategory;
  const haystack = [
    entry.title,
    entry.summary,
    entry.detail,
    entry.tags.join(" "),
    entry.takeaways.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return inCategory && haystack.includes(query.trim().toLowerCase());
}

function categoryCount(id) {
  if (id === "all") return entries.length;
  return entries.filter((entry) => entry.category === id).length;
}

function renderFilters() {
  filters.innerHTML = categories
    .map(
      (category) => `
        <button class="filter-button ${category.id === selectedCategory ? "is-active" : ""}" data-category="${category.id}">
          <span>${category.label}</span>
          <span>${categoryCount(category.id)}</span>
        </button>
      `
    )
    .join("");
}

function renderResults() {
  const visible = entries.filter(entryMatches);
  const title = categories.find((category) => category.id === selectedCategory)?.label || "全部线索";

  resultTitle.textContent = title;
  resultCount.textContent = `${visible.length} 条`;

  if (!visible.length) {
    results.innerHTML = `<div class="empty">没有匹配结果，换一个关键词试试。</div>`;
    return;
  }

  results.innerHTML = visible
    .map(
      (entry, index) => `
        <article class="result-card" style="--score: ${entry.score}; animation-delay: ${Math.min(index * 35, 280)}ms">
          <div class="priority-bar" aria-hidden="true"></div>
          <div class="result-main">
            <div class="result-meta">
              <span class="pill">${categoryLabel(entry.category)}</span>
              <span class="pill secondary">${entry.votes} 赞同</span>
              <span class="pill secondary">相关度 ${entry.score}/5</span>
            </div>
            <h3>${entry.title}</h3>
            <p>${entry.summary}</p>
            <ul>
              ${entry.takeaways.map((item) => `<li>${item}</li>`).join("")}
            </ul>
            <div class="detail">
              <p>${entry.detail}</p>
              <div class="result-meta">
                ${entry.tags.map((tag) => `<span class="pill secondary">${tag}</span>`).join("")}
              </div>
            </div>
            <div class="result-actions">
              <a class="source-link" href="${entry.url}" target="_blank" rel="noreferrer">打开知乎原文</a>
              <button class="toggle-button" data-toggle="${index}" type="button">展开细节</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function categoryLabel(id) {
  return categories.find((category) => category.id === id)?.label || id;
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  renderFilters();
  renderResults();
});

results.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle]");
  if (!button) return;
  const card = button.closest(".result-card");
  const isOpen = card.classList.toggle("is-open");
  button.textContent = isOpen ? "收起细节" : "展开细节";
});

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderResults();
});

renderFilters();
renderResults();
