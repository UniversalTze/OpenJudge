import { Link } from "react-router-dom";
import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 text-center text-sm text-muted-foreground">
      <p>
        © {new Date().getFullYear()} OpenJudge. All rights reserved. This is a demo site, use at
        your own risk. We assume no liabilty for any loss or damage arising out of the use of this
        site.
      </p>
    </footer>
  );
};

export default Footer;
