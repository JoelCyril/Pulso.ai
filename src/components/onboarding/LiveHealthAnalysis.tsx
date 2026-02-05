import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Moon, Monitor, Brain, Heart, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface HealthData {
    name: string;
    age: number;
    gender: string;
    sleepHours: number;
    screenTimeHours: number;
    exerciseMinutes: number;
    stressLevel: number;
    waterLiters: number;
}

import { HealthAnalysisResult } from "@/services/aiHealthService";

interface LiveHealthAnalysisProps {
    healthData: HealthData;
    analysisResult?: HealthAnalysisResult | null;
    isAnalyzing?: boolean;
}

export const LiveHealthAnalysis = ({ healthData, analysisResult, isAnalyzing }: LiveHealthAnalysisProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of analysis when data updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [healthData, analysisResult, isAnalyzing]);

    // Simple risk logic (fallback if no AI result yet)
    const risks = [];
    const goods = [];

    if (healthData.sleepHours < 7) risks.push({ text: "Low Sleep Duration", detail: "Increases burnout risk" });
    else goods.push({ text: "Good Sleep Habits", detail: "Optimal restoration" });

    if (healthData.screenTimeHours > 6) risks.push({ text: "High Digital Strain", detail: "May cause eye fatigue" });
    else goods.push({ text: "Balanced Screen Time", detail: "Low digital impact" });

    if (healthData.stressLevel > 6) risks.push({ text: "Elevated Stress", detail: "Focus on mindfulness" });
    else goods.push({ text: "Stable Stress Levels", detail: "Mental resilience high" });


    return (
        <div ref={scrollRef} className="space-y-6 h-full overflow-y-auto pr-2 scroll-smooth">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-serif font-bold text-primary mb-1">
                    {analysisResult ? `Health Score: ${analysisResult.score}/100` : "Live Analysis"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    {analysisResult ? "AI-Powered Population Comparison" : "Real-time insights based on your inputs."}
                </p>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard
                    label="Sleep Score"
                    value={`${healthData.sleepHours}h`}
                    icon={<Moon size={20} />}
                    score={(healthData.sleepHours / 9) * 100}
                    color="bg-indigo-500"
                />
                <MetricCard
                    label="Digital Load"
                    value={`${healthData.screenTimeHours}h`}
                    icon={<Monitor size={20} />}
                    score={(1 - healthData.screenTimeHours / 12) * 100}
                    color="bg-blue-500"
                />
                <MetricCard
                    label="Activity"
                    value={`${healthData.exerciseMinutes}m`}
                    icon={<Activity size={20} />}
                    score={(healthData.exerciseMinutes / 60) * 100}
                    color="bg-emerald-500"
                />
                <MetricCard
                    label="Stress Margin"
                    value={`${healthData.stressLevel}/10`}
                    icon={<Brain size={20} />}
                    score={(1 - healthData.stressLevel / 10) * 100}
                    color="bg-rose-500"
                />
            </div>

            {/* Dynamic Insights Area */}
            <div className="grid grid-cols-1 gap-4 mt-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    {analysisResult ? "AI Insights & Recommendations" : "Projected Health Trends"}
                </h3>

                {isAnalyzing && (
                    <div className="p-8 text-center border-2 border-primary/10 border-dashed rounded-xl bg-primary/5 animate-pulse">
                        <Activity className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                        <h4 className="font-medium text-primary">Analyzing Profile...</h4>
                        <p className="text-sm text-muted-foreground">Comparing with population data</p>
                    </div>
                )}

                {!isAnalyzing && analysisResult && (
                    <div className="space-y-4">
                        {/* Population Comparison Summary */}
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <h4 className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Population Analysis</h4>
                            <p className="text-sm leading-relaxed text-foreground/80 italic">
                                "{analysisResult.summary}"
                            </p>
                            <div className="mt-3 grid grid-cols-1 gap-2">
                                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded text-primary-foreground/70 border border-primary/5">
                                    Sleep: {analysisResult.comparison.sleep}
                                </span>
                                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded text-primary-foreground/70 border border-primary/5">
                                    Total: {analysisResult.comparison.overall}
                                </span>
                            </div>
                        </div>

                        {/* AI Specific Insights */}
                        {analysisResult.insights.map((insight, i) => (
                            <motion.div
                                key={`ai-insight-${i}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 bg-white border border-indigo-100 rounded-xl flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full mt-1 shrink-0">
                                    <Brain size={16} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-indigo-900 text-sm">Recommendation {i + 1}</h4>
                                    <p className="text-sm text-indigo-700/80 leading-relaxed">{insight}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Fallback to simple logic if no AI result yet */}
                {!isAnalyzing && !analysisResult && (
                    <>
                        {/* Goods */}
                        {goods.map((item, i) => (
                            <motion.div
                                key={`good-${i}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 bg-green-50/50 border border-green-100 rounded-xl flex items-start gap-3"
                            >
                                <div className="p-2 bg-green-100 text-green-700 rounded-full mt-1">
                                    <CheckCircle size={16} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-green-900">{item.text}</h4>
                                    <p className="text-sm text-green-700/80">{item.detail}</p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Risks */}
                        {risks.map((item, i) => (
                            <motion.div
                                key={`risk-${i}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-3"
                            >
                                <div className="p-2 bg-red-100 text-red-700 rounded-full mt-1">
                                    <AlertTriangle size={16} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-red-900">{item.text}</h4>
                                    <p className="text-sm text-red-700/80">{item.detail}</p>
                                </div>
                            </motion.div>
                        ))}

                        {risks.length === 0 && goods.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                Awaiting data to generate insights...
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, score, color }: any) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
        <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-muted-foreground font-medium">{label}</span>
            <div className={`p-1.5 rounded-lg text-white opacity-80 ${color}`}>
                {icon}
            </div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-2">{value}</div>
        <Progress value={Math.min(100, Math.max(0, score))} className={`h-1.5 [&>div]:${color}`} />
    </div>
);
