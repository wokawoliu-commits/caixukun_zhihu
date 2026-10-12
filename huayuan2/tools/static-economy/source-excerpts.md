# 静态经济数值源码摘录

仅格式化原始 JS，未执行目标代码。

## E01 公式库

来源：`tools/static-economy/game.18280.pretty.js`，行 197–232。

```javascript
197:     _.calFlowerOrderGld = function (a, b, c) {
198:       return Math.round(a * b * (1 + c));
199:     };
200:     _.calFlowerOrderExp = function (a, b, c) {
201:       return Math.round(a * b * (1 + c));
202:     };
203:     _.calFlowerArtSellGld = function (a, b, c) {
204:       return Math.round(a * b * (1 + c));
205:     };
206:     _.calClearjadePoolCdCost = function (a) {
207:       return max(int(a / 360 + 1), 1);
208:     };
209:     _.calFlowerUpgradeItemCost = function (a, b) {
210:       return max(Math.round((a * b) / 100), 1);
211:     };
212:     _.calFlowerUpgradeGldCost = function (a, b) {
213:       return max(Math.round((a * b) / 100), 1);
214:     };
215:     _.calCulShopPrice = function (a) {
216:       return Math.round(a * (0.8 + 0.4 * Math.random()));
217:     };
218:     _.calCulShopRefreshCost = function (a) {
219:       return a < 3 ? 0 : a < 7 ? Math.pow(2, a - 3) : Math.min(a * 4 - 16, 20);
220:     };
221:     _.calOrderRefreshCost = function (a) {
222:       return Math.min(a * 2, 10);
223:     };
224:     _.calPearlBigRate = function (a) {
225:       return 0.08 + 0.01 * a;
226:     };
227:     _.calOrderTeamGld = function (a, b, c) {
228:       return Math.round((a + c) * (1 + b));
229:     };
230:     _.calOrderTeamExp = function (a, b, c, d) {
231:       return Math.round((a + d) * (1 + b) * (1 + c));
232:     };
```

## E02 花艺与技能公式

来源：`tools/static-economy/game.18280.pretty.js`，行 395–441。

```javascript
395:     _.calCPrice1 = function (a) {
396:       return Math.round(a * 1.68);
397:     };
398:     _.calCPrice2 = function (a) {
399:       return Math.round(a * 2);
400:     };
401:     _.calSPrice = function (a) {
402:       return Math.round(a * 2.3);
403:     };
404:     _.calFlowerAdvance1 = function (a, b) {
405:       return Math.max(Math.round((a * 32 * b) / 10000, 0), 1);
406:     };
407:     _.calFlowerAdvance2 = function (a, b) {
408:       return Math.max(Math.round((a * 88 * b) / 10000, 0), 1);
409:     };
410:     _.calFlowerLvlGold = function (a, b, c) {
411:       return Math.round(a * (b / c));
412:     };
413:     _.calFlowerLvlTime = function (a, b, c) {
414:       return Math.round(a * (b / c));
415:     };
416:     _.calAct2048 = function (a) {
417:       return Math.max(a * 2, 1);
418:     };
419:     _.calFlowerWashNum = function (a) {
420:       return Math.max(Math.round(a * 1.5, 0), 1);
421:     };
422:     _.calFlowerAdvanceWgt = function (a, b, c) {
423:       return Math.round((a + b * c) / 10, 0);
424:     };
425:     _.calOrderGold = function (a, b, c) {
426:       return Math.max(Math.round((2 * (a * b)) / (1 + c)), 1);
427:     };
428:     _.calOrderExp = function (a, b, c) {
429:       return Math.max(Math.round((1.68 * (a * b)) / (1 + c)), 1);
430:     };
431:     _.calOrderFlowerGold = function (a, b, c) {
432:       return Math.max(Math.round((a * b) / (1 + c)), 1);
433:     };
434:     _.calOrderFlowerExp = function (a, b, c) {
435:       return Math.max(Math.round((a * b) / (1 + c)), 1);
436:     };
437:     _.calOrderFlowerRackGold = function (a, b, c) {
438:       return Math.max(Math.round((2.3 * (a * b)) / (1 + c)), 1);
439:     };
440:     _.calCostDmd = function (a) {
441:       return Math.max(Math.round(a / 10), 6);
```

## E03 全局金币/经验加成

来源：`tools/static-economy/game.18280.pretty.js`，行 19798–19829。

```javascript
19798:         (e.isAdCard = function () {
19799:           let e = t.getGMgr();
19800:           return !!e && e.rchgCardMgr.isValid(6);
19801:         }),
19802:         (e.isNoble = function () {
19803:           let e = t.getGMgr();
19804:           return !!e && e.rchgCardMgr.isValid(1);
19805:         }),
19806:         (e.getGldAdd = function () {
19807:           let e = 0,
19808:             r = t.UT.isAdCard();
19809:           if (!r) {
19810:             let e = t.getGMgr();
19811:             if (e) {
19812:               let t = e.videoDoubleCtrl;
19813:               r = t && t.isExist();
19814:             }
19815:           }
19816:           if (r) {
19817:             let r = t.D.m_c_gameCfg(),
19818:               { $videoGldAdd: s } = r;
19819:             e += s / 1e4;
19820:           }
19821:           return e;
19822:         }),
19823:         (e.expAddByNoble = function () {
19824:           let e = 0;
19825:           t.UT.isNoble() && (e = t.D.m_c_monthCard().$expAdd / 1e4);
19826:           return e;
19827:         }));
19828:     })(t.UT || (t.UT = {}));
19829:   })(G || (G = {})),
```

