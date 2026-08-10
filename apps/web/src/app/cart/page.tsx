import { CartView } from "../../components/cart/CartView";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return <CartView />;
}
