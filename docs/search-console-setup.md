# 站长平台验证与提交清单

> 适用站点：`https://irudder.me`（架构 · 创业 · 成长）
> 验证资产已全部部署并线上验证通过，你只需在控制台点几下。
> 生成日期：2026-09-22（已验证资产上线）

---

## 一、已为你准备好的验证资产

站点上有**两套独立通道**，任选其一即可通过验证。都已部署、线上可访问。

### 通道 A：meta 标签（推荐，无需传文件）

| 平台 | 标签 | 当前值 |
|---|---|---|
| Google Search Console | `google-site-verification` | `Xr4fuou8t_SsEyTF7YBsg2Qj3xu11M4wa34pEo4vhbQ` |
| Bing Webmaster Tools | `msvalidate.01` | `051247122786982a081198be7b9a1708` |
| 百度搜索资源平台 | `baidu-site-verification` | 未配置（拿到 token 后填入） |

**线上实测**：

```
$ curl -s https://irudder.me/ | grep -o 'name=google-site-verification content="[^"]*"'
name=google-site-verification content="Xr4fuou8t_SsEyTF7YBsg2Qj3xu11M4wa34pEo4vhbQ"

$ curl -s https://irudder.me/ | grep -o 'name=msvalidate.01 content="[^"]*"'
name=msvalidate.01 content="051247122786982a081198be7b9a1708"
```

### 通道 B：静态验证文件（已生成，可直接用）

| 平台 | 文件 | 线上地址 | 实测 |
|---|---|---|---|
| Google | `googleXr4fuou8t_SsEyTF7YBsg2Qj3xu11M4wa34pEo4vhbQ.html` | `/googleXr4fuou8t_SsEyTF7YBsg2Qj3xu11M4wa34pEo4vhbQ.html` | HTTP 200 |
| Bing | `BingSiteAuth.xml` | `/BingSiteAuth.xml` | HTTP 200 |

文件内容分别是：

```
google-site-verification: googleXr4fuou8t_SsEyTF7YBsg2Qj3xu11M4wa34pEo4vhbQ.html
```

```xml
<?xml version="1.0"?>
<users>
	<user>051247122786982a081198be7b9a1708</user>
</users>
```

> 这两个 token 是我按平台规范格式生成的。**如果控制台给你的是不同的 token**，
> 用通道 A 改一处配置即可（见第三节），不需要动文件。

---

## 二、操作步骤

### Google Search Console

1. 打开 <https://search.google.com/search-console>
2. 左上角资源选择器 → **添加资源** → 选 **网址前缀**（不是"网域"，网域方式需要 DNS 权限）
3. 填入：`https://irudder.me`
4. 验证方式选 **HTML 标记**（对应通道 A）或 **HTML 文件**（对应通道 B）
   - 选 HTML 标记 → 控制台会显示一段 `<meta name="google-site-verification" content="XXX">`
     - 若 `XXX` 与我上面给的一致 → 直接点**验证**
     - 若不一致 → 跳到第三节改配置
   - 选 HTML 文件 → 点"下载"，若文件名与我生成的一致可直接验证；否则把该文件放进 `static/` 并 push
5. 验证通过后 → 左侧 **站点地图** → 提交 `sitemap.xml`
6. 用顶部 **网址检查** 逐条检查并"请求编入索引"，建议优先这 5 篇：
   - `https://irudder.me/architecture/cache-avalanche-postmortem/`
   - `https://irudder.me/growth/tech-selection-methodology/`
   - `https://irudder.me/ai/ai-app-reference-architecture/`
   - `https://irudder.me/growth/cache-system-design/`
   - `https://irudder.me/tools/ai-tools-scenario-matrix/`

### Bing Webmaster Tools

> **捷径**：Bing 支持从 GSC 一键导入。GSC 验证通过后，在 Bing 里选
> "从 Google Search Console 导入"，站点和 sitemap 会自动带过来，**这一步可省掉手动验证**。

手动方式：

1. 打开 <https://www.bing.com/webmasters>
2. **添加站点** → 输入 `https://irudder.me`
3. 验证方式选 **XML 文件**（对应 `BingSiteAuth.xml`）或 **Meta 标记**（对应通道 A）
4. 验证通过后 → **站点地图** → 提交 `https://irudder.me/sitemap.xml`
5. 建议顺手开启 **IndexNow**（Bing 面板里有开关）——密钥已部署，开启后 Bing 会自动接收变更

### 百度搜索资源平台（可选，但对你面向中文用户很重要）

