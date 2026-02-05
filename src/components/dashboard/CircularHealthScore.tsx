import { motion } from "framer-motion";
import { Heart, TrendingUp } from "lucide-react";

interface CircularHealthScoreProps {
    score: number;
    lifeExpectancy?: number;
}

export const CircularHealthScore = ({ score, lifeExpectancy }: CircularHealthScoreProps) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#10b981"; // green
        if (score >= 60) return "#f59e0b"; // yellow
        return "#ef4444"; // red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Needs Improvement";
    };

    return (
        <div className="flex items-center justify-center">
            <div className="relative">
                {/* SVG Circle */}
                <svg className="transform -rotate-90" width="280" height="280">
                    {/* Background circle */}
                    <circle
                        cx="140"
                        cy="140"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="20"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="140"
                        cy="140"
                        r={radius}
                        stroke={getScoreColor(score)}
                        strokeWidth="20"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="text-center"
                    >
                        <div className="text-6xl font-bold" style={{ color: getScoreColor(score) }}>
                            {score}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">/ 100</div>
                        <div className="text-sm font-medium mt-2">{getScoreLabel(score)}</div>
                    </motion.div>
                </div>
            </div>

            {lifeExpectancy && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-8 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4 shadow-xl"
                >
                    <div className="p-2 bg-white/20 rounded-full text-white">
                        <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60 leading-none mb-1">Estimated Longevity</p>
                        <p className="text-xl font-bold text-white tracking-tight">{lifeExpectancy} <span className="text-xs font-medium opacity-70">years</span></p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