## E04 花卉等级表回退算法

来源：`tools/static-economy/game.18280.pretty.js`，行 19860–19885。

```javascript
19860:       function o(e, r = 1) {
19861:         let s = mo.STR.fill(r, "00"),
19862:           o = t.D.c_flowerLvl(e + s);
19863:         if (!o) {
19864:           let s = t.D.c_flowerLvlCfg(r);
19865:           if (s) {
19866:             let i = t.D.c_flowerLvl(e);
19867:             if (i) {
19868:               o = { fLvl: r };
19869:               let a = t.D.c_flowerLvlCfg(1);
19870:               for (let r in s) {
19871:                 let l = s[r];
19872:                 o[r] =
19873:                   "gldCost" == r
19874:                     ? t.c_formula.calFlowerLvlGold(i.gldCost, l, a.gldCost)
19875:                     : "cd" == r
19876:                       ? t.c_formula.calFlowerLvlTime(i.cd, l, a.cd)
19877:                       : "lvlUpCost" == r
19878:                         ? [e - 1e3, l]
19879:                         : l;
19880:               }
19881:             }
19882:           }
19883:         }
19884:         return o;
19885:       }
```

## E05 花卉培养、升级接口

来源：`tools/static-economy/game.18280.pretty.js`，行 20620–20646。

```javascript
20620:           }
20621:           return r;
20622:         }),
20623:         (t.cloneObj = function (t, e) {
20624:           for (let r in e) t[r] = e[r];
20625:         }));
20626:     })(t.UT_OBJ || (t.UT_OBJ = {}));
20627:   })(G || (G = {})),
20628:   (function (t) {
20629:     class e extends t.BaseCtrl {
20630:       cultivate(t, e) {
20631:         this.request2(
20632:           "gs.cultivate.cultivate",
20633:           { flowerId: this.d.flowerId },
20634:           t,
20635:           e,
20636:         );
20637:       }
20638:       recv(t, e) {
20639:         this.request2("gs.cultivate.recv", { flowerId: this.d.flowerId }, t, e);
20640:       }
20641:       upgrade(t, e) {
20642:         this.request2(
20643:           "gs.cultivate.upgrade",
20644:           { flowerId: this.d.flowerId },
20645:           t,
20646:           e,
```

## E06 种植状态与服务器接口

来源：`tools/static-economy/game.18280.pretty.js`，行 20785–20895。

