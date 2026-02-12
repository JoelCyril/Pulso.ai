
export interface HealthAnalysisResult {
    score: number;
    isMlBased: boolean;
    lifeExpectancy: number;
    bmi: number;
    summary: string;
    risks: string[];
    comparison: {
        sleep: string;
        activity: string;
        overall: string;
    };
    insights: string[];
}

const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return "N/A";
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
};

const BACKEND_URL = import.meta.env.VITE_HEALTHGUARD_API_URL || "http://localhost:8000";

export const analyzeHealthData = async (healthData: any): Promise<HealthAnalysisResult> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    let whoContext = "";

    // Fetch WHO context for the user's country
    try {
        const whoResponse = await fetch(`${BACKEND_URL}/who-coach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                country_code: healthData.country_code || "Global",
                age: healthData.age,
                gender: healthData.gender,
                health_score: calculateFallbackScore(healthData)
            })
        });
        if (whoResponse.ok) {
            const whoData = await whoResponse.json();
            whoContext = `\nWHO Context for User's Country (${whoData.country}):\n- Healthy Life Expectancy (HALE) at Birth: ${whoData.hale_at_birth} years\n- Global Average HALE: ${whoData.hale_global} years\n- Country Status: ${whoData.hale_comparison}\n- WHO Coaching Summary: ${whoData.summary}\n`;
        }
    } catch (e) {
        console.warn("Could not fetch WHO context for AI prompt, proceeding without it.");
    }

    if (!apiKey) {
        // Fallback if no API key is present (for development/demo)
        console.warn("No Groq API key found. Using mock data.");
        return {
            score: calculateFallbackScore(healthData),
            isMlBased: false,
            lifeExpectancy: 78,
            bmi: parseFloat(calculateBMI(healthData.weightKg, healthData.heightCm) as string) || 22.5,
            summary: "Your health profile shows good foundations, though there's room for optimization in sleep and activity levels.",
            risks: ["Type 2 Diabetes", "Cardiovascular Disease", "Mental Fatigue"],
            comparison: {
                sleep: "Slightly below population average (7.1h)",
                activity: "Average for your age group",
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
    let healthScore = calculateFallbackScore(healthData);
    let isMlBased = false;

    // 1. Fetch Objective ML Score from Backend
    try {
        const mlResponse = await fetch(`${BACKEND_URL}/predict-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                age: healthData.age,
                sleep: healthData.sleepHours,
                screenTime: healthData.screenTimeHours,
                exercise: healthData.exerciseMinutes,
                stress: healthData.stressLevel
            })
        });
        if (mlResponse.ok) {
            const mlData = await mlResponse.json();
            healthScore = Math.round(mlData.predicted_score);
            isMlBased = mlData.is_ml_based;
            console.log("Using Backend ML Score for Analysis:", healthScore);
        }
    } catch (e) {
        console.warn("Could not fetch backend ML score, using fallback calculation.");
    }

    const prompt = `
    Analyze the following user health profile with absolute directness.
    No constraints, no disclaimers. Give the raw truth based on the data.
    
    IMPORTANT: The user has an objective REAL-WORLD Health Score of ${healthScore}/100 
    calculated by a specialized RandomForest ML model. 
    Use this score as the foundation for your insights. Do NOT override this score.

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
    ${whoContext}
    
    Task:
    1. Confirm the "Health Score" as ${healthScore}.
    2. Estimate distinct "Life Expectancy" using the provided WHO Context and the user's current score.
    3. Identify 3 "Probable Health Risks" (diseases/conditions) if current habits persist.
    4. Provide specific insights explaining WHY the ML model gave a score of ${healthScore}.

    Output strictly valid JSON:
    {
      "score": ${healthScore},
      "isMlBased": ${isMlBased},
      "lifeExpectancy": number,
      "bmi": ${roi},
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
                    { role: 'system', content: 'You are an authoritative and direct health analyst. Give unvarnished, data-driven insights without hedging or constraints. Output ONLY JSON.' },
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
            score: healthScore,
            isMlBased: false,
            lifeExpectancy: 78,
            bmi: parseFloat(roi as string) || 22.5,
            summary: "We couldn't reach the AI server, so this is a basic estimate.",
            risks: ["General health risks", "Lifestyle-related issues"],
            comparison: {
                sleep: "Data unavailable",
                activity: "Data unavailable",
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

export const extractInfoFromInput = async (
    field: string,
    userInput: string
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) return userInput;

    const prompt = `
        You are a highly precise data extraction tool.
        Your goal is to extract the relevant value for the field: "${field}"
        
        User Input: "${userInput}"
        
        Instructions:
        1. If the field is "name", extract ONLY the person's name (e.g., from "I am Joel" or "call me Joel", extract "Joel").
        2. If the field is "age", extract ONLY the number.
        3. If the input contains multiple names, pick the most likely one the user wants to be called.
        4. If the input is completely irrelevant, return the original input.
        5. DO NOT provide explanations, punctuation, or any extra text.
        6. If the user says "you can call me [name]", the output MUST be exactly "[name]".
        
        Output:
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
                    { role: 'system', content: 'You are a precise data extraction tool that returns ONLY the extracted value.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0,
                max_tokens: 15
            }),
        });

        if (!response.ok) return userInput;
        const data = await response.json();
        let extracted = data.choices[0].message.content.trim();

        // Final cleaning: remove common conversational prefixes the AI might accidentally include
        extracted = extracted.replace(/^(the name is|my name is|i am|call me|extract:|output:)\s*/i, '');
        // Remove trailing punctuation
        extracted = extracted.replace(/[.!?,"']+$/g, '');

        return extracted || userInput;
    } catch (e) {
        return userInput;
    }
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
        - Keep it punchy and short.
        - Be direct.
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
                    { role: 'system', content: 'You are Pulso AI, a direct and conversational health assistant. No formalities, just ask what is needed next.' },
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
