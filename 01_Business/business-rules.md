# Business Rules

## Document Purpose

This document defines the official Business Rules governing **StackLeo Tech Store**. These rules are the authoritative business foundation for all business logic, backend validation, admin operations, inventory management, order processing, payments, shipping, returns, warranty handling, reporting, analytics, and future marketplace operations.

Every current and future system component — including the online store, physical store point-of-sale, future mobile app, and future marketplace — must comply with the rules defined here. Where a system behavior is not explicitly covered by a rule in this document, the relevant business owner must be consulted before new behavior is implemented, and this document must be updated accordingly.

This document defines business rules only. It does not describe implementation approach, technology choices, system architecture, API design, or database structure, all of which are addressed in dedicated technical documentation elsewhere in the repository.

Each rule in this document includes a unique Rule ID (in the format `BR-XXX`), a title, description, business reason, priority, affected modules, and, where applicable, exceptions and future notes. Priority reflects how strictly the rule must be enforced: **Critical** (must never be violated), **High** (must be enforced under normal operating conditions), or **Medium** (should be enforced, with limited flexibility for justified business cases).

---

## 1. Customer Rules

### 1.1 Registration

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-001 | Unique Customer Identity | Each customer account must be uniquely identifiable by a verified email address or mobile number. | Prevents duplicate accounts and supports reliable customer communication. | Critical | Customer, Orders, Support | None | Future support for social/federated sign-up must preserve identity uniqueness. |
| BR-002 | Mandatory Registration Fields | Registration requires, at minimum, full name, contact method, and password. | Ensures sufficient information exists to serve and support the customer. | High | Customer | Guest checkout may bypass full registration, subject to BR-053. | — |
| BR-003 | Minimum Age Requirement | Customers must meet the minimum legal age to independently enter a purchase agreement in Bangladesh. | Ensures legal enforceability of transactions. | Critical | Customer, Compliance | None | — |

### 1.2 Login

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-004 | Single Verified Identity Per Login | Login must be performed using a verified email address or mobile number paired with a valid credential. | Protects account access and prevents unauthorized use. | Critical | Customer, Security | None | — |
| BR-005 | Account Lockout on Repeated Failure | Repeated failed login attempts must temporarily restrict further attempts on that account. | Reduces risk of credential-guessing attacks. | High | Customer, Security | None | See BR-112 for rate limiting. |

### 1.3 Account Status

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-006 | Defined Account States | Every customer account must exist in exactly one defined state: Active, Inactive, Suspended, or Closed. | Ensures consistent handling of account-dependent actions such as ordering and support. | High | Customer, Admin | None | — |
| BR-007 | Suspended Account Restrictions | Suspended accounts may not place new orders but may still access order history and support. | Balances enforcement action with fair customer treatment. | High | Customer, Orders, Support | Suspension reason must be recorded and reviewable by Admin. | — |

### 1.4 Addresses

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-008 | Minimum Address Completeness | A customer address must include recipient name, contact number, and a complete delivery location before it can be used for checkout. | Prevents failed deliveries due to incomplete address information. | High | Customer, Checkout, Shipping | None | — |
| BR-009 | Multiple Saved Addresses | A customer may save multiple addresses but must designate exactly one as the default. | Improves checkout convenience while avoiding ambiguity in default selection. | Medium | Customer, Checkout | None | — |

### 1.5 Profile

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-010 | Customer-Controlled Profile Data | Customers may view and update their own profile information at any time, except identity-verifying fields. | Supports customer autonomy while protecting identity integrity. | Medium | Customer | Identity-verifying fields require re-verification, per BR-011. | — |

### 1.6 Verification

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-011 | Contact Verification Requirement | The email address or mobile number used for registration must be verified before the account can place an order. | Ensures reliable order and delivery communication. | Critical | Customer, Orders | None | — |
| BR-012 | Re-Verification on Contact Change | Changing a verified email address or mobile number requires re-verification of the new contact method. | Prevents account takeover through unverified contact changes. | High | Customer, Security | None | — |

---

## 2. Product Rules

### 2.1 Products

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-013 | Mandatory Product Information | Every product must have a title, category, brand, description, at least one image, and a price before publication. | Ensures customers receive sufficient information to make purchase decisions. | Critical | Products, Admin | None | — |
| BR-014 | Product Uniqueness | Each product must be uniquely identifiable within the catalog. | Prevents duplicate listings and catalog confusion. | High | Products | Product variants are governed separately under BR-018. | — |

### 2.2 Brands

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-015 | Approved Brand Association | Every product must be associated with an approved brand record before it can be published. | Supports accurate filtering, warranty association, and brand-level reporting. | High | Products, Admin | None | Future multi-vendor sellers must select only from approved brand records, per BR-129. |

