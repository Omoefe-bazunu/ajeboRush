import FashionClient from "./FashionClient"; // ✅ Correct import

export const metadata = {
  title: "Fashion Catalog | ART Wear",
  description:
    "Shop the latest fashion designs at ART Wear. Find your perfect style today!",
};

export default function FashionPage() {
  return <FashionClient />;
}
