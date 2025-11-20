import logo from "../assets/logo.png";

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border w-full max-w-2xl shadow-sm">

        {/* Header */}
        <div className="px-6 pt-6 text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="h-20 w-auto" />
          </div>

          <h4 className="text-2xl font-semibold">Create Your Account</h4>
          <p className="text-gray-500">Join us and find your perfect property</p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          <form className="space-y-4">

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Smith"
                className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input
                id="email"
                type="email"
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
                  placeholder="Min. 8 characters"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <label htmlFor="userType" className="text-sm font-medium">I am a...</label>

              <select
                id="userType"
                className="w-full rounded-md border px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              >
                <option value="">Select user type</option>
                <option value="tenant">Tenant - Looking to Rent</option>
                <option value="landlord">Landlord - Listing Properties</option>
                <option value="buyer">Buyer - Looking to Purchase</option>
              </select>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 py-2">
              <input type="checkbox" id="terms" className="mt-1" />
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
              <button type="button" className="text-blue-600 hover:underline">
                Sign in
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
