import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";
import SubmissionPage from "./pages/SubmissionPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import AuthProtection from "./components/AuthProtection";
import SampleProblemResultPage from "./pages/SampleProblemResultPage";
import VerifyPage from "./pages/VerifyPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster toastOptions={{ className: "bg-black text-white border-zinc-800 border" }} />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="ssm:flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/problems"
                element={
                  <AuthProtection>
                    <ProblemsPage />
                  </AuthProtection>
                }
              />
              <Route
                path="/problem/:id"
                element={
                  <AuthProtection>
                    <ProblemDetailPage />
                  </AuthProtection>
                }
              />
              <Route
                path="/submission-success"
                element={
                  <AuthProtection>
                    <SubmissionPage />
                  </AuthProtection>
                }
              />
              <Route
                path="/sample-problem-result"
                element={
                  <AuthProtection>
                    <SampleProblemResultPage />
                  </AuthProtection>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AuthProtection>
                    <DashboardPage />
                  </AuthProtection>
                }
              />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
