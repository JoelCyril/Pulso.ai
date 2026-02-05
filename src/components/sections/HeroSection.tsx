import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import pulsoWaves from "@/assets/pulso_waves.png";

export const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden bg-primary">
      {/* Background with mesh gradient and texture */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-100 mix-blend-normal" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60 opacity-90" />
        <img
          src={pulsoWaves}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 py-20 sm:py-24 flex flex-col items-center justify-center min-h-svh text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 sm:mb-8 text-white font-sans drop-shadow-sm"
          >
            Your health, understood
            <span className="block mt-4 italic font-serif font-light opacity-90 tracking-normal">— not just measured</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed font-medium"
          >
            We don't just analyze data. We understand health.
          </motion.p>

        </motion.div>
      </div>
    </section>
  );
};
