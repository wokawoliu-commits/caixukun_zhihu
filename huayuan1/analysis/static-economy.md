# 「我的花园世界」静态经济数值分析

**本报告分析的是安装包内置 430.0.44 基线，不能当作手机当前 460.0.18 热更新或服务器结算的实测结果。** 主调查已在手机入口观察到 `V460.0.18-prod`；本报告未执行目标 JS/APK，未请求游戏服务器。

已解释种植与采收的状态和参数、花卉等级模板、花艺与订单的计算结构；没有取得当前生效的逐花数值表。因此，具体花种的最优收益、各等级成本曲线、全局增益百分比、花架每件售卖秒数仍未知。

## 1. 身份、版本与复核方式

- 主包：`evidence/wdhysj_huawei_1.2.1.apk`，用户手机包名由主调查确认 `cn.wdhysj.huawei`。SHA-256：`fc1557788b126b1e7cffc83899a67b8ad5a3473a56df3749e8734284e4e7e02e`。
- 对照包：`evidence/wdhysj_official.apk`，官网 1.3.3。SHA-256：`80f6cfa10f5f51b7980fce7f5404b497fa28c0bde329dc2e6eef702b211adef4`。
- 两包 `assets/data/index/index-gn-qd-430.0.44.json` 等 manifest 的 `platformMap["*"].moduleVerMap.game` 均为 `18280`，其 JSC 对应 `9a3e2`。本分析选 `game.18280.js`；不混用同时携带的 `game.d3af8.js`。
- 对两包 66 项 `assets/data` 下 JavaScript、index manifest、resources 配置逐项计算 SHA-256，全部相同。**这只建立内置相关成员的字节等价，不建立线上版本等价。** 完整对比：`tools/static-economy/package-code-comparison.json`。
- 原始游戏 JS：`extracted/assets/data/src/assets/scripts/frameworks/game/bin/game.18280.js`。格式化只改善可读性：`tools/static-economy/game.18280.pretty.js`，以下行号都引用该文件。
- 便于审阅的源码摘录：`tools/static-economy/source-excerpts.md`，E01–E21；身份与配置搜索证据：`tools/static-economy/identity-and-config-search.json`；复核脚本：`tools/static-economy/collect_evidence.py`。
- REA JavaScript 分析 Evidence：`ev_112b52b9ead3b2a14bf9c1a04d8a31ab71c69485c9be378d1b1c849539ca2c67`（`evidence/rea-game-javascript.json`）。语义阶段因 1 GiB 堆耗尽而覆盖不完整；本报告只对下列定点追踪负责。
- REA 原始官网 APK 清单 Evidence：`ev_ff4d543f5e5f3b5b9e6c12353ed6561850f5e1df50f35fb091537a2978175931`（`evidence/rea-artifact.json`）。本报告的函数解释来自其提取资源的人工静态追踪，不能将上述 REA 清单 ID 写成 REA 已验证全部经济公式。

## 2. 配置表有没有拿到

**没有拿到 `c_flower`、`c_flowerLvl`、`c_flowerLvlCfg` 等表的实际数据行。** 已确认加载路径与配置名，不应编造各花种数值。

资源链是：

1. 游戏启动设置 `dataUrlList = [fmtCfgPath("data/g-data"), ...dlg-main, ...dlg-evt]`（E10，48833–48840）。
2. `mo.Res.fmtCfgPath` 按 `resCfgTextMode` 生成 `.text` 或 `.bin`。
3. `mo.D.load` 支持 `remoteCfgEnabled/remoteCfgRoot`、语言前缀、分区后缀，加载后对 `.bin` 作 `STR.from`，再 `JSON.parse`，最后 `D.register`。原框架 `mo.d3eb7.js` 字节区间 `[224255,225193)`，保存于 `tools/static-economy/config-loader-evidence.json`。这证明配置有独立加载路径；当前运行时具体选择哪一路尚未观察。
4. `assets/resources/config.84324.json`：`paths[3606] = ["mo/zh/data/g-data",0,1]`；压缩 UUID `35/DOBNNxcZLqQ4GwsYTOo`，展开 UUID `35fc3381-34dc-5c64-ba90-e06c2c6133a8`，native 内容版本 `fcd31`。优化版 `config.8d071.json` 同样标 `g-data: [3607,2,"fcd31"]`。
5. 两个 APK 的 ZIP 成员中均无上述 UUID 对应独立 native 数据实体；独立 `.bin` 基本为 Spine 动画。JSON 资源包存在大量 prefab/图像元数据，但未定位出实际花卉表。
6. 两包另有 `assets/mx/mx.data`（华为约 21.1 MB、官网约 59.8 MB），文件头为 `mx 01 02`，并有 mxacc/vmacc 库；未解出该不透明载体，**不能据此声称整个 APK 的所有字节绝不包含配置表**。也未用运行、注入、root 或网络抓取补齐。

