# 时间格式与升级面板：源码行号复核

以下为 430.0.44 内置代码的原始行号摘录，仅用于复核。

## 时间格式函数

```text
39000:                     (Math.floor(e / 60) % 60) +
39001:                     mo.getLangText("public_minute")),
39002:             o
39003:           );
39004:         }),
39005:         (t.getTimeDescBySec = function (e) {
39006:           let t = mo.STR;
39007:           return t.fill(Math.floor(e / 60), "00") + ":" + t.fill(e % 60, "00");
39008:         }),
39009:         (t.fmtMaxTimeByHMS = function (e, t, o, n = !0, i = !1) {
39010:           let r = "",
39011:             s = Math.floor(e / 24);
39012:           if (s > 0) r = s + 1 + mo.getLangText("public_day");
39013:           else {
39014:             let s = e % 24;
39015:             if (s > 0) r = s + 1 + mo.getLangText("public_hour");
39016:             else if (n) {
39017:               let e = t % 60;
39018:               r =
39019:                 e > 0
39020:                   ? e + 1 + mo.getLangText("public_minute")
39021:                   : i
39022:                     ? (o % 60) + mo.getLangText("public_second")
39023:                     : 1 + mo.getLangText("public_minute");
39024:             } else r = 1 + mo.getLangText("public_hour");
39025:           }
39026:           return r;
39027:         }),
39028:         (t.fmtMaxTimeByDate = function (t, o, n = !0, i = !1) {
39029:           let r = mo.DATE.minus(t, o, "ms", "floor") / 1e3,
39030:             s = r / 60,
39031:             a = s / 60;
39032:           return e.TimeUT.fmtMaxTimeByHMS(
39033:             Math.floor(a),
39034:             Math.floor(s) % 60,
39035:             Math.floor(r) % 60,
39036:             n,
39037:             i,
39038:           );
39039:         }),
39040:         (t.getTimeDescByDate = function (e) {
39041:           let t = mo.DATE.minus(mo.DATE.date(), e),
39042:             o = (t / 864e5) << 0,
39043:             n = ((t % 864e5) / 36e5) << 0,
39044:             i = ((t % 36e5) / 6e4) << 0,
39045:             r = ((t % 6e4) / 1e3) << 0;
39046:           return o > 0
39047:             ? mo.STR.fmt(mo.getLangText("public_beforeDay"), o)
39048:             : n > 0
39049:               ? mo.STR.fmt(mo.getLangText("public_befoteHour"), n)
39050:               : i > 0
39051:                 ? mo.STR.fmt(mo.getLangText("public_beforeMinute"), i)
39052:                 : mo.STR.fmt("%s秒前", Math.max(1, r));
39053:         }),
39054:         (t.fmtTime06 = function (t, o = !0) {
39055:           let n = mo.DATE.date(t),
39056:             i = e.UT_TIME.getYear(n),
39057:             r = o ? "00" : "",
39058:             s = mo.STR.fill(e.UT_TIME.getMonth(n) + 1, r),
39059:             a = mo.STR.fill(e.UT_TIME.getDate(n), r);
39060:           return (
39061:             i +
39062:             mo.getLangText("public_year") +
39063:             s +
39064:             mo.getLangText("public_month") +
39065:             a +
39066:             mo.getLangText("public_oneday")
39067:           );
39068:         }),
39069:         (t.fmtTime07 = function (e, t = !0) {
39070:           let o = t ? "00" : "",
```

## 升级面板取值

```text
140917:       }
140918:       _onItemChange() {
140919:         this.initData();
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
```