### 2.3 Categories

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-016 | Single Primary Category | Every product must be assigned exactly one primary category from the approved category list. | Ensures consistent catalog navigation and reporting. | High | Products | Secondary or cross-listed categories may be assigned for discovery purposes. | — |
| BR-017 | Category Hierarchy Integrity | A product category may not be deleted while active products remain assigned to it. | Prevents orphaned products and broken catalog navigation. | High | Products, Admin | None | — |

### 2.4 Variants

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-018 | Variant Attribute Consistency | Product variants (such as color or storage capacity) must share the same base product identity and differ only by defined attributes. | Maintains accurate catalog structure and customer comparison accuracy. | High | Products | None | — |
| BR-019 | Independent Variant Stock | Each product variant must be tracked with independent stock levels. | Prevents overselling of specific variants when overall product stock appears available. | Critical | Products, Inventory | None | — |

### 2.5 Attributes

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-020 | Category-Relevant Attributes | Product attributes must be relevant to the assigned category. | Ensures customers see meaningful, comparable product specifications. | Medium | Products | None | — |

### 2.6 SKU

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-021 | Unique SKU Requirement | Every sellable product or variant must have a unique Stock Keeping Unit (SKU) identifier. | Enables accurate inventory tracking and order processing. | Critical | Products, Inventory, Orders | None | — |
| BR-022 | Immutable SKU Identity | Once assigned, a SKU must not be reused for a different product or variant, even after discontinuation. | Preserves historical order and inventory accuracy. | High | Products, Inventory | None | — |

### 2.7 Pricing

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-023 | Single Active Price | A product or variant may have only one active selling price at any given time, exclusive of active promotions. | Prevents pricing conflicts and customer confusion. | Critical | Products, Pricing | Promotional pricing is governed under Section 11. | — |
| BR-024 | Price Change Effective Timing | Price changes apply only to orders placed after the change takes effect; existing unfulfilled orders retain their original price. | Protects customer trust and honors the price presented at purchase. | Critical | Products, Orders | None | — |
| BR-025 | Non-Negative Pricing | A product's price must always be a positive value greater than zero. | Prevents data entry errors from resulting in invalid transactions. | Critical | Products, Admin | None | — |

### 2.8 Availability

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-026 | Availability Reflects Real Stock | A product's displayed availability must accurately reflect current stock across all applicable channels. | Prevents customers from ordering unavailable products. | Critical | Products, Inventory | None | — |
| BR-027 | Channel-Consistent Availability | Product availability must be consistent between the online store and physical store where the same inventory pool is shared. | Preserves the unified multi-channel customer experience. | High | Products, Inventory | Channel-specific exclusives may be designated explicitly. | — |

### 2.9 Visibility

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-028 | Draft Products Hidden from Customers | Products in Draft status must not be visible or searchable by customers. | Prevents premature exposure of incomplete listings. | Critical | Products | None | — |
| BR-029 | Discontinued Product Visibility | Discontinued products remain viewable in customer order history but are removed from catalog browsing and search. | Preserves order history integrity while keeping the active catalog accurate. | Medium | Products, Orders | None | — |

---

## 3. Inventory Rules

### 3.1 Stock

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-030 | Non-Negative Stock | Stock quantity for any SKU must never fall below zero. | Prevents overselling and fulfillment failures. | Critical | Inventory | None | — |
| BR-031 | Real-Time Stock Deduction | Stock must be deducted at the point an order is confirmed, not at the point of shipment. | Prevents overselling between order confirmation and fulfillment. | Critical | Inventory, Orders | None | — |

### 3.2 Warehouse

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-032 | Single Source of Stock Truth | Each SKU's total available stock must be tracked centrally across all warehouse and store locations. | Ensures consistent availability across online and physical channels. | Critical | Inventory | None | — |

### 3.3 Reservation

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-033 | Cart Reservation Window | Adding a product to a cart does not reserve stock; stock is reserved only upon order confirmation. | Prevents indefinite stock lockup from abandoned carts. | High | Inventory, Cart | Limited-time reservation may apply during active checkout, per BR-047. | — |
| BR-034 | Reservation Release on Cancellation | Reserved stock must be released back to available inventory immediately upon order cancellation. | Ensures accurate, timely stock availability for other customers. | Critical | Inventory, Orders | None | — |

### 3.4 Low Stock

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-035 | Low Stock Threshold Alerting | Each SKU must have a defined low-stock threshold that triggers an internal alert when reached. | Enables proactive replenishment and prevents stockouts. | Medium | Inventory, Admin | None | — |

### 3.5 Out of Stock

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-036 | Out-of-Stock Purchase Prevention | A product with zero available stock must not be purchasable through any channel. | Prevents customer disappointment and order fulfillment failure. | Critical | Products, Inventory, Cart, Checkout | Pre-order functionality, if introduced, must be explicitly designated. | — |
| BR-037 | Out-of-Stock Notification Option | Customers may opt to be notified when an out-of-stock product becomes available again. | Preserves customer interest and future sales opportunity. | Medium | Products, Notifications | None | — |

