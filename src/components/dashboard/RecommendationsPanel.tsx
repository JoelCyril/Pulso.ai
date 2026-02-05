import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lightbulb, TrendingUp } from "lucide-react";

interface Recommendation {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
}

interface RecommendationsPanelProps {
    recommendations: Recommendation[];
}

export const RecommendationsPanel = ({ recommendations }: RecommendationsPanelProps) => {
    return (
        <Card className="h-full glass-card border-white/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <CardTitle>Personalized Recommendations</CardTitle>
                </div>
                <CardDescription>AI-powered insights tailored for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto">
                {recommendations.map((rec, index) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`p-2 rounded shrink-0 ${rec.priority === "high"
                                    ? "bg-red-500/10 text-red-500"
                                    : rec.priority === "medium"
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : "bg-blue-500/10 text-blue-500"
                                    }`}
                            >
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                                    <Badge
                                        variant={
                                            rec.priority === "high"
                                                ? "destructive"
                                                : rec.priority === "medium"
                                                    ? "default"
                                                    : "secondary"
                                        }
                                        className="text-xs"
                                    >
                                        {rec.priority}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                                <span className="text-xs text-muted-foreground">{rec.category}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
};
