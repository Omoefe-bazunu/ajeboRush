import BespokeRequestForm from "@/components/CustomOrder";
import CateringClient from "./CateringClient";

export const metadata = {
  title: "Catering Menu | AjeboRush",
  description:
    "Explore our delicious catering menu at AjeboRush. Order now for your next event!",
};

export default function CateringPage() {
  return (
    <>
      <CateringClient />
      <BespokeRequestForm />
    </>
  );
}
