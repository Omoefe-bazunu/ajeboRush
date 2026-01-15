"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Camera,
  Send,
  User,
  Mail,
  Phone,
  ChefHat,
  Shirt,
  FileText,
  X,
  Loader2,
} from "lucide-react";

export default function BespokeRequestForm() {
  const { user } = useAuth(); // Accessing the registered user context
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "catering",
    description: "",
  });

  // Prefill email whenever the user object is available
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) {
      alert("Maximum 3 images allowed for custom requests.");
      return;
    }
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getWordCount = (str) => str.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (getWordCount(formData.description) > 150) {
      alert("Description must be under 150 words.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Images to Firebase Storage
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          const fileRef = ref(
            storage,
            `CustomOrders/${Date.now()}-${file.name}`
          );
          await uploadBytes(fileRef, file);
          return getDownloadURL(fileRef);
        })
      );

      // 2. Save Manifest to Firestore
      const docRef = await addDoc(collection(db, "CustomOrders"), {
        ...formData,
        attachments: imageUrls,
        status: "Unprocessed",
        createdAt: serverTimestamp(),
      });

      // 3. Construct WhatsApp Message
      const whatsappNumber = "18172989961";
      const message =
        `*AJEBORUSH CUSTOM REQUEST*%0A` +
        `--------------------------%0A` +
        `*Name:* ${formData.name}%0A` +
        `*Email:* ${formData.email}%0A` +
        `*Category:* ${formData.category.toUpperCase()}%0A` +
        `*Description:* ${formData.description}%0A` +
        `*Order ID:* ${docRef.id}%0A` +
        `--------------------------%0A` +
        `View attachments in Firestore dashboard.`;

      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");

      // Reset Form (Keeping the email intact)
      setFormData({
        name: "",
        email: user?.email || "",
        phone: "",
        category: "catering",
        description: "",
      });
      setFiles([]);
      setLoading(false);
      alert("Your custom manifest has been sent to the AjeboRush concierge!");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-20 px-6 bg-gray-100 border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-black text-fashion uppercase tracking-tighter mb-2">
            Have something <span className="text-rush italic">else</span> in
            mind?
          </h2>
          <p className="font-display text-rush font-bold uppercase tracking-[0.3em] text-[10px]">
            Send a Custom Request
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 md:p-12 rounded-[3rem] border border-gray-100"
        >
          {/* USER INFO */}
          <div className="space-y-4 md:col-span-1">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fashion/20" />
              <input
                required
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-transparent focus:border-rush outline-none font-sans text-sm transition-all"
              />
            </div>

            {/* READ-ONLY EMAIL FIELD */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fashion/40" />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={formData.email}
                readOnly
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 border border-transparent cursor-not-allowed outline-none font-sans text-sm text-fashion/50 transition-all"
                title="Email is tied to your registered account"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fashion/20" />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-transparent focus:border-rush outline-none font-sans text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="font-display font-black uppercase tracking-widest text-[9px] text-fashion/40 ml-2">
              Request Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, category: "catering" })
                }
                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.category === "catering"
                    ? "border-rush bg-rush text-white"
                    : "border-white bg-white text-fashion/40"
                }`}
              >
                <ChefHat className="w-5 h-5" />
                <span className="font-display font-bold text-[10px] uppercase">
                  Catering
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, category: "fashion" })
                }
                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.category === "fashion"
                    ? "border-fashion bg-fashion text-white"
                    : "border-white bg-white text-fashion/40"
                }`}
              >
                <Shirt className="w-5 h-5" />
                <span className="font-display font-bold text-[10px] uppercase">
                  Fashion
                </span>
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-center px-2">
              <label className="font-display font-black uppercase tracking-widest text-[9px] text-fashion/40">
                Description
              </label>
              <span
                className={`text-[9px] font-bold ${
                  getWordCount(formData.description) > 150
                    ? "text-rush"
                    : "text-fashion/20"
                }`}
              >
                {getWordCount(formData.description)} / 150 Words
              </span>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Describe your vision (specific ingredients, event details, or design preferences)..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-5 rounded-4xl bg-white border border-transparent focus:border-rush outline-none font-sans text-sm resize-none transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-display font-black uppercase tracking-widest text-[9px] text-fashion/40 ml-2">
                Inspiration Assets (Max 3)
              </label>
              <input
                type="file"
                id="custom-file"
                multiple
                hidden
                onChange={handleFileChange}
                disabled={files.length >= 3}
              />
              <label
                htmlFor="custom-file"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-display font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all ${
                  files.length >= 3
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white text-rush hover:bg-rush hover:text-white border border-rush/20"
                }`}
              >
                <Camera className="w-3 h-3" /> Add Image
              </label>
            </div>

            <div className="flex gap-4">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center overflow-hidden"
                >
                  <X
                    className="absolute top-1 right-1 w-3 h-3 text-rush cursor-pointer z-10"
                    onClick={() => removeFile(idx)}
                  />
                  <FileText className="w-6 h-6 text-fashion/20" />
                  <span className="absolute bottom-1 text-[8px] font-bold truncate px-1 w-full text-center">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              disabled={loading}
              className="w-full py-5 bg-rush text-white rounded-full font-display font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:bg-fashion transition-all shadow-xl shadow-rush/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Securing Manifest..." : "Submit Custom Manifest"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
