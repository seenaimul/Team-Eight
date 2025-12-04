import { Home, LogIn, Phone, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase/client";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { NavButton } from "./NavButton";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role ?? null);
    }

    fetchRole();
  }, [user]);

  if (loading) return null;

  const navItems = [
    { to: "/", id: "home", label: "Home", icon: Home },
    { to: "/search", id: "search", label: "Search", icon: Search },
    { to: "/contact", id: "contact", label: "Contact", icon: Phone },
  ];

  // Build correct dashboard route
  const dashboardRoute =
    role === "buyer"
      ? `/buyer/dashboard/${user?.id}`
      : role === "seller"
      ? `/seller/${user?.id}/dashboard`
      : role === "agent"
      ? `/agent/dashboard/${user?.id}`
      : role === "admin"
      ? `/admin/${user?.id}`
      : null;

  return (
    <header className="sticky top-0 z-50 h-[80px] bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <img src={logo} alt="Logo" className="h-12 w-auto" />

          {/* Navigation */}
          <nav className="pl-40 hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                active={location.pathname === item.to}
                onClick={() => navigate(item.to)}
              />
            ))}
          </nav>

          {/* Auth */}
          <div className="flex flex-row mt-1">
            {!user ? (
              <>
                <NavButton
                  id="signin"
                  label="Sign In"
                  icon={LogIn}
                  onClick={() => navigate("/signin")}
                />
                <div className="mx-2" />
                <NavButton
                  id="signup"
                  label="Sign Up"
                  onClick={() => navigate("/signup")}
                />
              </>
            ) : (
              <>
                {dashboardRoute && (
                  <NavButton
                    id="dashboard"
                    label="Dashboard"
                    onClick={() => navigate(dashboardRoute)}
                  />
                )}
                <div className="mx-2" />
                <NavButton
                  id="signout"
                  label="Sign Out"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/signin");
                  }}
                />

              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
