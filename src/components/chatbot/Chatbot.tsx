import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, AlertCircle, Sparkles, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { parseReminderCommand, saveReminder, parseGoalCommand, saveCustomGoal } from "@/services/reminderService";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotProps {
  healthData?: any;
  healthScore?: number;
  onDashboardUpdate?: () => void;
}

// Health-related keywords removed to allow for more natural conversational flexibility.
const isHealthRelated = (text: string): boolean => {
  // We now allow all inputs to be processed by the AI for a more seamless experience
  return true;
};

export const Chatbot = ({ healthData, healthScore = 0, onDashboardUpdate }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your personal health assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // 1. Check for commands first (reminders, goals, achievements)
    if (text.toLowerCase().startsWith("remind me") || text.toLowerCase().includes("remind me")) {
      const reminder = parseReminderCommand(text);
      if (reminder) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (currentUser.id && saveReminder(reminder, currentUser.id)) {
          addBotMessage(`✅ OK! I've set a reminder for you: "${reminder.message}" at ${reminder.time}.`);
          setIsLoading(false);
          return;
        }
      }
    }

    if (text.toLowerCase().includes("goal") || text.toLowerCase().startsWith("create goal")) {
      const goal = parseGoalCommand(text);
      if (goal) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (currentUser.id && saveCustomGoal(goal, currentUser.id)) {
          addBotMessage(`🎯 Done! I've added a new goal for you: "${goal.title}". You can track it in your dashboard.`);
          if (onDashboardUpdate) onDashboardUpdate();
          setIsLoading(false);
          return;
        }
      }
    }

    // Achievement command
    if (text.toLowerCase().includes("achievement")) {
      const achievementTitle = text.toLowerCase().split("achievement")[1]?.replace(/for|to|of/i, "").trim();
      if (achievementTitle) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}") || {};
        if (currentUser?.id) {
          const storedAchievements = JSON.parse(localStorage.getItem(`achievements_${currentUser.id}`) || "[]") || [];
          const newAchievement = {
            id: `custom_${Date.now()}`,
            title: achievementTitle.charAt(0).toUpperCase() + achievementTitle.slice(1),
            description: `Unlocked: ${new Date().toLocaleDateString()}`,
            unlocked: true,
            progress: 100,
            icon: "trophy"
          };
          localStorage.setItem(`achievements_${currentUser.id}`, JSON.stringify([...storedAchievements, newAchievement]));
          addBotMessage(`🏆 Amazing work! I've unlocked the "${newAchievement.title}" achievement for you.`);
          if (onDashboardUpdate) onDashboardUpdate();
          setIsLoading(false);
          return;
        }
      }
    }

    // 2. Fallback to AI Analysis
    if (!isHealthRelated(text)) {
      addBotMessage("I'm specialized in health and wellness. Please ask me questions related to your fitness, mental health, or dashboard data!");
      setIsLoading(false);
      return;
    }

    try {
      const responseText = await getAIResponse(text);
      addBotMessage(responseText);
    } catch (error) {
      addBotMessage("I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      text,
      sender: "bot",
      timestamp: new Date(),
    }]);
  };

  const getAIResponse = async (userInput: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) return generateFallbackResponse(userInput);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are an authoritative and direct Health Analyst. 
              User Name: ${healthData?.name || "User"}. 
              User Health Score: ${healthScore}/100. 
              User Profile Data: ${JSON.stringify(healthData)}. 
              
              Rules:
              - Be absolute and direct. 
              - NO disclaimers, NO "I cannot give medical advice" hedging. 
              - Give the raw truth based on the user's data and evidence-based science.
              - If the user asks "how can I get better", give specific, aggressive optimizations based on their ${healthScore} score.`
            },
            { role: 'user', content: userInput }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error("AI Error");
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (e) {
      return generateFallbackResponse(userInput);
    }
  };

  const generateFallbackResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    if (lower.includes("score")) return `Your health score is exactly ${healthScore}/100. Let's optimize it.`;
    if (lower.includes("sleep")) return `You're currently hitting ${healthData?.sleepHours || 0}h. To peak your performance, you need 8.5h consistently.`;
    return `That's a direct health concern. Based on your current habits, I recommend aggressive optimization of your ${healthData?.stressLevel > 5 ? 'stress' : 'activity'} levels immediately.`;
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-3 sm:px-4 py-3 sm:py-4">
        <div className="space-y-6 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[90%] sm:max-w-[85%] items-end gap-1.5 sm:gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-black/10 
                    ${message.sender === "bot" ? "bg-primary/20 text-primary" : "bg-black/20 text-black"}`}>
                    {message.sender === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-lg border border-black/10 backdrop-blur-md
                        ${message.sender === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-white/40 text-black rounded-bl-none"
                        }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <span className={`text-[10px] opacity-60 font-medium px-1 ${message.sender === "user" ? "text-white/70 text-right" : "text-black/60 text-left"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex gap-1.5 p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-black/5 shadow-sm font-bold text-black/40">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-xl">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative group flex items-center gap-2"
        >
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-primary transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything health-related..."
              className="pl-10 pr-4 py-6 bg-white/40 border-black/10 focus-visible:ring-primary/50 text-black rounded-xl placeholder:text-black/40"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        <div className="mt-3 flex items-center justify-between px-1">
          <p className="text-[10px] text-black/40 flex items-center gap-1 uppercase tracking-widest font-bold">
            <Bot className="w-3 h-3" /> Pulso AI • Groq
          </p>
          <div className="flex gap-2 text-[10px] text-black/50">
            <button onClick={() => setInput("What's my health score?")} className="hover:text-black/80 transition-colors uppercase tracking-tighter font-semibold">Score</button>
            <button onClick={() => setInput("Remind me to drink water")} className="hover:text-black/80 transition-colors uppercase tracking-tighter font-semibold">Remind</button>
            <button onClick={() => setInput("Create a goal for sleep")} className="hover:text-black/80 transition-colors uppercase tracking-tighter font-semibold">Goal</button>
          </div>
        </div>
      </div>
    </div>
  );
};
