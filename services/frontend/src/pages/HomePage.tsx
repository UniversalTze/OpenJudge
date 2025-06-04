import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Code,
  CheckCircle,
  Brain,
  BarChart,
  Eye,
  Shield,
  Lock,
  Unlock,
} from "lucide-react";
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
            <div className="absolute top-1/4 -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl animate-rotate"></div>
            <div className="absolute bottom-1/4 -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl animate-rotate delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-[20%] h-[20%] bg-teal-500/10 rounded-full blur-3xl animate-rotate delay-1500"></div>
          </div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection animation="fade-in">
              <div className="relative mb-6">
                <div className="animate-float">
                  <svg
                    className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 text-primary/20 opacity-50"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M47.7,-57.2C59.9,-45.8,67,-29.4,70.4,-11.9C73.8,5.6,73.4,25.2,64.3,39.6C55.1,53.9,37.2,63.1,18.4,69.2C-0.4,75.3,-19.9,78.3,-35.8,71.3C-51.8,64.4,-64.1,47.4,-69.6,29.5C-75.1,11.5,-73.8,-7.6,-65.9,-22.9C-58,-38.2,-43.5,-49.7,-28.9,-60.2C-14.3,-70.7,0.4,-80.1,16.5,-77.8C32.6,-75.5,35.5,-68.6,47.7,-57.2Z"
                      transform="translate(100 100)"
                    />
                  </svg>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-4 relative z-10">
                  <span className="animated-gradient-text">Open</span>
                  <span className="text-white">Judge</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 md:mb-10">
                  The only coding platform that shows you{" "}
                  <span className="text-primary font-semibold">ALL test cases</span>
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="200ms">
              <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
                Tired of getting "Wrong Answer" without knowing why? OpenJudge revolutionizes coding
                practice by showing you every test case - including the hidden ones. Learn through
                transparency, not guesswork.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="400ms">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button size="lg" className="text-lg px-8 rounded-md" asChild>
                  <Link to="/login">
                    Start Learning <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 rounded-md"
                  onClick={scrollToFeatures}
                >
                  Learn More
                </Button>
              </div>
            </AnimatedSection>

            {/* Key Stats */}
            <AnimatedSection animation="float-up" delay="600ms">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <div className="glass-card p-6 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Test Case Visibility</div>
                </div>
                <div className="glass-card p-6 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <div className="text-sm text-muted-foreground">Transparent Problems</div>
                </div>
                <div className="glass-card p-6 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">0</div>
                  <div className="text-sm text-muted-foreground">Hidden Surprises</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Problem of Traditional Platforms */}
      <section className="py-20">
        <div className="container">
          <AnimatedSection animation="fade-in">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">The Problem with Other Platforms</h2>
              <p className="text-xl text-muted-foreground">
                Traditional coding platforms keep you in the dark. Here's what's broken:
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection animation="float-up" delay="0ms">
              <div className="glass-card rounded-xl p-6 border-red-500/20 h-full">
                <div className="text-red-400 mb-4">
                  <Lock className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">Hidden Test Cases</h3>
                <p className="text-muted-foreground">
                  You get "Wrong Answer" but have no idea what input broke your solution. Pure
                  guesswork.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="200ms">
              <div className="glass-card rounded-xl p-6 border-yellow-500/20  h-full">
                <div className="text-yellow-400 mb-4">
                  <Brain className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Learning</h3>
                <p className="text-muted-foreground">
                  Without seeing edge cases, you can't understand the problem deeply or improve your
                  debugging skills.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="400ms">
              <div className="glass-card rounded-xl p-6 border-orange-500/20  h-full">
                <div className="text-orange-400 mb-4">
                  <BarChart className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">Frustrating Experience</h3>
                <p className="text-muted-foreground">
                  Hours wasted trying to guess what corner case you missed. Learning becomes a
                  chore.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20">
        <div className="container">
          <AnimatedSection animation="fade-in" className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">See the OpenJudge Difference</h2>
              <p className="text-xl text-muted-foreground">
                Compare what you see on other platforms vs. OpenJudge
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Other Platforms */}
              <AnimatedSection animation="reveal-left" delay="200ms">
                <div className="rounded-lg overflow-hidden shadow-2xl border border-red-500/20 h-full">
                  <div className="bg-red-500/10 text-white px-4 py-2 flex justify-between items-center">
                    <span className="text-red-400 font-medium">Other Platforms</span>
                    <span className="text-red-400 text-sm">❌ Hidden</span>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-6 font-code text-sm h-full">
                    <div className="text-green-400 mb-4">✅ Test Case 1: Passed</div>
                    <div className="text-green-400 mb-4">✅ Test Case 2: Passed</div>
                    <div className="text-red-400 mb-4">❌ Test Case 3: Wrong Answer</div>
                    <div className="text-gray-500 mb-4">🔒 Test Case 4: Hidden</div>
                    <div className="text-gray-500 mb-4">🔒 Test Case 5: Hidden</div>
                    <div className="text-red-400 font-bold">Result: Wrong Answer</div>
                    <div className="text-gray-400 mt-4 italic">
                      "Good luck figuring out what went wrong! 🤷‍♂️"
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* OpenJudge */}
              <AnimatedSection animation="reveal-right" delay="400ms">
                <div className="rounded-lg overflow-hidden shadow-2xl border border-primary/20 h-full">
                  <div className="bg-primary/10 text-white px-4 py-2 flex justify-between items-center">
                    <span className="text-primary font-medium">OpenJudge</span>
                    <span className="text-primary text-sm">🔓 Transparent</span>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-6 font-code text-sm h-full">
                    <div className="text-green-400 mb-2">
                      ✅ Test Case 1: nums=[2,7,11,15], target=9 → [0,1]
                    </div>
                    <div className="text-green-400 mb-2">
                      ✅ Test Case 2: nums=[3,2,4], target=6 → [1,2]
                    </div>
                    <div className="text-red-400 mb-2">❌ Test Case 3: nums=[3,3], target=6</div>
                    <div className="text-yellow-400 mb-1"> Expected: [0,1]</div>
                    <div className="text-red-400 mb-4"> Your output: [0,0]</div>
                    <div className="text-blue-400 mb-2">
                      🔍 Hidden Test Case 4: nums=[], target=0 → []
                    </div>
                    <div className="text-blue-400 mb-4">
                      🔍 Hidden Test Case 5: nums=[1], target=1 → []
                    </div>
                    <div className="text-primary font-bold">Result: 3/5 Test Cases Passed</div>
                    <div className="text-primary mt-4 italic">
                      "Now you know exactly what to fix! 🎯"
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <span ref={featuresRef} className="h-20 -mt-20"></span>
      <section className="py-20">
        <div className="container">
          <AnimatedSection animation="fade-in">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why OpenJudge Changes Everything</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We're not just another coding platform. We're a learning revolution.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection animation="float-up" delay="0ms">
              <div className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all h-full">
                <Unlock className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Complete Transparency</h3>
                <p className="text-muted-foreground">
                  See every test case, including edge cases and corner cases that other platforms
                  hide. No more guessing games.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="200ms">
              <div className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all h-full">
                <Brain className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Learn Through Debugging</h3>
                <p className="text-muted-foreground">
                  Understand exactly where your solution fails. Build debugging skills that matter
                  in real software development.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="400ms">
              <div className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all h-full">
                <Code className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Language Agnostic</h3>
                <p className="text-muted-foreground">
                  Focus on algorithms and problem-solving, not language-specific tricks. Write
                  solutions in any language you prefer.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="600ms">
              <div className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all h-full">
                <CheckCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Adaptive Difficulty</h3>
                <p className="text-muted-foreground">
                  Problems are sorted based on your experience level. Beginners see easy problems
                  first, experts get challenges.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="800ms">
              <div className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all h-full">
                <Eye className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
                <p className="text-muted-foreground">
                  Run your code against all test cases instantly. See exactly which inputs pass and
                  which fail.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="float-up" delay="1000ms">
              <div className="glass-card rounded-xl p-8 hover:border-primary/50 transition-all h-full">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">No Gotchas</h3>
                <p className="text-muted-foreground">
                  We show you everything upfront. No hidden constraints, no surprise edge cases
                  after submission.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container">
          <AnimatedSection animation="fade-in">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">What Developers Say</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <AnimatedSection animation="float-up" delay="200ms">
                  <div className="glass-card p-8 rounded-xl">
                    <div className="mb-4">
                      <div className="flex text-yellow-400 mb-2 justify-center">
                        {"★".repeat(5)}
                      </div>
                      <p className="text-lg italic mb-4">
                        "Finally! I can actually learn from my mistakes instead of endlessly
                        guessing what went wrong. This is how coding practice should be."
                      </p>
                      <div className="font-medium">Sarah Chen</div>
                      <div className="text-sm text-muted-foreground">
                        Software Engineering Student
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection animation="float-up" delay="400ms">
                  <div className="glass-card p-8 rounded-xl">
                    <div className="mb-4">
                      <div className="flex text-yellow-400 mb-2 justify-center">
                        {"★".repeat(5)}
                      </div>
                      <p className="text-lg italic mb-4">
                        "As someone who teaches algorithms, OpenJudge is a game-changer. Students
                        can actually see and understand edge cases."
                      </p>
                      <div className="font-medium">Dr. Michael Rodriguez</div>
                      <div className="text-sm text-muted-foreground">
                        Computer Science Professor
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection animation="fade-in" className="py-20 mb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto glass-card rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Learn the Right Way?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers who've ditched the guessing game. See every test case,
              understand every failure, and actually learn from your code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 rounded-md" asChild>
                <Link to="/login">Start for Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 rounded-md" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Full transparency guaranteed • Always free for learners
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default HomePage;
