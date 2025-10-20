import "./globals.css";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/context/AuthContext";
// Import WhatsAppIcon for the floating button
import { IoLogoWhatsapp } from "react-icons/io";

export const metadata = {
  title: "AjeboRush",
  description: "A unique blend of catering services and fashion designs.",
};

// Define the component for the floating WhatsApp button
const WhatsAppWidget = () => {
  // Use the phone number provided, encoding the URL properly
  const phoneNumber = "18172989961";
  const defaultMessage = "Hello AjeboRush, I'm interested in your services!";

  // Format the URL for direct WhatsApp chat
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white rounded-full shadow-lg 
                 hover:bg-green-600 transition-colors duration-300 transform hover:scale-110"
      aria-label="Chat with us on WhatsApp"
    >
      <IoLogoWhatsapp className="w-8 h-8" />
    </a>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          {/* The WhatsApp widget is placed here to appear on all pages */}
          <WhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
