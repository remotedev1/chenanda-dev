"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import {
  Loader2,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Trophy,
  Users,
  Calendar,
  IndianRupee,
  Smartphone,
  Building2,
  Wallet,
  Banknote,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useTournaments } from "@/hooks/useTournament";
import { useFamilies } from "@/hooks/useFamily";
import { useGames } from "@/hooks/useTournamentGame";

export default function TournamentPayment() {
  const [step, setStep] = useState("family"); // family, contact, games, payment
  const [processingPayment, setProcessingPayment] = useState(false);

  // Search state
  const [familySearch, setFamilySearch] = useState("");

  const { tournamentId } = useParams();

  // Form state
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedGames, setSelectedGames] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    primaryContact: "",
    secondaryContact: "",
    email: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("phonepe");

  const router = useRouter();

  // Custom hooks
  const { tournaments, loading: tournamentLoading } = useTournaments();
  const { families, loading: familiesLoading } = useFamilies(familySearch);

  const selectedTournamentId = useMemo(() => {
    return tournaments?.[0]?.id || tournamentId;
  }, [tournaments, tournamentId]);

  const { games, loading: gamesLoading } = useGames({
    tournamentId: selectedTournamentId,
  });

  const normalizeContactName = (value) => {
    if (typeof value !== "string") return "";
    return value.replace(/^\s*chenanda\s*[-–—:|]?\s*/i, "").trimStart();
  };

  const selectFamily = (e) => {
    e.preventDefault();
    if (!selectedFamilyId) {
      toast.error("Please select a family");
      return;
    }

    const selectedFamily = families.find((f) => f.id === selectedFamilyId);
    if (selectedFamily) {
      setContactDetails((prev) => ({
        ...prev,
        name:
          normalizeContactName(prev.name) ||
          normalizeContactName(selectedFamily.familyName || "") ||
          "",
      }));
    }

    setStep("contact");
  };

  const submitContactDetails = (e) => {
    e.preventDefault();

    const name = normalizeContactName(contactDetails.name).trim();
    const primaryContact = contactDetails.primaryContact.trim();
    const address = contactDetails.address.trim();

    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (!primaryContact) {
      toast.error("Primary contact is required");
      return;
    }
    if (!address) {
      toast.error("Address is required");
      return;
    }

    if (name !== contactDetails.name) {
      setContactDetails((prev) => ({ ...prev, name }));
    }

    setStep("games");
  };

  const toggleGameSelection = (gameId) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId],
    );
  };

  const proceedToPayment = (e) => {
    e.preventDefault();

    if (selectedGames.length === 0) {
      toast.error("Please select at least one game");
      return;
    }

    setStep("payment");
  };

  const processPayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      // PhonePe payment flow
      if (paymentMethod === "phonepe") {
        const res = await fetch("/api/tournaments/payment/phonepe/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournamentId,
            familyId: selectedFamilyId,
            gameIds: selectedGames,
            contactDetails,
            amount: totalAmount,
          }),
        });

        const data = await res.json();

        if (data.success) {
          // Redirect to PhonePe payment page
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
          } else {
            toast.error("PhonePe redirect URL not received");
          }
        } else {
          toast.error(data.error || "PhonePe payment initiation failed");
        }
      } else {
        // Generic payment processing
        const res = await fetch("/api/tournaments/payment/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournamentId,
            familyId: selectedFamilyId,
            gameIds: selectedGames,
            contactDetails,
            paymentMethod,
            amount: totalAmount,
          }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Payment processed successfully!");

          if (data.paymentGatewayUrl) {
            window.location.href = data.paymentGatewayUrl;
          } else {
            router.push(
              `/tournaments/${tournamentId}/payment-confirmation?paymentId=${data.paymentId}`,
            );
          }
        } else {
          toast.error(data.error || "Payment processing failed");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong with payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const gamesById = useMemo(() => {
    const map = new Map();
    for (const g of games || []) map.set(g.id, g);
    return map;
  }, [games]);

  const selectedGamesSet = useMemo(() => new Set(selectedGames), [selectedGames]);

  const totalAmount = useMemo(() => {
    return selectedGames.reduce((total, gameId) => {
      const game = gamesById.get(gameId);
      return total + (game?.registrationFee || 0);
    }, 0);
  }, [selectedGames, gamesById]);

  const getSelectedFamily = () => {
    return families.find((f) => f.id === selectedFamilyId);
  };

  if (tournamentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-600 font-medium">Loading tournament...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 sm:py-12 px-3 sm:px-6 lg:px-8 mt-20">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap");

        * {
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-family: "Space Grotesk", sans-serif;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .gradient-border {
          position: relative;
          background: white;
        }

        .gradient-border::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      <div className="max-w-4xl mx-auto ">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-xl">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Tournament Registration
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            {tournaments[0]?.name || "Loading..."}
          </p>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden animate-scale-in">
          <CardContent className="p-0">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-8">
              <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
                <StepIndicator
                  icon={Users}
                  active={step === "family"}
                  completed={["contact", "games", "payment"].includes(step)}
                  stepNumber={1}
                >
                  Family
                </StepIndicator>
                <StepLine
                  completed={["contact", "games", "payment"].includes(step)}
                />
                <StepIndicator
                  icon={Users}
                  active={step === "contact"}
                  completed={["games", "payment"].includes(step)}
                  stepNumber={2}
                >
                  Contact
                </StepIndicator>
                <StepLine completed={["games", "payment"].includes(step)} />
                <StepIndicator
                  icon={Trophy}
                  active={step === "games"}
                  completed={step === "payment"}
                  stepNumber={3}
                >
                  Games
                </StepIndicator>
                <StepLine completed={step === "payment"} />
                <StepIndicator
                  icon={CreditCard}
                  active={step === "payment"}
                  stepNumber={4}
                >
                  Payment
                </StepIndicator>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {/* Step 1: Family Selection */}
              {step === "family" && (
                <form
                  onSubmit={selectFamily}
                  className="space-y-6 animate-slide-in-up"
                >
                  <div className="space-y-3">
                    <Label
                      htmlFor="familySearch"
                      className="text-lg font-semibold text-slate-900"
                    >
                      Select Your Family *
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="familySearch"
                        type="text"
                        placeholder="Search family name..."
                        value={familySearch}
                        onChange={(e) => setFamilySearch(e.target.value)}
                        className="pl-10 h-12 text-base border-2 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-slate-200 rounded-xl max-h-96 overflow-y-auto bg-slate-50/50">
                    {familiesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedFamilyId}
                        onValueChange={setSelectedFamilyId}
                      >
                        {families.map((family, index) => (
                          <div
                            key={family.id}
                            className={`flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 border-b last:border-b-0 cursor-pointer hover:bg-indigo-50 transition-all duration-200 ${
                              selectedFamilyId === family.id
                                ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-600"
                                : ""
                            }`}
                            onClick={() => setSelectedFamilyId(family.id)}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <RadioGroupItem
                              value={family.id}
                              id={family.id}
                              className="border-2"
                            />
                            <Label
                              htmlFor={family.id}
                              className="flex-1 cursor-pointer min-w-0"
                            >
                              <div className="font-semibold text-slate-900 text-lg">
                                {family.familyName}
                              </div>
                              {family.description && (
                                <div className="text-sm text-slate-600 mt-1">
                                  {family.description}
                                </div>
                              )}
                              {family.colors && (
                                <div className="inline-flex items-center gap-2 mt-2">
                                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                    {family.colors}
                                  </span>
                                </div>
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {!familiesLoading && families.length === 0 && (
                      <div className="p-12 text-center text-slate-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        {familySearch ? (
                          <>
                            <p className="font-medium">
                              No families found matching {familySearch}
                            </p>
                            <p className="text-sm mt-2">
                              Try a different search term
                            </p>
                          </>
                        ) : (
                          <p className="font-medium">No families available</p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                    disabled={!selectedFamilyId}
                  >
                    Continue to Contact Details
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              )}

              {/* Step 2: Contact Details */}
              {step === "contact" && (
                <form
                  onSubmit={submitContactDetails}
                  className="space-y-6 animate-slide-in-up"
                >
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-600">
                          Selected Family
                        </div>
                        <div className="text-xl font-bold text-slate-900">
                          {getSelectedFamily()?.familyName}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-base font-semibold text-slate-900"
                      >
                        Contact Person Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter full name"
                        value={contactDetails.name}
                        onChange={(e) =>
                          setContactDetails((prev) => ({
                            ...prev,
                            name: normalizeContactName(e.target.value),
                          }))
                        }
                        className="h-12 text-base border-2 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="primaryContact"
                        className="text-base font-semibold text-slate-900"
                      >
                        Primary Contact *
                      </Label>
                      <Input
                        id="primaryContact"
                        type="tel"
                        inputMode="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={contactDetails.primaryContact}
                        onChange={(e) =>
                          setContactDetails((prev) => ({
                            ...prev,
                            primaryContact: e.target.value,
                          }))
                        }
                        className="h-12 text-base border-2 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="secondaryContact"
                        className="text-base font-medium text-slate-700"
                      >
                        Secondary Contact
                      </Label>
                      <Input
                        id="secondaryContact"
                        type="tel"
                        inputMode="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={contactDetails.secondaryContact}
                        onChange={(e) =>
                          setContactDetails((prev) => ({
                            ...prev,
                            secondaryContact: e.target.value,
                          }))
                        }
                        className="h-12 text-base border-2 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-base font-medium text-slate-700"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={contactDetails.email}
                        onChange={(e) =>
                          setContactDetails((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="h-12 text-base border-2 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="address"
                        className="text-base font-semibold text-slate-900"
                      >
                        Complete Address *
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Street, City, State, PIN Code"
                        value={contactDetails.address}
                        onChange={(e) =>
                          setContactDetails((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        rows={3}
                        className="text-base border-2 focus:border-indigo-500 resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("family")}
                      className="flex-1 h-12 text-base font-semibold border-2"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                    >
                      Continue to Games
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: Game Selection */}
              {step === "games" && (
                <form
                  onSubmit={proceedToPayment}
                  className="space-y-6 animate-slide-in-up"
                >
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-600">
                            Family
                          </div>
                          <div className="font-bold text-slate-900">
                            {getSelectedFamily()?.familyName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-600">
                            Contact
                          </div>
                          <div className="font-bold text-slate-900 truncate">
                            {contactDetails.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-indigo-600" />
                      Select Games to Register *
                    </Label>

                    {gamesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {games.map((game, index) => (
                          <div
                            key={game.id}
                            className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl ${
                              selectedGamesSet.has(game.id)
                                ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-[1.02]"
                                : "border-slate-200 hover:border-indigo-300 bg-white"
                            }`}
                            onClick={() => toggleGameSelection(game.id)}
                            style={{ animationDelay: `${index * 75}ms` }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedGamesSet.has(game.id)}
                                  onChange={() => toggleGameSelection(game.id)}
                                  className="w-6 h-6 cursor-pointer accent-indigo-600"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                  {game.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                    <Trophy className="h-3 w-3" />
                                    {game.format}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                    {game.category}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(game.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                      },
                                    )}
                                  </span>
                                </div>
                                {game.description && (
                                  <p className="text-sm text-slate-600 line-clamp-2">
                                    {game.description}
                                  </p>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="inline-flex items-center gap-1 text-2xl font-bold text-indigo-600">
                                  <IndianRupee className="h-6 w-6" />
                                  {game.registrationFee.toLocaleString()}
                                </div>
                                {game.maxTeams && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    Max {game.maxTeams} teams
                                  </div>
                                )}
                              </div>
                            </div>

                            {selectedGamesSet.has(game.id) && (
                              <div className="absolute top-4 right-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {games.length === 0 && (
                          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
                            <p className="font-semibold text-lg">
                              No games available
                            </p>
                            <p className="text-sm mt-2">
                              Please contact the organizers for more information
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedGames.length > 0 && (
                    <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-2xl animate-scale-in">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm opacity-90 font-medium">
                            Total Amount
                          </div>
                          <div className="text-base opacity-75">
                            {selectedGames.length} game
                            {selectedGames.length !== 1 ? "s" : ""} selected
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-4xl font-bold">
                            <IndianRupee className="h-8 w-8" />
                            {totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("contact")}
                      className="flex-1 h-12 text-base font-semibold border-2"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                      disabled={selectedGames.length === 0}
                    >
                      Continue to Payment
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 4: Payment */}
              {step === "payment" && (
                <form
                  onSubmit={processPayment}
                  className="space-y-6 animate-slide-in-up"
                >
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Order Summary
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-300">
                      <div>
                        <div className="text-xs font-medium text-slate-600 mb-1">
                          Family
                        </div>
                        <div className="font-semibold text-slate-900">
                          {getSelectedFamily()?.familyName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-600 mb-1">
                          Contact
                        </div>
                        <div className="font-semibold text-slate-900">
                          {contactDetails.name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {contactDetails.primaryContact}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-600 mb-2">
                        Selected Games
                      </div>
                      <div className="space-y-2">
                        {selectedGames.map((gameId) => {
                          const game = gamesById.get(gameId);
                          return (
                            <div
                              key={gameId}
                              className="flex justify-between items-center bg-white p-3 rounded-lg"
                            >
                              <span className="font-medium text-slate-900">
                                {game?.name}
                              </span>
                              <span className="font-bold text-indigo-600 flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                {game?.registrationFee.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="paymentMethod"
                      className="text-lg font-bold text-slate-900"
                    >
                      Select Payment Method
                    </Label>
                    <div className="grid gap-3">
                      {[
                        {
                          value: "phonepe",
                          label: "PhonePe",
                          icon: Smartphone,
                          badge: "Recommended",
                          selectedClass:
                            "border-purple-600 bg-purple-50 shadow-lg",
                          iconClass:
                            "bg-gradient-to-br from-purple-500 to-purple-600",
                        },
                        {
                          value: "upi",
                          label: "UPI",
                          icon: Smartphone,
                          selectedClass: "border-blue-600 bg-blue-50 shadow-lg",
                          iconClass:
                            "bg-gradient-to-br from-blue-500 to-blue-600",
                        },
                        {
                          value: "card",
                          label: "Credit/Debit Card",
                          icon: CreditCard,
                          selectedClass:
                            "border-indigo-600 bg-indigo-50 shadow-lg",
                          iconClass:
                            "bg-gradient-to-br from-indigo-500 to-indigo-600",
                        },
                        {
                          value: "netbanking",
                          label: "Net Banking",
                          icon: Building2,
                          selectedClass:
                            "border-green-600 bg-green-50 shadow-lg",
                          iconClass:
                            "bg-gradient-to-br from-green-500 to-green-600",
                        },
                        {
                          value: "wallet",
                          label: "Digital Wallet",
                          icon: Wallet,
                          selectedClass:
                            "border-orange-600 bg-orange-50 shadow-lg",
                          iconClass:
                            "bg-gradient-to-br from-orange-500 to-orange-600",
                        },
                        {
                          value: "cash",
                          label: "Pay at Venue",
                          icon: Banknote,
                          selectedClass:
                            "border-slate-600 bg-slate-50 shadow-lg",
                          iconClass:
                            "bg-gradient-to-br from-slate-500 to-slate-600",
                        },
                      ].map((method) => (
                        <div
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            paymentMethod === method.value
                              ? method.selectedClass
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 ${method.iconClass} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
                            >
                              <method.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                {method.label}
                                {method.badge && (
                                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    {method.badge}
                                  </span>
                                )}
                              </div>
                              {method.value === "phonepe" && (
                                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                                  <Shield className="h-3 w-3 text-green-600" />
                                  Secure & Fast Payment
                                </div>
                              )}
                            </div>
                            <input
                              type="radio"
                              checked={paymentMethod === method.value}
                              onChange={() => setPaymentMethod(method.value)}
                              className="w-5 h-5 accent-indigo-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PhonePe Info */}
                  {paymentMethod === "phonepe" && (
                    <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-purple-900">
                          <p className="font-semibold mb-1">
                            Secure PhonePe Payment
                          </p>
                          <p className="text-purple-700">
                            You&apos;ll be redirected to PhonePe&apos;s secure
                            payment gateway. All transactions are encrypted and
                            safe.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 shimmer opacity-20"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm opacity-90 font-medium mb-1">
                            Total Amount
                          </div>
                          <div className="text-xs opacity-75">
                            {selectedGames.length} game
                            {selectedGames.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-5xl font-bold">
                            <IndianRupee className="h-10 w-10" />
                            {totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="text-xs text-slate-600 space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      Registration fees are non-refundable once payment is
                      processed
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      Please ensure all details are correct before proceeding
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      You will receive a confirmation email/SMS after successful
                      payment
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("games")}
                      className="flex-1 h-14 text-base font-semibold border-2"
                      disabled={processingPayment}
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-14 text-base font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transition-all"
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          {paymentMethod === "phonepe" ? (
                            <>
                              <Smartphone className="mr-2 h-5 w-5" />
                              Pay with PhonePe
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-5 w-5" />
                              Pay ₹{totalAmount.toLocaleString()}
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepIndicator({
  icon: Icon,
  active,
  completed,
  stepNumber,
  children,
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300
          ${completed ? "bg-white text-indigo-600 shadow-xl scale-110" : ""}
          ${active && !completed ? "bg-white text-indigo-600 shadow-2xl scale-125 ring-4 ring-white/50" : ""}
          ${!active && !completed ? "bg-white/20 text-white/60" : ""}
        `}
      >
        {completed ? (
          <Check className="h-6 w-6" />
        ) : (
          <Icon className="h-6 w-6" />
        )}
        {active && !completed && (
          <div className="absolute inset-0 rounded-xl bg-white/20 animate-ping"></div>
        )}
      </div>
      <span
        className={`text-xs mt-2 text-center font-semibold transition-all hidden sm:block ${
          active ? "text-white scale-110" : "text-white/70"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function StepLine({ completed }) {
  return (
    <div className="flex-1 h-1 bg-white/20 mx-2 rounded-full overflow-hidden hidden sm:block">
      <div
        className={`h-full bg-white transition-all duration-700 ease-out ${
          completed ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}
