import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Text Content */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className="space-y-2">
            <span className="text-rush font-display font-bold uppercase tracking-[0.2em] text-sm">
              Our Heritage
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-fashion uppercase tracking-tighter leading-none">
              The Soul of <br />
              <span className="text-rush">The Rush.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Accent Bar */}

            <p className="font-display text-xl md:text-2xl text-fashion/80 leading-relaxed font-medium">
              AjeboRush is a bridge between the vibrant streets of Lagos and the
              high-energy pulse of America. Born from a passion for the "Soft
              Life," we curate experiences that feed both the soul and the
              aesthetic.
            </p>
          </div>

          <p className="font-sans text-lg text-gray-500 leading-relaxed max-w-xl">
            From gourmet Afro-fusion catering that redefines "fine dining" to
            exclusive streetwear blending Aso-Oke heritage with US urban
            sleekness, we don't just deliver products; we deliver the{" "}
            <span className="text-fashion font-bold">Ajebo Standard.</span>
          </p>

          <div className="pt-4 flex items-center gap-6">
            <div className="h-px w-12 bg-fashion/20" />
            <span className="font-display font-bold uppercase text-fashion tracking-widest text-sm">
              Established 2024 • Based in US
            </span>
          </div>
        </div>

        {/* Right: Stylized Image Section */}
        <div className="w-full lg:w-1/2 relative">
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent rounded-full -z-10 animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-full h-full border-2 border-rush rounded-2xl -z-10 hidden md:block" />

          <div className="relative h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl group">
            <Image
              src="/catering.jpg"
              alt="The AjeboRush Experience"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Image Overlay tint */}
            <div className="absolute inset-0 bg-fashion/10 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
