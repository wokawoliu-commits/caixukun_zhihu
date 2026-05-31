# SKP 规则审计报告

Generated: 2026-05-30

## Scope

- Input SKP rows: 427
- SKP-covered collaborations: 70
- Rows without any rule issue: 366
- Impacted collaborations: 27
- High-priority impacted collaborations: 0

## Severity Summary

| Severity | Count |
|---|---:|
| high | 0 |
| medium | 63 |
| low | 39 |

## Issue Summary

| Issue type | Count |
|---|---:|
| missing_product_url | 51 |
| missing_product_image | 46 |
| duplicate_image_across_distinct_products | 4 |
| series_image_reused_as_product_image | 1 |

## High Priority Samples

| collab_id | skp_id | issue_type | product_name | recommendation |
|---|---|---|---|---|
| - | - | - | - | - |

## Interpretation

- `media_url_used_as_product_url` and `product_url_equals_non_product_source` are the same class of issue as the Red Wing x HUMAN MADE case: a media or series page has been treated as a product page.
- `missing_product_image` means the row may be useful textually but is weak for the HTML SKP modal until a real product image is found.
- `duplicate_image_across_distinct_products` should be reviewed manually because some official lineup images are legitimate, but repeated images should not be presented as distinct product photos.
- Rows marked `press_listed` are not necessarily wrong; they should not pretend to have official product URLs or product images unless those assets are independently verified.

## Output

- Full issue CSV: `skp_rule_audit_q1_2026.csv`
