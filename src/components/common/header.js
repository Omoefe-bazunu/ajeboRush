"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UtensilsIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }
    const cartRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const cartItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCart(cartItems);
    });
    return () => unsubscribe();
  }, [user]);

  const isLoggedIn = !!user;
  const cartItemCount = cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const navItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Catering", href: "/catering", icon: UtensilsIcon },
    { name: "Fashion", href: "/fashion", icon: ShoppingBagIcon },
    { name: "Contact", href: "/contact", icon: MailIcon },
    isLoggedIn
      ? {
          name: "Cart",
          href: "/cart",
          icon: ShoppingCartIcon,
          badge: cartItemCount,
        }
      : { name: "Login", href: "/login", icon: UserIcon },
  ];

  const renderNavItem = (item, isDesktop) => {
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`relative flex items-center justify-center transition-all duration-300 group
          ${isDesktop ? "px-4 py-2 rounded-full" : "p-1.5 rounded-lg"} 
          ${
            isActive
              ? "bg-rush text-white shadow-lg shadow-rush/30"
              : "text-fashion hover:bg-fashion/5"
          }`}
      >
        {/* FIX: Set mobile icon to w-5 (same as desktop) to prevent overflow */}
        <item.icon
          className={`w-5 h-5 ${
            isActive ? "scale-110" : "group-hover:scale-110"
          } transition-transform`}
        />

        {item.badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-fashion text-[8px] font-bold text-white ring-1 ring-white">
            {item.badge}
          </span>
        )}

        {isDesktop && (
          <span className="ml-2 text-sm font-semibold font-display uppercase tracking-wider">
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full
        ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg py-2 shadow-xl"
            : "bg-white py-4 md:py-5"
        }`}
    >
      {/* FIX: Reduced px-6 to px-4 on mobile to give more room for elements */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-2">
        {/* LOGO: Added responsive text sizes to prevent pushing the nav items */}
        <Link href="/" className="group flex items-center gap-1 shrink-0">
          <span className="font-display text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-fashion group-hover:text-rush transition-colors uppercase">
            AJEBO
            <span className="text-rush group-hover:text-fashion">RUSH</span>
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-rush animate-pulse mt-1" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center bg-fashion/5 p-1 rounded-full border border-fashion/5">
          {navItems.map((item) => renderNavItem(item, true))}
        </nav>

        {/* Mobile Navigation: Reduced gap and item size */}
        <div className="lg:hidden flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => renderNavItem(item, false))}
        </div>
      </div>
    </header>
  );
}
