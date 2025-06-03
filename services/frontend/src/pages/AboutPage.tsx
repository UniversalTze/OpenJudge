import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Code, Users, BookOpen, Globe, Github, Lightbulb, Target, Heart } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const AboutPage = () => {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <AnimatedSection animation="float-up" className="max-w-4xl mx-auto">
        <div className="relative mb-16 text-center">
          {/* Background Decoration */}
          <div className="absolute -z-10 inset-0">
            <div className="absolute top-1/3 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center relative">
            About <span className="animated-gradient-text">OpenJudge</span>
          </h1>
          <p className="text-xl text-center text-muted-foreground mb-8">
            Revolutionizing coding education through radical transparency
          </p>
          
          <div className="flex justify-center">
            <div className="glass-card inline-flex px-6 py-3 rounded-full">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Educational First</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">10K+ Learners</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">500+ Problems</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <AnimatedSection animation="fade-in" className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              Our Story
            </h2>
            
            <div className="glass-card p-6 rounded-xl mb-6">
              <p className="text-lg leading-relaxed">
                OpenJudge was born from frustration. As computer science students and educators, we were tired of platforms that kept learners in the dark with hidden test cases and cryptic "Wrong Answer" messages. We believed there had to be a better way to learn coding.
              </p>
            </div>
            
            <p className="mb-6">
              Traditional coding platforms follow an outdated model borrowed from competitive programming contests, where hiding test cases makes sense to prevent gaming. But for <strong>learning</strong>, this approach is counterproductive. How can you improve if you don't know what you did wrong?
            </p>

            <p className="mb-6">
              That's why we created OpenJudge with a simple mission: <em>make coding education transparent, effective, and actually helpful</em>. We show you every test case, explain every failure, and help you understand not just the "what" but the "why" behind problem-solving.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Transparency</h3>
                <p className="text-muted-foreground text-sm">Every test case visible, no hidden surprises ever</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Education First</h3>
                <p className="text-muted-foreground text-sm">Designed for learning, not competition</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Developer Joy</h3>
                <p className="text-muted-foreground text-sm">Making coding practice actually enjoyable</p>
              </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="reveal-left" className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              Our Mission
            </h2>
            
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">To democratize quality coding education</h3>
              <p className="text-lg leading-relaxed">
                We believe every aspiring developer deserves access to transparent, high-quality coding practice. No more guessing games, no more hidden gotchas - just clear, educational problem-solving that helps you grow as a programmer.
              </p>
            </div>

            <p className="mb-6">
              When you submit code on OpenJudge, you don't just get a verdict - you get insight. See exactly which test cases pass and fail, understand edge cases before you encounter them in production, and build debugging skills that will serve you throughout your career.
            </p>
            
            <div className="rounded-xl overflow-hidden glass-card mt-10">
              <div className="grid md:grid-cols-2">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">The OpenJudge Difference</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span><strong>100% Test Case Visibility:</strong> See every input that tests your code</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span><strong>Detailed Feedback:</strong> Understand exactly where and why your code fails</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span><strong>Learning-Focused:</strong> Every feature designed to help you improve</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span><strong>No Surprises:</strong> What you see is exactly what you get</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted/20 p-6 font-code">
                  <div className="text-sm opacity-70 mb-2"># Example: OpenJudge Transparency</div>
                  <pre className="text-xs">
                    <code>
{`✅ Test 1: nums=[2,7], target=9 → [0,1]
✅ Test 2: nums=[3,2,4], target=6 → [1,2]  
❌ Test 3: nums=[], target=0 → Expected: []
   Your output: [0] 
   Error: Index out of bounds
   
🔓 Hidden Test Cases (Usually Secret):
✅ Test 4: nums=[1,1], target=2 → [0,1]
❌ Test 5: nums=[1], target=1 → Expected: []
   Your output: [0]
   Error: Cannot use same element twice`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="reveal-right" className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              What Makes Us Different
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-400">❌ Traditional Platforms</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Hide test cases and edge cases</li>
                  <li>• Return vague "Wrong Answer" messages</li>
                  <li>• Focus on ranking and competition</li>
                  <li>• Make debugging a guessing game</li>
                  <li>• Frustrate learners with mystery failures</li>
                  <li>• Prioritize speed over understanding</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">✅ OpenJudge</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>Show ALL test cases, including "hidden" ones</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>Provide detailed failure explanations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>Focus on learning and skill building</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>Make debugging a learning experience</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>Help learners understand their mistakes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>Prioritize understanding over speed</span>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in" className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Our Team
            </h2>
            <div className="glass-card p-6 rounded-xl">
              <p className="mb-4">
                OpenJudge was created by a team of computer science students, educators, and software engineers who share a passion for making coding education more effective and accessible.
              </p>
              <p className="mb-4">
                We're constantly improving OpenJudge based on feedback from our community of learners, teachers, and industry professionals. Our goal is to create the most effective coding practice platform ever built.
              </p>
              <p className="text-primary font-medium">
                Built by learners, for learners. 🚀
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="float-up" className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-6">Join the Transparency Revolution</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Ready to experience coding practice the way it should be? No more hidden test cases, no more guessing games.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="neon-border">
                <Link to="/login">
                  Start Learning
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/problems">
                  Explore Problems
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 flex justify-center">
              <div className="glass-card rounded-full px-8 py-4 inline-flex items-center space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Github className="h-5 w-5 mr-1" />
                  <span>GitHub</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Globe className="h-5 w-5 mr-1" />
                  <span>Community</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Code className="h-5 w-5 mr-1" />
                  <span>Documentation</span>
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default AboutPage;