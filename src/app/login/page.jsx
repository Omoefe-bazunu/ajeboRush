"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <section className="relative flex items-center justify-center min-h-screen px-6 overflow-hidden">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/ajebobg.jpg')` }}
      />
      <div className="absolute inset-0 z-10 bg-fashion/85 backdrop-blur-md" />

      {/* MAIN WRAPPER: 
        Added pt-32 (Mobile) and pt-44 (Desktop) to push content below the fixed header.
        Added pb-20 to ensure it doesn't hit the footer on short screens.
      */}
      <div className="relative z-20 w-full max-w-md pt-32 pb-20 md:pt-44 md:pb-24 flex flex-col items-center">
        {/* THE LOGIN CARD */}
        <div className="w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:shadow-rush/10">
          {/* Brand Header inside Card */}
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl md:text-5xl font-black text-fashion uppercase tracking-tighter leading-none mb-3">
              USER <span className="text-rush italic">LOGIN</span>
            </h2>
            <div className="h-1 w-12 bg-rush mx-auto rounded-full mb-4" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2 px-1">
                <Mail className="w-3 h-3 text-rush" /> User Email
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-display font-black uppercase tracking-widest text-[10px] text-fashion flex items-center gap-2">
                  <Lock className="w-3 h-3 text-rush" /> Password
                </label>
                <Link
                  href="/forgot-password"
                  size="sm"
                  className="text-[10px] font-bold text-fashion/30 hover:text-rush transition-colors uppercase"
                >
                  Reset Password
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-rush focus:bg-white rounded-2xl p-4 font-sans text-fashion outline-none transition-all pr-12 shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-fashion/20 hover:text-rush transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-full font-display font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-rush/20 group relative overflow-hidden ${
                loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-rush text-white hover:bg-fashion hover:scale-[1.02] active:scale-95"
              }`}
            >
              <span className="relative z-10">
                {loading ? "Authenticating..." : "Submit"}
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 text-center pt-6 border-t border-gray-50">
            <p className="font-sans text-[10px] text-fashion/40 uppercase tracking-widest font-black">
              No Account Yet?{" "}
              <Link
                href="/signup"
                className="text-rush hover:text-fashion transition-colors ml-1 underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
