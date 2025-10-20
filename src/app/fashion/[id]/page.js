import Image from "next/image";
import Button from "@/components/common/buttons";
import { AddToCartButton } from "@/components/common/cartbutton";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Undo } from "lucide-react";

// ✅ Dynamic SEO metadata
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const docRef = doc(db, "fashion", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        title: "Item Not Found | AjeboRush Fashion",
        description: "Shop the latest fashion designs at AjeboRush.",
      };
    }

    const item = docSnap.data();
    const displayPrice = item.discountedPrice || item.price;

    return {
      title: `${item.name} | AjeboRush Fashion`,
      description: `Shop ${item.name} from AjeboRush's fashion catalog for $${displayPrice}.`,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "AjeboRush Fashion",
      description: "Explore the best fashion designs at AjeboRush.",
    };
  }
}

// ✅ Server Component
export default async function FashionItemPage({ params }) {
  const { id } = params;

  try {
    const docRef = doc(db, "fashion", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return (
        <div className="py-12 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Item Not Found
          </h1>
          <Button href="/fashion" className="bg-gray-700 hover:bg-gray-800">
            Back to Fashion Catalog
          </Button>
        </div>
      );
    }

    const itemData = docSnap.data();

    // 🔧 FIX: Convert Firestore object to plain object by spreading and removing Firestore-specific properties
    const item = {
      id: docSnap.id,
      name: itemData.name,
      imageURL: itemData.imageURL,
      description: itemData.description,
      price: itemData.price,
      originalPrice: itemData.originalPrice || null,
      discountedPrice: itemData.discountedPrice || null,
      sizes: itemData.sizes || [],
      type: itemData.type,
      // Exclude createdAt or other Firestore timestamp objects
    };

    const displayPrice = item.discountedPrice || item.price;

    return (
      <div className="py-12 px-4 max-w-4xl mx-auto">
        {/* Item Details */}
        <section className="flex flex-col md:flex-row gap-8 lg:mt-20 mt-30">
          {/* Image */}
          <div className="relative w-full md:w-1/2 h-96">
            <Image
              src={item.imageURL}
              alt={item.name}
              fill
              className="rounded-lg bg-cover bg-center"
              priority={true}
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {item.name}
            </h1>

            <div className="mb-4">
              {item.originalPrice && item.discountedPrice ? (
                <div className="flex items-center gap-3">
                  <p className="text-2xl text-red-500 font-semibold">
                    ${item.discountedPrice}
                  </p>
                  <p className="text-lg text-gray-500 line-through">
                    ${item.originalPrice}
                  </p>
                </div>
              ) : (
                <p className="text-2xl text-gray-600">${item.price}</p>
              )}
            </div>

            <p className="text-gray-700 mb-6">{item.description}</p>

            <AddToCartButton item={item} />

            <div className="mt-6">
              <Button href="/fashion" className="bg-gray-700 hover:bg-gray-800">
                Back to Catalog
              </Button>
            </div>
          </div>
        </section>
        <div className="text-center mt-14 hover:text-orange-600">
          <Link href="/catering" className="flex flex-col items-center gap-2">
            <Undo className="text-center mx-auto" />
            <p className="text-xl">Back to Menu List</p>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching fashion item:", error);
    return (
      <div className="py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Unable to Load Item
        </h1>
        <p className="text-gray-600 mb-6">
          Something went wrong while fetching this item.
        </p>
        <Button href="/fashion" className="bg-gray-700 hover:bg-gray-800">
          Back to Fashion Catalog
        </Button>
      </div>
    );
  }
}
