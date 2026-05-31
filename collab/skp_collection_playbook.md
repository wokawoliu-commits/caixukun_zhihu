# 联名 SKP 信息获取 Playbook

Generated: 2026-05-30

## 目标

把系列级联名记录补成可信的商品级核心 SKP。这里的 SKP 是本项目的“商品级核心款式”，不拆颜色、尺码、库存状态，也不把同一商品的不同尺码当成多行。

本 playbook 基于八个已验证 case 总结：

- `BALENCIAGA I NBA Collaboration`
- `Red Wing x HUMAN MADE The Future Is in the Past`
- `Stella McCartney x Jeff Koons Limited-Edition Capsule`
- `SKIMS x Team USA Milano Cortina 2026 Capsule`
- `Snow Goose by Haider Ackermann x Canada Goose Drop 2`
- `Moncler + Rick Owens Spring/Summer 2026`
- `Nike x NIGO Air Force 3 Final Chapter`
- `AQUA x Wuthering Heights Collection`

核心判断：

- A 必须是服装、鞋履、包袋或配饰品牌，B 是联名方。所有 SKP 都要回到 A/B 关系验证。
- `product_url` 只能是官方商品页、官方商品详情页、官方商品卡片链接，或授权零售商品页。
- 媒体页、杂志页、博客页只能做 `source_url` 或发现线索，不能直接当 `product_url`。
- 每条 SKP 应尽量有自己的商品图；不要把同一张系列海报、媒体头图或 `og:image` 复制给所有商品。
- 搜索引擎用于发现入口，官网/官方零售页用于验证入库；不要把“猜官网路径”当成主策略。

## 八个基准案例

| Case | 正确入口 | 主要抓取方式 | 最重要经验 |
|---|---|---|---|
| Balenciaga x NBA | Balenciaga 官方 collection/search/product 页 | 商品卡片、商品 href、官方 DAM 图片、商品页验证 | 官网列表页就是 SKP 源，不需要从媒体页绕路。 |
| Red Wing x HUMAN MADE | HUMAN MADE 官方新闻页和商品详情页 | 官方新闻页商品清单、`MORE INFO` 链接、Shopify 商品页 | 媒体页只做线索，购买入口要追到官方站。 |
| Stella McCartney x Jeff Koons | Stella McCartney 官方 collection 页 | 官方 collection 商品卡、Demandware 商品页、价格和图片 | 不能因为初始来源是媒体，就跳过 A 品牌官网搜索。 |
| SKIMS x Team USA | SKIMS canonical collection 页 | JSON-LD `CollectionPage` / `ItemList`、分页、商品页、Shopify CDN 图 | 区域页可能为空，要尝试 canonical URL 和分页，不能只看一个地区 storefront。 |
| Canada Goose x Haider Ackermann | Canada Goose 官方 Snow Goose shop/story 页 | 搜索引擎发现官方入口、官方商品卡、官方图片、官方商品 URL | 活动名短 slug 比 A/B 长 slug 更重要；普通 fetch 被 429 时要记录浏览器可验证官方页。 |
| Moncler x Rick Owens | Moncler 官方 special projects 页 | 搜索引擎发现、媒体商品 URL 反推父专题页、JSON-LD Product | 官方专题页可能不在 `/collections`；从子商品页反推父页是关键补漏动作。 |
| Nike x NIGO | Nike release info + SNKRS `/launch/t/` 商品页 | `site:nike.com/launch/t` 搜索、SNKRS 商品页 title/价格/SKU/图 | 不要只搜完整标题；Nike 售卖页常在 SNKRS launch path，不在 `/collections`。 |
| AQUA x Wuthering Heights | Bloomingdale's Carousel editorial + XAPI 商品数据 | `/c/editorial/carousel/`、`Shop the Collection`、`/xapi/discover/v1/product` | 百货官方 editorial 页可能是商品入口；商品页可能 403，但页面内商品 ID 可通过官方 XAPI 解析。 |

## 入口发现优先级

联名 SKP 的最大风险不是验证，而是漏掉真正的官方入口。第一步必须改成“搜索引擎发现优先”：

1. 先跑外部搜索引擎，优先用域名限定查询：
   - `site:{A品牌官网域名} "{系列短名}" "{B联名方}"`
   - `site:{A品牌官网域名} "{A品牌}" "{B联名方}" shop`
   - `site:{A品牌官网域名} "{A品牌}" "{B联名方}" collection`
   - `site:{B品牌官网域名} "{A品牌}" "{B联名方}" product`
