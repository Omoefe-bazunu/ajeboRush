"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Send, User, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Your name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please provide a valid US or international email";
    }
    if (!formData.message)
      newErrors.message = "Tell us about your catering or fashion needs";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      alert("✅ Your inquiry has been sent to the AjeboRush Studio!");
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    } catch (error) {
      console.error("Error submitting message:", error);
      alert("❌ Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* EDITORIAL HEADING */}
        <div className="text-center mb-16">
          <h1 className="font-display text-6xl md:text-8xl font-black text-fashion uppercase tracking-tighter leading-none mt-4">
            Contact
            <span className="text-rush italic">US</span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-fashion/60 mt-6 max-w-2xl mx-auto">
            Booking an event or requesting a custom design? Fill out the brief
            below and our team will respond within 24 hours.
          </p>
        </div>

        {/* CONTACT FORM */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Subtle Brand Accent Line */}
          <div className="absolute top-0 left-0 w-full h-2 bg-rush" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-display font-black uppercase tracking-widest text-[10px] text-fashion">
                  <User className="w-3 h-3 text-rush" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g. Tobi Adeyemi"
                  className={`w-full font-sans bg-gray-50 border-2 rounded-xl px-4 py-4 outline-none transition-all ${
                    errors.name
                      ? "border-rush/50"
                      : "border-transparent focus:border-fashion focus:bg-white"
                  }`}
                />
                {errors.name && (
                  <p className="text-rush text-[10px] font-bold uppercase italic tracking-wider">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-display font-black uppercase tracking-widest text-[10px] text-fashion">
                  <Mail className="w-3 h-3 text-rush" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="email@example.com"
                  className={`w-full font-sans bg-gray-50 border-2 rounded-xl px-4 py-4 outline-none transition-all ${
                    errors.email
                      ? "border-rush/50"
                      : "border-transparent focus:border-fashion focus:bg-white"
                  }`}
                />
                {errors.email && (
                  <p className="text-rush text-[10px] font-bold uppercase italic tracking-wider">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-display font-black uppercase tracking-widest text-[10px] text-fashion">
                <MessageSquare className="w-3 h-3 text-rush" /> Inquiry Brief
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
                rows={5}
                placeholder="Tell us about your event or the fashion drop you're interested in..."
                className={`w-full font-sans bg-gray-50 border-2 rounded-xl px-4 py-4 outline-none transition-all resize-none ${
                  errors.message
                    ? "border-rush/50"
                    : "border-transparent focus:border-fashion focus:bg-white"
                }`}
              />
              {errors.message && (
                <p className="text-rush text-[10px] font-bold uppercase italic tracking-wider">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`group w-full py-5 rounded-full font-display font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                  loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-rush text-white hover:bg-fashion hover:scale-[1.02] active:scale-95 shadow-rush/30"
                }`}
              >
                {loading ? (
                  "Initiating Connection..."
                ) : (
                  <>
                    Send Inquiry{" "}
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Alternative Contact Info */}
        <div className="mt-16 flex flex-col md:flex-row justify-between items-center text-center md:text-left border-t border-gray-100 pt-12 gap-8">
          <div>
            <p className="font-display font-black text-fashion uppercase tracking-widest text-sm">
              Direct Line
            </p>
            <a
              href="tel:+18172989961"
              className="font-sans text-xl text-rush font-bold hover:underline"
            >
              +1 (817) 298-9961
            </a>
          </div>
          <div>
            <p className="font-display font-black text-fashion uppercase tracking-widest text-sm">
              Location
            </p>
            <p className="font-sans text-xl text-fashion/60">
              DFW Metropolitan Area, TX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
