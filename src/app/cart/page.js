"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Button from "@/components/common/buttons";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc, // Imported deleteDoc for removing items
} from "firebase/firestore";
import { ListOrdered, X } from "lucide-react"; // Imported X for close icon

// --- Confirmation Modal Component ---
// This component replaces the need for window.confirm()
const ConfirmationModal = ({ item, onConfirm, onCancel }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          Confirm Removal
        </h3>
        <p className="mb-6 text-gray-700">
          Are you sure you want to remove **{item.name}**{" "}
          {item.selectedSize ? ` (Size: ${item.selectedSize})` : ""} from your
          cart?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item.firestoreId)} // Use firestoreId for deletion
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the confirmation modal
  const [itemToRemove, setItemToRemove] = useState(null);

  // 🔐 Redirect unauthenticated users to login
  useEffect(() => {
    // Only redirect if user is explicitly null (not just undefined) and loading is done
    if (user === null && !loading) {
      router.push("/login");
    }
  }, [user, router, loading]);

  // 🧩 Fetch user cart from Firestore
  useEffect(() => {
    if (!user) {
      // If no user, stop loading immediately and clear cart
      setLoading(false);
      setCart([]);
      return;
    }

    const cartRef = collection(db, "users", user.uid, "cart");

    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        const cartItems = snapshot.docs.map((doc) => ({
          // Use a unique name for the Firestore document ID to pass to deleteDoc later
          firestoreId: doc.id,
          ...doc.data(),
        }));
        setCart(cartItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching cart snapshot:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 🆕 NEW: Function to delete the item from Firestore
  const deleteItemFromFirestore = async (firestoreId) => {
    if (!user || !firestoreId) {
      console.error("Cannot delete: User or item ID missing.");
      return;
    }
    try {
      // Path to the specific document to delete
      const itemDocRef = doc(db, "users", user.uid, "cart", firestoreId);
      await deleteDoc(itemDocRef);
      console.log(`Item ${firestoreId} successfully removed from cart.`);
      // The onSnapshot listener will automatically update the local 'cart' state
    } catch (error) {
      console.error("Error deleting cart item:", error);
    } finally {
      setItemToRemove(null); // Close the modal regardless of success/failure
    }
  };

  // 💾 Update cart in Firestore (for quantity changes)
  const updateCartInFirestore = async (item) => {
    if (!user || !item.firestoreId) return;

    try {
      const userCartRef = doc(db, "users", user.uid, "cart", item.firestoreId);
      await updateDoc(userCartRef, { quantity: item.quantity });
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  // 🧮 Calculate total
  const totalPrice = cart.reduce((total, item) => {
    const price = item.discountedPrice || item.price;
    return total + price * item.quantity;
  }, 0);

  // ➕ Increase quantity
  const handleIncreaseQuantity = (item) => {
    const updatedCart = cart.map((cartItem) =>
      cartItem.firestoreId === item.firestoreId
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
    // Find the item that was just updated
    const updatedItem = updatedCart.find(
      (i) => i.firestoreId === item.firestoreId
    );
    if (updatedItem) {
      updateCartInFirestore(updatedItem);
    }
  };

  // ➖ Decrease quantity (Now calls the confirmation prompt if quantity hits 1)
  const handleDecreaseQuantity = (item) => {
    if (item.quantity === 1) {
      // If quantity is 1, prompt for removal instead of decreasing
      setItemToRemove(item);
      return;
    }

    const updatedCart = cart.map((cartItem) =>
      cartItem.firestoreId === item.firestoreId
        ? { ...cartItem, quantity: cartItem.quantity - 1 }
        : cartItem
    );

    const updatedItem = updatedCart.find(
      (i) => i.firestoreId === item.firestoreId
    );
    if (updatedItem) {
      updateCartInFirestore(updatedItem);
    }
  };

  // ❌ Remove item (Opens confirmation modal)
  const handleRemoveItem = (item) => {
    // Set the item to be removed, which opens the modal
    setItemToRemove(item);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto ">
      <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-10 mt-10 lg:mt-20 text-center">
        Cart
      </h1>

      {/* Confirmation Modal */}
      <ConfirmationModal
        item={itemToRemove}
        onConfirm={deleteItemFromFirestore}
        onCancel={() => setItemToRemove(null)}
      />

      {cart.length === 0 ? (
        <div className="text-center w-fit mx-auto flex flex-col">
          <p className="text-gray-800 mb-4">Your cart is empty.</p>
          <Button href="/" className="bg-gray-800 w-fit hover:bg-gray-900">
            Continue Shopping
          </Button>
          <div className="text-center mt-8 hover:text-orange-600 transition-colors">
            <Link href="/orders">
              <ListOrdered className="text-center mx-auto" />
              <p className="text-xl font-semibold">View Orders</p>
            </Link>
          </div>
          <button
            onClick={() => logout()}
            className="bg-red-700 w-fit mx-auto hover:bg-red-800 mt-8 px-6 py-3 rounded-lg text-white transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.firestoreId} // Use firestoreId as the unique key
                className="flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Item Image */}
                <div className="relative w-24 h-24">
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </h2>
                  {item.selectedSize && (
                    <p className="text-gray-600">Size: {item.selectedSize}</p>
                  )}
                  <p className="text-gray-600">
                    ${item.discountedPrice || item.price} x {item.quantity}
                  </p>
                  <p className="text-gray-800 font-semibold">
                    Total: $
                    {(item.discountedPrice || item.price) * item.quantity}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecreaseQuantity(item)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    -
                  </button>
                  <span className="text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => handleIncreaseQuantity(item)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item)} // Pass the whole item
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="mt-8 p-4 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Cart Summary
            </h2>
            <p className="text-gray-800 font-semibold">
              Total: ${totalPrice.toFixed(2)}
            </p>
            <div className="mt-4 flex justify-center">
              <Link href="/checkout">
                <button className="px-6 py-3 w-36 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Checkout
                </button>
              </Link>
            </div>
          </div>

          {/* View Orders Button and Logout */}
          <div className="flex justify-between items-center mt-8 p-4 bg-gray-50 rounded-lg">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <ListOrdered className="w-6 h-6" />
              <p className="text-lg font-semibold">View Orders</p>
            </Link>
            <button
              onClick={() => logout()}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg text-white transition font-semibold"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
