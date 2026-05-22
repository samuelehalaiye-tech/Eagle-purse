import { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { applyAutoAdjustPlan, postCoachAdvice } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
interface Message {
  id: string;
  sender: "coach" | "user";
  text: string;
  suggestion?: {
    meal: string;
    vendor: string;
    price: string;
    savings: string;
  };
  actions?: string[];
}

export function CoachChat() {
  const { token } = useAuth();  // if you need the token  // get user from context
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "coach",
      text: "Welcome back! Ask me about your budget or recent spend and I will suggest a better way.",
    },
  ]);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [autoAdjust, setAutoAdjust] = useState<any | null>(null);
  const [planApplied, setPlanApplied] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [input, setInput] = useState("");
  const [showSurvivalWarning, setShowSurvivalWarning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setChatHistory((prev) => [...prev, { role: "user", content: input }]);
    setIsTyping(true);

    let response = null;
    try {
   response = await postCoachAdvice([], [...chatHistory, { role: "user", content: input }]);
    } finally {
      setIsTyping(false);
    }

    const coachText = response?.message ||
      "I couldn't reach Coach Ngozi right now. Please try again in a moment.";

    const coachMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: "coach",
      text: coachText,
    };

    setMessages((prev) => [...prev, coachMessage]);
    setChatHistory((prev) => [...prev, { role: "assistant", content: coachText }]);

    // If backend returned an auto_adjust payload, surface it in the UI
    if (response?.auto_adjust) {
      setAutoAdjust(response.auto_adjust);
      setShowSurvivalWarning(!!response.auto_adjust.needed);
    } else {
      setShowSurvivalWarning(false);
    }
    setInput("");
  };

  const handleApplyPlan = async () => {
    if (!autoAdjust?.new_daily_limit) return;

    const limit = autoAdjust.new_daily_limit;
    const result = await applyAutoAdjustPlan(limit);
    if (result) {
      setPlanApplied(true);
      setAutoAdjust(null);
      window.dispatchEvent(new Event("budgetUpdated"));
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          sender: "coach",
          text: `Great! I've applied the new daily budget of ₦${limit} for you.`,
        },
      ]);
    }
  };

  const handleAction = (action: string) => {
    alert(`You selected: ${action}`);
  };

  return (
    <div className="flex flex-col h-full bg-background max-w-4xl mx-auto">
      <div className="p-4 md:p-6 lg:p-8 pb-4 bg-gradient-to-b from-[#0B6623]/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#FFD700] to-[#FFC107] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xl md:text-2xl">👩🏾</span>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400">Coach Ngozi</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Your AI Budget Coach</p>
          </div>
        </div>
      </div>

      {showSurvivalWarning && (
        <div className="mx-4 md:mx-6 lg:mx-8 mb-4">
          <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <span className="text-xs md:text-sm text-[#EF4444]">Even survival meals won't last</span>
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 space-y-4 ${autoAdjust ? 'pb-8' : 'pb-4'}`}>
        {messages.map((message) => (
          <motion.div 
            key={message.id}
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {message.sender === "coach" ? (
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#FFD700] to-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm md:text-base">👩🏾</span>
                </div>
                <div className="space-y-2 max-w-[80%] md:max-w-[75%]">
                  <div className="bg-[#0B6623] text-white rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm md:text-base">{message.text}</p>
                  </div>

                  {message.suggestion && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-2">Suggested Meal</p>
                      <div className="space-y-1">
                        <p className="text-sm">{message.suggestion.meal}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{message.suggestion.vendor}</span>
                          <div className="flex items-center gap-2">
                            <span className="line-through text-muted-foreground">₦1,000</span>
                            <span className="text-[#0B6623] dark:text-emerald-400 dark:text-emerald-400">{message.suggestion.price}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#10B981] mt-2">Save {message.suggestion.savings}</p>
                      </div>
                      <button className="w-full mt-3 py-2 bg-[#FFD700] text-[#1F2937] rounded-xl hover:bg-[#FFD700]/90 transition-colors text-sm">
                        View Plan
                      </button>
                    </div>
                  )}

                  {message.actions && (
                    <div className="flex gap-2">
                      {message.actions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleAction(action)}
                          className="px-4 py-2 bg-[#FFD700] text-[#1F2937] rounded-xl hover:bg-[#FFD700]/90 transition-colors text-sm"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] md:max-w-[75%] shadow-sm">
                  <p className="text-sm md:text-base">{message.text}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="flex gap-2 items-start animate-slideUp px-4 md:px-6 lg:px-8">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#FFD700] to-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm md:text-base">👩🏾</span>
          </div>
          <div className="bg-[#0B6623] text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] md:max-w-[75%]">
            <p className="text-sm md:text-base mb-2">Coach Ngozi is typing</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      {autoAdjust && (
        <div className="w-full px-4 md:px-6 lg:px-8 pb-4">
          <div className="bg-card rounded-2xl p-4 shadow-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adjustment Plan</p>
                <h4 className="text-lg text-foreground font-semibold">₦{autoAdjust.new_daily_limit}/day</h4>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${autoAdjust.needed ? 'bg-[#FFF4E5] text-[#92400E]' : 'bg-[#ECFDF5] text-[#064E3B]'}`}>
                  {autoAdjust.needed ? 'Recommended' : 'Suggestion'}
                </span>
              </div>
            </div>

            <div className="mt-3 text-sm">
              {autoAdjust.sacrifices && autoAdjust.sacrifices.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground mb-1">Sacrifices</p>
                  <ul className="list-disc list-inside text-sm">
                    {autoAdjust.sacrifices.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {autoAdjust.suggested_meals && autoAdjust.suggested_meals.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Suggested Meals</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {autoAdjust.suggested_meals.slice(0,3).map((m: any, i: number) => (
                      <div key={i} className="p-2 bg-[#F9FAFB] rounded-xl text-sm">
                        <div className="font-medium">{m.item}</div>
                        <div className="text-xs text-muted-foreground">{m.vendor} • ₦{m.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleApplyPlan}
                className="flex-1 py-2 bg-[#0B6623] text-white rounded-2xl hover:bg-[#0B6623]/90 transition-colors"
              >
                Accept & Apply
              </button>
              <button
                onClick={() => setAutoAdjust(null)}
                className="py-2 px-4 bg-background border border-border rounded-2xl"
              >
                Dismiss
              </button>
            </div>

            {planApplied && (
              <p className="mt-3 text-sm text-[#065F46]">Plan applied. Refresh the Dashboard to see the updated budget.</p>
            )}
          </div>
        </div>
      )}

      <div className="w-full px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 bg-background">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#0B6623] text-white rounded-2xl flex items-center justify-center hover:bg-[#0B6623]/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}



