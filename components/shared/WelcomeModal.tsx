"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const STORAGE_KEY = "vault_welcome_seen_v2";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal only if the user hasn't seen it before
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so the landing page renders first
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Modal centering wrapper */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 350,
              mass: 0.9,
            }}
            style={{
              pointerEvents: "auto",
              width: "min(92vw, 480px)",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background:
                "linear-gradient(165deg, var(--surface) 0%, var(--background) 100%)",
              boxShadow:
                "0 25px 60px rgba(0, 0, 0, 0.35), 0 0 80px color-mix(in srgb, var(--accent) 15%, transparent)",
              overflow: "hidden",
            }}
          >
            {/* Decorative top gradient bar */}
            <div
              style={{
                height: 4,
                background:
                  "linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--found) 70%, var(--accent)), var(--found))",
              }}
            />

            {/* Content */}
            <div style={{ padding: "32px 28px 28px" }}>
              {/* Greeting icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                  delay: 0.15,
                }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, var(--accent-soft), color-mix(in srgb, var(--accent) 20%, transparent))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.75rem",
                  marginBottom: 20,
                  border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                }}
              >
                👋
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                  marginBottom: 6,
                  lineHeight: 1.25,
                }}
              >
                Hey VITians!{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent), var(--found))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Welcome to Vault
                </span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.4 }}
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  marginBottom: 18,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                A message from the creator
              </motion.p>

              {/* Message body */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.45 }}
                style={{
                  padding: "18px 20px",
                  borderRadius: 14,
                  backgroundColor:
                    "color-mix(in srgb, var(--background-elevated) 60%, var(--surface))",
                  border: "1px solid var(--border)",
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: 1.75,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  Hello everyone! I tried implementing and making the
                  ineffective lost and found process{" "}
                  <strong style={{ color: "var(--accent)", fontWeight: 700 }}>
                    one step more secure
                  </strong>{" "}
                  by creating this app. Please register at the application and
                  give it a try, I truly hope you like it and find it useful.
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: 14,
                    marginBottom: 0,
                    textAlign: "right",
                    fontStyle: "italic",
                  }}
                >
                  — Lakshay, Creator of Vault
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClose}
                style={{
                  width: "100%",
                  padding: "13px 24px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "white",
                  background:
                    "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--found) 60%, var(--accent)))",
                  boxShadow:
                    "0 4px 16px color-mix(in srgb, var(--accent) 35%, transparent)",
                  letterSpacing: "-0.01em",
                  transition: "box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.boxShadow =
                    "0 6px 24px color-mix(in srgb, var(--accent) 50%, transparent)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.boxShadow =
                    "0 4px 16px color-mix(in srgb, var(--accent) 35%, transparent)";
                }}
              >
                Let&apos;s Explore Vault 🚀
              </motion.button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
