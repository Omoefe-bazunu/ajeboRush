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
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchUserOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
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
    switch (status) {
      case "pending":
        return "bg-accent text-fashion border-accent";
      case "completed":
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
        {/* EDITORIAL HEADER */}
        <header className="mb-8 border-b border-gray-100 pb-8">
          <h1 className="font-display text-5xl md:text-8xl font-black text-fashion uppercase tracking-tighter leading-none">
            your <span className="text-rush italic">Orders</span>
          </h1>
        </header>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <p className="font-display text-2xl font-bold text-fashion/40 uppercase tracking-tighter mb-8">
              No orders found in the archives.
            </p>
            <Link
              href="/"
              className="inline-block px-10 py-4 bg-fashion text-white rounded-full font-display font-bold uppercase tracking-widest hover:bg-rush transition-all shadow-xl shadow-fashion/10"
            >
              Start Your Journey
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`group border-2 transition-all duration-500 rounded-[2rem] overflow-hidden ${
                  expandedId === order.id
                    ? "border-rush shadow-2xl"
                    : "border-gray-50 hover:border-gray-100"
                }`}
              >
                {/* Order Summary Header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className={`w-full flex flex-col md:flex-row items-center justify-between p-6 md:p-8 transition-colors ${
                    expandedId === order.id
                      ? "bg-white"
                      : "bg-gray-50/50 hover:bg-white"
                  }`}
                >
                  <div className="flex-1 w-full  text-left mb-4 md:mb-0">
                    <div className="flex w-full  flex-row items-center justify-between gap-4 mb-3">
                      <h3 className="font-display flex justify-between text-xl md:text-2xl font-black text-fashion uppercase tracking-tighter leading-none">
                        Order{" "}
                        <span className="text-rush ml-4">
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

                  <div className="flex items-center gap-8 w-full  justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                    <div className="">
                      <span className="text-[10px] font-display font-black text-fashion/30 uppercase tracking-widest block">
                        Total Amount
                      </span>
                      <p className="font-display text-3xl font-black text-fashion leading-none mt-1">
                        ${order.totalAmount?.toFixed(2) || "0.00"}
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

                {/* Expanded Details Content */}
                {expandedId === order.id && (
                  <div className="p-8 md:p-10 bg-white border-t border-gray-50 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Shipping & Log */}
                      <div className="space-y-8">
                        <div>
                          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-rush flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4" /> Shipping Destination
                          </h4>
                          <p className="font-sans text-lg text-fashion leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <span className="font-bold">
                              {user.displayName || "Client"}
                            </span>{" "}
                            <br />
                            {order.address} <br />
                            {order.city}, {order.state} {order.zip}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-rush flex items-center gap-2 mb-4">
                            <ReceiptText className="w-4 h-4" /> Invoice Details
                          </h4>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2">
                            <div className="flex justify-between font-sans text-sm text-fashion/60">
                              <span>Subtotal</span>
                              <span>
                                $
                                {(
                                  order.totalAmount - (order.shipping || 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between font-sans text-sm text-fashion/60">
                              <span>Shipping Fee</span>
                              <span>
                                ${order.shipping?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                            <div className="flex justify-between font-display font-black text-lg text-fashion pt-4 border-t border-gray-200">
                              <span>Grand Total</span>
                              <span>${order.totalAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Itemized List */}
                      <div>
                        <h4 className="font-display font-bold text-xs uppercase tracking-widest text-rush flex items-center gap-2 mb-4">
                          <Package className="w-4 h-4" /> Manifest
                        </h4>
                        <div className="space-y-4">
                          {order.cartItems?.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Small Preview if image exists */}
                              <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                                {item.imageURL ? (
                                  <img
                                    src={item.imageURL}
                                    alt={item.name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full text-[8px] text-fashion/20 font-black">
                                    DROP
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-display font-black text-sm text-fashion uppercase truncate leading-none mb-1">
                                  {item.name}
                                </p>
                                {item.selectedSize && (
                                  <p className="font-sans text-[10px] font-bold text-rush uppercase tracking-widest mb-1">
                                    Size: {item.selectedSize}
                                  </p>
                                )}
                                <p className="font-sans text-xs text-fashion/50 uppercase font-black">
                                  {item.quantity} x ${item.price?.toFixed(2)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-display font-black text-fashion text-lg leading-none">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* BACK NAVIGATION */}
            <div className="mt-20 pt-12 border-t border-gray-100 flex justify-center">
              <Link
                href="/cart"
                className="group flex flex-col items-center gap-4 text-fashion/40 hover:text-rush transition-all"
              >
                <div className="p-5 rounded-full border-2 border-gray-50 group-hover:border-rush transition-all">
                  <Undo className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </div>
                <p className="font-display font-black uppercase tracking-[0.2em] text-[10px]">
                  Return to Cart
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
