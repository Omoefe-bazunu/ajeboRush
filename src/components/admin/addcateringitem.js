"use client";
import { useState } from "react";
import Image from "next/image";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import {
  Utensils,
  Upload,
  CheckCircle2,
  X,
  Plus,
  Info,
  Layers,
} from "lucide-react";

export default function AddCateringProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fullPrice: "",
    halfPrice: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select an image file",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image must be less than 5MB",
        }));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Dish name is required";
    if (!imageFile) newErrors.image = "A high-quality photo is required";
    if (!formData.description)
      newErrors.description = "Tell the story of this dish";

    // Ensure at least one price is entered
    if (!formData.fullPrice && !formData.halfPrice) {
      newErrors.price = "At least one price option (Full or Half) is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      let imageURL = "";
      if (imageFile) {
        const storageRef = ref(
          storage,
          `catering/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
      }

      const newProduct = {
        type: "catering",
        name: formData.name,
        imageURL: imageURL,
        description: formData.description,
        // Store both price options
        fullPrice: formData.fullPrice ? Number(formData.fullPrice) : null,
        halfPrice: formData.halfPrice ? Number(formData.halfPrice) : null,
        // Fallback for general queries
        price: Number(formData.fullPrice || formData.halfPrice),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "catering"), newProduct);
      setShowSuccess(true);
      resetForm();
    } catch (err) {
      alert("Error adding product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      fullPrice: "",
      halfPrice: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="w-full bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden relative">
      {showSuccess && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-fashion/60 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-white/20 animate-rush">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="font-display text-3xl font-black text-fashion uppercase tracking-tighter mb-2">
              Dish <span className="text-rush italic">Added</span>
            </h3>
            <p className="font-sans text-fashion/60 mb-8 uppercase text-[10px] font-bold tracking-widest">
              Successfully Added to Menu
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-4 bg-rush text-white font-display font-black uppercase tracking-widest text-xs rounded-full hover:bg-fashion transition-all"
            >
              Add another dish
            </button>
          </div>
        </div>
      )}

      <div className="p-8 md:p-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-rush/10 rounded-2xl">
            <Utensils className="w-6 h-6 text-rush" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-black text-fashion uppercase tracking-tighter">
              New <span className="text-rush italic">Catering</span> Item
            </h2>
            <p className="font-sans text-[10px] text-fashion/40 uppercase tracking-[0.2em] font-bold">
              Menu Pricing & Asset Management
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
                <Plus className="w-3 h-3 text-rush" /> Dish Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all"
                placeholder="e.g. Smoky Jellof Rice (Large Pan)"
              />
              {errors.name && (
                <p className="text-rush text-[10px] font-bold italic uppercase tracking-wider">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
                <Upload className="w-3 h-3 text-rush" /> Visual Asset
              </label>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative group flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 group-hover:border-rush group-hover:bg-rush/5 transition-all">
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-rush transition-colors mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-rush">
                      Click to browse photo
                    </p>
                  </div>
                </div>
                {imagePreview && (
                  <div className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-rush text-white rounded-full shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-rush text-[10px] font-bold italic uppercase tracking-wider">
                  {errors.image}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
                <Info className="w-3 h-3 text-rush" /> Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all resize-none"
                placeholder="Briefly describe the ingredients and portion size..."
              />
              {errors.description && (
                <p className="text-rush text-[10px] font-bold italic uppercase tracking-wider">
                  {errors.description}
                </p>
              )}
            </div>

            {/* UPDATED PRICING SECTION */}
            <div className="p-6 bg-gray-50 rounded-4xl md:col-span-2">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion/40 mb-4 block flex items-center gap-2">
                <Layers className="w-3 h-3" /> Portion Pricing
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-display font-black uppercase tracking-widest text-[8px] text-fashion">
                    Full Price (Large Pan/Tray)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fashion/40 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      name="fullPrice"
                      step="0.01"
                      value={formData.fullPrice}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-100 rounded-xl p-3 pl-8 font-display font-bold text-fashion outline-none focus:border-rush"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-display font-black uppercase tracking-widest text-[8px] text-rush">
                    Half Price (Small Pan/Tray)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rush/40 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      name="halfPrice"
                      step="0.01"
                      value={formData.halfPrice}
                      onChange={handleChange}
                      className="w-full bg-rush/5 border border-rush/20 rounded-xl p-3 pl-8 font-display font-bold text-rush outline-none focus:border-rush"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              {errors.price && (
                <p className="mt-4 text-rush text-[10px] font-bold italic uppercase tracking-wider text-center">
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-full font-display font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-rush/20 flex items-center justify-center gap-3 ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-rush text-white hover:bg-fashion hover:scale-[1.01] active:scale-95"
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Publish to Catering Menu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
