import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Button from "@/components/common/buttons";
import ProductCard from "@/components/common/productcard";
import AboutUs from "@/components/about-us";
import CustomerReviews from "@/components/customer-reviews";
import ContactUs from "@/components/contact-us";

export const metadata = {
  title: "AjeboRush | Premium Afro-Fusion Catering & Fashion",
  description:
    "Experience the ultimate soft life. US-based Nigerian brand offering gourmet catering and luxury African-inspired fashion.",
};

export default async function Home() {
  // Fetch Catering Items
  const cateringQuery = query(
    collection(db, "catering"),
    orderBy("createdAt", "desc"),
    limit(3)
  );
  const cateringSnapshot = await getDocs(cateringQuery);
  const cateringItems = cateringSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // SERIALIZATION FIX: Convert Firestore Timestamp to string
      createdAt: data.createdAt?.toDate?.().toISOString() || null,
      title: data.name,
      image: data.imageURL,
      type: "catering",
    };
  });

  // Fetch Fashion Items
  const fashionQuery = query(
    collection(db, "fashion"),
    orderBy("createdAt", "desc"),
    limit(3)
  );
  const fashionSnapshot = await getDocs(fashionQuery);
  const fashionItems = fashionSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // SERIALIZATION FIX: Convert Firestore Timestamp to string
      createdAt: data.createdAt?.toDate?.().toISOString() || null,
      title: data.name,
      image: data.imageURL,
      type: "fashion",
    };
  });

  return (
    <div className="min-h-screen font-sans selection:bg-rush selection:text-white">
      {/* HERO SECTION WITH DYNAMIC GRADIENT */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('/catering.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Vibrant Overlay: Fades from a dark top to a vibrant brand-red bottom tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-fashion/90 via-fashion/40 to-rush/30" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-display text-7xl md:text-9xl font-black text-white uppercase leading-none mb-6 tracking-normal">
            AJEBO<span className="text-rush">RUSH</span>
          </h1>

          <p className="font-sans text-lg md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Where <span className="font-black ">Gourmet Catering</span> meets
            <span className="font-black"> Afro-Luxury Fashion</span>. Crafted
            for those who appreciate the soft life.
          </p>

          <div className="flex justify-center flex-col items-center sm:flex-row gap-6">
            <Button
              href="/catering"
              className="bg-rush hover:bg-white hover:text-rush text-white px-10 py-4 rounded-full font-display font-bold uppercase tracking-widest transition-all scale-100 hover:scale-105 active:scale-95 shadow-xl"
            >
              Order Catering
            </Button>
            <Button
              href="/fashion"
              className="bg-transparent border-2 border-white hover:bg-fashion hover:border-fashion text-white px-10 py-4 rounded-full font-display font-bold uppercase tracking-widest transition-all scale-100 hover:scale-105 active:scale-95 shadow-xl"
            >
              Shop Fashion
            </Button>
          </div>
        </div>

        {/* Subtle Decorative Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <AboutUs />

      {/* CATERING HIGHLIGHTS */}
      <section className="py-24 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16">
            <h2 className="font-display text-5xl md:text-7xl font-black text-fashion uppercase tracking-tighter">
              The <span className="text-rush">Menu</span>
            </h2>
            <p className="font-sans text-gray-500 max-w-xs mt-4 md:mt-0 italic">
              Experience traditional Nigerian flavors reimagined for the modern
              palate.
            </p>
          </div>

          {cateringItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {cateringItems.map((item) => (
                <ProductCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="font-sans text-gray-400">
                Chef is currently curating new dishes...
              </p>
            </div>
          )}

          <div className="text-center mt-16">
            <Button
              href="/catering"
              className="border-2 border-rush text-rush hover:bg-rush hover:text-white px-12 py-3 rounded-full font-display font-bold uppercase transition-all"
            >
              See Full Menu
            </Button>
          </div>
        </div>
      </section>

      {/* FASHION HIGHLIGHTS */}
      <section className="py-24 px-6 md:px-12 bg-fashion text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16">
            <h2 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter">
              The <span className="text-rush">Drops</span>
            </h2>
            <p className="font-sans text-white/50 max-w-xs mt-4 md:mt-0 italic">
              Premium Aso-Oke & Streetwear fusion for the Afro-American
              lifestyle.
            </p>
          </div>

          {fashionItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {fashionItems.map((item) => (
                <ProductCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
              <p className="font-sans text-white/30">
                Fresh drops are in production...
              </p>
            </div>
          )}

          <div className="text-center mt-16">
            <Button
              href="/fashion"
              className="bg-rush text-white hover:bg-white hover:text-rush px-12 py-3 rounded-full font-display font-bold uppercase transition-all"
            >
              Explore Collection
            </Button>
          </div>
        </div>
      </section>

      <CustomerReviews />
      <ContactUs />
    </div>
  );
}
