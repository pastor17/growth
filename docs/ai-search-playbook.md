# AI 搜索可见性改造手册

> 面向 `irudder.me`（架构 · 创业 · 成长）
> 目标：让内容能被 ChatGPT / Perplexity / Claude / 豆包 / Kimi / 文心 / Google AI Overviews
> **抓到、读懂、引用、并回链**，同时提升传统搜索的收录量与权重。
> 生成日期：2026-09-22

---

## 一、先说清楚：AI 搜索的引用链路是怎么走的

优化前必须知道钱花在哪一环。AI 回答里出现你的链接，要同时满足三个条件：

| 环节 | 含义 | 本站改造前状态 |
|---|---|---|
| **① 可抓取** | 爬虫能进、能读、不被 robots 挡 | ⚠️ robots.txt 只有 `User-agent: *`，没有显式放行 AI 爬虫 |
| **② 可解析** | 页面有机器可读的实体与结构（谁写的、什么时候、主题是什么） | ⚠️ 只有极简 Article/WedSite JSON-LD，缺作者实体、面包屑、发布者 |
| **③ 可引用** | 有**具体结论、数据、取舍过程**，值得被摘引 | ✅ **这一条你本来就强**——这是最难的，你已经有了 |

**关键判断：你的瓶颈不在 ③，在 ① 和 ②。** 内容里大量"1.2 秒到 90 毫秒""7 种反模式""三笔账"这类具体结论，正是 AI 检索层最偏好的引用素材（模型倾向引用有数字、有代价、有反转的段落）。之前这些优势完全没有被机器读出来。

另外补充一个容易误解的点：**「AI 搜索优化」不等于「骗过 AI」**。检索层对低质内容的识别比传统 SEO 更狠——因为它直接读全文而不是看外链。所以本站"只写自己真做过的"这个定位，本身就是最正确的 AI 搜索策略，不需要为了优化而改变文风。

---

## 二、本次已完成的技术改造（10 项）

全部改动已本地构建验证：**378 个 HTML 页面、JSON-LD 100% 可解析、12382 条站内链接 0 死链**。

### 1. `robots.txt` —— 重新制定抓取策略

原文件只有一行 `User-agent: *`（等价于全放行，但无声明）。现改为显式分组声明 **38 个 UA**：

- **AI 检索类（决定能否被引用）**：`OAI-SearchBot`、`ChatGPT-User`、`PerplexityBot`、`Perplexity-User`、`ClaudeBot`、`Claude-SearchBot`、`Google-Extended`、`Applebot-Extended`
- **国内 AI**：`Bytespider`（豆包）、`Doubao`、`HunyuanBot`（元宝）、`KimiBot`、`MoonshotBot`、`ChatGLM-Spider`、`DeepSeekBot`
- **传统引擎**：Googlebot、Bingbot、Baiduspider、Sogou、360Spider、YisouSpider、DuckDuckBot、Applebot
- **明确拒绝（纯采集、无回流的第三方 SEO 数据库）**：AhrefsBot、SemrushBot、MJ12bot、DotBot、BLEXBot、DataForSeoBot

> 为什么值得显式写：一是各引擎的合规审核与日志归因更可预期；二是 `Google-Extended` 与 `Applebot-Extended` 这类**训练/grounding 开关**，不显式 Allow 会被部分场景默认保守处理。

### 2. `/llms.txt` —— 给 AI 引擎的站点内容地图（45KB）

