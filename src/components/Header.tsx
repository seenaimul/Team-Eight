import { Bell, Home, Info, LogIn, Phone, Search, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/logo.png'
import { NavButton } from './NavButton';

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {to: '/', id: 'home', label: 'Home', icon: Home},
        {to: '/search', id: 'search', label: 'Search', icon: Search},
        {to: '/alerts', id: 'alerts', label: 'Alerts', icon: Bell, protected: true},
        {to: '/market', id: 'market', label: 'Market Intelligence', icon: TrendingUp},
        {to: '/contact', id: 'contact', label: 'Contact', icon: Phone},
        {to: '/about', id: 'about', label: 'About', icon: Info}
    ];


    return (
        <div className="flex flex-col bg-grey">
            <header className="sticky top-0 z-50 h-[80px] bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                        <img src={logo} alt="Logo" className="h-12 w-auto" />
                        </div>

                        <nav className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => (
                                <NavButton
                                    key={item.id}
                                    id={item.id}
                                    label={item.label}
                                    icon={item.icon}
                                    active={location.pathname === item.to}
                                    onClick={() => navigate(item.to)}
                                    />
                                )
                            )}
                        </nav>
                
                
                <div className="flex flex-row mt-1">
                <NavButton id="/signin" label="Sign In" icon={LogIn} onClick={() => navigate('/signin')} />
                <div className="m-2"></div>
                <NavButton id="/signup" label="Sign Up" active={location.pathname === "/signup"} onClick={() => navigate('/signup')} />
                </div>
            </div>
    
            </div>

        </header>
        </div>
    )
} 

export default Header;