"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ChevronDown } from "lucide-react";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
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

    fetchOrders();
  }, []);

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
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        All Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No orders yet.</p>
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
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">
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
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">
                          Name
                        </h4>
                        <p className="text-gray-600">{order.customerName}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">
                          Email
                        </h4>
                        <p className="text-gray-600">
                          <a
                            href={`mailto:${order.userEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            {order.userEmail}
                          </a>
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">
                          Address
                        </h4>
                        <p className="text-gray-600">
                          {order.address}, {order.city}, {order.state}{" "}
                          {order.zip}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">
                          Order Date
                        </h4>
                        <p className="text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Items
                      </h4>
                      <div className="space-y-2">
                        {order.cartItems && order.cartItems.length > 0 ? (
                          order.cartItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-gray-600 text-sm bg-gray-50 p-2 rounded"
                            >
                              <span>
                                {item.name}
                                {item.selectedSize &&
                                  ` (Size: ${item.selectedSize})`}
                              </span>
                              <span>
                                {item.quantity}x $
                                {item.price?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 text-sm">No items</p>
                        )}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="border-t pt-4 flex justify-between font-semibold text-gray-900">
                      <span>Total Amount:</span>
                      <span>${order.totalAmount?.toFixed(2) || "0.00"}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Status
                      </h4>
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize inline-block ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
