import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Button from "@/components/common/buttons";
import ProductCard from "@/components/common/productcard";
import AboutUs from "@/components/about-us";
import CustomerReviews from "@/components/customer-reviews";
import ContactUs from "@/components/contact-us";

// Metadata export for SEO
export const metadata = {
  title: "Catering & Fashion by AjeboRush | Home",
  description:
    "Explore delicious catering menus and stylish fashion designs by AjeboRush. Order now!",
};

// Server Component
export default async function Home() {
  // Fetch 3 most recent Catering Items from Firestore
  const cateringQuery = query(
    collection(db, "catering"),
    orderBy("createdAt", "desc"),
    limit(3)
  );
  const cateringSnapshot = await getDocs(cateringQuery);
  const cateringItems = cateringSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    type: "catering",
  }));

  // Fetch 3 most recent Fashion Items from Firestore
  const fashionQuery = query(
    collection(db, "fashion"),
    orderBy("createdAt", "desc"),
    limit(3)
  );
  const fashionSnapshot = await getDocs(fashionQuery);
  const fashionItems = fashionSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    type: "fashion",
  }));

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url('/ajebobg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Hero Section */}
      <section className=" max-w-7xl mx-auto pt-35 pb-20 px-12 text-center">
        <p className="text-lg text-gray-200 mb-4">Welcome to</p>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
          AjeboRush
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8">
          Discover exquisite catering and unique fashion designs tailored to
          your taste and budget.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            href="/catering"
            className="bg-orange-600 uppercase hover:bg-orange-700 text-white w-fit font-semibold px-6 py-3 rounded-lg transition"
          >
            View Catering
          </Button>
          <Button
            href="/fashion"
            className="bg-gray-800 uppercase hover:bg-gray-900 text-white w-fit font-semibold px-6 py-3 rounded-lg transition"
          >
            Shop Fashion
          </Button>
        </div>
      </section>

      {/* About Us Section */}
      <AboutUs />

      {/* Catering Highlights */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
          Catering Highlights
        </h2>

        {cateringItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {cateringItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.name}
                image={item.imageURL}
                price={item.price}
                priority={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 font-medium py-12">
            No item in stock yet.
          </div>
        )}

        <div className="text-center mt-10">
          <Button
            href="/catering"
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg transition"
          >
            See Full Menu
          </Button>
        </div>
      </section>

      {/* Fashion Highlights */}
      <section className="py-16 px-6 md:px-12 bg-gray-100">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
          Fashion Highlights
        </h2>

        {fashionItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {fashionItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.name}
                image={item.imageURL}
                price={item.price}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 font-medium py-12">
            No item in stock yet.
          </div>
        )}

        <div className="text-center mt-10">
          <Button
            href="/fashion"
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg transition"
          >
            Explore Fashion
          </Button>
        </div>
      </section>

      {/* Customer Reviews section */}
      <CustomerReviews />

      {/* Contact Us Section */}
      <ContactUs />
    </div>
  );
}
