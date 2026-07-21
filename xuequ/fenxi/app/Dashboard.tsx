"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import admissionsRaw from "../research/cleaned/education_admissions_2014_2025.json";
import checksRaw from "../research/cleaned/internal_consistency_checks.json";
import bulletinsRaw from "../research/cleaned/statistical_bulletin_checks.json";
import examRaw from "../research/cleaned/exam_metrics.json";

type Area = "北京市" | "西城区" | "朝阳区";
type MetricId = "primary" | "junior" | "senior" | "gaokao" | "undergraduate";

type AdmissionRecord = {
  year: number;
  school_year: string;
  area: Area;
  primary_admissions: number;
  junior_high_admissions: number;
  senior_high_admissions: number;
  source_index_url: string;
  primary_source_url: string;
  middle_source_url: string;
  confidence: string;
  unit?: string;
  definition?: string;
  source_agency?: string;
  primary_locator?: string;
  junior_locator?: string;
  senior_locator?: string;
};

type ExamRecord = {
  year: number;
  area: Area;
  value: number;
  display?: string;
  scope?: string;
  precision?: string;
  confidence: string;
  source: string;
};

type UndergraduateRecord = {
  year: number;
  area: Area;
  value: number;
  cutoff?: number;
  confidence: string;
  source: string;
};

type ConsistencyCheck = {
  year: number;
  area: Area;
  metric: string;
  reported: number;
  comparison: number;
  difference: number;
};

type TrendPoint = {
  area: Area;
  year: number;
  value: number;
};

type SourceDetail = {
  area: Area;
  year: number;
  metric: MetricId;
  value: number | null;
  display?: string;
  source?: string;
  sourceIndex?: string;
  sourceName: string;
  locator?: string;
  definition?: string;
  confidence?: string;
  precision?: string;
  note?: string;
};

const admissions = admissionsRaw as AdmissionRecord[];
const checks = checksRaw as ConsistencyCheck[];
const exam = examRaw as {
  gaokao_population: ExamRecord[];
  undergraduate_admitted: UndergraduateRecord[];
  undergraduate_above_cutoff: UndergraduateRecord[];
  notes: Record<string, string>;
};

const AREAS: Area[] = ["北京市", "西城区", "朝阳区"];
const YEARS = Array.from({ length: 13 }, (_, index) => 2014 + index);
const AREA_COLORS: Record<Area, string> = {
  北京市: "#c6402c",
  西城区: "#1f5e67",
  朝阳区: "#a2772c",
};

const METRICS: Record<
  MetricId,
  { label: string; short: string; definition: string }
> = {
  primary: {
    label: "小学入学",
    short: "小学",
    definition: "小学教育招生数，包含一贯制学校小学部。",
  },
  junior: {
    label: "初中入学",
    short: "初中",
    definition: "普通初中招生数。",
  },
  senior: {
    label: "高中入学",
    short: "普高",
    definition: "普通高中招生数，不含中职。",
  },
  gaokao: {
    label: "高考人口",
    short: "高考",
    definition: "按原发布口径保留报名、实考或参加统一高考。",
  },
  undergraduate: {
    label: "本科线及以上",
    short: "本科线",
    definition: "一分一段表中普通本科控制线及以上人数，不等于实际录取。",
  },
};

const formatter = new Intl.NumberFormat("zh-CN");
const compactFormatter = new Intl.NumberFormat("zh-CN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function admissionValue(record: AdmissionRecord | undefined, metric: MetricId) {
  if (!record) return null;
  if (metric === "primary") return record.primary_admissions;
  if (metric === "junior") return record.junior_high_admissions;
  if (metric === "senior") return record.senior_high_admissions;
  return null;
}

function getValue(area: Area, year: number, metric: MetricId) {
  if (metric === "gaokao") {
    return exam.gaokao_population.find((item) => item.area === area && item.year === year)
      ?.value ?? null;
  }
  if (metric === "undergraduate") {
    return exam.undergraduate_above_cutoff.find(
      (item) => item.area === area && item.year === year,
    )?.value ?? null;
  }
  const record = admissions.find((item) => item.area === area && item.year === year);
  return admissionValue(record, metric);
}

