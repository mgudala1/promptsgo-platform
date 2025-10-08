import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface FooterProps {
  onGetStarted?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToInvites?: () => void;
  onNavigateToAffiliate?: () => void;
}

export function Footer({
  onGetStarted,
  onNavigateToAbout,
  onNavigateToTerms,
  onNavigateToPrivacy,
  onNavigateToInvites,
  onNavigateToAffiliate
}: FooterProps) {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900/50 py-20 mt-12">
      <div className="container mx-auto px-4">
        {/* Subtle separator line */}
        <div className="border-t border-border/10 mb-12"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Branding */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-2xl">PromptsGo</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Building the future of prompt engineering — where creativity meets collaboration
              for AI professionals worldwide.
            </p>

            {onGetStarted && (
              <Button
                size="sm"
                onClick={onGetStarted}
                className="px-6 py-2 h-auto shadow-sm hover:shadow-md transition-shadow"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Right Side - Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button onClick={onNavigateToAbout} className="hover:text-accent active:text-accent transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToInvites} className="hover:text-accent active:text-accent transition-colors">
                    Invite Friends
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToAffiliate} className="hover:text-accent active:text-accent transition-colors">
                    Affiliate Program
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button onClick={onNavigateToTerms} className="hover:text-accent active:text-accent transition-colors">
                    Terms
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToPrivacy} className="hover:text-accent active:text-accent transition-colors">
                    Privacy
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="mailto:support@promptsgo.com" className="hover:text-accent active:text-accent transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
