
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Code, CheckCircle, Brain, BarChart, Eye, Shield } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const HomePage = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* 3D Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl rotating"></div>
            <div className="absolute bottom-1/4 -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl rotating animation-delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-[20%] h-[20%] bg-teal-500/10 rounded-full blur-3xl rotating animation-delay-1500"></div>
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" 
               style={{
                 backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                 backgroundSize: "60px 60px"
               }}>
          </div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative mb-6">
              <div className="floating">
                <svg className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 text-primary/20 opacity-50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M47.7,-57.2C59.9,-45.8,67,-29.4,70.4,-11.9C73.8,5.6,73.4,25.2,64.3,39.6C55.1,53.9,37.2,63.1,18.4,69.2C-0.4,75.3,-19.9,78.3,-35.8,71.3C-51.8,64.4,-64.1,47.4,-69.6,29.5C-75.1,11.5,-73.8,-7.6,-65.9,-22.9C-58,-38.2,-43.5,-49.7,-28.9,-60.2C-14.3,-70.7,0.4,-80.1,16.5,-77.8C32.6,-75.5,35.5,-68.6,47.7,-57.2Z" transform="translate(100 100)" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 relative z-10">
                <span className="animated-gradient-text">Open</span>
                <span className="text-white">Judge</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 md:mb-10">
                Learn to code with <span className="text-primary font-semibold">complete transparency</span>
              </p>
            </div>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              A revolutionary coding platform that doesn't hide test cases,
              but <span className="text-white">teaches you</span> through them. Experience coding challenges
              with full visibility and detailed feedback.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 rounded-full neon-border"
                asChild
              >
                <Link to="/login">
                  Get Started <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 rounded-full"
                onClick={scrollToFeatures}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20">
        <div className="container">
          <AnimatedSection animation="float-up" className="max-w-4xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-2xl code-3d">
              <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-gray-400 text-sm">Example Problem</span>
              </div>
              <div className="grid md:grid-cols-2 divide-x divide-gray-700">
                <div className="bg-gray-900 text-gray-100 p-4 font-code text-sm">
                  <div className="syntax-comment mb-4"># Problem: Two Sum</div>
                  <div className="syntax-keyword mb-2">def <span className="syntax-function">two_sum</span>(nums, target):</div>
                  <div className="pl-4 mb-2 syntax-comment">"""</div>
                  <div className="pl-4 mb-2 syntax-comment">Find indices of two numbers that add up to target</div>
                  <div className="pl-4 mb-2 syntax-comment">"""</div>
                  <div className="pl-4 mb-2">seen = {}</div>
                  <div className="pl-4 mb-2 syntax-keyword">for</div>
                  <div className="pl-8 mb-2">i, num in enumerate(nums):</div>
                  <div className="pl-8 mb-2">complement = target - num</div>
                  <div className="pl-8 mb-2 syntax-keyword">if</div>
                  <div className="pl-12 mb-2">complement in seen:</div>
                  <div className="pl-16 mb-2 syntax-keyword">return</div>
                  <div className="pl-20 mb-2">[seen[complement], i]</div>
                  <div className="pl-8 mb-2">seen[num] = i</div>
                  <div className="pl-4 mb-2 syntax-keyword">return</div>
                  <div className="pl-8 mb-2">[]  <span className="syntax-comment"># No solution found</span></div>
                </div>
                <div className="bg-gray-800 p-4 font-code text-sm">
                  <div className="text-blue-400 mb-4 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    <span>All Test Cases Visible</span>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-300 mb-1">Input:</div>
                    <div className="pl-4 text-purple-300 mb-1">nums = [2, 7, 11, 15]</div>
                    <div className="pl-4 text-purple-300 mb-1">target = 9</div>
                    <div className="text-teal-400 mt-2 mb-1">Expected: [0, 1]</div>
                    <div className="text-green-400 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Passed
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-300 mb-1">Input:</div>
                    <div className="pl-4 text-purple-300 mb-1">nums = [3, 2, 4]</div>
                    <div className="pl-4 text-purple-300 mb-1">target = 6</div>
                    <div className="text-teal-400 mt-2 mb-1">Expected: [1, 2]</div>
                    <div className="text-green-400 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Passed
                    </div>
                  </div>
                  <div className="mb-4 pt-2 border-t border-gray-700">
                    <div className="text-yellow-400 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Hidden Test Case (also visible!)</span>
                    </div>
                    <div className="pl-4 text-purple-300 mb-1">nums = [1]</div>
                    <div className="pl-4 text-purple-300 mb-1">target = 1</div>
                    <div className="text-teal-400 mt-2 mb-1">Expected: []</div>
                    <div className="text-green-400 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Passed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why OpenJudge is Different</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're reimagining how code platforms should work, with a focus on learning and growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection animation="float-up" delay="0ms" className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Transparent Testing</h3>
              <p className="text-muted-foreground">
                All test cases are visible, including edge cases, so you can understand exactly what your code needs to handle.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="200ms" className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all">
              <Brain className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Educational Focus</h3>
              <p className="text-muted-foreground">
                Detailed explanations and learning hints help build understanding, not just passing tests.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="400ms" className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all">
              <Code className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Beginner Friendly</h3>
              <p className="text-muted-foreground">
                Personalized problem recommendations based on the languages you're comfortable with.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="600ms" className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all">
              <BarChart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Track your improvement over time with detailed statistics and performance insights.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="800ms" className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-4">
                <path d="M14 4c0-1.1.9-2 2-2" />
                <path d="M14 12V4" />
                <path d="M18 2h-6" />
                <path d="M18 10c3 0 4 2 4 3c0 1.5-2 3-4 3m-6 0c-3 0-4-2-4-3c0-1.5 2-3 4-3" />
                <path d="M18 22c-3 0-4-2-4-3c0-1.5 2-3 4-3m-6 0c3 0 4 2 4 3c0 1.5-2 3-4 3" />
                <path d="M18 19.5c.5 0 1-.1 1.5-.4" />
                <path d="M6.5 8.5c-.5.3-1 .8-1 1.5" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Multiple Languages</h3>
              <p className="text-muted-foreground">
                Practice in both Python and Java, with language-specific hints and feedback.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="1000ms" className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Auto-Save Code</h3>
              <p className="text-muted-foreground">
                Never lose your progress with automatic code saving as you work on problems.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection animation="fade-in" className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto glass-card rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our community of learners and improve your coding skills with transparent, educational challenges.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 rounded-full neon-border"
              asChild
            >
              <Link to="/login">
                Create Free Account
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default HomePage;
