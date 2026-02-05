import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface DailyGoal {
    title: string;
    description: string;
    progress: number;
    target: string;
    current: string;
}

interface DailyGoalsWidgetProps {
    healthData: any;
}

export const DailyGoalsWidget = ({ healthData }: DailyGoalsWidgetProps) => {
    const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);

    useEffect(() => {
        // Generate a daily goal that changes every 24 hours
        const today = new Date().toDateString();
        const storedGoalDate = localStorage.getItem("dailyGoalDate");

        if (storedGoalDate !== today) {
            const newGoal = generateDailyGoal(healthData);
            setDailyGoal(newGoal);
            localStorage.setItem("dailyGoalDate", today);
            localStorage.setItem("dailyGoal", JSON.stringify(newGoal));
        } else {
            const stored = localStorage.getItem("dailyGoal");
            if (stored) {
                setDailyGoal(JSON.parse(stored));
            } else {
                const newGoal = generateDailyGoal(healthData);
                setDailyGoal(newGoal);
                localStorage.setItem("dailyGoal", JSON.stringify(newGoal));
            }
        }
    }, [healthData]);

    const generateDailyGoal = (data: any): DailyGoal => {
        const goals = [
            {
                title: "Walk 10,000 Steps",
                description: "Get moving and reach your daily step goal",
                progress: 0,
                target: "10,000 steps",
                current: "0 steps",
            },
            {
                title: "Drink 8 Glasses of Water",
                description: "Stay hydrated throughout the day",
                progress: 0,
                target: "8 glasses",
                current: "0 glasses",
            },
            {
                title: "Sleep 8 Hours Tonight",
                description: "Prepare for quality rest tonight",
                progress: data?.sleepHours ? (data.sleepHours / 8) * 100 : 0,
                target: "8 hours",
                current: `${data?.sleepHours || 0} hours`,
            },
            {
                title: "30 Minutes of Exercise",
                description: "Complete your daily workout",
                progress: data?.exerciseMinutes ? (data.exerciseMinutes / 30) * 100 : 0,
                target: "30 minutes",
                current: `${data?.exerciseMinutes || 0} minutes`,
            },
            {
                title: "Limit Screen Time to 4 Hours",
                description: "Reduce digital eye strain",
                progress: data?.screenTimeHours ? Math.max(0, 100 - ((data.screenTimeHours - 4) / 4) * 100) : 100,
                target: "4 hours max",
                current: `${data?.screenTimeHours || 0} hours`,
            },
        ];

        // Select goal based on day of year for consistency
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return goals[dayOfYear % goals.length];
    };

    if (!dailyGoal) return null;

    return (
        <Card className="h-full glass-card border-white/20 bg-white/10">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Today's Goal</CardTitle>
                </div>
                <CardDescription>Your daily wellness challenge</CardDescription>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div>
                        <h3 className="font-bold text-xl mb-1">{dailyGoal.title}</h3>
                        <p className="text-sm text-muted-foreground">{dailyGoal.description}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{dailyGoal.current} / {dailyGoal.target}</span>
                        </div>
                        <Progress value={Math.min(100, dailyGoal.progress)} className="h-3" />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-primary">
                        <Target className="w-4 h-4" />
                        <span>Keep going! You're doing great!</span>
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    );
};
