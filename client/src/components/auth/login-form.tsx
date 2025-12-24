import { useState, useCallback, memo } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth-firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Memoized Google Sign-In Button to prevent re-renders
const GoogleSignInButton = memo(({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <Button
    type="button"
    variant="outline"
    onClick={onClick}
    disabled={loading}
    className="w-full relative"
  >
    {loading ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    )}
    Continue with Google
  </Button>
));

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { loginWithEmailPassword, loginWithGoogle, user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Helper function to determine the correct redirect path based on user role
  const getRedirectPath = useCallback((userRole: string | undefined) => {
    // The /dashboard route in the routes config already handles role-based routing
    // It will automatically show the correct dashboard based on the user's role
    return "/dashboard";
  }, []);

  const onSubmit = useCallback(async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await loginWithEmailPassword(data.email, data.password);
      
      // Wait a moment for the auth state to update
      setTimeout(() => {
        const redirectPath = getRedirectPath(user?.role);
        console.log("🚀 Redirecting to:", redirectPath);
        setLocation(redirectPath);
      }, 100);
      
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }, [loginWithEmailPassword, setLocation, getRedirectPath, user]);

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    console.log("🔥 Starting Google Sign-In...");
    
    try {
      await loginWithGoogle();
      
      // Wait a moment for the auth state to update
      setTimeout(() => {
        const redirectPath = getRedirectPath(user?.role);
        console.log("🚀 Redirecting to:", redirectPath);
        toast({
          title: "Login Successful!",
          description: "Redirecting to your dashboard...",
        });
        setLocation(redirectPath);
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      
      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in was cancelled. Please try again.";
      }
      
      toast({
        title: "Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, toast, setLocation, getRedirectPath, user]);

  return (
    <div className="space-y-6">
      {/* Optimized Google Sign-In Button */}
      <GoogleSignInButton 
        onClick={handleGoogleSignIn} 
        loading={googleLoading || loading} 
      />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Traditional Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="Enter your email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button variant="link" className="px-0 font-normal text-primary" asChild>
              <a href="#">Forgot password?</a>
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
}
