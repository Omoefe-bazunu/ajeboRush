import Image from "next/image";
import Button from "@/components/common/buttons";
import { AddToCartButton } from "@/components/common/cartbutton";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Undo, Clock, MapPin, Sparkles } from "lucide-react";

// ✅ Updated to async params for Next.js 15
export async function generateMetadata({ params }) {
  const { id } = await params; // Await params here
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

// ✅ Updated to async params for Next.js 15
export default async function CateringItemPage({ params }) {
  const { id } = await params; // Await params here

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
      price: itemData.price,
      originalPrice: itemData.originalPrice || null,
      discountedPrice: itemData.discountedPrice || null,
      type: itemData.type,
    };

    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Image Section */}
            <div className="relative w-full lg:w-1/2 group">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent rounded-2xl -z-10" />
              <div className="relative h-[400px] md:h-[600px] w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                {item.imageURL ? (
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="font-display text-gray-300 font-bold uppercase tracking-widest">
                      Recipe Preview Coming Soon
                    </span>
                  </div>
                )}

                {item.discountedPrice && (
                  <div className="absolute top-6 right-6 bg-rush text-white font-display font-black px-6 py-2 rounded-full uppercase text-xs tracking-widest shadow-lg animate-bounce">
                    Limited Offer
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 font-display text-rush font-bold uppercase tracking-[0.3em] text-xs">
                  Jellof Digest Signature
                </span>
                <h1 className="font-display text-3xl md:text-5xl font-black text-fashion uppercase tracking-tighter leading-none">
                  {item.name}
                </h1>
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-gray-100">
                {item.originalPrice && item.discountedPrice ? (
                  <div className="flex items-baseline gap-4">
                    <p className="font-display text-5xl font-black text-rush">
                      ${item.discountedPrice}
                    </p>
                    <p className="font-sans text-2xl text-fashion/30 line-through">
                      ${item.originalPrice}
                    </p>
                  </div>
                ) : (
                  <p className="font-display text-5xl font-black text-fashion">
                    ${item.price}
                  </p>
                )}
                <div className="h-10 w-px bg-gray-100" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-display font-black text-fashion/40 uppercase tracking-widest">
                    Availability
                  </span>
                  <span className="text-xs font-bold text-green-500 uppercase">
                    Freshly Prepared
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-sans text-lg md:text-xl text-fashion/70 leading-relaxed italic">
                  &quot;{item.description}&quot;
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-fashion/60">
                    <Clock className="w-3 h-3 text-rush" /> 24h Advance Order
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-fashion/60">
                    <MapPin className="w-3 h-3 text-rush" /> DFW Delivery
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <AddToCartButton item={item} />
                <p className="mt-4 text-[10px] text-center lg:text-left text-gray-400 font-sans uppercase tracking-widest">
                  Orders are finalized via secure checkout
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-6 border-t text-center mx-auto border-gray-100">
            <Link
              href="/catering"
              className="group inline-flex flex-col items-center justify-center gap-3 text-fashion/40 hover:text-rush transition-all"
            >
              <div className="p-4 rounded-full border border-gray-100 group-hover:border-rush transition-colors">
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 text-center">
        <h1 className="font-display text-4xl font-black text-fashion uppercase mb-4 tracking-tighter">
          Kitchen Error
        </h1>
        <p className="font-sans text-gray-500 mb-8">
          We are having trouble retrieving this dish.
        </p>
        <Button
          href="/catering"
          className="bg-rush text-white px-10 py-4 rounded-full font-display font-bold uppercase tracking-widest transition-transform hover:scale-105"
        >
          Return to Menu
        </Button>
      </div>
    );
  }
}
