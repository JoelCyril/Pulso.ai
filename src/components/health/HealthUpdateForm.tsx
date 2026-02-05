import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface HealthUpdateFormProps {
  onUpdate: () => void;
}

export const HealthUpdateForm = ({ onUpdate }: HealthUpdateFormProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(30);
  const [screenTimeHours, setScreenTimeHours] = useState<number>(4);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [waterLiters, setWaterLiters] = useState<number>(2);

  // Get current week start date (Monday)
  const getWeekStart = (date: Date = new Date()): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toDateString();
  };

  // Calculate health score
  const calculateHealthScore = (data: any): number => {
    let score = 100;
    
    if (data.sleepHours < 6 || data.sleepHours > 9) score -= 15;
    else if (data.sleepHours < 7 || data.sleepHours > 8) score -= 5;
    
    if (data.exerciseMinutes < 15) score -= 20;
    else if (data.exerciseMinutes < 30) score -= 10;
    
    if (data.screenTimeHours > 8) score -= 15;
    else if (data.screenTimeHours > 6) score -= 8;
    
    if (data.stressLevel > 7) score -= 20;
    else if (data.stressLevel > 5) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  // Load existing data for selected date
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.id) return;

    const weekStart = getWeekStart(selectedDate);
    const weeklyData = JSON.parse(localStorage.getItem(`weeklyData_${currentUser.id}`) || "{}");
    const weekData = weeklyData[weekStart] || {};
    const dateKey = selectedDate.toDateString();
    const dayData = weekData[dateKey];

    if (dayData) {
      setSleepHours(dayData.sleepHours || 7);
      setExerciseMinutes(dayData.exerciseMinutes || 30);
      setScreenTimeHours(dayData.screenTimeHours || 4);
      setStressLevel(dayData.stressLevel || 5);
      setWaterLiters(dayData.waterLiters || 2);
    } else {
      // Load from main health data if no daily data
      const storedHealthData = JSON.parse(localStorage.getItem(`healthData_${currentUser.id}`) || "{}");
      setSleepHours(storedHealthData.sleepHours || 7);
      setExerciseMinutes(storedHealthData.exerciseMinutes || 30);
      setScreenTimeHours(storedHealthData.screenTimeHours || 4);
      setStressLevel(storedHealthData.stressLevel || 5);
      setWaterLiters(2);
    }
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.id) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive",
      });
      return;
    }

    const weekStart = getWeekStart(selectedDate);
    const dateKey = selectedDate.toDateString();
    
    // Load weekly tracking data
    const weeklyData = JSON.parse(localStorage.getItem(`weeklyData_${currentUser.id}`) || "{}");
    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = {};
    }
    
    // Save daily data
    const dayData = {
      sleepHours,
      exerciseMinutes,
      screenTimeHours,
      stressLevel,
      waterLiters,
      date: dateKey
    };
    
    weeklyData[weekStart][dateKey] = dayData;
    localStorage.setItem(`weeklyData_${currentUser.id}`, JSON.stringify(weeklyData));
    
    // Update main health data (use latest day's data)
    const storedHealthData = JSON.parse(localStorage.getItem(`healthData_${currentUser.id}`) || "{}");
    storedHealthData.sleepHours = sleepHours;
    storedHealthData.exerciseMinutes = exerciseMinutes;
    storedHealthData.screenTimeHours = screenTimeHours;
    storedHealthData.stressLevel = stressLevel;
    localStorage.setItem(`healthData_${currentUser.id}`, JSON.stringify(storedHealthData));
    
    // Recalculate health score
    const newScore = calculateHealthScore(storedHealthData);
    localStorage.setItem(`healthScore_${currentUser.id}`, JSON.stringify(newScore));
    
    // Mark as checked today
    if (dateKey === new Date().toDateString()) {
      localStorage.setItem(`lastHealthCheck_${currentUser.id}`, dateKey);
    }
    
    toast({
      title: "Health data updated!",
      description: `Your health metrics for ${format(selectedDate, "MMMM d, yyyy")} have been saved.`,
    });
    
    // Trigger dashboard update
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Daily Health Metrics</CardTitle>
        <CardDescription>Track your health data for any day to update your weekly achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selector */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sleep Hours */}
          <div className="space-y-2">
            <Label>Sleep Hours: {sleepHours} hours</Label>
            <Slider
              value={[sleepHours]}
              onValueChange={(value) => setSleepHours(value[0])}
              min={4}
              max={12}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4h</span>
              <span>8h (Recommended)</span>
              <span>12h</span>
            </div>
          </div>

          {/* Exercise Minutes */}
          <div className="space-y-2">
            <Label>Exercise: {exerciseMinutes} minutes</Label>
            <Slider
              value={[exerciseMinutes]}
              onValueChange={(value) => setExerciseMinutes(value[0])}
              min={0}
              max={120}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0min</span>
              <span>30min (Recommended)</span>
              <span>120min</span>
            </div>
          </div>

          {/* Screen Time */}
          <div className="space-y-2">
            <Label>Screen Time: {screenTimeHours} hours</Label>
            <Slider
              value={[screenTimeHours]}
              onValueChange={(value) => setScreenTimeHours(value[0])}
              min={0}
              max={16}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0h</span>
              <span>6h (Recommended)</span>
              <span>16h</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-2">
            <Label>Stress Level: {stressLevel}/10</Label>
            <Slider
              value={[stressLevel]}
              onValueChange={(value) => setStressLevel(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (1)</span>
              <span>Moderate (5)</span>
              <span>High (10)</span>
            </div>
          </div>

          {/* Water Intake */}
          <div className="space-y-2">
            <Label>Water Intake: {waterLiters} liters</Label>
            <Slider
              value={[waterLiters]}
              onValueChange={(value) => setWaterLiters(value[0])}
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0L</span>
              <span>6L (Recommended)</span>
              <span>10L</span>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Save Health Data
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
