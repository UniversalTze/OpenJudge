
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Code, LogIn } from "lucide-react";
import { useAuth } from '@/components/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { accessToken } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={isOpen ? "sticky top-0 z-40 w-full border-b bg-black bg-background/95" : "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"}>
      <nav className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-codepurple-600" />
          <span className="text-xl font-bold tracking-tight">OpenJudge</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">Home</Link>
          <Link to="/problems" className="text-foreground/80 hover:text-foreground transition-colors">Problems</Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">About</Link>
          
          {accessToken ? (
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className="flex items-center space-x-1">
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-black/50 md:hidden">
          <div className="container py-6 flex flex-col space-y-4 bg-black">
            <Link 
              to="/" 
              className="text-lg font-medium p-3 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/problems" 
              className="text-lg font-medium p-3 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Problems
            </Link>
            <Link 
              to="/about" 
              className="text-lg font-medium p-3 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <div className="pt-4">
              {accessToken ? (
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full flex items-center justify-center">
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
