import "./globals.css";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { AuthProvider } from "@/context/AuthContext";
import { IoLogoWhatsapp } from "react-icons/io";

export const metadata = {
  title: "AjeboRush | Gourmet Catering & Afro-Luxe Fashion",
  description:
    "Experience the soft life. Premium Afro-fusion catering meets exclusive high-end streetwear.",
};

const WhatsAppWidget = () => {
  const phoneNumber = "18172989961";
  const defaultMessage = "Hello AjeboRush, I'm interested in your services!";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white rounded-full shadow-2xl 
                 hover:bg-green-600 transition-all duration-500 transform hover:scale-110 active:scale-90"
      aria-label="Chat with us on WhatsApp"
    >
      <IoLogoWhatsapp className="w-7 h-7 md:w-8 md:h-8" />
    </a>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans min-h-screen flex flex-col antialiased bg-white text-fashion selection:bg-rush/10 selection:text-rush">
        <AuthProvider>
          {/* Main Navigation */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-grow pt-20 md:pt-24 lg:pt-0">{children}</main>

          {/* Branding Footer */}
          <Footer />

          {/* Global Conversion Widget */}
          <WhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