### 3.6 Transfers & Adjustments

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-038 | Authorized Stock Transfers Only | Stock transfers between warehouse and store locations must be authorized and recorded by an authorized Admin role. | Maintains inventory accuracy and accountability. | High | Inventory, Admin | None | — |
| BR-039 | Auditable Stock Adjustments | Any manual stock adjustment must include a recorded reason and be attributable to an identified Admin user. | Supports inventory accuracy and audit accountability. | High | Inventory, Admin | None | See BR-104 for audit logging. |

---

## 4. Cart Rules

### 4.1 Cart Quantity

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-040 | Cart Quantity Bounded by Stock | The quantity of a product added to a cart may not exceed currently available stock. | Reduces likelihood of checkout failure due to insufficient stock. | High | Cart, Inventory | None | — |
| BR-041 | Per-Customer Quantity Limits | Certain high-demand or promotional products may have a maximum purchase quantity per customer. | Ensures fair access during limited-availability situations. | Medium | Cart, Products | Applies only where explicitly configured for a product or promotion. | — |

### 4.2 Coupons

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-042 | Single Coupon Per Order | Only one coupon code may be applied to a cart at a time, unless explicitly stackable. | Preserves margin control and predictable discount behavior. | High | Cart, Promotions | Stackable coupons must be explicitly configured as such. | — |

### 4.3 Taxes

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-043 | Applicable Tax Calculation | Cart totals must reflect all applicable taxes, including VAT, prior to checkout confirmation. | Ensures compliance with tax regulations and pricing transparency. | Critical | Cart, Checkout, Compliance | None | See BR-124. |

### 4.4 Shipping

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-044 | Estimated Shipping Charge Display | An estimated delivery charge must be displayed in the cart prior to checkout, based on the customer's selected or default address. | Improves pricing transparency and reduces checkout abandonment. | Medium | Cart, Shipping | Final delivery charge is confirmed at checkout, per BR-049. | — |

### 4.5 Limits

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-045 | Maximum Cart Line Items | A cart may contain a defined maximum number of distinct product line items. | Maintains system performance and manageable order sizes. | Medium | Cart | Corporate and wholesale carts may have adjusted limits, per future B2B rules. | Future B2B and wholesale carts will require distinct limit configurations. |

### 4.6 Expiration

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-046 | Cart Expiration Period | An inactive cart must expire after a defined period of customer inactivity. | Keeps stock reservation and pricing accurate over time. | Medium | Cart | None | — |
| BR-047 | Checkout Session Stock Hold | Stock is temporarily held for a limited window once checkout begins, and released if checkout is not completed within that window. | Prevents stock lockup from incomplete checkout attempts while reducing checkout failure due to concurrent purchases. | High | Cart, Checkout, Inventory | None | — |

---

## 5. Checkout Rules

### 5.1 Billing

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-048 | Mandatory Billing Information | Checkout requires complete billing information, including customer name and contact details, before an order can be placed. | Ensures accurate invoicing and customer communication. | Critical | Checkout, Orders | None | — |

### 5.2 Shipping

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-049 | Confirmed Delivery Address Requirement | A complete, valid delivery address must be confirmed before an order can proceed to payment. | Prevents failed deliveries due to incomplete or invalid addresses. | Critical | Checkout, Shipping | Not applicable to in-store pickup orders. | — |

### 5.3 Payment

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-050 | Payment Method Selection Requirement | A customer must select a valid, available payment method before an order can be confirmed. | Ensures every order has a defined payment path. | Critical | Checkout, Payments | None | — |

### 5.4 Validation

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-051 | Final Stock Validation at Checkout | Stock availability must be re-validated immediately before order confirmation. | Prevents overselling due to concurrent purchases. | Critical | Checkout, Inventory | None | — |
| BR-052 | Final Price Validation at Checkout | Order totals must be recalculated and confirmed immediately before payment to reflect any changes since the cart was last updated. | Ensures pricing accuracy and prevents discrepancies at payment. | Critical | Checkout, Pricing | None | — |

### 5.5 Order Creation

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-053 | Order Creation Requires Valid Checkout | An order record is created only after billing, shipping, and payment information have all passed validation. | Prevents incomplete or invalid orders from entering fulfillment. | Critical | Checkout, Orders | Guest checkout must still satisfy all validation requirements. | — |
| BR-054 | Unique Order Reference | Every order must be assigned a unique, sequential order reference at the time of creation. | Supports accurate tracking, reporting, and customer communication. | Critical | Orders | None | — |

---

## 6. Payment Rules

