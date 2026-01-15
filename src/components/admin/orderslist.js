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
  Sparkles,
  Phone,
  ChefHat,
  Shirt,
  X,
  Maximize2,
  ImageDownIcon,
} from "lucide-react";
import Image from "next/image";

export default function OrdersList() {
  const [activeTab, setActiveTab] = useState("standard");
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [fulfillingId, setFulfillingId] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    const standardQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsubStandard = onSnapshot(standardQuery, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const customQuery = query(
      collection(db, "CustomOrders"),
      orderBy("createdAt", "desc")
    );
    const unsubCustom = onSnapshot(customQuery, (snapshot) => {
      setCustomOrders(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    });

    return () => {
      unsubStandard();
      unsubCustom();
    };
  }, []);

  const handleUpdateStatus = async (collectionName, docId, newStatus) => {
    setFulfillingId(docId);
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        status: newStatus,
        fulfilledAt: new Date(),
      });
    } catch (error) {
      console.error("Fulfillment Error:", error);
    } finally {
      setFulfillingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "pending" || s === "unprocessed")
      return "bg-accent text-fashion border-accent";
    if (s === "completed" || s === "processed")
      return "bg-fashion text-white border-fashion";
    return "bg-gray-100 text-gray-400 border-gray-200";
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-rush border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      </div>
    );

  return (
    <div className="w-full">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fashion text-white rounded-lg">
            <Receipt className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter">
            All <span className="text-rush italic">Orders</span>
          </h2>
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button
            onClick={() => setActiveTab("standard")}
            className={`px-6 py-2.5 rounded-xl font-display font-black uppercase text-[10px] tracking-widest transition-all ${
              activeTab === "standard"
                ? "bg-white text-rush shadow-sm"
                : "text-fashion/30"
            }`}
          >
            Regular Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-6 py-2.5 rounded-xl font-display font-black uppercase text-[10px] tracking-widest transition-all ${
              activeTab === "custom"
                ? "bg-white text-rush shadow-sm"
                : "text-fashion/30"
            }`}
          >
            Custom Orders ({customOrders.length})
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "standard"
          ? orders.map((order) => (
              <div
                key={order.id}
                className={`border-2 rounded-4xl overflow-hidden transition-all ${
                  expandedId === order.id
                    ? "border-rush bg-white shadow-2xl"
                    : "border-gray-50 bg-gray-50/30"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  className="w-full flex flex-col md:flex-row items-center justify-between p-8"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg font-black uppercase tracking-tight">
                        Order{" "}
                        <span className="text-rush">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </h3>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-fashion/40 uppercase tracking-widest">
                      {order.customerName} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <p className="font-display text-2xl font-black text-fashion">
                      ${order.totalAmount?.toFixed(2)}
                    </p>
                    <ChevronDown
                      className={`text-rush transition-transform ${
                        expandedId === order.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {expandedId === order.id && (
                  <div className="p-8 md:p-12 border-t border-gray-50 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                      <div className="space-y-8">
                        <div className="space-y-6">
                          <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-rush flex items-center gap-2">
                            <User className="w-3 h-3" /> Client Details
                          </h4>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 shadow-inner">
                            <InfoRow
                              label="Full Name"
                              value={order.customerName}
                            />
                            <InfoRow
                              label="Email Link"
                              value={order.userEmail}
                              isLink
                              href={`mailto:${order.userEmail}`}
                            />
                          </div>
                          <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-rush flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Logistics
                          </h4>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                            <p className="font-sans text-sm text-fashion/80 leading-relaxed">
                              {order.address} <br /> {order.city}, {order.state}{" "}
                              {order.zip}
                            </p>
                          </div>
                        </div>
                        {order.status === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                "orders",
                                order.id,
                                "completed"
                              )
                            }
                            disabled={fulfillingId === order.id}
                            className="w-full py-5 bg-fashion text-white rounded-full font-display font-black uppercase text-xs tracking-widest"
                          >
                            {fulfillingId === order.id
                              ? "Updating..."
                              : "Mark as Fulfilled"}
                          </button>
                        )}
                      </div>
                      <div className="lg:col-span-2">
                        <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-rush flex items-center gap-2 mb-4">
                          <Package className="w-3 h-3" /> Itemized List
                        </h4>
                        <div className="space-y-3">
                          {order.cartItems?.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl"
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50">
                                  {item.imageURL ? (
                                    <Image
                                      src={item.imageURL}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-[8px] font-black text-fashion/20">
                                      AJEBO
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-display font-black text-xs text-fashion uppercase truncate">
                                    {item.name}
                                  </p>
                                  <p className="font-sans text-[8px] font-black text-rush uppercase tracking-widest">
                                    {item.selectedOption || item.selectedSize}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-display font-black text-fashion text-sm">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </p>
                                <p className="font-sans text-[8px] text-fashion/30 font-bold uppercase">
                                  {item.quantity} x ${item.price.toFixed(2)}
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
            ))
          : customOrders.map((manifest) => (
              <div
                key={manifest.id}
                className={`border-2 rounded-4xl overflow-hidden transition-all ${
                  expandedId === manifest.id
                    ? "border-fashion bg-white shadow-2xl"
                    : "border-gray-50 bg-gray-50/30"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === manifest.id ? null : manifest.id
                    )
                  }
                  className="w-full flex flex-col md:flex-row items-center justify-between p-8"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg font-black uppercase tracking-tight text-fashion">
                        Custom{" "}
                        <span className="text-fashion/30 italic">Orders</span>
                      </h3>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusStyle(
                          manifest.status
                        )}`}
                      >
                        {manifest.status || "Unprocessed"}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-fashion/40 uppercase tracking-widest">
                      {manifest.name} • {formatDate(manifest.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                      {manifest.category === "catering" ? (
                        <ChefHat className="w-3 h-3 text-rush" />
                      ) : (
                        <Shirt className="w-3 h-3 text-fashion" />
                      )}
                      <span className="text-[8px] font-black uppercase tracking-widest text-fashion">
                        {manifest.category}
                      </span>
                    </div>
                    <ChevronDown
                      className={`text-fashion transition-transform ${
                        expandedId === manifest.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                {expandedId === manifest.id && (
                  <div className="p-8 md:p-12 border-t border-gray-50 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-rush flex items-center gap-2">
                          <User className="w-3 h-3" /> Requester Info
                        </h4>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 shadow-inner">
                          <InfoRow label="Full Name" value={manifest.name} />
                          <InfoRow
                            label="Email Link"
                            value={manifest.email}
                            isLink
                            href={`mailto:${manifest.email}`}
                          />
                          <InfoRow
                            label="Phone Link"
                            value={manifest.phone}
                            isLink
                            href={`tel:${manifest.phone}`}
                          />
                        </div>
                        <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-rush flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> Narrative
                        </h4>
                        <p className="font-sans text-sm text-fashion/70 leading-relaxed italic bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          &quot;{manifest.description}&quot;
                        </p>
                        {(manifest.status === "Unprocessed" ||
                          !manifest.status) && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                "CustomOrders",
                                manifest.id,
                                "Processed"
                              )
                            }
                            disabled={fulfillingId === manifest.id}
                            className="w-full py-4 bg-fashion text-white rounded-full font-display font-black uppercase tracking-widest text-[10px] hover:bg-rush"
                          >
                            {fulfillingId === manifest.id
                              ? "Processing..."
                              : "Mark as Processed"}
                          </button>
                        )}
                      </div>
                      <div className="space-y-6">
                        <h4 className="font-display font-black text-[10px] uppercase tracking-widest text-rush flex items-center gap-2">
                          <ImageDownIcon className="w-3 h-3" /> Inspiration
                          Assets
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          {manifest.attachments?.map((url, i) => (
                            <div
                              key={i}
                              className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-md group cursor-zoom-in"
                              onClick={() => setFullScreenImage(url)}
                            >
                              <Image
                                src={url}
                                alt="Inspiration"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="text-white w-6 h-6" />
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
      </div>

      {/* FULL SCREEN LIGHTBOX */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-1000 bg-fashion/95 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setFullScreenImage(null)}
        >
          <X className="absolute top-8 right-8 text-white w-10 h-10 cursor-pointer" />
          <div className="relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden border-4 border-white/10">
            <Image
              src={fullScreenImage}
              alt="Fullscreen View"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, isLink, href }) {
  return (
    <div>
      <p className="text-[8px] font-black text-fashion/20 uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      {isLink ? (
        <a
          href={href}
          className="font-sans text-sm font-bold text-rush hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="font-display font-black text-fashion uppercase text-md">
          {value}
        </p>
      )}
    </div>
  );
}
