import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center animate-fadeIn">
      <h1 className="text-4xl font-semibold text-[#0B6623] dark:text-emerald-400 mb-2">404</h1>
      <p className="text-muted-foreground mb-6">This page does not exist.</p>
      <Link
        to="/dashboard"
        className="rounded-2xl bg-[#0B6623] px-6 py-3 text-white hover:bg-[#0B6623]/90 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
