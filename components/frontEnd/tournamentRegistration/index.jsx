"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Phone, Check } from "lucide-react";
import { toast } from "sonner";

export function TournamentRegistration({ tournamentId, tournamentName }) {
  const [step, setStep] = useState("phone"); // phone, otp, user-details, family, games
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userHasFamily, setUserHasFamily] = useState(false);
  const [loading, setLoading] = useState(false);

  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [familySearch, setFamilySearch] = useState("");

  const [games, setGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const router = useRouter();

  // Fetch families when search changes
  useEffect(() => {
    if (step === "family") {
      fetchFamilies();
    }
  }, [familySearch, step]);

  // Fetch games when family is selected
  useEffect(() => {
    if (step === "games") {
      fetchGames();
    }
  }, [step]);

  const fetchFamilies = async () => {
    try {
      const res = await fetch(`/api/families/list?search=${familySearch}`);
      const data = await res.json();
      if (data.success) {
        setFamilies(data.data?.families || []);
      }
    } catch (err) {
      console.error("Failed to fetch families:", err);
      toast.error("Failed to load families");
    }
  };

  const fetchGames = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/games?isActive=true`);
      const data = await res.json();
      if (data.success) {
        setGames(data.data?.games || []);
      }
    } catch (err) {
      console.error("Failed to fetch games:", err);
      toast.error("Failed to load games");
    }
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/tournament/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (data.success) {
        setIsExistingUser(data.isExistingUser);
        setUserHasFamily(data.userHasFamily);
        setStep("otp");
        toast.success("OTP sent successfully");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPAndProceed = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: otp }),
      });

      const data = await res.json();

      if (data.success) {
        // Determine next step
        if (isExistingUser && userHasFamily) {
          setStep("games");
        } else if (isExistingUser && !userHasFamily) {
          setStep("family");
        } else {
          setStep("user-details");
        }
        toast.success("OTP verified");
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const submitUserDetails = (e) => {
    e.preventDefault();
    setStep("family");
  };

  const selectFamily = (e) => {
    e.preventDefault();
    if (!selectedFamilyId) {
      toast.error("Please select a family");
      return;
    }
    setStep("games");
  };

  const toggleGameSelection = (gameId) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const completeRegistration = async (e) => {
    e.preventDefault();

    if (selectedGames.length === 0) {
      toast.error("Please select at least one game");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/tournament/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          otp,
          tournamentId,
          familyId: selectedFamilyId,
          userData: !isExistingUser ? userData : undefined,
          gameRegistrations: selectedGames,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Sign in using NextAuth
        const signInResult = await signIn("credentials", {
          phoneNumber,
          userId: data.userId,
          redirect: false,
        });

        if (signInResult?.ok) {
          toast.success("Registration completed successfully!");
          router.push(
            `/tournaments/${tournamentId}/confirmation?participationId=${data.participationId}`
          );
        } else {
          toast.error("Authentication failed");
        }
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getTotalFee = () => {
    return selectedGames.reduce((total, gameId) => {
      const game = games.find((g) => g.id === gameId);
      return total + (game?.registrationFee || 0);
    }, 0);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Tournament Registration</CardTitle>
          <CardDescription>{tournamentName}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <StepIndicator
                active={step === "phone"}
                completed={["otp", "user-details", "family", "games"].includes(step)}
              >
                Phone
              </StepIndicator>
              <StepLine completed={["otp", "user-details", "family", "games"].includes(step)} />
              <StepIndicator
                active={step === "otp"}
                completed={["user-details", "family", "games"].includes(step)}
              >
                Verify
              </StepIndicator>
              {!isExistingUser && (
                <>
                  <StepLine completed={["user-details", "family", "games"].includes(step)} />
                  <StepIndicator
                    active={step === "user-details"}
                    completed={["family", "games"].includes(step)}
                  >
                    Details
                  </StepIndicator>
                </>
              )}
              <StepLine completed={["family", "games"].includes(step)} />
              <StepIndicator active={step === "family"} completed={step === "games"}>
                Family
              </StepIndicator>
              <StepLine completed={step === "games"} />
              <StepIndicator active={step === "games"}>
                Games
              </StepIndicator>
            </div>
          </div>

          {/* Step 1: Phone Number */}
          {step === "phone" && (
            <form onSubmit={sendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+911234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter number with country code (e.g., +91 for India)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Phone className="mr-2 h-4 w-4" />
                Send OTP
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={verifyOTPAndProceed} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP sent to {phoneNumber}</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                Change Number
              </Button>
            </form>
          )}

          {/* Step 3: User Details */}
          {step === "user-details" && !isExistingUser && (
            <form onSubmit={submitUserDetails} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={userData.firstName}
                  onChange={(e) =>
                    setUserData({ ...userData, firstName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={userData.lastName}
                  onChange={(e) =>
                    setUserData({ ...userData, lastName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          )}

          {/* Step 4: Family Selection */}
          {step === "family" && (
            <form onSubmit={selectFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familySearch">Search and Select Your Family *</Label>
                <Input
                  id="familySearch"
                  type="text"
                  placeholder="Search family name..."
                  value={familySearch}
                  onChange={(e) => setFamilySearch(e.target.value)}
                />
              </div>

              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <RadioGroup value={selectedFamilyId} onValueChange={setSelectedFamilyId}>
                  {families.map((family) => (
                    <div
                      key={family.id}
                      className={`flex items-center space-x-3 p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted ${
                        selectedFamilyId === family.id ? "bg-muted" : ""
                      }`}
                    >
                      <RadioGroupItem value={family.id} id={family.id} />
                      <Label htmlFor={family.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{family.familyName}</div>
                        {family.description && (
                          <div className="text-sm text-muted-foreground">
                            {family.description}
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {families.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No families found
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={!selectedFamilyId}>
                Continue
              </Button>
            </form>
          )}

          {/* Step 5: Game Selection */}
          {step === "games" && (
            <form onSubmit={completeRegistration} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Games to Register *</Label>
                <div className="space-y-2">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedGames.includes(game.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => toggleGameSelection(game.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedGames.includes(game.id)}
                              onChange={() => toggleGameSelection(game.id)}
                              className="h-4 w-4"
                            />
                            <div>
                              <div className="font-medium">{game.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {game.format} • {game.category}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{game.registrationFee}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(game.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {games.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No active games available
                    </div>
                  )}
                </div>
              </div>

              {selectedGames.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Registration Fee:</span>
                    <span className="text-2xl font-bold">₹{getTotalFee()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedGames.length} game{selectedGames.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || selectedGames.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepIndicator({ active, completed, children }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
        w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition
        ${completed ? "bg-primary text-primary-foreground" : ""}
        ${active && !completed ? "bg-primary text-primary-foreground" : ""}
        ${!active && !completed ? "bg-muted text-muted-foreground" : ""}
      `}
      >
        {completed ? <Check className="h-5 w-5" /> : null}
      </div>
      <span className="text-xs mt-1 text-center">{children}</span>
    </div>
  );
}

function StepLine({ completed }) {
  return (
    <div className="flex-1 h-1 bg-muted mx-2">
      <div
        className={`h-full bg-primary transition-all ${
          completed ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}