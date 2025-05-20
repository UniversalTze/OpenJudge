
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LanguageOption {
  id: string;
  name: string;
  icon: string;
  experienceLevel: "none" | "beginner" | "intermediate" | "advanced";
}

const OnboardingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, LanguageOption>>({});
  
  const languages = [
    { id: "python", name: "Python", icon: "🐍" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "javascript", name: "JavaScript", icon: "📜" },
    { id: "cpp", name: "C++", icon: "⚙️" },
    { id: "ruby", name: "Ruby", icon: "💎" },
    { id: "go", name: "Go", icon: "🏎️" },
    { id: "csharp", name: "C#", icon: "🎯" },
    { id: "rust", name: "Rust", icon: "🦀" },
  ];

  const experienceLevels = [
    { id: "beginner", name: "Beginner", description: "I'm just starting to learn this language" },
    { id: "intermediate", name: "Intermediate", description: "I've worked on several projects in this language" },
    { id: "advanced", name: "Advanced", description: "I'm very comfortable with this language" },
  ];

  const toggleLanguage = (language: { id: string; name: string; icon: string }) => {
    setSelectedLanguages(prev => {
      const newSelected = { ...prev };
      if (newSelected[language.id]) {
        delete newSelected[language.id];
      } else {
        newSelected[language.id] = { ...language, experienceLevel: "beginner" };
      }
      return newSelected;
    });
  };

  const setExperienceLevel = (languageId: string, level: "beginner" | "intermediate" | "advanced") => {
    setSelectedLanguages(prev => ({
      ...prev,
      [languageId]: {
        ...prev[languageId],
        experienceLevel: level,
      }
    }));
  };

  const nextStep = () => {
    if (step === 1 && Object.keys(selectedLanguages).length === 0) {
      toast({
        title: "Please select at least one language",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2) {
      localStorage.setItem("onboarding-complete", "true");
      localStorage.setItem("selected-languages", JSON.stringify(selectedLanguages));
      
      // Complete onboarding
      toast({
        title: "Setup complete!",
        description: "Your preferences have been saved.",
      });
      navigate("/problems");
      return;
    }
    
    setStep(step + 1);
  };

  const previousStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Set Up Your Learning Experience</h1>
        <p className="text-muted-foreground">
          Let's customize your OpenJudge experience to match your skills and goals.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              1
            </div>
            <div className={`h-1 w-20 ${step >= 2 ? "bg-primary" : "bg-secondary"}`}></div>
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              2
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="text-center w-24">
            <p className={`text-sm ${step === 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
              Languages
            </p>
          </div>
          <div className="text-center w-24 ml-16">
            <p className={`text-sm ${step === 2 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
              Experience
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Languages */}
      {step === 1 && (
        <div className="bg-card p-8 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Which programming languages do you want to practice?</h2>
          <p className="text-muted-foreground mb-6">
            Select the languages you're interested in learning or improving. We'll customize problem recommendations based on your selections.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {languages.map((language) => (
              <div
                key={language.id}
                className={`
                  border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${selectedLanguages[language.id] 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
                onClick={() => toggleLanguage(language)}
              >
                <div className="text-3xl mb-2">{language.icon}</div>
                <p className="font-medium">{language.name}</p>
                {selectedLanguages[language.id] && (
                  <CheckCircle className="h-5 w-5 text-primary mt-2" />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button onClick={nextStep} size="lg">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Experience Level */}
      {step === 2 && (
        <div className="bg-card p-8 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">What is your experience level with these languages?</h2>
          <p className="text-muted-foreground mb-6">
            This helps us tailor problem difficulty and provide appropriate learning resources.
          </p>
          
          <div className="space-y-6">
            {Object.values(selectedLanguages).map((language) => (
              <div key={language.id} className="border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">{language.icon}</span>
                  <h3 className="text-lg font-medium">{language.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {experienceLevels.map((level) => (
                    <div
                      key={`${language.id}-${level.id}`}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-all
                        ${language.experienceLevel === level.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                      onClick={() => setExperienceLevel(language.id, level.id as "beginner" | "intermediate" | "advanced")}
                    >
                      <p className="font-medium">{level.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                      {language.experienceLevel === level.id && (
                        <CheckCircle className="h-4 w-4 text-primary mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={previousStep}>
              Back
            </Button>
            <Button onClick={nextStep}>
              Finish Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
