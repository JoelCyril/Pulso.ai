import { motion } from "framer-motion";
import pulsoEarth from "@/assets/pulso_earth.png";

export const QuoteSection = () => {
    return (
        <section className="relative min-h-[80svh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-black py-16">
            {/* Background */}
            <div className="absolute inset-0">
                <img
                    src={pulsoEarth}
                    alt="Earth from space"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-black/60 mix-blend-multiply" />
            </div>

            <div className="container relative z-10 px-4 sm:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p className="text-sm md:text-base tracking-[0.3em] font-bold text-white mb-8 uppercase">
                        Technology that understands you
                    </p>

                    <blockquote className="max-w-4xl mx-auto">
                        <p className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-8">
                            "It's not about the technology, it's about the <span className="text-accent italic">people</span>."
                        </p>
                        <footer className="text-white/80 font-mono tracking-widest text-sm">
                            - STEVE JOBS
                        </footer>
                    </blockquote>
                </motion.div>
            </div>
        </section>
    );
};
