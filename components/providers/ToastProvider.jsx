"use client";

import React, { createContext, useContext } from "react";
import { toast } from "sonner";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const success = (message, description) =>
    toast.success(message, { description });

  const error = (message, description) => toast.error(message, { description });

  const info = (message, description) => toast(message, { description });

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
