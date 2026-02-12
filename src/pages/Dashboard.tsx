import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Moon, Activity, Monitor, Heart } from "lucide-react";

// New Dashboard Components
import { CircularHealthScore } from "@/components/dashboard/CircularHealthScore";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { DailyGoalsWidget } from "@/components/dashboard/DailyGoalsWidget";
import { AchievementsGrid } from "@/components/dashboard/AchievementsGrid";
import { FloatingChatbot } from "@/components/dashboard/FloatingChatbot";
import { DailyUpdateModal } from "@/components/dashboard/DailyUpdateModal";
import { OverviewPanel } from "@/components/dashboard/OverviewPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, RefreshCw, Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dashboardBg from "@/assets/dashboard.jpeg";

interface HealthData {
  name: string;
  sleepHours: number;
  gender: string;
  nationality: string;
  screenTimeHours: number;
  exerciseMinutes: number;
  age: number;
  stressLevel: number;
  heightCm?: number;
  weightKg?: number;
  alcoholDrinks?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
}

interface CountryOption {
  code: string;
  name: string;
  region?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthScore, setHealthScore] = useState(0);
  const [userName, setUserName] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [selectedCountryName, setSelectedCountryName] = useState<string>("");
  const [whoInsight, setWhoInsight] = useState<string>("");
  const [whoLoading, setWhoLoading] = useState(false);
  const [whoError, setWhoError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_HEALTHGUARD_API_URL || "http://localhost:8000";

  const loadDashboardData = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}") || {};

      if (!currentUser?.id) {
        navigate("/");
        return;
      }

      const storedData = localStorage.getItem(`healthData_${currentUser?.id}`);
      const storedAnalysis = localStorage.getItem(`healthAnalysis_${currentUser?.id}`);
      const storedAchievements = localStorage.getItem(`achievements_${currentUser?.id}`);
      const storedRecommendations = localStorage.getItem(`recommendations_${currentUser?.id}`);

      if (storedData) {
        const data = JSON.parse(storedData);
        setHealthData(data);
        setUserName(data.name || "User");

        const score = calculateHealthScore(data);
        setHealthScore(score);

        // Enhance with ML prediction from backend if available
        fetch(`${BACKEND_URL}/predict-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: data.age,
            sleep: data.sleepHours,
            screenTime: data.screenTimeHours,
            exercise: data.exerciseMinutes,
            stress: data.stressLevel
          })
        })
          .then(res => res.ok ? res.json() : null)
          .then(mlData => {
            if (mlData?.predicted_score) {
              setHealthScore(Math.round(mlData.predicted_score));
              console.log("WHO-Aligned ML Score received:", mlData.predicted_score);
            }
          })
          .catch(err => console.warn("ML Prediction backend unavailable, using local WHO-aligned score.", err));
      } else {
        // If no health data found, redirect to onboarding to collect it
        navigate("/onboarding");
        return;
      }

      if (storedAnalysis) {
        try {
          setAnalysisResult(JSON.parse(storedAnalysis));
        } catch (e) {
          console.error("Failed to parse analysis result", e);
        }
      }

      if (storedAchievements) {
        try {
          setAchievements(JSON.parse(storedAchievements));
        } catch (e) {
          setAchievements(generateDefaultAchievements());
        }
      } else {
        const defaultAchievements = generateDefaultAchievements();
        setAchievements(defaultAchievements);
        localStorage.setItem(`achievements_${currentUser.id}`, JSON.stringify(defaultAchievements));
      }

      if (storedRecommendations) {
        try {
          setRecommendations(JSON.parse(storedRecommendations));
        } catch (e) {
          setRecommendations(generateDefaultRecommendations());
        }
      } else {
        const defaultRecommendations = generateDefaultRecommendations();
        setRecommendations(defaultRecommendations);
        localStorage.setItem(`recommendations_${currentUser.id}`, JSON.stringify(defaultRecommendations));
      }
    } catch (error) {
      console.error("Dashboard data load error:", error);
      // Fallback or redirect if everything is broken
      // navigate("/");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/countries`);
        if (!response.ok) {
          console.error("Failed to load countries");
          return;
        }
        const data: CountryOption[] = await response.json();
        setCountries(data);

        if (!selectedCountryCode && data.length > 0) {
          setSelectedCountryCode(data[0].code);
          setSelectedCountryName(data[0].name);
        }
      } catch (error) {
        console.error("Error loading countries", error);
      }
    };

    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateHealthScore = (data: HealthData): number => {
    let score = 100;

    // WHO/NIH sleep recommendation: 7-9 hours for adults
    if (data.sleepHours < 7 || data.sleepHours > 9) score -= 15;
    else score += 5;

    // WHO exercise recommendation: 150-300 mins moderate activity/week
    // Assuming data.exerciseMinutes is daily (based on other code)
    const weeklyExercise = data.exerciseMinutes * 7;
    if (weeklyExercise < 150) score -= 20;
    else if (weeklyExercise >= 300) score += 10;
    else score += 5;

    // Lifestyle/Digital wellness (Screen time)
    if (data.screenTimeHours > 6) score -= 20;
    else if (data.screenTimeHours < 3) score += 10;

    // Stress management
    if (data.stressLevel > 7) score -= 15;
    else if (data.stressLevel < 4) score += 10;

    return Math.max(0, Math.min(100, score));
  };

  const handleFetchWhoInsight = async () => {
    if (!selectedCountryCode) return;
    setWhoLoading(true);
    setWhoError(null);

    try {
      const payload = {
        country_code: selectedCountryCode,
        country_name: selectedCountryName || undefined,
        health_score: healthScore,
        age: healthData?.age,
        gender: healthData?.gender,
        exercise: healthData?.exerciseMinutes ? healthData.exerciseMinutes * 7 : undefined, // Convert to weekly for WHO
        sleep: healthData?.sleepHours,
      };

      const response = await fetch(`${BACKEND_URL}/who-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch WHO insights");
      }

      const data = await response.json();
      setWhoInsight(data.summary || "");
    } catch (error) {
      console.error("Failed to fetch WHO insights", error);
      setWhoError("Could not load WHO-based insights right now.");
    } finally {
      setWhoLoading(false);
    }
  };

  const generateDefaultAchievements = (): Achievement[] => {
    return [
      {
        id: "1",
        title: "Early Bird",
        description: "Sleep before 11 PM for 7 days",
        icon: "moon",
        unlocked: false,
        progress: 0,
      },
      {
        id: "2",
        title: "Active Lifestyle",
        description: "Exercise 30+ minutes daily for a week",
        icon: "activity",
        unlocked: false,
        progress: 0,
      },
      {
        id: "3",
        title: "Screen Detox",
        description: "Keep screen time under 4 hours for 5 days",
        icon: "monitor",
        unlocked: false,
        progress: 0,
      },
      {
        id: "4",
        title: "Wellness Warrior",
        description: "Maintain health score above 80 for 30 days",
        icon: "heart",
        unlocked: false,
        progress: 0,
      },
      {
        id: "5",
        title: "Consistency King",
        description: "Log health data for 14 days straight",
        icon: "trophy",
        unlocked: false,
        progress: 0,
      },
    ];
  };

  const generateDefaultRecommendations = (): Recommendation[] => {
    return [
      {
        id: "1",
        title: "Improve Sleep Quality",
        description: "Aim for 7-8 hours of sleep per night. Create a bedtime routine and avoid screens 1 hour before bed.",
        priority: "high",
        category: "Sleep",
      },
      {
        id: "2",
        title: "Increase Physical Activity",
        description: "Try to get at least 30 minutes of moderate exercise daily. Start with walks and gradually increase intensity.",
        priority: "high",
        category: "Exercise",
      },
      {
        id: "3",
        title: "Reduce Screen Time",
        description: "Limit screen time to 6 hours or less per day. Take regular breaks using the 20-20-20 rule.",
        priority: "medium",
        category: "Lifestyle",
      },
    ];
  };

  if (!healthData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-scroll md:bg-fixed relative"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-lg">Welcome back</h1>
        </motion.div>

        {/* WHO Country Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="glass-card border border-white/30 rounded-2xl p-4 sm:p-5 bg-black/30 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">
                  WHO Country Insights
                </h2>
                <p className="text-xs sm:text-sm text-white/80">
                  Choose a country to see a coaching summary based on WHO healthy life expectancy data, tailored to your current health score.
                </p>
              </div>
              <div className="w-full md:w-80 space-y-2">
                <Select
                  value={selectedCountryCode}
                  onValueChange={(value) => {
                    setSelectedCountryCode(value);
                    const found = countries.find((c) => c.code === value);
                    setSelectedCountryName(found?.name || "");
                  }}
                >
                  <SelectTrigger className="bg-white/80 border-white/40 text-sm">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  className="w-full"
                  size="sm"
                  onClick={handleFetchWhoInsight}
                  disabled={whoLoading || !selectedCountryCode}
                >
                  {whoLoading ? "Loading WHO insights..." : "Get WHO Insights"}
                </Button>
              </div>
            </div>
            {(whoInsight || whoError) && (
              <div className="mt-4 rounded-xl bg-black/30 border border-white/20 p-3 sm:p-4 text-sm text-white/90">
                {whoError ? (
                  <p className="text-red-200">{whoError}</p>
                ) : (
                  <p className="leading-relaxed whitespace-pre-line">{whoInsight}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Left: Recommendations Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            <RecommendationsPanel recommendations={recommendations} />
          </motion.div>

          {/* Center: Tabbed Health Score and Overview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Tabs defaultValue="health-score" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass-card bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 border-white/30 p-1 sm:p-1.5 backdrop-blur-xl mb-3 sm:mb-4">
                <TabsTrigger
                  value="health-score"
                  className="flex items-center gap-2 data-[state=active]:bg-white/30 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 transition-all rounded-2xl font-semibold"
                >
                  <Target className="w-4 h-4" />
                  Score
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 data-[state=active]:bg-white/30 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 transition-all rounded-2xl font-semibold"
                >
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health-score" className="mt-0">
                <div className="flex items-center justify-center">
                  <CircularHealthScore
                    score={healthScore}
                    lifeExpectancy={analysisResult?.lifeExpectancy}
                  />
                </div>
              </TabsContent>

              <TabsContent value="overview" className="mt-0">
                <OverviewPanel
                  healthData={healthData}
                  healthScore={healthScore}
                  analysisResult={analysisResult}
                />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Right Column: Goals + Achievements */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top Right: Daily Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <DailyGoalsWidget healthData={healthData} />
            </motion.div>

            {/* Bottom Right: Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AchievementsGrid achievements={achievements} />
            </motion.div>
          </div>
        </div>

        {/* Bottom: Update Tab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="update" className="w-full">
            <TabsList className="grid w-full grid-cols-1 glass-card bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 border-white/30 p-1.5 backdrop-blur-xl">
              <TabsTrigger
                value="update"
                className="flex items-center gap-2 data-[state=active]:bg-white/30 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 transition-all rounded-2xl font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                Update Health Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="update" className="mt-4 sm:mt-6">
              <div className="text-center p-4 sm:p-6 md:p-8 rounded-lg glass-card border-white/20">
                <p className="text-white/90 mb-3 sm:mb-4 text-base sm:text-lg">
                  Daily health updates are managed through the popup modal.
                </p>
                <p className="text-xs sm:text-sm text-white/70">
                  You'll receive a notification when it's time to update your health metrics.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot
        healthData={healthData}
        healthScore={healthScore}
        whoInsight={whoInsight}
        onDashboardUpdate={loadDashboardData}
      />

      {/* Daily Update Modal */}
      <DailyUpdateModal onUpdate={loadDashboardData} />
    </div>
  );
};

export default Dashboard;
