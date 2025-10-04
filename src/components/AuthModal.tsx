import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Mail, Eye, EyeOff, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { auth, profiles } from "../lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useMockAuth, setUseMockAuth] = useState(true); // Enable mock auth for testing

  const validateInviteCode = async (code: string): Promise<boolean> => {
    try {
      // Mock validation for now - in production this would call /api/invites/validate
      if (code.length === 8 && code.match(/^[A-Z0-9]+$/)) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Invite validation error:', error);
      return false;
    }
  };

  const handleSendVerificationEmail = async (isLogin: boolean) => {
    if (!email) return;
    if (!isLogin && (!name || !username || !inviteCode || !agreeToTerms)) return;
    if (isLogin && !password) return;

    setIsLoading(true);
    setError("");

    try {
      // Validate invite code for registration
      if (!isLogin) {
        const isValidInvite = await validateInviteCode(inviteCode);
        if (!isValidInvite) {
          setError("This invite code is invalid or expired.");
          setIsLoading(false);
          return;
        }
      }
      if (useMockAuth) {
        // Mock authentication for testing
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isLogin) {
          // Mock successful login
          const mockUser = {
            id: `user-${Date.now()}`,
            username: email.split('@')[0],
            email,
            name: email.split('@')[0],
            bio: '',
            reputation: 1250,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            badges: [],
            skills: ['Testing'],
            subscriptionPlan: 'free' as const,
            saveCount: 10,
            invitesRemaining: 0
          };
          onAuthenticated(mockUser);
          onClose();
          resetForm();
        } else {
          // Mock successful signup
          setEmailSent(true);
          setShowVerification(true);
        }
      } else {
        // Real Supabase authentication
        if (isLogin) {
          const { data, error } = await auth.signIn(email, password);
          if (error) throw error;

          if (data.user) {
            const { data: profile } = await profiles.get(data.user.id);
            if (profile) {
              onAuthenticated(profile);
              onClose();
              resetForm();
            }
          }
        } else {
          const { data, error } = await auth.signUp(email, password, username);
          if (error) throw error;

          if (data.user) {
            const profileData = {
              id: data.user.id,
              username,
              email,
              name,
              subscription_plan: 'free' as const,
              invites_remaining: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { data: profile } = await profiles.create(profileData);
            if (profile) {
              setEmailSent(true);
              setShowVerification(true);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (useMockAuth) {
      // Mock email verification
      if (verificationCode === "123456") {
        const mockUser = {
          id: `user-${Date.now()}`,
          username,
          email,
          name,
          bio: '',
          reputation: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          badges: [],
          skills: [],
          subscriptionPlan: 'free' as const,
          saveCount: 0,
          invitesRemaining: 0
        };
        onAuthenticated(mockUser);
        onClose();
        resetForm();
      } else {
        setError("Invalid verification code. Use '123456' for testing.");
      }
    } else {
      // With Supabase, email verification is handled automatically
      // Users click the verification link in their email
      setError("Please check your email and click the verification link to complete registration.");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setUsername("");
    setAgreeToTerms(false);
    setEmailSent(false);
    setVerificationCode("");
    setShowVerification(false);
    setError("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resendEmail = () => {
    setEmailSent(false);
    setShowVerification(false);
    setVerificationCode("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl">PromptsGo</span>
            </div>
            Create your professional portfolio
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create an account to start building your professional prompt portfolio
          </DialogDescription>
        </DialogHeader>

{showVerification ? (
          /* Email Verification */
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to<br />
                <span className="font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Verification email sent! Please check your inbox and click the verification link to complete your registration.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button variant="link" onClick={resendEmail} className="text-sm">
                Didn't receive the email? Try again
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="link" className="px-0 text-sm">
                    Forgot password?
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSendVerificationEmail(true)}
                  disabled={!email || !password || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending verification...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Sign In with Email Verification
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code *</Label>
                  <Input
                    id="invite-code"
                    type="text"
                    placeholder="Enter your invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required during beta. Ask a member for an invite.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked: boolean) => setAgreeToTerms(checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Privacy Policy
                    </Button>
                  </Label>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSendVerificationEmail(false)}
                  disabled={!name || !username || !email || !password || !inviteCode || !agreeToTerms || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending verification...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Create Account with Email Verification
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Testing Mode:</span>
            <button
              onClick={() => setUseMockAuth(!useMockAuth)}
              className={`px-2 py-1 rounded text-xs font-medium ${
                useMockAuth
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {useMockAuth ? 'Mock Auth' : 'Real Auth'}
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            PromptsGo is not intended for collecting PII or securing sensitive data
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}