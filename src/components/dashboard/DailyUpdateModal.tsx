import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HealthUpdateForm } from "@/components/health/HealthUpdateForm";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyUpdateModalProps {
    onUpdate: () => void;
}

export const DailyUpdateModal = ({ onUpdate }: DailyUpdateModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        checkDailyUpdate();

        // Check every minute if it's time for daily update
        const interval = setInterval(checkDailyUpdate, 60000);
        return () => clearInterval(interval);
    }, []);

    const checkDailyUpdate = () => {
        const today = new Date().toDateString();
        const lastUpdate = localStorage.getItem("lastHealthUpdate");

        if (lastUpdate !== today) {
            // Show notification reminder
            setShowNotification(true);

            // Auto-open modal after 5 seconds if not dismissed
            setTimeout(() => {
                if (localStorage.getItem("lastHealthUpdate") !== today) {
                    setIsOpen(true);
                    setShowNotification(false);
                }
            }, 5000);
        }
    };

    const handleUpdate = () => {
        const today = new Date().toDateString();
        localStorage.setItem("lastHealthUpdate", today);
        setIsOpen(false);
        setShowNotification(false);
        onUpdate();
    };

    const dismissNotification = () => {
        setShowNotification(false);
    };

    return (
        <>
            {/* Daily Update Notification */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-50"
                    >
                        <div className="bg-primary text-primary-foreground rounded-lg shadow-2xl p-4 flex items-center gap-3 max-w-sm">
                            <Bell className="w-5 h-5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Daily Health Update</p>
                                <p className="text-xs opacity-90">Time to log today's health metrics!</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsOpen(true);
                                        setShowNotification(false);
                                    }}
                                >
                                    Update
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={dismissNotification}
                                    className="text-primary-foreground hover:bg-primary-foreground/20"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Update Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Daily Health Update</DialogTitle>
                        <DialogDescription>
                            Update your health metrics for today. You can only update once per day.
                        </DialogDescription>
                    </DialogHeader>
                    <HealthUpdateForm onUpdate={handleUpdate} />
                </DialogContent>
            </Dialog>
        </>
    );
};
