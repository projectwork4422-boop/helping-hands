"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function LandingStats() {
  const stats = [
    { value: "10,000+", label: "Total Customers" },
    { value: "25,000+", label: "Services Completed" },
    { value: "500+", label: "Active Providers" },
    { value: "4.9/5", label: "Average Rating" },
  ];

  return (
    <section className="py-24 bg-black text-white px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-white/10">
          {stats.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="px-4">
              <div className="text-4xl md:text-5xl font-black mb-2">{s.value}</div>
              <div className="text-sm font-bold text-white/50 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingSuccessStories() {
  const stories = [
    { title: "A Complete Home Renovation", desc: "How John completely transformed his living space with our top carpenters and painters.", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop" },
    { title: "Emergency Plumbing Fix", desc: "When Sarah had a pipe burst at 2 AM, our experts were there within 30 minutes.", img: "https://images.unsplash.com/photo-1585728748176-455ac5eed962?q=80&w=600&auto=format&fit=crop" },
    { title: "Lighting Up The Holidays", desc: "The Smith family enjoyed a perfectly installed outdoor lighting setup just in time for Christmas.", img: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=600&auto=format&fit=crop" },
  ];

  return (
    <section className="py-24 bg-white px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Success Stories</h2>
            <p className="text-black/60 max-w-xl">Read how we've helped homeowners just like you achieve peace of mind.</p>
          </motion.div>
          <motion.button initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="px-6 py-3 bg-gray-100 font-bold rounded-full hover:bg-gray-200 transition-colors">
            View All Stories
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-black/70 transition-colors">{s.title}</h3>
              <p className="text-black/60 text-sm line-clamp-2">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingFAQ() {
  const faqs = [
    { q: "How do I book a service?", a: "Simply browse our catalog, select your desired service, pick an available date and time, and click 'Book Now'. You can manage all your bookings from your dashboard." },
    { q: "How are professionals verified?", a: "Every professional undergoes a rigorous multi-step background check, skill verification, and must maintain high ratings from customers to remain active on our platform." },
    { q: "Can I cancel my booking?", a: "Yes, you can cancel your booking up to 24 hours in advance without any penalty through your Client Portal." },
    { q: "What payment methods are supported?", a: "We support all major credit cards, PayPal, and Apple/Google Pay through our secure encrypted payment gateway." },
    { q: "How can I become a service provider?", a: "Click on 'Become a Provider' in our header, fill out your details, upload your qualifications, and our team will get in touch with you shortly." },
  ];
  
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-gray-50 px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-black/60">Got questions? We've got answers.</p>
        </motion.div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-5 font-bold flex items-center justify-between focus:outline-none"
              >
                <span>{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-5 h-5 text-black/40" /> : <ChevronDown className="w-5 h-5 text-black/40" />}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-black/60 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingCTA() {
  return (
    <section className="py-24 bg-white px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-black text-white rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Ready to transform your home?</h2>
            <p className="text-lg text-white/60 mb-10">Whether you need an urgent repair or a complete renovation, our experts are just a few clicks away.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/explore" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                Book a Service Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login-selection" className="w-full sm:w-auto px-8 py-4 bg-black text-white font-bold rounded-full border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center">
                Register as a Provider
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
