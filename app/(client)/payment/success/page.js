"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { tournamentId } = useParams();
  const txnId = searchParams.get("txnId");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const amountFormatted = amount
    ? `₹${(parseInt(amount) / 100).toLocaleString("en-IN")}`
    : null;

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.root} className="mt-20">
      {/* Ambient background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

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
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#16a34a" opacity="0.12" />
            <circle cx="20" cy="20" r="14" fill="#16a34a" opacity="0.2" />
            <circle cx="20" cy="20" r="9" fill="#16a34a" />
            <path
              d="M14 20.5L18 24.5L26 16"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p style={styles.eyebrow}>Payment Confirmed</p>
        <h1 style={styles.heading}>You&apos;re registered!</h1>
        <p style={styles.subtext}>
          Your tournament spot is secured. We&apos;ve received your payment
          successfully.
        </p>

        {amountFormatted && (
          <div style={styles.amountPill}>{amountFormatted} paid</div>
        )}

        {/* Details grid */}
        <div style={styles.detailsGrid}>
          {txnId && (
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Transaction ID</span>
              <span style={styles.detailVal}>{txnId}</span>
            </div>
          )}
          {orderId && orderId !== txnId && (
            <div style={styles.detailRow}>
              <span style={styles.detailKey}>Order ID</span>
              <span style={styles.detailVal}>{orderId}</span>
            </div>
          )}
          <div style={styles.detailRow}>
            <span style={styles.detailKey}>Status</span>
            <span
              style={{ ...styles.detailVal, color: "#16a34a", fontWeight: 700 }}
            >
              ✓ Successful
            </span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailKey}>Date</span>
            <span style={styles.detailVal}>
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {txnId && (
            <a
              href={`/api/tournaments/payment/phonepe/receipt?txnId=${txnId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnPrimary}
            >
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
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Receipt
            </a>
          )}

          <Link href="/" style={styles.btnGhost}>
            go home
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
    top: "-120px",
    left: "-80px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-100px",
    right: "-60px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: "600px",
    height: "300px",
    background:
      "radial-gradient(ellipse, rgba(22,163,74,0.04) 0%, transparent 70%)",
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
    color: "#16a34a",
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
    marginBottom: "20px",
  },
  amountPill: {
    display: "inline-block",
    background: "rgba(22,163,74,0.12)",
    border: "1px solid rgba(22,163,74,0.25)",
    color: "#4ade80",
    padding: "6px 18px",
    borderRadius: "100px",
    fontSize: "15px",
    fontWeight: 700,
    marginBottom: "24px",
  },
  detailsGrid: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "4px 0",
    marginBottom: "24px",
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
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#16a34a",
    color: "white",
    padding: "13px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.2s",
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
    cursor: "pointer",
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