```javascript
20785:       _onSyncData(t) {
20786:         const e = this;
20787:         let r = t.usrLandTot;
20788:         r &&
20789:           (r.usrLand && e.setData(r.usrLand),
20790:           r.chgLandMap && e._updateLandMap(r.chgLandMap));
20791:       }
20792:       _updateLandMap(t) {
20793:         if (!t) return;
20794:         let e = this.d.landMap;
20795:         for (const r in t) e[r] = t[r];
20796:         ((e = this.getLandMap()),
20797:           this.setData({ landMap: e }),
20798:           mo.emitter.emit("UsrLandChg", e));
20799:       }
20800:       getLandMap() {
20801:         let t = mo.OBJ.clone2(this.data.landMap || {}),
20802:           e = mo.DATE.date();
20803:         for (const r in t) {
20804:           let s = t[r];
20805:           2 == s.state &&
20806:             s.nextTime &&
20807:             !mo.DATE.isBefore(e, mo.DATE.date(s.nextTime)) &&
20808:             ((s.state = 3), (s.nextTime = null));
20809:         }
20810:         return t;
20811:       }
20812:       getLandById(t) {
20813:         let e = mo.OBJ.clone2(this.data.landMap || {})[t];
20814:         return (
20815:           e &&
20816:             2 == e.state &&
20817:             e.nextTime &&
20818:             mo.DATE.isAfter(mo.DATE.date(), mo.DATE.date(e.nextTime)) &&
20819:             ((e.state = 3), (e.nextTime = null)),
20820:           e
20821:         );
20822:       }
20823:       getLandMapByState(t) {
20824:         let e = {},
20825:           r = this.getLandMap();
20826:         for (let s in r) {
20827:           let o = r[s];
20828:           o.state == t && (e[s] = o);
20829:         }
20830:         return e;
20831:       }
20832:       getFlowerLvlId(t, e) {
20833:         return 100 * t + e;
20834:       }
20835:       unlockLand(t, e, r) {
20836:         this.request2("gs.usrLand.unlockLand", { landId: t }, e, r);
20837:       }
20838:       plant(t, e, r, s, o) {
20839:         this.request2("gs.usrLand.plant", { landId: t, flowerId: e }, r, s, o);
20840:       }
20841:       plantOneKey(t, e, r) {
20842:         this.request2("gs.usrLand.plantOneKey", { flowerId: t }, e, r);
20843:       }
20844:       water(t, e, r, s) {
20845:         this.request2("gs.usrLand.water", { landId: t }, e, r, s);
20846:       }
20847:       waterOneKey(t, e, r) {
20848:         this.request2("gs.usrLand.waterOneKey", {}, t, e, r);
20849:       }
20850:       refresh(t, e) {
20851:         this.request2("gs.usrLand.refresh", {}, t, e);
20852:       }
20853:       harvest(t, e, r, s) {
20854:         this.request2("gs.usrLand.harvest", { landId: t }, e, r, s);
20855:       }
20856:       harvestOneKey(t, e, r) {
20857:         this.request2("gs.usrLand.harvestOneKey", {}, t, e, r);
20858:       }
20859:       clear(t, e, r) {
20860:         this.request2("gs.usrLand.clear", { landId: t }, e, r);
20861:       }
20862:       clearOneKey(t, e) {
20863:         this.request2("gs.usrLand.clearOneKey", {}, t, e);
20864:       }
20865:       speedUp(t, e, r) {
20866:         this.request2("gs.usrLand.speedUp", { landId: t }, e, r);
20867:       }
20868:       speedUpOneKey(t, e) {
20869:         this.request2("gs.usrLand.speedUpOneKey", {}, t, e);
20870:       }
20871:       speedUpFree(t, e) {
20872:         this.request2("gs.usrLand.speedUpFree", {}, t, e);
20873:       }
20874:       plantBatch(t, e, r, s, o) {
20875:         this.request2(
20876:           "gs.usrLand.plantBatch",
20877:           { landIds: t, flowerId: e },
20878:           r,
20879:           s,
20880:           o,
20881:         );
20882:       }
20883:       waterBatch(t, e, r, s) {
20884:         this.request2("gs.usrLand.waterBatch", { landIds: t }, e, r, s);
20885:       }
20886:       speedUpBatch(t, e, r, s) {
20887:         this.request2("gs.usrLand.speedUpBatch", { landIds: t }, e, r, s);
20888:       }
20889:       clearBatch(t, e, r, s) {
20890:         this.request2("gs.usrLand.clearBatch", { landIds: t }, e, r, s);
20891:       }
20892:     }
20893:     ((t.UsrLandCtrl = e),
20894:       __reflect(e.prototype, "G.UsrLandCtrl"),
20895:       t.GMgr.register(e),
```

## E07 花架时间和售卖乘积

来源：`tools/static-economy/game.18280.pretty.js`，行 21488–21543。

```javascript
21488:         let e = this._mCfg;
21489:         if (!e) return;
21490:         let r = 0,
21491:           s = t.d,
21492:           { sellStartTime: o, num: i } = s,
21493:           { $sellTime: a } = e;
21494:         if (o) {
21495:           let t = mo.DATE.date();
21496:           r = mo.DATE.minus(t, o) >= i * a * 1e3 ? 2 : 1;
21497:         }
21498:         return r;
21499:       }
21500:       _onSellTimeChg() {
21501:         let t = this,
21502:           e = t._mCfg;
21503:         if (e && !t._sellTimer) {
21504:           let { $sellTime: r } = e,
21505:             s = {},
21506:             o = t.getMbs(),
21507:             i = mo.DATE.date();
21508:           for (let t = 0, e = o.length; t < e; t++) {
21509:             let e = o[t],
21510:               { sellStartTime: a, num: l } = e.d;
21511:             if (a) {
21512:               let t = l * r * 1e3 + mo.DATE.minus(a, i);
21513:               t > 0 && (s[e.d.rackId] = t);
21514:             }
21515:           }
21516:           if (Object.keys(s).length > 0) {
21517:             let e = 1 / 0,
21518:               r = null;
21519:             for (const t in s) {
21520:               let o = s[t];
21521:               o < e && ((e = o), (r = t));
21522:             }
21523:             r && ((t._sellRackId = Number(r)), t._startTimer(e));
21524:           }
21525:         }
21526:       }
21527:       _startTimer(t) {
21528:         let e = this;
21529:         e._sellTimer = mo.setTimeout(() => {
21530:           (mo.emitter.emit("FlowerRackStateChg", { refRack: 1 }),
21531:             mo.clearTimeout(e._sellTimer),
21532:             (e._sellRackId = null),
21533:             (e._sellTimer = null),
21534:             e._onSellTimeChg());
21535:         }, t + 500);
21536:       }
21537:       getSellMoney(t, e = 1, r = 1) {
21538:         let s = 0;
21539:         if (t && e) {
21540:           let o = this.gMgr.flowerArtCtrl.calSPrice(t);
21541:           o && o.length && (s = o[1] * e * r);
21542:         }
21543:         return s;
```

