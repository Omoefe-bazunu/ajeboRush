"use client";

import { useEffect, useState } from "react";
import { Star, Quote, Edit3, Trash2, X } from "lucide-react";
import Image from "next/image";
import { auth, db, storage } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Button from "./common/buttons";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [user, setUser] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [showForm, setShowForm] = useState(false); // Controls form visibility
  const [form, setForm] = useState({
    name: "",
    review: "",
    rating: 0,
    photo: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Monitor Auth & Check for existing review
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const q = query(collection(db, "reviews"), where("uid", "==", u.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setUserReview(docData);
          // Pre-populate form but don't show it yet
          setForm({
            name: docData.authorName,
            review: docData.review,
            rating: docData.rating,
            photo: null,
          });
          setImagePreview(docData.photoUrl);
        } else {
          setUserReview(null);
          setShowForm(true); // Show add form if no review exists
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch All Reviews
  const fetchReviews = async () => {
    const snapshot = await getDocs(collection(db, "reviews"));
    const allReviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReviews(allReviews);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Carousel Logic
  useEffect(() => {
    if (reviews.length > 1 && !showForm) {
      const timer = setTimeout(() => {
        setIsSliding(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % reviews.length);
          setIsSliding(false);
        }, 800);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, reviews, showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let photoURL = userReview?.photoUrl || "";
      if (form.photo) {
        const storageRef = ref(
          storage,
          `reviewImages/${user.uid}/${Date.now()}`
        );
        await uploadBytes(storageRef, form.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      const reviewData = {
        authorName: form.name || user.displayName || "Elite Member",
        review: form.review,
        rating: form.rating,
        photoUrl: photoURL,
        uid: user.uid,
        authorTitle: "Verified Client",
        updatedAt: new Date(),
      };

      if (userReview) {
        await updateDoc(doc(db, "reviews", userReview.id), reviewData);
      } else {
        await addDoc(collection(db, "reviews"), {
          ...reviewData,
          createdAt: new Date(),
        });
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your chronicle?"))
      return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "reviews", userReview.id));
      // Optional: Delete image from storage if it exists
      if (userReview.photoUrl && userReview.photoUrl.includes("firebase")) {
        const imgRef = ref(storage, userReview.photoUrl);
        await deleteObject(imgRef).catch((e) =>
          console.log("Storage delete failed", e)
        );
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, clickable = false) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        onClick={() => clickable && setForm({ ...form, rating: i + 1 })}
        className={`h-4 w-4 ${
          clickable ? "cursor-pointer" : ""
        } transition-colors ${i < rating ? "text-rush" : "text-gray-200"}`}
        fill={i < rating ? "currentColor" : "none"}
      />
    ));

  const current = reviews[currentIndex];

  return (
    <section className="bg-white py-24 px-6 md:px-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="font-display text-rush font-bold uppercase tracking-[0.3em] text-xs">
            Testimonials
          </span>
          <h2 className="font-display text-5xl md:text-7xl font-black text-fashion uppercase tracking-tighter mt-2">
            Client <span className="text-rush italic">Reviews</span>
          </h2>
        </div>

        {/* Carousel Section */}
        {reviews.length > 0 && (
          <div className="relative flex flex-col lg:flex-row items-center gap-12 min-h-[500px] mb-32">
            <div
              className={`w-full lg:w-1/2 relative h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 ${
                isSliding ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <Image
                src={current.photoUrl || "/default-user.png"}
                alt={current.authorName}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fashion via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="font-display text-3xl font-black uppercase tracking-tighter">
                  {current.authorName}
                </p>
                <p className="font-sans text-rush font-bold text-xs uppercase tracking-widest">
                  {current.authorTitle}
                </p>
              </div>
            </div>
            <div
              className={`w-full lg:w-1/2 space-y-8 transition-all duration-700 ${
                isSliding
                  ? "opacity-0 translate-x-12"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <Quote className="text-rush/20 w-24 h-24 absolute -top-10 -left-4 lg:relative lg:top-0 lg:left-0" />
              <div className="flex gap-1 mb-4">
                {renderStars(current.rating)}
              </div>
              <blockquote className="font-display text-3xl md:text-5xl font-bold text-fashion leading-tight italic">
                "{current.review}"
              </blockquote>
            </div>
          </div>
        )}

        {/* REVIEW MANAGEMENT BLOCK */}
        <div className="max-w-2xl mx-auto bg-fashion p-10 md:p-16 rounded-[2rem] shadow-2xl relative">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-white/60 font-sans mb-6">
                Log in to join the inner circle of AjeboRush clients.
              </p>
              <Button
                href="/login"
                className="bg-white text-fashion px-12 py-3 rounded-full font-display font-bold uppercase tracking-widest"
              >
                Login
              </Button>
            </div>
          ) : userReview && !showForm ? (
            /* VIEW EXISTING REVIEW MODE */
            <div className="space-y-8 text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rush text-white px-8 py-2 rounded-full text-nowrap font-display font-black uppercase text-xs tracking-widest">
                Your Reviews
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-rush">
                  <Image
                    src={userReview.photoUrl || "/default-user.png"}
                    alt="Your Photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-1">
                  {renderStars(userReview.rating)}
                </div>
                <p className="text-white text-xl font-display italic leading-relaxed">
                  &quot{userReview.review}&quot
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-display font-bold uppercase text-xs tracking-widest transition-all"
                >
                  <Edit3 size={16} /> Update
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-rush/10 hover:bg-rush text-rush hover:text-white rounded-full font-display font-bold uppercase text-xs tracking-widest transition-all"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ) : (
            /* FORM MODE (ADD OR UPDATE) */
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rush text-white px-8 py-2 rounded-full text-nowrap font-display font-black uppercase text-xs tracking-widest">
                {userReview ? "Edit Your Experience" : "Share Your Experience"}
              </div>

              {userReview && (
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              )}

              <input
                type="text"
                placeholder="YOUR NAME"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border-b border-white/20 p-4 text-white font-display focus:border-rush outline-none transition-all uppercase tracking-widest text-sm"
                required
              />
              <textarea
                rows={4}
                placeholder="DESCRIBE YOUR EXPERIENCE..."
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
                className="w-full bg-white/5 border-b border-white/20 p-4 text-white font-sans focus:border-rush outline-none transition-all"
                required
              />
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-4">
                  <span className="text-white/40 font-display text-[10px] uppercase tracking-widest">
                    Rating
                  </span>
                  <div className="flex gap-1">
                    {renderStars(form.rating, true)}
                  </div>
                </div>
                <label className="cursor-pointer group flex items-center gap-2">
                  <span className="text-white/40 group-hover:text-rush transition-colors font-display text-[10px] uppercase tracking-widest">
                    {imagePreview ? "Change Photo" : "Add Photo"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setForm({ ...form, photo: file });
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-rush">
                  <Image
                    src={imagePreview}
                    fill
                    alt="Preview"
                    className="object-cover"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-rush hover:bg-white text-white hover:text-fashion font-display font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : userReview
                  ? "Save Changes"
                  : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
