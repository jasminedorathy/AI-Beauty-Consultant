import { useState, useEffect } from 'react';
import { FaBell, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const location = useLocation();
    const navigate = useNavigate();

    // Extract username from email
    const getUsername = () => {
        const email = localStorage.getItem('email') || localStorage.getItem('username') || '';

        // If it's an email, extract the part before @
        if (email.includes('@')) {
            return email.split('@')[0];
        }

        // Otherwise return as is
        return email || 'User';
    };

    const username = getUsername();

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const handleSettings = () => {
        navigate('/dashboard/settings');
    };

    const handleNotifications = () => {
        // Add notification functionality here
        alert('No new notifications');
    };

    // Get page title from route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/analyze')) return 'Ready for Analysis';
        if (path.includes('/live')) return 'Live Camera Analysis';
        if (path.includes('/hair')) return 'Hair Styling';
        if (path.includes('/nails')) return 'Nail Styling';
        if (path.includes('/services')) return 'Services';
        if (path.includes('/history')) return 'Analysis History';
        if (path.includes('/trends')) return 'Skin Trends';
        if (path.includes('/settings')) return 'Settings';
        return 'Dashboard';
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Format time as HH:MM AM/PM
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center justify-between max-w-full">

                {/* Left - Page Title & Breadcrumb */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
                        <span className="text-2xl">📸</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium tracking-wide mt-0.5">
                        AI BEAUTY CONSULTANT / ANALYZE
                    </p>
                </div>

                {/* Left - Time and User Greeting */}
                <div className="flex items-center gap-4">
                    {/* Time Display */}
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold text-blue-700">{formatTime(currentTime)}</span>
                    </div>

                    {/* User Greeting */}
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">{getGreeting()}</span>
                        <span className="text-sm font-bold text-blue-600">{username}</span>
                    </div>
                </div>

                {/* Right - User Actions */}
                <div className="flex items-center gap-3">

                    {/* Notification Bell */}
                    <button
                        onClick={handleNotifications}
                        className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Notifications"
                    >
                        <FaBell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </button>

                    {/* Settings */}
                    <button
                        onClick={handleSettings}
                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Settings"
                    >
                        <FaCog size={18} />
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <FaSignOutAlt size={14} />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