所以目前能可靠给出的是**参数化公式与内置固定系数**；绝对收益和成长曲线须由热更新资源或手机可见数值补齐。

## 3. 种植、浇水、采收：服务器状态驱动的循环

静态观察：

- 可选种植列表来自 `cultivateMgr.getList(2)`，即已完成培养的花种；按库存、培养时间、等级、`cd` 等排序（107106–107134）。此处是“取得花种能力”与“反复种植”分开的结构。客户端未在这个种植入口检查每次消耗一颗种子，不能将种子自动视作每次播种的耗材，也不能据此断言服务器种植零成本。
- 土地状态字段有 `flowerId/state/lvl/harvestCnt/nextTime/plantTime/stealUids`。客户端把状态 2 且已到 `nextTime` 的土地显示为状态 3（生长中→可采收）（E06）。
- 单块浇水按钮检查道具 `7` 至少 1 个，然后调用 `gs.usrLand.water`。**可证实的是客户端前置检查为 1 水滴；实际扣除以服务器返回为准。**（E11）
- 收获后，客户端以 `getFlowerLvlCfg(flowerId,lvl).frequencys - harvestCnt > 0` 判断是否还有下一轮；生长面板显示相同差值（E12–E13）。花卉等级配置因此至少决定一株的最大收获轮次 `F=frequencys`。
- `cd` 按秒显示；`cropGets` 按朵显示；`left` 是允许被好友取走以后保留的数量门槛。偷取允许条件是 `cropGets - stealUids.length > left`；同一用户已取过则不可再取（E17–E18、E21）。此客户端模型相当于每一条偷取用户记录扣 1 朵；最终收益仍由服务器发回。
- `seedWgt` 显示为 `seedWgt / 100 %`，因此概率单位为万分比；`seedGets` 是种子数量字段（E18）。这里没有观察到服务器的抽样次数和抽样时点，不能把它直接写成已验证的期望种子产量。
- 剩余时长 `≤ c_gameCfg.$freeSpeedUp` 时出现免费加速；成长加速道具来自 `c_flower.$growItem`。这些阈值的实际值未取得（107888–107952）。
- 一键种植、浇水、收获、清理等便捷入口用 `UT.isNoble()` 检查；该函数对应卡权益 ID 1。权益价格与有效期不在本报告已拿到的数据中。
- 水滴恢复显示读取 `c_item(7).restore` 及服务器 `itemExtMap[7].cd/lems`，使用毫秒间隔计算下一滴剩余时间（E20）。不能从这一函数反推出具体几分钟一滴和容量上限。

设计解释（推断）：生产同时受可用土地数、每轮 `cd`、轮产 `cropGets`、轮数 `frequencys`、水滴恢复与在线操作约束。升级不仅提升单位时间产出，也可能降低重种/收取频率、提高离线被取后的保留产量。必须知道下一轮是否需要再浇水，才能准确计算“每滴水收益”；仅凭客户端状态接口还不足以确定。

用于补表后的分析模型（推导，不是新发现的游戏公式）：忽略操作延迟和偷取时，单地单位时间产量为 `3600 × cropGets / cd` 朵/小时；一株满轮总产量为 `frequencys × cropGets`。这两个指标应同时看，不能只按最长生长时间或单次产量排最优花。

## 4. 花卉升级：单花基值 × 通用等级模板，允许特例覆盖

`UT.getFlowerLvlCfg(flowerId,L)` 的算法（E04，19860–19885）：