### 6.1 COD (Cash on Delivery)

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-055 | COD Eligibility Criteria | Cash on Delivery is available only within defined serviceable delivery areas and order value limits. | Manages fulfillment risk associated with unpaid deliveries. | High | Checkout, Payments, Shipping | High-value orders may require partial online prepayment. | — |
| BR-056 | COD Order Confirmation | COD orders are confirmed as "Placed" upon checkout completion and are not considered "Paid" until delivery and collection are confirmed. | Reflects accurate payment status for reporting and reconciliation. | High | Orders, Payments | None | — |

### 6.2 Online Payment

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-057 | Payment Confirmation Before Fulfillment | Orders paid online must reach a confirmed payment status before entering fulfillment. | Prevents fulfillment of unpaid or failed transactions. | Critical | Payments, Orders | None | — |
| BR-058 | Secure Payment Handling | All online payment transactions must be processed through an approved, secure payment gateway partner. | Protects customer financial data and maintains compliance. | Critical | Payments, Security | None | — |

### 6.3 Failed Payment

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-059 | Failed Payment Order Handling | An order with a failed online payment must not be confirmed and must release any reserved stock. | Prevents unpaid orders from consuming inventory. | Critical | Orders, Payments, Inventory | Customer may retry payment within the active checkout session, per BR-047. | — |

### 6.4 Refund

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-060 | Refund Eligibility Basis | A refund may only be issued against a valid cancellation, return, or approved warranty claim. | Prevents unauthorized or fraudulent refunds. | Critical | Payments, Orders, Returns | None | — |
| BR-061 | Refund to Original Payment Method | Refunds must be issued to the original payment method used, unless not technically possible. | Ensures fair and traceable refund handling. | High | Payments | Cash-based refunds may apply for COD orders. | — |

### 6.5 Partial Refund

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-062 | Partial Refund for Partial Returns | A partial refund must be calculated based only on the returned items within a multi-item order. | Ensures fair, accurate financial treatment of partial returns. | High | Payments, Returns, Orders | None | — |

### 6.6 Wallet (Future)

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-063 | Wallet Balance Usage (Future) | A future customer wallet balance may be used as a full or partial payment method at checkout. | Supports customer convenience and retention. | Medium | Payments (Future) | Not applicable until wallet functionality is introduced. | Requires dedicated rules for wallet top-up, expiration, and refund-to-wallet handling prior to launch. |

---

## 7. Order Rules

### 7.1 Order Status

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-064 | Defined Order Status Lifecycle | Every order must progress through a defined, sequential set of statuses: Placed, Confirmed, Processing, Shipped, Delivered, Completed, or Cancelled. | Ensures consistent tracking and communication across all channels. | Critical | Orders | Returned and replaced orders follow an extended status path, per Section 7.4–7.5. | — |
| BR-065 | Status Change Notification | The customer must be notified whenever their order status changes. | Maintains customer confidence and reduces support inquiries. | High | Orders, Notifications | None | — |

### 7.2 Modification

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-066 | Order Modification Window | An order may only be modified by the customer before it enters Processing status. | Prevents disruption to fulfillment once packaging has begun. | High | Orders | Admin-assisted modifications may be permitted under defined support procedures. | — |

### 7.3 Cancellation

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-067 | Customer Cancellation Window | A customer may cancel an order without restriction only before it enters Shipped status. | Balances customer flexibility with fulfillment cost control. | High | Orders | Cancellation after shipment is handled as a return, per Section 7.4. | — |
| BR-068 | Cancellation Stock and Refund Release | Cancelling an order must release reserved stock and initiate any applicable refund. | Ensures accurate inventory and financial reconciliation. | Critical | Orders, Inventory, Payments | None | — |

### 7.4 Returns

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-069 | Return Eligibility Window | A product may be returned only within the eligibility window defined in `return-policy.md`. | Provides clear, fair boundaries for return acceptance. | Critical | Orders, Returns | Warranty-related returns follow Section 9. | — |
| BR-070 | Return Condition Requirement | Returned products must meet the condition requirements defined in `return-policy.md` to qualify for refund or replacement. | Prevents misuse of the return process and protects resale value. | High | Returns, Inventory | None | — |

### 7.5 Replacement

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-071 | Replacement Subject to Stock Availability | A product replacement may only be offered if equivalent stock is available; otherwise, a refund must be offered instead. | Ensures customers are not left without resolution due to stock constraints. | High | Returns, Inventory, Payments | None | — |

### 7.6 Invoice

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-072 | Invoice Generation on Confirmation | A formal invoice must be generated for every confirmed order, reflecting final pricing, taxes, and charges. | Supports compliance, transparency, and customer recordkeeping. | Critical | Orders, Compliance | None | See BR-126. |

### 7.7 Order History

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-073 | Permanent Order History Retention | A customer's order history must be retained and accessible for the lifetime of their account. | Supports customer trust, support resolution, and warranty verification. | High | Orders, Customer | Subject to applicable data retention and privacy requirements, per BR-128. | — |

