"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 🔧 FIX: Changed collection names to match Firestore rules
        const fashionSnap = await getDocs(collection(db, "fashion"));
        const cateringSnap = await getDocs(collection(db, "catering"));

        const fashionData = fashionSnap.docs.map((doc) => ({
          id: doc.id,
          type: "fashion",
          ...doc.data(),
        }));
        const cateringData = cateringSnap.docs.map((doc) => ({
          id: doc.id,
          type: "catering",
          ...doc.data(),
        }));

        setProducts([...fashionData, ...cateringData]);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditFormData({
      name: product.name,
      description: product.description,
      sizes: product.sizes ? product.sizes.join(", ") : "",
      price: product.price,
      originalPrice: product.originalPrice || "",
      discountedPrice: product.discountedPrice || "",
      type: product.type,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (productId) => {
    try {
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        price: editFormData.discountedPrice
          ? Number(editFormData.discountedPrice)
          : Number(editFormData.price),
      };

      if (editFormData.originalPrice && editFormData.discountedPrice) {
        updateData.originalPrice = Number(editFormData.originalPrice);
        updateData.discountedPrice = Number(editFormData.discountedPrice);
      }

      if (editFormData.type === "fashion" && editFormData.sizes) {
        updateData.sizes = editFormData.sizes.split(",").map((s) => s.trim());
      }

      const productRef = doc(db, editFormData.type, productId);
      await updateDoc(productRef, updateData);

      alert("Product updated successfully!");
      setEditingId(null);
      setEditFormData({});

      // Refresh products
      const fashionSnap = await getDocs(collection(db, "fashion"));
      const cateringSnap = await getDocs(collection(db, "catering"));
      const fashionData = fashionSnap.docs.map((d) => ({
        id: d.id,
        type: "fashion",
        ...d.data(),
      }));
      const cateringData = cateringSnap.docs.map((d) => ({
        id: d.id,
        type: "catering",
        ...d.data(),
      }));
      setProducts([...fashionData, ...cateringData]);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product!");
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const product = products.find((p) => p.id === productId);
      const productRef = doc(db, product.type, productId);
      await deleteDoc(productRef);

      alert("Product deleted successfully!");
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product!");
    }
  };

  return (
    <div className=" max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Product List</h2>
      {loading ? (
        <p className="text-gray-600">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No products available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-gray-700">Type</th>
                <th className="px-4 py-2 text-left text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-gray-700">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-gray-700">Sizes</th>
                <th className="px-4 py-2 text-left text-gray-700">Price</th>
                <th className="px-4 py-2 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  {editingId === product.id ? (
                    // Edit Mode
                    <>
                      <td className="px-4 py-2">{product.type}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleUpdateChange}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleUpdateChange}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1"
                          rows="2"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {product.type === "fashion" ? (
                          <input
                            type="text"
                            name="sizes"
                            value={editFormData.sizes}
                            onChange={handleUpdateChange}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1"
                            placeholder="e.g., S, M, L"
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          name="price"
                          value={
                            editFormData.discountedPrice
                              ? editFormData.discountedPrice
                              : editFormData.price
                          }
                          onChange={(e) =>
                            handleUpdateChange(
                              editFormData.discountedPrice
                                ? {
                                    target: {
                                      name: "discountedPrice",
                                      value: e.target.value,
                                    },
                                  }
                                : {
                                    target: {
                                      name: "price",
                                      value: e.target.value,
                                    },
                                  }
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-2 py-1"
                        />
                        {(editFormData.originalPrice ||
                          editFormData.discountedPrice) && (
                          <input
                            type="text"
                            name="originalPrice"
                            value={editFormData.originalPrice || ""}
                            onChange={handleUpdateChange}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 mt-1"
                            placeholder="Original Price"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleUpdateSubmit(product.id)}
                          className="px-3 py-1 w-30 mb-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 w-30 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-4 py-2 capitalize">{product.type}</td>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">
                        {product.description.length > 100
                          ? product.description.slice(0, 100) + "..."
                          : product.description}
                      </td>
                      <td className="px-4 py-2">
                        {product.sizes ? product.sizes.join(", ") : "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {product.originalPrice && product.discountedPrice ? (
                          <span>
                            <span className="text-red-500 font-semibold">
                              ${product.discountedPrice}
                            </span>{" "}
                            <span className="text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          </span>
                        ) : (
                          `$${product.price}`
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-30 mb-4"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 w-30"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
