import type { Metadata } from "next";
import { getPublicSettings } from "@/lib/data/settings";
import { CartCheckout } from "@/components/cart/cart-checkout";

export const metadata: Metadata = { title: "Warenkorb", robots: { index: false } };

export default async function CartPage() {
  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <h1 className="font-serif text-3xl text-ink">Warenkorb</h1>
      <div className="mt-8">
        <CartCheckout
          hermesPrice={settings.hermesPrice}
          processingTimeText={settings.processingTimeText}
          pickupLocation={settings.pickupLocation}
        />
      </div>
    </div>
  );
}