2. 再跑普通组合查询：
   - `"{A品牌}" "{B联名方}" official collection`
   - `"{A品牌}" "{B联名方}" shop`
   - `"{系列名}" "{A品牌}" buy`
3. 搜索结果只用于发现候选 URL，不直接入库。候选必须再打开验证：
   - 域名是 A/B 官方站或授权零售站。
   - 页面有商品卡、商品名、价格、商品图、商品详情链接、JSON-LD Product / ItemList 之一。
   - 页面文本或商品 URL 能回到 A/B 联名语境。
4. 路径推测降级为补充动作：
   - `/collections/{slug}`
   - `/collection/{slug}`
   - `/shop/{slug}`
   - `/stories/collection/{slug}.html`
   - `/special-projects/{slug}`
   - `/launch/t/{slug}`
   - `/c/editorial/carousel/{slug}/`
   - `/shop/fashion-lookbooks-videos-style-guide/{slug}`
   - 站内 search URL
5. 若搜索结果发现官方页但普通 HTTP fetch 被 401/403/429 拦截，应记录为 `official_discovered_fetch_blocked`，进入浏览器验证或人工复核，不要误判为“未找到官网 SKP”。
6. 若搜索 provider 返回 `TypeError`、空结果或限流，要自动换 provider 或降低并发重试。失败类型应写成 `search_provider_failed`，不能和“官网不存在”混在一起。

### 搜索 query 生成规则

生成 query 时不要只用完整系列名。必须同时生成短 campaign slug：

- 完整 A/B：`{A} {B}`
- A/B x 格式：`{A} x {B}`、`{A} for {B}`
- 系列短名：从 `by`、`x`、`+`、`drop`、年份之前截取，例如 `Snow Goose by Haider Ackermann x Canada Goose Drop 2` 要生成 `Snow Goose`
- partner 短名：例如 `Rick Owens`、`Jeff Koons`
- 售卖词：`shop`、`collection`、`special project`、`product`、`capsule`
- 站点路径词：例如 `site:nike.com/launch/t`、`site:bloomingdales.com/c/editorial/carousel`
- 售卖系统词：例如 `SNKRS`、`launch`、`The Carousel`、`Shop the Collection`、`Add To Bag`
- SKU / 款号：例如 `HQ7525-410`、`NIKE AIR FORCE 3 LOW SP`

### 站点 profile

通用 A/B query 之外，重点品牌和零售商必须带站点 profile：

| 站点 | 高优先级路径 / query | 解析重点 |
|---|---|---|
| Nike | `site:nike.com/a`、`site:nike.com/launch/t`、`SNKRS`、`SKU` | release info 是入口，`/launch/t/` 才常是售卖单品页。 |
| HUMAN MADE | `site:humanmade.jp news`、`site:humanmade.jp products`、Shopify search | 新闻页常列发售商品和商品详情页。 |
| Bloomingdale's | `site:bloomingdales.com/c/editorial`、`The Carousel`、`Shop the Collection`、`/shop/product/?ID=` | editorial 页抽商品 ID，再调用官方 XAPI。 |
| Macy's / Bloomingdale's 系 | `/c/editorial/`、`/shop/fashion-lookbooks-videos-style-guide/`、`/xapi/discover/v1/product?productIds=` | 直接 PDP 可能 403，不代表无商品证据。 |
| PUMA | `site:us.puma.com/us/en/pd`、`site:us.puma.com/us/en/search` | 搜索页候选多，必须用 B 方 token 过滤。 |

### 父专题页反推规则

如果媒体页或旧 SKP 行中已经出现官方商品 URL，必须从子商品 URL 反推父级官方入口：

- `https://www.moncler.com/en-us/special-projects/moncler-rick-owens/{product}.html`
  - 反推：`https://www.moncler.com/en-us/special-projects/moncler-rick-owens`
- `https://brand.com/collections/{collection}/products/{product}`
  - 反推：`https://brand.com/collections/{collection}`
- `https://brand.com/us/en/pr/{product}.html`
  - 反推同站搜索或上级 shop/collection 页，不能只停在媒体页。

