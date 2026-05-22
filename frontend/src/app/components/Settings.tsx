import { useState, useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { getProfile, updateProfile, resetAllExpenses } from "../../services/api";

export function Settings() {
  const [allowance, setAllowance] = useState("");
  const [allowancePeriod, setAllowancePeriod] = useState("monthly");
  const [feedingBudget, setFeedingBudget] = useState("");

  const [dietaryPref, setDietaryPref] = useState("");
  const [mealTimes, setMealTimes] = useState<string[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const profileResponse = await getProfile();
      if (profileResponse?.profile) {
        const profile = profileResponse.profile;
        setAllowance(profile.monthly_allowance?.toString() ?? "");
        setAllowancePeriod(profile.allowance_period ?? "monthly");
        setFeedingBudget(profile.feeding_budget?.toString() ?? "");
        setDietaryPref(profile.dietary_pref ?? "");
        if (profile.meal_times) {
          setMealTimes(profile.meal_times);
        } else if (profile.meals_per_day !== undefined) {
          // Fallback if meal_times isn't set yet for old users
          const fallback = [];
          if (profile.meals_per_day >= 1) fallback.push("lunch");
          if (profile.meals_per_day >= 2) fallback.push("dinner");
          if (profile.meals_per_day >= 3) fallback.unshift("breakfast");
          if (profile.meals_per_day >= 4) fallback.push("snack");
          setMealTimes(fallback);
        }
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    const payload = {
      monthly_allowance: parseFloat(allowance),
      allowance_period: allowancePeriod,
      feeding_budget: parseFloat(feedingBudget),
      dietary_pref: dietaryPref,
      meal_times: mealTimes,
      meals_per_day: mealTimes.length,
    };

    const result = await updateProfile(payload);
    if (result) {
      alert("Budget updated successfully!");
    } else {
      alert("Unable to update profile. Please try again.");
    }
  };

  const handleExport = () => {
    alert("Exporting monthly report...");
  };

  const handleResetAllExpenses = async () => {
    const confirmed = window.confirm(
      "This will permanently delete all your logged expenses. Are you sure?"
    );
    if (!confirmed) return;
    try {
      const result = await resetAllExpenses();
      if (result?.success) {
        alert(result.message || "All expenses cleared.");
        window.dispatchEvent(new Event("budgetUpdated"));
      } else {
        alert("Failed to reset expenses. Please try again.");
      }
    } catch (err) {
      alert("An error occurred while resetting expenses. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      <div className="p-4 md:p-6 lg:p-8 pb-4 bg-gradient-to-b from-[#0B6623]/10 to-transparent">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Manage your preferences</p>
      </div>

      <div className="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 shadow-lg space-y-4">
          <h3 className="text-lg text-foreground mb-2">Budget Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="allowance-edit" className="text-sm">
              {allowancePeriod === 'weekly' ? 'Weekly' : allowancePeriod === 'bi-weekly' ? 'Bi-weekly' : 'Monthly'} Allowance (₦)
            </Label>
            <input
              id="allowance-edit"
              type="number"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period-edit" className="text-sm">
              Allowance Period
            </Label>
            <select
              id="period-edit"
              value={allowancePeriod}
              onChange={(e) => setAllowancePeriod(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feeding-edit" className="text-sm">
              Feeding Budget (₦)
            </Label>
            <input
              id="feeding-edit"
              type="number"
              value={feedingBudget}
              onChange={(e) => setFeedingBudget(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary-edit" className="text-sm">
              Dietary Preference
            </Label>
            <input
              id="dietary-edit"
              type="text"
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm block">Meal Times</Label>
            <div className="flex flex-wrap gap-3 mt-1">
              {["breakfast", "lunch", "dinner", "snack"].map((time) => (
                <label key={time} className="flex items-center gap-2 cursor-pointer bg-background border border-border px-3 py-2 rounded-xl">
                  <input
                    type="checkbox"
                    checked={mealTimes.includes(time)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMealTimes(prev => [...prev, time]);
                      } else {
                        setMealTimes(prev => prev.filter(t => t !== time));
                      }
                    }}
                    className="w-4 h-4 text-[#0B6623] rounded focus:ring-[#0B6623]"
                  />
                  <span className="text-sm capitalize">{time}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm block">Meals Per Day (read-only)</Label>
            <input
              type="text"
              value={`${mealTimes.length} meals selected`}
              disabled
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-border rounded-2xl cursor-not-allowed text-muted-foreground font-medium"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#FFD700] text-[#1F2937] rounded-2xl hover:bg-[#FFD700]/90 transition-colors shadow-lg"
          >
            Save Changes
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 shadow-lg space-y-4">
          <h3 className="text-lg text-foreground mb-2">Reports</h3>
          <p className="text-sm text-muted-foreground">Report export coming soon.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900/50 border-2 border-[#EF4444]/30 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            <h3 className="text-lg text-[#EF4444]">Danger Zone</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            This action is irreversible. All your logged expenses will be permanently deleted.
          </p>
          <button
            onClick={handleResetAllExpenses}
            className="w-full py-3 border-2 border-[#EF4444] text-[#EF4444] rounded-2xl hover:bg-[#EF4444]/10 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Reset All Expenses
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 shadow-lg space-y-3">
          <h3 className="text-lg text-foreground mb-2">About</h3>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campus</span>
              <span>Bingham University</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 pb-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#0B6623] to-[#0B6623]/80 rounded-full flex items-center justify-center shadow-lg mb-3">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#FFD700]" fill="currentColor">
              <path d="M12 2L4 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5zm0 10.5l-3.5 2.1.9-4-3.1-2.7 4.1-.4L12 3.5l1.6 3.9 4.1.4-3.1 2.7.9 4-3.5-2.1z"/>
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">EaglePurse - Your Financial Wingman</p>
        </div>
      </div>
    </div>
  );
}
