"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ChevronDown,
  ShoppingBag,
  User,
  Mail,
  MapPin,
  Package,
  Receipt,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [fulfillingId, setFulfillingId] = useState(null); // Tracks specific button loading

  // Real-time listener for orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleMarkAsFulfilled = async (orderId) => {
    setFulfillingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "completed",
        fulfilledAt: new Date(),
      });
      // onSnapshot will handle the UI update automatically
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setFulfillingId(null);
    }
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
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-rush border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-display font-bold uppercase tracking-widest text-[10px] text-fashion/20">
          Accessing Studio Archives...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-fashion text-white rounded-lg">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter">
          Transaction <span className="text-rush italic">Orders</span>
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
          <p className="font-display text-xl font-bold text-fashion/30 uppercase tracking-tighter">
            The Ledger is Empty
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`group border-2 transition-all duration-500 rounded-[2rem] overflow-hidden ${
                expandedId === order.id
                  ? "border-rush shadow-2xl bg-white"
                  : "border-gray-50 bg-gray-50/30 hover:bg-white hover:border-gray-100"
              }`}
            >
              {/* HEADER BAR */}
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full flex flex-col md:flex-row items-center justify-between p-6 md:p-8"
              >
                <div className="flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <h3 className="font-display text-xl font-black text-fashion uppercase tracking-tighter leading-none">
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
                  <div className="flex items-center gap-4">
                    <p className="font-sans text-xs font-bold text-fashion/60 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3 h-3 text-rush" />{" "}
                      {order.customerName}
                    </p>
                    <p className="font-sans text-[10px] font-bold text-fashion/30 uppercase tracking-widest">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] font-display font-black text-fashion/20 uppercase tracking-widest block">
                      Settlement
                    </span>
                    <p className="font-display text-2xl font-black text-fashion leading-none mt-1">
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-rush transition-transform duration-500 ${
                      expandedId === order.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* EXPANDED CONTENT */}
              {expandedId === order.id && (
                <div className="p-8 md:p-12 bg-white border-t border-gray-50 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* LEFT: Client Dossier */}
                    <div className="lg:col-span-1 space-y-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-rush flex items-center gap-2 mb-4">
                            <User className="w-3 h-3" /> Client Dossier
                          </h4>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 shadow-inner">
                            <div>
                              <p className="text-[8px] font-black text-fashion/30 uppercase tracking-[0.2em] mb-1">
                                Full Name
                              </p>
                              <p className="font-display font-black text-fashion uppercase text-lg leading-none">
                                {order.customerName}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-fashion/30 uppercase tracking-[0.2em] mb-1">
                                Email Link
                              </p>
                              <a
                                href={`mailto:${order.userEmail}`}
                                className="font-sans text-sm font-bold text-rush hover:underline decoration-rush/20 break-all leading-none"
                              >
                                {order.userEmail}
                              </a>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-rush flex items-center gap-2 mb-4">
                            <MapPin className="w-3 h-3" /> Logistics Destination
                          </h4>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                            <p className="font-sans text-sm text-fashion/80 leading-relaxed font-medium">
                              {order.address} <br />
                              {order.city}, {order.state} {order.zip}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ACTION: FULFILL BUTTON */}
                      <div className="pt-4">
                        {order.status === "pending" ? (
                          <button
                            onClick={() => handleMarkAsFulfilled(order.id)}
                            disabled={fulfillingId === order.id}
                            className="w-full flex items-center justify-center gap-3 bg-fashion text-white py-5 rounded-full font-display font-black uppercase tracking-[0.2em] text-xs hover:bg-rush transition-all shadow-xl shadow-fashion/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            {fulfillingId === order.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Mark as Fulfilled
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-full border border-gray-100 justify-center">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-display font-black uppercase text-[10px] tracking-widest text-fashion/40">
                              Order Completed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: Order Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-rush flex items-center gap-2 mb-4">
                        <Package className="w-3 h-3" /> Itemized Order
                      </h4>
                      <div className="space-y-3 ">
                        {order.cartItems?.map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow group/item"
                          >
                            <div className="flex items-center w-full gap-4">
                              <div className="w-12 h-12 border-r flex items-center justify-center font-display font-black text-[10px] text-fashion/20 group-hover/item:text-rush transition-colors border-gray-100">
                                {index + 1}
                              </div>
                              <div className=" w-full flex flex-col md:flex-row">
                                <p className="font-display font-black text-fashion uppercase tracking-tight leading-none mb-1">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-3">
                                  {item.selectedSize && (
                                    <span className="text-[8px] font-black bg-fashion text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  <span className="font-sans text-[10px] font-bold text-fashion/40 uppercase tracking-widest">
                                    {item.quantity} Unit(s)
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex w-full flex-col mt-3 md:mt-0">
                              <p className="font-display font-black text-fashion text-lg leading-none">
                                ${(item.quantity * item.price).toFixed(2)}
                              </p>
                              <p className="font-sans text-[10px] text-fashion/30 font-bold uppercase mt-1">
                                @ ${item.price?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 p-6 bg-fashion text-white rounded-[2rem] shadow-xl flex flex-col justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Receipt className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="p-3 bg-white/10 rounded-2xl">
                            <Clock className="w-5 h-5 text-rush" />
                          </div>
                          <div>
                            <p className="font-display font-black uppercase text-[10px] tracking-widest text-white/40 leading-none mb-1">
                              Settlement Total
                            </p>
                            <p className="font-sans text-xs font-medium text-white/60 uppercase tracking-tighter">
                              Verified Payment Received
                            </p>
                          </div>
                        </div>
                        <p className="font-display w-full mt-4 text-4xl font-black tracking-tighter relative z-10">
                          ${order.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
