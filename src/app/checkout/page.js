"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/common/buttons";
import Image from "next/image";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Undo } from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const router = useRouter();

  // Track authentication and fetch cart
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch cart from correct subcollection path: /users/{userId}/cart/{cartItemId}
    const fetchCart = async () => {
      try {
        const cartRef = collection(db, "users", user.uid, "cart");
        const snapshot = await getDocs(cartRef);
        const cartItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCart(cartItems);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [user, router]);

  const totalPrice = cart.reduce((total, item) => {
    const price = item.discountedPrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.zip) newErrors.zip = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔧 NEW: Clear cart after successful order
  const clearCartFromFirestore = async () => {
    if (!user) return;

    try {
      const cartRef = collection(db, "users", user.uid, "cart");
      const snapshot = await getDocs(cartRef);

      // Delete each cart item
      for (const cartDoc of snapshot.docs) {
        await deleteDoc(doc(db, "users", user.uid, "cart", cartDoc.id));
      }

      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const handleWhatsAppOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) return alert("Please log in before placing your order.");
    if (cart.length === 0) return alert("Your cart is empty!");

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        userId: user.uid,
        userEmail: formData.email,
        customerName: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        cartItems: cart.map((item) => ({
          id: item.id,
          name: item.name,
          selectedSize: item.selectedSize || null,
          quantity: item.quantity,
          price: item.discountedPrice || item.price,
          imageURL: item.imageURL,
        })),
        totalAmount: totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      // Save to /orders/{orderId}
      await addDoc(collection(db, "orders"), orderData);

      // 🔧 NEW: Clear cart after successful order creation
      await clearCartFromFirestore();

      // Build WhatsApp message
      const orderDetails = cart
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} ${
              item.selectedSize ? `(Size: ${item.selectedSize})` : ""
            } - ${item.quantity} x $${item.discountedPrice || item.price}`
        )
        .join("%0A");

      const shippingInfo = `Name: ${formData.name}%0AEmail: ${
        formData.email
      }%0AAddress: ${formData.address}, ${formData.city}, ${formData.state}, ${
        formData.zip
      }%0A%0AOrder Total: $${totalPrice.toFixed(
        2
      )}%0A%0AOrder Details:%0A${orderDetails}`;

      const whatsappNumber = "18172989961";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${shippingInfo}`;

      window.open(whatsappUrl, "_blank");

      alert("Order placed successfully! Your cart has been cleared.");
      router.push("/");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700 text-lg">Loading checkout...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700 text-lg">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-10 mt-20 text-center">
        Checkout
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-6 text-lg">
            Your cart is empty. Add some items to get started!
          </p>
          <Button href="/" className="bg-sky-800 hover:bg-sky-900">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipping Form */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Shipping Details
            </h2>
            <form onSubmit={handleWhatsAppOrder} className="space-y-5">
              {[
                { name: "name", label: "Full Name", placeholder: "John Doe" },
                {
                  name: "email",
                  label: "Email",
                  placeholder: "you@example.com",
                },
                {
                  name: "address",
                  label: "Address",
                  placeholder: "123 Main St",
                },
                { name: "city", label: "City", placeholder: "Los Angeles" },
                { name: "state", label: "State", placeholder: "California" },
                { name: "zip", label: "ZIP Code", placeholder: "90001" },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-gray-700 font-medium mb-1"
                  >
                    {field.label}
                  </label>
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-700 transition-all"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 rounded-xl text-white font-medium transition-all ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-sky-800 hover:bg-sky-900"
                  }`}
                >
                  {loading ? "Submitting..." : "Place Order via WhatsApp"}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Order Summary
            </h2>
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className="flex items-center gap-4"
                >
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.imageURL}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 80px, 80px"
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-semibold">{item.name}</h3>
                    {item.selectedSize && (
                      <p className="text-gray-600 text-sm">
                        Size: {item.selectedSize}
                      </p>
                    )}
                    <p className="text-gray-700 font-medium">
                      ${item.discountedPrice || item.price} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="text-center mt-10 hover:text-orange-600 transition-colors">
          <Link href="/cart">
            <Undo className="text-center mx-auto" />
            <p className="text-xl font-semibold">Back to Cart</p>
          </Link>
        </div>
      )}
    </div>
  );
}
