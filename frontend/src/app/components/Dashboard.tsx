import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Sparkles, MessageCircle, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import { getBudgetSummary, getProfile, resetCycle } from "../../services/api";
import { motion } from "framer-motion";

export function Dashboard() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [profileResponse, summary] = await Promise.all([getProfile(), getBudgetSummary()]);
    if (profileResponse?.profile) setProfile(profileResponse.profile);
    if (summary) setBudget(summary);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleBudgetUpdated = () => loadData();
    window.addEventListener("budgetUpdated", handleBudgetUpdated);
    return () => window.removeEventListener("budgetUpdated", handleBudgetUpdated);
  }, []);

  const handleResetCycle = async () => {
    const confirmed = window.confirm(
      "Start a new allowance cycle? This will clear your current expenses for this period."
    );
    if (!confirmed) return;
    setResetting(true);
    try {
      const result = await resetCycle();
      if (result?.success) {
        alert(result.message || "New allowance cycle started!");
        await loadData();
      } else {
        alert("Failed to reset cycle. Please try again.");
      }
    } catch (err) {
      alert("An error occurred while resetting. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center animate-fadeIn">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#0B6623]/30 border-t-[#0B6623] animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Could not load budget. Try signing in again.</p>
      </div>
    );
  }

  const daysLeft = budget.days_remaining ?? 0;
  const spent = budget.total_spent ?? 0;
  const feedingSpent = budget.feeding_spent ?? 0;
  const feedingBudget = profile?.feeding_budget ?? 15000;
  const feedingPercent = feedingBudget ? Math.min(100, Math.round((feedingSpent / feedingBudget) * 100)) : 0;
  const periodDays = budget.period_days ?? 30;
  const gaugeRotation = Math.min(180, ((periodDays - daysLeft) / periodDays) * 180);
  const brokeDay =
    budget.projected_broke_day !== null && budget.projected_broke_day !== undefined
      ? Math.round(budget.projected_broke_day)
      : null;
  const brokeDayText = brokeDay !== null && brokeDay !== undefined && brokeDay > 0
    ? `Day ${Math.round(brokeDay)}`
    : "now (overspent)";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fadeIn">
      <div className="p-4 md:p-6 lg:p-8 pb-4 md:pb-6 lg:pb-8 bg-gradient-to-b from-[#0B6623]/10 to-transparent dark:from-[#0B6623]/20">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <p className="text-sm md:text-base text-muted-foreground">Good afternoon,</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-[#0B6623] dark:text-emerald-400 dark:text-[#4ade80]">
              {profile?.email?.split("@")[0]?.replace(/\./g, " ") ?? "EaglePurse Student"}
            </h2>
          </div>
          <button type="button" className="w-10 h-10 md:w-12 md:h-12 bg-card rounded-full flex items-center justify-center shadow-sm border border-border">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </button>
        </div>

        {(() => {
          const monthlyAllowance = profile?.monthly_allowance || 1;
          const totalSpent = budget.total_spent ?? 0;
          const daysRemaining = budget.days_remaining ?? 0;
          const spentPercent = Math.round((totalSpent / monthlyAllowance) * 100);
          const overspentCats = budget.overspent_categories ?? [];

          return (
            <div
              className={`rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-lg mb-4 md:mb-6 ${
                budget.survival_mode || overspentCats.length > 0 || spentPercent >= 80
                  ? "bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
                  : "bg-gradient-to-br from-[#F59E0B] to-[#D97706]"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {budget.survival_mode || overspentCats.length > 0 || spentPercent >= 80 ? (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-5 h-5 flex-shrink-0" />
                  )}
                  <p className="text-sm md:text-base font-semibold">
                    You've spent {spentPercent}% of your monthly allowance with {daysRemaining} days left.
                  </p>
                </div>
                {overspentCats.length > 0 && (
                  <p className="text-xs md:text-sm font-medium bg-white/20 px-3 py-1 rounded-xl w-fit">
                    Overspent: {overspentCats.join(', ')}
                  </p>
                )}
                {(budget.survival_mode || budget.projected_broke_day !== null) && (
                  <p className="text-xs md:text-sm opacity-90 border-t border-white/20 pt-2 mt-1">
                    {budget.survival_mode
                      ? "Survival mode — switch to cheaper meals now"
                      : budget.projected_broke_day !== null
                        ? `At this rate, feeding money runs out around ${brokeDayText}`
                        : budget.recommendation_summary}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-border"
          >
            <div className="flex flex-col items-center">
              <div className="relative w-48 md:w-56 h-24 md:h-28 mb-4">
                <motion.svg 
                  viewBox="0 0 200 100" 
                  className="w-full h-full"
                  animate={daysLeft <= 7 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#FFC107" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke="currentColor"
                    className="text-muted"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (gaugeRotation / 180) * 251.2}
                  />
                </motion.svg>
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <div className="text-center">
                    <div className={`text-4xl md:text-5xl font-semibold ${daysLeft <= 7 ? "text-[#EF4444]" : "text-[#0B6623] dark:text-emerald-400 dark:text-[#4ade80]"}`}>
                      {daysLeft}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">days left</p>
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground text-center">
                Days of feeding money remaining
              </p>
              <button
                type="button"
                onClick={handleResetCycle}
                disabled={resetting}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#0B6623] dark:border-emerald-400 text-[#0B6623] dark:text-emerald-400 rounded-2xl hover:bg-[#0B6623]/5 transition-colors text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                {resetting ? 'Resetting...' : 'New Allowance'}
              </button>
            </div>
          </motion.div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border"
            >
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Spent</p>
              <p className="text-xl md:text-2xl lg:text-3xl text-foreground">₦{spent.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">This month</p>
            </motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border"
            >
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Feeding Spent</p>
              <p className="text-xl md:text-2xl lg:text-3xl text-foreground">₦{feedingSpent.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-[#EF4444] mt-1">
                {feedingPercent}% of ₦{feedingBudget.toLocaleString()}
              </p>
            </motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border md:col-span-2"
            >
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Daily burn rate</p>
              <p className="text-lg md:text-xl text-foreground">₦{budget.daily_burn_rate?.toLocaleString() ?? 0}/day</p>
              <p className="text-xs text-muted-foreground mt-2">{budget.recommendation_summary}</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 space-y-3 md:space-y-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => navigate("/meal-plan")}
            className="w-full py-3 md:py-4 bg-[#FFD700] text-[#1F2937] rounded-2xl hover:bg-[#FFD700]/90 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Sparkles className="w-5 h-5" />
            Get Today&apos;s Meal Tip
          </button>
          <button
            type="button"
            onClick={() => navigate("/coach")}
            className="w-full py-3 md:py-4 bg-card border-2 border-[#0B6623] text-[#0B6623] dark:text-emerald-400 dark:text-[#4ade80] rounded-2xl hover:bg-[#0B6623]/5 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <MessageCircle className="w-5 h-5" />
            Talk to Coach
          </button>
        </div>
      </div>
    </div>
  );
}

