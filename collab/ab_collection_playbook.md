# A/B 双轴扩库 Playbook

Generated: 2026-05-31

## 目标
把 Q1 2026 全球服装、鞋履、包袋、配饰联名库从媒体发现型，升级为可持续采集型。每条记录以 A x B 为主轴：

- A：服装、鞋履、包袋或配饰品牌、零售商或明确销售服饰配件的官方店铺。
- B：品牌、设计师、艺人、IP、机构、运动组织、赛事或其他合作对象。
- 时间口径：只按正式发售或可购买日期判断是否进入 2026 Q1 主表。

## 本轮执行结果
- 主表本轮从 89 条扩展到 115 条，新增 26 条。
- 自最初 v1 起，主表从 83 条扩展到 115 条，累计新增 32 条。
- 新增可持续来源目录 21 个。
- 新增/保留 A/B 扩库候选 40 条，其中 32 条已提升进主表。

## 采集漏斗
1. A-side sweep：按 A 品牌池跑官方新闻页、品牌站、零售页和 press room。
2. B-side reverse search：按 IP、运动组织、艺人、设计师、机构反查服饰合作。
3. Press-wire sweep：Business Wire、PRNewswire、PR TIMES Japan 先抓有明确 launch/available 的候选。
4. Trade validation：FashionUnited、FashionNetwork、WWD、Drapers、TheIndustry.fashion、Licensing Magazine 校验语境。
5. Release-media supplement：Hypebeast、Highsnobiety、Sneaker News、SNKRDUNK、Sole Retriever 补 drop date 和 sneaker/streetwear。
6. Regional/social pass：日本、韩国、中国品牌官号和地区媒体补英文搜索抓不到的候选。

## 查询模板
- English: `"{brand}" ("collaboration" OR "capsule" OR "x") ("launches" OR "available" OR "drops") "2026"`
- B-side IP: `"{IP or artist}" ("apparel" OR "fashion" OR "footwear") ("collaboration" OR "capsule") "2026"`
- Japanese: `"{brand}" (コラボ OR 別注 OR カプセルコレクション) (発売 OR 販売開始) 2026`
- Korean: `"{brand}" (협업 OR 콜라보) (출시 OR 발매) 2026`
- Chinese: `"{brand}" 联名 发售 2026`

## 入主表规则
- 必须有 A 和 B。
- 必须有 Q1 正式发售或可购买日期。
- 至少一个来源能支持：系列名、A/B、品类、发售日期。
- 只有 announcement 但 Q2/Q3 发售，放 review queue。
- 只有数字皮肤或游戏虚拟服装，默认不进主表。
- A 不是服饰/鞋包/配饰品牌的官方周边，进入 `review_a_side_rule`，由人工决定是否扩 scope。

## 下一轮优先级
1. 把所有 `needs_official_source` 候选补官方/零售页。
2. 用 PR TIMES、FASHIONSNAP、WWD Japan 扫日本市场。
3. 用小红书/微博品牌官号扫中国限定联名，并用天猫/官网零售页确认是否可购买。
4. 增加奢侈品、包袋、珠宝、眼镜和儿童服饰的 A-side 品牌池，降低 sneaker/streetwear 偏重。
5. 为每条主表记录补至少一个 official 或 press release 来源，无法补的保留 medium confidence。
