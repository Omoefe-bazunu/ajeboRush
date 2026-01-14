import { Mail, Phone, ArrowUpRight, Instagram, Twitter } from "lucide-react";

export default function ContactUs() {
  return (
    <section className="relative py-24 px-6 md:px-12 bg-fashion overflow-hidden">
      {/* Decorative Brand Glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rush/20 blur-[120px] rounded-full" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Editorial Heading */}
        <div className="mb-12">
          <span className="font-display text-rush font-bold uppercase tracking-[0.4em] text-xs mb-4 block">
            GET IN TOUCH
          </span>
          <p className="font-display text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
            Ready for
          </p>
          <h2 className="font-display text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
            <span className="text-rush">The Rush?</span>
          </h2>
        </div>

        <p className="font-sans text-lg md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          Whether you’re booking a{" "}
          <span className="text-white font-bold">private catering event</span>{" "}
          in the US or securing the latest{" "}
          <span className="text-white font-bold">Afro-Luxe drop</span>, our team
          is on standby.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 ">
          <a
            href="mailto:info@higher.com.ng"
            className="group flex items-center gap-3 bg-rush hover:bg-white text-white hover:text-fashion px-10 py-5 rounded-full font-display font-bold uppercase tracking-widest transition-all duration-300 w-full sm:w-auto shadow-2xl shadow-rush/20"
          >
            <Mail className="w-5 h-5" />
            Send an Email
            <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>

          <a
            href="tel:+18172989961"
            className="group flex items-center gap-3 bg-transparent border-2 border-white/20 hover:border-white text-white px-10 py-5 rounded-full font-display font-bold uppercase tracking-widest transition-all duration-300 w-full sm:w-auto"
          >
            <Phone className="w-5 h-5" />
            Call Direct
          </a>
        </div>
      </div>
    </section>
  );
}
