import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthProtection({ children }: {children: React.ReactNode}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { accessToken, refresh, getUser } = useAuth();

  useEffect(() => {
    const validateRequest = async () => {
      if (accessToken) {
        setLoading(false);
      } else {
        const response = await refresh();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (response.success && accessToken) {
          setLoading(false);
        } else {
          toast.error("Please sign in to access this page");
          navigate("/login");
        }
      }
    };
    validateRequest();
  }, []);

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full size-20 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};