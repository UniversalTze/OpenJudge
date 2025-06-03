import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Code, Users, BookOpen, Globe, Github } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
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
            A learning-oriented code evaluation platform built for transparency
          </p>
          
          <div className="flex justify-center">
            <div className="glass-card inline-flex px-6 py-3 rounded-full">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Open Source</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Lots of Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">15+ Problems</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          {/* Mission Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              Our Mission
            </h2>
            
            <div className="glass-card p-6 rounded-xl mb-6">
              <p>
                For most computer science students, platforms like LeetCode have become an essential part of learning to code. But traditional online judges often hide test cases and simply return "Wrong Answer" without helpful feedback, making it difficult for beginners to understand their mistakes and learn effectively.
              </p>
            </div>
            
            <p>
              OpenJudge was born from a simple question: how can we build a code evaluation platform that puts education first? Our mission is to create a transparent, learning-focused environment where users can see all test cases—including edge cases—and receive detailed, step-by-step feedback that explains where their code went wrong and how to fix it.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Transparency</h3>
                <p className="text-muted-foreground text-sm">Full visibility into test cases and expected outputs</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Education First</h3>
                <p className="text-muted-foreground text-sm">Explanatory feedback designed to help you learn</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Practical Skills</h3>
                <p className="text-muted-foreground text-sm">Industry-relevant problem sets and approaches</p>
              </div>
            </div>
          </div>
          
          {/* Educational Philosophy */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Educational Philosophy
            </h2>
            <p>
              We believe that the best way to learn is through transparency and constructive feedback. Unlike platforms that treat coding as a competitive sport with hidden challenges, we emphasize understanding over simply "passing" tests.
            </p>
            <p>
              When you submit your code on OpenJudge, you'll see exactly which test cases it passed and which it failed, along with expected outputs, actual outputs, and explanations. This approach turns debugging into a valuable learning experience rather than a frustrating guessing game.
            </p>
            <div className="my-8 glass-card p-6 rounded-xl border border-primary/20">
              <blockquote className="italic border-l-4 border-primary pl-4">
                "We don't just want you to solve problems—we want you to understand the solutions and grow as a programmer."
              </blockquote>
            </div>
          </div>
          
          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              Our Team
            </h2>
            <div className="glass-card p-6 rounded-xl">
              <p>
                OpenJudge was created by a team of computer science educators and students who were frustrated with the limitations of existing coding platforms. We combined our experience in education, software development, and UI/UX design to create a platform that truly serves learners.
              </p>
              <p className="mt-4">
                We're constantly improving OpenJudge based on user feedback and educational research. Our team is committed to creating the most effective learning environment for programmers at all stages of their journey.
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-6">Join Our Community</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Ready to start learning in a more transparent, educational environment? Join OpenJudge today and experience a new way to practice coding.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="neon-border">
                <Link to="/login">
                  Get Started
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/problems">
                  Explore Problems
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;