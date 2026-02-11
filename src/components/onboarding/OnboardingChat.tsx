import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface HealthData {
    name: string;
    age: number;
    gender: string;
    heightCm: number;
    weightKg: number;
    alcoholDrinks: number;
    sleepHours: number;
    screenTimeHours: number;
    exerciseMinutes: number;
    stressLevel: number;
    waterLiters: number;
    nationality: string;
    [key: string]: any;
}

interface OnboardingChatProps {
    healthData: HealthData;
    setHealthData: (data: HealthData) => void;
    onComplete: () => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

interface Message {
    id: string;
    sender: "bot" | "user";
    text: string;
    timestamp: Date;
}

export const OnboardingChat = ({ healthData, setHealthData, onComplete, onAnalyze, isAnalyzing }: OnboardingChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const steps = [
        {
            field: "intro",
            question: "Hello! I'm Pulso AI. I'm here to understand your health better. First, what should I call you?",
            inputType: "text",
        },
        {
            field: "age",
            question: (name: string) => `Nice to meet you, ${name}. To give you accurate insights, how old are you?`,
            inputType: "number",
        },
        {
            field: "gender",
            question: "Thanks. For accurate health metrics, are you biologically Male or Female?",
            inputType: "options",
            options: ["Male", "Female"],
        },
        {
            field: "heightCm",
            question: "To calculate accurate metrics like BMI, how tall are you (in cm)?",
            inputType: "slider",
            min: 140,
            max: 220,
            step: 1,
            suffix: " cm",
        },
        {
            field: "weightKg",
            question: "And for your body composition analysis, what is your weight (in kg)?",
            inputType: "slider",
            min: 40,
            max: 150,
            step: 1,
            suffix: " kg",
        },
        {
            field: "alcoholDrinks",
            question: "Lifestyle check: How many alcoholic drinks do you consume per week?",
            inputType: "slider",
            min: 0,
            max: 30,
            step: 1,
            suffix: " drinks",
        },
        {
            field: "sleepHours",
            question: "Sleep is crucial for recovery. On average, how many hours do you sleep per night?",
            inputType: "slider",
            min: 2,
            max: 12,
            step: 0.5,
            suffix: " hours",
        },
        {
            field: "screenTimeHours",
            question: "In our digital world, screen time matters. Roughly how many hours a day do you spend looking at screens?",
            inputType: "slider",
            min: 0,
            max: 18,
            step: 0.5,
            suffix: " hours",
        },
        {
            field: "exerciseMinutes",
            question: "Movement is medicine. How many minutes of physical activity do you get daily?",
            inputType: "slider",
            min: 0,
            max: 180,
            step: 5,
            suffix: " min",
        },
        {
            field: "stressLevel",
            question: "On a scale of 1 to 10, how high would you say your average stress level is?",
            inputType: "slider",
            min: 1,
            max: 10,
            step: 1,
            suffix: "/10",
        },
        {
            field: "completion",
            question: "Thank you! I have analyzed your inputs. You can review your realtime analysis in the next tab, or click 'Complete' to finish.",
            inputType: "completion",
        },
    ];

    const addMessage = (text: string, sender: "bot" | "user") => {
        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            sender,
            text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    useEffect(() => {
        // Initial greeting
        if (messages.length === 0) {
            addMessage(steps[0].question as string, "bot");
        }

        // Trigger analysis when reaching the last step
        if (steps[currentStep].field === 'completion') {
            onAnalyze();
        }
    }, [currentStep, messages.length]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSliderChange = (value: number[]) => {
        const val = value[0];
        const currentField = steps[currentStep].field as keyof HealthData;
        setHealthData({ ...healthData, [currentField]: val });
    };

    const fetchNextQuestion = async (nextStepIndex: number) => {
        if (nextStepIndex >= steps.length) return;

        setIsTyping(true);
        const nextField = steps[nextStepIndex].field;

        try {
            // Lazy load the service to avoid circular deps or heavy init
            const { generateNextQuestion } = await import("@/services/aiHealthService");
            // Use current healthData state
            const question = await generateNextQuestion(nextField, healthData);
            addMessage(question, "bot");
        } catch (error) {
            // Fallback to static question if AI fails
            const staticQ = steps[nextStepIndex].question;
            const text = typeof staticQ === "function" ? staticQ(healthData.name) : staticQ;
            addMessage(text, "bot");
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // 1. Add User Message
        addMessage(inputValue, "user");

        // 2. Update Data
        const currentField = steps[currentStep].field;
        if (currentField === 'intro') {
            setIsTyping(true);
            const { extractInfoFromInput, generateNextQuestion } = await import("@/services/aiHealthService");
            const extractedName = await extractInfoFromInput("name", inputValue);
            const newName = extractedName || inputValue;

            setHealthData({ ...healthData, name: newName });
            setInputValue("");

            // 3. Move to next step
            const nextStep = currentStep + 1;
            if (nextStep < steps.length) {
                setCurrentStep(nextStep);
                const question = await generateNextQuestion(steps[nextStep].field, { ...healthData, name: newName });
                addMessage(question, "bot");
                setIsTyping(false);
                return;
            }
        }

        if (currentField === 'age') {
            setIsTyping(true);
            const { extractInfoFromInput, generateNextQuestion } = await import("@/services/aiHealthService");
            const extractedAge = await extractInfoFromInput("age", inputValue);
            const age = parseInt(extractedAge) || parseInt(inputValue) || 25;

            setHealthData({ ...healthData, age });
            setInputValue("");

            const nextStep = currentStep + 1;
            if (nextStep < steps.length) {
                setCurrentStep(nextStep);
                const question = await generateNextQuestion(steps[nextStep].field, { ...healthData, age });
                addMessage(question, "bot");
                setIsTyping(false);
                return;
            }
        }

        setInputValue("");

        // Generic move to next step for non-intro fields (since they don't affect the prompt context as much as name)
        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
            setCurrentStep(nextStep);
            fetchNextQuestion(nextStep);
        }
    };

    const handleOptionSelect = (option: string) => {
        addMessage(option, "user");
        setHealthData({ ...healthData, gender: option });

        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
            setCurrentStep(nextStep);
            fetchNextQuestion(nextStep);
        }
    };

    const handleSliderSubmit = () => {
        const step = steps[currentStep];
        const field = step.field as keyof HealthData;
        const val = healthData[field];
        let displayVal = `${val}`;
        if (step.suffix) displayVal += step.suffix;

        addMessage(displayVal, "user");

        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
            setCurrentStep(nextStep);
            fetchNextQuestion(nextStep);
        }
    };


    const currentStepConfig = steps[currentStep];

    return (
        <div className="flex flex-col h-full w-full bg-white/50 backdrop-blur-md rounded-xl overflow-hidden border border-primary/10">

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.sender === "user"
                                ? "bg-primary text-primary-foreground ml-4"
                                : "bg-white border border-primary/10 text-foreground mr-4 shadow-sm"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1 opacity-70">
                                {msg.sender === "bot" ? <Bot size={14} /> : <User size={14} />}
                                <span className="text-[10px] uppercase tracking-wider font-bold">
                                    {msg.sender === "bot" ? "Pulso AI" : "You"}
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white border border-primary/10 rounded-2xl px-4 py-3 mr-4 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 border-t border-primary/10">

                {/* Dynamic Inputs based on step type */}
                {!isTyping && (
                    <div className="w-full">
                        {currentStepConfig.inputType === "text" || currentStepConfig.inputType === "number" ? (
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder={currentStepConfig.inputType === "number" ? "Enter a number..." : "Type your answer..."}
                                    type={currentStepConfig.inputType}
                                    className="bg-white"
                                    autoFocus
                                />
                                <Button onClick={handleSend} size="icon" className="bg-primary hover:bg-primary/90">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : currentStepConfig.inputType === "options" ? (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {currentStepConfig.options?.map(opt => (
                                    <Button key={opt} variant="outline" onClick={() => handleOptionSelect(opt)} className="rounded-full px-6 hover:bg-primary hover:text-white transition-colors">
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        ) : currentStepConfig.inputType === "slider" ? (
                            <div className="space-y-6 px-4 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Adjust Value:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {(healthData[currentStepConfig.field as keyof HealthData] as number)}{currentStepConfig.suffix}
                                    </span>
                                </div>
                                <Slider
                                    value={[(healthData[currentStepConfig.field as keyof HealthData] as number) || currentStepConfig.min || 0]}
                                    min={currentStepConfig.min}
                                    max={currentStepConfig.max}
                                    step={currentStepConfig.step}
                                    onValueChange={handleSliderChange}
                                    className="py-4"
                                />
                                <Button onClick={handleSliderSubmit} className="w-full">Confirm</Button>
                            </div>
                        ) : currentStepConfig.inputType === "completion" ? (
                            <Button onClick={onComplete} className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90" disabled={isAnalyzing}>
                                {isAnalyzing ? (
                                    <>Calculating Health Score... <Loader2 className="w-5 h-5 ml-2 animate-spin" /></>
                                ) : (
                                    <>Complete Profile <Send className="w-5 h-5 ml-2" /></>
                                )}
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};
