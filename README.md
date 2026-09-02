# 架构 · 创业 · 成长 —— 个人站点

> 人设定位：**架构专家 ｜ 互联网创业者 ｜ 职业生涯导师**
> 分享真实踩坑、架构实战、创业思考与 AI 落地，只输出可复用经验，不贩卖焦虑。

基于 [Hugo](https://gohugo.io) 构建的纯静态个人站点（**内联主题**，无外部主题依赖），通过 **GitHub Actions 自动部署到 GitHub Pages**。站点骨架与做法参考了同工作区下的 `kids-stories` 项目。

---

## 站点栏目

| 栏目 | slug | 定位 |
|------|------|------|
| 首页 | `/` | slogan + 精选内容 + 栏目导航 |
| 架构实战 | `/architecture/` | 高并发、稳定性、故障复盘、架构取舍（生产真实经验） |
| AI 专题 | `/ai/` | 项目拆解、行业剖析、AI 系统架构、AI 时代职业 |
| 工具与工作流 | `/tools/` | 实战工具总览表（4 类）+ 工具专题文章 |
| 成长体系 | `/growth/` | 5 个系列教程目录：工程技术 / AI 工程 / 软技能 / 思维认知 / 职业路径 |
| 创业复盘 | `/startup/` | 项目复盘、商业思考、团队管理、独立项目 |
| 项目作品 | `/projects/` | 脱敏项目案例、开源、分享记录（人设佐证） |
| 关于我 | `/about/` | 时间线、价值观、联系方式 |
| 资源下载 | `/resources/` | 6 份 Markdown 模板汇总 |

> 栏目元数据集中在 `data/columns.yaml`（名称、emoji、配色、描述），改动后首页/页脚/列表页自动生效。

---

## 目录结构

```
diunilaomei-site/
├── hugo.toml                  # 站点配置（baseURL / taxonomy / params）
├── archetypes/default.md      # 新文章模板（含写作规范提示）
├── content/                   # 内容：各栏目 _index.md + 文章
│   ├── architecture/  ai/  tools/  growth/  startup/  projects/
│   ├── about/  resources/  _index.md
├── data/                      # 结构化元数据
│   ├── columns.yaml           # 栏目（导航/首页卡片/页脚）
│   ├── series.yaml            # 成长体系：系列与章节目录（状态：done/draft/planned）
│   ├── tools.yaml             # 工具总览表（用途/适用/不适用/坑/备选）
│   ├── templates.yaml         # 可下载模板清单
│   └── timeline.yaml          # 关于我-职业生涯时间线
├── layouts/                   # 内联主题（首页/列表/详情/分类页/partials）
├── assets/
│   ├── css/main.css           # 样式（变量化，改 :root 可整体换肤）
│   └── js/main.js             # 交互（移动端菜单、进度条、字号、回到顶部）
├── static/
│   ├── favicon.svg
│   └── templates/*.md         # 6 份可下载模板（资源下载页数据源）
└── .github/workflows/hugo.yml # GitHub Pages 自动部署
```

---

## 本地运行

前置：Hugo **Extended** 版本（与 CI 保持一致为 **v0.150.0**）。

```bash
# 方式一：如果你在用 Homebrew
brew install hugo
# 方式二：从 GitHub Releases 下载 hugo_extended_0.150.0_<平台>.tar.gz

# 启动开发服务器（热重载）
hugo server -D
# 若 baseURL 带子路径（如 /REPO_NAME/），访问 http://localhost:1313/REPO_NAME/
# 想直接以根路径访问：hugo server -D --baseURL http://localhost:1313/

# 生成静态站点（产物输出到 public/，已 gitignore）
hugo --minify
```

---

## 新增一篇文章

### 1. 用模板生成

```bash
hugo new content architecture/my-slug.md
# 或放入其他栏目目录：ai/ tools/ growth/ startup/ projects/
```

### 2. 填写 front matter

```yaml
---
title: "文章标题"
slug: "my-slug"          # URL 唯一标识（英文小写连字符）
date: 2026-09-02         # ⚠️ 不能晚于「今天」——未来日期会被 Hugo 隐藏
draft: false             # 发布前改为 false
series: []               # 属于哪个系列 id（见 data/series.yaml）
weight: 1                # 系列内章节顺序
tags: ["标签A", "标签B"]  # 跨栏目检索用；中文优先，英文会自动小写
summary: "一句话简介（≤60字）"
featured: false          # true 会进入首页「精选文章」
author: "diunilaomei"
coverEmoji: ""           # 留空则用栏目 emoji
---
```

### 3. 正文约定

- 栏目内互链、模板下载链接用**相对路径**：`[故障复盘模板](../templates/postmortem-template.md)`、`[工具与工作流](../tools/)`（不要用 `/` 开头的绝对路径，会破坏 GitHub Pages 子路径）。
- 二级标题 `##` 自动进入章节目录。
- 多写「我在 XX 项目遇到 XX 问题，我是怎么做的，踩了什么坑」；公司项目务必脱敏。

### 4. 发布一篇新的「系列章节」

1. 按上面新建文章，`series` 填对应系列 id，`weight` 填章节序号。
2. 同步把 `data/series.yaml` 里对应章节的 `status` 从 `planned` 改为 `done`（并核对 `slug` 一致）。
3. 成长体系总目录页、系列详情页会自动更新。

---

## 维护工具总览与成长目录（数据驱动）

- **工具表格**：编辑 `data/tools.yaml`，每个工具填 `name/purpose/scenario/notFor/pitfall/alternative`。只收录亲身用过的，宁缺毋滥。
- **成长体系总目录**：编辑 `data/series.yaml`，章节状态 `done`（已发布）/ `draft`（撰写中）/ `planned`（规划中）。
- **模板资源**：新增文件放 `static/templates/`，然后在 `data/templates.yaml` 加一条记录。

---

## 部署到 GitHub Pages（自动化推送）

站点通过 GitHub Actions 构建部署，**你只需 git push，部署自动完成**。

> 本仓库与 `kids-stories` 一样采用**双分支**结构：
> - `growth` 分支 → 存放本站点（由 GitHub Pages 部署）
> - `master` 分支 → 只放一个与站点不相干的 `readme.md`
>
> 站点地址：**https://irudder.me/**

### 首次部署（一次性）

1. `hugo.toml` 已配置为真实地址（`baseURL = https://irudder.me/`）；如改仓库/域名，记得同步修改。
2. 推送两个分支：

   ```bash
   git remote add origin https://github.com/pastor17/growth.git
   git push -u origin growth     # 站点
   git push -u origin master     # 不相干的 README
   ```

3. 打开仓库 **Settings → Pages**，把 **Source** 从「Deploy from a branch」改为 **GitHub Actions**。
4. 推送后，**Actions** 页会自动运行 `Deploy Hugo site to Pages`；几分钟后访问 `https://irudder.me/`。

> 之后每次 `git push origin growth` 都会自动重新构建并发布。也可以在 Actions 页手动触发（`workflow_dispatch`）。

### 自定义域名（可选）

在 `static/` 下新建 `CNAME` 文件，写入你的域名（如 `example.me`），并在域名服务商处把该域名 CNAME 到 `<用户名>.github.io`。参考同工作区 `kids-stories` 的做法。

---

## 上线前自查清单

- [ ] 核对 `hugo.toml`：`baseURL` 已是 `https://irudder.me/`；`author` / `email` 按需修改
- [ ] `data/timeline.yaml` 改成真实经历（脱敏）
- [ ] 示例文章保留或替换为你的真实经历（不要虚构项目）
- [ ] `data/tools.yaml` 只保留你真正用过的工具
- [ ] 通读一遍文章内的示例链接是否与实际路径一致
- [ ] `hugo --minify` 本地构建通过后再推送

---

## 版权

© 2026 diunilaomei · 架构 · 创业 · 成长。站内文字均为原创，转载或商用请注明出处。
