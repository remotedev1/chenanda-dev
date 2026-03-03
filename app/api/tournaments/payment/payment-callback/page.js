// app/tournaments/[tournamentId]/payment-callback/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Download,
  Share2,
} from "lucide-react";

export default function PaymentCallback() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const tournamentId = params.tournamentId;
  const orderId = searchParams.get("orderId");
  const transactionId = searchParams.get("transactionId");
  const status = searchParams.get("status");

  const verifyPayment = useCallback(async () => {
    try {
      setLoading(true);

      // Verify payment status with your backend
      const response = await fetch(`/api/tournaments/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          transactionId,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus(data.status);
        setPaymentDetails(data.payment);
      } else {
        setPaymentStatus("failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  }, [orderId, transactionId, status]);

  useEffect(() => {
    if (orderId || transactionId) {
      verifyPayment();
    } else {
      // No payment info in URL
      setPaymentStatus("failed");
      setLoading(false);
    }
  }, [orderId, transactionId, verifyPayment]);

  const handleDownloadReceipt = useCallback(async () => {
    if (!paymentDetails) return;

    try {
      const response = await fetch(
        `/api/tournaments/payment/receipt/${paymentDetails.id}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentDetails.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Receipt download error:", error);
    }
  }, [paymentDetails]);

  const handleShare = useCallback(async () => {
    if (!paymentDetails) return;

    const shareData = {
      title: "Tournament Registration Confirmed",
      text: `Successfully registered for tournament! Transaction ID: ${paymentDetails.transactionId}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Tournament Registration Confirmed\nTransaction ID: ${paymentDetails.transactionId}`,
      );
    }
  }, [paymentDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl shadow-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-slate-600">
              Please wait while we confirm your payment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-2xl border-0 overflow-hidden">
        <CardContent className="p-0">
          {/* Success */}
          {paymentStatus === "success" || paymentStatus === "COMPLETED" ? (
            <div className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-lg text-slate-600">
                  Your tournament registration is confirmed
                </p>
              </div>

              {paymentDetails && (
                <div className="space-y-6">
                  {/* Payment Details */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">
                          Transaction ID
                        </span>
                        <span className="font-bold text-slate-900">
                          {paymentDetails.transactionId || transactionId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">
                          Amount Paid
                        </span>
                        <span className="font-bold text-green-600 text-xl">
                          ₹{paymentDetails.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">
                          Family Name
                        </span>
                        <span className="font-semibold text-slate-900">
                          {paymentDetails.familyName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">
                          Games Registered
                        </span>
                        <span className="font-semibold text-slate-900">
                          {paymentDetails.gameCount || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="font-bold text-slate-900 mb-3">
                      What&apos;s Next?
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>
                          Confirmation email sent to your registered email
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>SMS confirmation sent to your mobile number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span>
                          Check your dashboard for tournament schedule and
                          details
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      className="w-full h-12 gap-2 border-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Receipt
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="w-full h-12 gap-2 border-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>

                  <Button
                    onClick={() => router.push(`/tournaments/${tournamentId}`)}
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Back to Tournament
                  </Button>
                </div>
              )}
            </div>
          ) : paymentStatus === "pending" || paymentStatus === "PROCESSING" ? (
            /* Pending */
            <div className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                  <Clock className="h-12 w-12 text-yellow-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Payment Pending
                </h1>
                <p className="text-lg text-slate-600">
                  Your payment is being processed
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
                <p className="text-sm text-slate-700 mb-4">
                  Your payment is currently being verified by the payment
                  gateway. This usually takes a few minutes.
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Transaction ID:</strong> {transactionId || orderId}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={verifyPayment}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Check Status Again
                </Button>
                <Button
                  onClick={() => router.push(`/tournaments/${tournamentId}`)}
                  variant="outline"
                  className="w-full h-12 border-2"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Tournament
                </Button>
              </div>
            </div>
          ) : (
            /* Failed */
            <div className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Payment Failed
                </h1>
                <p className="text-lg text-slate-600">
                  Unfortunately, your payment could not be processed
                </p>
              </div>

              <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">
                  What went wrong?
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>Payment was cancelled or declined</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>Insufficient balance in your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>Technical issue with payment gateway</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() =>
                    router.push(`/tournaments/${tournamentId}/register`)
                  }
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push(`/tournaments/${tournamentId}`)}
                  variant="outline"
                  className="w-full h-12 border-2"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Tournament
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