function getSourceDetail(area: Area, year: number, metric: MetricId): SourceDetail {
  if (metric === "gaokao") {
    const record = exam.gaokao_population.find(
      (item) => item.area === area && item.year === year,
    );
    return {
      area,
      year,
      metric,
      value: record?.value ?? null,
      display: record?.display,
      source: record?.source,
      sourceName: record ? "原始高考公开信息" : "暂未找到稳定公开来源",
      locator: record ? `高考人口 · ${record.scope ?? "原始发布口径"}` : undefined,
      confidence: record?.confidence,
      precision: record?.precision,
      note: record
        ? "报名、实考与统一高考人数按原始发布口径保留，不能直接视为同一统计序列。"
        : "该区域该年度暂未找到可公开核验的高考人数。",
    };
  }

  if (metric === "undergraduate") {
    const record = exam.undergraduate_above_cutoff.find(
      (item) => item.area === area && item.year === year,
    );
    return {
      area,
      year,
      metric,
      value: record?.value ?? null,
      source: record?.source,
      sourceName: record ? "北京教育考试院一分一段表" : "暂未找到稳定公开来源",
      locator: record
        ? `普通本科控制线 ${record.cutoff ?? ""} 分及以上累计人数`
        : undefined,
      confidence: record?.confidence,
      note: record
        ? "这是普通本科控制线及以上人数，不等于最终本科录取人数。"
        : "区级本科线及以上绝对人数暂未找到稳定公开口径。",
    };
  }

  const record = admissions.find((item) => item.area === area && item.year === year);
  const locator = metric === "primary"
    ? record?.primary_locator
    : metric === "junior"
      ? record?.junior_locator
      : record?.senior_locator;
  const source = metric === "primary" ? record?.primary_source_url : record?.middle_source_url;
  const value = admissionValue(record, metric);

  return {
    area,
    year,
    metric,
    value,
    source,
    sourceIndex: record?.source_index_url,
    sourceName: record?.source_agency ?? "北京市教育委员会",
    locator,
    definition: record?.definition ?? METRICS[metric].definition,
    confidence: record?.confidence,
    note: value === null ? "该区域该年度暂未找到可公开核验的招生数。" : undefined,
  };
}

