"use client";
import { useState } from "react";
import Image from "next/image";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";

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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select an image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image must be less than 5MB",
        }));
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
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
    if (!formData.name) newErrors.name = "Name is required";
    if (!imageFile) newErrors.image = "Image is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.sizes) newErrors.sizes = "Sizes are required";
    if (!formData.price && !formData.discountedPrice)
      newErrors.price = "Price or discounted price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      let imageURL = "";

      // Upload image to Firebase Storage
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
        sizes: formData.sizes.split(",").map((s) => s.trim()),
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
      alert("Fashion product added successfully!");
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
    } catch (err) {
      console.error(err);
      alert("Error adding product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add New Fashion Product
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 grid grid-cols-2 gap-4"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-gray-700 font-semibold mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            placeholder="e.g., Red Evening Dress"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Image Upload */}
        <div className="col-span-2">
          <label
            htmlFor="image"
            className="block text-gray-700 font-semibold mb-1"
          >
            Product Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3">
              <p className="text-gray-700 text-sm font-medium mb-2">Preview:</p>
              <div className="relative w-full h-48 rounded-lg border border-gray-300 overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label
            htmlFor="description"
            className="block text-gray-700 font-semibold mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            placeholder="e.g., A stunning red evening dress..."
            rows="3"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Sizes */}
        <div>
          <label
            htmlFor="sizes"
            className="block text-gray-700 font-semibold mb-1"
          >
            Sizes (comma-separated, e.g., S, M, L)
          </label>
          <input
            type="text"
            id="sizes"
            name="sizes"
            value={formData.sizes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            placeholder="e.g., S, M, L"
          />
          {errors.sizes && (
            <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-gray-700 font-semibold mb-1"
          >
            Price (if no discount)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            placeholder="e.g., 89.99"
            step="0.01"
          />
        </div>

        {/* Original Price (optional) */}
        <div>
          <label
            htmlFor="originalPrice"
            className="block text-gray-700 font-semibold mb-1"
          >
            Original Price (For discount)
          </label>
          <input
            type="number"
            id="originalPrice"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            placeholder="e.g., 99.99"
            step="0.01"
          />
        </div>

        {/* Discounted Price (optional) */}
        <div>
          <label
            htmlFor="discountedPrice"
            className="block text-gray-700 font-semibold mb-1"
          >
            Discounted Price (optional)
          </label>
          <input
            type="number"
            id="discountedPrice"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            placeholder="e.g., 89.99"
            step="0.01"
          />
          {errors.discountedPrice && (
            <p className="text-red-500 text-sm mt-1">
              {errors.discountedPrice}
            </p>
          )}
        </div>

        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

        <button
          type="submit"
          className="w-full col-span-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Uploading & Adding..." : "Add Fashion Product"}
        </button>
      </form>
    </div>
  );
}