## E08 花艺价格完整计算

来源：`tools/static-economy/game.18280.pretty.js`，行 22984–23053。

```javascript
22984:       calSPrice(e) {
22985:         const r = t.D.c_flowerArt(e);
22986:         if (!r) return [];
22987:         let s = r.sPrice ? mo.OBJ.clone2(r.sPrice) : [],
22988:           o = 0,
22989:           i = 0,
22990:           a = t.UT.getGldAdd();
22991:         for (let e = 0; e < r.flowers.length; e++) {
22992:           const s = r.flowers[e],
22993:             l = t.D.c_flower(s);
22994:           if (l) {
22995:             let e = t.UT.getFlowerAdvanceSkillExt(s),
22996:               r = l.gld;
22997:             ((o += r),
22998:               e[1] && (i += t.c_formula.calOrderFlowerRackGold(r, e[1], a)));
22999:           }
23000:         }
23001:         return (
23002:           s && s.length
23003:             ? i > 0 && (s[1] += i)
23004:             : (s = [11, t.c_formula.calSPrice(o) + i]),
23005:           s
23006:         );
23007:       }
23008:       calOrderCustomerRwd(e, r) {
23009:         const s = t.D.c_flowerArt(e);
23010:         if (!s) return [];
23011:         let o = mo.OBJ.clone2(s.cPrice),
23012:           i = 0,
23013:           a = 0,
23014:           l = 0,
23015:           n = 0,
23016:           c = t.UT.getGldAdd(),
23017:           d = t.UT.expAddByNoble();
23018:         for (let e = 0; e < s.flowers.length; e++) {
23019:           const r = s.flowers[e],
23020:             o = t.D.c_flower(r);
23021:           if (o) {
23022:             let e = t.UT.getFlowerAdvanceSkillExt(r),
23023:               s = o.gld;
23024:             ((a += s), e[1] && (i += t.c_formula.calOrderGold(s, e[1], c)));
23025:             let u = o.exp;
23026:             ((n += u), e[2] && (l += t.c_formula.calOrderExp(u, e[2], d)));
23027:           }
23028:         }
23029:         if (o && o.length) {
23030:           if (i > 0 || l > 0)
23031:             for (let t = 0; t < o.length; t++) {
23032:               let e = o[t];
23033:               11 === e[0] && i > 0
23034:                 ? (e[1] += i)
23035:                 : 2 === e[0] && l > 0 && (e[1] += l);
23036:             }
23037:         } else {
23038:           const e = t.D.m_c_flowerArt();
23039:           o = [
23040:             [2, t.c_formula.calCPrice1(n) + l],
23041:             [11, t.c_formula.calCPrice2(a) + i],
23042:             mo.OBJ.clone2(e.$cPrice),
23043:           ];
23044:         }
23045:         if (r > 1) for (let t = 0; t < o.length; t++) o[t][1] *= r;
23046:         return o;
23047:       }
23048:       makeFlowerArt(t, e, r, s, o) {
23049:         this.request2(
23050:           "gs.flowerArt.makeFlowerArt",
23051:           { vaseId: t, flowersIds: e, num: r },
23052:           s,
23053:           o,
```

## E09 进阶技能槽合计

来源：`tools/static-economy/game.18280.pretty.js`，行 36635–36668。

```javascript
36635:         (e.getFlowerAdvanceSkillExt = function (e) {
36636:           let r = {},
36637:             s = t.getGMgr();
36638:           if (!s || !s.cultivateMgr) return r;
36639:           let o = s.cultivateMgr.getMb(e);
36640:           if (!o) return r;
36641:           let i = o.getSlotMap();
36642:           if (!i || mo.OBJ.isEmpty(i)) return r;
36643:           let a = {};
36644:           for (let e in i)
36645:             if (i[e] && i[e].skillId) {
36646:               let r = t.D.c_flowerAdvanceSkill(i[e].skillId);
36647:               if (!r || !r.skillType) continue;
36648:               let s = r.skillType,
36649:                 o = r.valueType;
36650:               (a[s] || (a[s] = [o, 0]),
36651:                 (a[s][1] += t.UT.getFlowerAdvanceSkillValueByCfg(
36652:                   Number(e),
36653:                   r,
36654:                 )));
36655:             }
36656:           for (let t in a) {
36657:             let e = a[t];
36658:             2 == e[0] ? (r[t] = e[1] / 1e4) : (r[t] = e[1]);
36659:           }
36660:           return r;
36661:         }),
36662:         (e.getFlowerAdvanceSkillValueByCfg = function (t, e) {
36663:           let r = 0;
36664:           return (
36665:             e && (r = 1 == t ? e.value1 : 2 == t ? e.value2 : e.value3),
36666:             r
36667:           );
36668:         }),
```

## E10 配置资源加载入口

来源：`tools/static-economy/game.18280.pretty.js`，行 48833–48840。

