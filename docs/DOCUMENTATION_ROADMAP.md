# Documentation Roadmap

Current state and forward plan for the **StackLeo Tech Store** documentation set.

## Current State

10 of 20 documentation categories are populated, totaling 280 documents:

| Category | Status |
|---|---|
| 00_Project_Overview | ✅ Populated |
| 01_Business | ✅ Populated |
| 02_Product | ✅ Populated |
| 03_System_Design | ✅ Populated |
| 04_Database | ✅ Populated |
| 05_API | ✅ Populated |
| 06_Security | ✅ Populated |
| 07_DevOps | ✅ Populated |
| 08_Quality_Assurance | ✅ Populated |
| 09_Operations | ✅ Populated |
| 10_Monitoring_Observability | ⬜ Planned |
| 11_Deployment_DevOps | ⬜ Planned |
| 12_Compliance_Governance | ⬜ Planned |
| 13_Enterprise_Architecture_Governance | ⬜ Planned |
| 14_Project_Management_Governance | ⬜ Planned |
| 15_Data_Governance | ⬜ Planned |
| 16_AI_Governance | ⬜ Planned |
| 17_Enterprise_Risk_Management | ⬜ Planned |
| 18_Product_Management_Governance | ⬜ Planned |
| 19_Service_Management_Governance | ⬜ Planned |

## Rationale for Planned Categories

Categories 10–19 separate concerns that currently exist only as sections *within* other categories, once the organization reaches the scale where each merits dedicated, enterprise-wide treatment rather than a single subsection:

- **10_Monitoring_Observability** — currently covered within `07_DevOps` (`monitoring-strategy.md`, `observability-strategy.md`) and `09_Operations` (`monitoring-observability.md`, `monitoring-observability-governance.md`). A dedicated category would consolidate these into one enterprise-wide observability discipline.
- **11_Deployment_DevOps** — currently covered within `07_DevOps` (`deployment-strategy.md`, `deployment-governance.md`). A dedicated category would separate deployment-specific governance from DevOps practice more broadly.
- **12_Compliance_Governance** — currently covered within `06_Security` (`compliance.md`, `compliance-governance.md`, `audit-governance.md`). A dedicated category would elevate compliance to an enterprise-wide, cross-functional concern rather than a security subsection.
- **13_Enterprise_Architecture_Governance** — currently covered within `03_System_Design` (`enterprise-architecture-strategy.md`, `architecture-review-board.md`, `architecture-decision-records.md`). A dedicated category would formalize enterprise architecture governance as its own discipline.
- **14_Project_Management_Governance** — currently covered within `00_Project_Overview` (`project-governance-strategy.md`, `portfolio-program-governance.md`). A dedicated category would separate project delivery governance from general project overview material.
- **15_Data_Governance** — currently covered within `04_Database` (`data-governance.md`, `data-governance-strategy.md`, `data-quality-governance.md`). A dedicated category would elevate data governance to an enterprise-wide discipline spanning beyond the database layer alone.
- **16_AI_Governance** — currently covered within `04_Database` (`ai-governance.md`, `ml-governance.md`). A dedicated category would formalize AI/ML governance as StackLeo's AI-enabled product surface grows.
- **17_Enterprise_Risk_Management** — currently covered within `06_Security` (`enterprise-risk-management-strategy.md`, `risk-assessment-framework.md`) and `09_Operations`. A dedicated category would consolidate risk management as a single, board-level discipline spanning security, product, service, and project risk.
- **18_Product_Management_Governance** — currently covered within `02_Product`. A dedicated category would separate product management practice/maturity from product requirements and design material.
- **19_Service_Management_Governance** — currently covered within `09_Operations` (`service-management-framework.md`, `service-lifecycle-framework.md`, `service-risk-governance.md`, `service-maturity-framework.md`). A dedicated category would elevate service management to its own enterprise-wide discipline.

## Population Approach

When a planned category is populated:

1. Follow the existing governance-document template pattern established in `00_Project_Overview` and `02_Product` (strategy → lifecycle → operational domains → risk → maturity).
2. Where content already exists in a source category (see Rationale above), the new category should position itself as a **consolidated, non-competing companion** that cross-references the source material rather than duplicating it — consistent with how `02_Product/product-portfolio-governance.md` and `09_Operations/service-risk-governance.md` were built as companions to their respective category's strategy documents.
3. Update `MASTER_INDEX.md`, `DOCUMENT_MAP.md`, and `DOCUMENT_TRACEABILITY_MATRIX.md` in the same change that populates a category.

## Related Documents

- [`MASTER_INDEX.md`](./MASTER_INDEX.md) — category status and document counts.
- [`DOCUMENT_MAP.md`](./DOCUMENT_MAP.md) — full per-document listing.
- [`DOCUMENT_TRACEABILITY_MATRIX.md`](./DOCUMENT_TRACEABILITY_MATRIX.md) — cross-category dependency structure.

---

© StackLeo. All Rights Reserved.
