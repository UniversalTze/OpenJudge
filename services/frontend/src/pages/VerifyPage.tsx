import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";

const VerifyPage = () => {
  const handleVerify = async () => {
    try {
      const response = await verify({
        token
      });
      if (!response || !response.success) {
        throw new Error(response.message || "Verification failed");
      }
      toast.success("Verification successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Verification failed.")
      navigate("/login");
    }
  };


  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token]);

  if (!token) {
    toast.error("Invalid verification link.");
    navigate("/login");
  }

  const { verify } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full size-20 border-b-2 border-primary"></div>
      </div>
    );
  }
}

export default VerifyPage;