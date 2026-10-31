# PH Outlay Movement — Specification

Status: **Draft — architecture settled, build not started.** No application code is written until the project owner gives the explicit "build" signal.

Short name in the app: **Outlay**.

---

## 1. Purpose

Outlay shows ordinary Filipino citizens how the money for a government project moved, step by step, from the President's budget proposal to the contract, the audit and any case filed — using official public records only.

- **Audience:** common citizens on phone browsers first. Researchers and journalists are served by the API and desktop layout, but the product is designed for non-experts.
- **Promise:** clear, interactive, eye-opening visuals where every number is backed by, and links to, its official source.
- **Stance:** Outlay shows records. It does not accuse anyone. Citizens draw their own conclusions from the data.

## 2. Scope

### In scope
National government projects, starting with the Department of Public Works and Highways (DPWH).

### Out of scope
- City and municipal (LGU) budgets — planned as a separate app later.
- Any commercial use. This is a non-profit civic project.

### The project lifecycle (nine steps)

| # | Step | Main source | Format | Difficulty |
|---|------|-------------|--------|------------|
| 1 | President's proposal (NEP) | BetterGov Budget API and `open-budget-data`, DBM | JSON / PDF | Easy |
| 2 | House version (GAB) | BetterGov Budget API (FY2027 only), House of Representatives | JSON / PDF | Easy for FY2027, Medium otherwise |
| 3 | Senate version (GAB) | Senate | PDF | Medium |
| 4 | Bicam report | Congress, DBM | PDF | Medium |
| 5 | Signed law (GAA) | BetterGov `open-budget-data`, DBM | JSON / PDF | Easy |
| 6 | Bidding and award | PhilGEPS (BetterGov datasets) | CSV / JSON | Easy |
| 7 | Building and status | BetterGov DPWH API, DPWH | JSON | Easy for DPWH |
| 8 | COA audit | COA Annual Audit Reports (itemized observations) | Password-protected Word / Excel / PDF | Hard |
| 9 | Cases | Ombudsman, Sandiganbayan | Press releases, resolutions, decisions | Hardest (manual curation) |

Plenary deliberations (Congressional Record, Senate Journal) are linked at the **agency** level, not per project.

### Use of the BetterGov Budget API

The data pipeline reads the public BetterGov.ph Budget API (`https://budget.bettergov.ph/api/v1`) for the NEP and House steps instead of extracting those PDFs itself.

- **Archived, not live.** The pipeline fetches the API on a schedule and stores each response with its SHA-256 fingerprint and retrieval date. The web app and public API read Outlay's own storage and never call the Budget API at request time.
- **Coverage today.** The FY2027 dataset holds the NEP and the House bill (second and third reading) for four programs: DPWH infrastructure, farm-to-market roads, health facilities and irrigation. It has no Senate, bicam or FY2027 GAA stage. Enacted budgets for FY2020–2026 are served separately and are matched by program name, not by project ID.
- **Unofficial comparison.** The API describes itself as independent and unofficial. Outlay therefore also links, and archives, the official document page for every figure the API gives a page reference for.
- **Terms.** The data terms of the API are to be confirmed with BetterGov before public launch.
- **Disclaimers.** The API's own notice and disclaimers are shown with its figures, as returned.
- **Code.** No code is copied from `bettergovph/transparency-portal`; it is MIT-licensed and is referenced only.

## 3. Architecture

### 3.1 Layers

1. **Data pipeline** — runs on a schedule in GitHub Actions (public, auditable logs). Heavy PDF/Excel extraction runs here, never in Workers.
   `fetch → extract → normalize → match → compute indicators → load`
   Every source document is archived with a SHA-256 fingerprint and retrieval date.
2. **Storage (Cloudflare)**
   - **D1** for relational data (10 GB per database limit — monitor as coverage grows).
   - **R2** for archived source documents and pre-computed chart data.
3. **Public API (Cloudflare Worker)** — read-only, versioned (`/api/v1/...`), rate-limited, edge-cached, documented with OpenAPI.
4. **Web app** — React + Vite + TypeScript single-page app, responsive, mobile first.
   - A Worker injects per-project share-preview images and meta tags (Facebook / Messenger sharing).
   - Embed routes (`/embed/project/:id`) so BetterGov or others can embed views.
   - Charts: **Apache ECharts** (lazy-loaded). Maps: **MapLibre**.

### 3.2 How BetterGov can adopt it
Standalone site + embeddable pages + public API. Works on its own; BetterGov can embed, link or host it later.

### 3.3 Repository structure (created at build)

```
ph-outlay-movement/
├── apps/
│   ├── web/                 # the website
│   └── api/                 # Cloudflare Worker API
├── pipeline/                # fetchers, extractors, matcher, indicators
├── packages/
│   ├── shared-types/        # request/response and data contracts
│   └── tokens/              # COLORS, FONTS, SPACING, RADIUS, SHADOW
└── docs/                    # spec, methodology, credits, corrections policy
```

