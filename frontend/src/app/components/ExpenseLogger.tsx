import { useState, useEffect } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Calendar, Check, Loader2 } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { addExpense, getProfile } from "../../services/api";

interface Transaction {
  id: string;
  vendor: string;
  amount: number;
  category: string;
  date: string;
  item?: string;
}

export function ExpenseLogger() {
  const [activeTab, setActiveTab] = useState("manual");
  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // Fetch real transactions from backend on mount
  useEffect(() => {
    (async () => {
      setLoadingTx(true);
      const profile = await getProfile();
      if (profile?.transactions) {
        const txList: Transaction[] = profile.transactions.map(
          (tx: any, idx: number) => ({
            id: `tx-${idx}`,
            vendor: tx.vendor || tx.item || "Unknown",
            amount: tx.amount,
            category: tx.category || "Other",
            date: tx.date || "",
            item: tx.item,
          })
        );
        setTransactions(txList.reverse()); // most recent first
      }
      setLoadingTx(false);
    })();
  }, []);

  const vendors = [
    "Mama Bose Canteen",
    "Shawarma Spot",
    "SUG Cafeteria",
    "Uncle Ben's Joint",
    "Campus Print",
    "MTN Data",
  ];

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !vendor || !category) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid positive expense amount.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    const result = await addExpense({
      category: category.toLowerCase(),
      vendor,
      item: vendor, // use vendor as item name for manual entries
      amount: parseFloat(amount),
      date: expenseDate,
    });

    setIsSubmitting(false);

    if (result?.success) {
      // Prepend the new transaction to the list
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        vendor,
        amount: parseFloat(amount),
        category,
        date: expenseDate,
      };
      setTransactions((prev) => [newTx, ...prev]);
      setSuccessMessage(`₦${amount} at ${vendor} logged!`);
      setAmount("");
      setVendor("");
      setCategory("");
      // Notify other components (e.g. Dashboard) that budget data changed
      window.dispatchEvent(new Event("budgetUpdated"));
      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 md:p-6 lg:p-8 pb-4 bg-gradient-to-b from-[#0B6623]/10 to-transparent">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#0B6623] dark:text-emerald-400">Log Expense</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Track your spending</p>
      </div>

      {successMessage && (
        <div className="mx-4 md:mx-6 lg:mx-8 mb-4">
          <div className="bg-[#ECFDF5] border border-[#10B981] rounded-xl px-4 py-3 flex items-center gap-2 animate-fadeIn">
            <Check className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm text-[#065F46]">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div>
          <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Category</Label>
                <Select.Root value={category} onValueChange={setCategory} required>
                  <Select.Trigger className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between">
                    <Select.Value placeholder="Select category" />
                    <Select.Icon>
                      <ChevronDown className="w-4 h-4" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden z-50">
                      <Select.Viewport>
                        {["Feeding", "Data", "Printing", "Transport", "Entertainment", "Other"].map((cat) => (
                          <Select.Item key={cat} value={cat} className="px-4 py-3 hover:bg-muted cursor-pointer">
                            <Select.ItemText>{cat}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Vendor</Label>
                <input
                  list="vendors"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="Start typing..."
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <datalist id="vendors">
                  {vendors.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Amount (₦)</Label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="700"
                    required
                    min="0.01"
                    step="any"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Date</Label>
                  <div className="relative">
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 md:py-4 bg-[#FFD700] text-[#1F2937] rounded-2xl hover:bg-[#FFD700]/90 transition-colors shadow-lg text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Add Expense"}
              </button>
            </form>
        </div>

        {/* Transactions Section */}
        <div className="lg:mt-0">
          <h3 className="text-sm md:text-base text-muted-foreground mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {loadingTx ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#0B6623]" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No expenses logged yet. Add your first one!</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm">{tx.vendor}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">₦{tx.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{tx.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
