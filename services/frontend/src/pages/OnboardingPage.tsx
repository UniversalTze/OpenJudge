import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const OnboardingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const experienceLevels = [
    { 
      id: "beginner", 
      name: "Beginner", 
      description: "I'm new to coding and want to learn step by step",
      benefits: "Easy problems first, detailed explanations, helpful hints"
    },
    { 
      id: "intermediate", 
      name: "Intermediate", 
      description: "I have some coding experience and want to improve",
      benefits: "Mixed difficulty problems, balanced learning approach"
    },
    { 
      id: "advanced", 
      name: "Advanced", 
      description: "I'm comfortable with coding and want challenging problems",
      benefits: "Hard problems first, focus on optimization and edge cases"
    },
  ];

  const handleComplete = () => {
    updateUser({ experienceLevel });
    
    toast({
      title: "Setup complete!",
      description: "Your experience level has been saved. Let's start coding!",
    });
    
    navigate("/problems");
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Welcome to OpenJudge!</h1>
        <p className="text-muted-foreground">
          Let's customize your learning experience based on your coding background.
        </p>
      </div>

      <div className="bg-card p-8 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold mb-6">What's your coding experience level?</h2>
        <p className="text-muted-foreground mb-6">
          This helps us tailor problem difficulty and provide appropriate learning resources.
        </p>
        
        <div className="space-y-4">
          {experienceLevels.map((level) => (
            <div
              key={level.id}
              className={`
                border rounded-lg p-6 cursor-pointer transition-all
                ${experienceLevel === level.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => setExperienceLevel(level.id as 'beginner' | 'intermediate' | 'advanced')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">{level.name}</h3>
                  <p className="text-muted-foreground mb-3">{level.description}</p>
                  <p className="text-sm text-primary font-medium">{level.benefits}</p>
                </div>
                {experienceLevel === level.id && (
                  <CheckCircle className="h-6 w-6 text-primary mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={handleComplete} size="lg">
            Start Coding Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;