父页反推后的页面要按官方入口处理：如果能抽到商品卡/JSON-LD，即可升级为官网 SKP。

## Case 7: Nike x NIGO

官方入口：

- `https://about.nike.com/en-GB/newsroom/releases/nike-x-nigo-partnership-launches-with-exclusive-air-force-iii-and-apparel-collection`
- `https://www.nike.com/launch/t/nike-x-nigo-mens-souvenir-jacket-web-only-na`

这个 case 是“Nike release info + SNKRS 单品页”型。release info 证明发售渠道和上下文，但商品级 SKP 往往在 Nike SNKRS `/launch/t/`，而不是 `/collections` 或普通 `/w?q=`.

有效 query：

- `site:nike.com/a "Nigo" "Air Force 3"`
- `site:nike.com/a "Nigo" "humanmade.jp"`
- `site:nike.com/launch/t "Nike x NIGO"`
- `site:nike.com/launch/t "Air Force 3 Low x NIGO"`
- `site:humanmade.jp "NIGO × NIKE" "Air Force 3"`
- `site:humanmade.jp "NIGO" "NIKE" "Pendleton"`
- `site:humanmade.jp "NIKE AIR FORCE 3 LOW SP"`

采集技巧：

- 不要只搜索 `Final Chapter`，官网页面标题可能只写 `Nike x NIGO`、`Air Force 3 Low x Nigo`、`Souvenir Jacket` 或 SKU。
- 搜索结果本身如果是 `/launch/t/`，要直接当候选商品页验证，不要只把它当 source page 再等页面内出现商品卡。
- 商品名可从 SNKRS title 取；价格、SKU 和图片可从页面 HTML、meta 或 embedded data 提取。

## Case 8: AQUA x Wuthering Heights

官方入口：

- `https://www.bloomingdales.com/c/editorial/carousel/aqua-wuthering-heights/`
- `https://www.bloomingdales.com/shop/aqua/aqua-x-wuthering-heights?id=1298995&cm_kws=aqua`

这个 case 是“百货官方 editorial + XAPI 商品数据”型。AQUA 是 Bloomingdale's 自有/独家品牌语境，普通搜索容易跑偏到乐队、水务、无关品牌，因此必须限定 Bloomingdale's 和 The Carousel。

有效 query：

- `site:bloomingdales.com "AQUA x Wuthering Heights"`
- `site:bloomingdales.com "AQUA" "Wuthering Heights"`
- `site:bloomingdales.com "Bloomingdale's x Wuthering Heights"`
- `site:bloomingdales.com "The Carousel" "Wuthering Heights"`
- `site:bloomingdales.com/shop/product "AQUA x \"Wuthering Heights\""`
- `site:bloomingdales.com "Shop the Collection" "Wuthering Heights"`

采集技巧：

- `/c/editorial/carousel/...` 是官方入口，不要因为它不是 `/collections` 就丢弃。
- 页面中的 `Shop the Collection`、`Brand/AQUA`、`/shop/product/?ID=` 都是强商品入口信号。
- Bloomingdale's PDP 可能对脚本返回 403；这时应从 editorial HTML 抽 `data-id`，调用官方前端同源接口 `/xapi/discover/v1/product?productIds=...`。
- XAPI 返回的 `detail.brand`、`detail.subBrand`、`detail.name`、`identifier.productUrl`、`imagery.urlTemplate`、`pricing.price.tieredPrice` 可作为商品名、商品 URL、商品图和价格证据。
- 过滤时必须同时命中 `AQUA` 和 `Wuthering Heights`，避免把 slip、Lollia、TokyoMilk 等同一 pop-up 下的非 AQUA 商品误收。

## Case 1: Balenciaga x NBA

官方入口：

- `https://www.balenciaga.com/en-en/balenciaga-%7C-nba-collaboration`
- `https://www.balenciaga.com/en-en/search?q=nba`

这个 case 是“官方商品列表型”。官方 collection 和 search 页面直接暴露商品卡片、商品 href、商品 ID 和商品图。

有效信号：

- 商品 URL 中包含联名关键词和款号，例如 `balenciaga-%7C-nba-collaboration-...-864902TQS041070.html`。
- 商品图来自 Balenciaga 官方 DAM/CDN。
- 每个商品卡片有不同缩略图。
- 商品页可以打开并返回官方商品详情。

采集技巧：