1. 优先查 `c_flowerLvl(flowerId + 两位等级字符串)`，即通常相当于 `flowerId×100 + L` 的专用行。
2. 若没有专用行，读取 `c_flowerLvlCfg(L)` 的共用等级模板和 `c_flowerLvl(flowerId)` 的单花基值。
3. `gldCost(L) = round(单花基础gldCost × 模板gldCost(L) / 模板gldCost(1))`。
4. `cd(L) = round(单花基础cd × 模板cd(L) / 模板cd(1))`。
5. `lvlUpCost` 生成为 `[flowerId-1000, 模板lvlUpCost(L)]`；其余字段直接复制等级模板。

升级面板展示和检查 `gldCost` 金币（道具 11）及 `c_flower.eliteId` 对应的材料数量，然后调用 `gs.cultivate.upgrade`（E18–E19）。不要仅根据回退规则就把所有花的 `eliteId` 都认定是 `flowerId-1000`，实际表可以覆盖。

升级可改变六个生产维度，界面逐项列“当前/下级”：`frequencys`（轮数）、`cd`（秒）、`cropGets`（朵数）、`left`（被取后留存）、`seedGets`、`seedWgt`。满级来自 `c_flowerLvl.$lvlMax`，本次未取得其实际值。

设计解释（推断）：这是一种可规模化维护的参数结构。设计师用每花基值区分物种，用统一等级曲线控制成长节奏，再用专用行处理例外。**不是已证实“每级固定增长百分比”或指数成本曲线**；曲线形状由未拿到的表决定。

## 5. 花艺、花架与顾客：固定兑换系数形成用途选择

符号：`g_i` 是花 `i` 的 `c_flower.gld`；`x_i` 是 `c_flower.exp`。二者是订单计价基值，不能自动解释成背包直接出售价格。令 `G=Σg_i`，`X=Σx_i`，求和取花艺配方 `c_flowerArt.flowers` 的成员。

在无进阶技能、无全局增益、配方没有显式覆盖价格时（E02、E08）：

| 用途 | 内置计算 | 意义 |
|---|---|---|
| 普通鲜花订单 | 各种 `g_i×数量` 与 `x_i×数量` 分别求和 | 鲜花直接交单，赚金币与经验 |
| 花艺顾客订单 | `round(2×G)` 金币，`round(1.68×X)` 经验；另附 `m_c_flowerArt.$cPrice` 奖励 | 制作后提高价值，并含额外配置奖励 |
| 花艺花架售卖 | `round(2.3×G)` 金币 | 在相同基值条件下倾向于更多金币 |

重要条件：

- `c_flowerArt.sPrice` 若有值，花架优先采用它；`c_flowerArt.cPrice` 若有值，顾客订单优先采用它。上述 2、1.68、2.3 是**回退定价规则，不能说所有配方绝对都按这几个倍率**。
- 顾客订单数量 `N>1` 时，先计算单件奖励再逐项乘 N；界面随后叠加全局金币/经验增益（E08、E15）。
- 花架 `getSellMoney(artId,N,multiplier)` 是单件价格×数量×传入倍率；售卖界面再乘 `1+A_g`（E07、E16）。
- 花架售完时点：`sellStartTime + num × c_flowerRack.$sellTime × 1000 ms`；一架能放的数量由 `$sellNum` 控制，实际秒数与容量未知（E07，21488–21520；121742 附近）。因此花架更高金币兑换率还要扣除占用时间/容量的机会成本。
- 制作请求是 `gs.flowerArt.makeFlowerArt({vaseId, flowersIds, num})`；客户快捷制作界面检查每种配方花材库存至少达到缺口件数。花瓶是在这里传入的配方/解锁条件；不能仅凭请求字段断言每件消耗一个花瓶。

数值演示（人为归一化输入，**不是某款实际花的报价**）：若一个配方花材 `G=1,000`、`X=100`，鲜花普通交单基值为 1,000 金币和 100 经验；配方回退顾客价为 2,000 金币和 168 经验（外加表配置奖励）；花架价为 2,300 金币。花架金币比顾客高 `2.3/2−1=15%`，但缺少该路径中的经验奖励，并占用售卖时间。

设计解释（推断）：这是“金币效率”与“升级经验/即时交单”的用途分流，配方本身形成背包花材的组合需求。不能只看 2.3 倍就断言花架总是最优，因为任务、奖励、等待、花材缺口和全局增益都会改变比较。

## 6. 全局增益与进阶技能：避免简单乘法叠加

