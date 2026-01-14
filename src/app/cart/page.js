"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Button from "@/components/common/buttons";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ListOrdered, X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

// --- REBRANDED CONFIRMATION MODAL ---
const ConfirmationModal = ({ item, onConfirm, onCancel }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-fashion/60 backdrop-blur-sm flex items-center justify-center z-[100] px-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full relative border border-gray-100">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-gray-400 hover:text-rush transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter mb-4">
          Remove Item?
        </h3>
        <p className="font-sans text-fashion/60 mb-8 leading-relaxed">
          Are you sure you want to remove{" "}
          <span className="text-fashion font-bold">{item.name}</span>
          {item.selectedSize ? ` (Size: ${item.selectedSize})` : ""} from your
          collection?
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="py-3 bg-gray-100 text-fashion font-display font-bold uppercase text-[10px] tracking-widest rounded-full hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item.firestoreId)}
            className="py-3 bg-rush text-white font-display font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-fashion transition-all shadow-lg shadow-rush/20"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    if (user === null && !loading) router.push("/login");
  }, [user, router, loading]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setCart([]);
      return;
    }
    const cartRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const cartItems = snapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));
      setCart(cartItems);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const deleteItemFromFirestore = async (firestoreId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "cart", firestoreId));
    } catch (error) {
      console.error(error);
    } finally {
      setItemToRemove(null);
    }
  };

  const updateCartInFirestore = async (item) => {
    try {
      await updateDoc(doc(db, "users", user.uid, "cart", item.firestoreId), {
        quantity: item.quantity,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const totalPrice = cart.reduce(
    (total, item) =>
      total + (item.discountedPrice || item.price) * item.quantity,
    0
  );

  const handleIncreaseQuantity = (item) => {
    const updatedItem = { ...item, quantity: item.quantity + 1 };
    updateCartInFirestore(updatedItem);
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity === 1) {
      setItemToRemove(item);
      return;
    }
    const updatedItem = { ...item, quantity: item.quantity - 1 };
    updateCartInFirestore(updatedItem);
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-rush border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-bold uppercase tracking-widest text-xs text-fashion/20">
          Retrieving Collection...
        </p>
      </div>
    );

  return (
    <main className="min-h-screen bg-white pt-32  pb-24 md:pt-44 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* EDITORIAL HEADER */}
        <header className="mb-8 text-center mx-auto border-b border-gray-100 pb-8">
          <h1 className="font-display text-5xl md:text-8xl font-black text-fashion uppercase tracking-tighter leading-none">
            YOUR<span className="text-rush">Cart</span>
          </h1>
        </header>

        <ConfirmationModal
          item={itemToRemove}
          onConfirm={deleteItemFromFirestore}
          onCancel={() => setItemToRemove(null)}
        />

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <p className="font-display text-2xl font-bold text-fashion/40 uppercase tracking-tighter mb-8">
              Your cart is currently empty
            </p>
            <div className="flex flex-col items-center gap-6">
              <Button
                href="/"
                className="bg-fashion text-white px-10 py-4 rounded-full font-display font-bold uppercase tracking-widest hover:bg-rush transition-all"
              >
                Start Exploring
              </Button>
              <Link
                href="/orders"
                className="flex items-center gap-2 text-fashion/40 hover:text-rush transition-all font-display font-bold uppercase tracking-[0.2em] text-[10px]"
              >
                <ListOrdered className="w-4 h-4" /> View Past Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-16">
            {/* ITEM LIST */}
            <div className=" space-y-8">
              {cart.map((item) => (
                <div
                  key={item.firestoreId}
                  className="group relative flex flex-col md:flex-row items-center gap-8 p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-2xl hover:shadow-fashion/5 transition-all"
                >
                  <div className="relative w-32 h-32 md:w-44 md:h-44 shrink-0 overflow-hidden rounded-2xl bg-gray-50">
                    <Image
                      src={item.imageURL || "/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <span className="text-[10px] font-display font-black text-rush uppercase tracking-widest">
                      {item.type}
                    </span>
                    <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter">
                      {item.name}
                    </h2>
                    {item.selectedSize && (
                      <p className="font-sans text-xs font-bold text-fashion/40 uppercase tracking-widest">
                        Size: {item.selectedSize}
                      </p>
                    )}
                    <p className="font-display text-xl font-black text-fashion/80 pt-2">
                      ${item.discountedPrice || item.price}{" "}
                      <span className="text-xs font-medium text-gray-400">
                        x {item.quantity}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-between gap-6 w-full md:w-auto md:border-l md:border-gray-50 md:pl-8">
                    <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                      <button
                        onClick={() => handleDecreaseQuantity(item)}
                        className="w-8 h-8 flex items-center justify-center font-bold hover:text-rush transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-display font-black text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(item)}
                        className="w-8 h-8 flex items-center justify-center font-bold hover:text-rush transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => setItemToRemove(item)}
                      className="p-3 text-gray-300 hover:text-rush hover:bg-rush/5 rounded-full transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY SIDEBAR */}
            <aside className="lg:col-span-1 border-t border-gray-100 pt-8">
              <div className="bg-fashion p-10 rounded-[2.5rem] text-white shadow-2xl lg:sticky lg:top-44">
                <h2 className="font-display text-3xl font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-6">
                  Summary
                </h2>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between font-sans text-sm text-white/50 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-sm text-white/50 uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-rush font-bold italic">
                      Calculated at Checkout
                    </span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <span className="font-display font-black uppercase text-xs tracking-widest">
                      Total
                    </span>
                    <span className="font-display text-4xl font-black leading-none">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="group flex items-center justify-center gap-3 bg-rush text-white py-5 rounded-full font-display font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-fashion transition-all"
                >
                  Checkout Now{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-6">
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 text-white/40 hover:text-white transition-colors text-[10px] font-display font-bold uppercase tracking-widest"
                  >
                    <ListOrdered className="w-4 h-4" /> Order History
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="text-center mx-auto mt-8 cursor-pointer text-rush/60 hover:text-rush transition-colors text-2xl font-display font-bold uppercase tracking-widest"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
