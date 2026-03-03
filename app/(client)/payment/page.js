"use client";

import {
  useState,
  useMemo,
  useCallback,
  useReducer,
  useRef,
  useEffect,
} from "react";
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
  Shield,
  Plus,
  Trash2,
  UserPlus,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useTournaments } from "@/hooks/useTournament";
import { useFamilies } from "@/hooks/useFamily";
import { useGames } from "@/hooks/useTournamentGame";
import { useBatchCreatePlayers } from "@/hooks/usePlayer";

// Optimized state reducer to minimize re-renders
const initialState = {
  step: "registration", // registration, players, games, payment
  selectedFamilyId: "",
  registrationDetails: {
    name: "",
    email: "",
    phone: "",
    address: "",
  },
  players: [],
  selectedGames: [],
  existingPlayers: [],
  paymentMethod: "upi",
};

function formReducer(state, action) {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SELECT_FAMILY":
      return { ...state, selectedFamilyId: action.payload };
    case "UPDATE_REGISTRATION":
      return {
        ...state,
        registrationDetails: {
          ...state.registrationDetails,
          ...action.payload,
        },
      };
    case "SET_PLAYERS":
      return { ...state, players: action.payload };
    case "ADD_PLAYER":
      return {
        ...state,
        players: [
          ...state.players,
          { id: Date.now(), name: "", jersey: "", position: "" },
        ],
      };
    case "SET_EXISTING_PLAYERS":
      return { ...state, existingPlayers: action.payload };
    case "UPDATE_PLAYER":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.data } : p,
        ),
      };
    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
      };
    case "TOGGLE_GAME":
      return {
        ...state,
        selectedGames: state.selectedGames.includes(action.payload)
          ? state.selectedGames.filter((id) => id !== action.payload)
          : [...state.selectedGames, action.payload],
      };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function TournamentPayment() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [familySearch, setFamilySearch] = useState("");
  const searchTimeoutRef = useRef(null);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingPlayerData, setEditingPlayerData] = useState({});
  const { tournamentId } = useParams();
  const router = useRouter();

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.step]);

  const handleSearchChange = useCallback((value) => {
    setFamilySearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  // Optimized hooks with minimal re-renders
  const { tournaments, loading: tournamentLoading } = useTournaments();
  const { families, loading: familiesLoading } = useFamilies(debouncedSearch);

  const selectedTournamentId = useMemo(
    () => tournaments?.[0]?.id || tournamentId,
    [tournaments, tournamentId],
  );

  const { games, loading: gamesLoading } = useGames({
    tournamentId: selectedTournamentId,
  });

  const { batchCreatePlayers, creating: creatingPlayers } =
    useBatchCreatePlayers();

  useEffect(() => {
    const fetchExistingPlayers = async () => {
      if (state.selectedFamilyId) {
        dispatch({
          type: "SET_EXISTING_PLAYERS",
          payload:
            families.find((f) => f.id === state.selectedFamilyId)?.players ||
            [],
        });
      } else {
        dispatch({ type: "SET_EXISTING_PLAYERS", payload: [] });
      }
    };
    fetchExistingPlayers();
  }, [state.selectedFamilyId]);

  const handleUpdateExistingPlayer = useCallback(
    async (playerId) => {
      try {
        const response = await fetch(`/api/players/${playerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingPlayerData),
        });
        const data = await response.json();
        if (data.success) {
          dispatch({
            type: "SET_EXISTING_PLAYERS",
            payload: state.existingPlayers.map((p) =>
              p.id === playerId ? { ...p, ...editingPlayerData } : p,
            ),
          });
          setEditingPlayerId(null);
          toast.success("Player updated!");
        } else {
          toast.error("Failed to update player");
        }
      } catch (err) {
        toast.error("Error updating player");
      }
    },
    [editingPlayerData, state.existingPlayers, dispatch],
  );

  // Memoized computed values
  const gamesById = useMemo(() => {
    const map = new Map();
    games?.forEach((g) => map.set(g.id, g));
    return map;
  }, [games]);

  const selectedGamesSet = useMemo(
    () => new Set(state.selectedGames),
    [state.selectedGames],
  );

  const totalAmount = useMemo(() => {
    return state.selectedGames.reduce((total, gameId) => {
      const game = gamesById.get(gameId);
      return total + (game?.registrationFee || 0);
    }, 0);
  }, [state.selectedGames, gamesById]);

  const selectedFamily = useMemo(
    () => families.find((f) => f.id === state.selectedFamilyId),
    [families, state.selectedFamilyId],
  );

  // Optimized handlers with useCallback
  const handleSelectFamily = useCallback(
    (e) => {
      e.preventDefault();
      if (!state.selectedFamilyId) {
        toast.error("Please select a family");
        return;
      }
      dispatch({ type: "SET_STEP", payload: "registration" });
    },
    [state.selectedFamilyId],
  );

  const handleRegistrationSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const { name, phone, address } = state.registrationDetails;

      if (!name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!phone.trim()) {
        toast.error("Phone number is required");
        return;
      }
      if (!address.trim()) {
        toast.error("Address is required");
        return;
      }

      // Initialize with one empty player
      if (state.players.length === 0) {
        dispatch({
          type: "SET_PLAYERS",
          payload: [{ id: Date.now(), name: "", jersey: "", position: "" }],
        });
      }

      dispatch({ type: "SET_STEP", payload: "players" });
    },
    [state.registrationDetails, state.players.length],
  );

  const handleAddPlayer = useCallback(() => {
    dispatch({ type: "ADD_PLAYER" });
  }, []);

  const handleUpdatePlayer = useCallback((id, field, value) => {
    dispatch({
      type: "UPDATE_PLAYER",
      payload: { id, data: { [field]: value } },
    });
  }, []);

  const handleRemovePlayer = useCallback(
    (id) => {
      if (state.players.length === 1) {
        toast.error("At least one player is required");
        return;
      }
      dispatch({ type: "REMOVE_PLAYER", payload: id });
    },
    [state.players.length],
  );

  const handlePlayersSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate all players have required fields
      const validPlayers = state.players.filter(
        (p) => p.name.trim() && p.jersey.trim() && p.position.trim(),
      );

      if (validPlayers.length === 0) {
        toast.error(
          "Please add at least one complete player (name, jersey, position)",
        );
        return;
      }

      if (validPlayers.length !== state.players.length) {
        toast.error(
          "Please complete all player details or remove incomplete entries",
        );
        return;
      }

      try {
        // Batch save players
        const playersData = validPlayers.map((p) => ({
          familyId: state.selectedFamilyId,
          playerName: p.name,
          jerseyNumber: p.jersey,
          position: p.position,
        }));

        await batchCreatePlayers(playersData);
        dispatch({ type: "SET_STEP", payload: "games" });
      } catch (error) {
        console.error("Error saving players:", error);
        // Error already shown by hook
      }
    },
    [state.players, state.selectedFamilyId, batchCreatePlayers],
  );

  const handleToggleGame = useCallback((gameId) => {
    dispatch({ type: "TOGGLE_GAME", payload: gameId });
  }, []);

  const handleProceedToPayment = useCallback(
    (e) => {
      e.preventDefault();
      if (state.selectedGames.length === 0) {
        toast.error("Please select at least one game");
        return;
      }
      dispatch({ type: "SET_STEP", payload: "payment" });
    },
    [state.selectedGames.length],
  );

  const handleProcessPayment = useCallback(
    async (e) => {
      e.preventDefault();
      setProcessingPayment(true);

      try {
        const paymentData = {
          tournamentId: selectedTournamentId,
          familyId: state.selectedFamilyId,
          gameIds: state.selectedGames,
          registrationDetails: state.registrationDetails,
          amount: totalAmount,
          paymentMethod: state.paymentMethod,
        };

        // UPIGATEWAY.com integration
        const response = await fetch(
          "/api/tournaments/payment/upigateway/initiate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
          },
        );

        const data = await response.json();

        if (data.success) {
          if (data.paymentUrl) {
            // Redirect to UPIGATEWAY payment page
            window.location.href = data.paymentUrl;
          } else {
            toast.success("Payment initiated successfully!");
            router.push(
              `/tournaments/${selectedTournamentId}/payment-confirmation?paymentId=${data.paymentId}`,
            );
          }
        } else {
          toast.error(data.error || "Payment initiation failed");
        }
      } catch (error) {
        console.error("Payment error:", error);
        toast.error("Something went wrong with payment");
      } finally {
        setProcessingPayment(false);
      }
    },
    [
      selectedTournamentId,
      state.selectedFamilyId,
      state.selectedGames,
      state.registrationDetails,
      totalAmount,
      state.paymentMethod,
      router,
    ],
  );

  const handleBack = useCallback(() => {
    const steps = ["registration", "players", "games", "payment"];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      dispatch({ type: "SET_STEP", payload: steps[currentIndex - 1] });
    }
  }, [state.step]);

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

        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
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

        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-0">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-8">
              <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
                <StepIndicator
                  icon={Users}
                  active={state.step === "registration"}
                  completed={["players", "games", "payment"].includes(
                    state.step,
                  )}
                  stepNumber={1}
                >
                  Register
                </StepIndicator>
                <StepLine
                  completed={["players", "games", "payment"].includes(
                    state.step,
                  )}
                />
                <StepIndicator
                  icon={UserPlus}
                  active={state.step === "players"}
                  completed={["games", "payment"].includes(state.step)}
                  stepNumber={2}
                >
                  Players
                </StepIndicator>
                <StepLine
                  completed={["games", "payment"].includes(state.step)}
                />
                <StepIndicator
                  icon={Trophy}
                  active={state.step === "games"}
                  completed={state.step === "payment"}
                  stepNumber={3}
                >
                  Games
                </StepIndicator>
                <StepLine completed={state.step === "payment"} />
                <StepIndicator
                  icon={CreditCard}
                  active={state.step === "payment"}
                  stepNumber={4}
                >
                  Payment
                </StepIndicator>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {/* Step 1: Registration */}
              {state.step === "registration" && (
                <RegistrationStep
                  state={state}
                  dispatch={dispatch}
                  families={families}
                  familiesLoading={familiesLoading}
                  familySearch={familySearch}
                  onSearchChange={handleSearchChange}
                  onSubmit={handleRegistrationSubmit}
                  selectedFamily={selectedFamily}
                />
              )}

              {/* Step 2: Players */}
              {state.step === "players" && (
                <PlayersStep
                  state={state}
                  selectedFamily={selectedFamily}
                  onAddPlayer={handleAddPlayer}
                  onUpdatePlayer={handleUpdatePlayer}
                  onRemovePlayer={handleRemovePlayer}
                  onSubmit={handlePlayersSubmit}
                  onBack={handleBack}
                  creatingPlayers={creatingPlayers}
                  editingPlayerId={editingPlayerId}
                  editingPlayerData={editingPlayerData}
                  setEditingPlayerId={setEditingPlayerId}
                  setEditingPlayerData={setEditingPlayerData}
                  onUpdateExistingPlayer={handleUpdateExistingPlayer}
                />
              )}

              {/* Step 3: Games */}
              {state.step === "games" && (
                <GamesStep
                  state={state}
                  selectedFamily={selectedFamily}
                  games={games}
                  gamesLoading={gamesLoading}
                  gamesById={gamesById}
                  selectedGamesSet={selectedGamesSet}
                  totalAmount={totalAmount}
                  onToggleGame={handleToggleGame}
                  onSubmit={handleProceedToPayment}
                  onBack={handleBack}
                />
              )}

              {/* Step 4: Payment */}
              {state.step === "payment" && (
                <PaymentStep
                  state={state}
                  dispatch={dispatch}
                  selectedFamily={selectedFamily}
                  gamesById={gamesById}
                  totalAmount={totalAmount}
                  onSubmit={handleProcessPayment}
                  onBack={handleBack}
                  processingPayment={processingPayment}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step Components
function RegistrationStep({
  state,
  dispatch,
  families,
  familiesLoading,
  familySearch,
  onSearchChange,
  onSubmit,
  selectedFamily,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-slide-in-up">
      {/* Family Selection */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold text-slate-900">
          Select Your Family *
        </Label>
        {!familiesLoading && families.length > 6 && (
          <div className="text-sm text-slate-600 text-center mt-2">
            Showing 6 of {families.length} families. Use search to find more.
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search family name..."
            value={familySearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-base border-2 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="border-2 border-slate-200 rounded-xl max-h-64 overflow-y-auto bg-slate-50/50">
        {familiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <RadioGroup
            value={state.selectedFamilyId}
            onValueChange={(value) =>
              dispatch({ type: "SELECT_FAMILY", payload: value })
            }
          >
            {families.slice(0, 6).map((family) => (
              <div
                key={family.id}
                className={`flex items-center space-x-4 p-5 border-b last:border-b-0 cursor-pointer hover:bg-indigo-50 transition-all ${
                  state.selectedFamilyId === family.id
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-600"
                    : ""
                }`}
                onClick={() =>
                  dispatch({ type: "SELECT_FAMILY", payload: family.id })
                }
              >
                <RadioGroupItem
                  value={family.id}
                  id={family.id}
                  className="border-2"
                />
                <Label htmlFor={family.id} className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900 text-lg">
                    {family.familyName}
                  </div>
                  {family.description && (
                    <div className="text-sm text-slate-600 mt-1">
                      {family.description}
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
            <p className="font-medium">No families found</p>
          </div>
        )}
      </div>

      {/* Registration Details */}
      {state.selectedFamilyId && (
        <div className="space-y-6 animate-slide-in-up">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">
                  Selected Family
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {selectedFamily?.familyName}
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
                value={state.registrationDetails.name}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_REGISTRATION",
                    payload: { name: e.target.value },
                  })
                }
                className="h-12 text-base border-2 focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-base font-semibold text-slate-900"
              >
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={state.registrationDetails.phone}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_REGISTRATION",
                    payload: { phone: e.target.value },
                  })
                }
                className="h-12 text-base border-2 focus:border-indigo-500"
                required
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
                value={state.registrationDetails.email}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_REGISTRATION",
                    payload: { email: e.target.value },
                  })
                }
                className="h-12 text-base border-2 focus:border-indigo-500"
              />
            </div>

            {/* <div className="space-y-2">
              <Label
                htmlFor="pattedharaName"
                className="text-base font-medium text-slate-700"
              >
                Pattedhara Name
              </Label>
              <Input
                id="pattedharaName"
                type="text"
                placeholder="Enter pattedhara name"
                value={state.registrationDetails.pattedharaName}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_REGISTRATION",
                    payload: { pattedharaName: e.target.value },
                  })
                }
                className="h-12 text-base border-2 focus:border-indigo-500"
              />
            </div> */}

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
                value={state.registrationDetails.address}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_REGISTRATION",
                    payload: { address: e.target.value },
                  })
                }
                rows={3}
                className="text-base border-2 focus:border-indigo-500 resize-none"
                required
              />
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
        disabled={!state.selectedFamilyId}
      >
        Continue to Add Players
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}

function PlayersStep({
  state,
  selectedFamily,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onSubmit,
  onBack,
  editingPlayerId,
  creatingPlayers,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-slide-in-up">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-600">Family</div>
            <div className="text-xl font-bold text-slate-900">
              {selectedFamily?.familyName}
            </div>
          </div>
        </div>
      </div>
      {state.existingPlayers && state.existingPlayers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <Label className="text-lg font-bold text-slate-900">
              Registered Players ({state.existingPlayers.length})
            </Label>
          </div>
          <div className="space-y-3">
            {state.existingPlayers.map((player, index) => {
              const isEditing = editingPlayerId === player.id;
              return (
                <div
                  key={player.id || index}
                  className={`p-4 border-2 rounded-xl transition-all ${isEditing ? "border-indigo-400 bg-indigo-50" : "border-green-200 bg-green-50"}`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Name</Label>
                          <Input
                            value={
                              editingPlayerData.playerName ?? player.playerName
                            }
                            onChange={(e) =>
                              setEditingPlayerData((d) => ({
                                ...d,
                                playerName: e.target.value,
                              }))
                            }
                            className="h-9 border-2 focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">
                            Jersey Number
                          </Label>
                          <Input
                            value={
                              editingPlayerData.jerseyNumber ??
                              player.jerseyNumber
                            }
                            onChange={(e) =>
                              setEditingPlayerData((d) => ({
                                ...d,
                                jerseyNumber: e.target.value,
                              }))
                            }
                            className="h-9 border-2 focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">
                            Position
                          </Label>
                          <Input
                            value={
                              editingPlayerData.position ?? player.position
                            }
                            onChange={(e) =>
                              setEditingPlayerData((d) => ({
                                ...d,
                                position: e.target.value,
                              }))
                            }
                            className="h-9 border-2 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPlayerId(null);
                            setEditingPlayerData({});
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => onUpdateExistingPlayer(player.id)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="grid gap-3 md:grid-cols-3 flex-1">
                        <div>
                          <div className="text-xs font-medium text-slate-600 mb-1">
                            Name
                          </div>
                          <div className="font-semibold text-slate-900">
                            {player.playerName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-600 mb-1">
                            Jersey Number
                          </div>
                          <div className="font-semibold text-slate-900">
                            {player.jerseyNumber}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-600 mb-1">
                            Position
                          </div>
                          <div className="font-semibold text-slate-900">
                            {player.position}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex-shrink-0"
                        onClick={() => {
                          setEditingPlayerId(player.id);
                          setEditingPlayerData({});
                        }}
                      >
                        {/* Pencil icon — add to your lucide imports: Pencil */}
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-indigo-600" />
            Add Players *
          </Label>
          <Button
            type="button"
            onClick={onAddPlayer}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
        </div>

        <div className="space-y-4">
          {state.players.map((player, index) => (
            <div
              key={player.id}
              className="p-4 border-2 border-slate-200 rounded-xl bg-white hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">
                  Player {index + 1}
                </span>
                {state.players.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => onRemovePlayer(player.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Name *</Label>
                  <Input
                    type="text"
                    placeholder="Player name"
                    value={player.name}
                    onChange={(e) =>
                      onUpdatePlayer(player.id, "name", e.target.value)
                    }
                    className="h-10 border-2 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Jersey Number *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 10"
                    value={player.jersey}
                    onChange={(e) =>
                      onUpdatePlayer(player.id, "jersey", e.target.value)
                    }
                    className="h-10 border-2 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Position *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Forward"
                    value={player.position}
                    onChange={(e) =>
                      onUpdatePlayer(player.id, "position", e.target.value)
                    }
                    className="h-10 border-2 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 text-base font-semibold border-2"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
          disabled={creatingPlayers || state.players.length === 0}
        >
          {creatingPlayers ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving Players...
            </>
          ) : (
            <>
              Save & Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function GamesStep({
  state,
  selectedFamily,
  games,
  gamesLoading,
  gamesById,
  selectedGamesSet,
  totalAmount,
  onToggleGame,
  onSubmit,
  onBack,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-slide-in-up">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600">Family</div>
              <div className="font-bold text-slate-900">
                {selectedFamily?.familyName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600">Players</div>
              <div className="font-bold text-slate-900">
                {state.players.length} Added
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
            {games.map((game) => (
              <div
                key={game.id}
                className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedGamesSet.has(game.id)
                    ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-[1.02]"
                    : "border-slate-200 hover:border-indigo-300 bg-white"
                }`}
                onClick={() => onToggleGame(game.id)}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedGamesSet.has(game.id)}
                    onChange={() => onToggleGame(game.id)}
                    className="w-6 h-6 mt-1 cursor-pointer accent-indigo-600"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {game.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        <Trophy className="h-3 w-3" />
                        {game.format}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <Calendar className="h-3 w-3" />
                        {new Date(game.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
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
                <p className="font-semibold text-lg">No games available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {state.selectedGames.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm opacity-90 font-medium">Total Amount</div>
              <div className="text-base opacity-75">
                {state.selectedGames.length} game
                {state.selectedGames.length !== 1 ? "s" : ""} selected
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
          onClick={onBack}
          className="flex-1 h-12 text-base font-semibold border-2"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
          disabled={state.selectedGames.length === 0}
        >
          Continue to Payment
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}

function PaymentStep({
  state,
  dispatch,
  selectedFamily,
  gamesById,
  totalAmount,
  onSubmit,
  onBack,
  processingPayment,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-slide-in-up">
      {/* Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>

        <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-300">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">
              Family
            </div>
            <div className="font-semibold text-slate-900">
              {selectedFamily?.familyName}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">
              Contact
            </div>
            <div className="font-semibold text-slate-900">
              {state.registrationDetails.name}
            </div>
            <div className="text-sm text-slate-600">
              {state.registrationDetails.phone}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-600 mb-2">
            Selected Games
          </div>
          <div className="space-y-2">
            {state.selectedGames.map((gameId) => {
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

      {/* Payment Method - UPI Gateway */}
      <div className="space-y-3">
        <Label className="text-lg font-bold text-slate-900">
          Payment Method
        </Label>
        <div className="relative p-6 border-2 border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                UPI Payment Gateway
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Secure
                </span>
              </div>
              <div className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-600" />
                Powered by UPIGATEWAY.com
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <p className="font-semibold mb-1">Secure UPI Payment</p>
              <p className="text-indigo-700">
                You&apos;ll be redirected to UPIGATEWAY.com&apos;s secure
                payment page. Pay using any UPI app (Google Pay, PhonePe, Paytm,
                etc.). All transactions are encrypted and safe.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className="p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm opacity-90 font-medium mb-1">
              Total Amount
            </div>
            <div className="text-xs opacity-75">
              {state.selectedGames.length} game
              {state.selectedGames.length !== 1 ? "s" : ""}
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

      {/* Terms */}
      <div className="text-xs text-slate-600 space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="flex items-start gap-2">
          <span className="text-indigo-600 mt-0.5">•</span>
          Registration fees are non-refundable once payment is processed
        </p>
        <p className="flex items-start gap-2">
          <span className="text-indigo-600 mt-0.5">•</span>
          Please ensure all details are correct before proceeding
        </p>
        <p className="flex items-start gap-2">
          <span className="text-indigo-600 mt-0.5">•</span>
          You will receive a confirmation email/SMS after successful payment
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-14 text-base font-semibold border-2"
          disabled={processingPayment}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 h-14 text-base font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl transition-all"
          disabled={processingPayment}
        >
          {processingPayment ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Smartphone className="mr-2 h-5 w-5" />
              Pay ₹{totalAmount.toLocaleString()} via UPI
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Helper Components
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
