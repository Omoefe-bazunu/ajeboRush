"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import ProductCard from "@/components/common/productcard";
import Link from "next/link";
import { Undo, Search, ShoppingBag, Sparkles } from "lucide-react";

export default function FashionClient() {
  const [fashionItems, setFashionItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFashionItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "fashion"));
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Serialization fix and image safety
            createdAt: data.createdAt?.toDate?.().toISOString() || null,
            type: "fashion",
            title: data.name,
            image: data.imageURL || null, // Fix for empty string src
          };
        });
        setFashionItems(items);
      } catch (error) {
        console.error("Error fetching ART WEAR items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFashionItems();
  }, []);

  const filteredItems = fashionItems.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-32 px-6 md:px-12 bg-fashion text-white selection:bg-rush">
      <div className="max-w-7xl mx-auto">
        {/* ART WEAR BRANDED HEADER */}
        <header className="text-center mb-8 relative">
          <div className="flex justify-center mb-6">
            <div className="bg-white/5 p-5 rounded-full border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-rush/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShoppingBag className="w-8 h-8 text-rush relative z-10" />
            </div>
          </div>

          <span className="font-display text-rush font-bold uppercase tracking-[0.4em] text-xs">
            Premium Fashion Label
          </span>

          <h1 className="font-display text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none mt-4">
            ART <span className="text-rush">WEAR</span>
          </h1>
        </header>

        {/* BOUTIQUE SEARCH BAR */}
        <div className="w-full max-w-3xl mx-auto mb-24 relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-white/20 group-focus-within:text-rush transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search the ART WEAR gallery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-7 rounded-2xl border-2 border-white/5 bg-white/5 font-sans text-xl text-white placeholder:text-white/20 focus:bg-white/10 focus:border-rush outline-none transition-all shadow-2xl"
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
            <span className="font-display font-black text-[10px] uppercase tracking-widest text-white/20">
              {filteredItems.length} Handcrafted Pieces
            </span>
          </div>
        </div>

        {/* ART WEAR GRID */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-rush border-t-transparent rounded-full animate-spin mb-6" />
            <p className="font-display font-bold uppercase tracking-widest text-white/20 text-xs">
              Unveiling the collection...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} {...item} isDark={true} />
            ))}
          </section>
        ) : (
          <div className="text-center py-32 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
            <h3 className="font-display text-3xl font-bold text-white/10 uppercase tracking-tighter">
              No matching ART WEAR pieces found
            </h3>
            <p className="font-sans text-white/30 mt-2">
              ART WEAR piece not available at the moment.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-8 bg-white text-fashion px-10 py-3 rounded-full font-display font-black uppercase tracking-widest text-xs hover:bg-rush hover:text-white transition-all"
            >
              Reset Gallery
            </button>
          </div>
        )}

        {/* NAVIGATION BACK */}
        <footer className="mt-32 pt-16 border-t border-white/5 flex flex-col items-center">
          <Link
            href="/"
            className="group flex flex-col items-center gap-4 transition-all"
          >
            <div className="p-5 rounded-full border-2 border-white/10 group-hover:border-rush group-hover:bg-rush/5 transition-all">
              <Undo className="w-6 h-6 text-white/20 group-hover:text-rush group-hover:-translate-x-1 transition-all" />
            </div>
            <p className="font-display font-black uppercase tracking-[0.3em] text-[10px] text-white/20 group-hover:text-white transition-colors">
              Return to AjeboRush Studio
            </p>
          </Link>
        </footer>
      </div>
    </div>
  );
}