- 先抓官方 collection 页，再用站内搜索页补漏。
- 商品名优先来自卡片 title、商品详情页 title、结构化数据；其次可从 href slug 反推。
- `product_url` 填官方商品页。
- `source_url` 填官方 collection/search 页。
- `image_url` 填商品卡片图或商品详情页主图。
- 价格如果官方 HTML 中没有公开出现，可以留空；只要商品页、商品名和商品图可验证，仍可标为 `verified_product`。

反误收规则：

- 不要把 collection 页的社交分享图当成所有商品图。
- 不要把没有 NBA / Balenciaga collaboration 语境的搜索结果纳入。

## Case 2: Red Wing x HUMAN MADE

媒体线索：

- `https://www.ramp.space/en/artikel-blog/red-wing-x-human-made-exclusive-collection/`

官方入口：

- `https://www.humanmade.jp/en/news/human-made-red-wing-2025-dec.html`
- `https://humanmade.jp/products/XX30GD025` 等 HUMAN MADE 官方商品详情页

这个 case 是“媒体发现，官方新闻页闭环型”。Ramp 页面能发现联名，但它只是介绍页；真正可作为 SKP 证据的是 HUMAN MADE 官方新闻页和官方商品详情链接。

有效信号：

- 官方新闻页明确发售日期、销售渠道、商品名、价格和商品详情链接。
- 商品详情链接指向 HUMAN MADE 官方站。
- 商品图来自 HUMAN MADE 官方 CDN。
- 商品名包含 A/B 关系，例如 `HUMAN MADE x RED WING 8INCH MOC`。

采集技巧：

- 媒体页只用于发现官方入口，不直接生成 `product_url`。
- 从媒体页提取“购买入口 / official store / online store / more info”等线索。
- `product_url` 填官方商品详情页，不填 Ramp 文章页。
- `source_url` 优先填 HUMAN MADE 官方新闻页，Ramp 可作为辅助来源。
- 官方新闻页如列出商品名、价格、详情链接和图片，即可生成 `verified_product`。

反误收规则：

- 不要把 Ramp 文章页批量填入所有 SKP 的 `product_url`。
- 不要把媒体头图复制给 5 个商品。
- 如果只剩媒体列名、没有官方商品详情链接，则降级为 `press_listed`。

## Case 3: Stella McCartney x Jeff Koons

官方入口：

- `https://www.stellamccartney.com/us/en/women/stella-mccartney-x-jeff-koons`

这个 case 是“Stella-like 错误模式”的代表：明明 A 品牌官网有公开售卖 collection，但如果采集策略从媒体页出发、没有主动跑 A 品牌官网，就会误判成“仅媒体列名”。

有效信号：

- 官方 collection 页直接展示商品卡片。
- 商品详情页在 Stella McCartney 官方域名下。
- 商品页有商品名、价格、官方图片。
- 商品名和 URL 均包含 `Jeff Koons` 语境。

采集技巧：

- 不管初始来源是不是媒体，都必须跑一轮 A 品牌官网路径。
- 从 `sales_channels`、`official_url`、品牌域名、系列名生成 collection/search 候选。
- 对官方 collection 页解析商品卡片和商品详情链接。
- 商品图优先取商品详情页主图或卡片图。
- 价格只填官方页给出的发售价。

反误收规则：

- 不要因为 ELLE / WWD 等媒体先出现，就停止官方站搜索。
- 搜索页中出现商品信号时，必须进一步打开商品详情页验证。
- 如果搜索结果是无关商品，即使来源页文本有 `Jeff Koons`，也不能通过。

## Case 4: SKIMS x Team USA

官方入口：

- `https://skims.com/collections/skims-for-team-usa`
- `https://skims.com/en-sg/collections/skims-for-team-usa`

这个 case 是“canonical collection + 区域页差异 + JSON-LD 分页型”。区域页可能显示无货或空列表，但 canonical collection 页仍公开暴露商品级 ItemList 和分页。

有效信号：

- canonical collection 页存在 JSON-LD `CollectionPage` / `ItemList`。
- ItemList 中有商品 `name`、`url`、`image`。
- 页面存在 `rel=next` 或 cursor 分页。
- 商品页在 SKIMS 官方域名下，图片来自 Shopify CDN。

采集技巧：