---

## 8. Shipping Rules

### 8.1 Courier Assignment

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-074 | Courier Assignment by Serviceable Area | An order must be assigned to a courier partner capable of servicing the delivery address. | Ensures reliable delivery capability. | High | Shipping | None | — |

### 8.2 Delivery Area

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-075 | Serviceable Delivery Area Enforcement | Checkout must prevent order placement with delivery to an address outside currently serviceable areas. | Prevents undeliverable orders and customer dissatisfaction. | Critical | Checkout, Shipping | Customers outside serviceable areas may be directed to in-store pickup where feasible. | — |

### 8.3 Tracking

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-076 | Tracking Information Availability | Once shipped, an order must provide the customer with accessible tracking information. | Improves customer confidence and reduces support inquiries. | High | Shipping, Orders | None | — |

### 8.4 Delivery Charges

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-077 | Delivery Charge Calculation Basis | Delivery charges must be calculated based on defined delivery area, order weight or value, as applicable. | Ensures fair, consistent, and predictable delivery pricing. | High | Shipping, Checkout | None | — |
| BR-078 | Free Delivery Threshold Eligibility | Orders meeting a defined minimum value may qualify for free delivery, where such a promotion is active. | Encourages higher order values and supports promotional strategy. | Medium | Shipping, Promotions | Applies only when explicitly configured as an active promotion. | — |

### 8.5 Pickup

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-079 | In-Store Pickup Eligibility | An order may be marked for in-store pickup only if the ordered stock is confirmed available at the selected store location. | Prevents customer arrival for an order that cannot be fulfilled in-store. | High | Shipping, Inventory, Orders | None | — |

### 8.6 Failed Delivery

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-080 | Failed Delivery Attempt Handling | A failed delivery attempt must be recorded and trigger a defined re-delivery or customer contact process. | Reduces lost orders and improves delivery success rates. | High | Shipping, Orders, Notifications | None | — |
| BR-081 | Maximum Delivery Attempts | An order must not exceed a defined maximum number of delivery attempts before being returned to inventory and the customer notified. | Controls fulfillment cost from repeated failed deliveries. | Medium | Shipping, Inventory, Orders | None | — |

---

## 9. Warranty Rules

### 9.1 Brand Warranty

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-082 | Manufacturer Warranty Honoring | Products carrying a manufacturer warranty must have that warranty term recorded and honored as specified by the brand. | Maintains customer trust and brand partner compliance. | Critical | Products, Warranty | None | — |

### 9.2 StackLeo Warranty

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-083 | StackLeo Service Warranty | Where no manufacturer warranty applies, a StackLeo-defined service warranty, as documented in `warranty-policy.md`, applies instead. | Ensures no product category is left without a trust-supporting warranty position. | High | Products, Warranty | None | — |

### 9.3 Claim

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-084 | Valid Proof of Purchase Requirement | A warranty claim requires valid proof of purchase from StackLeo Tech Store. | Prevents fraudulent or ineligible warranty claims. | Critical | Warranty, Orders | None | — |
| BR-085 | Warranty Claim Window | A warranty claim must be submitted within the applicable warranty period defined for the product. | Establishes clear, fair boundaries for warranty coverage. | High | Warranty | None | — |

### 9.4 Replacement

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-086 | Warranty Replacement Eligibility | A warranty replacement is offered only where repair is not feasible or not offered for the product category. | Ensures consistent, policy-aligned resolution of warranty claims. | High | Warranty, Inventory | None | — |

### 9.5 Repair

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-087 | Authorized Repair Channel | Warranty repairs must be routed through brand-authorized or StackLeo-approved repair channels only. | Preserves warranty validity and repair quality assurance. | High | Warranty | None | — |

---

## 10. Review Rules

### 10.1 Verified Purchase

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-088 | Verified Purchase Requirement for Reviews | A customer may submit a product review only if they have a completed order for that product. | Ensures review authenticity and customer trust in review content. | Critical | Reviews, Orders | None | — |

### 10.2 Ratings

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-089 | Single Rating Per Purchase | A customer may submit one rating and review per distinct product purchase. | Prevents rating manipulation through repeated submissions. | High | Reviews | Edits to an existing review are permitted; duplicate new submissions are not. | — |

### 10.3 Media Upload

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-090 | Review Media Moderation | Any photo or video uploaded with a review must pass content moderation before becoming publicly visible. | Prevents inappropriate or irrelevant content from being published. | High | Reviews, Admin | None | — |

