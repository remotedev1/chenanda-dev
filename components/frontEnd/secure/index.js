"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  Clock,
  Copy,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const Payment = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [qrTimer, setQrTimer] = useState(300);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const events = [
    {
      id: 1,
      name: "Men's 7s",
      date: "Dec 15, 2025",
      time: "9:00 AM",
      venue: "Stadium A",
      price: 1200,
      icon: "🏑",
    },
    {
      id: 2,
      name: "Women's 5s",
      date: "Dec 16, 2025",
      time: "11:00 AM",
      venue: "Stadium B",
      price: 1000,
      icon: "🏑",
    },
    {
      id: 3,
      name: "Juniors",
      date: "Dec 17, 2025",
      time: "2:00 PM",
      venue: "Ground C",
      price: 800,
      icon: "⚡",
    },
    {
      id: 4,
      name: "Veterans League",
      date: "Dec 18, 2025",
      time: "10:00 AM",
      venue: "Stadium A",
      price: 1100,
      icon: "🎖️",
    },
    {
      id: 5,
      name: "Skill Drills",
      date: "Dec 19, 2025",
      time: "3:00 PM",
      venue: "Training Area",
      price: 500,
      icon: "🎯",
    },
    {
      id: 6,
      name: "Penalty Shootout",
      date: "Dec 20, 2025",
      time: "5:00 PM",
      venue: "Stadium B",
      price: 600,
      icon: "🔥",
    },
  ];

  const steps = ["Select Event", "Payment", "Confirmation"];

  useEffect(() => {
    if (showQR && qrTimer > 0) {
      const timer = setTimeout(() => setQrTimer(qrTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showQR, qrTimer]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const calculateTotal = () => {
    if (!selectedEvent) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = selectedEvent.price;
    const tax = subtotal * 0.18;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleProceedToPayment = () => {
    if (selectedEventId) {
      setCurrentStep(2);
      setShowQR(true);
      setQrTimer(300);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("tournament@upi");
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const simulatePayment = () => {
    setTimeout(() => {
      setPaymentStatus("success");
      setShowConfetti(true);
      setCurrentStep(3);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 3000);
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setDropdownOpen(false);
    setCurrentStep(1);
    setShowQR(false);
    setPaymentStatus("pending");
  };

  const pricing = calculateTotal();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative">
      {/* Animated Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                backgroundColor: ["#3b82f6", "#eab308", "#10b981"][
                  Math.floor(Math.random() * 3)
                ],
                animation: `fall ${1 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-yellow-300 to-green-400 text-transparent bg-clip-text">
              FIELD HOCKEY
            </span>
          </h1>
          <h2 className="text-3xl font-bold text-yellow-300">
            CHAMPIONSHIP 2026
          </h2>
          <p className="text-gray-400 mt-2">Select an event and register now</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                      currentStep >= idx
                        ? "bg-gradient-to-r from-blue-500 to-green-500 scale-110"
                        : "bg-gray-700"
                    } ${
                      currentStep === idx
                        ? "ring-4 ring-yellow-400 animate-pulse"
                        : ""
                    }`}
                  >
                    {currentStep > idx ? <Check size={20} /> : idx + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-semibold ${
                      currentStep >= idx ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                      style={{ width: currentStep > idx ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Selection Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="text-yellow-300">🏆</span>
              <span className="ml-2">Select Tournament Event</span>
            </h3>

            {/* Dropdown */}
            <div className="relative mb-8">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-gray-800/70 border-2 border-blue-500/50 rounded-xl p-4 flex items-center justify-between hover:border-blue-400 transition-all duration-300"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <span className="text-lg font-semibold">
                  {selectedEvent
                    ? `${selectedEvent.icon} ${selectedEvent.name}`
                    : "Choose an event..."}
                </span>
                <ChevronDown
                  className={`transition-transform duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  size={24}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute w-full mt-2 bg-gray-800 border-2 border-blue-500/50 rounded-xl overflow-hidden z-20 shadow-2xl"
                  style={{
                    backdropFilter: "blur(10px)",
                    animation: "slideDown 0.3s ease-out",
                  }}
                >
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event.id)}
                      className="w-full p-4 text-left hover:bg-blue-600/30 transition-all duration-200 border-b border-gray-700 last:border-b-0 flex items-center space-x-3"
                    >
                      <span className="text-2xl">{event.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{event.name}</div>
                        <div className="text-sm text-gray-400">
                          {event.date} • {event.time}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-yellow-300">
                        ₹{event.price}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Card Display */}
            {selectedEvent && (
              <div
                className="rounded-2xl p-8 border-2 border-yellow-400 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 40px rgba(234, 179, 8, 0.3)",
                  animation: "cardGlow 0.5s ease-out",
                }}
              >
                {/* Animated Background Accent */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl"
                  style={{ animation: "pulse 3s ease-in-out infinite" }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-6xl">{selectedEvent.icon}</div>
                    <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-black text-2xl">
                      ₹{selectedEvent.price}
                    </div>
                  </div>

                  <h4 className="text-4xl font-black mb-6 text-white">
                    {selectedEvent.name}
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">Date</div>
                      <div className="text-white font-semibold flex items-center">
                        <span className="mr-2">📅</span>
                        {selectedEvent.date}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-1">Time</div>
                      <div className="text-white font-semibold flex items-center">
                        <span className="mr-2">⏰</span>
                        {selectedEvent.time}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 col-span-2">
                      <div className="text-gray-400 text-sm mb-1">Venue</div>
                      <div className="text-white font-semibold flex items-center">
                        <span className="mr-2">📍</span>
                        {selectedEvent.venue}
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center">
                    <CheckCircle className="text-green-400 mr-3" size={24} />
                    <span className="text-green-300 font-semibold">
                      Event selected and ready for checkout
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div
                className="rounded-2xl p-6 border border-blue-500/30 relative overflow-hidden"
                style={{
                  background: "rgba(17, 24, 39, 0.7)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                }}
              >
                <h3 className="text-2xl font-bold mb-6 text-yellow-300">
                  Checkout
                </h3>

                {!selectedEvent ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Select an event to continue</p>
                  </div>
                ) : (
                  <>
                    {!showQR ? (
                      <>
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <span className="text-sm font-semibold">
                              {selectedEvent.name}
                            </span>
                            <span className="font-bold">
                              ₹{pricing.subtotal}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span className="flex items-center">
                              <span className="mr-2">📋</span>
                              GST (18%)
                            </span>
                            <span>₹{pricing.tax.toFixed(0)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-2xl font-bold mb-6 pt-4 border-t-2 border-yellow-400">
                          <span>Total</span>
                          <span className="text-yellow-300">
                            ₹{pricing.total.toFixed(0)}
                          </span>
                        </div>

                        <button
                          onClick={handleProceedToPayment}
                          className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                          style={{
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                            animation: "pulse-glow 2s ease-in-out infinite",
                          }}
                        >
                          <span className="relative z-10">
                            Proceed to Payment
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </>
                    ) : (
                      <div className="space-y-6">
                        {/* QR Code Section */}
                        <div className="text-center">
                          <p className="text-sm text-gray-400 mb-4 flex items-center justify-center">
                            <Clock size={16} className="mr-2" />
                            QR Valid for: {Math.floor(qrTimer / 60)}:
                            {(qrTimer % 60).toString().padStart(2, "0")}
                          </p>

                          <div className="relative inline-block">
                            <div
                              className="bg-white p-6 rounded-2xl relative"
                              style={{
                                animation: "qr-pulse 2s ease-in-out infinite",
                              }}
                            >
                              {/* Simple QR Code */}
                              <div className="w-48 h-48 relative overflow-hidden rounded-lg">
                                <div className="grid grid-cols-8 gap-1">
                                  {[...Array(64)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-5 h-5 transition-all duration-300 ${
                                        Math.random() > 0.5
                                          ? "bg-black"
                                          : "bg-white"
                                      }`}
                                      style={{
                                        animation: `qr-pixel ${
                                          0.5 + Math.random()
                                        }s ease-in-out ${
                                          Math.random() * 0.5
                                        }s infinite alternate`,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="mt-4 text-lg font-semibold text-yellow-300">
                            📱 Scan to Pay ₹{pricing.total.toFixed(0)}
                          </p>
                        </div>

                        {/* UPI Copy Button */}
                        <button
                          onClick={handleCopyUPI}
                          className="w-full py-3 rounded-xl font-semibold bg-gray-800 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-600"
                        >
                          <Copy
                            size={18}
                            className={copiedUPI ? "animate-bounce" : ""}
                          />
                          <span>
                            {copiedUPI
                              ? "UPI ID Copied!"
                              : "Copy UPI: tournament@upi"}
                          </span>
                        </button>

                        {/* Payment Status */}
                        <div className="text-center pt-4">
                          {paymentStatus === "pending" && (
                            <div className="flex items-center justify-center space-x-2 text-yellow-400">
                              <AlertCircle
                                size={20}
                                className="animate-pulse"
                              />
                              <span>Waiting for payment...</span>
                            </div>
                          )}
                          {paymentStatus === "success" && (
                            <div className="flex items-center justify-center space-x-2 text-green-400 animate-bounce">
                              <CheckCircle size={20} />
                              <span className="font-bold">
                                Payment Successful!
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Simulate Payment Button */}
                        {paymentStatus === "pending" && (
                          <button
                            onClick={simulatePayment}
                            className="w-full py-2 rounded-lg text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 transition-all duration-300"
                          >
                            [Demo: Simulate Payment]
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
        @keyframes fall {
          to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(16, 185, 129, 0.5); }
        }
        @keyframes qr-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.4);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(234, 179, 8, 0.8);
            transform: scale(1.02);
          }
        }
        @keyframes qr-pixel {
          0% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @keyframes cardGlow {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Payment;
