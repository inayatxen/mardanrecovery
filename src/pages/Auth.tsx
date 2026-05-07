import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import pescoLogo from "@/assets/pesco-logo.png";
import ThemeToggle from "@/components/ThemeToggle";

type AuthMode = "login" | "signup" | "verify";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const formatPhoneNumber = (input: string) => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("92")) {
      digits = digits.slice(2);
    }
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    return digits;
  };

  const getPakistaniPhone = () => {
    const formatted = formatPhoneNumber(phone);
    return `+92${formatted}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your mobile number");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${formatPhoneNumber(phone)}@pesco.local`,
        password: password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Login successful!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const email = `${formatPhoneNumber(phone)}@pesco.local`;

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            phone_number: getPakistaniPhone(),
            display_name: `User ${formatPhoneNumber(phone)}`,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={pescoLogo} alt="PESCO" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">PESCO Arrear Recovery</CardTitle>
          <CardDescription className="text-slate-400">
            {mode === "login" && "Sign in to your account"}
            {mode === "signup" && "Create a new account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">
                Mobile Number
              </Label>
              <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg border border-slate-600 px-3">
                <span className="text-slate-400 font-medium">+92</span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength="15"
                  className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0"
                />
              </div>
              <p className="text-xs text-slate-500">Enter 10-digit mobile number (without country code)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
            >
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setPhone("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setPhone("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
