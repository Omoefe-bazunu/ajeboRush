"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  Mail,
  Trash2,
  Calendar,
  User,
  MessageSquareText,
  ExternalLink,
} from "lucide-react";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "contactMessages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Permanently archive this inquiry?")) return;
    try {
      await deleteDoc(doc(db, "contactMessages", id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Recent";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-rush text-white rounded-lg">
          <Mail className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl font-black text-fashion uppercase tracking-tighter">
          Client <span className="text-rush italic">Inquiries</span>
        </h2>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-rush border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-bold uppercase tracking-widest text-[10px] text-fashion/20">
            Syncing Inbox...
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
          <MessageSquareText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="font-display text-xl font-bold text-fashion/30 uppercase tracking-tighter">
            No new transmissions
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="group bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 hover:shadow-2xl hover:shadow-fashion/5 transition-all relative overflow-hidden"
            >
              {/* Date Badge */}
              <div className="absolute top-0 right-0 bg-gray-50 px-6 py-2 rounded-bl-2xl border-l border-b border-gray-100 flex items-center gap-2">
                <Calendar className="w-3 h-3 text-rush" />
                <span className="font-sans text-[10px] font-bold text-fashion/40 uppercase tracking-widest">
                  {formatDate(msg.createdAt)}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-start gap-8">
                {/* Sender Identity */}
                <div className="md:w-1/3 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-rush" />
                      <span className="font-display font-black text-[10px] uppercase tracking-[0.2em] text-fashion/30">
                        Client Identity
                      </span>
                    </div>
                    <p className="font-display text-2xl font-black text-fashion uppercase tracking-tighter truncate">
                      {msg.name}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-3 h-3 text-rush" />
                      <span className="font-display font-black text-[10px] uppercase tracking-[0.2em] text-fashion/30">
                        Direct Link
                      </span>
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="font-sans text-sm font-bold text-fashion hover:text-rush transition-colors flex items-center gap-2 underline underline-offset-4 decoration-gray-200"
                    >
                      {msg.email}{" "}
                      <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 bg-gray-50 p-6 rounded-2xl relative">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquareText className="w-3 h-3 text-rush" />
                    <span className="font-display font-black text-[10px] uppercase tracking-widest text-fashion/40 italic">
                      Transmission Brief
                    </span>
                  </div>
                  <p className="font-sans text-fashion/80 leading-relaxed italic">
                    "{msg.message}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-end gap-3">
                  <a
                    href={`mailto:${msg.email}?subject=Inquiry from AjeboRush Studio`}
                    className="p-4 bg-fashion text-white rounded-full hover:bg-rush transition-all shadow-lg shadow-fashion/10"
                    title="Reply to Client"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-4 bg-white border border-gray-100 text-fashion/20 hover:text-rush hover:bg-rush/5 rounded-full transition-all"
                    title="Archive Message"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
