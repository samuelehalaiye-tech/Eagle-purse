import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, PlusCircle, MessageCircle, Utensils, Settings as SettingsIcon, Sun, Moon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const isOnboarding = false;

  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const currentTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", currentTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (auth.token === null && !["/login", "/signup"].includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [auth.token, location.pathname, navigate]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      localStorage.setItem("theme", nextTheme);
    }
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/log-expense", icon: PlusCircle, label: "Log Expense" },
    { path: "/coach", icon: MessageCircle, label: "Coach" },
    { path: "/meal-plan", icon: Utensils, label: "Meal Plan" },
    { path: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Desktop Sidebar */}
      {!isOnboarding && (
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-900/50 flex-shrink-0">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-secondary" fill="currentColor">
                  <path d="M12 2L4 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5zm0 10.5l-3.5 2.1.9-4-3.1-2.7 4.1-.4L12 3.5l1.6 3.9 4.1.4-3.1 2.7.9 4-3.5-2.1z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400 font-semibold">EaglePurse</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Financial Wingman</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <li key={path}>
                    <button
                      onClick={() => navigate(path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-[#0B6623] dark:bg-emerald-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-4 border-t border-border space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
              </motion.div>
              <span className="text-sm">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </motion.button>
            <button
              onClick={() => {
                auth.logout();
                navigate("/login", { replace: true });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-2xl hover:brightness-110 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign out</span>
            </button>
            <p className="text-xs text-muted-foreground text-center">v1.0.0 - Bingham University</p>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-[375px] md:max-w-none mx-auto w-full lg:max-w-7xl">
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile/Tablet Bottom Navigation */}
        {!isOnboarding && (
          <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] md:max-w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/50 z-50">
            <div className="flex justify-between items-center h-16 px-2">
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.button>
                <button
                  onClick={() => {
                    auth.logout();
                    navigate("/login", { replace: true });
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-2xl bg-destructive text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-around items-center flex-1 gap-1">
                {navItems.map(({ path, icon: Icon, label }) => {
                  const isActive = location.pathname === path;
                  return (
                    <motion.button
                      key={path}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate(path)}
                      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors relative ${
                        isActive ? "text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] md:text-xs">{label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

