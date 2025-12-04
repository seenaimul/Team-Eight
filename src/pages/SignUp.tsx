import {supabase} from '../supabase/client.ts'
import logo from "../assets/logo.png";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

async function handleSignUp(email: string, password: string, firstName: string, lastName: string, role: string) {
    try {
        // Step 1: Create Supabase Auth user (ONLY email and password)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        console.log("AUTH SIGNUP RESULT:", { data, error });
        
        if (error) {
            return { success: false, error: error.message };
        }

        // Step 2: Get user ID from data.user OR data.session.user
        const user = data.user ?? data.session?.user;
        const userId = user?.id;

        if (!userId) {
            return { 
                success: false, 
                error: "Failed to create user account. User ID not found." 
            };
        }

        // Step 3: UPDATE the user row created by the database trigger
        // DO NOT INSERT - the trigger already created the row
        const { error: updateError } = await supabase
            .from('users')
            .update({
                first_name: firstName,
                last_name: lastName,
                role: role,
            })
            .eq('id', userId);

        console.log("UPDATED USER:", {
            id: userId,
            first_name: firstName,
            last_name: lastName,
            role: role
        });

        if (updateError) {
            console.error("UPDATE ERROR:", updateError);
            return { 
                success: false, 
                error: updateError.message || "Database error saving new user" 
            };
        }
        /// TODO: SignOUt Before going Home
        
        return { success: true, user: user };
    } catch (err: any) {
        console.error('Signup error:', err);
        return { 
            success: false, 
            error: err.message || "An unexpected error occurred during signup" 
        };
    }
}


export default function SignUp() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const submitForm = async (e: React.FormEvent)=> {
        e.preventDefault();

        // Validation
        if (!firstName.trim()) {
            setErrorMsg("First name is required");
            return;
        }

        if (!lastName.trim()) {
            setErrorMsg("Last name is required");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setErrorMsg("Password must be at least 8 characters");
            return;
        }

        if (!role) {
            setErrorMsg("Please select a role");
            return;
        }

        if (!termsAccepted) {
            setErrorMsg("You must agree to the terms.")
            return;
        }

        const result = await handleSignUp(email, password, firstName, lastName, role);

        if (result.success) {
            navigate('/')
        }
        else {
            setErrorMsg(result.error || "Something went wrong");
            return;
        }
    };

    const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm">

        {/* Header */}
        <div className="px-6 pt-6 text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-20 w-auto" onClick={() => navigate('/')}/>
          </div>

          <h4 className="text-2xl font-semibold">Create Your Account</h4>
          <p className="text-gray-500">Join us and find your perfect property</p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          <form className="space-y-4" onSubmit={submitForm}>

            {errorMsg && (<div className="text-red-600 text-sm">{errorMsg}</div>)}

            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>  setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>  setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>  setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">I am a...</label>

              <select
                id="role"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setRole(e.target.value)
                  }
                required
                className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              >
                <option value="">Select user type</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 py-2">
              <input type="checkbox" id="terms" className="mt-1" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermsAccepted(e.target.checked)
  } />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <button type="button" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </button>{" "}
                and{" "}
                <button type="button" className="text-blue-600 hover:underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-sm font-medium transition"
            >
              Create Account
            </button>

            {/* Already have account */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/signin")} className="text-blue-600 hover:underline">
                Sign in
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
