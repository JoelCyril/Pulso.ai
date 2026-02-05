import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Moon, Activity, Monitor, Brain, Droplets } from "lucide-react";

interface OverviewPanelProps {
    healthData: any;
    healthScore: number;
    analysisResult?: any;
}

export const OverviewPanel = ({ healthData, healthScore, analysisResult }: OverviewPanelProps) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    const metrics = [
        {
            icon: <Moon className="w-5 h-5" />,
            label: "Sleep",
            value: `${healthData?.sleepHours || 0}h`,
            target: "7-9h",
            progress: healthData?.sleepHours ? (healthData.sleepHours / 9) * 100 : 0,
        },
        {
            icon: <Activity className="w-5 h-5" />,
            label: "Exercise",
            value: `${healthData?.exerciseMinutes || 0}m`,
            target: "30m+",
            progress: healthData?.exerciseMinutes ? Math.min(100, (healthData.exerciseMinutes / 30) * 100) : 0,
        },
        {
            icon: <Monitor className="w-5 h-5" />,
            label: "Screen Time",
            value: `${healthData?.screenTimeHours || 0}h`,
            target: "<6h",
            progress: healthData?.screenTimeHours ? Math.max(0, 100 - ((healthData.screenTimeHours - 6) / 6) * 100) : 100,
        },
        {
            icon: <Brain className="w-5 h-5" />,
            label: "Stress Level",
            value: `${healthData?.stressLevel || 0}/10`,
            target: "<5/10",
            progress: healthData?.stressLevel ? Math.max(0, 100 - (healthData.stressLevel / 10) * 100) : 100,
        },
    ];

    return (
        <Card className="glass-card border-white/20">
            <CardHeader>
                <CardTitle>Health Overview</CardTitle>
                <CardDescription>Your comprehensive health metrics summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Health Score */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Overall Health Score</h4>
                        <span className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
                            {healthScore}
                        </span>
                    </div>
                    <Progress value={healthScore} className="h-3" />
                </div>

                {/* AI Analysis Summary */}
                {analysisResult?.summary && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-primary" />
                            AI Analysis
                        </h4>
                        <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {metrics.map((metric, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-card space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {metric.icon}
                                <span className="text-sm font-medium">{metric.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{metric.value}</span>
                                <span className="text-xs text-muted-foreground">/ {metric.target}</span>
                            </div>
                            <Progress value={metric.progress} className="h-1.5" />
                        </div>
                    ))}
                </div>

                {/* Probable Risks */}
                {analysisResult?.risks && analysisResult.risks.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Health Risks to Monitor</h4>
                        <div className="space-y-2">
                            {analysisResult.risks.map((risk: string, index: number) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                    <span className="text-muted-foreground">{risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
