"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import {
  ChevronDown,
  Undo,
  Package,
  Clock,
  MapPin,
  ReceiptText,
  Sparkles,
  ChefHat,
  Shirt,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function UserOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchAllOrders = async () => {
      try {
        // 1. Fetch Standard Orders
        const standardQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        // 2. Fetch Custom Bespoke Requests (using email as identifier)
        const customQuery = query(
          collection(db, "CustomOrders"),
          where("email", "==", user.email),
          orderBy("createdAt", "desc")
        );

        const [standardSnap, customSnap] = await Promise.all([
          getDocs(standardQuery),
          getDocs(customQuery),
        ]);

        const standardData = standardSnap.docs.map((doc) => ({
          id: doc.id,
          orderType: "standard",
          ...doc.data(),
        }));

        const customData = customSnap.docs.map((doc) => ({
          id: doc.id,
          orderType: "custom",
          ...doc.data(),
        }));

        setOrders(standardData);
        setCustomOrders(customData);
      } catch (error) {
        console.error("Error fetching archives:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [user, router]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending":
      case "unprocessed":
        return "bg-accent text-fashion border-accent";
      case "completed":
      case "processed":
        return "bg-fashion text-white border-fashion";
      case "cancelled":
        return "bg-rush/10 text-rush border-rush/20";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-rush border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-bold uppercase tracking-widest text-xs text-fashion/20">
          Accessing Archives...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-32 pb-24 md:pt-44 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16">
          <h1 className="font-display text-5xl md:text-8xl font-black text-fashion uppercase tracking-tighter leading-none mb-4">
            Order <span className="text-rush">Archives</span>
          </h1>
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-fashion/30">
            A history of your AjeboRush Selections
          </p>
        </header>

        {/* --- SECTION 1: BESPOKE MANIFESTS (CUSTOM ORDERS) --- */}
        {customOrders.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tight">
                Custom<span className="italic ml-2 text-rush">Orders</span>
              </h2>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="space-y-4">
              {customOrders.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-100 rounded-4xl p-6 md:p-8 bg-gray-50/30 hover:bg-white transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(
                            request.status
                          )}`}
                        >
                          {request.status || "Pending"}
                        </span>
                        <span className="font-display font-bold text-[10px] text-fashion/40 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" />{" "}
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-black text-fashion uppercase tracking-tight flex items-center gap-2">
                        {request.category === "catering" ? (
                          <ChefHat className="w-4 h-4 text-rush" />
                        ) : (
                          <Shirt className="w-4 h-4 text-fashion" />
                        )}
                        {request.category} Request
                      </h3>
                      <p className="font-sans text-sm text-fashion/60 italic max-w-2xl leading-relaxed">
                        &quot;{request.description}&quot;
                      </p>
                    </div>

                    {request.attachments?.length > 0 && (
                      <div className="flex gap-2 h-20">
                        {request.attachments.map((img, i) => (
                          <div
                            key={i}
                            className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-sm"
                          >
                            <Image
                              src={img}
                              alt="Inspiration"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- SECTION 2: PRODUCT ARCHIVES (STANDARD ORDERS) --- */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <Package className="text-fashion w-5 h-5" />
            <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tight">
              Product <span className="italic text-rush">Ordered</span>
            </h2>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
              <p className="font-display text-xl font-bold text-fashion/20 uppercase tracking-tighter">
                No catalog orders found.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`border-2 transition-all duration-500 rounded-4xl overflow-hidden ${
                    expandedId === order.id
                      ? "border-rush shadow-2xl"
                      : "border-gray-50"
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-white"
                  >
                    <div className="flex-1 w-full text-left">
                      <div className="flex items-center justify-between md:justify-start gap-4 mb-3">
                        <h3 className="font-display text-xl font-black text-fashion uppercase tracking-tighter">
                          Order{" "}
                          <span className="text-rush">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                        </h3>
                        <span
                          className={`px-4 py-1 rounded-full text-[10px] font-display font-black uppercase tracking-widest border ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="font-sans text-xs font-bold text-fashion/40 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3" />{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-8 w-full justify-between md:justify-end mt-4 md:mt-0">
                      <div>
                        <span className="text-[10px] font-display font-black text-fashion/30 uppercase tracking-widest block">
                          Grand Total
                        </span>
                        <p className="font-display text-3xl font-black text-fashion leading-none mt-1">
                          ${order.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                      <ChevronDown
                        size={24}
                        className={`text-rush transition-transform duration-500 ${
                          expandedId === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedId === order.id && (
                    <div className="p-8 md:p-10 bg-white border-t border-gray-50 animate-in fade-in duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div>
                            <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-rush flex items-center gap-2 mb-4">
                              <MapPin className="w-4 h-4" /> Shipping Manifest
                            </h4>
                            <p className="font-sans text-sm text-fashion leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                              <span className="font-bold">
                                {user.displayName || "Valued Client"}
                              </span>
                              <br />
                              {order.address} <br />
                              {order.city}, {order.state} {order.zip}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-rush flex items-center gap-2 mb-4">
                              <ReceiptText className="w-4 h-4" /> Valuation
                            </h4>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2">
                              <div className="flex justify-between font-sans text-xs text-fashion/60">
                                <span>Subtotal</span>
                                <span>
                                  $
                                  {(
                                    order.totalAmount - (order.shipping || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between font-sans text-xs text-fashion/60 border-b border-gray-200 pb-2">
                                <span>Shipping</span>
                                <span>
                                  ${order.shipping?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                              <div className="flex justify-between font-display font-black text-lg text-fashion pt-2">
                                <span>Total</span>
                                <span>${order.totalAmount?.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-rush flex items-center gap-2 mb-4">
                            <Package className="w-4 h-4" /> Itemized List
                          </h4>
                          <div className="space-y-4">
                            {order.cartItems?.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl"
                              >
                                <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                                  {item.imageURL ? (
                                    <Image
                                      src={item.imageURL}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full text-[8px] text-fashion/20 font-black">
                                      DROP
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-display font-black text-xs text-fashion uppercase truncate mb-1">
                                    {item.name}
                                  </p>
                                  {item.selectedOption && (
                                    <p className="font-sans text-[8px] font-bold text-rush uppercase tracking-widest">
                                      {item.selectedOption}
                                    </p>
                                  )}
                                  <p className="font-sans text-[10px] text-fashion/40 uppercase font-black">
                                    {item.quantity} x ${item.price?.toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-display font-black text-fashion text-sm">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-20 pt-12 border-t border-gray-100 flex justify-center">
          <Link
            href="/"
            className="group flex flex-col items-center gap-4 text-fashion/40 hover:text-rush transition-all"
          >
            <div className="p-5 rounded-full border-2 border-gray-50 group-hover:border-rush transition-all">
              <Undo className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </div>
            <p className="font-display font-black uppercase tracking-[0.2em] text-[10px]">
              Back to Home
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
