import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Moon, Activity, Monitor, Heart, Droplets, Target } from "lucide-react";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
}

interface AchievementsGridProps {
    achievements: Achievement[];
}

const iconMap: Record<string, React.ReactNode> = {
    "moon": <Moon className="w-6 h-6" />,
    "activity": <Activity className="w-6 h-6" />,
    "monitor": <Monitor className="w-6 h-6" />,
    "heart": <Heart className="w-6 h-6" />,
    "droplets": <Droplets className="w-6 h-6" />,
    "trophy": <Trophy className="w-6 h-6" />,
    "target": <Target className="w-6 h-6" />,
};

export const AchievementsGrid = ({ achievements }: AchievementsGridProps) => {
    return (
        <Card className="h-full glass-card border-white/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <CardTitle>Achievements</CardTitle>
                </div>
                <CardDescription>Unlock badges as you progress</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                        {achievements.map((achievement, index) => (
                            <Tooltip key={achievement.id}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`
                      relative aspect-square rounded-lg sm:rounded-xl flex items-center justify-center cursor-pointer
                      transition-all duration-300 hover:scale-110
                      ${achievement.unlocked
                                                ? "bg-gradient-to-br from-primary to-primary/60 text-white shadow-lg shadow-primary/50"
                                                : "bg-muted/50 text-muted-foreground border-2 border-dashed border-border"
                                            }
                    `}
                                    >
                                        <div className="w-5 h-5 sm:w-6 sm:h-6">{iconMap[achievement.icon] || <Trophy className="w-full h-full" />}</div>

                                        {achievement.unlocked && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                                            >
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                    <div className="space-y-1">
                                        <p className="font-semibold">{achievement.title}</p>
                                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                        {!achievement.unlocked && (
                                            <div className="mt-2">
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    Progress: {Math.round(achievement.progress)}%
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${achievement.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
};
