
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";
import SubmissionPage from "./pages/SubmissionPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import AuthProtection from "./components/AuthProtection";
import SampleProblemResultPage from "./pages/SampleProblemResultPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/problems" element={
                <AuthProtection>
                  <ProblemsPage />
                </AuthProtection>
              } />
              <Route path="/problem/:id" element={
                <AuthProtection>
                  <ProblemDetailPage />
                </AuthProtection>
              } />
              <Route path="/submission-success" element={
                <AuthProtection>
                  <SubmissionPage />
                </AuthProtection>
              } />
              <Route path="/sample-problem-result" element={
                <AuthProtection>
                  <SampleProblemResultPage />
                </AuthProtection>
              } />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
