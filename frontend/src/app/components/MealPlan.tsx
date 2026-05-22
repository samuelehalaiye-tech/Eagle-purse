import { useEffect, useState } from "react";
import { Sparkles, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { getMealPlan } from "../../services/api";
import { motion } from "framer-motion";

interface ComboItem {
  vendor: string;
  item: string;
  price: number;
}

interface Combo {
  name: string;
  items: ComboItem[];
  total_price: number;
  filling_score: number;
}

interface MealPlanData {
  daily_budget: number;
  meals_per_day: number;
  per_meal_budget: number;
  daily_plan: Record<string, Combo[]>;
  total_daily_cost: number;
  survival_mode: boolean;
  survival_message: string;
  message?: string;
}

export function MealPlan() {
  const [data, setData] = useState<MealPlanData | null>(null);

  useEffect(() => {
    async function loadMealPlan() {
      const result = await getMealPlan();
      if (result) {
        setData(result);
      }
    }
    loadMealPlan();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
        <div className="p-4 md:p-6 lg:p-8 pb-4 bg-gradient-to-b from-[#0B6623]/10 to-transparent">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#0B6623] dark:text-emerald-400">Daily Meal Plan</h1>
          <p className="text-sm md:text-base text-muted-foreground">Loading meal recommendations...</p>
        </div>
      </div>
    );
  }

  const getMealIcon = (mealType: string) => {
    if (mealType === "breakfast") return "🍳";
    if (mealType === "lunch") return "🍛";
    if (mealType === "dinner") return "🍲";
    if (mealType === "snack") return "🍪";
    return "🍛";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      <div className="p-4 md:p-6 lg:p-8 pb-4 bg-gradient-to-b from-[#0B6623]/10 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-[#FFD700]" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#0B6623] dark:text-emerald-400">Daily Meal Plan</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Daily Budget: ₦{data.daily_budget} | Meals: {data.meals_per_day} | Per Meal: ₦{data.per_meal_budget}
        </p>
      </div>

      <div className="px-4 md:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {data.survival_mode ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-scaleIn">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Survival Mode</h2>
            <p className="text-red-600 dark:text-red-300">{data.survival_message || data.message}</p>
          </div>
        ) : null}

        {!data.survival_mode && data.daily_plan && Object.keys(data.daily_plan).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Total Estimated Cost:</span>
            <span className="text-xl font-bold text-[#0B6623] dark:text-emerald-400">₦{data.total_daily_cost}</span>
          </div>
        )}

        {data.daily_plan && Object.entries(data.daily_plan).map(([meal_type, combos], index) => (
          <motion.div key={meal_type} className="space-y-4 animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getMealIcon(meal_type)}</span>
              <h2 className="text-2xl font-bold text-[#0B6623] dark:text-emerald-400 capitalize">{meal_type}</h2>
            </div>
            
            {!combos || combos.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Info className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm font-medium">No affordable option under ₦{data.per_meal_budget}</p>
              </div>
            ) : (
              <div className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory scrollbar-hide">
                {combos.map((combo, c_idx) => (
                  <div 
                    key={c_idx} 
                    className="min-w-[300px] w-80 bg-card rounded-2xl shadow-lg border border-border flex flex-col flex-shrink-0 snap-center hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="h-16 bg-gradient-to-br from-[#0B6623]/20 to-[#0B6623]/10 flex items-center px-4 rounded-t-2xl">
                      <span className="text-sm font-semibold text-[#0B6623] dark:text-emerald-400 uppercase tracking-wider">Option {c_idx + 1}</span>
                    </div>

                    <div className="p-5 flex flex-col flex-grow space-y-4">
                      <div>
                        <h3 className="text-lg text-foreground font-bold mb-3 leading-tight min-h-[3rem] line-clamp-2">{combo.name}</h3>
                        
                        <div className="space-y-2 mb-4">
                          {combo.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2 max-w-[70%]">
                                <span className="text-muted-foreground">•</span>
                                <span className="text-foreground truncate">{item.item}</span>
                              </div>
                              <span className="text-muted-foreground font-medium whitespace-nowrap">₦{item.price}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Total</span>
                            <span className="text-xl font-bold text-[#0B6623] dark:text-emerald-400">₦{combo.total_price}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#0B6623]/10 px-3 py-1.5 rounded-full">
                            <TrendingDown className="w-3 h-3 text-[#0B6623] dark:text-emerald-400" />
                            <span className="text-xs font-medium text-[#0B6623] dark:text-emerald-400">Score: {combo.filling_score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
