from __future__ import annotations

import csv
import json
import re
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK_DIR = ROOT / "research" / "converted_workbooks"
OUTPUT_DIR = ROOT / "research" / "cleaned"

INDEX_PAGES = {
    2014: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/t20200325_2709333.html",
    2015: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202101/t20210115_2709331.html",
    2016: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/t20200325_2709336.html",
    2017: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/t20200325_2709335.html",
    2018: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/t20200325_2709334.html",
    2019: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/t20200325_2709332.html",
    2020: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202103/t20210325_2709330.html",
    2021: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202203/t20220325_2709328.html",
    2022: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202303/t20230317_2938666.html",
    2023: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202403/t20240321_3596738.html",
    2024: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202503/t20250324_4041836.html",
    2025: "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202604/t20260403_4573683.html",
}

DIRECT_URLS = {
    2014: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020220322401495631272.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200109615970062769.xls",
    },
    2015: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202101/P020191225501238447486.xlsx",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202101/P020191225501238533126.xlsx",
    },
    2016: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200109394852568832.xlsx",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200109394852705892.xlsx",
    },
    2017: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200109402453449184.xlsx",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200109402453540600.xlsx",
    },
    2018: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200109405505375686.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200109405505467440.xls",
    },
    2019: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200324582920890909.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202003/P020200324582920923290.xls",
    },
    2020: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202103/P020210325366726188039.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202103/P020210325366726237609.xls",
    },
    2021: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202203/P020220622374586897514.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202203/P020220325364029992205.xls",
    },
    2022: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202303/P020230317333292483800.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202303/P020230317333292762018.xls",
    },
    2023: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202403/P020240322526988550924.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202403/P020240322526988603047.xls",
    },
    2024: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202503/P020250326745462325887.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202503/P020250326745462401827.xls",
    },
    2025: {
        "middle": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202604/P020260403341275428383.xls",
        "primary": "https://jw.beijing.gov.cn/xxgk/shujufab/tongjigaikuang/202604/P020260403341275507005.xls",
    },
}

AREAS = {
    "总计": "北京市",
    "西城区": "西城区",
    "朝阳区": "朝阳区",
}


def compact_label(value: object) -> str:
    return re.sub(r"\s+", "", str(value))


def select_student_sheet(path: Path) -> pd.DataFrame:
    workbook = pd.ExcelFile(path)
    sheet_name = next(
        (name for name in workbook.sheet_names if "学生基本情况" in name),
        workbook.sheet_names[0],
    )
    return pd.read_excel(path, sheet_name=sheet_name, header=None)


def rows_for_areas(frame: pd.DataFrame) -> dict[str, pd.Series]:
    found: dict[str, pd.Series] = {}
    for _, row in frame.iterrows():
        label = compact_label(row.iloc[0])
        canonical = "总计" if label in {"总计", "总計"} else label
        if canonical in AREAS:
            found[canonical] = row
    missing = set(AREAS) - set(found)
    if missing:
        raise ValueError(f"Missing area rows: {sorted(missing)}")
    return found


def as_int(value: object) -> int:
    if pd.isna(value):
        raise ValueError("Expected a numeric value, got blank")
    return int(round(float(value)))


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, object]] = []
    quality_checks: list[dict[str, object]] = []

    for year in range(2014, 2026):
        middle_name = f"{year}_middle.xlsx"
        if year == 2017:
            middle_name = "2017_middle_b.xlsx"
        primary_path = WORKBOOK_DIR / f"{year}_primary.xlsx"
        middle_path = WORKBOOK_DIR / middle_name

        primary = rows_for_areas(select_student_sheet(primary_path))
        middle = rows_for_areas(select_student_sheet(middle_path))

        for source_label, area in AREAS.items():
            p_row = primary[source_label]
            m_row = middle[source_label]
            primary_admissions = as_int(p_row.iloc[2])
            junior_admissions = as_int(m_row.iloc[3])
            senior_admissions = as_int(m_row.iloc[4])

            records.append(
                {
                    "year": year,
                    "school_year": f"{year}-{year + 1}",
                    "area": area,
                    "primary_admissions": primary_admissions,
                    "junior_high_admissions": junior_admissions,
                    "senior_high_admissions": senior_admissions,
                    "unit": "人",
                    "definition": "北京市教委教育事业统计中的招生数；初中和高中为普通中学口径",
                    "source_agency": "北京市教育委员会",
                    "source_index_url": INDEX_PAGES[year],
                    "primary_source_url": DIRECT_URLS[year]["primary"],
                    "middle_source_url": DIRECT_URLS[year]["middle"],
                    "primary_locator": f"小学分区学生基本情况/{source_label}/招生数",
                    "junior_locator": f"普通中学分区学生基本情况/{source_label}/初中招生数",
                    "senior_locator": f"普通中学分区学生基本情况/{source_label}/高中招生数",
                    "confidence": "A",
                }
            )

            # Independent consistency check inside each official workbook:
            # admissions should closely reconcile with the corresponding first-year count.
            quality_checks.extend(
                [
                    {
                        "year": year,
                        "area": area,
                        "metric": "小学招生数 vs 小学一年级在校生",
                        "reported": primary_admissions,
                        "comparison": as_int(p_row.iloc[5]),
                        "difference": primary_admissions - as_int(p_row.iloc[5]),
                    },
                    {
                        "year": year,
                        "area": area,
                        "metric": "初中招生数 vs 初中一年级在校生",
                        "reported": junior_admissions,
                        "comparison": as_int(m_row.iloc[8]),
                        "difference": junior_admissions - as_int(m_row.iloc[8]),
                    },
                    {
                        "year": year,
                        "area": area,
                        "metric": "高中招生数 vs 高中一年级在校生",
                        "reported": senior_admissions,
                        "comparison": as_int(m_row.iloc[14]),
                        "difference": senior_admissions - as_int(m_row.iloc[14]),
                    },
                ]
            )

    data_path = OUTPUT_DIR / "education_admissions_2014_2025.json"
    data_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    with (OUTPUT_DIR / "education_admissions_2014_2025.csv").open(
        "w", encoding="utf-8-sig", newline=""
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=list(records[0].keys()))
        writer.writeheader()
        writer.writerows(records)

    checks_path = OUTPUT_DIR / "internal_consistency_checks.json"
    checks_path.write_text(
        json.dumps(quality_checks, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    max_abs_difference = max(abs(int(item["difference"])) for item in quality_checks)
    print(f"Wrote {len(records)} area-year records to {data_path}")
    print(f"Wrote {len(quality_checks)} internal consistency checks to {checks_path}")
    print(f"Largest admissions vs first-year absolute difference: {max_abs_difference}")


if __name__ == "__main__":
    main()
