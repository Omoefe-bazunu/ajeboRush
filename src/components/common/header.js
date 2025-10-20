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

  // Fetch user cart from Firestore
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

  // Determine if the user is logged in
  const isLoggedIn = !!user;

  // Calculate cart item count safely
  const cartItemCount = (cart || []).reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  // Base navigation items
  const baseNavItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Catering", href: "/catering", icon: UtensilsIcon },
    { name: "Fashion", href: "/fashion", icon: ShoppingBagIcon },
    { name: "Contact", href: "/contact", icon: MailIcon },
  ];

  // Conditional Navigation Item
  let authItem;
  if (isLoggedIn) {
    authItem = {
      name: "Cart",
      href: "/cart",
      icon: ShoppingCartIcon,
      badge: cartItemCount,
    };
  } else {
    authItem = {
      name: "Login",
      href: "/login",
      icon: UserIcon,
    };
  }

  // Combine base items with the conditional item
  const navItems = [
    ...baseNavItems.slice(0, 3),
    authItem,
    ...baseNavItems.slice(3),
  ];

  // Helper function to render the navigation item link structure
  const renderNavItem = (item, isDesktop) => {
    const isActive = pathname === item.href;
    const sizeClasses = isDesktop ? "w-16 h-16" : "w-10 h-10";
    const iconSizeClass = "w-6 h-6";

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`relative flex flex-col items-center justify-center rounded-full transition-colors group ${sizeClasses} ${
          isActive
            ? "bg-orange-200 text-gray-800"
            : "text-gray-600 hover:text-gray-800 hover:bg-orange-50"
        }`}
      >
        {/* Desktop hover background effect */}
        {isDesktop && (
          <div
            className={`absolute p-8 rounded-full bg-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isActive ? "hidden" : ""
            }`}
          ></div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          <item.icon className={iconSizeClass} />
          {/* Show badge ONLY if it's the Cart item and count > 0 */}
          {item.name === "Cart" && item.badge > 0 && (
            <span
              className={`absolute ${
                isDesktop
                  ? "-top-1 -right-1 w-5 h-5 text-xs"
                  : "-top-1 -right-1 w-4 h-4 text-xs"
              } bg-red-500 text-white rounded-full flex items-center justify-center`}
            >
              {item.badge}
            </span>
          )}
        </div>
        {/* Display name/text below the icon only on desktop */}
        {isDesktop && (
          <span className="text-xs mt-1 z-10 font-medium">{item.name}</span>
        )}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-extrabold text-orange-600">
            AJEBORUSH
          </Link>

          <nav className="flex items-center space-x-4">
            {navItems.map((item) => renderNavItem(item, true))}
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between py-3">
          <Link href="/" className="text-xl font-extrabold text-orange-600">
            AJEBORUSH
          </Link>

          <nav className="flex items-center space-x-1">
            {navItems.map((item) => renderNavItem(item, false))}
          </nav>
        </div>
      </div>
    </header>
  );
}
