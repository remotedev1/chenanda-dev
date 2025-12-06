"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  Shield,
  Lock,
  ChevronDown,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  CheckCircle2,
  ArrowLeft,
  Info,
} from "lucide-react";

const Payment = () => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const events = [
    {
      id: 1,
      name: "Men's 7s Tournament",
      date: "Dec 15, 2025",
      time: "9:00 AM",
      venue: "Stadium A",
      price: 1200,
      icon: "🏑",
    },
    {
      id: 2,
      name: "Women's 5s League",
      date: "Dec 16, 2025",
      time: "11:00 AM",
      venue: "Stadium B",
      price: 1000,
      icon: "🏑",
    },
    {
      id: 3,
      name: "Junior Championship",
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
      name: "Skills Development",
      date: "Dec 19, 2025",
      time: "3:00 PM",
      venue: "Training Area",
      price: 500,
      icon: "🎯",
    },
    {
      id: 6,
      name: "Penalty Shootout Championship",
      date: "Dec 20, 2025",
      time: "5:00 PM",
      venue: "Stadium B",
      price: 600,
      icon: "🔥",
    },
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const calculateTotal = () => {
    if (!selectedEvent) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = selectedEvent.price;
    const tax = subtotal * 0.18;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    const pricing = calculateTotal();

    try {
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(pricing.total * 100),
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            eventId: selectedEvent.id,
            eventName: selectedEvent.name,
          },
        }),
      });

      const order = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Field Hockey Championship",
        description: selectedEvent.name,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              setPaymentStatus("success");
              setShowConfetti(true);
              setCurrentStep(2);
              setTimeout(() => setShowConfetti(false), 3000);
            } else {
              setPaymentStatus("failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            setPaymentStatus("failed");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setIsProcessing(false);
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
      setPaymentStatus("failed");
    }
  };

  const handleProceedToPayment = () => {
    if (selectedEventId) {
      setCurrentStep(1);
    }
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setDropdownOpen(false);
    setCurrentStep(0);
    setPaymentStatus("idle");
  };

  const handleBackToEvents = () => {
    setCurrentStep(0);
    setPaymentStatus("idle");
  };

  const pricing = calculateTotal();

  const paymentMethods = [
    { icon: <CreditCard size={20} />, name: "Credit/Debit Card" },
    { icon: <Smartphone size={20} />, name: "UPI" },
    { icon: <Building2 size={20} />, name: "Net Banking" },
    { icon: <Wallet size={20} />, name: "Wallets" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"][
                  Math.floor(Math.random() * 4)
                ],
                animation: `fall ${1 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-3xl">🏑</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Field Hockey Championship 2026
          </h1>
          <p className="text-slate-600">Secure event registration & payment</p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="text-green-600" size={18} />
          <span className="text-sm text-slate-600 font-medium">
            Secured by 256-bit encryption
          </span>
          <Lock className="text-slate-400" size={14} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl  border border-slate-200">
          {currentStep === 0 && (
            <>
              {/* Event Selection */}
              <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-indigo-50 to-white">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Select Your Event
                </h2>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:border-indigo-400 transition-all duration-200 shadow-sm"
                  >
                    <span className="text-lg font-medium text-slate-700">
                      {selectedEvent
                        ? `${selectedEvent.icon} ${selectedEvent.name}`
                        : "Choose an event to register"}
                    </span>
                    <ChevronDown
                      className={`text-slate-400 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      size={24}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl overflow-visible z-20 shadow-2xl">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleSelectEvent(event.id)}
                          className={`w-full p-5 text-left hover:bg-indigo-50 transition-all duration-150 border-b border-slate-100 last:border-b-0 ${
                            selectedEventId === event.id ? "bg-indigo-50" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">{event.icon}</span>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {event.name}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">
                                  {event.date} • {event.time} • {event.venue}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-indigo-600">
                                ₹{event.price}
                              </div>
                              <div className="text-xs text-slate-500">+ GST</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Event Details */}
              {selectedEvent && (
                <div className="p-8">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                          {selectedEvent.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            📅 {selectedEvent.date}
                          </span>
                          <span className="flex items-center gap-1">
                            ⏰ {selectedEvent.time}
                          </span>
                          <span className="flex items-center gap-1">
                            📍 {selectedEvent.venue}
                          </span>
                        </div>
                      </div>
                      <span className="text-4xl">{selectedEvent.icon}</span>
                    </div>

                    <div className="bg-white rounded-xl p-4 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600">Registration Fee</span>
                        <span className="font-semibold text-slate-900">
                          ₹{pricing.subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200">
                        <span className="text-slate-600 text-sm">
                          GST (18%)
                        </span>
                        <span className="text-slate-600 text-sm">
                          ₹{pricing.tax.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-lg">
                          Total Amount
                        </span>
                        <span className="font-bold text-indigo-600 text-2xl">
                          ₹{pricing.total.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToPayment}
                      className="w-full mt-6 bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <Lock size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === 1 && selectedEvent && (
            <>
              {/* Payment Step */}
              <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-green-50 to-white">
                <button
                  onClick={handleBackToEvents}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium">Back to events</span>
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Complete Your Payment
                </h2>
                <p className="text-slate-600 text-sm">
                  Choose your preferred payment method
                </p>
              </div>

              <div className="p-8">
                {/* Order Summary */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Info size={18} className="text-indigo-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{selectedEvent.name}</span>
                      <span className="font-medium text-slate-900">
                        ₹{pricing.subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">GST (18%)</span>
                      <span className="text-slate-600">
                        ₹{pricing.tax.toFixed(0)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-300 flex justify-between">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-bold text-indigo-600 text-xl">
                        ₹{pricing.total.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Payment Methods Accepted
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl"
                      >
                        <div className="text-indigo-600">{method.icon}</div>
                        <span className="text-sm font-medium text-slate-700">
                          {method.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="text-green-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-green-900 text-sm mb-1">
                        Your payment is 100% secure
                      </h4>
                      <p className="text-green-700 text-xs leading-relaxed">
                        We use industry-standard 256-bit SSL encryption. Your
                        payment information is encrypted and never stored on our
                        servers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-5 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Pay ₹{pricing.total.toFixed(0)} Securely
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 mt-4">
                  Powered by Razorpay • Trusted by millions
                </p>
              </div>
            </>
          )}

          {currentStep === 2 && paymentStatus === "success" && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle2 className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Payment Successful!
              </h2>
              <p className="text-slate-600 mb-6">
                Your registration for <strong>{selectedEvent.name}</strong> is
                confirmed
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Registration Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Event</span>
                    <span className="font-medium text-slate-900">
                      {selectedEvent.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date & Time</span>
                    <span className="font-medium text-slate-900">
                      {selectedEvent.date}, {selectedEvent.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Venue</span>
                    <span className="font-medium text-slate-900">
                      {selectedEvent.venue}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-300">
                    <span className="text-slate-600">Amount Paid</span>
                    <span className="font-bold text-green-600">
                      ₹{pricing.total.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
                <p className="text-sm text-blue-900">
                  📧 A confirmation email with your ticket has been sent to your
                  registered email address
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedEventId(null);
                  setCurrentStep(0);
                  setPaymentStatus("idle");
                }}
                className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200"
              >
                Register for Another Event
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact support@fieldhockey.com
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Payment;