Package manager: **pnpm** (workspaces).

## 4. Data model (draft)

| Table | Purpose |
|-------|---------|
| `government_unit` | Agencies and offices (DPWH central, regional, district). Designed to also fit LGUs later. |
| `budget_line` | One budget line item per stage: `stage` ∈ NEP, HOUSE, SENATE, BICAM, GAA; amount; page reference; `source_id`. |
| `project` | The canonical project record. |
| `project_link` | Links between records from different systems, with `match_method` (exact ID / name+location+amount) and `confidence` (confirmed / probable). |
| `procurement_award` | PhilGEPS reference, approved budget for the contract (ABC), winning bid, number of bidders, award date. |
| `contractor` | Juridical entities as named in official records. |
| `status_report` | Reported progress, dates, reporting agency. |
| `coa_finding` | One itemized COA observation: report year, office, observation number, page, text as written, recommendation, implementation status. |
| `legal_case` | Ombudsman / Sandiganbayan record: case number, forum, status, date, source. |
| `source_document` | URL, title, publisher, retrieval date, SHA-256, license. Every value above references one. |
| `indicator` | Computed flag: rule ID, project, evidence values, computed date, methodology version. |
| `correction_request` | Right-of-reply and correction submissions, review status, published reply. |

Rules:
- Missing data is stored and shown as **no record found**, never as zero.
- Probable matches are labelled "probable match" with the reason, everywhere they appear.

## 5. Indicators (v1)

Labelled **"Indicator for review"**, never "anomaly" or "corruption".

1. Item appears for the first time at the bicam.
2. Amount increased between budget versions (NEP → House → Senate → Bicam → GAA).
3. Winning bid within 0.5% of the approved budget for the contract.
4. Only one bidder.
5. Winning bid above the approved budget for the contract.
6. Same contractor winning most projects in one district.
7. Contracts split just under procurement thresholds.
8. Project funded again after a previous record shows it completed.

Each indicator has a plain-language "What does this mean?" explanation and is documented on the Methodology page.

## 6. UI / UX

### Decisions
- **Entry point:** search first.
- **Language:** English only.
- **Device:** mobile first, expanded for desktop.
- **Identity:** Outlay's own visual identity, credited to BetterGov, restylable through the tokens package.

### Screens
1. Home / Search
2. Project page — lifecycle stepper, "Follow the money" chart, indicators, contract, status, COA, cases, sources, right of reply
3. Budget changes explorer (insertion tracker)
4. Contractor page (facts only, no rankings)
5. Map
6. COA findings
7. Cases
8. About / Methodology / Credits / Corrections

### UX rules
- One big visual per screen; details behind tabs or "show more".
- Plain language with "What does this mean?" explanations for terms (ABC, bicam, GAA).
- Indicators use amber, never red.
- Every number is tappable to its source.
- Touch targets at least 44 px; text contrast at least 4.5:1.

## 7. Engineering standards

- **Service layer only** — no data fetching inside components.
- **Strong types** — no `any` or `unknown`; shared contracts in `packages/shared-types`.
- **One design-tokens file** — no per-screen hardcoded colors or fonts.
- **Errors** — D1 results checked at the service layer; failures raise `AppError(code, originalCode)`; one global `handleError()` shows a generic message to users and logs the real code for the admin. `try/catch` only at true infrastructure boundaries.
- **Idempotency** on every action (pipeline loads, correction submissions).
- **Every user action** shows a success or error message.
- **No hardcoded endpoints or keys** — environment-based configuration.
- **No stub code, no filler comments, no duplicate functions.**
- **Releases** are git-tagged (e.g. `v0.1.0`) so a broken release can be rolled back to the last known-good tag.

## 8. Editorial principles

- **Records as published:** official records are shown fairly and as written, without commentary, each linked to its source.
- **Neutral labels:** "Indicator for review", never "anomaly", "corrupt" or "ghost".
- **Cases:** always shown with their status ("filed", "pending", "dismissed", "convicted") and a presumption-of-innocence note. A pending case is not a conviction.
- **COA disallowances:** shown with their appeal status.
- **Personal data:** only names that appear in official records, shown as recorded, in line with the Data Privacy Act (RA 10173). No stockholder, family or political-dynasty datasets.
- **Right of reply:** a visible correction and reply process on every project page.
- **Independence:** "An independent citizen project. Not affiliated with the Philippine government." in the header or footer.

## 9. Licensing and credits

- Code: **MIT** (see `LICENSE`).
- Third-party code and data: see `THIRD_PARTY_NOTICES.md`. MIT-licensed code copied from other repositories keeps its copyright and license notice.
- `bettergovph/open-data-visualization` has no license file: it is used as a reference only; no code is copied from it.
- Credit line: **Built by Medelo Gaabon, Medelo Software.**
