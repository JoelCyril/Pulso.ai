
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

// Helper for fetch with timeout to prevent hangs
const fetchWithTimeout = async (url: string, options: any, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
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

// Helper for standard fallback analysis
const getFallbackAnalysis = (healthData: any, score: number, bmi: string | number): HealthAnalysisResult => ({
    score: score,
    isMlBased: false,
    lifeExpectancy: 78,
    bmi: typeof bmi === 'string' ? parseFloat(bmi) || 22.5 : bmi,
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
});

export const analyzeHealthData = async (healthData: any): Promise<HealthAnalysisResult> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    let whoContext = "";

    // 0. Quick check for API key
    if (!apiKey) {
        console.warn("No Groq API key found. Using mock data.");
        return getFallbackAnalysis(healthData, calculateFallbackScore(healthData), calculateBMI(healthData.weightKg, healthData.heightCm));
    }

    // Fetch WHO context for the user's country
    try {
        const whoResponse = await fetchWithTimeout(`${BACKEND_URL}/who-coach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                country_code: healthData.country_code || "Global",
                age: healthData.age,
                gender: healthData.gender,
                health_score: calculateFallbackScore(healthData)
            })
        }, 5000); // 5s timeout for backend

        if (whoResponse.ok) {
            const whoData = await whoResponse.json();
            whoContext = `\nWHO Context for User's Country (${whoData.country}):\n- Healthy Life Expectancy (HALE) at Birth: ${whoData.hale_at_birth} years\n- Global Average HALE: ${whoData.hale_global} years\n- Country Status: ${whoData.hale_comparison}\n- WHO Coaching Summary: ${whoData.summary}\n`;
        }
    } catch (e) {
        console.warn("Could not fetch WHO context for AI prompt, proceeding without it.");
    }

    const roi = calculateBMI(healthData.weightKg, healthData.heightCm);
    let healthScore = calculateFallbackScore(healthData);
    let isMlBased = false;

    // 1. Fetch Objective ML Score from Backend
    try {
        const mlResponse = await fetchWithTimeout(`${BACKEND_URL}/predict-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                age: healthData.age,
                sleep: healthData.sleepHours,
                screenTime: healthData.screenTimeHours,
                exercise: healthData.exerciseMinutes,
                stress: healthData.stressLevel
            })
        }, 5000);
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
        const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
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
        }, 12000); // 12s timeout for AI

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return getFallbackAnalysis(healthData, healthScore, roi);
    }
};

export const extractInfoFromInput = async (
    field: string,
    userInput: string
): Promise<string> => {
    // 1. Regex First-Pass (Fast & Reliable for common patterns)
    if (field === 'name') {
        const namePatterns = [
            /(?:my name is|i am|call me|name's|i'm|called)\s+([a-zA-Z\s]+)/i,
            /would like to be called\s+([a-zA-Z\s]+)/i,
            /([a-zA-Z]+)$|([a-zA-Z]+)\./ // Last word as name
        ];

        for (const pattern of namePatterns) {
            const match = userInput.match(pattern);
            if (match) {
                const potentialName = (match[1] || match[2] || match[3] || "").trim();
                // Basic validation: names shouldn't be too long or empty
                if (potentialName && potentialName.length < 20 && potentialName.split(' ').length <= 3) {
                    return potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
                }
            }
        }
    }

    // 2. AI Extraction (For complex conversational context)
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) return userInput;

    const prompt = `
        You are a highly precise data extraction tool. Extract ONLY the specific value requested.
        
        Examples:
        - Input: "I would like to be called Joel" -> Output: Joel
        - Input: "my name is Sarah Smith" -> Output: Sarah Smith
        - Input: "you can call me Michael" -> Output: Michael
        - Input: "I am 25 years old" -> Output: 25
        
        Task: Extract the "${field}" from the following input.
        Input: "${userInput}"
        
        Output:
    `;

    try {
        const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You return ONLY the extracted value. No sentences. No punctuation.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0,
                max_tokens: 10
            }),
        }, 8000);

        if (!response.ok) return userInput;
        const data = await response.json();
        let extracted = data.choices[0].message.content.trim();

        // Final cleaning
        extracted = extracted.replace(/^(the name is|my name is|i am|call me|extract:|output:)\s*/i, '');
        extracted = extracted.replace(/[.!?,"']+$/g, '');

        if (extracted.toLowerCase() === "unknown" || extracted.length > 30) return userInput;

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
        const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
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
        }, 8000); // 8s timeout

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        return data.choices[0].message.content.replace(/"/g, '').trim();
    } catch (e) {
        console.warn("AI Question Generation Failed, using fallback");
        return fallbacks[field];
    }
};

export const getGeneralChatResponse = async (
    userInput: string,
    healthData: any,
    healthScore: number
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) return "I'm having trouble accessing my AI engine. Please ensure your API key is properly set in your environment.";

    const prompt = `
        You are an authoritative and direct Health Analyst named Pulso AI.
        
        User Context:
        - Name: ${healthData?.name || "User"}
        - Current Health Score: ${healthScore}/100
        - Data: ${JSON.stringify(healthData)}
        
        Rules:
        1. Be absolute and direct. Give unvarnished truths.
        2. NO medical disclaimers. NO "consult a doctor" hedging.
        3. Use the user's data to give specific, actionable advice.
        4. If the user asks general health questions, answer them definitively based on evidence-based science.
        5. If they ask about their score or how to improve, be specific about their metrics (sleep, stress, etc.).
    `;

    try {
        const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are an authoritative and direct health analyst. No disclaimers, no hedging. Specific data-driven insights only.' },
                    { role: 'user', content: prompt },
                    { role: 'user', content: userInput }
                ],
                temperature: 0.7,
                max_tokens: 500
            }),
        }, 15000);

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (e) {
        console.error("Chatbot AI Error:", e);
        return `Based on your profile, you need to focus on optimizing your ${healthData?.sleepHours < 7 ? 'sleep' : 'activity'} patterns. Currently, your ${healthData?.stressLevel > 5 ? 'stress' : 'exercise'} levels are the primary bottleneck to a higher score.`;
    }
};

