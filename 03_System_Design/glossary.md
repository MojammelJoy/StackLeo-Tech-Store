# Glossary and Canonical Terminology

## 1. Document Purpose

This document is the official Glossary and Canonical Terminology reference for **StackLeo Tech Store**. It defines every important business, e-commerce, architectural, security, infrastructure, DevOps, observability, data, and StackLeo-specific term used across `00_Project_Overview`, `01_Business`, `02_Product`, and `03_System_Design`.

- **Why a Glossary Is Important** — a project spanning business, product, and architecture documentation inevitably develops its own vocabulary; without a single authoritative definition, the same word can silently mean different things to different teams, producing costly misunderstanding.
- **Benefits of Consistent Terminology** — a shared glossary lets Business Analysts, Product Managers, Architects, Engineers, and QA communicate precisely, reduces onboarding time for new contributors, and prevents documents from silently drifting apart in meaning.
- **Relationship with Architecture and Documentation** — this glossary extends `01_Business/glossary.md` and `02_Product/glossary.md` with architecture-specific terminology; where a term is defined in more than one glossary, this document is authoritative for its architectural sense, while the business glossary remains authoritative for its business sense.
- **Governance of Terminology** — new terms and changes to existing definitions follow the governance process defined in Section 6, ensuring the glossary remains a trustworthy, current single source of truth.

This document is implementation-independent. It defines conceptual and architectural terminology, not code, configuration, or vendor-specific product names.

## 2. Glossary Categories

| Category | Term Count |
|---|---|
| Business Terms | 14 |
| E-commerce Terms | 10 |
| Architecture Terms | 13 |
| Security Terms | 9 |
| Infrastructure Terms | 10 |
| DevOps Terms | 8 |
| Observability Terms | 10 |
| Data Terms | 7 |
| StackLeo-Specific Terms | 8 |

**Total Glossary Terms: 89**

Each entry follows the template defined in Section 3, presented alphabetically within its category as a table with columns: **Term, Definition, Business Context, Related Terms, Notes**.

---

## 3. Glossary Entry Template

Every entry in this glossary defines:

| Field | Description |
|---|---|
| Term | The canonical name of the concept. |
| Category | The glossary category the term belongs to (indicated by its section). |
| Definition | A precise, unambiguous statement of what the term means. |
| Business Context | Why the term matters to StackLeo Tech Store specifically. |
| Related Terms | Other glossary terms closely associated with this one. |
| Notes | Clarifications, distinctions from similar terms, or references to source documents, where applicable. |

### 3.1 Business Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Corporate Customer | A future organizational buyer purchasing under negotiated bulk terms. | Represents the Phase 4 B2B expansion of StackLeo's business model. | Wholesale, Corporate Sales | Not yet active; per `01_Business/business-model.md` (Section 10). |
| Coupon | A discount code redeemable under defined eligibility conditions. | Drives promotional conversion within controlled margin impact. | Promotion | See `01_Business/business-rules.md` (Section 11.1). |
| Customer | An individual who has registered to purchase from StackLeo Tech Store. | The core relationship the entire platform exists to serve. | Guest, User | Formally defined as an Entity in `domain-model.md` (Section 4.1). |
| Guest | An unauthenticated visitor browsing the platform. | Represents the pre-registration stage of the customer journey. | Customer | See `02_Product/user-roles.md` (ROLE-001). |
| Invoice | Compliant financial documentation issued for a confirmed order. | Ensures legal compliance and customer financial transparency. | Order, Payment | See `01_Business/business-rules.md` (BR-072). |
| Marketplace | A platform model where multiple independent sellers offer products alongside or instead of the platform owner's own catalog. | Represents StackLeo's future multi-vendor business model, per Phase 5. | Seller, Corporate Sales | Distinct from "StackLeo Marketplace," the specific implementation (Section 3.9). |
| Order | The authoritative record of a confirmed customer transaction. | The central transactional fact underpinning fulfillment, finance, and support. | Order Item, Payment, Shipment | Aggregate root; see `domain-model.md` (Section 6). |
| Promotion | A time-bound campaign offering discounted pricing on eligible products. | Drives targeted sales volume during defined periods. | Coupon, Flash Sale | See `01_Business/business-rules.md` (Section 11.2). |
| Return | A customer-initiated request to return or exchange a delivered product. | Preserves customer trust through structured post-purchase resolution. | Warranty, Refund | Governed by `01_Business/return-policy.md`. |
| Shipment | The physical fulfillment record for an order, coordinated with a courier or store pickup. | Represents the customer-visible delivery journey of an order. | Order, Fulfillment | See `domain-model.md` (Section 4.7). |
| SKU | A unique code identifying a specific product or product variant. | The atomic unit of catalog and inventory tracking. | Stock Keeping Unit, Product Variant | "SKU" and "Stock Keeping Unit" refer to the same concept; both entries retained for discoverability. |
| Vendor | A supplier providing StackLeo with product inventory, or (future) a marketplace seller. | Distinguishes StackLeo's own product sourcing relationships from future third-party sellers. | Seller | Context-dependent; clarified per usage in `01_Business/business-model.md` (Section 10) vs. Marketplace context. |
| Warranty | Coverage entitling a customer to repair or replacement for a genuine product defect within a defined period. | Reinforces trust in product authenticity and after-sales support. | Warranty Claim, Return | Governed by `01_Business/warranty-policy.md`. |
| Wholesale | A future business model selling at volume to resellers and distributors. | Represents a planned future revenue stream and customer segment. | Corporate Customer | Not yet active; per `01_Business/business-model.md` (Section 10). |

### 3.2 E-commerce Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Brand | A verified manufacturer or brand identity associated with products. | Reinforces authenticity assurance central to StackLeo's positioning. | Category, Product | See `domain-model.md` (Section 4.2). |
| Category | A grouping used to organize products for navigation. | Supports customer product discovery. | Brand, Product Catalog | See `domain-model.md` (Section 4.2). |
| Checkout | The process of converting cart contents into a confirmed order. | The most conversion-critical business process on the platform. | Shopping Cart, Order | See `02_Product/product-features.md` (FEAT-016). |
| Fulfillment | The end-to-end process of preparing and delivering an order to a customer. | Encompasses warehouse, shipping, and delivery activity. | Shipment, Inventory | See `02_Product/business-workflows.md` (Section 6). |
| Inventory | The tracked record of available stock for each SKU across locations. | Prevents overselling and supports accurate availability. | Stock Keeping Unit, Fulfillment | See `domain-model.md` (Section 4.3). |
| Product Catalog | The centralized, authoritative collection of all sellable products. | The foundation of all customer discovery and purchasing activity. | Product Variant, Category, Brand | See `domain-model.md` (Section 3). |
| Product Variant | A specific configuration of a product (e.g., color, storage capacity). | Represents purchasable distinctions within a single product. | SKU, Product Catalog | See `domain-model.md` (Section 4.2). |
| Shopping Cart | A customer's in-progress, pre-commitment collection of intended purchases. | Represents current purchase intent prior to checkout. | Checkout, Wishlist | Referred to as "Cart" throughout `domain-model.md` and `service-architecture.md`. |
| Stock Keeping Unit | See SKU. | — | SKU | Canonical, unabbreviated form of "SKU." |
| Wishlist | A customer's saved collection of products of interest for future purchase. | Represents future, not immediate, purchase intent. | Shopping Cart | Classified Phase 2, per `02_Product/product-roadmap.md`. |

### 3.3 Architecture Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Aggregate | A cluster of related entities and value objects treated as a single consistency unit, changed together through its root. | Ensures business rules are enforced consistently for related data. | Aggregate Root, Bounded Context | See `domain-model.md` (Section 6). |
| API First | A design approach where capability is defined as a channel-independent contract before any specific consumer is built. | Ensures Web, future Mobile App, and future POS can consume the same business capability. | Service, Component | See `architecture-principles.md` (ARCH-011). |
| Bounded Context | A boundary within which a specific domain model applies consistently, with unambiguous ownership. | Prevents business terms from meaning different things in different parts of the system. | Domain, Aggregate | See `bounded-contexts.md`. |
| Clean Architecture | An architectural approach where business logic is independent of delivery mechanism or storage technology, with dependencies pointing inward. | Protects business rules from churn in technology choices. | Layered Architecture | See `architecture-principles.md` (Section 3). |
| Component | A cohesive, independently reasoned-about unit of software responsibility implementing a slice of business capability. | The building block of `component-architecture.md`'s C4 Level 3 view. | Service, Module | Finer-grained than a Service. |
| Domain | A distinct area of business activity and knowledge, with its own concepts, rules, and language. | Reflects how the business itself is organized. | Bounded Context | See `domain-model.md` (Section 3). |
| Event | A record that something business-significant has already happened, stated as a fact. | Enables loosely coupled cross-service business notification. | Event-Driven Architecture, Domain Event | See `event-flows.md`. |
| Event-Driven Architecture | An architectural style where services communicate significant occurrences as events rather than only through direct calls. | Supports loose coupling as the platform scales. | Event, Publish/Subscribe | See `architecture-principles.md` (ARCH-013). |
| Layered Architecture | An architecture organized into Presentation, Application, Domain, and Infrastructure layers, with dependencies flowing inward. | Enforces separation of concerns within a module. | Clean Architecture | See `component-architecture.md` (Section 6). |
| Modular Architecture | An architecture decomposed into components with clearly scoped, singular responsibility. | Keeps the platform maintainable as business complexity grows. | Component, Bounded Context | See `architecture-decisions.md` (ADR-001). |
| Module | A functional grouping of business capability, as defined in `02_Product/product-modules.md`. | Bridges product requirements and system architecture. | Component, Service | Product-level concept; realized architecturally as Components and Services. |
| Repository (Concept Only) | The conceptual notion that an aggregate can be retrieved and persisted as a whole, without exposing how persistence is technically achieved. | Preserves Clean Architecture's separation between domain and infrastructure. | Aggregate, Clean Architecture | Conceptual only; no persistence mechanism implied. |
| Service | A logical grouping of business capability exposing a coherent contract to its consumers, composed of one or more components. | The unit of business capability defined in `service-architecture.md`. | Component, Microservice | Distinct from "microservice," which is a deployment decision. |

### 3.4 Security Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Audit Log | An immutable record of governed administrative and business-critical actions, with actor identity and timestamp. | Supports accountability, dispute resolution, and compliance. | Authorization | See `02_Product/user-roles.md` (Section 12). |
| Authentication | The process of verifying an actor's claimed identity. | The foundation of all account-scoped access. | Authorization, Session | See `architecture-principles.md` (Section 7). |
| Authorization | The process of determining what an authenticated identity is permitted to do. | Enforces the RBAC model defined in `02_Product/user-roles.md`. | Authentication, Least Privilege | See ARCH-034 (Zero Trust). |
| Encryption | The protection of data through cryptographic transformation, in transit and at rest. | Protects customer and business data confidentiality. | Secrets Management | See `deployment-architecture.md` (Section 9). |
| JWT | A compact, token-based format commonly used to convey verified identity claims between parties. | Referenced as a category example of token-based authentication. | Authentication, Session | Category-level reference only; no specific implementation prescribed. |
| Least Privilege | The principle that every actor is granted only the access necessary for its defined responsibility. | Limits the impact of compromised or misused credentials. | Authorization | See `architecture-principles.md` (ARCH-033). |
| MFA | Multi-Factor Authentication; verification using more than one independent credential type. | A future security enhancement for sensitive account types. | Authentication | See `non-functional-requirements.md` (NFR-026). |
| Secrets Management | The secure storage and controlled access of sensitive configuration such as credentials and keys. | Prevents sensitive configuration from being embedded in code. | Encryption | See `architecture-principles.md` (ARCH-030). |
| Session | The state representing an authenticated actor's ongoing interaction with the platform. | Enables continued access without re-authenticating on every request. | Authentication | Expires after inactivity, per NFR-024. |

### 3.5 Infrastructure Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Cache | A layer holding frequently accessed data to reduce latency and load on the primary data store. | Improves customer-facing performance for high-read data. | CDN | See `technology-stack.md` (Section 4.4). |
| CDN | Content Delivery Network; a distributed system that serves cacheable content from locations close to the customer. | Reduces latency for customers across delivery zones. | Cache | See `deployment-architecture.md` (Section 4). |
| Disaster Recovery | The capability to restore critical functionality following a significant outage or data loss event. | Protects business continuity. | High Availability | See `deployment-architecture.md` (Section 10). |
| High Availability | An architectural property ensuring a system remains operational with minimal downtime. | Directly supports the trust-focused brand positioning. | Disaster Recovery | See `quality-attributes.md` (Section 5). |
| Horizontal Scaling | Increasing capacity by adding more instances sharing the load. | StackLeo's primary scaling strategy. | Vertical Scaling | See `scalability-strategy.md` (Section 1). |
| Load Balancer | A component that distributes incoming traffic evenly across available instances. | Prevents any single instance from being overloaded. | Reverse Proxy | See `deployment-architecture.md` (Section 4). |
| Object Storage | A storage service purpose-built for durable, scalable storage of unstructured assets. | Stores product images and business documents. | CDN | See `technology-stack.md` (Section 4.8). |
| Queue | A mechanism holding messages or events for asynchronous processing. | Enables decoupled, asynchronous service collaboration. | Event-Driven Architecture | Future capability; see `technology-stack.md` (Section 4.6). |
| Reverse Proxy | A component that routes incoming requests to the appropriate internal service. | Mediates all external access into the Private Zone. | Load Balancer | See `deployment-architecture.md` (Section 4). |
| Vertical Scaling | Increasing capacity by adding resources to a single instance. | A secondary, near-term scaling lever at StackLeo. | Horizontal Scaling | See `architecture-principles.md` (ARCH-038). |

### 3.6 DevOps Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Blue-Green Deployment | A release strategy running two parallel production environments, switching traffic between them to enable zero-downtime releases. | A future progressive delivery pattern for StackLeo. | Canary Release | See `deployment-architecture.md` (Section 13). |
| Canary Release | A release strategy exposing a new version to a small subset of traffic before full rollout. | Reduces risk of a flawed release reaching all customers at once. | Blue-Green Deployment | See `technology-stack.md` (Section 4.11). |
| CD | Continuous Delivery/Deployment; the automated progression of validated changes toward release. | Supports consistent, low-risk releases. | CI | See `deployment-architecture.md` (Section 12). |
| CI | Continuous Integration; the automated integration and validation of code changes. | Reduces integration risk across a growing engineering team. | CD | See `deployment-architecture.md` (Section 12). |
| Deployment | The act of releasing a build to a specific environment. | See `deployment-architecture.md` (Section 3, Environment Strategy). | Release, Rollback | — |
| Infrastructure as Code | The practice of defining and managing infrastructure through version-controlled configuration rather than manual setup. | Supports consistent, repeatable environment provisioning. | CI, CD | Conceptual reference only; no specific tooling prescribed. |
| Release | A specific version of the platform made available to an environment or customers. | See `deployment-architecture.md` (Section 14, Release Management). | Deployment | — |
| Rollback | Reverting to a previous, known-good release following a problematic deployment. | Limits the duration and impact of a flawed release. | Deployment | See `deployment-architecture.md` (Section 7). |

### 3.7 Observability Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Health Check | A means by which a service or component confirms its own operational status. | Supports failover and load-balancing decisions. | Monitoring | See `observability.md` (Section 9). |
| Incident | An event representing a disruption to expected system behavior requiring a response. | Central to the operational response process. | SLA, MTTR | See `observability.md` (Section 10). |
| Logs | Structured records of system and business events. | Support diagnosis and audit. | Observability | See `observability.md` (Section 5). |
| Metrics | Quantified measures of system or business behavior over time. | Support both technical and business health assessment. | Observability | See `observability.md` (Section 4). |
| Monitoring | The practice of continuously observing system health, performance, and business metrics. | One applied outcome of a broader observability architecture. | Observability | See `observability.md` (Section 1). |
| Observability | The property of a system that allows its internal state to be inferred from its external outputs. | The architectural foundation underpinning reliable operation. | Monitoring, Logs, Traces | See `observability.md` (Section 1). |
| SLA | Service Level Agreement; a formal commitment built upon one or more SLOs. | Applied where a formal commitment to reliability is warranted. | SLO, SLI | See `observability.md` (Section 10). |
| SLI | Service Level Indicator; a specific, measured value representing an aspect of service quality. | The measurement basis for SLOs. | SLO, SLA | See `observability.md` (Section 10). |
| SLO | Service Level Objective; an internal target for an SLI. | Guides operational and architectural prioritization. | SLI, SLA | See `observability.md` (Section 10). |
| Traces | Records showing the path and timing of a single transaction across multiple services. | Supports fast root-cause diagnosis of cross-service issues. | Observability | See `observability.md` (Section 6). |

### 3.8 Data Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Data Flow | The conceptual movement of business information between actors, processes, and stores. | See `data-flow.md` (Section 1). | Data Ownership | — |
| Data Lifecycle | The stages a piece of business data passes through, from creation to eventual archival. | Ensures data is treated deliberately, not retained by default. | Data Flow | See `data-flow.md` (Section 7). |
| Data Ownership | The principle that each bounded context owns the data corresponding to its domain, as the single source of truth. | Prevents competing, inconsistent copies of the same fact. | Data Flow, Bounded Context | See `data-flow.md` (Section 6). |
| Data Quality | The accuracy, consistency, completeness, freshness, and reliability of business data. | Directly affects the trustworthiness of every downstream decision. | Data Ownership | See `data-flow.md` (Section 9). |
| Entity | A business concept with a distinct, continuous identity that persists through change. | The basic building block of the domain model. | Aggregate, Value Object | See `domain-model.md` (Section 2). |
| Master Data | Core, authoritative business reference data (e.g., Product, Customer) that other data refers to. | Anchors consistency across the platform's business processes. | Data Ownership | Realized through the entities cataloged in `domain-model.md` (Section 4). |
| Metadata | Data that describes other data, such as classification or timestamps. | Supports data governance and classification, per `data-flow.md` (Section 4). | Data Quality | — |

### 3.9 StackLeo-Specific Terms

| Term | Definition | Business Context | Related Terms | Notes |
|---|---|---|---|---|
| Admin Portal | The internal, staff-facing presentation surface for platform administration. | Used by Admin, Product Manager, Inventory Manager, and other internal roles. | Customer Portal | See `component-architecture.md` (COMP-002). |
| Corporate Sales | StackLeo's future capability for serving organizational and bulk buyers under negotiated terms. | Represents Phase 4 of StackLeo's business expansion. | Corporate Customer, Wholesale | See `01_Business/business-model.md` (Section 10). |
| Customer Portal | The customer-facing presentation surface, encompassing browsing, purchasing, and account self-service. | Referred to as "Storefront Web" in `component-architecture.md` (COMP-001) for the current Web channel. | Admin Portal | Extends to future Mobile App (COMP-003). |
| Flash Sale | A short-duration promotional event offered against a dedicated, pre-allocated stock pool. | Drives urgency-based conversion without disrupting standard inventory. | Promotion | See `01_Business/business-rules.md` (BR-096, BR-097). |
| Product Comparison | The customer-facing capability to view multiple products' specifications side by side. | Supports confident purchase decisions among similar products. | Product Catalog | Classified Phase 2, per `02_Product/product-roadmap.md`. |
| StackLeo Marketplace (Future) | StackLeo's specific implementation of a multi-vendor marketplace, extending its own catalog with curated third-party sellers. | The specific Phase 5 realization of the generic "Marketplace" business model concept. | Marketplace, Seller | See `01_Business/business-model.md` (Section 15). |
| StackLeo Tech Store | The official name of the platform documented throughout this repository — StackLeo's technology and electronics commerce system. | The subject of every document in this repository. | — | Tagline: "Everything Tech, One Marketplace." |
| Warranty Center | The conceptual customer-facing and internal capability area for warranty claim submission, tracking, and resolution. | Reinforces trust in product authenticity and after-sales support. | Warranty, Warranty Claim | Realized as the Warranty domain in `domain-model.md` and Customer Support Service in `service-architecture.md` (SVC-023). |

---

## 4. Acronyms

| Acronym | Meaning |
|---|---|
| ABAC | Attribute-Based Access Control |
| ADR | Architecture Decision Record |
| API | Application Programming Interface |
| BDT | Bangladeshi Taka |
| BR | Business Rule (as in `01_Business/business-rules.md`, BR-XXX) |
| C4 | The "C4 Model" (Context, Container, Component, Code) |
| CD | Continuous Delivery / Continuous Deployment |
| CDN | Content Delivery Network |
| CI | Continuous Integration |
| CI/CD | Continuous Integration / Continuous Delivery |
| COD | Cash on Delivery |
| CRM | Customer Relationship Management |
| DDD | Domain-Driven Design |
| DoD | Definition of Done |
| DoR | Definition of Ready |
| EMI | Equated Monthly Installment |
| ERP | Enterprise Resource Planning |
| FR | Functional Requirement (as in `02_Product/functional-requirements.md`, FR-XXX) |
| GMV | Gross Merchandise Value |
| JWT | JSON Web Token (referenced as a category example; see Section 3.4) |
| KPI | Key Performance Indicator |
| MFA | Multi-Factor Authentication |
| MTTR | Mean Time to Recovery |
| NFR | Non-Functional Requirement (as in `02_Product/non-functional-requirements.md`, NFR-XXX) |
| PII | Personally Identifiable Information |
| POS | Point of Sale |
| RBAC | Role-Based Access Control |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| SKU | Stock Keeping Unit |
| SLA | Service Level Agreement |
| SLI | Service Level Indicator |
| SLO | Service Level Objective |
| SRE | Site Reliability Engineering |
| TLS | Transport Layer Security |
| TOGAF | The Open Group Architecture Framework |
| UAT | User Acceptance Testing |
| UC | Use Case (as in `02_Product/use-cases.md`, UC-XXX) |
| US | User Story (as in `02_Product/user-stories.md`, US-XXX) |
| VAT | Value Added Tax |
| WAF | Web Application Firewall |
| WR | Warranty Rule (as in `01_Business/warranty-policy.md`, WR-XXX) |

## 5. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Components | `COMP-XXX` identifier with a descriptive name, per `component-architecture.md`. | `COMP-007 Product` |
| Services | `SVC-XXX` identifier with a descriptive name ending in "Service," per `service-architecture.md`. | `SVC-013 Order Service` |
| Events | Past-tense business fact names, reflecting something that has already occurred, per `event-flows.md` (Section 8). | `OrderCreated`, `PaymentSucceeded` |
| Modules | `MOD-XXX` identifier with a descriptive name, per `02_Product/product-modules.md`. | `MOD-017 Order Module` |
| Documents | Lowercase kebab-case filenames matching their content's subject, consistent across all repository folders. | `service-architecture.md` |
| Business Entities | Singular, capitalized business nouns reflecting real-world business concepts, per `domain-model.md`. | `Customer`, `Order`, `Warranty Claim` |

## 6. Governance

- **Ownership** — the Business Analyst, in partnership with the Solution Architect, owns this glossary's accuracy and completeness.
- **Review Process** — this glossary is reviewed whenever a new document introduces terminology not yet defined here, and at the conclusion of each phase defined in `02_Product/product-roadmap.md`.
- **Change Management** — additions, removals, or definition changes must be recorded in `00_Project_Overview/changelog.md`.
- **Version Control** — this document follows the Semantic Versioning approach defined in `00_Project_Overview/changelog.md`.
- **Canonical Terminology Management** — where a term's meaning could reasonably differ between business and architectural contexts (e.g., "Vendor"), this glossary makes the distinction explicit rather than allowing ambiguity to persist across documents.

### Governance Matrix

| Role | Responsibility |
|---|---|
| Business Analyst | Maintains business, e-commerce, and StackLeo-specific term accuracy. |
| Solution Architect | Maintains architecture, security, infrastructure, DevOps, observability, and data term accuracy. |
| Product Manager | Validates that product-facing terminology remains consistent with `02_Product/glossary.md`. |
| All Contributors | Introduce new terms to this glossary promptly upon first use in any document. |

### Glossary Index

| Term | Category |
|---|---|
| Corporate Customer, Coupon, Customer, Guest, Invoice, Marketplace, Order, Promotion, Return, Shipment, SKU, Vendor, Warranty, Wholesale | Business Terms (Section 3.1) |
| Brand, Category, Checkout, Fulfillment, Inventory, Product Catalog, Product Variant, Shopping Cart, Stock Keeping Unit, Wishlist | E-commerce Terms (Section 3.2) |
| Aggregate, API First, Bounded Context, Clean Architecture, Component, Domain, Event, Event-Driven Architecture, Layered Architecture, Modular Architecture, Module, Repository, Service | Architecture Terms (Section 3.3) |
| Audit Log, Authentication, Authorization, Encryption, JWT, Least Privilege, MFA, Secrets Management, Session | Security Terms (Section 3.4) |
| Cache, CDN, Disaster Recovery, High Availability, Horizontal Scaling, Load Balancer, Object Storage, Queue, Reverse Proxy, Vertical Scaling | Infrastructure Terms (Section 3.5) |
| Blue-Green Deployment, Canary Release, CD, CI, Deployment, Infrastructure as Code, Release, Rollback | DevOps Terms (Section 3.6) |
| Health Check, Incident, Logs, Metrics, Monitoring, Observability, SLA, SLI, SLO, Traces | Observability Terms (Section 3.7) |
| Data Flow, Data Lifecycle, Data Ownership, Data Quality, Entity, Master Data, Metadata | Data Terms (Section 3.8) |
| Admin Portal, Corporate Sales, Customer Portal, Flash Sale, Product Comparison, StackLeo Marketplace (Future), StackLeo Tech Store, Warranty Center | StackLeo-Specific Terms (Section 3.9) |

## 7. Document Information

| Property | Value |
|----------|-------|
| Document | glossary.md |
| Version | 1.0.0 |
| Status | Active |
| Maintained By | StackLeo |
| Last Updated | 2026-07-17 |

---

© StackLeo. All Rights Reserved.