### 10.4 Review Moderation

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-091 | Prohibited Review Content | Reviews containing abusive language, personal data, or promotional content unrelated to the product must be rejected or removed. | Maintains a trustworthy, useful review environment. | High | Reviews, Admin | None | — |
| BR-092 | Review Dispute Process | A seller or brand may formally dispute a review believed to violate content guidelines, subject to Admin review. | Provides fair recourse while preserving review authenticity. | Medium | Reviews, Admin | Applies fully once multi-vendor marketplace sellers are introduced, per Section 13. | — |

---

## 11. Promotion Rules

### 11.1 Coupons

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-093 | Coupon Validity Window | A coupon code must have a defined start and expiration date and must not be usable outside that window. | Ensures promotional campaigns remain time-bound and controllable. | High | Promotions, Cart | None | — |
| BR-094 | Coupon Usage Limits | A coupon may define a maximum total redemption count and a maximum redemption count per customer. | Controls promotional cost exposure and prevents abuse. | High | Promotions, Cart | None | — |

### 11.2 Campaigns

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-095 | Campaign Approval Requirement | A promotional campaign must be reviewed and approved by an authorized Admin role before activation. | Ensures promotional pricing and messaging align with business strategy. | High | Promotions, Admin | None | — |

### 11.3 Flash Sale

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-096 | Flash Sale Stock Allocation | A flash sale must define a specific stock allocation, separate from standard inventory, to prevent overselling. | Ensures flash sale demand does not disrupt standard catalog availability. | Critical | Promotions, Inventory | None | — |
| BR-097 | Flash Sale Time Boundaries | A flash sale price must apply only within its explicitly defined start and end time. | Preserves promotional integrity and customer expectations. | Critical | Promotions, Pricing | None | — |

### 11.4 Bundles

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-098 | Bundle Stock Dependency | A product bundle may be sold only while all component products within the bundle remain in stock. | Prevents fulfillment failure from partially unavailable bundles. | High | Promotions, Inventory | None | — |

### 11.5 Referral

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-099 | Referral Reward Eligibility | A referral reward is issued only after the referred customer completes a qualifying first purchase. | Prevents reward abuse and ensures referral value to the business. | Medium | Promotions, Customer | None | — |

### 11.6 Loyalty

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-100 | Loyalty Point Accrual Basis | Loyalty points, where offered, must accrue only on completed and paid orders, not on cancelled or refunded orders. | Ensures loyalty rewards reflect genuine completed business. | Medium | Promotions, Customer, Orders | Not yet active; applies once a loyalty program is formally introduced. | Full loyalty program rules to be defined prior to program launch. |

---

## 12. Admin Rules

### 12.1 Roles

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-101 | Defined Admin Roles | Every internal system user must be assigned exactly one defined administrative role governing their access. | Ensures accountable, appropriately scoped internal access. | Critical | Admin, Security | None | — |

### 12.2 Permissions

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-102 | Least-Privilege Access | Admin roles must be granted only the permissions necessary to perform their defined responsibilities. | Reduces risk of accidental or unauthorized business-critical actions. | Critical | Admin, Security | None | — |

### 12.3 Approval

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-103 | Dual Approval for High-Impact Actions | High-impact actions, such as large-scale price changes or bulk refunds, require approval from a second authorized Admin role. | Reduces risk of error or misuse in high-impact operations. | High | Admin | Threshold definitions for "high-impact" must be maintained by business operations. | — |

### 12.4 Audit Logs

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-104 | Mandatory Audit Logging | All administrative actions affecting pricing, inventory, orders, or customer accounts must be logged with user identity and timestamp. | Supports accountability, dispute resolution, and compliance. | Critical | Admin, Security | None | — |

### 12.5 Reports

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-105 | Role-Based Report Access | Business reports must be accessible only to Admin roles with an explicit business need for that report category. | Protects sensitive business and customer data from unnecessary exposure. | High | Admin, Reporting | None | — |

---

## 13. Seller Rules (Future)

### 13.1 Seller Registration

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-106 | Seller Verification Requirement | A prospective marketplace seller must complete identity and business verification before being approved to sell. | Preserves platform trust and product authenticity standards. | Critical | Marketplace (Future) | Not yet active; applies once multi-vendor marketplace capabilities are introduced. | Verification criteria must be finalized prior to marketplace launch. |

### 13.2 Commission

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-107 | Commission Rate Transparency | Each seller must be informed of the applicable commission rate prior to listing products. | Ensures fair, transparent seller relationships. | High | Marketplace (Future) | Not yet active. | Commission structure to be defined in dedicated marketplace business planning. |

### 13.3 Settlement

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-108 | Defined Settlement Cycle | Seller payouts must occur on a defined, consistent settlement cycle after order completion. | Builds seller trust and predictable cash flow. | High | Marketplace (Future) | Not yet active. | Settlement timing and holdback rules to be defined prior to marketplace launch. |

### 13.4 Product Approval

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-109 | Seller Listing Approval | A seller's product listing must pass content and authenticity review before becoming publicly visible. | Maintains catalog quality and trust standards across all sellers. | Critical | Marketplace (Future), Products | Not yet active. | — |

