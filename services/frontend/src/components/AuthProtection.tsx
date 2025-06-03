import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type AuthProtectionProps = {
  children: React.ReactNode;
};

const AuthProtection = ({ children }: AuthProtectionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [state.isAuthenticated, state.isLoading, navigate, toast]);

  if (state.isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProtection;