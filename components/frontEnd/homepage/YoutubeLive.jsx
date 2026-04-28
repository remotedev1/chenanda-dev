import React from 'react'

const YoutubeLive = ({
  href = "https://www.youtube.com/live/YOUR_STREAM_ID",
}) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 mt-7"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
    >
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          background: "#ff0000",
          border: "none",
          borderRadius: 6,
          padding: "12px 28px",
          textDecoration: "none",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(255,0,0,0.2)",
        }}
        whileHover={{ scale: 1.04, boxShadow: "0 6px 24px rgba(255,0,0,0.35)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 17,
              letterSpacing: 2,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            Watch Live on YouTube
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.8)",
              letterSpacing: 1,
            }}
          >
            youtube.com · Live Stream
          </span>
        </div>
        <div
          style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}
        >
          <motion.span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#fff",
            }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        </div>
      </motion.a>
    </motion.div>
  );
})
export default YoutubeLive