import { motion } from "framer-motion";
import { Globe, Lock, Users } from "lucide-react";

const commitments = [
  {
    icon: Globe,
    title: "UN SDG 3.4 Aligned",
    description: "We directly support the United Nations Sustainable Development Goal 3.4, which aims to reduce premature mortality from non-communicable diseases and promote mental health.",
  },
  {
    icon: Users,
    title: "Accessible to All",
    description: "Our platform is designed with accessibility at its core—WCAG 2.1 AA compliant, available in 20+ languages, with subsidized access for underserved communities.",
  },
  {
    icon: Lock,
    title: "Ethical AI Practices",
    description: "Transparent algorithms, no black-box decisions. You own your data. Our AI is regularly audited for bias, and we publish annual transparency reports.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export const SDGCommitment = () => {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Ethical Commitment
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building technology that respects human dignity, promotes equity,
            and contributes to global mental health goals.
          </p>
        </motion.div>

        {/* Three columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {commitments.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-primary mb-6">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* SDG 3 visual banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 glass-card p-8 md:p-12 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">3</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-primary uppercase tracking-wide">
                Sustainable Development Goal
              </p>
              <p className="text-xl font-bold text-foreground">
                Good Health and Well-being
              </p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            "By 2030, reduce by one third premature mortality from non-communicable diseases
            through prevention and treatment and promote mental health and well-being."
          </p>
          <p className="text-sm text-primary mt-4 font-medium">— UN SDG Target 3.4</p>
        </motion.div>
      </div>
    </section>
  );
};
