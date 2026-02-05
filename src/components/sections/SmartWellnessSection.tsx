import { motion } from "framer-motion";
import pulsoWaves from "@/assets/pulso_waves.png";

export const SmartWellnessSection = () => {
    return (
        <section className="relative py-32 overflow-hidden bg-primary">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={pulsoWaves}
                    alt="Abstract waves"
                    className="w-full h-full object-cover opacity-60 mix-blend-soft-light"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary/90 mix-blend-multiply" />
            </div>

            <div className="container relative z-10 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Big Text Labels */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-left"
                    >
                        <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter opacity-20 select-none">SMART</h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-right"
                    >
                        <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter opacity-20 select-none">WELLNESS</h2>
                    </motion.div>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-12 max-w-4xl mx-auto bg-background/95 backdrop-blur rounded-3xl p-12 shadow-2xl border border-primary/10"
                >
                    <h3 className="text-3xl md:text-5xl font-serif text-primary mb-6 leading-tight">
                        Smarter AI for deeper <br />
                        <span className="italic text-accent">health understanding</span>
                    </h3>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        We combine technology and health knowledge to turn data into understanding and support better health decisions.
                        We guide people in understanding their health beyond numbers, empowering them to make informed and confident choices.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
