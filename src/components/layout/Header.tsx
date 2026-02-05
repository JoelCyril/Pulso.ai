import { motion } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
    }
  };

  const handleSignIn = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate("/login", { state: { isSignUp: true } });
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4"
    >
      <nav className="container max-w-6xl mx-auto">
        <div className="glass-card px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between bg-primary/95 backdrop-blur-md border border-primary/20 shadow-lg rounded-full">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-primary-foreground group">
            <span className="font-script text-4xl leading-none pt-2 group-hover:opacity-90 transition-opacity">Pulso</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-primary-foreground/80 hover:text-white transition-colors uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleSignIn} className="text-primary-foreground hover:bg-white/10 hover:text-white font-medium">
              SIGN IN
            </Button>
            <Button size="sm" onClick={handleGetStarted} className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-6">
              GET STARTED
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-primary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 glass-card p-6 bg-primary text-primary-foreground"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/20" />
              <Button variant="ghost" size="sm" className="justify-start text-white hover:bg-white/10" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button size="sm" onClick={handleGetStarted} className="bg-white text-primary hover:bg-white/90">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};