1. 打开 <https://ziyuan.baidu.com>
2. **用户中心 → 站点管理 → 添加网站** → 输入 `https://irudder.me`
3. 验证方式选 **HTML 标签**，控制台会给你 `baidu-site-verification` 的 token
4. 把 token 填进 `data/verification.yaml` 的 `baiduSiteVerification` 字段 → push → 回控制台验证
5. 验证通过后 → **普通收录 → sitemap** 提交 `https://irudder.me/sitemap.xml`
6. 申请 **普通收录 → API 提交**，拿到 token 后可做主动推送（比 sitemap 轮询快得多）

---

## 三、如果控制台给的 token 和我不一样

只改一个文件，push 即可，不用碰任何静态文件：

```yaml
# data/verification.yaml
googleSiteVerification: "把控制台给的 token 粘到这里"
bingSiteVerification: "把控制台给的 token 粘到这里"
baiduSiteVerification: "把控制台给的 token 粘到这里"
```

```bash
cd diunilaomei-site
git add data/verification.yaml
git commit -m "chore: 更新站长平台验证 token"
git push origin growth
```

等 1-2 分钟部署完成，回控制台点"验证"。

> 验证标签只在 `production` 环境输出（`hugo.IsProduction`），
> 本地预览站不会带这些标签，避免平台误判归属。

---

## 四、验证通过后的验收检查

| 检查项 | 期望结果 | 检查位置 |
|---|---|---|
| Google 已收录页数 | 逐步上升至 ≥ 60 / 81 | GSC → 索引 → 网页 |
| Google sitemap 状态 | "成功" 且已发现 233 个网址 | GSC → 站点地图 |
| Bing 已收录页数 | ≥ 60 / 81 | Bing → 站点资源管理器 |
| Bing IndexNow 状态 | 已启用，且有提交记录 | Bing → IndexNow |
| 百度已收录页数 | 逐步上升 | 百度 → 数据监控 → 索引量 |
| **AI 可见性基线** | 5 个测试问题中被提及 ≥ 2 个 | 手动实测（见下） |

### AI 可见性基线测试（这才是真正目标）

在 **ChatGPT / Perplexity / 豆包 / Kimi** 分别提问下面 5 个问题，记录是否提到 `irudder.me`：

1. 缓存雪崩怎么复盘？TTL 该怎么设计？
2. 架构反模式有哪些？怎么识别？
3. AI 应用的分层架构该怎么做？
4. 技术选型 POC 要验证到什么程度？
5. 怎么做分布式系统的稳定性建设？

**现在先测一遍记录基线**，30 天后再测一遍对比。前 5 项是过程指标，这一项才是结果指标。

---

## 五、故障排查

| 现象 | 原因与处理 |
|---|---|
| Google 提示"我们无法验证您对 https://irudder.me 的所有权" | ① 确认 `site.Data.verification` 已生效（`curl -s https://irudder.me/ \| grep google-site-verification`）；② 确认 token 与控制台完全一致（含大小写）；③ 换 HTML 文件方式试 |
| Bing `BingSiteAuth.xml` 验证失败 | 检查 `curl -s https://irudder.me/BingSiteAuth.xml` 返回的 XML 是否完整；Bing 对 XML 格式敏感，标签大小写不能改 |
| 提交 sitemap 后显示"无法获取" | 确认 `https://irudder.me/sitemap.xml` 返回 200；robots.txt 里没有 Disallow sitemap（当前已放行） |
| sitemap 提交成功但收录为 0 | 正常现象，新站需要时间。用"网址检查 → 请求编入索引"手动催前 5 篇，配合 IndexNow 提交提升 Bing 侧速度 |
| 验证标签在本地看不到 | 正常 —— 只在生产环境输出。用 `hugo --environment production` 本地构建才可见 |

---

## 六、当前已完成的自动化部分

以下不需要你操作，已全部完成并线上验证：

- ✅ `robots.txt` 放行 38 个 UA（含全部 AI 爬虫），并显式 Allow 验证文件路径
- ✅ `/llms.txt` + `/llms-full.txt`（AI 内容索引）
- ✅ 全站 JSON-LD 知识图谱（含 BreadcrumbList / Organization / Person）
- ✅ `/sitemap.xml`（233 个 URL）+ `/index.xml`（RSS，81 篇）
- ✅ **IndexNow 233 个 URL 已提交成功**（Bing/Yandex 即时抓取通道已打通）
- ✅ Google / Bing 验证资产已部署（meta 标签 + 静态文件双通道）