- 同时尝试区域 URL 和 canonical URL。
- 不要只看一个地区 storefront；区域页为空不代表官网无 SKP。
- 解析 JSON-LD `CollectionPage` / `ItemList`。
- 跟随分页，注意 `?cursor=`、`?page=` 这类 query 不能在去重时被误删。
- JSON-LD 的 `image` 可能是字符串、数组或对象，要递归取 `url` / `contentUrl`。
- 商品页验证通过后再写入 SKP。

反误收规则：

- 不要把区域页“当前无商品”直接判为无官网 SKP。
- 不要在 URL 去重时把分页参数剥掉，否则只会抓第一页。
- 不要把 collection 的第一张海报图复制给所有商品。

## 标准两步制

### Step 1: 确认官方入口

每条联名先找官方入口，再找商品：

1. 读取已有 `official_url`。
2. 从 `source_urls` 中筛掉媒体域名，保留品牌/零售域名。
3. 从 `sales_channels` 抽取品牌站域名。
4. 根据 A/B 生成候选 slug：
   - `{A}-for-{B}`
   - `{A}-x-{B}`
   - `{A}-{B}`
   - 系列名 slug
5. 依次尝试：
   - 官方 collection 页
   - 官方 search 页
   - 官方 news / press 页
   - 授权零售 collection 页

只靠媒体页时，状态应是 `media_only`，不能直接认为完成官网 SKP。

### Step 2: 确认官方售卖 SKP

只有出现商品级证据，才写 SKP：

1. 从官方入口提取候选商品。
2. 打开候选 `product_url`。
3. 验证商品页本身命中 A/B 语境，或商品名 / URL 命中 A/B 语境。
4. 提取商品名、商品类型、价格、币种、商品图。
5. 去重后写入 `skp_products_q1_2026.csv`。

如果只找到系列说明，没有商品页、商品卡片或官方商品清单，则进入 `skp_completion_queue_q1_2026.csv`。

## 页面类型判断

| 页面类型 | 可生成 SKP | 说明 |
|---|---:|---|
| 官方商品详情页 | 是 | 最强证据，可直接作为 `product_url`。 |
| 官方 collection/search 页 | 是，但需验证 | 可抽商品卡片，但必须打开商品页复核。 |
| 官方新闻/发售说明页 | 视情况 | 若列出商品名并给官方详情链接，可生成 `verified_product`。 |
| 授权零售商品页 | 是 | 可写 `retailer_listed` 或按项目规则写 `verified_product`，但要标明来源。 |
| 媒体文章页 | 否 | 只做 `source_url` 或线索；明确列名时可 `press_listed`。 |
| 分类页 / 搜索页泛结果 | 否 | 只能产生候选，不能直接作为最终 `product_url`。 |

## 字段填写规则

### `product_name`

优先级：

1. 官方商品详情页结构化数据。
2. 官方商品卡片 title / aria-label / visible text。
3. 官方新闻页商品清单。
4. 商品 URL slug 反推，但必须由商品页验证。

不要从泛文案中硬猜商品名。

### `product_url`

允许：

- 官方商品详情页。
- 官方商品卡片 href。
- 官方新闻页中 `MORE INFO` / `SHOP NOW` / `PRODUCT DETAILS` 指向的详情链接。
- 授权零售商品详情页。

不允许：

- 媒体文章页。
- 官方 collection/search 页。
- 分类页、购物袋页、店铺首页、lookbook 页。
- 无法打开或需登录/验证码的页面。

### `source_url`

用于证明 SKP 来源，可以是：

- 官方商品页。
- 官方 collection/search 页。
- 官方新闻页。
- 授权零售页。
- 明确列出商品名、价格或发售日期的行业媒体。

### `image_url`

优先级：

1. 商品详情页主图。
2. 商品卡片缩略图。
3. 官方新闻页中紧邻商品名的图片。
4. 授权零售商品图。
5. 媒体页中明确对应单个商品的图片。

不应使用：

- 同一张系列头图填给多个不同商品。
- `og:image` 批量作为商品图。
- 人物大片、lookbook 图、氛围图，除非明确对应单个商品且没有更好图。

### `price` / `currency`

- 只填官方或授权零售发售价。
- 不使用二级市场价格。
- 价格缺失时可以留空；不要推测。
- 有价格必须有币种。

## 技术提取清单

### 结构化数据

