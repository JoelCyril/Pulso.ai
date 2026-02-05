import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MessageSquare, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OnboardingChat } from "@/components/onboarding/OnboardingChat";
import { LiveHealthAnalysis } from "@/components/onboarding/LiveHealthAnalysis";

interface HealthData {
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  alcoholDrinks: number;
  sleepHours: number;
  screenTimeHours: number;
  exerciseMinutes: number;
  stressLevel: number;
  waterLiters: number;
  nationality: string;
  [key: string]: any;
}

const Onboarding = () => {
  const [healthData, setHealthData] = useState<HealthData>({
    name: "",
    age: 25,
    gender: "",
    heightCm: 170,
    weightKg: 70,
    alcoholDrinks: 0,
    sleepHours: 7,
    screenTimeHours: 4,
    exerciseMinutes: 30,
    stressLevel: 5,
    waterLiters: 2,
    nationality: "",
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null); // Use proper type in real app

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { analyzeHealthData } = await import("@/services/aiHealthService");
      const result = await analyzeHealthData(healthData);
      setAnalysisResult(result);

      // Save result to local storage for persistence
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (currentUser.id) {
        localStorage.setItem(`healthAnalysis_${currentUser.id}`, JSON.stringify(result));
        localStorage.setItem(`healthScore_${currentUser.id}`, JSON.stringify(result.score));
      }
    } catch (error) {
      console.error("Analysis failed", error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (!currentUser.id) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    localStorage.setItem(`healthData_${currentUser.id}`, JSON.stringify(healthData));
    localStorage.setItem(`onboarding_${currentUser.id}`, "completed");

    toast({
      title: "Profile created!",
      description: "Redirecting to your dashboard...",
    });

    navigate("/dashboard");
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col items-center justify-center p-4 md:p-6 bg-hero-gradient overflow-hidden">
      <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-6 h-full lg:h-[90vh]">

        {/* Left Col: Header and Intro (Hidden on mobile to save space, visible on large) */}
        <div className="lg:col-span-3 lg:flex flex-col justify-center space-y-6 text-zinc-900 p-4 hidden">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-block p-3 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/20 mb-6">
              <span className="font-script text-3xl text-primary font-bold">Pulso</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight text-zinc-900">
              Let's understand <br /> <span className="text-primary italic">your health.</span>
            </h1>
            <p className="text-zinc-700 leading-relaxed text-sm md:text-base font-medium">
              Chat with Pulso AI. As you share your story, watch your health profile build in real-time on the right.
            </p>
          </motion.div>
        </div>

        {/* Middle Col: Chat - Takes priority space, scrolls internally */}
        <div className="col-span-1 lg:col-span-5 h-full order-1 lg:order-none min-h-0">
          <Card className="glass-card border-0 shadow-2xl h-full flex flex-col overflow-hidden bg-white/40">
            <div className="p-4 border-b border-white/10 bg-white/20 backdrop-blur-md flex items-center gap-2 shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary-foreground">Conversation</span>
            </div>
            <div className="flex-1 overflow-hidden p-2 relative flex flex-col min-h-0">
              <OnboardingChat
                healthData={healthData}
                setHealthData={setHealthData}
                onComplete={handleComplete}
                onAnalyze={handleAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </Card>
        </div>

        {/* Right Col: Live Analysis - Always visible on side on desktop */}
        <div className="col-span-1 lg:col-span-4 h-full order-2 lg:order-none min-h-0 hidden lg:block">
          <Card className="glass-card border-0 shadow-2xl h-full flex flex-col overflow-hidden bg-white/60">
            <div className="p-4 border-b border-white/10 bg-white/40 backdrop-blur-md flex items-center gap-2 shrink-0">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Live Analysis</span>
            </div>
            <div className="flex-1 overflow-hidden p-6 relative flex flex-col min-h-0">
              <LiveHealthAnalysis
                healthData={healthData}
                analysisResult={analysisResult}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
