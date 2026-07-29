# Document Traceability Matrix

Cross-category relationships within `docs/`. This matrix operates at the **category level** — given 280+ individual documents, a per-document matrix would be impractical to maintain; category-level traceability captures the dependency structure that matters for navigation and impact analysis. For individual document relationships, see each document's own "Related Documents" section.

## How to Read This Matrix

`Depends On` — the category's content assumes or references decisions made in the listed category.
`Feeds Into` — the category's content is a direct input to decisions made in the listed category.

## Traceability Matrix

| Category | Depends On | Feeds Into |
|---|---|---|
| 00_Project_Overview | 01_Business | 02_Product, 03_System_Design, all delivery categories |
| 01_Business | — | 00_Project_Overview, 02_Product |
| 02_Product | 00_Project_Overview, 01_Business | 03_System_Design, 05_API, 18_Product_Management_Governance (planned) |
| 03_System_Design | 02_Product | 04_Database, 05_API, 06_Security, 13_Enterprise_Architecture_Governance (planned) |
| 04_Database | 03_System_Design | 05_API, 15_Data_Governance (planned), 16_AI_Governance (planned) |
| 05_API | 02_Product, 03_System_Design, 04_Database | 06_Security, 08_Quality_Assurance |
| 06_Security | 03_System_Design, 04_Database, 05_API | 12_Compliance_Governance (planned), 17_Enterprise_Risk_Management (planned) |
| 07_DevOps | 03_System_Design, 05_API | 09_Operations, 10_Monitoring_Observability (planned), 11_Deployment_DevOps (planned) |
| 08_Quality_Assurance | 02_Product, 05_API | 07_DevOps, 09_Operations |
| 09_Operations | 07_DevOps, 08_Quality_Assurance | 10_Monitoring_Observability (planned), 19_Service_Management_Governance (planned) |
| 10_Monitoring_Observability *(planned)* | 07_DevOps, 09_Operations | 17_Enterprise_Risk_Management (planned) |
| 11_Deployment_DevOps *(planned)* | 07_DevOps | 09_Operations |
| 12_Compliance_Governance *(planned)* | 06_Security | 17_Enterprise_Risk_Management (planned) |
| 13_Enterprise_Architecture_Governance *(planned)* | 03_System_Design | 04_Database, 05_API |
| 14_Project_Management_Governance *(planned)* | 00_Project_Overview | — |
| 15_Data_Governance *(planned)* | 04_Database | 16_AI_Governance (planned) |
| 16_AI_Governance *(planned)* | 04_Database, 15_Data_Governance (planned) | — |
| 17_Enterprise_Risk_Management *(planned)* | 06_Security, 09_Operations | — |
| 18_Product_Management_Governance *(planned)* | 02_Product | — |
| 19_Service_Management_Governance *(planned)* | 09_Operations | — |

## Governance Family Traceability

Several categories already contain internal governance-document families, each with its own strategy → lifecycle → operational → risk → maturity progression, cross-referenced within the category itself rather than across categories:

- **00_Project_Overview**: `project-governance-strategy.md` → `project-lifecycle-framework.md` → `portfolio-program-governance.md` / `resource-capacity-governance.md` / `stakeholder-engagement-framework.md` → `project-risk-governance.md` → `project-maturity-framework.md`
- **02_Product**: `product-governance-strategy.md` → `product-lifecycle-framework.md` → `product-roadmap-governance.md` → `product-portfolio-governance.md` → `customer-value-governance.md` → `product-risk-governance.md` → `product-maturity-framework.md`
- **09_Operations**: `service-management-framework.md` → `service-lifecycle-framework.md` → `incident-problem-governance.md` → `knowledge-management-framework.md` → `service-risk-governance.md` → `service-maturity-framework.md`

## Related Documents

- [`MASTER_INDEX.md`](./MASTER_INDEX.md) — category status and document counts.
- [`DOCUMENT_MAP.md`](./DOCUMENT_MAP.md) — full per-document listing.
- [`DOCUMENTATION_ROADMAP.md`](./DOCUMENTATION_ROADMAP.md) — plan for populating planned categories.

---

© StackLeo. All Rights Reserved.
