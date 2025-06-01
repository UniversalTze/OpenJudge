
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const SubmissionPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Automatically go back to problems page after a delay (optional)
    const timer = setTimeout(() => {
      // navigate('/problems');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Submission Received!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your code has been submitted for evaluation. Results will be available soon.
        </p>
        
        {/* Loading animation */}
        <div className="flex justify-center mb-8">
          <div className="relative w-64 h-4 bg-secondary rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-codeblue-600 to-codepurple-600 animate-pulse rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={() => navigate('/problems')}
            variant="outline"
            className="flex-1"
          >
            Return to Problems
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Back to Problem
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
