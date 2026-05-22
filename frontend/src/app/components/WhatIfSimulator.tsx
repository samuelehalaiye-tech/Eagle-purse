import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Check } from "lucide-react";
import { applyAutoAdjustPlan, getBudgetSummary, postAutoAdjust } from "../../services/api";

export function WhatIfSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<any>(null);
  const [adjustPlan, setAdjustPlan] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const scenarios = [
    { id: "shawarma", label: "Stop buying shawarma", savings: 4800, newDay: 28 },
    { id: "walk", label: "Walk instead of keke for 1 week", savings: 2000, newDay: 26 },
    { id: "data", label: "Cancel weekend data binge", savings: 1500, newDay: 25 },
  ];

  useEffect(() => {
    async function loadSummary() {
      const data = await getBudgetSummary();
      if (data) {
        setBudgetSummary(data);
      }
    }
    loadSummary();
    postAutoAdjust().then((plan) => plan && setAdjustPlan(plan));
  }, []);

  const handleApplyPlan = async () => {
    const limit = adjustPlan?.new_daily_limit;
    if (!limit) return;
    setApplying(true);
    const result = await applyAutoAdjustPlan(limit);
    setApplying(false);
    if (result) {
      setApplied(true);
      window.dispatchEvent(new Event("budgetUpdated"));
      const data = await getBudgetSummary();
      if (data) setBudgetSummary(data);
    }
  };

  const currentData = [
    { day: "Day 1", balance: 15000 },
    { day: "Day 5", balance: 12000 },
    { day: "Day 10", balance: 8000 },
    { day: "Day 15", balance: 4000 },
    { day: "Day 20", balance: 1000 },
    { day: "Day 22", balance: 0 },
    { day: "Day 25", balance: 0 },
    { day: "Day 30", balance: 0 },
  ];

  const getNewData = (savings: number, newDay: number) => [
    { day: "Day 1", balance: 15000 },
    { day: "Day 5", balance: 12000 + savings * 0.2 },
    { day: "Day 10", balance: 8000 + savings * 0.4 },
    { day: "Day 15", balance: 4000 + savings * 0.6 },
    { day: "Day 20", balance: 1000 + savings * 0.8 },
    { day: "Day 22", balance: savings * 0.9 },
    { day: "Day 25", balance: savings * 0.5 },
    { day: `Day ${newDay}`, balance: savings * 0.2 },
    { day: "Day 30", balance: 0 },
  ];

  const selectedScenarioData = scenarios.find((s) => s.id === selectedScenario);

  const combinedData = currentData.map((point, index) => {
    const newPoint = selectedScenarioData
      ? getNewData(selectedScenarioData.savings, selectedScenarioData.newDay)[index]
      : null;

    return {
      day: point.day,
      current: point.balance,
      new: newPoint?.balance || null,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      <div className="p-4 md:p-6 lg:p-8 pb-4 bg-gradient-to-b from-[#0B6623]/10 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400">What-If Simulator</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">See how choices impact your budget</p>
      </div>

      <div className="px-4 md:px-6 lg:px-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-4 md:p-6 shadow-sm">
          <p className="text-xs md:text-sm text-muted-foreground mb-2">Budget guidance</p>
          <p className="text-sm text-foreground">
            {budgetSummary?.recommendation_summary ?? "Loading budget guidance..."}
          </p>
        </div>

        <div>
          <h3 className="text-sm md:text-base text-muted-foreground mb-3">Try a scenario:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`w-full px-4 py-3 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedScenario === scenario.id
                    ? "bg-[#0B6623] text-white border-[#0B6623] shadow-lg"
                    : "bg-white text-foreground border-border hover:border-[#0B6623]"
                }`}
              >
                <span className="text-sm md:text-base">{scenario.label}</span>
                {selectedScenario === scenario.id && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>

        {selectedScenarioData && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 md:rounded-3xl p-4 md:p-6 shadow-lg">
              <h3 className="text-sm md:text-base text-muted-foreground mb-4">Balance Projection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Current Path"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="new"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="New Path"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl">Impact Summary</h3>
                  <p className="text-sm md:text-base opacity-90">
                    By {selectedScenarioData.label.toLowerCase()}, you save{" "}
                    <span className="font-semibold">₦{selectedScenarioData.savings.toLocaleString()}</span>.
                  </p>
                  <p className="text-sm opacity-90">
                    Feeding money now lasts until{" "}
                    <span className="font-semibold">Day {selectedScenarioData.newDay}</span> instead of Day 22.
                  </p>
                </div>
              </div>

              {adjustPlan && (
                <p className="text-sm opacity-90 mt-2">
                  Suggested daily limit: ₦{adjustPlan.new_daily_limit?.toLocaleString()}
                </p>
              )}
              <button
                type="button"
                onClick={handleApplyPlan}
                disabled={applying || !adjustPlan?.new_daily_limit}
                className="w-full mt-4 py-3 bg-white text-[#10B981] rounded-2xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {applying ? "Applying..." : applied ? "Plan Applied ✓" : "Apply Auto-Adjust Plan"}
              </button>
            </div>
          </>
        )}

        {!selectedScenarioData && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-[#0B6623]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400" />
            </div>
            <p className="text-muted-foreground">Select a scenario above to see the impact</p>
          </div>
        )}
      </div>
    </div>
  );
}
