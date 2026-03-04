"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const REASON_MAP = {
  FAILED: "Your payment was declined by the bank or UPI provider.",
  PENDING: "Your payment is still being processed. Please check back shortly.",
  EXPIRED: "The payment session timed out. Please try again.",
  CANCELLED: "You cancelled the payment.",
  undefined: "Something went wrong during payment processing.",
  null: "Something went wrong during payment processing.",
};

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const { tournamentId } = useParams();
  const txnId = searchParams.get("txnId");
  const reason = searchParams.get("reason");
  const reasonText =
    REASON_MAP[reason] || `Payment ${reason?.toLowerCase() || "failed"}.`;
  const isPending = reason === "PENDING";

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={styles.root}
      className="mt-20p
    "
    >
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div
        style={{
          ...styles.card,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Icon */}
        <div style={styles.iconWrap}>
          {isPending ? (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#d97706" opacity="0.12" />
              <circle cx="20" cy="20" r="14" fill="#d97706" opacity="0.2" />
              <circle cx="20" cy="20" r="9" fill="#d97706" />
              <path
                d="M20 13v7l4 4"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#dc2626" opacity="0.12" />
              <circle cx="20" cy="20" r="14" fill="#dc2626" opacity="0.2" />
              <circle cx="20" cy="20" r="9" fill="#dc2626" />
              <path
                d="M15.5 15.5L24.5 24.5M24.5 15.5L15.5 24.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <p
          style={{
            ...styles.eyebrow,
            color: isPending ? "#d97706" : "#dc2626",
          }}
        >
          {isPending ? "Payment Pending" : "Payment Failed"}
        </p>
        <h1 style={styles.heading}>
          {isPending ? "Awaiting confirmation" : "Something went wrong"}
        </h1>
        <p style={styles.subtext}>{reasonText}</p>

        {/* Details */}
        {txnId && (
          <div style={styles.detailsGrid}>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Transaction ID</span>
              <span style={styles.detailVal}>{txnId}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Status</span>
              <span
                style={{
                  ...styles.detailVal,
                  color: isPending ? "#fbbf24" : "#f87171",
                  fontWeight: 700,
                }}
              >
                {isPending ? "⏳ Pending" : "✗ Failed"}
              </span>
            </div>
            {reason && (
              <div style={styles.detailRow}>
                <span style={styles.detailKey}>Reason</span>
                <span style={styles.detailVal}>{reason}</span>
              </div>
            )}
          </div>
        )}

        {/* Help note */}
        <div style={styles.helpBox}>
          <p style={styles.helpText}>
            {isPending
              ? "If money was deducted, it will be auto-refunded within 5–7 business days."
              : "No money has been deducted. You can safely retry your payment."}
          </p>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <Link href="/payment" style={styles.btnPrimary}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: 8 }}
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
            </svg>
            Try Again
          </Link>
          <Link href="/" style={styles.btnSecondary}>
            go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0f1a",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    top: "-100px",
    right: "-80px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-80px",
    left: "-60px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(185,28,28,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "480px",
    backdropFilter: "blur(20px)",
    boxShadow:
      "0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#f9fafb",
    lineHeight: 1.2,
    marginBottom: "10px",
  },
  subtext: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  detailsGrid: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "4px 0",
    marginBottom: "16px",
    textAlign: "left",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "11px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  detailKey: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    fontWeight: 500,
  },
  detailVal: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 600,
    textAlign: "right",
    maxWidth: "65%",
    wordBreak: "break-all",
  },
  helpBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "24px",
  },
  helpText: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    lineHeight: 1.6,
    margin: 0,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dc2626",
    color: "white",
    padding: "13px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
  },
  btnSecondary: {
    display: "block",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.8)",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
  },
  btnGhost: {
    display: "block",
    color: "rgba(255,255,255,0.3)",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    textDecoration: "none",
  },
};
