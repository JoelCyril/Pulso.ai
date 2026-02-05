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

const Dashboard = () => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthScore, setHealthScore] = useState(0);
  const [userName, setUserName] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

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

  const calculateHealthScore = (data: HealthData): number => {
    let score = 100;

    if (data.sleepHours < 6 || data.sleepHours > 9) score -= 15;
    else if (data.sleepHours >= 7 && data.sleepHours <= 8) score += 5;

    if (data.exerciseMinutes < 30) score -= 15;
    else if (data.exerciseMinutes >= 60) score += 10;

    if (data.screenTimeHours > 6) score -= 20;
    else if (data.screenTimeHours < 4) score += 5;

    if (data.stressLevel > 7) score -= 15;
    else if (data.stressLevel < 4) score += 10;

    return Math.max(0, Math.min(100, score));
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
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">Welcome back</h1>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
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
              <TabsList className="grid w-full grid-cols-2 glass-card bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 border-white/30 p-1.5 backdrop-blur-xl mb-4">
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

            <TabsContent value="update" className="mt-6">
              <div className="text-center p-8 rounded-lg glass-card border-white/20">
                <p className="text-white/90 mb-4 text-lg">
                  Daily health updates are managed through the popup modal.
                </p>
                <p className="text-sm text-white/70">
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
        onDashboardUpdate={loadDashboardData}
      />

      {/* Daily Update Modal */}
      <DailyUpdateModal onUpdate={loadDashboardData} />
    </div>
  );
};

export default Dashboard;
