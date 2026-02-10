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

        // Step 3: Insert (or upsert) the user profile
        // We use upsert to be safe, but since we disabled the trigger, this should be a new row.
        const { error: updateError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                first_name: firstName,
                last_name: lastName,
                role: role,
            });

        console.log("CREATED USER PROFILE:", {
            id: userId,
            email: email,
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
    const [agreementError, setAgreementError] = useState('');

    const openTerms = () => {
        window.open('/terms-and-conditions.pdf', '_blank');
    };

    const openPrivacy = () => {
        window.open('/user-agreement.pdf', '_blank');
    };

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
            setAgreementError('You must agree to the Terms and Conditions to continue.');
            setErrorMsg("You must agree to the terms.");
            return;
        }
        
        // Clear agreement error if terms are accepted
        setAgreementError('');

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
                <option value="buyer">Buyer / Renter</option>
                <option value="seller">Agent / Landlord</option>
              </select>
            </div>

            {/* Terms */}
            <div className="py-2">
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-1" 
                  checked={termsAccepted}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) {
                      setAgreementError('');
                    }
                  }}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <span
                    onClick={openTerms}
                    className="text-blue-600 underline cursor-pointer mx-1"
                  >
                    Terms and Conditions
                  </span>{" "}
                  and{" "}
                  <span
                    onClick={openPrivacy}
                    className="text-blue-600 underline cursor-pointer mx-1"
                  >
                    Privacy Policy
                  </span>
                </label>
              </div>
              {agreementError && (
                <p className="text-red-500 text-sm mt-1">{agreementError}</p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={!termsAccepted}
              className={`w-full rounded-md py-2 text-sm font-medium transition ${
                termsAccepted 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
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




// import { supabase } from "../supabase/client";
// import logo from "../assets/logo.png";
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// async function handleSignUp(
//   email: string,
//   password: string,
//   firstName: string,
//   lastName: string,
//   role: string
// ) {
//   try {
//     // Note: We can't directly query auth.users, so we rely on signup error
    
//     // Create Auth user + store profile fields in user metadata.
//     // The database trigger (Option A) will insert/update public.users automatically.
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           first_name: firstName,
//           last_name: lastName,
//           role,
//           provider: 'email',
//         },
//       },
//     });

//     console.log("AUTH SIGNUP RESULT:", { data, error });

//     if (error) {
//       // Handle specific error messages
//       if (error.message.includes('already registered') || error.message.includes('already exists')) {
//         return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
//       }
//       if (error.message.includes('rate limit')) {
//         return { success: false, error: 'Too many signup attempts. Please try again in a few minutes or disable email confirmation in Supabase settings.' };
//       }
//       return { success: false, error: error.message };
//     }

//     // Note: if email confirmation is enabled, session may be null.
//     // That's OK with Option A because the DB trigger runs server-side.
//     const user = data.user ?? data.session?.user;

//     if (!user?.id) {
//       return {
//         success: false,
//         error:
//           "Signup completed but user id was not returned. If email confirmation is enabled, please check your email to confirm your account.",
//       };
//     }

//     // Insert user profile into public.users table
//     const { error: insertError } = await supabase
//       .from('users')
//       .insert({
//         id: user.id,
//         email: email,
//         first_name: firstName,
//         last_name: lastName,
//         role: role,
//       });

//     if (insertError) {
//       console.error("Failed to insert user profile:", insertError);
//       // Don't fail signup if insert fails - user is created in auth
//       // but log the error for debugging
//     }

//     return { success: true, user };
//   } catch (err: any) {
//     console.error("Signup error:", err);
//     return {
//       success: false,
//       error: err?.message || "An unexpected error occurred during signup",
//     };
//   }
// }

// export default function SignUp() {
//   const navigate = useNavigate();

//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [role, setRole] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [termsAccepted, setTermsAccepted] = useState(false);
//   const [agreementError, setAgreementError] = useState("");

//   const openTerms = () => window.open("/terms-and-conditions.pdf", "_blank");
//   const openPrivacy = () => window.open("/user-agreement.pdf", "_blank");

//   const submitForm = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMsg("");

//     // Validation
//     if (!firstName.trim()) return setErrorMsg("First name is required");
//     if (!lastName.trim()) return setErrorMsg("Last name is required");

//     if (!email.trim()) return setErrorMsg("Email is required");

//     if (password !== confirmPassword)
//       return setErrorMsg("Passwords do not match");
//     if (password.length < 8)
//       return setErrorMsg("Password must be at least 8 characters");

//     if (!role) return setErrorMsg("Please select a role");

//     if (!termsAccepted) {
//       setAgreementError("You must agree to the Terms and Conditions to continue.");
//       return setErrorMsg("You must agree to the terms.");
//     }

//     setAgreementError("");

//     const result = await handleSignUp(email, password, firstName, lastName, role);

//     if (result.success) {
//       // If email confirmation is enabled, you may want to route to a "Check your email" page.
//       // For now we keep your original behavior.
//       navigate("/");
//     } else {
//       setErrorMsg(result.error || "Something went wrong");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
//       <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border w-full max-w-md shadow-sm">
//         {/* Header */}
//         <div className="px-6 pt-6 text-center border-b pb-6">
//           <div className="flex justify-center mb-4">
//             <img
//               src={logo}
//               alt="Logo"
//               className="h-20 w-auto cursor-pointer"
//               onClick={() => navigate("/")}
//             />
//           </div>

//           <h4 className="text-2xl font-semibold">Create Your Account</h4>
//           <p className="text-gray-500">Join us and find your perfect property</p>
//         </div>

//         {/* Form */}
//         <div className="px-6 pb-6">
//           <form className="space-y-4" onSubmit={submitForm}>
//             {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}

//             {/* First Name and Last Name */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label htmlFor="firstName" className="text-sm font-medium">
//                   First Name
//                 </label>
//                 <input
//                   id="firstName"
//                   type="text"
//                   value={firstName}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                     setFirstName(e.target.value)
//                   }
//                   placeholder="John"
//                   required
//                   className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="lastName" className="text-sm font-medium">
//                   Last Name
//                 </label>
//                 <input
//                   id="lastName"
//                   type="text"
//                   value={lastName}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                     setLastName(e.target.value)
//                   }
//                   placeholder="Smith"
//                   required
//                   className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Email */}
//             <div className="space-y-2">
//               <label htmlFor="email" className="text-sm font-medium">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                   setEmail(e.target.value)
//                 }
//                 placeholder="your.email@example.com"
//                 required
//                 className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
//               />
//             </div>

//             {/* Passwords */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label htmlFor="password" className="text-sm font-medium">
//                   Password
//                 </label>
//                 <input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                     setPassword(e.target.value)
//                   }
//                   placeholder="Min. 8 characters"
//                   required
//                   className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="confirmPassword" className="text-sm font-medium">
//                   Confirm Password
//                 </label>
//                 <input
//                   id="confirmPassword"
//                   type="password"
//                   value={confirmPassword}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                     setConfirmPassword(e.target.value)
//                   }
//                   placeholder="Re-enter password"
//                   required
//                   className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Role */}
//             <div className="space-y-2">
//               <label htmlFor="role" className="text-sm font-medium">
//                 I am a...
//               </label>
//               <select
//                 id="role"
//                 value={role}
//                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//                   setRole(e.target.value)
//                 }
//                 required
//                 className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
//               >
//                 <option value="">Select user type</option>
//                 <option value="buyer">Buyer / Renter</option>
//                 <option value="seller">Seller / Landlord</option>
//                 <option value="agent">Agent</option>
//               </select>
//             </div>

//             {/* Terms */}
//             <div className="py-2">
//               <div className="flex items-start gap-2">
//                 <input
//                   type="checkbox"
//                   id="terms"
//                   className="mt-1"
//                   checked={termsAccepted}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                     setTermsAccepted(e.target.checked);
//                     if (e.target.checked) setAgreementError("");
//                   }}
//                 />
//                 <label htmlFor="terms" className="text-sm text-gray-600">
//                   I agree to the{" "}
//                   <span
//                     onClick={openTerms}
//                     className="text-blue-600 underline cursor-pointer mx-1"
//                   >
//                     Terms and Conditions
//                   </span>{" "}
//                   and{" "}
//                   <span
//                     onClick={openPrivacy}
//                     className="text-blue-600 underline cursor-pointer mx-1"
//                   >
//                     Privacy Policy
//                   </span>
//                 </label>
//               </div>
//               {agreementError && (
//                 <p className="text-red-500 text-sm mt-1">{agreementError}</p>
//               )}
//             </div>

//             {/* Button */}
//             <button
//               type="submit"
//               disabled={!termsAccepted}
//               className={`w-full rounded-md py-2 text-sm font-medium transition ${
//                 termsAccepted
//                   ? "bg-blue-600 hover:bg-blue-700 text-white"
//                   : "bg-gray-300 cursor-not-allowed text-gray-500"
//               }`}
//             >
//               Create Account
//             </button>

//             {/* Already have account */}
//             <div className="text-center text-sm text-gray-600">
//               Already have an account?{" "}
//               <button
//                 type="button"
//                 onClick={() => navigate("/signin")}
//                 className="text-blue-600 hover:underline"
//               >
//                 Sign in
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }