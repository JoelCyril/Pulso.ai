// Reminder and Goal Management Service for Chatbot

export interface Reminder {
    id: string;
    message: string;
    time: string; // HH:MM format
    frequency: 'once' | 'daily' | 'hourly';
    interval?: number; // for hourly reminders
    active: boolean;
    createdAt: Date;
}

export interface CustomGoal {
    id: string;
    title: string;
    description: string;
    target: string;
    current: string;
    progress: number;
    createdAt: Date;
}

// Parse reminder commands
export const parseReminderCommand = (text: string): Reminder | null => {
    const lowerText = text.toLowerCase();

    // Pattern: "remind me to [action] at [time]"
    const atTimePattern = /remind\s+me\s+to\s+(.+?)\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
    const atTimeMatch = text.match(atTimePattern);

    if (atTimeMatch) {
        const action = atTimeMatch[1].trim();
        let timeStr = atTimeMatch[2].trim();

        // Convert to 24-hour format
        const time = parseTime(timeStr);

        return {
            id: `reminder_${Date.now()}`,
            message: action,
            time,
            frequency: 'daily',
            active: true,
            createdAt: new Date(),
        };
    }

    // Pattern: "remind me to [action] every [X] hours"
    const everyHoursPattern = /remind\s+me\s+to\s+(.+?)\s+every\s+(\d+)\s+hours?/i;
    const everyHoursMatch = text.match(everyHoursPattern);

    if (everyHoursMatch) {
        const action = everyHoursMatch[1].trim();
        const interval = parseInt(everyHoursMatch[2]);

        return {
            id: `reminder_${Date.now()}`,
            message: action,
            time: new Date().toTimeString().slice(0, 5), // Current time
            frequency: 'hourly',
            interval,
            active: true,
            createdAt: new Date(),
        };
    }

    // Pattern: "remind me to [action]" (defaults to daily at current time)
    const simplePattern = /remind\s+me\s+to\s+(.+)/i;
    const simpleMatch = text.match(simplePattern);

    if (simpleMatch) {
        const action = simpleMatch[1].trim();

        return {
            id: `reminder_${Date.now()}`,
            message: action,
            time: new Date().toTimeString().slice(0, 5),
            frequency: 'daily',
            active: true,
            createdAt: new Date(),
        };
    }

    return null;
};

// Parse goal creation commands
export const parseGoalCommand = (text: string): CustomGoal | null => {
    const lowerText = text.toLowerCase();

    // Pattern: "create a goal to [description]"
    const createPattern = /create\s+(?:a\s+)?goal\s+to\s+(.+)/i;
    const createMatch = text.match(createPattern);

    if (createMatch) {
        const description = createMatch[1].trim();

        return {
            id: `goal_${Date.now()}`,
            title: description.charAt(0).toUpperCase() + description.slice(1),
            description,
            target: "Complete",
            current: "In Progress",
            progress: 0,
            createdAt: new Date(),
        };
    }

    // Pattern: "add goal: [description]"
    const addPattern = /add\s+goal:?\s+(.+)/i;
    const addMatch = text.match(addPattern);

    if (addMatch) {
        const description = addMatch[1].trim();

        return {
            id: `goal_${Date.now()}`,
            title: description.charAt(0).toUpperCase() + description.slice(1),
            description,
            target: "Complete",
            current: "In Progress",
            progress: 0,
            createdAt: new Date(),
        };
    }

    return null;
};

// Helper: Parse time string to HH:MM format
const parseTime = (timeStr: string): string => {
    const lowerTime = timeStr.toLowerCase();

    // Handle AM/PM
    const isPM = lowerTime.includes('pm');
    const isAM = lowerTime.includes('am');

    // Extract numbers
    const numbers = timeStr.match(/\d+/g);
    if (!numbers) return '12:00';

    let hours = parseInt(numbers[0]);
    const minutes = numbers.length > 1 ? parseInt(numbers[1]) : 0;

    // Convert to 24-hour format
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Save reminder to localStorage
export const saveReminder = (reminder: Reminder, userId: string): boolean => {
    try {
        const reminders = getReminders(userId);
        reminders.push(reminder);
        localStorage.setItem(`reminders_${userId}`, JSON.stringify(reminders));

        // Schedule browser notification
        scheduleNotification(reminder);

        return true;
    } catch (error) {
        console.error('Failed to save reminder:', error);
        return false;
    }
};

// Get all reminders for a user
export const getReminders = (userId: string): Reminder[] => {
    try {
        const stored = localStorage.getItem(`reminders_${userId}`);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
};

// Save custom goal
export const saveCustomGoal = (goal: CustomGoal, userId: string): boolean => {
    try {
        const goals = getCustomGoals(userId);
        goals.push(goal);
        localStorage.setItem(`customGoals_${userId}`, JSON.stringify(goals));
        return true;
    } catch (error) {
        console.error('Failed to save goal:', error);
        return false;
    }
};

// Get all custom goals for a user
export const getCustomGoals = (userId: string): CustomGoal[] => {
    try {
        const stored = localStorage.getItem(`customGoals_${userId}`);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
};

// Schedule browser notification
const scheduleNotification = (reminder: Reminder) => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
        const now = new Date();
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const targetTime = new Date(now);
        targetTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (targetTime <= now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        const delay = targetTime.getTime() - now.getTime();

        setTimeout(() => {
            new Notification('Pulso Health Reminder', {
                body: reminder.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
            });

            // Reschedule for next occurrence
            if (reminder.frequency === 'daily') {
                scheduleNotification(reminder);
            } else if (reminder.frequency === 'hourly' && reminder.interval) {
                setTimeout(() => scheduleNotification(reminder), reminder.interval * 60 * 60 * 1000);
            }
        }, delay);
    }
};

// Initialize reminder system
export const initializeReminderSystem = (userId: string) => {
    const reminders = getReminders(userId);
    reminders.forEach(reminder => {
        if (reminder.active) {
            scheduleNotification(reminder);
        }
    });
};
