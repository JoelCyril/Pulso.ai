import { motion } from "framer-motion";
import pulsoAnatomy from "@/assets/pulso_anatomy.png";

export const TrustSection = () => {
    return (
        <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
            <div className="container px-4 sm:px-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl transform scale-90" />
                            <img
                                src={pulsoAnatomy}
                                alt="Human Anatomy Sketch"
                                className="relative z-10 w-full max-w-md mix-blend-multiply opacity-90 sepia-[.3]"
                            />
                        </div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-12"
                    >
                        {/* List Items */}
                        <div className="space-y-6">
                            {[
                                "Input health data",
                                "AI understands patterns",
                                "From data to clarity",
                                "Better health decisions"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="h-[1px] w-12 bg-primary/30 group-hover:w-20 transition-all duration-500" />
                                    <span className="text-xl md:text-2xl font-light text-foreground">{item}</span>
                                </div>
                            ))}
                        </div>

                        {/* Headline block */}
                        <div className="bg-primary text-white p-6 sm:p-10 md:p-12 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Build on Trust</h2>
                            <p className="text-white/90 leading-relaxed font-light">
                                Pulso turns your health data into clear, meaningful insights that you can trust.
                                We prioritize your privacy and ensure your personal information is always secure.
                                Everything we do is designed to put people before numbers.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
