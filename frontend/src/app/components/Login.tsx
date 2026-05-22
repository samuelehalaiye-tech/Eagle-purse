import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cardLg, input, btnPrimary, linkBrand, page, subtitle, muted } from "../utils/darkClasses";

export function Login() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.token) {
      navigate("/dashboard", { replace: true });
    }
  }, [auth.token, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const success = await auth.login(email, password);
    setLoading(false);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Login failed. Please check your email and password.");
    }
  };

  return (
    <div className={`${page} flex items-center justify-center px-4 py-8`}>
      <div className={`w-full max-w-md ${cardLg} p-6 animate-fadeIn`}>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Welcome back</h1>
        <p className={`text-sm ${subtitle} mb-2`}>Sign in to continue managing your budget.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className={`text-sm ${muted}`}>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${input}`} required />
          </label>

          <label className="block">
            <span className={`text-sm ${muted}`}>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`mt-2 ${input}`} required />
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className={`w-full rounded-2xl px-4 py-3 transition-colors ${btnPrimary}`}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className={`text-sm ${subtitle} mt-6 text-center`}>
          New here? <Link to="/signup" className={linkBrand}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
