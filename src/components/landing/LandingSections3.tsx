"use client";

import { motion } from "framer-motion";
import { Star, Mail, Search, Calendar, UserCheck, MapPin, MessageSquareText } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function LandingProcess() {
  const steps = [
    { icon: <Search className="w-8 h-8" />, title: "Search Service", desc: "Find the exact service you need from our extensive catalog." },
    { icon: <Calendar className="w-8 h-8" />, title: "Book Service", desc: "Select a convenient date and time for the job." },
    { icon: <UserCheck className="w-8 h-8" />, title: "Employee Assignment", desc: "We assign a verified, highly-rated professional to your request." },
    { icon: <MapPin className="w-8 h-8" />, title: "Service at Doorstep", desc: "The expert arrives on time and completes the job perfectly." },
    { icon: <MessageSquareText className="w-8 h-8" />, title: "Payment & Feedback", desc: "Pay securely online and rate your experience." },
  ];

  return (
    <section className="py-24 bg-white px-6 border-b border-gray-100 overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Our Process</h2>
          <p className="text-black/60">From booking to completion, everything is seamless.</p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row items-center justify-between relative">
          <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
          {steps.map((step, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="relative z-10 flex flex-col items-center text-center max-w-[200px] mb-12 md:mb-0 group">
              <div className="w-20 h-20 bg-white rounded-full border-4 border-gray-100 flex items-center justify-center text-black mb-6 group-hover:border-black transition-colors shadow-lg">
                {step.icon}
              </div>
              <h4 className="font-bold mb-2">{step.title}</h4>
              <p className="text-xs text-black/60">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingReviews() {
  const reviews = [
    { name: "Sarah Jenkins", role: "Homeowner", review: "The plumber arrived exactly on time and fixed the leak under my sink in less than an hour. Absolutely fantastic service!", rating: 5 },
    { name: "Michael Chang", role: "Property Manager", review: "I use Helping Hands for all my rental properties. The verified professionals make my job so much easier.", rating: 5 },
    { name: "Emily Rodriguez", role: "Homeowner", review: "Booking was a breeze, and the electrician was very polite and explained everything clearly. Highly recommended.", rating: 5 },
  ];

  return (
    <section className="py-24 bg-gray-50 px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Customer Reviews</h2>
          <p className="text-black/60">Don't just take our word for it.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative">
              <div className="flex text-yellow-400 mb-6">
                {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg font-medium mb-8">"{r.review}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-lg">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{r.name}</div>
                  <div className="text-xs text-black/40 uppercase font-bold tracking-wider">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer id="contact" className="bg-gray-50 pt-20 pb-10 px-6 border-t border-gray-200">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-black tracking-tight block mb-6">
              Helping Hands.
            </Link>
            <p className="text-black/60 mb-6 max-w-sm">
              Your trusted platform for premium home services. We connect you with verified professionals instantly.
            </p>
            {/* Newsletter Subscription */}
            <div className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input type="email" placeholder="Enter your email" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <button className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-black/80 transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-wider text-sm">Services</h4>
            <ul className="space-y-4 text-black/60 text-sm">
              <li><Link href="/explore" className="hover:text-black transition-colors">Plumbing</Link></li>
              <li><Link href="/explore" className="hover:text-black transition-colors">Electrical</Link></li>
              <li><Link href="/explore" className="hover:text-black transition-colors">Carpentry</Link></li>
              <li><Link href="/explore" className="hover:text-black transition-colors">Cleaning</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 text-black/60 text-sm">
              <li><Link href="/about" className="hover:text-black transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-black transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-black transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-wider text-sm">Contact</h4>
            <ul className="space-y-4 text-black/60 text-sm">
              <li>1-800-HELPING</li>
              <li>support@helpinghands.com</li>
              <li>123 Service Ave, Suite 100<br/>New York, NY 10001</li>
              <li className="text-black font-bold">Mon-Fri: 8am - 8pm</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-black/40">
          <p>© {new Date().getFullYear()} Helping Hands. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-black transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-black transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-black transition-colors">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
