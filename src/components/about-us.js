import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="py-16 px-6 md:px-20 bg-gray-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-stretch md:space-x-10">
        {/* Left text section */}
        <div className="flex flex-col md:w-1/2 space-y-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              About Us
            </h2>
            <hr className="w-10 h-0.5 bg-orange-600 text-orange-600" />
          </div>
          <p className="text-lg md:text-2xl text-gray-600 leading-relaxed">
            AjeboRush is your one-stop destination for premium catering services
            and exclusive fashion designs. We blend creativity and quality to
            deliver unforgettable experiences, whether through our delectable
            dishes or stylish apparel. Our mission is to bring joy and elegance
            to every occasion.
          </p>
        </div>

        {/* Right image section */}
        <div className="relative h-100 mt-10 md:mt-0 w-full md:w-1/2 overflow-hidden rounded-lg">
          <Image
            src={"/about.png"}
            alt={"About Us"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            // Updated to object-cover: Fills the container completely, maintaining aspect ratio.
            // This will crop the image if its aspect ratio doesn't match the container (h-80 w-full).
            className="rounded-t-lg transition duration-300 group-hover:scale-105 object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
