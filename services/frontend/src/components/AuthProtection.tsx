
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type AuthProtectionProps = {
  children: React.ReactNode;
};

const AuthProtection = ({ children }: AuthProtectionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // In a real app, you would check if the user is logged in here
  // For this demo, we'll simulate auth by checking localStorage
  const isAuthenticated = localStorage.getItem("user") !== null;

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProtection;
