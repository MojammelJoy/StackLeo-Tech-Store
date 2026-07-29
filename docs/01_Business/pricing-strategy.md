# Pricing Strategy

## 1. Document Purpose

This document defines the official pricing strategy for **StackLeo Tech Store**. It explains how products are priced, how discounts and promotions are applied and managed, how pricing decisions are governed, and how profitability is protected as the business scales.

This document serves as the official pricing policy reference for business, finance, operations, and future product development. Any pricing-related feature, promotion, or process must remain consistent with the strategy defined here. Detailed pricing business rules are documented in `business-rules.md`; this document defines the strategic reasoning behind those rules.

Illustrative figures in this document (such as example prices or percentages) are for explanatory purposes only and do not represent confirmed pricing commitments. This document defines pricing strategy and policy only. It does not describe implementation approach, technology choices, or system design, all of which are addressed in dedicated technical documentation elsewhere in the repository.

## 2. Pricing Philosophy

StackLeo's pricing philosophy is grounded in fairness, transparency, and consistency — pricing is intended to reflect genuine product value rather than manipulative or opaque tactics. As established in `competitor-analysis.md`, customer distrust around pricing is a widespread market weakness; StackLeo's pricing approach is designed to directly counter that distrust.

Prices at StackLeo Tech Store must be honest, clearly displayed, and consistent across all sales channels. Where a discount or promotion is offered, it must reflect a genuine reduction in value rather than an inflated reference price designed to create a false sense of savings.

## 3. Pricing Objectives

- Maintain fair, transparent, and competitive pricing across all product categories.
- Ensure consistent pricing between the online store and physical retail store.
- Protect sustainable profit margins while remaining competitive within the Bangladesh technology retail market.
- Support future pricing models for corporate, wholesale, and marketplace customers without disrupting core B2C pricing integrity.
- Use pricing as a tool to reinforce, not undermine, StackLeo's trust-focused brand positioning defined in `vision.md` and `mission.md`.

## 4. Pricing Models

| Pricing Model | Description | Applicability |
|---|---|---|
| Cost-Plus Pricing | Price is determined by adding a defined margin to product cost. | Default model for most catalog products. |
| Competitive Pricing | Price is benchmarked against comparable offerings from key competitors identified in `competitor-analysis.md`. | Applied selectively for high-visibility, frequently compared products such as smartphones and laptops. |
| Value-Based Pricing | Price reflects perceived customer value, such as bundled service or warranty assurance. | Applied to premium or trust-differentiated offerings. |
| Volume-Based Pricing | Price decreases as purchase quantity increases. | Applied to corporate and wholesale pricing, per Sections 10–11. |

## 5. Product Pricing Categories

| Category Type | Pricing Approach |
|---|---|
| High-Visibility Products (e.g., Smartphones, Laptops) | Priced competitively, closely benchmarked against key market comparisons. |
| Specialized Products (e.g., Computer Components, Networking Devices) | Priced using cost-plus pricing with category-appropriate margins. |
| Accessories (e.g., Mobile & Laptop Accessories) | Priced to support healthy margins, given lower price sensitivity relative to core devices. |
| Gaming Accessories & Audio Devices | Priced competitively within enthusiast-relevant benchmarks. |
| Office Electronics & Storage Devices | Priced using cost-plus pricing, balanced against corporate and bulk buyer expectations. |

## 6. Discount Strategy

- Discounts must always be calculated against a genuine, previously active selling price, never an artificially inflated reference price.
- Discounts may be applied at the product level, category level, or order level, depending on business objectives.
- Discount depth should be proportionate to inventory strategy — for example, deeper discounts may support clearing aging or discontinued stock.
- All discounts must comply with the pricing rules defined in `business-rules.md` (Section 2.7, Pricing).

**Illustrative Example:** A wireless mouse with a standard selling price of BDT 1,200 offered at a 10% discount would be priced at BDT 1,080 for the duration of the discount period, with both the original and discounted price clearly displayed to the customer.

## 7. Promotional Pricing

Promotional pricing includes time-bound campaigns, seasonal sales, and flash sales, governed by the promotion rules defined in `business-rules.md` (Section 11).

| Promotion Type | Description |
|---|---|
| Seasonal Campaigns | Time-bound promotions aligned with major shopping seasons or national events. |
| Flash Sales | Short-duration promotions on a limited, pre-allocated stock quantity. |
| Clearance Promotions | Promotions intended to reduce aging or discontinued inventory. |
| Coupon-Based Promotions | Promotions activated through customer-applied coupon codes, per Section 13. |

All promotional pricing must have a clearly defined start and end time and must not be extended informally without formal approval, per Section 17.

## 8. Bundle Pricing

Bundle pricing offers two or more related products together at a combined price lower than the sum of their individual prices, encouraging higher order value while offering genuine customer savings.

**Illustrative Example:** A laptop bundled with a laptop bag and a wireless mouse, individually priced at BDT 65,000, BDT 1,500, and BDT 800 respectively (totaling BDT 67,300), could be offered as a bundle priced at BDT 65,999 — reflecting a genuine, calculated savings rather than an arbitrary discount.

Bundle pricing is subject to the stock dependency rule defined in `business-rules.md` (BR-098): a bundle may only be sold while all component products remain in stock.

## 9. Dynamic Pricing (Future)

StackLeo may, in the future, introduce dynamic pricing capabilities that adjust prices based on factors such as demand fluctuation, inventory age, or competitive movement.

- Dynamic pricing, if introduced, must operate within defined minimum and maximum price boundaries to protect both margin and customer trust.
- Any price change resulting from dynamic pricing must still comply with the price-change timing rule defined in `business-rules.md` (BR-024) — changes must never retroactively affect an already-confirmed order.
- Dynamic pricing must not be used in a manner that creates perceived unfairness or inconsistency between customers purchasing the same product at close intervals.

This capability is not part of the current pricing strategy and requires dedicated governance review before activation.

## 10. Corporate Pricing

Corporate pricing applies to organizational and institutional buyers once corporate sales capabilities, referenced in `business-model.md` and `business-requirements.md`, are introduced.

- Corporate pricing must be based on defined volume tiers, reflecting the scale of the purchasing organization's needs.
- Corporate pricing agreements must be formally documented and approved before being applied to an account.
- Corporate pricing must remain profitable and must not undercut standard B2C margins without clear business justification, such as long-term contract value.

## 11. Wholesale Pricing

Wholesale pricing applies to resellers and distributors purchasing at volume, once wholesale capabilities are introduced.

- Wholesale pricing must be structured around defined minimum order quantities and corresponding volume-based discount tiers.
- Wholesale accounts must be formally verified and approved before accessing wholesale pricing.
- Wholesale pricing must be maintained separately from standard B2C and corporate pricing to avoid channel conflict or margin erosion.

## 12. Membership Pricing (Future)

A future premium membership program, referenced in `business-model.md`, may offer members benefits such as exclusive discounts, early access to promotions, or reduced delivery charges.

- Membership pricing benefits must be clearly defined and consistently honored across all sales channels.
- Membership pricing must be structured to ensure the program remains profitable relative to the benefits offered.
- Full membership pricing rules will be defined prior to program launch.

## 13. Coupon & Voucher Pricing Rules

- Coupons and vouchers must have a clearly defined discount type (percentage-based or fixed-amount), validity window, and usage limit, consistent with `business-rules.md` (Section 11.1).
- Coupons must not be combined with other coupons unless explicitly configured as stackable.
- Coupon-driven price reductions must be tracked and reported separately from standard discount activity to support accurate margin analysis.

## 14. Shipping Fee Strategy

- Delivery charges must be calculated based on delivery area, and, where applicable, order weight or value, consistent with `business-rules.md` (Section 8.4).
- StackLeo may offer free delivery above a defined minimum order value as a promotional or standing incentive.
- Delivery pricing must remain transparent, with any applicable charge clearly displayed before checkout confirmation.

Detailed shipping terms are documented in `shipping-policy.md`.

## 15. Tax & VAT Considerations

- All applicable Value Added Tax (VAT) must be calculated and displayed in accordance with Bangladesh tax regulations, consistent with `business-rules.md` (BR-124).
- Product prices displayed to customers must clearly indicate whether VAT is included or added separately at checkout.
- Tax treatment must remain consistent across the online store and physical retail store to avoid customer confusion.

## 16. Currency Policy (BDT Initially, Multi-Currency Future)

- All pricing is currently displayed and transacted in Bangladeshi Taka (BDT), the currency of StackLeo's primary market.
- Multi-currency support is not part of the current pricing strategy but may be considered if StackLeo pursues regional expansion, as described in `vision.md`.
- Any future multi-currency capability must include clear currency conversion transparency and must not obscure the final payable amount from the customer.

## 17. Price Update & Approval Process

- All price changes must be reviewed and approved by an authorized Admin role before taking effect, consistent with the approval governance defined in `business-rules.md` (Section 12.3).
- Routine price adjustments (such as minor cost-driven updates) follow standard approval; large-scale or high-impact price changes require dual approval.
- Price changes must never retroactively affect orders that have already been confirmed, per `business-rules.md` (BR-024).
- All price changes should be logged with a recorded reason to support audit and margin analysis.

## 18. Competitor Price Monitoring

- Pricing for high-visibility, frequently compared products should be periodically benchmarked against the Bangladesh competitors identified in `competitor-analysis.md`.
- Competitor price monitoring should inform pricing strategy but must not compromise sustainable margin requirements defined in Section 19.
- Significant, sustained competitor pricing shifts should trigger a formal pricing strategy review rather than reactive, ad hoc price changes.

## 19. Profit Margin Strategy

| Consideration | Approach |
|---|---|
| Margin Sustainability | Pricing must maintain margins sufficient to cover product cost, operational cost, and a sustainable profit contribution. |
| Category-Level Margin Variation | Margins may vary by category, reflecting competitive intensity and price sensitivity differences identified in `target-market.md`. |
| Promotional Margin Impact | Promotions and discounts must be evaluated for their impact on overall margin before approval. |
| Channel Consistency | Margin expectations should account for the cost differences between online and physical retail fulfillment, without creating inconsistent customer-facing prices between channels. |

## 20. Pricing Risks

| Risk | Potential Impact | Mitigation Direction |
|---|---|---|
| Aggressive Competitor Discounting | Margin pressure from price-driven competition, particularly from large general marketplaces. | Differentiate on trust and service rather than competing purely on price. |
| Inconsistent Channel Pricing | Erosion of customer trust if online and physical retail prices diverge unintentionally. | Enforce centralized price management and approval, per Section 17. |
| Over-Discounting | Reduced profitability from excessive or poorly targeted promotions. | Require margin impact review before promotional approval. |
| Pricing Errors | Customer or financial impact from incorrect price entry. | Enforce validation and approval controls defined in `business-rules.md`. |

## 21. Pricing Governance

| Role | Responsibility |
|---|---|
| Founder / Business Owner | Approves overall pricing philosophy and major strategic pricing decisions. |
| Project Lead / Product Manager | Oversees alignment between pricing strategy and business objectives. |
| Business Analyst | Maintains and updates this pricing strategy document. |
| Operations Team | Executes approved pricing and promotional changes across channels. |
| Finance Function | Reviews margin impact of pricing and promotional decisions. |

Any change to this pricing strategy must be reflected by updating this document, incrementing its version number, and recording the change in `00_Project_Overview/changelog.md`.

## 22. Future Pricing Roadmap

- Introduction of formal corporate and wholesale pricing structures as those sales channels are launched.
- Evaluation of dynamic pricing capabilities once sufficient sales data is available to support informed decision-making.
- Introduction of premium membership pricing benefits, subject to program viability.
- Evaluation of multi-currency pricing support in connection with future regional expansion.
- Introduction of marketplace-specific pricing governance once multi-vendor marketplace capabilities, referenced in `business-model.md`, are activated.

## 23. Document Information

| Property | Value |
|----------|-------|
| Document | pricing-strategy.md |
| Version | 1.0.0 |
| Status | Active |
| Maintained By | StackLeo |
| Last Updated | 2026-07-17 |

---

© StackLeo. All Rights Reserved.
