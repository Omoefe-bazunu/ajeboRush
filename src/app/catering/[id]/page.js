import Image from "next/image";
import Button from "@/components/common/buttons";
import { AddToCartButton } from "@/components/common/cartbutton";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Undo, Clock, MapPin, Layers, Check } from "lucide-react";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const docRef = doc(db, "catering", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return { title: "Item Not Found | AjeboRush" };
    const item = docSnap.data();
    return {
      title: `${item.name} | Jellof Digest by AjeboRush`,
      description: `Premium gourmet catering: ${item.name}. Experience the soft life with Jellof Digest.`,
    };
  } catch (error) {
    return { title: "Jellof Digest Catering" };
  }
}

export default async function CateringItemPage({ params }) {
  const { id } = await params;

  try {
    const docRef = doc(db, "catering", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 text-center">
          <h1 className="font-display text-5xl font-black text-fashion uppercase mb-6">
            Flavor Not Found
          </h1>
          <Button
            href="/catering"
            className="bg-rush text-white px-8 py-3 rounded-full font-display font-bold uppercase tracking-widest"
          >
            Back to Jellof Digest
          </Button>
        </div>
      );
    }

    const itemData = docSnap.data();
    const item = {
      id: docSnap.id,
      name: itemData.name,
      imageURL: itemData.imageURL || null,
      description: itemData.description,
      // Updated Pricing Structure
      fullPrice: itemData.fullPrice || null,
      halfPrice: itemData.halfPrice || null,
      price: itemData.fullPrice || itemData.halfPrice || itemData.price, // Fallback
      type: itemData.type,
    };

    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-20 md:pt-40">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Image Section */}
            <div className="relative w-full lg:w-1/2 group">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent rounded-2xl -z-10" />
              <div className="relative h-100 md:h-150 w-full rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-gray-50">
                {item.imageURL ? (
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-gray-300 font-bold uppercase tracking-widest text-xs">
                      Recipe Preview Coming Soon
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 font-display text-rush font-bold uppercase tracking-[0.3em] text-xs">
                  <Layers className="w-3 h-3" /> Signature Selection
                </span>
                <h1 className="font-display text-4xl md:text-6xl font-black text-fashion uppercase tracking-tighter leading-none">
                  {item.name}
                </h1>
              </div>

              {/* DUAL PRICING DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-gray-100">
                {item.fullPrice && (
                  <div className="p-6 rounded-2xl border-2 border-fashion bg-white relative overflow-hidden group/price">
                    <div className="absolute top-0 right-0 p-2 bg-fashion text-white">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="block font-display font-black text-[10px] uppercase tracking-widest text-fashion/40 mb-1">
                      Full Portion
                    </span>
                    <p className="font-display text-4xl font-black text-fashion">
                      ${item.fullPrice}
                    </p>
                    <span className="text-[10px] font-bold text-fashion/30 uppercase tracking-tighter">
                      Large Pan / Tray
                    </span>
                  </div>
                )}

                {item.halfPrice && (
                  <div className="p-6 rounded-2xl border-2 border-gray-100 hover:border-rush transition-colors bg-gray-50/50">
                    <span className="block font-display font-black text-[10px] uppercase tracking-widest text-rush mb-1">
                      Half Portion
                    </span>
                    <p className="font-display text-4xl font-black text-rush">
                      ${item.halfPrice}
                    </p>
                    <span className="text-[10px] font-bold text-rush/30 uppercase tracking-tighter">
                      Small Pan / Tray
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="font-sans text-lg md:text-xl text-fashion/70 leading-relaxed italic border-l-4 border-rush/10 pl-6">
                  &quot;{item.description}&quot;
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-fashion/60">
                    <Clock className="w-3 h-3 text-rush" /> 24h Advance Order
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-fashion/60">
                    <MapPin className="w-3 h-3 text-rush" /> DFW Metroplex
                    Delivery
                  </div>
                </div>
              </div>

              <div className="pt-8">
                {/* NOTE: You will need to update AddToCartButton to handle 
                   the selected portion (Full vs Half) if you want users to pick 
                */}
                <AddToCartButton item={item} />
                <p className="mt-4 text-[10px] text-center lg:text-left text-gray-400 font-sans uppercase tracking-widest">
                  Secure fulfillment via Cart Checkout
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-100 text-center">
            <Link
              href="/catering"
              className="group inline-flex flex-col items-center justify-center gap-3 text-fashion/40 hover:text-rush transition-all"
            >
              <div className="p-5 rounded-full border border-gray-100 group-hover:border-rush transition-colors">
                <Undo className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </div>
              <p className="font-display font-black uppercase tracking-[0.2em] text-[10px]">
                Return to Jellof Digest Menu
              </p>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Detailed Error:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 text-center">
        <h1 className="font-display text-4xl font-black text-fashion uppercase mb-4 tracking-tighter">
          Kitchen Error
        </h1>
        <Button
          href="/catering"
          className="bg-rush text-white px-10 py-4 rounded-full font-display font-bold uppercase tracking-widest"
        >
          Return to Menu
        </Button>
      </div>
    );
  }
}
