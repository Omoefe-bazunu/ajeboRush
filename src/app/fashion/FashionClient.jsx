"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Ensure this points to ajeborush config
import Button from "@/components/common/buttons";
import ProductCard from "@/components/common/productcard";
import Link from "next/link";
import { Undo } from "lucide-react";

export default function FashionClient() {
  const [fashionItems, setFashionItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFashionItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "fashion"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFashionItems(items);
      } catch (error) {
        console.error("Error fetching fashion items:", error);
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
    <div className="py-24 px-6 md:px-16 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <section className="text-center mb-10 md:mt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-3">
            ART Wear Catalog
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Explore our stylish collection of fashion designs for every
            occasion.
          </p>
        </section>

        {/* Search bar */}
        <div className="w-full max-w-md mb-10">
          <input
            type="text"
            placeholder="Search for outfits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none shadow-sm transition-all duration-200"
          />
        </div>

        {/* Product grid */}
        {loading ? (
          <p className="text-gray-600 text-center mt-8">Loading items...</p>
        ) : filteredItems.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                type="fashion"
                title={item.name}
                image={item.imageURL}
                price={item.price}
                sizes={item.sizes || []}
              />
            ))}
          </section>
        ) : (
          <p className="text-gray-600 text-center mt-8">
            No fashion items found.
          </p>
        )}

        {/* Back to Home button */}
        <div className="text-center mt-14 hover:text-orange-600">
          <Link href="/">
            <Undo className="text-center mx-auto" />
            <p className="text-xl">Home Page</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
