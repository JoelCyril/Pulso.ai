import { motion } from "framer-motion";

const cards = [
    {
        title: "Pulso is a modern health platform",
        content: "Focused on understanding people, not just measuring numbers. By combining technology, insight, and care, we aim to support healthier lives through smarter decisions."
    },
    {
        title: "We're a new generation of health thinkers",
        content: "Who believe wellness is about more than reports and readings. It's about understanding your body and living better every day."
    },
    {
        title: "We put people at the center of health",
        content: "By focusing on understanding rather than just numbers, we aim to create a more thoughtful and compassionate health experience."
    }
];

export const UnderstandingHealthSection = () => {
    return (
        <section className="py-16 sm:py-24 bg-background">
            <div className="container px-4 sm:px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-serif text-primary mb-4">
                        understanding health , <span className="italic">differently</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 sm:p-8 rounded-none border-l-2 border-primary/20 hover:border-primary transition-colors duration-300"
                        >
                            <h3 className="text-xl font-serif italic text-primary mb-4">{card.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{card.content}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
