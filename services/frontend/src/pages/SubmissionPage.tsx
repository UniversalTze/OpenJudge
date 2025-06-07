
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const SubmissionPage = () => {
  const navigate = useNavigate();

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
          Your code has been submitted for evaluation. Results will be available soon in the Dashbaord.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={() => navigate('/problems')}
            variant="outline"
            className="flex-1"
          >
            Try Another Problem
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
