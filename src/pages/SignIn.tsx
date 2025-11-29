import {supabase} from "../supabase/client.ts"
import logo from '../assets/logo.png'
import { useNavigate } from "react-router-dom";
import {useState} from "react"

async function handleLogin(email: string, password: string) {
  try {
    // Step 1: Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log("AUTH LOGIN:", { data, error });

    if (error) {
      return { success: false, error: error.message };
    }

    // Step 2: Get authenticated user ID
    const userId = data.user?.id;
    if (!userId) {
      return { success: false, error: "Failed to get user ID after login." };
    }

    // Step 3: Fetch user profile from users table to get role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    console.log("USER PROFILE:", profile);

    if (profileError) {
      return { 
        success: false, 
        error: profileError.message || "Failed to fetch user profile." 
      };
    }

    if (!profile) {
      return { 
        success: false, 
        error: "User profile not found. Please contact support." 
      };
    }

    return { 
      success: true, 
      user: data.user, 
      role: profile.role 
    };
  } catch (err: any) {
    console.error("Login error:", err);
    return { 
      success: false, 
      error: err.message || "An unexpected error occurred during login." 
    };
  }
}

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); // Clear previous errors

    const result = await handleLogin(email, password);
    
    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes("Invalid login credentials") || 
          result.error?.includes("Email not confirmed") ||
          result.error?.toLowerCase().includes("invalid")) {
        setErrorMsg("Incorrect email or password.");
      } else if (result.error?.includes("profile not found")) {
        setErrorMsg("User profile not found. Please contact support.");
      } else {
        setErrorMsg(result.error || "An error occurred. Please try again.");
      }
      return;
    }

    // Step 4: Redirect based on role
    const role = result.role;
    if (role === "seller") {
      navigate("/seller/dashboard");
    } else if (role === "buyer") {
      navigate("/buyer/dashboard");
    } else if (role === "agent") {
      navigate("/agent/dashboard");
    } else if (role === "admin") {
      navigate("/admin");
    } else {
      // Fallback for unknown roles
      navigate("/");
    }
  }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
        <div className="bg-white flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm">
          
          {/* Header */}
          <div className="px-6 pt-6 pb-2 text-center">
            <div className="flex justify-center mb-4">
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto"
                onClick={() => navigate('/')}
              />
            </div>
            <h4 className="text-2xl font-semibold">Welcome Back</h4>
            <p className="text-gray-500">Sign in to your account</p>
          </div>
  
          {/* Form */}
          <div className="px-6 pb-6">
            <form className="space-y-4" onSubmit={submitForm}>

              {errorMsg && (<div className="text-red-600 text-sm">{errorMsg}</div>)}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  className="w-full h-10 rounded-md border px-3 py-1 bg-white text-sm outline-none
                             placeholder:text-gray-400
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
  
              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-10 rounded-md border px-3 py-1 bg-white text-sm outline-none
                             placeholder:text-gray-400
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
  
              {/* Forgot Password */}
              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
  
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-10 rounded-md bg-gray-950 text-white text-sm font-medium
                           hover:bg-gray-700 transition"
              >
                Sign In
              </button>
  
              {/* Sign Up */}
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button type="button" onClick={() => navigate("/signup")} className="text-blue-600 hover:underline">
                  Sign up
                </button>
              </div>
  
            </form>
          </div>
  
        </div>
      </div>
    );
  }