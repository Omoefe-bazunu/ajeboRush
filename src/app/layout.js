import "./globals.css";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { AuthProvider } from "@/context/AuthContext";
import { IoLogoWhatsapp } from "react-icons/io";

export const metadata = {
  title: "AjeboRush",
  description: "A unique blend of catering services and fashion designs.",
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
      className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white rounded-full shadow-lg 
                 hover:bg-green-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
      aria-label="Chat with us on WhatsApp"
    >
      <IoLogoWhatsapp className="w-8 h-8" />
    </a>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Added 'font-sans' class here to ensure global application */}
      <body className="font-sans min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <WhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
