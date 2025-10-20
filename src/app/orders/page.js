"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { ChevronDown, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchUserOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user, router]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="px-4 max-w-4xl mx-auto py-12 mt-20">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            You have not placed any orders yet.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-sky-800 text-white rounded-lg hover:bg-sky-900 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Collapsible Header */}
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold text-gray-800">
                    ${order.totalAmount?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <ChevronDown
                  size={24}
                  className={`text-gray-600 transition-transform flex-shrink-0 ${
                    expandedId === order.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Content */}
              {expandedId === order.id && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="space-y-4">
                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Shipping Address
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {order.address}
                        <br />
                        {order.city}, {order.state} {order.zip}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Items Ordered
                      </h4>
                      <div className="space-y-2">
                        {order.cartItems && order.cartItems.length > 0 ? (
                          order.cartItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-gray-600 text-sm bg-gray-50 p-3 rounded"
                            >
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.selectedSize && (
                                  <p className="text-xs text-gray-500">
                                    Size: {item.selectedSize}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p>
                                  {item.quantity}x $
                                  {item.price?.toFixed(2) || "0.00"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  $
                                  {(item.quantity * item.price)?.toFixed(2) ||
                                    "0.00"}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 text-sm">
                            No items in order
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>
                          $
                          {order.cartItems
                            ?.reduce(
                              (sum, item) => sum + item.quantity * item.price,
                              0
                            )
                            .toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${order.totalAmount?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>

                    {/* Order Status */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Order Status
                      </h4>
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize inline-block ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="text-center mt-8 hover:text-orange-600 transition-colors">
            <Link href="/cart">
              <Undo className="text-center mx-auto" />
              <p className="text-xl font-semibold">Back to Cart</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
