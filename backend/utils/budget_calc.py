from math import ceil
from typing import Dict, List

from schemas import FoodItem
from utils.loader import get_total_spent, get_feeding_spent, get_days_elapsed

def get_period_days(period: str) -> int:
    if period == "weekly":
        return 7
    if period == "bi-weekly":
        return 14
    return 30



def get_budget_summary_data(profile: dict, transactions: List[dict], food_df) -> Dict:
    total_spent = get_total_spent(transactions)
    feeding_spent = get_feeding_spent(transactions)
    days_elapsed = get_days_elapsed(transactions)
    period_days = get_period_days(profile.get("allowance_period", "monthly"))
    days_remaining = max(0, period_days - days_elapsed)
    daily_burn_rate = feeding_spent / days_elapsed if days_elapsed else 0.0
    remaining_feeding = profile["feeding_budget"] - feeding_spent
    if remaining_feeding < 0:
        projected_broke_day = 0.0
    else:
        projected_broke_day = round(remaining_feeding / daily_burn_rate, 2) if daily_burn_rate > 0 else None
    
    protein_carbs = food_df[(food_df["protein"] == 1) & (food_df["carbs"] == 1)]
    if not protein_carbs.empty:
        survival_threshold = float(protein_carbs["price"].min())
    else:
        survival_threshold = float(food_df["price"].min())
        
    remaining_allowance = profile.get("monthly_allowance", 0.0) - total_spent
    
    category_breakdown = {}
    for tx in transactions:
        cat = tx.get("category", "other")
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + tx.get("amount", 0.0)
    category_breakdown = {k: round(v, 2) for k, v in category_breakdown.items()}
    
    overspent_threshold = 0.30 * profile.get("monthly_allowance", 0.0)
    overspent_categories = [
        cat for cat, amt in category_breakdown.items()
        if amt > overspent_threshold
    ]
    
    survival_mode = False
    if days_remaining > 0:
        survival_mode = (
            (remaining_feeding / days_remaining) < survival_threshold
            or (remaining_allowance / days_remaining) < survival_threshold
        )
    else:
        survival_mode = remaining_feeding <= 0 or remaining_allowance <= 0

    if remaining_feeding < 0:
        recommendation_summary = "You have overspent. Reduce spending immediately."
    elif survival_mode:
        recommendation_summary = (
            "Feeding budget is tight; switch to the cheapest meals and cut snacks to survive the month."
        )
    else:
        recommendation_summary = (
            "Your budget is on track, but keep an eye on meal costs and avoid extra treats."
        )
        
    warnings = []
    for cat in overspent_categories:
        cat_lower = cat.lower()
        if cat_lower in ["data", "top-up"]:
            warnings.append("You are overspending on data. Consider switching to a cheaper plan.")
        elif cat_lower in ["transport", "transportation"]:
            warnings.append("Your transport spending is high. Consider walking instead of taking keke.")
        elif cat_lower in ["printing"]:
            warnings.append("You are overspending on printing. Try to minimize printing or print double-sided.")
        else:
            warnings.append(f"You are overspending on {cat}. Consider cutting back on this category.")

    if warnings:
        recommendation_summary += " " + " ".join(warnings)

    return {
        "total_spent": round(total_spent, 2),
        "remaining_allowance": round(remaining_allowance, 2),
        "feeding_spent": round(feeding_spent, 2),
        "days_elapsed": days_elapsed,
        "days_remaining": days_remaining,
        "period_days": period_days,
        "daily_burn_rate": round(daily_burn_rate, 2),
        "projected_broke_day": round(projected_broke_day, 2) if projected_broke_day is not None else None,
        "survival_threshold": round(survival_threshold, 2),
        "survival_mode": survival_mode,
        "recommendation_summary": recommendation_summary,
        "category_breakdown": category_breakdown,
        "overspent_categories": overspent_categories,
    }


def get_auto_adjust_data(profile: dict, transactions: List[dict], food_df) -> Dict:
    summary = get_budget_summary_data(profile, transactions, food_df)
    days_remaining = summary["days_remaining"]
    remaining_feeding = profile["feeding_budget"] - summary["feeding_spent"]
    new_daily_limit = max(0.0, round(remaining_feeding / days_remaining, 2)) if days_remaining > 0 else 0.0
    suggested_meals = []
    sacrifices = []
    try:
        if summary["survival_mode"]:
            sacrifices = [
                "Cut all snacks and suya",
                "Walk to class",
                "Use only Bingham Village spots",
            ]
            cheap_items = food_df[food_df["meal_type"] == "lunch"].sort_values("price").head(3)
            suggested_meals = [FoodItem(**item).model_dump() for _, item in cheap_items.iterrows()]
        else:
            if summary["feeding_spent"] > profile["feeding_budget"]:
                sacrifices = ["Avoid expensive campus meals", "Stick to cheapest lunch options"]
            cheap_lunch = food_df[
                (food_df["meal_type"] == "lunch") & (food_df["price"] <= new_daily_limit)
            ].sort_values(["price", "protein"], ascending=[True, False]).head(3)
            if cheap_lunch.empty:
                cheap_lunch = food_df[food_df["meal_type"] == "lunch"].sort_values("price").head(3)
            suggested_meals = [FoodItem(**item).model_dump() for _, item in cheap_lunch.iterrows()]

        # Check overspent categories and add specific advice:
        overspent_categories = summary.get("overspent_categories", [])
        for cat in overspent_categories:
            cat_lower = cat.lower()
            if cat_lower in ["data", "top-up"]:
                advice = "Reduce data usage or switch to a cheaper plan."
                if advice not in sacrifices:
                    sacrifices.append(advice)
            elif cat_lower in ["transport", "transportation"]:
                advice = "Walk instead of taking keke."
                if advice not in sacrifices:
                    sacrifices.append(advice)
            elif cat_lower in ["printing"]:
                advice = "Minimize printing or print double-sided."
                if advice not in sacrifices:
                    sacrifices.append(advice)

        return {
            "new_daily_limit": new_daily_limit,
            "survival_mode": summary["survival_mode"],
            "suggested_meals": suggested_meals,
            "sacrifices": sacrifices,
            "message": "Coach Ngozi has adjusted your plan. Accept?",
        }
    except Exception:
        return {
            "new_daily_limit": new_daily_limit,
            "survival_mode": summary["survival_mode"],
            "suggested_meals": [],
            "sacrifices": [],
            "message": "Unable to compute suggestions.",
        }