function TrendCanvas({
  metric,
  activeYear,
  onPointSelect,
}: {
  metric: MetricId;
  activeYear: number;
  onPointSelect: (point: TrendPoint) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef<{
    width: number;
    height: number;
    padding: { top: number; right: number; bottom: number; left: number };
    maximum: number;
  } | null>(null);

  const series = useMemo(
    () =>
      AREAS.map((area) => ({
        area,
        values: YEARS.map((year) => ({ year, value: getValue(area, year, metric) })),
      })),
    [metric],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const draw = () => {
      const rect = parent.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const height = width < 640 ? 300 : 390;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.scale(ratio, ratio);

      const styles = getComputedStyle(document.documentElement);
      const grid = styles.getPropertyValue("--line").trim() || "#d9d3c6";
      const inkSoft = styles.getPropertyValue("--ink-soft").trim() || "#6c665c";
      const paper = styles.getPropertyValue("--paper").trim() || "#f5f0e6";
      context.fillStyle = paper;
      context.fillRect(0, 0, width, height);

      const padding = { top: 26, right: 22, bottom: 44, left: width < 640 ? 50 : 72 };
      const innerWidth = width - padding.left - padding.right;
      const innerHeight = height - padding.top - padding.bottom;
      const all = series.flatMap((item) => item.values.map((point) => point.value ?? 0));
      const maximum = Math.max(...all, 1) * 1.08;
      const xAt = (index: number) => padding.left + (index / (YEARS.length - 1)) * innerWidth;
      const yAt = (value: number) => padding.top + innerHeight - (value / maximum) * innerHeight;
      layoutRef.current = { width, height, padding, maximum };

      context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.textBaseline = "middle";
      for (let row = 0; row <= 4; row += 1) {
        const y = padding.top + (row / 4) * innerHeight;
        const value = maximum * (1 - row / 4);
        context.strokeStyle = grid;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(width - padding.right, y);
        context.stroke();
        context.fillStyle = inkSoft;
        context.textAlign = "right";
        context.fillText(compactFormatter.format(Math.round(value)), padding.left - 10, y);
      }

      const activeIndex = YEARS.indexOf(activeYear);
      if (activeIndex >= 0) {
        context.fillStyle = "rgba(198, 64, 44, 0.07)";
        context.fillRect(xAt(activeIndex) - 16, padding.top, 32, innerHeight);
      }

      series.forEach(({ area, values }) => {
        context.strokeStyle = AREA_COLORS[area];
        context.fillStyle = AREA_COLORS[area];
        context.lineWidth = area === "北京市" ? 2.8 : 2;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();
        let drawing = false;
        values.forEach((point, index) => {
          if (point.value === null) {
            drawing = false;
            return;
          }
          const x = xAt(index);
          const y = yAt(point.value);
          if (!drawing) {
            context.moveTo(x, y);
            drawing = true;
          } else {
            context.lineTo(x, y);
          }
        });
        context.stroke();
        values.forEach((point, index) => {
          if (point.value === null) return;
          const x = xAt(index);
          const y = yAt(point.value);
          context.beginPath();
          context.fillStyle = point.year === activeYear ? paper : AREA_COLORS[area];
          context.arc(x, y, point.year === activeYear ? 5 : 2.4, 0, Math.PI * 2);
          context.fill();
          if (point.year === activeYear) {
            context.strokeStyle = AREA_COLORS[area];
            context.lineWidth = 2;
            context.stroke();
          }
        });
      });

      YEARS.forEach((year, index) => {
        if (width < 640 && index % 2 !== 0 && year !== activeYear) return;
        context.fillStyle = year === activeYear ? "#c6402c" : inkSoft;
        context.font = year === activeYear
          ? "700 11px ui-monospace, SFMono-Regular, Menlo, monospace"
          : "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.textAlign = "center";
        context.fillText(String(year).slice(2), xAt(index), height - 18);
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [series, activeYear]);

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const layout = layoutRef.current;
    if (!canvas || !layout) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const innerWidth = layout.width - layout.padding.left - layout.padding.right;
    const innerHeight = layout.height - layout.padding.top - layout.padding.bottom;
    const xAt = (index: number) => layout.padding.left + (index / (YEARS.length - 1)) * innerWidth;
    const yAt = (value: number) => layout.padding.top + innerHeight - (value / layout.maximum) * innerHeight;

    let closest: (TrendPoint & { distance: number }) | null = null;
    series.forEach(({ area, values }) => {
      values.forEach((point, index) => {
        if (point.value === null) return;
        const distance = Math.hypot(x - xAt(index), y - yAt(point.value));
        if (!closest || distance < closest.distance) {
          closest = { area, year: point.year, value: point.value, distance };
        }
      });
    });

    if (closest && closest.distance <= (layout.width < 640 ? 18 : 22)) {
      onPointSelect({ area: closest.area, year: closest.year, value: closest.value });
    }
  };

  return (
    <div className="chart-canvas-wrap">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        tabIndex={0}
        aria-label={`${METRICS[metric].label}，${YEARS[0]}至${YEARS[YEARS.length - 1]}年，北京市、西城区、朝阳区趋势图`}
        role="img"
      />
    </div>
  );
}

function ValueDisplay({ value }: { value: number | null }) {
  if (value === null) return <span className="missing">未公开</span>;
  return <>{formatter.format(value)}</>;
}

function precisionLabel(precision?: string) {
  if (precision === "rounded") return "约数";
  if (precision === "lower_bound_rounded") return "约数 / 下限";
  return precision === "exact" ? "精确值" : precision;
}

function SourceInspector({
  detail,
  onClose,
}: {
  detail: SourceDetail;
  onClose: () => void;
}) {
  return (
    <aside className="source-inspector" aria-live="polite">
      <div className="source-inspector-head">
        <div>
          <span className="eyebrow">已选数据 · 来源</span>
          <h3>{METRICS[detail.metric].label} · {detail.area} · {detail.year}</h3>
        </div>
        <button type="button" className="source-inspector-close" onClick={onClose} aria-label="关闭来源详情">
          关闭 ×
        </button>
      </div>
      <div className="source-inspector-grid">
        <div className="source-inspector-value">
          <span>数据值</span>
          <strong>{detail.display ?? (detail.value === null ? "未公开" : formatter.format(detail.value))}</strong>
        </div>
        <div>
          <span>口径 / 定位</span>
          <p>{detail.locator ?? detail.definition ?? "该数据没有公开的细分定位。"}</p>
        </div>
        <div>
          <span>来源机构</span>
          <p>{detail.sourceName}</p>
        </div>
        <div>
          <span>质量标记</span>
          <p>{[detail.confidence && `质量 ${detail.confidence}`, precisionLabel(detail.precision)].filter(Boolean).join(" · ") || "未标记"}</p>
        </div>
      </div>
      {detail.note && <p className="source-inspector-note">{detail.note}</p>}
      <div className="source-inspector-actions">
        {detail.source ? (
          <a href={detail.source} target="_blank" rel="noreferrer">打开原始来源 ↗</a>
        ) : (
          <span>当前筛选没有可打开的原始链接</span>
        )}
        {detail.sourceIndex && (
          <a href={detail.sourceIndex} target="_blank" rel="noreferrer">打开来源总入口 ↗</a>
        )}
      </div>
    </aside>
  );
}

export default function Dashboard() {
  const [area, setArea] = useState<Area>("北京市");
  const [year, setYear] = useState(2025);
  const [metric, setMetric] = useState<MetricId>("primary");
  const [showAllSources, setShowAllSources] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceDetail | null>(null);

  const selectedAdmission = admissions.find(
    (item) => item.area === area && item.year === year,
  );
  const selectedExam = exam.gaokao_population.find(
    (item) => item.area === area && item.year === year,
  );
  const selectedUndergraduate = exam.undergraduate_above_cutoff.find(
    (item) => item.area === area && item.year === year,
  );
  const selectedChecks = checks.filter((item) => item.area === area && item.year === year);
  const bulletin = bulletinsRaw.find((item) => item.year === year);

  const metricCards: Array<{
    id: MetricId;
    value: number | null;
    note: string;
    confidence: string;
    source?: string;
  }> = [
    {
      id: "primary",
      value: selectedAdmission?.primary_admissions ?? null,
      note: "小学教育招生",
      confidence: "A",
      source: selectedAdmission?.primary_source_url,
    },
    {
      id: "junior",
      value: selectedAdmission?.junior_high_admissions ?? null,
      note: "普通初中招生",
      confidence: "A",
      source: selectedAdmission?.middle_source_url,
    },
    {
      id: "senior",
      value: selectedAdmission?.senior_high_admissions ?? null,
      note: "普通高中招生",
      confidence: "A",
      source: selectedAdmission?.middle_source_url,
    },
    {
      id: "gaokao",
      value: selectedExam?.value ?? null,
      note: selectedExam?.scope ?? "区级连续口径未公开",
      confidence: selectedExam?.confidence ?? "—",
      source: selectedExam?.source,
    },
    {
      id: "undergraduate",
      value: selectedUndergraduate?.value ?? null,
      note: selectedUndergraduate
        ? `${selectedUndergraduate.cutoff}分及以上，非录取数`
        : "区级绝对人数未公开",
      confidence: selectedUndergraduate?.confidence ?? "—",
      source: selectedUndergraduate?.source,
    },
  ];

  const sourceRows = metricCards.filter((card) => card.source);
  const sourceRowsVisible = showAllSources ? sourceRows : sourceRows.slice(0, 3);
  const selectedTrendValue = getValue(area, year, metric);
  const priorTrendValue = getValue(area, year - 1, metric);
  const yearChange =
    selectedTrendValue !== null && priorTrendValue !== null
      ? ((selectedTrendValue - priorTrendValue) / priorTrendValue) * 100
      : null;

  const medianDifference = useMemo(() => {
    const values = checks
      .map((item) => Math.abs(item.difference) / item.reported)
      .sort((left, right) => left - right);
    return values[Math.floor(values.length / 2)] * 100;
  }, []);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="京学龄首页">
          <span className="brand-mark">京</span>
          <span>
            <strong>京学龄</strong>
            <small>BEIJING SCHOOL-AGE OBSERVATORY</small>
          </span>
        </a>
        <nav aria-label="页面导航">
          <a href="#trend">趋势</a>
          <a href="#verify">核验</a>
          <a href="#sources">来源</a>
          <a href="#method">方法</a>
        </nav>
        <span className="update-stamp">本地离线版 · 数据至 2026.07</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-kicker">2014—2026 · 3个区域 · 5类人口指标</div>
        <div className="hero-grid">
          <div>
            <h1>
              看见北京每一届
              <br />
              <em>学生的流量。</em>
            </h1>
          </div>
          <div className="hero-copy">
            <p>
              一套可追溯到原始工作簿的入学人口账本。精确数、约数、报名、实考、上线与录取分别标记；没有公开的数据，就保持空白。
            </p>
            <div className="hero-finding">
              <span>最新观察</span>
              <strong>2025 年全市小学招生较 2023 峰值回落 22.0%</strong>
            </div>
          </div>
        </div>

        <div className="control-rail" aria-label="数据筛选">
          <div className="control-group">
            <span className="control-label">区域</span>
            <div className="segmented">
              {AREAS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={area === item ? "active" : ""}
                  onClick={() => {
                    setArea(item);
                    setSelectedSource(getSourceDetail(item, year, metric));
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="year-control">
            <div className="year-heading">
              <span className="control-label">学年起始年</span>
              <div className="year-heading-actions">
                <output>{year}</output>
                <button
                  type="button"
                  className={year === 2026 ? "latest-year-button active" : "latest-year-button"}
                  aria-pressed={year === 2026}
                  onClick={() => {
                    setYear(2026);
                    setSelectedSource(getSourceDetail(area, 2026, metric));
                  }}
                >
                  查看 2026
                </button>
              </div>
            </div>
            <input
              type="range"
              min="2014"
              max="2026"
              step="1"
              value={year}
              onChange={(event) => {
                const nextYear = Number(event.target.value);
                setYear(nextYear);
                setSelectedSource(getSourceDetail(area, nextYear, metric));
              }}
              aria-label="选择年份"
            />
            <div className="range-labels">
              <span>2014</span>
              <span>2026</span>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-strip" aria-label={`${area}${year}年核心指标`}>
        {metricCards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className={`metric-card ${metric === card.id ? "selected" : ""}`}
            onClick={() => {
              setMetric(card.id);
              setSelectedSource(getSourceDetail(area, year, card.id));
            }}
            aria-label={`${METRICS[card.id].label}，点击查看数据来源`}
          >
            <span className="metric-index">0{index + 1}</span>
            <span className="metric-label">{METRICS[card.id].label}</span>
            <strong>
              <ValueDisplay value={card.value} />
            </strong>
            <small>{card.note}</small>
          </button>
        ))}
      </section>

      {selectedSource && (
        <SourceInspector detail={selectedSource} onClose={() => setSelectedSource(null)} />
      )}

      <section className="trend-section" id="trend">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / 趋势</span>
            <h2>{METRICS[metric].label}</h2>
          </div>
          <div className="trend-readout">
            <span>{area} · {year}</span>
            <strong><ValueDisplay value={selectedTrendValue} /></strong>
            <small>
              {yearChange === null
                ? "无可比上年同口径数据"
                : `较上年 ${yearChange >= 0 ? "+" : ""}${yearChange.toFixed(1)}%`}
            </small>
          </div>
        </div>

        <div className="metric-tabs" role="tablist" aria-label="选择趋势指标">
          {(Object.keys(METRICS) as MetricId[]).map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={metric === item}
              key={item}
              className={metric === item ? "active" : ""}
              onClick={() => {
                setMetric(item);
                setSelectedSource(getSourceDetail(area, year, item));
              }}
            >
              {METRICS[item].short}
            </button>
          ))}
        </div>

        <div className="chart-shell">
          <p className="chart-click-hint">点击趋势图上的数据点，可查看该年、该区域的原始来源。</p>
          <TrendCanvas
            metric={metric}
            activeYear={year}
            onPointSelect={(point) => {
              setArea(point.area);
              setYear(point.year);
              setSelectedSource(getSourceDetail(point.area, point.year, metric));
            }}
          />
          <div className="chart-legend">
            {AREAS.map((item) => (
              <span key={item}>
                <i style={{ background: AREA_COLORS[item] }} /> {item}
              </span>
            ))}
          </div>
          <p className="chart-note">
            {METRICS[metric].definition}
            {metric === "gaokao" && " 空档表示该区该年未找到官方公开数。"}
            {metric === "undergraduate" && " 区级绝对人数不做比例反推。"}
          </p>
        </div>
      </section>

      <section className="verify-section" id="verify">
        <div className="section-heading narrow">
          <div>
            <span className="eyebrow">02 / 口径核验</span>
            <h2>一条数，至少问三遍。</h2>
          </div>
          <p>
            同一指标从原始工作簿内部、另一政府统计产品、跨年度流量三个方向复核。差异不被抹平，而是作为口径信息保留下来。
          </p>
        </div>

        <div className="verification-grid">
          <article className="verify-feature">
            <span className="verify-number">108</span>
            <h3>组内部一致性检查</h3>
            <p>
              招生数对照对应一年级在校生。全部检查的中位相对差仅 {medianDifference.toFixed(2)}%，90% 的检查差异低于 0.93%。
            </p>
            <div className="check-list">
              {selectedChecks.map((item) => {
                const relative = Math.abs(item.difference) / item.reported * 100;
                return (
                  <div key={item.metric}>
                    <span>{item.metric.replace(" vs ", " / ")}</span>
                    <strong>{relative.toFixed(2)}%</strong>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="verify-card">
            <span className="verify-tag">独立来源</span>
            <h3>统计公报四舍五入复核</h3>
            {area === "北京市" ? (
              bulletin ? (
                <>
                  <p>
                    {year} 年市统计局公报报出小学 {compactFormatter.format(bulletin.primary)}、初中 {compactFormatter.format(bulletin.junior)}、普高 {compactFormatter.format(bulletin.senior)}。
                  </p>
                  <a href={bulletin.source} target="_blank" rel="noreferrer">查看市统计局公报 ↗</a>
                </>
              ) : (
                <p>2026 年教育事业招生统计尚未发布；当前只展示已经公开的高考报名和分数分布数据。</p>
              )
            ) : area === "西城区" ? (
              <p>
                西城统计年鉴终值与市教委分区工作簿在 2014—2024 年逐项一致，2025 年再由区教育概述复核。
              </p>
            ) : (
              <p>
                朝阳区年鉴与市教委分区表趋势一致，但 2022—2024 年存在 8—120 人的小幅差值；保留市教委统一序列，并把年鉴视为独立复核而非覆盖原值。
              </p>
            )}
          </article>

          <article className="verify-card warning">
            <span className="verify-tag">不能混用</span>
            <h3>“上本科”有两种数</h3>
            <p>
              实际本科录取人数与普通本科线及以上人数不是同一指标。2010—2019 年只保留可核实的录取数；2020 年后展示更稳定的一分一段上线数，绝不连成一条同口径曲线。
            </p>
          </article>
        </div>
      </section>

      <section className="sources-section" id="sources">
        <div className="section-heading narrow">
          <div>
            <span className="eyebrow">03 / 来源账本</span>
            <h2>每个数字都能回到原件。</h2>
          </div>
          <div className="source-intro">
            <p>当前筛选：{area} · {year}。链接直达政府页面、工作簿或考试院一分一段表。</p>
            <a className="download-link" href="downloads/beijing-education-population-data.xlsx" download>
              下载完整 Excel 数据包 ↓
            </a>
          </div>
        </div>

        <div className="source-ledger">
          <div className="ledger-row ledger-head">
            <span>指标</span><span>数值</span><span>口径 / 质量</span><span>原始来源</span>
          </div>
          {sourceRowsVisible.map((card) => (
            <div className="ledger-row" key={card.id}>
              <span>{METRICS[card.id].label}</span>
              <button
                type="button"
                className="ledger-value-button"
                onClick={() => setSelectedSource(getSourceDetail(area, year, card.id))}
                aria-label={`${METRICS[card.id].label}，点击查看数据来源`}
              >
                <strong><ValueDisplay value={card.value} /></strong>
              </button>
              <span>{card.note} · {card.confidence}</span>
              <a href={card.source} target="_blank" rel="noreferrer">打开原件 ↗</a>
            </div>
          ))}
          {sourceRows.length === 0 && (
            <div className="ledger-empty">该筛选下暂无可公开的原始来源。</div>
          )}
        </div>
        {sourceRows.length > 3 && (
          <button
            className="text-button"
            type="button"
            onClick={() => setShowAllSources((current) => !current)}
          >
            {showAllSources ? "收起来源" : `展开全部 ${sourceRows.length} 条来源`} ↘
          </button>
        )}
      </section>

      <section className="method-section" id="method">
        <div>
          <span className="eyebrow">04 / 方法与缺口</span>
          <h2>精确，但不假装完整。</h2>
        </div>
        <div className="method-columns">
          <div>
            <h3>主序列</h3>
            <p>
              入学人口以北京市教委“教育统计概况”原始工作簿为主，抽取“招生数”而非招生计划。初中、高中限定普通中学口径。
            </p>
          </div>
          <div>
            <h3>高考人口</h3>
            <p>
              报名人数、统一高考人数与实际参加人数分别记录。2020、2023 的全市数属于参加口径，与相邻报名年份比较时需谨慎。
            </p>
          </div>
          <div>
            <h3>本科结果</h3>
            <p>
              2020—2026 用考试院控制线累计人数表示“本科线及以上”。这不是实际录取数；区级绝对数没有稳定公开来源。
            </p>
          </div>
          <div>
            <h3>2026 状态</h3>
            <p>
              2026 年全市高考报名 84,900 人；普通本科控制线 429 分及以上累计 59,457 人。后者是上线人数，不是最终录取数。
            </p>
          </div>
        </div>

        <div className="actual-admissions">
          <div>
            <span className="verify-tag">历史补充</span>
            <h3>可核实的本科实际录取人数</h3>
            <p>该序列与“本科线及以上”分开展示，空年不插值。</p>
          </div>
          <div className="admission-ticks">
            {exam.undergraduate_admitted.map((item) => (
              <a key={item.year} href={item.source} target="_blank" rel="noreferrer">
                <span>{item.year}</span>
                <strong>{formatter.format(item.value)}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">京</span>
          <span><strong>京学龄</strong><small>PUBLIC DATA, EXPLICIT DEFINITIONS</small></span>
        </div>
        <p>核心数据与图表离线可用；原始来源链接仅在点击时需要联网。</p>
        <a href="https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/" target="_blank" rel="noreferrer">北京市教委教育统计总入口 ↗</a>
      </footer>
    </main>
  );
}
