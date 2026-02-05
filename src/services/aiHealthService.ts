
export interface HealthAnalysisResult {
    score: number;
    summary: string;
    comparison: {
        sleep: string;
        activity: string;
        screenTime: string;
        overall: string;
    };
    insights: string[];
}

const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return "N/A";
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
};

export const analyzeHealthData = async (healthData: any): Promise<HealthAnalysisResult> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        // Fallback if no API key is present (for development/demo)
        console.warn("No Groq API key found. Using mock data.");
        return {
            score: 72,
            summary: "Your health profile shows good foundations, though there's room for optimization in sleep and activity levels.",
            comparison: {
                sleep: "Slightly below population average (7.1h)",
                activity: "Average for your age group",
                screenTime: "Higher than recommended limits",
                overall: "You represent the top 45% of similar profiles"
            },
            insights: [
                "Increasing sleep by 45 mins could boost your score by ~8 points",
                "Reducing screen time before bed correlates with 20% better sleep quality",
                "Your hydration is excellent, keeping you in the top tier for recovery"
            ]
        };
    }

    const roi = calculateBMI(healthData.weightKg, healthData.heightCm);

    const prompt = `
    You are an expert Health Data Analyst & Medical Futurist AI. 
    Analyze the following user health profile.
    
    User Profile:
    - Name: ${healthData.name}
    - Age: ${healthData.age}
    - Gender: ${healthData.gender}
    - Height: ${healthData.heightCm} cm
    - Weight: ${healthData.weightKg} kg
    - BMI: ${roi}
    - Sleep: ${healthData.sleepHours} hours/day
    - Exercise: ${healthData.exerciseMinutes} minutes/day
    - Alcohol Consumption: ${healthData.alcoholDrinks} drinks/week
    - Screen Time: ${healthData.screenTimeHours} hours/day
    - Stress Level: ${healthData.stressLevel}/10
    
    Task:
    1. Calculate a "Health Score" (0-100).
    2. Estimate distinct "Life Expectancy" based on actuarial data trends for this profile.
    3. Identify 3 "Probable Health Risks" (diseases/conditions) if current habits persist.
    4. Provide specific insights.

    Output strictly valid JSON:
    {
      "score": number,
      "lifeExpectancy": number (e.g. 84),
      "bmi": number,
      "summary": "1-2 sentence overview",
      "risks": ["Risk 1", "Risk 2", "Risk 3"],
      "comparison": {
        "sleep": "string",
        "activity": "string",
        "overall": "string"
      },
      "insights": ["insight 1", "insight 2", "insight 3"]
    }
  `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are a helpful JSON-speaking health analyst. Output ONLY JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Return fallback data on error to prevent app crash
        return {
            score: calculateFallbackScore(healthData),
            summary: "We couldn't reach the AI server, so this is a basic estimate.",
            comparison: {
                sleep: "Data unavailable",
                activity: "Data unavailable",
                screenTime: "Data unavailable",
                overall: "Data unavailable"
            },
            insights: [
                "Please check your internet connection and try again.",
                "Ensure your API key is correctly configured."
            ]
        };
    }
};

// Simple fallback calculation logic
const calculateFallbackScore = (data: any) => {
    let score = 70;
    if (data.sleepHours >= 7) score += 5;
    if (data.exerciseMinutes >= 30) score += 5;
    if (data.alcoholDrinks <= 2) score += 5;
    if (data.stressLevel <= 4) score += 5;
    if (data.screenTimeHours > 6) score -= 5;
    return Math.min(100, Math.max(0, score));
};

export const generateNextQuestion = async (
    field: string,
    healthData: any
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const name = healthData.name || "friend";

    // Fallback questions if offline/no key
    const fallbacks: Record<string, string> = {
        age: `Nice to meet you, ${name}. To customize your plan, how old are you?`,
        gender: "Thanks. For biological accuracy, which gender do you identify with?",
        heightCm: "To calculate accurate metrics like BMI, how tall are you (in cm)?",
        weightKg: "And for your body composition analysis, what is your weight (in kg)?",
        alcoholDrinks: "Lifestyle check: How many alcoholic drinks do you consume per week?",
        sleepHours: "Sleep is the foundation of health. How many hours do you typically get?",
        screenTimeHours: "In our digital world, screen time adds up. How many hours a day are you on devices?",
        exerciseMinutes: "Movement is key. How many active minutes do you get each day?",
        stressLevel: "Mental wellness matters. On a scale of 1-10, how stressed do you feel lately?",
        completion: "I have everything I need! Ready to see your health analysis?"
    };

    if (!apiKey || !fallbacks[field]) return fallbacks[field] || "Next question...";

    const prompt = `
        You are Pulso AI, a friendly and empathetic health assistant.
        The user's name is "${name}".
        
        Generate a short, conversational question to ask the user for their: ${field}.
        
        Context:
        - If asking for age, be polite.
        - If asking for sleep, mention recovery.
        - If asking for stress, be supportive.
        
        Rules:
        - Keep it under 2 sentences.
        - Be natural and warm.
        - Do NOT include quotation marks.
        - Ask ONLY for the specific field requested.
    `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are a warm, concise AI health assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 60
            }),
        });

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        return data.choices[0].message.content.replace(/"/g, '').trim();
    } catch (e) {
        console.warn("AI Question Generation Failed, using fallback");
        return fallbacks[field];
    }
};