重点解析：

- `script[type="application/ld+json"]`
- `@type: Product`
- `@type: CollectionPage`
- `ItemList` / `itemListElement`
- `offers.price`
- `offers.priceCurrency`
- `image`

注意：

- `image` 可能是字符串、数组或对象。
- ItemList 可能只有 URL，没有 name；此时可从 URL slug 生成候选名，但仍需打开商品页验证。

### 商品卡片

常见信号：

- `href` 包含 `/products/`、`.html`、`/p/`、商品 ID。
- `aria-label`、`title`、`alt` 包含商品名。
- 卡片附近有价格、图片、颜色信息。
- Demandware / Shopify / Salesforce Commerce Cloud 页面常把商品数据嵌在 HTML 或 JSON 片段中。

### 分页

必须处理：

- `<link rel="next">`
- `?cursor=`
- `?page=`
- Shopify collection pagination

去重时不要把分页 query 误删。SKIMS 的第二页商品就是这个坑。

### 图片

提取顺序：

1. JSON-LD image。
2. 商品卡片 `<img src>` / `data-src` / `srcset`。
3. 商品页 `og:image`。
4. 页面嵌入 JSON 中的 `images.large.url`、`image.url`。
5. 官方 CDN 中与商品 ID / slug 匹配的图片。

## 拒收规则

以下情况不得进入真实 SKP 表：

- `product_url` 是媒体页、collection 页、搜索页、分类页、购物袋页。
- 商品页本身不含 A/B 语境，商品名和 URL 也不含 A/B 语境。
- 来源页是搜索页，但候选商品卡片不含联名关键词。
- 多个商品共用同一张系列图，却被标成商品图。
- 价格来自 StockX、GOAT、eBay 等二级市场。
- 页面需要登录、验证码或绕过安全机制才能访问。
- 只宣布 Q1，但正式售卖在 Q2。

## 证据状态

| `evidence_status` | 使用条件 |
|---|---|
| `verified_product` | 官方商品页、官方商品卡片、官方新闻页带官方详情链接，且商品页/商品名/URL 命中 A/B 关系。 |
| `retailer_listed` | 授权零售页可验证商品名、图、价格，但不是品牌官网。 |
| `press_listed` | 行业媒体明确列出商品名，但没有官方或授权零售商品页。 |
| `series_only_unresolved` | 只有系列级信息，无法确认商品级清单。 |

## 推荐采集流程

1. 锁定 A/B：确认 A 是服饰/鞋履/包袋/配饰品牌，B 是品牌、人物、IP、机构或运动组织。
2. 找官方域名：从 `official_url`、`source_urls`、`sales_channels`、品牌名生成候选。
3. 跑官方入口：collection、search、news、press、canonical、区域 URL 都要尝试。
4. 解析候选商品：JSON-LD、商品卡片、官方新闻 item list、商品 href。
5. 打开商品页验证：状态码、商品名、A/B token、图片、价格。
6. 写入 SKP：一款一行，不拆颜色尺码；`skp_id` 按 `Q12026-xxx-SKP-001` 编号。
7. 图片检查：每条尽量有商品图；重复图降级或待补。
8. 失败入队：记录已查 URL、失败原因、下一步。

## 机器提取器实现建议

- URL 先分类：`official_collection`、`official_product`、`official_news`、`authorized_retail`、`media_article`、`search_or_category`。
- 对 `media_article` 只抽线索，不直接写 `product_url`。
- 对 `search_or_category` 只生成候选，候选必须进入商品页复核。
- 对 collection 页允许用页面 A/B 语境兜底，但最终商品 URL 仍需是商品页。
- 对 search 页不允许只靠页面 A/B 语境兜底；商品卡片或商品页必须命中 A/B。
- 保留分页 query，尤其是 `cursor` 和 `page`。
- 图片字段只接受真实 URL，过滤 `[object Object]`、空字符串、分类页 URL。
- 对同一 `collab_id + product_name + price + product_url` 去重。

## 快速判断口诀

- 能进入官方或授权商品详情，才是 `product_url`。
- 能证明商品存在，才是 `source_url`。
- 能看清当前商品，才是 `image_url`。
- 媒体页先当线索，官网页再当证据。
- 区域页为空，不等于 canonical 官网无货。
- 搜索页有结果，不等于商品属于这次联名。
