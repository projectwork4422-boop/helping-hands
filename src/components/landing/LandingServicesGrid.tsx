"use client";

import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function LandingServicesGrid({ activeServices }: { activeServices: any[] }) {
  return (
    <section id="services" className="py-24 bg-gray-50 px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Explore Services</h2>
          <p className="text-black/60">Discover our range of highly-rated professional home services.</p>
        </motion.div>
        
        {activeServices.length === 0 ? (
          <div className="text-center text-black/60 py-10">No services available right now. Check back later!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {activeServices.map((service, i) => (
              <motion.div 
                key={service.id} 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-shadow flex flex-col items-center text-center group cursor-pointer"
                onClick={() => window.location.href = `/explore`} // Guide users to explore
              >
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform overflow-hidden text-2xl shadow-sm">
                  {service.images && service.images.length > 0 ? (
                    <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    service.iconUrl || <Wrench className="w-8 h-8 text-black/40" />
                  )}
                </div>
                <div className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold mb-3 uppercase tracking-wider">
                  {service.category?.name || "Other"}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-black/70 transition-colors">{service.name}</h3>
                <p className="text-black/60 line-clamp-2 text-sm">{service.description || "Professional service delivered by verified experts."}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
