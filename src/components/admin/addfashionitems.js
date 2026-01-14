"use client";
import { useState } from "react";
import Image from "next/image";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import { Shirt, Upload, CheckCircle2, X, Sparkles, Ruler } from "lucide-react";

export default function AddFashionProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sizes: "",
    price: "",
    originalPrice: "",
    discountedPrice: "",
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
          image: "Invalid file type. Image required.",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image exceeds 5MB limit." }));
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
    if (!formData.name) newErrors.name = "Design Identity is required";
    if (!imageFile) newErrors.image = "Visual Asset is required";
    if (!formData.description)
      newErrors.description = "Fabric Narrative is required";
    if (!formData.sizes) newErrors.sizes = "Sizing Spectrum is required";
    if (!formData.price && !formData.discountedPrice) {
      newErrors.price = "Valuation is required";
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
        const timestamp = Date.now();
        const storageRef = ref(
          storage,
          `fashion/${timestamp}-${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
      }

      const newProduct = {
        type: "fashion",
        name: formData.name,
        imageURL: imageURL,
        description: formData.description,
        sizes: formData.sizes.split(",").map((s) => s.trim().toUpperCase()),
        price: formData.discountedPrice
          ? Number(formData.discountedPrice)
          : Number(formData.price),
        ...(formData.originalPrice &&
          formData.discountedPrice && {
            originalPrice: Number(formData.originalPrice),
            discountedPrice: Number(formData.discountedPrice),
          }),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "fashion"), newProduct);
      setShowSuccess(true);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Drop Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sizes: "",
      price: "",
      originalPrice: "",
      discountedPrice: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="w-full bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative">
      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-fashion/60 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-white/20 animate-rush">
            <div className="w-20 h-20 bg-fashion rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-rush" />
            </div>
            <h3 className="font-display text-3xl font-black text-fashion uppercase tracking-tighter mb-2">
              Piece <span className="text-rush italic">Dropped</span>
            </h3>
            <p className="font-sans text-fashion/60 mb-8 uppercase text-[10px] font-bold tracking-widest leading-relaxed">
              New ART WEAR design is now live in the Archives
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-4 bg-fashion text-white font-display font-black uppercase tracking-widest text-xs rounded-full hover:bg-rush transition-all"
            >
              Back to Studio
            </button>
          </div>
        </div>
      )}

      <div className="p-8 md:p-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-fashion text-white rounded-2xl shadow-lg">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-black text-fashion uppercase tracking-tighter">
              New <span className="text-rush italic">ART</span> WEAR Drop
            </h2>
            <p className="font-sans text-[10px] text-fashion/40 uppercase tracking-[0.2em] font-bold">
              Fashion Inventory Management
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NAME FIELD */}
            <div className="md:col-span-2 space-y-2">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
                Design Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all"
                placeholder="e.g. Aso-Oke Bomber Jacket v1"
              />
              {errors.name && (
                <p className="text-rush text-[10px] font-bold italic uppercase tracking-wider">
                  {errors.name}
                </p>
              )}
            </div>

            {/* IMAGE UPLOAD & PREVIEW */}
            <div className="md:col-span-2 space-y-4">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion">
                Visual Asset
              </label>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative group flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-56 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 group-hover:border-fashion group-hover:bg-gray-100 transition-all">
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-fashion transition-colors mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-fashion">
                      Capture Design or Upload File
                    </p>
                  </div>
                </div>

                {imagePreview && (
                  <div className="relative w-full md:w-64 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
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
                      className="absolute top-3 right-3 p-2 bg-fashion text-white rounded-full shadow-lg hover:bg-rush transition-colors"
                    >
                      <X className="w-4 h-4" />
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

            {/* DESCRIPTION */}
            <div className="md:col-span-2 space-y-2">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion">
                Fabric Narrative
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all resize-none"
                placeholder="Describe the materials, inspiration, and fit of the garment..."
              />
              {errors.description && (
                <p className="text-rush text-[10px] font-bold italic uppercase tracking-wider">
                  {errors.description}
                </p>
              )}
            </div>

            {/* SIZING SPECTRUM */}
            <div className="md:col-span-2 space-y-2">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
                <Ruler className="w-3 h-3 text-rush" /> Sizing Spectrum (Comma
                Separated)
              </label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all"
                placeholder="e.g. S, M, L, XL"
              />
              {errors.sizes && (
                <p className="text-rush text-[10px] font-bold italic uppercase tracking-wider">
                  {errors.sizes}
                </p>
              )}
            </div>

            {/* VALUATION GRID */}
            <div className="p-8 bg-fashion rounded-[2.5rem] md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="font-display font-black uppercase tracking-widest text-[10px] text-white/40">
                  Normal Price
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-display font-bold text-white outline-none focus:border-rush"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display font-black uppercase tracking-widest text-[10px] text-white/40">
                  Original Price(If Discount)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-display font-bold text-white/20 outline-none focus:border-rush"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="font-display font-black uppercase tracking-widest text-[10px] text-rush">
                  Discount Price
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  step="0.01"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  className="w-full bg-rush/10 border border-rush/40 rounded-xl p-3 font-display font-bold text-rush outline-none focus:border-rush"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="col-span-3 text-rush text-[10px] font-bold italic uppercase tracking-wider text-center">
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
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit New Design"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
