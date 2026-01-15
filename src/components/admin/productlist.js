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
import {
  Edit3,
  Trash2,
  Save,
  XCircle,
  ChefHat,
  Shirt,
  Tag,
  Search,
} from "lucide-react";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditFormData({
      name: product.name,
      description: product.description,
      type: product.type,
      // Fashion-specific fields
      sizes: product.sizes ? product.sizes.join(", ") : "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      discountedPrice: product.discountedPrice || "",
      // Catering-specific fields
      fullPrice: product.fullPrice || "",
      halfPrice: product.halfPrice || "",
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (productId) => {
    try {
      const isCatering = editFormData.type === "catering";

      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
      };

      if (isCatering) {
        // Handle Catering Dual Pricing
        updateData.fullPrice = editFormData.fullPrice
          ? Number(editFormData.fullPrice)
          : null;
        updateData.halfPrice = editFormData.halfPrice
          ? Number(editFormData.halfPrice)
          : null;
        // Maintain fallback for general sorting/queries
        updateData.price = Number(
          editFormData.fullPrice || editFormData.halfPrice
        );
      } else {
        // Handle Fashion Pricing
        updateData.price = editFormData.discountedPrice
          ? Number(editFormData.discountedPrice)
          : Number(editFormData.price);

        if (editFormData.originalPrice && editFormData.discountedPrice) {
          updateData.originalPrice = Number(editFormData.originalPrice);
          updateData.discountedPrice = Number(editFormData.discountedPrice);
        }

        if (editFormData.sizes) {
          updateData.sizes = editFormData.sizes
            .split(",")
            .map((s) => s.trim().toUpperCase());
        }
      }

      const productRef = doc(db, editFormData.type, productId);
      await updateDoc(productRef, updateData);

      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (productId, type) => {
    if (!confirm("Permanently remove this piece from the archives?")) return;
    try {
      await deleteDoc(doc(db, type, productId));
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fashion text-white rounded-lg">
            <Tag className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter">
            Inventory <span className="text-rush italic">Manifest</span>
          </h2>
        </div>

        <div className="relative w-full md:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-rush transition-colors" />
          <input
            type="text"
            placeholder="Search manifest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full font-sans text-xs outline-none focus:bg-white focus:border-rush transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-rush border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-fashion/20">
            Syncing...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-4xl border border-gray-100 shadow-sm bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="bg-fashion text-white">
                <th className="px-6 py-5 text-left font-display font-black uppercase text-[10px] tracking-widest">
                  Wing
                </th>
                <th className="px-6 py-5 text-left font-display font-black uppercase text-[10px] tracking-widest">
                  Product Identity
                </th>
                <th className="px-6 py-5 text-left font-display font-black uppercase text-[10px] tracking-widest">
                  Valuation
                </th>
                <th className="px-6 py-5 text-right font-display font-black uppercase text-[10px] tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`group transition-colors ${
                    editingId === product.id
                      ? "bg-rush/5"
                      : "hover:bg-gray-50/30"
                  }`}
                >
                  {/* TYPE COLUMN */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {product.type === "fashion" ? (
                        <div className="flex items-center gap-2 text-fashion">
                          <Shirt className="w-4 h-4" />
                          <span className="font-display font-black text-[10px] uppercase tracking-widest">
                            ART WEAR
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rush">
                          <ChefHat className="w-4 h-4" />
                          <span className="font-display font-black text-[10px] uppercase tracking-widest">
                            JELLOF DIGEST
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* IDENTITY COLUMN */}
                  <td className="px-6 py-5">
                    {editingId === product.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleUpdateChange}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 font-sans text-sm focus:border-rush outline-none"
                        />
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleUpdateChange}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 font-sans text-xs focus:border-rush outline-none"
                          rows="2"
                        />
                        {product.type === "fashion" && (
                          <input
                            type="text"
                            name="sizes"
                            value={editFormData.sizes}
                            onChange={handleUpdateChange}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 font-sans text-[10px] font-bold uppercase tracking-widest"
                            placeholder="S, M, L..."
                          />
                        )}
                      </div>
                    ) : (
                      <div className="max-w-xs">
                        <p className="font-display text-lg font-black text-fashion uppercase tracking-tighter mb-1">
                          {product.name}
                        </p>
                        <p className="font-sans text-[10px] text-fashion/40 line-clamp-1 italic">
                          {product.description}
                        </p>
                        {product.sizes && (
                          <div className="flex gap-1 mt-2">
                            {product.sizes.map((s) => (
                              <span
                                key={s}
                                className="text-[8px] font-black bg-gray-100 px-2 py-0.5 rounded text-fashion/60 border border-gray-200 uppercase"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* VALUATION COLUMN (Logic Split) */}
                  <td className="px-6 py-5">
                    {editingId === product.id ? (
                      <div className="space-y-2">
                        {product.type === "catering" ? (
                          <>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-fashion/30 uppercase px-1">
                                Full Price
                              </span>
                              <input
                                type="number"
                                name="fullPrice"
                                value={editFormData.fullPrice}
                                onChange={handleUpdateChange}
                                className="w-24 bg-white border border-gray-200 rounded-lg p-2 font-display font-black text-xs"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-rush uppercase px-1">
                                Half Price
                              </span>
                              <input
                                type="number"
                                name="halfPrice"
                                value={editFormData.halfPrice}
                                onChange={handleUpdateChange}
                                className="w-24 bg-rush/5 border border-rush/20 rounded-lg p-2 font-display font-black text-rush text-xs"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-fashion/30 uppercase px-1">
                                Base
                              </span>
                              <input
                                type="number"
                                name="price"
                                value={editFormData.price}
                                onChange={handleUpdateChange}
                                className="w-24 bg-white border border-gray-100 rounded-lg p-2 font-display font-black text-xs"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-rush uppercase px-1">
                                Sale
                              </span>
                              <input
                                type="number"
                                name="discountedPrice"
                                value={editFormData.discountedPrice}
                                onChange={handleUpdateChange}
                                className="w-24 bg-rush/5 border border-rush/20 rounded-lg p-2 font-display font-black text-rush text-xs"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {product.type === "catering" ? (
                          <>
                            {product.fullPrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-fashion/30 uppercase">
                                  F
                                </span>
                                <span className="font-display font-black text-fashion text-lg leading-none tracking-tighter">
                                  ${product.fullPrice}
                                </span>
                              </div>
                            )}
                            {product.halfPrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-rush/40 uppercase">
                                  H
                                </span>
                                <span className="font-display font-black text-rush text-lg leading-none tracking-tighter">
                                  ${product.halfPrice}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {product.originalPrice &&
                            product.discountedPrice ? (
                              <>
                                <span className="font-display font-black text-rush text-xl leading-none tracking-tighter">
                                  ${product.discountedPrice}
                                </span>
                                <span className="font-sans text-[10px] text-fashion/20 line-through font-bold">
                                  ${product.originalPrice}
                                </span>
                              </>
                            ) : (
                              <span className="font-display font-black text-fashion text-xl leading-none tracking-tighter">
                                ${product.price}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>

                  {/* ACTIONS COLUMN */}
                  <td className="px-6 py-5 text-right">
                    {editingId === product.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateSubmit(product.id)}
                          className="p-2.5 bg-fashion text-white rounded-xl hover:bg-rush transition-all shadow-lg shadow-fashion/10"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2.5 bg-gray-100 text-fashion rounded-xl hover:bg-gray-200 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 transition-all translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2.5 bg-gray-50 text-fashion border border-gray-100 rounded-xl hover:bg-fashion hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.type)}
                          className="p-2.5 bg-rush/5 text-rush border border-rush/10 rounded-xl hover:bg-rush hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
