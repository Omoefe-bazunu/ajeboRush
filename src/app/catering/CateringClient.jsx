"use client";

import { useState, useEffect } from "react";
import Button from "@/components/common/buttons";
import ProductCard from "@/components/common/productcard";
import Link from "next/link";
import { Undo } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // ✅ connect to the right Firestore

export default function CateringClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cateringItems, setCateringItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Catering Items from Firestore
  useEffect(() => {
    const fetchCateringItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "catering"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "catering",
        }));
        setCateringItems(items);
      } catch (error) {
        console.error("Error fetching catering items:", error);
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
    <div className="py-24 px-6 md:px-16 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        <section className="text-center mb-10 md:mt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-3">
            Jellof Digest Menu
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Discover a variety of gourmet dishes perfect for any occasion, made
            with passion and the freshest ingredients.
          </p>
        </section>

        {/* Search Bar */}
        <div className="w-full max-w-md mb-10">
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-sm transition-all duration-200"
          />
        </div>

        {/* Catering Items Grid */}
        {loading ? (
          <p className="text-gray-600 text-center mt-8">Loading menu...</p>
        ) : filteredItems.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.name}
                image={item.imageURL}
                price={item.price}
              />
            ))}
          </section>
        ) : (
          <p className="text-gray-600 text-center mt-8">
            No dishes found. Try another keyword.
          </p>
        )}

        {/* Back to Home Button */}
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
