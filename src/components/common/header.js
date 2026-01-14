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
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

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

  const cartItemCount = cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const navItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Catering", href: "/catering", icon: UtensilsIcon },
    { name: "Fashion", href: "/fashion", icon: ShoppingBagIcon },
    { name: "Contact", href: "/contact", icon: MailIcon },
    {
      name: user ? "Orders" : "Login",
      href: user ? "/orders" : "/login",
      icon: UserIcon,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 w-full
          ${
            scrolled || isMenuOpen
              ? "bg-white/90 backdrop-blur-lg py-3 shadow-sm"
              : "bg-white py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="group flex items-center gap-1 shrink-0 z-50"
          >
            <span className="font-display text-2xl md:text-3xl font-black tracking-tighter text-fashion uppercase">
              AJEBO<span className="text-rush">RUSH</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center bg-fashion/5 p-1 rounded-full border border-fashion/5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center px-4 py-2 rounded-full transition-all duration-300 group
                    ${
                      isActive
                        ? "bg-rush text-white shadow-lg"
                        : "text-fashion hover:bg-fashion/5"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="ml-2 text-xs font-bold font-display uppercase tracking-widest">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE: CART + TOGGLE */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className={`relative p-2.5 rounded-full transition-all border
                ${
                  pathname === "/cart"
                    ? "bg-rush text-white border-rush"
                    : "bg-fashion/5 text-fashion border-transparent"
                }`}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fashion text-[10px] font-bold text-white ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-fashion text-white shadow-lg hover:bg-rush transition-all"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY - REFINED LIST STYLE */}
      <div
        className={`fixed inset-0 z-[55] bg-white transition-all duration-500 lg:hidden
          ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full pt-32 px-10 pb-10">
          <span className="font-display text-rush font-bold uppercase tracking-[0.3em] text-[10px] mb-8">
            NAVIGATION
          </span>

          <nav className="flex flex-col">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const isLast = idx === navItems.length - 1;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-5 group transition-all
                    ${!isLast ? "border-b border-gray-100" : ""}
                    ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-10 opacity-0"
                    }`}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Small Minimalist Icon */}
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-rush"
                          : "text-fashion/20 group-hover:text-rush"
                      }`}
                    />

                    {/* Smaller, Refined Text */}
                    <span
                      className={`font-display text-lg tracking-tight group-hover:text-rush
                      ${isActive ? "text-rush" : "text-fashion"}`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {/* Tiny Active Indicator */}
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-rush" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
