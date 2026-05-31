# Stella-Like Official Gap Audit

Generated: 2026-05-31

## Scope

This audit targets the exact failure pattern seen in Stella McCartney x Jeff Koons: the record has clear A-side official domain or sales-channel clues, but the current source path is media-first, so official SKP extraction may never run.

- Risk records checked: 29
- High risk: 20
- Medium risk: 9
- Official candidate pages with product signals: 10
- Official candidate pages with A/B signals: 0

## Risk Level

| risk_level | count |
|---|---:|
| high | 20 |
| medium | 9 |

## Candidate Status

| best_candidate_status | count |
|---|---:|
| not_found | 19 |
| official_page_has_product_signals | 10 |

## Priority Queue

| collab_id | risk | candidate_status | series | best_candidate_url | next_action |
|---|---|---|---|---|---|
| Q12026-018 | high | official_page_has_product_signals | Fast & Furious x PUMA Basketball Collection | https://us.puma.com/us/en | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-024 | high | official_page_has_product_signals | J.Crew Rollneck Remix | https://www.jcrew.com/search/womens?Ntrm=Buci%20NYC | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-026 | high | official_page_has_product_signals | Harlem's Fashion Row x Gap | https://www.gap.com/browse/search.do?searchText=Harlem%27s%20Fashion%20Row | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-035 | high | official_page_has_product_signals | Cupshe x Jessie James Decker Casa del Sol | https://www.cupshe.com/search?q=Jessie%20James%20Decker | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-052 | high | official_page_has_product_signals | Tory Burch x The Explorers Club Women in Exploration | https://www.toryburch.com/en-us/search/?q=The%20Explorers%20Club | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-062 | high | official_page_has_product_signals | Disney \| BLACKPINK Collection by Complex | https://www.complex.com/search?q=BLACKPINK | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-069 | high | official_page_has_product_signals | Target x Roller Rabbit Spring Getaway Collection | https://www.target.com/s?searchTerm=Roller%20Rabbit | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-015 | high | not_found | Pandora x Bridgerton Collection | https://us.pandora.net/en | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-028 | high | not_found | Frame x Amelia Gray Collaboration Restock and Expansion | https://frame-store.com/collections/frame-for-amelia-gray | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-029 | high | not_found | Ray-Ban by A$AP Rocky Metal Eyewear Collection | https://www.ray-ban.com/webapp/wcs/stores/error404.jsp | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-039 | high | not_found | RAEN SS26 Ambassador Collaborations | https://raen.com/collections/raen-for-coco-ho | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-044 | high | not_found | The North Face x Cecilie Bahnsen Third Collaboration | https://www.thenorthface.com/en-us/collections/the-north-face-for-cecilie-bahnsen | Search official collection page manually; current generated official URLs did not prove the A/B page. |
| Q12026-045 | high | not_found | Kith x On Running K-Tech | https://kith.com/collections/kith-for-on-running | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-046 | high | not_found | Thom Browne x ASICS GEL-KAYANO 14 | https://thombrowne.com/collections/thom-browne-for-asics | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-053 | high | not_found | Loeffler Randall x Underwater Weaving Basket Tote | https://loefflerrandall.com/collections/loeffler-randall-for-underwater-weaving | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-054 | high | not_found | Stetson & THE GREAT. Western Collection | https://stetson.com/collections/the-great-for-stetson | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-057 | high | not_found | Express x bebe Y2K Capsule | https://www.express.com/collections/express-for-bebe | Search official collection page manually; current generated official URLs did not prove the A/B page. |
| Q12026-079 | high | not_found | Bad Bunny x adidas BadBo 1.0 Rise Apparel Capsule | https://www.adidas.com/collections/adidas-for-bad-bunny | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-084 | high | not_found | Pacsun x LAFC 2026 Season Opener Drop | https://www.pacsun.com/collections/pacsun-for-los-angeles-football-club-lafc | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-095 | high | not_found | Macy's Bar III x Khoboso Nale Knitwear Capsule | https://www.macys.com/shop/search?keyword=Khoboso%20Nale | Manual browser check or regional official URL needed; automated fetch blocked or unstable. |
| Q12026-040 | medium | official_page_has_product_signals | Converse x Oshi no Ko Collection | https://www.converse.com/collections/converse-for-oshi-no-ko | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-091 | medium | official_page_has_product_signals | Weekend Max Mara x Sebago A Weekend with Sebago SS2026 | https://us.weekendmaxmara.com/search?q=Sebago | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |
| Q12026-113 | medium | official_page_has_product_signals | Converse x Hello Kitty and Friends with Swarovski | https://www.converse.com/collections/converse-for-hello-kitty-and-friends | Promote candidate URL into source/SKP extraction path; parse product cards before media pages. |

## Method

- Generate expected official domains from sales channels and a known A-side brand-domain map.
- Generate search URLs for each official domain using B-side and series tokens.
- Fetch public pages only, without login, captcha bypass, or paid sources.
- Mark a candidate as product-signal positive only when the official page contains A/B tokens plus commerce/product markers.