```javascript
48833:               mo.EDITOR ||
48834:                 ((l.langTextUrl = mo.R.fmtCfgPath("data/g-lang-text")),
48835:                 (l.dataUrlList = [
48836:                   mo.R.fmtCfgPath("data/g-data"),
48837:                   mo.R.fmtCfgPath("data/g-data-dlg-main"),
48838:                   mo.R.fmtCfgPath("data/g-data-dlg-evt"),
48839:                 ])),
48840:               l.onInitSdk(function (t) {
```

## E11 浇水检查

来源：`tools/static-economy/game.18280.pretty.js`，行 107619–107657。

```javascript
107619:         let i = this;
107620:         if (i.isUnValide) return;
107621:         let r = i.d.landId;
107622:         e.ButlerUT.offPlantModeConfirm(() => {
107623:           ((i.isUnValide = !0),
107624:             e.UT.checkItemEnough(7, 1, !1, !0)
107625:               ? (e.reqLandCount++,
107626:                 e.usrLandCtrl.water(
107627:                   r,
107628:                   () => {
107629:                     (e.reqLandCount--,
107630:                       e.GuideUT.isGuideOn(["1001_19", "10010_21"]) &&
107631:                         !e.UT.getPWgtInTray("PFarmHarvestDlg", "menu") &&
107632:                         (e.lastWaterReqTimeoutId || e.GuideUT.showUnTouchDlg(),
107633:                         i.clearTimeout(e.lastWaterReqTimeoutId),
107634:                         (e.lastWaterReqTimeoutId = i.setTimeout(
107635:                           () => {
107636:                             (console.log("浇水成功----------刷新引导"),
107637:                               mo.emitter.emit("refreshGuide"));
107638:                           },
107639:                           i,
107640:                           800,
107641:                         ))),
107642:                       e.audioMgr.playAudio(e.AUDIO_TYPE.effect, 9),
107643:                       e.widgetMgr.refreshFlowerPlant());
107644:                   },
107645:                   () => {
107646:                     e.reqLandCount--;
107647:                   },
107648:                 ),
107649:                 i.close())
107650:               : i.close());
107651:         });
107652:       }
107653:       onTouchStartClear(e) {
107654:         this._btn_clear.setScale(1.1, 1.1);
107655:       }
107656:       onTouchMoveClear(t) {
107657:         let i = this;
```

## E12 收获剩余轮次

来源：`tools/static-economy/game.18280.pretty.js`，行 107787–107799。

```javascript
107787:                   e.GuideUT.isGuideOn(["1001_23", "10010_25"]) &&
107788:                     !e.UT.getPWgtInTray("PFarmHarvestDlg", "menu") &&
107789:                     (console.log("收获成功----------刷新引导"),
107790:                     mo.emitter.emit("refreshGuide")));
107791:                 let n = e.usrLandCtrl.getLandById(r),
107792:                   o = n && n.flowerId;
107793:                 if (o) {
107794:                   e.UT.getFlowerLvlCfg(o, n.lvl).frequencys - n.harvestCnt >
107795:                     0 && (i._landDatas.push(n), i._landIds.push(r));
107796:                 }
107797:                 (t.$usrTot &&
107798:                   e.flyItemMgr.pushItemFly(t.$usrTot.itemAddChg, [16]),
107799:                   e.farmMgr.pushHarvestGain(t, [16]),
```

## E13 剩余轮次与免费加速

来源：`tools/static-economy/game.18280.pretty.js`，行 107928–107952。

```javascript
107928:       }
107929:       _refHarvestCount() {
107930:         let t = this.d.landData,
107931:           i = t.flowerId,
107932:           r = e.UT.getFlowerLvlCfg(i, t.lvl).frequencys,
107933:           n = mo.STR.fmt(mo.getLangText("remaining_harvest"), r - t.harvestCnt);
107934:         this.setDataOnly({ $$harvestCount: n });
107935:       }
107936:       onScrollMapEnd() {
107937:         super.onScrollMapEnd();
107938:         let t = this.findFirst("grp_container");
107939:         t.setPosition(0, t.position.y);
107940:         let i = this.findFirst("btn_clearOneKey");
107941:         (e.UT.setGray(i, !e.UT.isNoble()), this.refBtn());
107942:       }
107943:       refBtn() {
107944:         let t = this.d.landData.nextTime,
107945:           i = !1,
107946:           r = !0;
107947:         if (t) {
107948:           let n = mo.D.getMCfg("c_gameCfg"),
107949:             o = mo.DATE.minus(t, mo.DATE.date()) <= 1e3 * n.$freeSpeedUp;
107950:           ((i = !o && e.UT.isCanAd(3)), (r = o));
107951:         }
107952:         let n = this.findFirst("btn_speedUpOneKey");
```

## E14 普通鲜花订单

来源：`tools/static-economy/game.18280.pretty.js`，行 118122–118180。

