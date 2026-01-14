"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({
  id,
  type,
  title,
  image,
  price,
  isDark = false,
}) {
  // Determine accent color based on product type
  const isCatering = type === "catering";
  const typeLabel = isCatering ? "The Menu" : "The Drop";
  const accentColor = isCatering ? "text-rush" : "text-fashion";

  return (
    <Link
      href={`/${type}/${id}`}
      className={`group block relative p-3 transition-all duration-500 rounded-2xl border ${
        isDark
          ? "bg-fashion/40 border-white/10 hover:border-rush/50"
          : "bg-white border-gray-100 hover:border-rush/20"
      }`}
    >
      {/* Image Container with Editorial Aspect Ratio */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-gray-100">
        {image ? (
          <Image
            src={image} // Now it only renders if 'image' is not ""
            alt={title || "AjeboRush Product"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transition-transform duration-700 group-hover:scale-110 object-cover object-center"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-300 font-display font-bold uppercase tracking-widest text-xs">
            Image Coming Soon
          </div>
        )}
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Floating Badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-display font-black uppercase tracking-[0.2em] shadow-sm ${
            isCatering ? "bg-white text-rush" : "bg-rush text-white"
          }`}
        >
          {typeLabel}
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-5 px-1 pb-2">
        <div className="flex justify-between items-start gap-4">
          <h3
            className={`font-display text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight ${
              isDark ? "text-white" : "text-fashion"
            }`}
          >
            {title}
          </h3>

          <div className="flex flex-col items-end">
            <span
              className={`font-display text-xl font-black ${
                isDark ? "text-rush" : "text-rush"
              }`}
            >
              ${price}
            </span>
            <div
              className={`h-1 w-0 group-hover:w-full transition-all duration-500 bg-rush mt-1`}
            />
          </div>
        </div>

        {/* View Details Action */}
        <div className="mt-4 flex items-center gap-2 overflow-hidden">
          <span
            className={`text-[10px] font-display font-bold uppercase tracking-widest transition-transform duration-500 translate-y-8 group-hover:translate-y-0 ${
              isDark ? "text-white/60" : "text-fashion/60"
            }`}
          >
            View Item
          </span>
          <div
            className={`h-[1px] w-0 group-hover:w-12 transition-all duration-500 bg-rush`}
          />
        </div>
      </div>

      {/* Corner "Rush" Accent */}
      <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-r-[20px] border-transparent group-hover:border-r-rush/20 transition-all rounded-br-2xl" />
    </Link>
  );
}
