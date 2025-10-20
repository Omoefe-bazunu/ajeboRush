// Client Component for ProductCard
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ id, type, title, image, price }) {
  return (
    <Link
      href={`/${type}/${id}`}
      className="group block p-4 bg-white rounded-xl shadow hover:shadow-2xl transition duration-300"
    >
      {/* Image Container: Fixed height, ensures consistent layout */}
      <div className="relative h-80 w-full overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          // Updated to object-cover: Fills the container completely, maintaining aspect ratio.
          // This will crop the image if its aspect ratio doesn't match the container (h-80 w-full).
          className="rounded-t-lg transition duration-300 group-hover:scale-105 object-cover object-center"
        />
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-800 truncate">{title}</h3>
      <p className="text-lg font-semibold text-gray-900 mt-1">${price}</p>
    </Link>
  );
}
