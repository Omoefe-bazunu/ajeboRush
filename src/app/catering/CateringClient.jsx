"use client";

import { useState, useEffect } from "react";
import Button from "@/components/common/buttons";
import ProductCard from "@/components/common/productcard";
import Link from "next/link";
import { Undo, Search, ChefHat } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function CateringClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cateringItems, setCateringItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCateringItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "catering"));
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Serialization fix for Firestore Timestamps
            createdAt: data.createdAt?.toDate?.().toISOString() || null,
            type: "catering",
            title: data.name,
            image: data.imageURL,
          };
        });
        setCateringItems(items);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCateringItems();
  }, []);

  const filteredItems = cateringItems.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 bg-white selection:bg-rush selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* JELLOF DIGEST BRANDED HEADER */}
        <header className="text-center mb-8 relative">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-rush blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-fashion p-5 rounded-2xl rotate-3">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <span className="font-display text-rush font-bold uppercase tracking-[0.4em] text-xs">
            The Culinary Wing
          </span>

          <h1 className="font-display text-7xl md:text-9xl font-black text-fashion uppercase tracking-tighter leading-none mt-4">
            JELLOF <span className="text-rush italic">DIGEST</span>
          </h1>
        </header>

        {/* SEARCH & FILTER BAR */}
        <div className="w-full max-w-3xl mx-auto mb-20">
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-gray-300 group-focus-within:text-rush transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search Jellof Digest Menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-7 rounded-3xl border-2 border-gray-100 bg-gray-50/50 font-sans text-xl focus:bg-white focus:border-rush focus:ring-0 outline-none transition-all shadow-sm"
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 font-display font-black text-[10px] uppercase tracking-widest text-gray-300 hidden md:block">
              {filteredItems.length} Dishes Available
            </div>
          </div>
        </div>

        {/* MENU GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-rush border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-display font-bold uppercase tracking-widest text-fashion/30 text-xs">
              Heating up the kitchen...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </section>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <h3 className="font-display text-3xl font-bold text-fashion/20 uppercase tracking-tighter">
              Flavor Out of Stock
            </h3>
            <p className="font-sans text-gray-400 mt-2">
              Try searching for a different gourmet specialty.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-6 bg-fashion text-white px-8 py-2 rounded-full font-display font-bold uppercase tracking-widest text-[10px] hover:bg-rush transition-colors"
            >
              Reset Menu
            </button>
          </div>
        )}

        {/* NAVIGATION BACK */}
        <footer className="mt-32 pt-16 border-t border-gray-100 flex flex-col items-center">
          <Link
            href="/"
            className="group flex flex-col items-center gap-4 transition-all"
          >
            <div className="p-5 rounded-full border-2 border-gray-100 group-hover:border-rush group-hover:bg-rush/5 transition-all">
              <Undo className="w-6 h-6 text-fashion/40 group-hover:text-rush group-hover:-translate-x-1 transition-all" />
            </div>
            <p className="font-display font-black uppercase tracking-[0.3em] text-[10px] text-fashion/40 group-hover:text-fashion transition-colors">
              Return Home
            </p>
          </Link>
        </footer>
      </div>
    </div>
  );
}
