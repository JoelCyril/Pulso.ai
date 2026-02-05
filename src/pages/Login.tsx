import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import signupBg from "@/assets/signup.png";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(location.state?.isSignUp || false);
  const navigate = useNavigate();
  const { toast } = useToast();



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Simple authentication - in production, use proper auth
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (isSignUp) {
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        toast({
          title: "Error",
          description: "User already exists",
          variant: "destructive",
        });
        return;
      }

      // Create new user
      const newUser = { email, password, id: Date.now().toString() };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      toast({
        title: "Account created",
        description: "Welcome! Let's set up your profile.",
      });

      // Check if onboarding is needed
      const hasOnboarding = localStorage.getItem(`onboarding_${newUser.id}`);
      if (!hasOnboarding) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } else {
      // Login
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (!user) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));

      // Check if onboarding is needed
      const hasOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      if (!hasOnboarding) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="flex justify-center">
              <div className="p-2.5 sm:p-3 rounded-full bg-primary/10">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Start your journey to better mental health"
                : "Sign in to continue your wellness journey"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
