"use client";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactUs() {
  return (
    <section className="bg-gray-300 pt-10 shadow-lg relative z-10">
      <motion.div
        className="w-[80%] max-w-4xl relative top-8 mx-auto bg-white p-10 rounded-xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <div className="text-center mb-10">
          <h3 className="text-3xl font-bold text-gray-900">
            Contact <span className="text-secondary">Us</span>
          </h3>

          <p className="text-gray-500 mt-2">
            Get in touch with us to start your project.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-6">
            {/* <div className="flex items-center gap-2 text-gray-800">
                <Phone className="text-secondary" />
                <span className="font-semibold">054654654165</span>
              </div> */}
            <div className="flex items-center gap-2 text-gray-800">
              <Mail className="text-secondary" />
              <a
                href="mailto:chenandahockeyfestival.official@gmail.com"
                className="font-semibold hover:underline hover:text-yellow-600 transition-colors text-xs"
              >
                chenandahockeyfestival.official@gmail.com
              </a>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Chenanda P Karumbaiah (President)",
              phone: "9480083817",
            },
            {
              title: "Chenanda Deena Chengappa (Exe. President)",
              phone: "6360795699",
            },
          ].map((branch, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6"
            >
              <h4 className="font-semibold text-gray-900">{branch.title}</h4>
              <a
                href={`tel:${branch.phone}`}
                className="text-gray-500 text-sm hover:underline hover:text-yellow-600 transition-colors"
              >
                {branch.phone}
              </a>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
