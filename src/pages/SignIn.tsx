
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/components/ThemeProvider";


const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          toast.error('Error checking authentication status');
        } else if (session) {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error('Authentication error occurred');
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (event === 'SIGNED_IN' && session) {
        toast.success('Successfully signed in!');
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        toast.success('Successfully signed out!');
      } else if (event === 'SIGNED_UP') {
        toast.success('Account created! Please check your email to verify your account.');
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.success('Password recovery email sent!');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      } else if (event === 'USER_UPDATED') {
        toast.success('Profile updated!');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Meeting Minder</h1>
          <p className="text-muted-foreground">Sign in to manage your meetings and action items</p>
        </div>

        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Authentication</h2>
          <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              redirectTo={`${window.location.origin}/`}
              onlyThirdPartyProviders={false}
              showLinks={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
