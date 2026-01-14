"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AddFashionProduct from "@/components/admin/addfashionitems";
import AddCateringProduct from "@/components/admin/addcateringitem";
import ProductList from "@/components/admin/productlist";
import MessagesList from "@/components/admin/messagelist";
import OrdersList from "@/components/admin/orderslist";
import {
  Lock,
  Plus,
  List,
  MessageSquare,
  ShoppingBag,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [expandedForm, setExpandedForm] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    setIsAuthenticated(false);
    setAuthLoading(false);
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!formData.email || !formData.password) {
      setLoginError("Credentials required for studio access");
      return;
    }

    try {
      const adminDocRef = doc(db, "admin", "adminAccess");
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        setLoginError("Admin configuration missing");
        return;
      }

      const adminData = adminDocSnap.data();

      if (
        formData.email === adminData.email &&
        formData.password === adminData.password
      ) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuthenticated", "true");
        setFormData({ email: "", password: "" });
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (error) {
      setLoginError("Security verification failed");
    }
  };

  const toggleForm = (form) => {
    setExpandedForm(expandedForm === form ? null : form);
  };

  if (authLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-rush border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-bold uppercase tracking-widest text-xs text-fashion/20">
          Securing Line...
        </p>
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Blurred Background with Rush Tint */}
        <div className="blur-xl opacity-20 pointer-events-none py-12 px-4 scale-105">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="h-20 bg-fashion rounded-3xl" />
            <div className="grid grid-cols-2 gap-8">
              <div className="h-64 bg-gray-200 rounded-3xl" />
              <div className="h-64 bg-gray-200 rounded-3xl" />
            </div>
          </div>
        </div>

        {/* LOGIN MODAL */}
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-fashion/40 backdrop-blur-md px-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 w-full max-w-md border border-white/20 relative">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl font-black text-fashion uppercase tracking-tighter leading-none mb-2">
                Admin<span className="text-rush italic ml-2">Panel</span>
              </h2>
              <p className="font-sans text-[10px] text-fashion/40 uppercase tracking-[0.2em] font-bold">
                Identity Verification Required
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
                  Admin ID
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleLoginChange}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-xl p-4 font-sans text-fashion outline-none transition-all shadow-inner"
                  placeholder="admin@ajeborush.com"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion">
                  Security Key
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-xl p-4 font-sans text-fashion outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              {loginError && (
                <div className="bg-rush/5 border-l-4 border-rush p-4 rounded-r-xl">
                  <p className="text-rush text-[10px] font-bold uppercase tracking-wider">
                    {loginError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-rush text-white font-display font-black py-5 rounded-full uppercase tracking-[0.2em] text-xs hover:bg-fashion transition-all active:scale-95 shadow-xl shadow-rush/20"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 md:pt-44 px-6">
      {/* DASHBOARD HEADER */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <span className="font-display text-rush font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
              <LayoutDashboard className="w-3 h-3" /> Management Site
            </span>
            <h1 className="font-display text-5xl md:text-8xl font-black text-fashion uppercase tracking-tighter leading-none">
              Admin <span className="text-rush italic">Dashboard</span>
            </h1>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="font-display font-bold uppercase text-[10px] tracking-widest text-fashion/40 hover:text-rush transition-colors border-b border-transparent hover:border-rush pb-1"
          >
            Terminate Session
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE MANAGEMENT SECTIONS */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Sections Helper */}
        {[
          {
            id: "fashion",
            label: "Add ART WEAR Piece",
            icon: ShoppingBag,
            component: <AddFashionProduct />,
          },
          {
            id: "catering",
            label: "Add Jellof Digest Dish",
            icon: Plus,
            component: <AddCateringProduct />,
          },
          {
            id: "productList",
            label: "Manage Inventory",
            icon: List,
            component: <ProductList />,
          },
          {
            id: "messageList",
            label: "Client Inquiries",
            icon: MessageSquare,
            component: <MessagesList />,
          },
          {
            id: "ordersList",
            label: "Order Listings",
            icon: ShoppingBag,
            component: <OrdersList />,
          },
        ].map((section) => (
          <div
            key={section.id}
            className={`group border-2 transition-all duration-500 rounded-[2rem] overflow-hidden ${
              expandedForm === section.id
                ? "border-rush shadow-2xl"
                : "border-gray-50 hover:border-gray-100 bg-gray-50/30"
            }`}
          >
            <button
              onClick={() => toggleForm(section.id)}
              className={`w-full px-8 py-6 flex justify-between items-center transition-colors ${
                expandedForm === section.id ? "bg-white" : "hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl transition-colors ${
                    expandedForm === section.id
                      ? "bg-rush text-white"
                      : "bg-white text-fashion group-hover:bg-fashion group-hover:text-white"
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                </div>
                <span
                  className={`font-display text-xl md:text-2xl font-black uppercase tracking-tighter ${
                    expandedForm === section.id
                      ? "text-fashion"
                      : "text-fashion/60"
                  }`}
                >
                  {section.label}
                </span>
              </div>
              <ChevronDown
                className={`text-rush transition-transform duration-500 ${
                  expandedForm === section.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedForm === section.id && (
              <div className="p-8 md:p-12 bg-white border-t border-gray-50 animate-fade-in">
                {section.component}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.4em] text-fashion/20">
          AjeboRush Studio Control &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
