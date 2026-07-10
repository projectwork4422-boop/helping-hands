"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Shield, Users, Search, CalendarCheck, Home } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function LandingAbout() {
  return (
    <section id="about" className="py-24 bg-white px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-black/40 uppercase tracking-wider">About Us</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Reimagining Home Maintenance.
            </h3>
            <p className="text-lg text-black/60 leading-relaxed">
              Helping Hands was founded on a simple premise: finding reliable, skilled professionals for your home shouldn't be a chore. We thoroughly vet every provider to ensure you receive premium, hassle-free service every single time.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <h4 className="font-bold text-xl mb-2">Our Mission</h4>
                <p className="text-black/60 text-sm">To connect homeowners with the highest quality local professionals instantly.</p>
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Our Vision</h4>
                <p className="text-black/60 text-sm">To become the global standard for trust and excellence in home services.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 relative shadow-2xl">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2000&auto=format&fit=crop" alt="Professionals at work" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-xl">100%</div>
                  <div className="text-xs text-black/60 font-bold uppercase">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingHowItWorks() {
  return (
    <section className="py-24 bg-gray-50 px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-sm font-bold text-black/40 uppercase tracking-wider mb-2">How It Works</h2>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight">Simplicity at every step</h3>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 z-0"></div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative z-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-lg">1</div>
            <h4 className="text-xl font-bold mb-3">Find a Service</h4>
            <p className="text-black/60 text-sm">Browse our extensive catalog of professional services tailored for your home.</p>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }} className="relative z-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-lg">2</div>
            <h4 className="text-xl font-bold mb-3">Book & Schedule</h4>
            <p className="text-black/60 text-sm">Pick a convenient time and seamlessly book your preferred professional online.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} className="relative z-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-lg">3</div>
            <h4 className="text-xl font-bold mb-3">Relax & Enjoy</h4>
            <p className="text-black/60 text-sm">Our verified expert arrives at your doorstep to deliver premium quality service.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function LandingWhyChooseUs() {
  const reasons = [
    { icon: <Shield className="w-6 h-6" />, title: "Verified Professionals", desc: "Every provider passes rigorous background checks." },
    { icon: <CheckCircle2 className="w-6 h-6" />, title: "Affordable Pricing", desc: "Transparent, upfront pricing with no hidden fees." },
    { icon: <Users className="w-6 h-6" />, title: "Secure Payments", desc: "Your transactions are encrypted and 100% safe." },
    { icon: <Search className="w-6 h-6" />, title: "Quick Response", desc: "Get matched with professionals in record time." },
    { icon: <CalendarCheck className="w-6 h-6" />, title: "Quality Service", desc: "We guarantee the highest standards of workmanship." },
    { icon: <Home className="w-6 h-6" />, title: "Customer Satisfaction", desc: "Our 24/7 support ensures you're always happy." },
  ];

  return (
    <section className="py-24 bg-white px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Why Choose Us</h2>
          <p className="text-black/60">The core pillars that make Helping Hands the best choice.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((r, i) => (
            <motion.div 
              key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}
              className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center mb-4 text-black group-hover:scale-110 transition-transform shadow-sm">
                {r.icon}
              </div>
              <h4 className="font-bold text-lg mb-2">{r.title}</h4>
              <p className="text-black/60 text-sm">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