---

## 14. Security Rules

### 14.1 Authentication

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-110 | Strong Credential Requirement | Customer and Admin passwords must meet a defined minimum strength standard. | Reduces risk of account compromise. | Critical | Security, Customer, Admin | None | — |

### 14.2 Authorization

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-111 | Action-Level Authorization Checks | Every business-critical action must verify that the requesting user is authorized to perform it, regardless of interface. | Prevents unauthorized access to sensitive operations. | Critical | Security, Admin | None | — |

### 14.3 Rate Limiting

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-112 | Abuse-Prevention Rate Limiting | Sensitive actions, such as login attempts and coupon redemption attempts, must be rate-limited per account and per source. | Reduces risk of automated abuse and credential attacks. | High | Security | None | — |

### 14.4 Fraud Detection

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-113 | Suspicious Order Flagging | Orders exhibiting patterns associated with fraud, such as repeated failed payments or mismatched delivery details, must be flagged for manual review. | Reduces financial loss from fraudulent transactions. | High | Security, Orders, Payments | None | — |

### 14.5 Session Rules

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-114 | Session Expiration | Customer and Admin sessions must expire automatically after a defined period of inactivity. | Reduces risk from unattended, authenticated sessions. | High | Security | None | — |

---

## 15. Reporting Rules

### 15.1 Revenue

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-115 | Revenue Recognition Basis | Revenue must be reported based on completed and paid orders, excluding cancelled, refunded, or pending-payment orders. | Ensures accurate financial reporting. | Critical | Reporting, Finance | None | — |

### 15.2 Orders

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-116 | Channel-Level Order Reporting | Order reports must be capable of segmenting results by sales channel, including online store and physical store. | Supports channel performance evaluation, consistent with `objectives.md`. | High | Reporting, Orders | None | — |

### 15.3 Customers

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-117 | Customer Reporting Privacy Boundary | Customer-level reports must exclude sensitive personal data not required for the reporting purpose. | Protects customer privacy in internal reporting. | High | Reporting, Customer, Compliance | None | — |

### 15.4 Inventory

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-118 | Real-Time Inventory Reporting | Inventory reports must reflect stock levels as close to real time as operationally feasible. | Supports timely replenishment and accurate business decisions. | High | Reporting, Inventory | None | — |

### 15.5 Finance

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-119 | Reconciled Financial Reporting | Financial reports must reconcile order revenue, refunds, and payment gateway records before being finalized. | Ensures financial accuracy and supports compliance. | Critical | Reporting, Finance, Payments | None | — |

---

## 16. Notification Rules

### 16.1 Email

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-120 | Mandatory Order Email Notifications | A customer must receive an email notification for order confirmation, shipment, and delivery, at minimum. | Maintains customer awareness and trust throughout the order lifecycle. | High | Notifications, Orders | None | — |

### 16.2 SMS

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-121 | SMS Notification for Delivery Events | A customer must receive an SMS notification for time-sensitive delivery events, such as out-for-delivery status. | Supports timely customer awareness for delivery coordination. | Medium | Notifications, Shipping | Requires a verified mobile number, per BR-011. | — |

### 16.3 Push

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-122 | Push Notification Consent | Push notifications may be sent only to customers who have explicitly enabled them. | Respects customer preference and applicable privacy expectations. | Medium | Notifications | Applies once a mobile app is introduced. | Full rules to be expanded upon mobile app launch. |

### 16.4 In-App

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-123 | In-App Notification Retention | In-app notifications must remain accessible to the customer for a defined retention period after being sent. | Allows customers to review past updates conveniently. | Low | Notifications | None | — |

---

## 17. Compliance Rules

### 17.1 VAT

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-124 | VAT Application | Value Added Tax must be applied to applicable orders in accordance with Bangladesh tax regulations. | Ensures legal and regulatory compliance. | Critical | Compliance, Checkout, Finance | None | — |

### 17.2 Tax

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-125 | Accurate Tax Recordkeeping | All applicable taxes collected must be accurately recorded and reconcilable for regulatory reporting. | Supports compliance and audit readiness. | Critical | Compliance, Finance | None | — |

### 17.3 Invoice

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-126 | Compliant Invoice Content | Every invoice must include all legally required information applicable in Bangladesh, including applicable tax details. | Ensures legal compliance and customer transparency. | Critical | Compliance, Orders | None | — |

### 17.4 Consumer Rights

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-127 | Consumer Protection Alignment | Return, refund, and warranty policies must align with applicable consumer protection regulations in Bangladesh. | Ensures legal compliance and reinforces customer trust. | Critical | Compliance, Returns, Warranty | None | — |

