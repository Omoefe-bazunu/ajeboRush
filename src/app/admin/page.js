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

export default function AdminPage() {
  const router = useRouter();
  const [expandedForm, setExpandedForm] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check authentication on mount - always show login modal on page load
  useEffect(() => {
    // Always start as unauthenticated on component mount
    // This ensures the modal displays on every page load/refresh
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
      setLoginError("Email and password are required");
      return;
    }

    try {
      // Fetch admin credentials from Firestore
      const adminDocRef = doc(db, "admin", "adminAccess");
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        setLoginError("Admin configuration not found");
        return;
      }

      const adminData = adminDocSnap.data();

      // Verify credentials
      if (
        formData.email === adminData.email &&
        formData.password === adminData.password
      ) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuthenticated", "true");
        setFormData({ email: "", password: "" });
      } else {
        setLoginError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login");
    }
  };

  const toggleForm = (form) => {
    setExpandedForm(expandedForm === form ? null : form);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Not authenticated - show modal with blurred content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        {/* Blurred Background Content */}
        <div className="blur-sm pointer-events-none py-12 px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Admin Dashboard
          </h1>
          <div className="max-w-5xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg shadow-md h-16 bg-gray-100"
              />
            ))}
          </div>
        </div>

        {/* Login Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Admin Access
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Admin Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleLoginChange}
                  placeholder="Enter admin email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-medium">
                    {loginError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Login
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-4">
              Admin panel - authorized personnel only
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="py-12 px-4">
      <div className="flex justify-between items-center mb-12 mt-20">
        <h1 className="text-4xl font-bold text-gray-800 text-center mx-auto">
          Admin Dashboard
        </h1>
      </div>

      {/* Collapsible Sections */}
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Add Fashion Product Form */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("fashion")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Add New Fashion Product</span>
            <span>{expandedForm === "fashion" ? "-" : "+"}</span>
          </button>
          {expandedForm === "fashion" && (
            <div className="p-6">
              <AddFashionProduct />
            </div>
          )}
        </div>

        {/* Add Catering Product Form */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("catering")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Add New Catering Product</span>
            <span>{expandedForm === "catering" ? "-" : "+"}</span>
          </button>
          {expandedForm === "catering" && (
            <div className="p-6">
              <AddCateringProduct />
            </div>
          )}
        </div>

        {/* Product List Section */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("productList")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Product List</span>
            <span>{expandedForm === "productList" ? "-" : "+"}</span>
          </button>
          {expandedForm === "productList" && (
            <div className="p-6">
              <ProductList />
            </div>
          )}
        </div>

        {/* Message List Section */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("messageList")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Message List</span>
            <span>{expandedForm === "messageList" ? "-" : "+"}</span>
          </button>
          {expandedForm === "messageList" && (
            <div className="p-6">
              <MessagesList />
            </div>
          )}
        </div>

        {/* Orders List Section */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("ordersList")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Orders List</span>
            <span>{expandedForm === "ordersList" ? "-" : "+"}</span>
          </button>
          {expandedForm === "ordersList" && (
            <div className="p-6">
              <OrdersList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
