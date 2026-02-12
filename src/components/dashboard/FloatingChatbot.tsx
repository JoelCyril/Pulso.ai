import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chatbot } from "@/components/chatbot/Chatbot";

interface FloatingChatbotProps {
    healthData: any;
    healthScore: number;
    whoInsight?: string;
    onDashboardUpdate: () => void;
}

export const FloatingChatbot = ({ healthData, healthScore, whoInsight, onDashboardUpdate }: FloatingChatbotProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button - Only show when closed */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            size="lg"
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all hover:scale-110 border-2 border-white/30"
                        >
                            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chatbot Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[450px] max-w-[calc(100vw-2rem)] sm:max-w-[450px] h-[calc(100vh-8rem)] sm:h-[650px] max-h-[650px]"
                    >
                        <Card className="shadow-2xl border-2 border-white/30 h-full flex flex-col overflow-hidden glass-card bg-gradient-to-br from-white/25 via-white/15 to-white/20 backdrop-blur-2xl">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 backdrop-blur-xl text-black p-4 flex items-center justify-between shrink-0 border-b border-black/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black/10 rounded-full">
                                        <MessageSquare className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-black">Pulso AI</h3>
                                        <p className="text-xs text-black/60 font-medium">Your Health Assistant</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="text-black hover:bg-black/10 transition-all rounded-full h-9 w-9 p-0"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Chatbot Content */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <Chatbot
                                    healthData={healthData}
                                    healthScore={healthScore}
                                    whoInsight={whoInsight}
                                    onDashboardUpdate={onDashboardUpdate}
                                />
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