### 17.5 Privacy

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-128 | Customer Data Privacy Protection | Customer personal data must be collected, stored, and used only in accordance with applicable privacy expectations and business necessity. | Protects customer trust and legal compliance. | Critical | Compliance, Customer, Security | None | — |

---

## 18. Marketplace Rules (Future)

### 18.1 Seller

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-129 | Seller Brand Restriction | A marketplace seller may only list products under brands they are verified and authorized to sell. | Preserves product authenticity across the marketplace. | Critical | Marketplace (Future) | Not yet active. | — |

### 18.2 Commission

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-130 | Commission Deduction at Settlement | Marketplace commission must be deducted automatically at the time of seller settlement, not collected separately. | Simplifies seller payout processes and ensures consistent commission capture. | High | Marketplace (Future) | Not yet active. | — |

### 18.3 Disputes

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-131 | Marketplace Dispute Resolution Process | Disputes between customers and marketplace sellers must be escalated to StackLeo for resolution if not resolved directly. | Preserves customer trust in the overall platform, independent of individual seller conduct. | High | Marketplace (Future) | Not yet active. | — |

### 18.4 Escrow

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-132 | Escrowed Marketplace Payments | Customer payments for marketplace seller orders must be held by StackLeo until order completion criteria are met before seller settlement. | Protects customers and maintains platform trust in marketplace transactions. | Critical | Marketplace (Future), Payments | Not yet active. | — |

### 18.5 Settlement

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-133 | Marketplace Settlement Reconciliation | Marketplace seller settlements must be reconciled against completed orders, commissions, and any applicable refunds before payout. | Ensures accurate and fair seller payouts. | High | Marketplace (Future), Finance | Not yet active. | — |

---

## 19. AI Rules (Future)

### 19.1 Recommendations

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-134 | Recommendation Relevance Boundary | Future product recommendations must be based on genuine customer behavior and catalog relevance, not sponsored placement alone. | Preserves customer trust in recommendation quality. | Medium | AI (Future) | Not yet active. | Sponsored placements, if introduced, must be clearly distinguished from organic recommendations. |

### 19.2 Forecasting

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-135 | Forecasting Data Basis | Future demand forecasting must be based on verified historical sales and inventory data. | Ensures forecasting supports reliable business planning. | Medium | AI (Future), Inventory | Not yet active. | — |

### 19.3 Search

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-136 | Search Result Accuracy | Future intelligent search features must prioritize accurate, relevant product matches over promotional bias. | Preserves customer trust in the platform's product discovery experience. | Medium | AI (Future), Products | Not yet active. | — |

### 19.4 Chatbot

| Rule ID | Title | Description | Business Reason | Priority | Affected Modules | Exceptions | Future Notes |
|---|---|---|---|---|---|---|---|
| BR-137 | Chatbot Escalation to Human Support | A future customer service chatbot must escalate unresolved or sensitive issues to human support. | Ensures customers are not left without adequate resolution for complex issues. | Medium | AI (Future), Support | Not yet active. | — |

---

## 20. Business Rule Governance

### 20.1 Versioning

Every change to this document must increment its version number in accordance with the versioning policy defined in `00_Project_Overview/changelog.md`. Individual rule additions, modifications, or removals must be recorded with a corresponding changelog entry describing the change and its business justification.

### 20.2 Ownership

| Role | Responsibility |
|---|---|
| Business Analyst | Maintains the accuracy and completeness of this document. |
| Project Lead / Product Manager | Approves changes to business rules that affect project scope or priority. |
| Solution Architect / Technical Lead | Ensures technical documentation and system behavior remain aligned with approved business rules. |
| Founder / Business Owner | Provides final approval for changes affecting core business policy or strategy. |

### 20.3 Review Process

- This document should be reviewed at the conclusion of each major project phase defined in `00_Project_Overview/project-roadmap.md`.
- New business rules must follow the same structure defined in this document, including a unique Rule ID, description, business reason, priority, and affected modules.
- Rules marked "Future" must be finalized and reviewed before the corresponding capability is activated in any system.

### 20.4 Exceptions

- Any exception to an established business rule must be explicitly documented within the rule's Exceptions field.
- Undocumented exceptions are not considered valid; any deviation from a documented rule must be treated as a defect requiring resolution or a formal rule change.

### 20.5 Approval Process

- Proposed changes to Critical or High priority rules require review and approval from both the Business Analyst and the Project Lead / Product Manager before adoption.
- Proposed changes affecting compliance, warranty, or payment rules additionally require confirmation of continued alignment with applicable Bangladesh regulations.
- All approved changes must be reflected in this document and recorded in `00_Project_Overview/changelog.md`.

---

## Document Information

| Property | Value |
|----------|-------|
| Document | business-rules.md |
| Version | 1.0.0 |
| Status | Active |
| Maintained By | StackLeo |
| Last Updated | 2026-07-17 |

---

© StackLeo. All Rights Reserved.
