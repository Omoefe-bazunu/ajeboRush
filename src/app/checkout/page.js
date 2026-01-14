"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/common/buttons";
import Image from "next/image";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Undo,
  ShieldCheck,
  Truck,
  MessageCircle,
  CreditCard,
} from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const cartRef = collection(db, "users", user.uid, "cart");
        const snapshot = await getDocs(cartRef);
        const cartItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCart(cartItems);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    };

    if (user) fetchCart();
  }, [user, router]);

  const totalPrice = cart.reduce((total, item) => {
    const price = item.discountedPrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.address) newErrors.address = "Shipping address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.zip) newErrors.zip = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearCartFromFirestore = async () => {
    if (!user) return;
    try {
      const cartRef = collection(db, "users", user.uid, "cart");
      const snapshot = await getDocs(cartRef);
      for (const cartDoc of snapshot.docs) {
        await deleteDoc(doc(db, "users", user.uid, "cart", cartDoc.id));
      }
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const handleWhatsAppOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) return alert("Security session expired. Please log in.");
    if (cart.length === 0) return alert("Your cart is currently empty.");

    setLoading(true);

    try {
      const orderData = {
        userId: user.uid,
        userEmail: formData.email,
        customerName: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        cartItems: cart.map((item) => ({
          id: item.id,
          name: item.name,
          selectedSize: item.selectedSize || null,
          quantity: item.quantity,
          price: item.discountedPrice || item.price,
          imageURL: item.imageURL,
        })),
        totalAmount: totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      await clearCartFromFirestore();

      const orderDetails = cart
        .map(
          (item, index) =>
            `${index + 1}. *${item.name}* ${
              item.selectedSize ? `(Size: ${item.selectedSize})` : ""
            } - ${item.quantity} unit(s) @ $${
              item.discountedPrice || item.price
            }`
        )
        .join("%0A");

      const shippingInfo = `*NEW STUDIO ORDER*%0A%0A*Client Details:*%0AName: ${
        formData.name
      }%0AEmail: ${formData.email}%0AAddress: ${formData.address}, ${
        formData.city
      }, ${formData.state} ${
        formData.zip
      }%0A%0A*Order Total:* $${totalPrice.toFixed(
        2
      )}%0A%0A*Manifest:*%0A${orderDetails}%0A%0A_Secured via AjeboRush Checkout_`;

      const whatsappNumber = "18172989961";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${shippingInfo}`;

      window.open(whatsappUrl, "_blank");
      router.push("/orders");
    } catch (error) {
      alert("Order transmission failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-rush border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-black uppercase tracking-widest text-[10px] text-fashion/20">
          Preparing Checkout Studio...
        </p>
      </div>
    );

  return (
    <main className="min-h-screen bg-white pt-32 pb-24 md:pt-44 px-6">
      <div className="max-w-7xl mx-auto">
        {/* EDITORIAL HEADER */}
        <header className="mb-16">
          <span className="font-display text-rush font-bold uppercase tracking-[0.3em] text-[10px] mb-2 block">
            Final Step
          </span>
          <h1 className="font-display text-5xl md:text-8xl font-black text-fashion uppercase tracking-tighter leading-none">
            Secure <span className="text-rush">Checkout</span>
          </h1>
        </header>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <p className="font-display text-2xl font-bold text-fashion/40 uppercase tracking-tighter mb-8">
              Your manifest is empty
            </p>
            <Button
              href="/"
              className="bg-fashion text-white px-12 py-4 rounded-full font-display font-bold uppercase tracking-widest"
            >
              Start Exploring
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* SHIPPING DOSSIER */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2 bg-rush/10 rounded-xl">
                    <Truck className="w-5 h-5 text-rush" />
                  </div>
                  <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter">
                    Shipping Details
                  </h2>
                </div>

                <form
                  onSubmit={handleWhatsAppOrder}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {[
                    {
                      name: "name",
                      label: "Full Name",
                      placeholder: "e.g. Ebuka Davies",
                      col: "md:col-span-2",
                    },
                    {
                      name: "email",
                      label: "Email Link",
                      placeholder: "name@example.com",
                      col: "md:col-span-2",
                    },
                    {
                      name: "address",
                      label: "Logistics Address",
                      placeholder: "Street address, Apt, Suite",
                      col: "md:col-span-2",
                    },
                    { name: "city", label: "City", placeholder: "Dallas" },
                    { name: "state", label: "State", placeholder: "TX" },
                    { name: "zip", label: "ZIP Code", placeholder: "75001" },
                  ].map((field) => (
                    <div key={field.name} className={field.col || ""}>
                      <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion/40 mb-2 block px-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all shadow-inner"
                      />
                      {errors[field.name] && (
                        <p className="text-rush text-[10px] font-bold uppercase mt-2 px-1 tracking-wider italic">
                          {errors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="md:col-span-2 pt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full group flex items-center justify-center gap-4 bg-rush text-white py-6 rounded-full font-display font-black uppercase tracking-[0.2em] text-sm hover:bg-fashion transition-all shadow-xl shadow-rush/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Finalize via WhatsApp
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-fashion/30">
                        <ShieldCheck className="w-3 h-3 text-green-500" />{" "}
                        Secure Protocol
                      </div>
                      <div className="h-1 w-1 bg-gray-200 rounded-full" />
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-fashion/30">
                        <CreditCard className="w-3 h-3 text-rush" /> Instant
                        Concierge
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* ORDER MANIFEST SIDEBAR */}
            <aside className="lg:col-span-5">
              <div className="bg-fashion p-10 rounded-[3rem] text-white shadow-2xl lg:sticky lg:top-44 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <ShoppingBagIcon className="w-48 h-48" />
                </div>

                <h2 className="font-display text-3xl font-black uppercase tracking-tighter mb-10 border-b border-white/10 pb-6">
                  Order Summary
                </h2>

                <div className="space-y-6 mb-12">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.selectedSize}`}
                      className="flex items-center gap-5 group"
                    >
                      <div className="relative w-16 h-16 shrink-0 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                        <Image
                          src={item.imageURL}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-black text-xs uppercase tracking-tight truncate">
                          {item.name}
                        </p>
                        {item.selectedSize && (
                          <p className="text-[10px] font-sans font-bold text-rush uppercase tracking-widest mt-1">
                            Size: {item.selectedSize}
                          </p>
                        )}
                        <p className="text-white/40 font-sans text-xs mt-1">
                          {item.quantity} x $
                          {(item.discountedPrice || item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-black text-sm">
                          $
                          {(
                            (item.discountedPrice || item.price) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-10 border-t border-white/10 relative z-10">
                  <div className="flex justify-between font-sans text-xs text-white/40 uppercase tracking-[0.2em]">
                    <span>Studio Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-xs text-white/40 uppercase tracking-[0.2em]">
                    <span>Logistics</span>
                    <span className="text-rush font-bold">Complimentary</span>
                  </div>
                  <div className="pt-6 flex justify-between items-end">
                    <span className="font-display font-black uppercase text-xs tracking-widest">
                      Settlement Total
                    </span>
                    <span className="font-display text-5xl font-black leading-none">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/cart"
                  className="mt-12 flex items-center justify-center gap-2 text-[10px] font-display font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
                >
                  <Undo className="w-3 h-3" /> Edit Manifest
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

// Minimal ShoppingBag Icon for background
function ShoppingBagIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}
