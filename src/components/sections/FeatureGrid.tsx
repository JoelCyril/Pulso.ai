import { motion } from "framer-motion";
import { Brain, Shield, Heart } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Predictive Mood Analytics",
    description: "Our AI analyzes patterns in your responses to detect early signs of burnout before they escalate, giving you actionable insights.",
    gradient: "from-primary/20 to-accent/30",
  },
  {
    icon: Shield,
    title: "Ethical Data Privacy",
    description: "Your mental health data is encrypted end-to-end. We never sell or share your information. Full transparency in how AI uses your data.",
    gradient: "from-accent/30 to-primary/20",
  },
  {
    icon: Heart,
    title: "Personalized Care Paths",
    description: "Receive tailored recommendations based on your unique stress profile, lifestyle, and goals. Adaptive support that evolves with you.",
    gradient: "from-primary/30 to-accent/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export const FeatureGrid = () => {
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
            AI That Cares
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with empathy at its core, our platform combines cutting-edge technology
            with ethical practices to support your mental well-being.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`group relative overflow-hidden rounded-3xl p-8 glass-card hover:shadow-glow transition-all duration-500 ${index === 1 ? "md:translate-y-8" : ""
                }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative corner */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
