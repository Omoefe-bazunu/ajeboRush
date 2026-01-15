"use client";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
  X,
  ShoppingBag,
} from "lucide-react";

export function AddToCartButton({ item }) {
  const { addToCart } = useCart();

  // State management
  const [selectedPortion, setSelectedPortion] = useState(
    item.fullPrice ? "Full" : "Half"
  );
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || "");
  const [showModal, setShowModal] = useState(false);

  const isCatering = item.type === "catering";

  const handleAddToCart = () => {
    if (item.type === "fashion" && !selectedSize) {
      return; // Validation handled by UI state usually
    }

    let finalPrice = item.price;
    if (isCatering) {
      finalPrice = selectedPortion === "Full" ? item.fullPrice : item.halfPrice;
    }

    const cartItem = {
      ...item,
      price: Number(finalPrice),
      selectedOption: isCatering ? selectedPortion : selectedSize,
      selectedSize: item.type === "fashion" ? selectedSize : null,
    };

    addToCart(cartItem);
    setShowModal(true); // Trigger the high-end UI modal
  };

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* 1. SELECTION UI (Catering Portions / Fashion Sizes) */}
      {isCatering ? (
        <div className="space-y-3">
          <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
            <Layers className="w-3 h-3 text-rush" /> Select Portion
          </label>
          <div className="flex gap-3">
            {item.fullPrice && (
              <button
                onClick={() => setSelectedPortion("Full")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedPortion === "Full"
                    ? "border-fashion bg-fashion text-white shadow-lg"
                    : "border-gray-100 bg-gray-50 text-fashion/40"
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest">
                  Full Tray
                </span>
                <span className="font-display font-bold">
                  ${item.fullPrice}
                </span>
              </button>
            )}
            {item.halfPrice && (
              <button
                onClick={() => setSelectedPortion("Half")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedPortion === "Half"
                    ? "border-rush bg-rush text-white shadow-lg"
                    : "border-gray-100 bg-gray-50 text-rush/40"
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest">
                  Half Tray
                </span>
                <span className="font-display font-bold">
                  ${item.halfPrice}
                </span>
              </button>
            )}
          </div>
        </div>
      ) : (
        item.sizes && (
          <div className="space-y-3">
            <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full border-2 font-display font-bold text-xs flex items-center justify-center transition-all ${
                    selectedSize === size
                      ? "bg-fashion border-fashion text-white shadow-md"
                      : "bg-white border-gray-100 text-fashion/40"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* 2. MAIN ACTION BUTTON */}
      <button
        onClick={handleAddToCart}
        className="group relative w-full md:w-64 py-4 bg-rush text-white rounded-full font-display font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-rush/20 transition-all hover:bg-fashion hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>

      {/* 3. SUCCESS MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-fashion/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-fashion/20 hover:text-rush transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>

              <h3 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter mb-2">
                Cart <span className="text-rush italic">Updated</span>
              </h3>

              <p className="font-sans text-sm text-fashion/60 mb-8 px-4">
                <span className="font-bold text-fashion">{item.name}</span> has
                been added to your current order Cart.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href="/cart"
                  className="w-full py-4 bg-fashion text-white rounded-full font-display font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-rush transition-all shadow-lg"
                >
                  View Cart <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 bg-gray-50 text-fashion/40 rounded-full font-display font-bold uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