源码明确区分两类增益（E03、E09）：

- `A_g = c_gameCfg.$videoGldAdd / 10000`，仅在 `UT.isAdCard()`（卡 ID 6）或 `videoDoubleCtrl.isExist()` 生效时返回；否则 0。
- `A_x = c_monthCard.$expAdd / 10000`，仅 `UT.isNoble()`（卡 ID 1）生效时返回；否则 0。
- 花卉进阶技能按槽位从 `value1/value2/value3` 取值，同一 `skillType` 求和。`valueType==2` 的合计再除以 10000。技能类型 1 进入金币、类型 2 进入经验的订单路径。

普通鲜花订单的精确客户端计算（E02、E14）可以写为：

```text
若该花的金币技能 s_g,i ≠ 0：
  Δg_i = max(round(g_i × s_g,i / (1 + A_g)), 1)
否则 Δg_i = 0

金币显示 = round((1 + A_g) × Σ round((g_i + Δg_i) × n_i))
经验同理，用 x_i、s_x,i、A_x
```

顾客花艺的技能增量改用系数 2（金币）和 1.68（经验）；花架用 2.3（金币）：

```text
ΔG顾客 = Σ max(round(2 × g_i × s_g,i / (1+A_g)),1)    [仅累加有对应技能的花]
ΔX顾客 = Σ max(round(1.68 × x_i × s_x,i / (1+A_x)),1)
ΔG花架 = Σ max(round(2.3 × g_i × s_g,i / (1+A_g)),1)
```

这些技能增量加到显式价格或回退基础价格上，随后再经数量与全局增益处理。若忽略舍入、最小 1、表覆盖价，近似结果为：

`金币 ≈ 基础金币 × (1 + 全局增益 + 技能增益)`。

这是可追踪到调用点的代数推导。它**不是** `基础金币×(1+全局增益)×(1+技能增益)`：中途除以 `(1+A)` 抵消了技能部分的全局乘法放大。

演示（人为输入）：一花 `g=100`、数量 5、全局金币增益 100%、技能增益 20%，中间技能值 `round(100×0.2/2)=10`，最终 `round((100+10)×5×2)=1100` 金币。直接乘两种增益会得到 1200，这是此客户端路径没有采用的结果。低基值、小技能时“最低 1”与舍入会造成偏差，不能省略。

另一个固定值：普通订单界面第 7 类订单调用 `calCurrencies(o)` 得到常数 3（道具 1106），第 8 类调用 `calDecorate(o)` 得到常数 2（道具 1340），同时仍展示经验（E14）。此处只能确认包内界面代码，不确定当前开放状态与热更新是否更改。

## 7. 证据边界与下一步应补的表

| 问题 | 目前状态 | 仍需要的证据 |
|---|---|---|
| 浇水/生长/收获循环状态 | 部分解释 | 服务端返回或当前 UI 的完整一次循环，特别是多轮之间是否重新耗水 |
| 各花实际成熟时间、轮数、产量 | 未取得实际表 | 当前 `g-data` 中 `c_flowerLvl/c_flowerLvlCfg`，或逐花升级页 |
| 花艺基础兑换系数 | 已解释内置回退规则 | 当前配方 `sPrice/cPrice` 是否覆盖；热更新等价性 |
| 普通订单与技能、全局增益叠加 | 已追到内置 UI 调用点 | 当前表值、服务器结算核对 |
| 升级花材/金币成本曲线、满级 | 已解释生成规则，曲线未知 | 当前等级模板、单花基础行、专用行、`$lvlMax` |
| 种子掉落实际期望 | 仅知道显示单位/字段 | 服务器抽样机制与时点，或充分独立样本 |
| 单地/每水滴/每小时最优种植 | 不能排名 | 上述数据 + 当前可用土地/水滴上限/在线节奏 |

优先补表清单：`c_flower`（gld、exp、seedId、eliteId）、`c_flowerLvl`、`c_flowerLvlCfg`、`c_flowerArt`（配方、sPrice、cPrice）、`c_flowerRack`（$sellTime、$sellNum）、`c_item(7)`（restore、reset、limit）、`c_gameCfg.$videoGldAdd`、`c_monthCard.$expAdd`、`c_flowerAdvanceSkill`。所有高精度比较都应基于 **460.0.18 当前运行配置** 重算。
