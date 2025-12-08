"use client";
import { Mail, Phone, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactUs() {
  return (
    <section className="bg-gray-300 pt-10 shadow-lg relative z-10">
      <motion.div
        className="w-[80%] max-w-3xl relative top-8 mx-auto bg-gradient-to-br from-white via-gray-50 to-white p-5 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">
              Contact <span className="text-secondary bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Us</span>
            </h3>
            <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full mb-2 sm:mb-3"></div>
          </motion.div>

          <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium mb-3 sm:mb-4 px-2">
            Get in touch with us to start your project.
          </p>

          {/* Email Section */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Mail className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <a
              href="mailto:chenandahockeyfestival.official@gmail.com"
              className="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-[9px] xs:text-[10px] sm:text-xs md:text-sm break-all sm:break-normal"
            >
              chenandahockeyfestival.official@gmail.com
            </a>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="relative mb-5 sm:mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Leadership Team
            </span>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          {[
            {
              title: "Chenanda P Karumbaiah",
              role: "President",
              phone: "9480083817",
              gradient: "from-yellow-50 to-orange-50",
              iconBg: "bg-yellow-100",
              iconColor: "text-yellow-600",
              hoverBorder: "hover:border-yellow-400",
            },
            {
              title: "Chenanda Deena Chengappa",
              role: "Executive President",
              phone: "6360795699",
              gradient: "from-blue-50 to-indigo-50",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600",
              hoverBorder: "hover:border-blue-400",
            },
          ].map((contact, index) => (
            <motion.div
              key={index}
              className={`relative p-3 sm:p-4 md:p-5 bg-gradient-to-br ${contact.gradient} rounded-xl border-2 border-gray-200 ${contact.hoverBorder} transition-all duration-300 hover:shadow-xl group`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Icon */}
              <div className={`${contact.iconBg} w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                <User className={`${contact.iconColor} w-4 h-4 sm:w-5 sm:h-5`} />
              </div>

              {/* Name & Role */}
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 leading-tight">
                {contact.title}
              </h4>
              <p className="text-gray-600 text-[10px] sm:text-xs font-medium mb-2 sm:mb-3">
                {contact.role}
              </p>

              {/* Phone */}
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 group/phone"
              >
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600 group-hover/phone:text-green-600 group-hover/phone:scale-110 transition-all" />
                <span className="text-gray-700 font-semibold text-[10px] sm:text-xs md:text-sm group-hover/phone:text-green-600 transition-colors">
                  {contact.phone}
                </span>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.p
          className="text-center text-gray-500 text-[9px] xs:text-[10px] sm:text-xs mt-4 sm:mt-5 font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
        >
          Available during business hours • Response within 24 hours
        </motion.p>
      </motion.div>
    </section>
  );
}