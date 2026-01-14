import Image from "next/image";
import Button from "@/components/common/buttons";
import { AddToCartButton } from "@/components/common/cartbutton";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Undo, Ruler, ShieldCheck, Truck } from "lucide-react";

// ✅ Updated to async params for Next.js 15
export async function generateMetadata({ params }) {
  const { id } = await params; // Await params here
  try {
    const docRef = doc(db, "fashion", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return { title: "Piece Not Found | ART WEAR" };
    const item = docSnap.data();
    return {
      title: `${item.name} | ART WEAR by AjeboRush`,
      description: `Shop the ${item.name} limited drop. Premium Afro-fusion streetwear by AjeboRush.`,
    };
  } catch (error) {
    return { title: "ART WEAR Fashion Catalog" };
  }
}

// ✅ Updated to async params for Next.js 15
export default async function FashionItemPage({ params }) {
  const { id } = await params; // Await params here

  try {
    const docRef = doc(db, "fashion", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 text-center bg-white">
          <h1 className="font-display text-5xl font-black text-fashion uppercase mb-6 tracking-tighter">
            Piece <span className="text-rush italic">Not Found</span>
          </h1>
          <Button
            href="/fashion"
            className="bg-fashion text-white px-10 py-4 rounded-full font-display font-bold uppercase tracking-widest"
          >
            Back to ART WEAR
          </Button>
        </div>
      );
    }

    const itemData = docSnap.data();
    const item = {
      id: docSnap.id,
      name: itemData.name,
      imageURL: itemData.imageURL || null, // FIX: Avoid empty string warning
      description: itemData.description,
      price: itemData.price,
      originalPrice: itemData.originalPrice || null,
      discountedPrice: itemData.discountedPrice || null,
      sizes: itemData.sizes || [],
      type: "fashion",
    };

    return (
      <main className="min-h-screen bg-white pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-44">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            {/* STICKY IMAGE SECTION */}
            <div className="w-full lg:w-3/5 lg:sticky lg:top-40 h-fit">
              <div className="relative h-[500px] md:h-[750px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl group border-8 border-gray-50">
                {item.imageURL ? (
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    priority={true}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="font-display text-gray-300 font-bold uppercase tracking-widest">
                      Studio Shot Pending
                    </span>
                  </div>
                )}

                {/* Brand Watermark Overlay */}
                <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
                  <p className="font-display text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                    ART <br /> WEAR
                  </p>
                </div>
              </div>
            </div>

            {/* PRODUCT DETAILS SECTION */}
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <span className="inline-block bg-fashion text-white px-4 py-1 rounded-full font-display font-black uppercase text-[10px] tracking-[0.3em]">
                  Limited Drop
                </span>
                <h1 className="font-display text-3xl md:text-5xl font-black text-fashion uppercase tracking-tighter leading-none">
                  {item.name}
                </h1>
              </div>

              {/* Pricing Grid */}
              <div className="flex items-center gap-8 py-6 border-y border-gray-100">
                {item.originalPrice && item.discountedPrice ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-rush uppercase tracking-widest mb-1">
                      Exclusive Price
                    </span>
                    <div className="flex items-baseline gap-4">
                      <p className="font-display text-5xl font-black text-rush">
                        ${item.discountedPrice}
                      </p>
                      <p className="font-sans text-2xl text-fashion/30 line-through">
                        ${item.originalPrice}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-fashion/40 uppercase tracking-widest mb-1">
                      Retail Price
                    </span>
                    <p className="font-display text-5xl font-black text-fashion">
                      ${item.price}
                    </p>
                  </div>
                )}
              </div>

              {/* Description & Narrative */}
              <div className="prose prose-lg max-w-none">
                <p className="font-sans text-xl text-fashion/80 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Size Availability (If applicable) */}
              {item.sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-rush" />
                    <span className="font-display font-black uppercase tracking-widest text-xs text-fashion">
                      Available Sizes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {item.sizes.map((size) => (
                      <span
                        key={size}
                        className="px-5 py-2 border-2 border-gray-100 rounded-xl font-display font-bold text-sm text-fashion uppercase hover:border-rush transition-colors"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-rush" />
                  <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-fashion/60 leading-tight">
                    Authentic <br /> Afro-Luxe
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <Truck className="w-6 h-6 text-rush" />
                  <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-fashion/60 leading-tight">
                    US Nationwide <br /> Shipping
                  </span>
                </div>
              </div>

              {/* CART ACTION */}
              <div className="pt-6 space-y-4">
                <AddToCartButton item={item} />
                <p className="text-[10px] text-center text-gray-400 font-sans uppercase tracking-[0.2em]">
                  Secured Checkout Powered by AjeboRush
                </p>
              </div>
            </div>
          </div>

          {/* RETURN NAVIGATION */}
          <div className="mt-24 pt-12 border-t text-center mx-auto border-gray-100">
            <Link
              href="/fashion"
              className="group inline-flex flex-col items-center gap-3 text-fashion/40 hover:text-rush transition-all"
            >
              <div className="p-5 rounded-full border-2 border-gray-100 group-hover:border-rush group-hover:bg-rush/5 transition-all">
                <Undo className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </div>
              <p className="font-display font-black uppercase tracking-[0.2em] text-[10px]">
                Return to ART WEAR Catalog
              </p>
            </Link>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 text-center">
        <h1 className="font-display text-4xl font-black text-fashion uppercase mb-4 tracking-tighter leading-none">
          Studio Error
        </h1>
        <p className="font-sans text-gray-500 mb-8">
          We encountered a drop error. Please try again.
        </p>
        <Button
          href="/fashion"
          className="bg-rush text-white px-10 py-4 rounded-full font-display font-bold uppercase tracking-widest"
        >
          Back to ART WEAR
        </Button>
      </div>
    );
  }
}
