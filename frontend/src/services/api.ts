const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    console.error("API request failed", response.status, text);
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return null;
  }
  return response.json();
}

export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("login error", error);
    return null;
  }
}

export async function signup(data: {
  email: string;
  password: string;
  monthly_allowance: number;
  feeding_budget: number;
  dietary_pref?: string;
  allowance_period?: string;
  meals_per_day?: number;
  meal_times?: string[];
}) {
  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("signup error", error);
    return null;
  }
}

export async function getBudgetSummary() {
  try {
    const response = await fetch(`${BASE_URL}/budget/summary`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("getBudgetSummary error", error);
    return null;
  }
}

export async function postAutoAdjust() {
  try {
    const response = await fetch(`${BASE_URL}/budget/auto-adjust`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("postAutoAdjust error", error);
    return null;
  }
}

export async function getMealPlan() {
  try {
    const response = await fetch(`${BASE_URL}/coach/meal-plan`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("getMealPlan error", error);
    return null;
  }
}

export async function postCoachAdvice(
  recentTransactions: any[] = [],
  chatHistory: { role: string; content: string }[] = []
) {
  try {
    const response = await fetch(`${BASE_URL}/coach/advice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        recent_transactions: recentTransactions,
        chat_history: chatHistory,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("postCoachAdvice error", error);
    return null;
  }
}

export async function getProfile() {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("getProfile error", error);
    return null;
  }
}

export async function applyAutoAdjustPlan(newDailyLimit: number) {
  try {
    const response = await fetch(`${BASE_URL}/budget/apply-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ new_daily_limit: newDailyLimit }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("applyAutoAdjustPlan error", error);
    return null;
  }
}

export async function updateProfile(data: any) {
  try {
    const response = await fetch(`${BASE_URL}/profile/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("updateProfile error", error);
    return null;
  }
}

export async function addExpense(data: {
  category: string;
  vendor: string;
  item: string;
  amount: number;
  date: string;
}) {
  try {
    const response = await fetch(`${BASE_URL}/transactions/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("addExpense error", error);
    return null;
  }
}

export async function resetCycle() {
  try {
    const response = await fetch(`${BASE_URL}/budget/reset-cycle`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("resetCycle error", error);
    return null;
  }
}

export async function resetAllExpenses() {
  try {
    const response = await fetch(`${BASE_URL}/budget/reset-transactions`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("resetAllExpenses error", error);
    return null;
  }
}