按 [llmstxt.org](https://llmstxt.org/) 规范生成，由 Hugo 模板从内容自动构建，**不会随内容更新而过期**。包含：

- 站点定位、作者实体（含 GitHub 与邮箱）、语言、主题域
- 81 篇文章按栏目分组，**每条带一句摘要**——让检索模型不必先抓整站就能判断是否值得引用
- 6 个系列教程的适读人群与章节数
- 工具清单、可下载模板清单
- 站群导航（见第 8 项）
- 26 个权重标签（只保留收录 ≥3 篇的，过滤掉 108 个单篇薄标签）

### 3. `/llms-full.txt` —— 全站正文纯文本（290KB）

供 RAG 一次性抓取。每篇以「标题 + 原文链接 + 栏目 + 发布时间 + 摘要 + 标签」开头，再接去噪后的正文——**保留「标题-正文」归属关系**，避免切片后正文脱离语境。已排除 `templates` / `resources` / `about` 等非文章页，防止正文合集被稀释。

### 4. JSON-LD 结构化数据（重构）

从「每页一个实体的松散写法」改为 **`@graph` 知识图谱**，全站统一输出：

- `WebSite` + `Organization` + `Person`（作者实体，带 `knowsAbout` 主题声明）
- 文章页 → `BlogPosting`：`datePublished` / `dateModified` / `author` / `publisher` / `keywords` / `wordCount` / `articleSection`
- 文章页 → `BreadcrumbList`（首页 › 栏目 › 文章）
- 首页 → `ItemList`（最新 12 篇）
- 栏目/标签/系列页 → `CollectionPage` + `BreadcrumbList` + `ItemList`

> 一个关键修正：原配置把 `publisher` 写成 `Person`，**富结果校验会直接忽略它**。现改为 `Organization` 并用 `@id` 引用，作者与发布者分离——这是 E-E-A-T 的基础结构。

### 5. 内链重构：从「栏目顺排」改为「共现标签加权」

原「相关阅读」用 `where .Section` 取同栏目顺排 3 篇——语义相关性接近随机。现按 `共现标签 ×10 + 同系列 ×6 + 同栏目 ×1` 打分排序。

实测效果：`缓存雪崩复盘` 的相关阅读从随机同栏目文章，变为《缓存体系设计实战》（共享「缓存/稳定性」标签），**主题簇开始形成**，爬虫能顺链路深入相关主题。

### 6. RSS 输出（原本被显式关闭）

`disableKinds = ['RSS']` 已移除，新增自定义 `rss.xml` 模板（修正默认标题「首页 on 站名」，补全摘要/作者/分类）。更新信号对抓取频率有实际影响，也利于聚合器与 newsletter 订阅。

### 7. `rel="related"` 站群关系声明

每页 head 输出全部子域站点的 `rel="related"`，声明「同主体、主题互补」。这是站群互链的语义化版本，比裸链接更容易被正确理解。

### 8. `/hubs/` 站群导航页（新增）

原先 6 个子域只在页脚以裸链接存在，**没有任何一处说明它们是什么**。现新增导航页：每站给出 emoji、定位、主题标签、以及 2-3 句说明「什么场景该去哪个站」。

同时把页脚「友链」重命名为「站群导航」，链接带上 `title` 描述，并新增「全部站点说明」入口。

> 为什么这对权重有帮助：6 个子域互不重复、主题互补，交叉内链能让搜索引擎更快发现新内容，也让主域获得跨站主题关联。用 `/hubs/` 做中枢，比在页脚堆链接更符合语义。

### 9. `meta robots` 放宽摘要限制

文章页输出 `max-snippet:-1, max-image-preview:large, max-video-preview:-1`。

> 这一项直接决定 AI 概览能引用多长的正文片段。默认情况下引擎会保守截断，显式放开后引用窗口显著变大。非生产环境自动输出 `noindex, nofollow`，避免预览站被收录。

### 10. IndexNow 即时收录通道

- `static/ecb6acda329f4386b83be86c669ee80d.txt`（密钥文件，已随站点部署）
- `scripts/indexnow-submit.sh`：批量或精准提交 URL

```bash
# 全量提交（从 sitemap 自动拉取，按 200 条分批）
./scripts/indexnow-submit.sh

# 改完一篇文章后精准提交（更受引擎欢迎）
./scripts/indexnow-submit.sh https://irudder.me/architecture/xxx/
```

> 为什么这个最该先做：**ChatGPT Search 的网页检索主要走 Bing 索引**，而 IndexNow 是目前唯一公开的「提交即抓取」通道，效果在分钟级。比等自然重抓快得多。

---

## 三、必须由你手动完成的步骤（我做不了）

技术侧已经就绪，但**收录这件事必须由域名所有者授权**。以下按优先级排列：

### P0 · 今天就能做完（约 30 分钟，收益最大）

| # | 动作 | 具体操作 |
|---|---|---|
| 1 | **Bing Webmaster Tools** | <https://www.bing.com/webmasters> → 添加站点 `irudder.me` → 验证（推荐 DNS TXT 或导入 GSC）→ 提交 `https://irudder.me/sitemap.xml`。**优先级最高，因为直接喂 ChatGPT Search 的索引** |
| 2 | **IndexNow 立即生效** | 部署完成后运行 `./scripts/indexnow-submit.sh`，全量推送 81 篇文章 |
| 3 | **百度搜索资源平台** | <https://ziyuan.baidu.com> → 验证站点 → 提交 sitemap → 申请**普通收录 API**，拿到 token 后可做主动推送（速度快于 sitemap 轮询） |
| 4 | **Google Search Console** | 添加资源 → 验证 → 提交 sitemap → 用「网址检查」逐条请求编入索引（前 10 篇优先） |

### P1 · 本周内

| # | 动作 | 说明 |
|---|---|---|
| 5 | **GSC「效果」报告建立基线** | 记录当前展示量/点击量/平均排名。30 天后对比，否则无法判断改造是否有效 |
| 6 | **百度统计加转化目标** | 已有百度统计代码。建议加「阅读时长 > 2 分钟」与「站内搜索」作为质量指标，而不只看 PV |
| 7 | **GSC「核心网页指标」检查** | 静态站一般没问题，但要确认移动端体验没有报错 |
| 8 | **各 AI 引擎实测基线** | 在 ChatGPT / Perplexity / 豆包 / Kimi 分别问「缓存雪崩怎么复盘」「架构反模式有哪些」等 5 个问题，记录**是否提到 irudder.me**。这是当前 AI 可见性的真实基线 |

### P2 · 30 天内

| # | 动作 | 说明 |
|---|---|---|
| 9 | **子域统一验证** | 把 5 个子域也加入 GSC / Bing，`/hubs/` 的互链效果才能被观测到 |
| 10 | **持续监测 AI 引用** | 每月重跑第 8 项的 5 个问题，记录变化。**这是唯一能直接衡量「AI 搜索友好度」的指标** |

---

## 四、内容侧下一步（建议但未执行）

技术改动是**放大器**，不会凭空创造权重。以本站现状，最值得做的内容动作有两个方向：

### 方向 A：补齐「结论前置」

AI 检索层在切片时，倾向于摘取**段落开头就是结论**的内容。本站文章多为「先讲背景再给结论」的叙事结构——适合人读，但切片后结论容易丢失。

建议在每篇正文前加一个固定区块（视觉上做成浅色卡片，机器可读）：

```markdown
> **一句话结论**：缓存雪崩的根因不是缓存挂了，是 TTL 集中到期叠加了没有降级路径。
> **适用场景**：多实例 + 集中式缓存 + TTL 由统一配置生成。
> **关键取舍**：加随机抖动会牺牲一点命中率，换掉整片雪崩风险——值得。
```

### 方向 B：把「问题句式」写进标题与 H2

用户（和 AI）以问句检索。当前标题偏「陈述式命名」，可考虑在系列教程中补问句式小标题，例如把「技术选型完整方法论」的 H2 改成「选型该从哪一步开始？」「POC 要验证到什么程度才算够？」。

> 这两项属于内容改写，工作量大且改变你的行文风格，需要你确认后再动手。**建议先挑 2-3 篇高价值文章做样板**，你满意了再批量。

---

## 五、可量化目标（建议基线）

不要设「权重提升」这种不可测目标。建议用下面 4 个可观测指标：

| 指标 | 当前（待你填入实际值） | 30 天目标 | 90 天目标 |
|---|---|---|---|
| Bing 收录页面数 | 待测 | ≥ 60 / 81 | ≥ 75 / 81 |
| 百度收录页面数 | 待测 | ≥ 40 / 81 | ≥ 65 / 81 |
| GSC 日均展示量 | 待测 | 建立基线并可见增长趋势 | 较基线 ×2 |
| **AI 引用命中率**（5 个测试问题中被提及的比例） | 建议 0-1 / 5 | ≥ 2 / 5 | ≥ 3 / 5 |

> 最后一个指标才是本次改造的真正目标。前三个是过程指标，它才是结果指标。

---

## 六、附：本次改动文件清单

**新增**

- `layouts/robots.txt` — 抓取策略模板
- `layouts/_default/llmsindex.txt` → 产出 `/llms.txt`
- `layouts/_default/llmsfull.txt` → 产出 `/llms-full.txt`
- `layouts/_default/rss.xml` — 自定义 RSS
- `layouts/partials/structured-data.html` — JSON-LD 知识图谱
- `layouts/hubs/list.html` + `content/hubs/_index.md` — 站群导航页
- `data/hubs.yaml` — 站群数据（含定位、主题、简介）
- `scripts/indexnow-submit.sh` — IndexNow 提交脚本
- `static/ecb6acda329f4386b83be86c669ee80d.txt` — IndexNow 密钥

**修改**

- `hugo.toml` — 输出格式（RSS/llms）、permalinks
- `layouts/partials/head.html` — 重构 meta、robots、OG、alternates、rel=related
- `layouts/partials/footer.html` — 站群导航列
- `layouts/_default/single.html` — 共现标签加权内链
- `assets/css/main.css` — `.hub-card` 样式
- `data/columns.yaml` — 新增 hubs 栏目

**删除**

- `data/links.yaml` — 内容已迁移至 `data/hubs.yaml` 并扩展了字段

**未改动**（有意为之）

- `public/` 与 `public_dev/` — 构建产物，由 CI 重新生成
- 全部 `content/` 文章正文 — 内容改写需单独确认（见第四节）
