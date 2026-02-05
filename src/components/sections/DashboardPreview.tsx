import { motion } from "framer-motion";
import { TrendingUp, Activity, Sun, Moon, Zap } from "lucide-react";

const weekData = [
  { day: "Mon", score: 72, mood: "Good" },
  { day: "Tue", score: 68, mood: "Okay" },
  { day: "Wed", score: 75, mood: "Good" },
  { day: "Thu", score: 82, mood: "Great" },
  { day: "Fri", score: 78, mood: "Good" },
  { day: "Sat", score: 85, mood: "Great" },
  { day: "Sun", score: 88, mood: "Great" },
];

export const DashboardPreview = () => {
  const currentScore = 88;
  const maxHeight = 120;

  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Wellness at a Glance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An intuitive dashboard that transforms complex data into clear, actionable insights
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="glass-card p-8 md:p-12 shadow-glow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main chart area */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Weekly Mood Trend</h3>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12% this week</span>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="flex items-end justify-between gap-3 h-40 mb-4">
                  {weekData.map((item, index) => (
                    <motion.div
                      key={item.day}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(item.score / 100) * maxHeight}px` }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                      className="flex-1 rounded-t-xl bg-gradient-to-t from-primary to-primary/60 relative group cursor-pointer hover:from-primary/90"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.score}% - {item.mood}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between">
                  {weekData.map((item) => (
                    <span key={item.day} className="flex-1 text-center text-sm text-muted-foreground">
                      {item.day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Wellness score card */}
              <div className="space-y-6">
                {/* Main score */}
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Daily Wellness Score</p>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative inline-flex items-center justify-center"
                  >
                    <svg className="w-32 h-32 -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-secondary"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-primary"
                        initial={{ strokeDasharray: "0 360" }}
                        whileInView={{ strokeDasharray: `${(currentScore / 100) * 352} 352` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">{currentScore}</span>
                      <span className="text-xs text-muted-foreground">out of 100</span>
                    </div>
                  </motion.div>
                  <p className="mt-3 text-sm font-medium text-primary">Great!</p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4 text-center">
                    <Activity className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-lg font-semibold text-foreground">7.2h</p>
                    <p className="text-xs text-muted-foreground">Avg Sleep</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-lg font-semibold text-foreground">Low</p>
                    <p className="text-xs text-muted-foreground">Stress Level</p>
                  </div>
                </div>

                {/* Day/Night indicator */}
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-primary" />
                    <span>Morning peak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className="w-4 h-4" />
                    <span>Night dip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow opacity-30" />
        </motion.div>
      </div>
    </section>
  );
};