```javascript
118122:       }
118123:       checkFlower() {
118124:         let t = this,
118125:           i = t._getSelectInfo();
118126:         if (!i || !i.flowers) return;
118127:         let r = e.UT.getGldAdd(),
118128:           n = e.UT.expAddByNoble(),
118129:           o = 0,
118130:           s = 0;
118131:         for (let t of i.flowers) {
118132:           let i = t[0],
118133:             l = mo.D.get("c_flower", i);
118134:           if (l) {
118135:             let a = l.gld,
118136:               d = l.exp,
118137:               c = 0,
118138:               _ = 0,
118139:               m = e.UT.getFlowerAdvanceSkillExt(i);
118140:             (m[1] && (c += m[1]),
118141:               m[2] && (_ += m[2]),
118142:               c && (a += e.c_formula.calOrderFlowerGold(a, c, r)),
118143:               _ && (d += e.c_formula.calOrderFlowerExp(d, _, n)),
118144:               (o += e.c_formula.calFlowerOrderGld(a, t[1], 0)),
118145:               (s += e.c_formula.calFlowerOrderExp(d, t[1], 0)));
118146:           }
118147:         }
118148:         let l = 7 == t._select,
118149:           a = 8 == t._select,
118150:           d = [];
118151:         if (l) {
118152:           let t = e.c_formula.calCurrencies(o);
118153:           d.push({ id: 1106, rewardDesc: `<rt b>${t}</rt>` });
118154:         } else if (a) {
118155:           let t = e.c_formula.calDecorate(o);
118156:           d.push({ id: 1340, rewardDesc: `<rt b>${t}</rt>` });
118157:         } else
118158:           d.push({
118159:             id: 11,
118160:             rewardDesc: `<rt b>${Math.round(o * (r + 1))}</rt>`,
118161:             add: r > 0,
118162:             addDesc: mo.getLangText("public_addTips1") + `${o}x${r + 1}`,
118163:           });
118164:         d.push({
118165:           id: 2,
118166:           rewardDesc: `<rt b>${Math.round(s * (n + 1))}</rt>`,
118167:           add: n > 0,
118168:           addDesc: mo.getLangText("public_addTips2") + `${s}x${n + 1}`,
118169:         });
118170:         let c = i.flowers,
118171:           _ = [];
118172:         for (let e of c) _.push({ iid: e[0], max: e[1] });
118173:         let m = i.npcId,
118174:           p = e.GuideUT.isGuideOn(["1002_3", "10020_3"]),
118175:           u = e.GuideUT.isGuideOn([
118176:             "1012_18",
118177:             "10120_18",
118178:             "1012_19",
118179:             "10120_19",
118180:           ]),
```

## E15 顾客订单最终倍率

来源：`tools/static-economy/game.18280.pretty.js`，行 119904–119940。

```javascript
119904:             mo.emitter,
119905:             "VideoDoubleStateRef",
119906:             this._onVideoDoubleStateRef,
119907:           ),
119908:           this.onEmitter(mo.emitter, "ON_GUIDE_HIDE", this._onGuideHide),
119909:           this._randomPlaySpecial());
119910:       }
119911:       _initInfo(t = !0) {
119912:         let i = this,
119913:           r = i.d.npcId,
119914:           n = e.orderCustomerCtrl.d.orderMap[r];
119915:         if (!n) return void i.close();
119916:         let o = (i._artId = n.artId),
119917:           s = mo.D.get("c_flowerArt", o),
119918:           l = s && s.anchorY ? s.anchorY : 0,
119919:           a = mo.D.get("c_orderCustomerNpc", r),
119920:           d = a.dialogText.split("|")[n.dialogId - 1],
119921:           c = e.flowerArtCtrl.calOrderCustomerRwd(o, n.num),
119922:           _ = {};
119923:         ((_[2] = e.UT.expAddByNoble()), (_[11] = e.UT.getGldAdd()));
119924:         let m = {};
119925:         ((m[2] = mo.getLangText("public_addTips2")),
119926:           (m[11] = mo.getLangText("public_addTips1")));
119927:         let p = [];
119928:         for (let e of c) {
119929:           let t = e[0],
119930:             i = e[1],
119931:             r = (_[t] || 0) + 1,
119932:             n = `<rt b>${Math.round(i * r)}</rt>`,
119933:             o = r > 1,
119934:             s = m[t] + `${i}x${r}`;
119935:           p.push({ iid: t, rewardDesc: n, add: o, addDesc: s });
119936:         }
119937:         let u = _[2] && _[11] ? 1 : 0,
119938:           h = e.GuideUT.isGuideOn(["1005_3", "10050_3"]),
119939:           g = i.findFirst("flower");
119940:         mo.CC.helper.setOpacity(g, h ? 0 : 255);
```

## E16 花架最终倍率

来源：`tools/static-economy/game.18280.pretty.js`，行 121837–121865。

