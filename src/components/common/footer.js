"use client";
import Link from "next/link";
import {
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  ArrowUpRightIcon,
  FacebookIcon,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-fashion text-white pt-20 pb-10 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand Identity */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="inline-block group">
              <h2 className="font-display text-4xl font-black tracking-tighter uppercase italic">
                AJEBO<span className="text-rush">RUSH</span>
              </h2>
            </Link>
            <p className="font-sans text-white/50 text-lg max-w-sm leading-relaxed">
              Premium West African soul meeting American hustle. The US
              destination for gourmet catering and luxury afro-wear.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                className="p-3 bg-white/5 rounded-full hover:bg-rush hover:scale-110 transition-all"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-3 bg-white/5 rounded-full hover:bg-rush hover:scale-110 transition-all"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-rush mb-6 text-sm">
              Explore
            </h4>
            <ul className="space-y-4 font-sans font-medium text-white/70">
              <li>
                <Link
                  href="/catering"
                  className="hover:text-white transition-colors"
                >
                  Jellof Digest
                </Link>
              </li>
              <li>
                <Link
                  href="/fashion"
                  className="hover:text-white transition-colors"
                >
                  ART Wear
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-rush mb-6 text-sm">
              Contact Us
            </h4>
            <ul className="space-y-4 font-sans text-white/70 text-sm">
              <li className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-rush shrink-0" />
                <span>
                  Dallas-Fort Worth <br /> Metropolitan Area, TX
                </span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-rush shrink-0" />
                <a
                  href="tel:+18172989961"
                  className="hover:text-white transition-colors"
                >
                  +1 (817) 298-9961
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Legal and Credits */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-sans text-white/30 text-xs uppercase tracking-widest">
              &copy; {currentYear} AJEBORUSH. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Powered By: HIGH-ER ENTERPRISES signature */}
          <div className="group">
            <a
              href="https://higher.com.ng"
              target="_blank"
              className="flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors"
            >
              Built by
              <span className="text-white font-black group-hover:text-rush transition-colors">
                HIGH-ER ENTERPRISES
              </span>
              <ArrowUpRightIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
