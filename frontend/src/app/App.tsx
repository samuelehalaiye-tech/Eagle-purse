import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { initializePWA } from "./utils/pwa";
import { AuthProvider } from "../context/AuthContext";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Dashboard } from "./components/Dashboard";
import { ExpenseLogger } from "./components/ExpenseLogger";
import { CoachChat } from "./components/CoachChat";
import { MealPlan } from "./components/MealPlan";
import { WhatIfSimulator } from "./components/WhatIfSimulator";
import { Settings } from "./components/Settings";
import { Layout } from "./components/Layout";
import { NotFound } from "./components/NotFound";

export default function App() {
  useEffect(() => {
    initializePWA();
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (prefersDark ? "dark" : "light");
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="log-expense" element={<ExpenseLogger />} />
          <Route path="coach" element={<CoachChat />} />
          <Route path="meal-plan" element={<MealPlan />} />
          <Route path="simulator" element={<WhatIfSimulator />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