```javascript
121837:       _updatePrice() {
121838:         const t = this,
121839:           i = t._sellMap,
121840:           r = e.UT.getGldAdd();
121841:         if (mo.OBJ.isEmpty(i))
121842:           return void t.setDataOnly({
121843:             _totPrice: 0,
121844:             _vipPrice: 0,
121845:             _hasAdd: !!r,
121846:           });
121847:         const n = e.flowerRackMgr;
121848:         let o = 0;
121849:         const s = Object.keys(i);
121850:         for (let e = 0, t = s.length; e < t; ++e) {
121851:           const t = i[s[e]];
121852:           if (!t || !t.length) continue;
121853:           const r = t[0],
121854:             l = t[1];
121855:           r && l && (o += n.getSellMoney(r, l));
121856:         }
121857:         let l = 0;
121858:         (r && (l = o),
121859:           t.setDataOnly({
121860:             _totPrice: o * (1 + r),
121861:             _vipPrice: l,
121862:             _hasAdd: !!r,
121863:           }));
121864:       }
121865:       _tap_btn_sellOne() {
```

## E17 花卉升级属性

来源：`tools/static-economy/game.18280.pretty.js`，行 140465–140502。

```javascript
140465:           t = e.UT.getFlowerLvlCfg(s, r - 1);
140466:           let o = {
140467:               fLvl:
140468:                 (l = e.UT.getFlowerLvlCfg(s, r)).fLvl + mo.getLangText("lvl"),
140469:             },
140470:             a = l.frequencys - t.frequencys;
140471:           a && (o.frequencys = `+${a}${mo.getLangText("times")}`);
140472:           let n = t.cd - l.cd;
140473:           n && (o.cd = `-${e.TimeUT.getTimeDescBySec(n)}`);
140474:           let d = l.cropGets - t.cropGets;
140475:           d && (o.cropGets = `+${d}${mo.getLangText("text_duo")}`);
140476:           let c = l.left - t.left;
140477:           c && (o.left = `+${c}${mo.getLangText("text_duo")}`);
140478:           let _ = l.seedGets - t.seedGets;
140479:           _ && (o.seedGets = `+${_}`);
140480:           let m = l.seedWgt - t.seedWgt;
140481:           (m && (o.seedWgt = `+${m / 100}%`),
140482:             (o.$$cellType = e.AlbumDefine.DetailCellType.normal),
140483:             i.push(o));
140484:         }
140485:         let r = e.UT.getFlowerLvlCfg(s, o),
140486:           a = { fLvl: mo.getLangText("max_lvl_effect") },
140487:           n = r.frequencys;
140488:         n && (a.frequencys = `${n}${mo.getLangText("times")}`);
140489:         let d = r.cd;
140490:         d && (a.cd = `${e.TimeUT.getTimeDescBySec(d)}`);
140491:         let c = r.cropGets;
140492:         c && (a.cropGets = `${c}${mo.getLangText("text_duo")}`);
140493:         let _ = r.left;
140494:         _ && (a.left = `${_}${mo.getLangText("text_duo")}`);
140495:         let m = r.seedGets;
140496:         m && (a.seedGets = `${m}${mo.getLangText("text_ke")}`);
140497:         let u = r.seedWgt;
140498:         (u && (a.seedWgt = `${u / 100}%`),
140499:           (a.$$cellType = e.AlbumDefine.DetailCellType.max),
140500:           i.push(a),
140501:           this.setDataOnly({ $$detailList: i }));
140502:       }
```

## E18 花卉等级属性面板

来源：`tools/static-economy/game.18280.pretty.js`，行 140920–140977。

```javascript
140920:       }
140921:       initData() {
140922:         let t = this.d.iid,
140923:           l = mo.D.get("c_flower", t);
140924:         if (!l) return;
140925:         let o = e.cultivateMgr.mbMap[t],
140926:           i = (null === o || void 0 === o ? void 0 : o.d.lvl) || 1,
140927:           s = e.UT.getFlowerLvlCfg(t, i),
140928:           r = e.UT.getFlowerLvlCfg(t, i + 1) || {},
140929:           a = i == mo.D.getMCfg("c_flowerLvl").$lvlMax,
140930:           n = s.lvlUpCost,
140931:           d = {
140932:             $$lvl: i,
140933:             $$price: s.gldCost,
140934:             $$frequencys: s.frequencys,
140935:             $$cd: e.TimeUT.getTimeDescBySec(s.cd),
140936:             $$cropGets: s.cropGets,
140937:             $$left: s.left,
140938:             $$seedGets: s.seedGets,
140939:             $$seedWgt: `${s.seedWgt / 100}%`,
140940:             $$nextFrequencys: r.frequencys
140941:               ? mo.STR.placeholder(mo.getLangText("num_times"), {
140942:                   num: r.frequencys,
140943:                 })
140944:               : "——",
140945:             $$nextCd: r.cd ? e.TimeUT.getTimeDescBySec(r.cd) : "——",
140946:             $$nextCropGets: r.cropGets
140947:               ? mo.STR.placeholder(mo.getLangText("num_of_flower"), {
140948:                   $$left: r.cropGets,
140949:                 })
140950:               : "——",
140951:             $$nextLeft: r.left
140952:               ? mo.STR.placeholder(mo.getLangText("num_of_flower"), {
140953:                   $$left: r.left,
140954:                 })
140955:               : "——",
140956:             $$nextSeedGets: r.seedGets
140957:               ? mo.STR.placeholder(mo.getLangText("seed_gets_cnt"), {
140958:                   $$seedGets: r.seedGets,
140959:                 })
140960:               : "——",
140961:             $$nextSeedWgt: r.seedWgt ? `${r.seedWgt / 100}%` : "——",
140962:             $$frequencysAdd: !!r.frequencys && s.frequencys != r.frequencys,
140963:             $$cdAdd: !!r.cd && s.cd != r.cd,
140964:             $$cropGetsAdd: !!r.cropGets && s.cropGets != r.cropGets,
140965:             $$leftAdd: !!r.left && s.left != r.left,
140966:             $$seedGetsAdd: !!r.seedGets && s.seedGets != r.seedGets,
140967:             $$seedWgtAdd: !!r.seedWgt && s.seedWgt != r.seedWgt,
140968:             $$value: a ? 1 : e.usrCtrl.getItemNum(l.eliteId),
140969:             $$max: n && n[1] ? n[1] : 1,
140970:             $$seedId: l.eliteId,
140971:             $$isMax: a,
140972:           };
140973:         this.setDataOnly(d);
140974:       }
140975:       _onSkinEnter() {
140976:         if (mo.EDITOR) return;
140977:         let t = this;
```

## E19 花卉升级花材金币消耗

来源：`tools/static-economy/game.18280.pretty.js`，行 141018–141045。

```javascript
141018:       }
141019:       _tap_btn_up() {
141020:         let t = this,
141021:           l = t.d.iid,
141022:           o = t.d.$$price,
141023:           i = e.cultivateMgr.mbMap[l],
141024:           s = (null === i || void 0 === i ? void 0 : i.d.lvl) || 1,
141025:           r = (e.UT.getFlowerLvlCfg(l, s) || {}).lvlUpCost,
141026:           a = r && r[1] ? r[1] : 1;
141027:         if (
141028:           !e.UT.checkItemEnough(11, o) ||
141029:           !e.UT.checkItemEnough(t.d.$$seedId, a)
141030:         )
141031:           return;
141032:         let n = e.cultivateMgr.getMb(l);
141033:         n &&
141034:           n.upgrade((o) => {
141035:             (e.audioMgr.playAudio(e.AUDIO_TYPE.effect, 61),
141036:               mo.MSG.show(2085),
141037:               t.initData(),
141038:               mo.emitter.emit("flowerUpgrade", { flowerId: l }));
141039:           });
141040:       }
141041:       _tap_btn_item() {
141042:         e.UT.showItemDetails(this.d.$$seedId);
141043:       }
141044:     }
141045:     ((e.PAlbumFlowerUpgradePanel = t),
```

## E20 水滴自然恢复显示

来源：`tools/static-economy/game.18280.pretty.js`，行 41486–41502。

```javascript
41486:       _getWaterRecoverSec(t) {
41487:         const o = mo.D.get("c_item", t),
41488:           n = e.usrCtrl.d.itemExtMap[t];
41489:         if (!(o && o.restore && o.reset && n))
41490:           return { perDropSec: 0, curDropLeftSec: 0 };
41491:         const i = n.cd || o.restore[0][1],
41492:           r = Math.max(1, Math.ceil(i / 1e3));
41493:         let s = n.lems - mo.DATE.now() + i;
41494:         for (; s < 0;) s += i;
41495:         return { perDropSec: r, curDropLeftSec: Math.ceil(s / 1e3) };
41496:       }
41497:       packWaterDrop() {
41498:         const t = e.usrCtrl.getItemNum(7) || 0,
41499:           o = e.usrCtrl.getItemDisplayLimit(7),
41500:           n = {
41501:             track: o,
41502:             thumb: t,
```

## E21 好友偷取下限

来源：`tools/static-economy/game.18280.pretty.js`，行 20446–20465。

```javascript
20446:           return !(!mo.DATE.isAfter(r, s) || !mo.DATE.isBefore(r, o));
20447:         }),
20448:         (e.hasStealableLand = function (t, e, r) {
20449:           if (!e) return !1;
20450:           const s = r || mo.DATE.date();
20451:           for (const r in e) {
20452:             const i = e[r];
20453:             if (!i || !i.flowerId) continue;
20454:             const a = i.stealUids || [],
20455:               l = i.elvesStealUids || [];
20456:             if (a.indexOf(t) >= 0 || l.indexOf(t) >= 0) continue;
20457:             const n = o(i.flowerId, i.lvl);
20458:             if (!n) continue;
20459:             const c = (n.cropGets || 0) - (n.left || 0);
20460:             if (!i.elvesId && a.length >= c) continue;
20461:             if (i.elvesId && (a.length > 0 || l.length > 0)) continue;
20462:             const d = i.nextTime || null;
20463:             if (3 == i.state || (2 == i.state && d && mo.DATE.isBefore(d, s)))
20464:               return !0;
20465:           }
```
