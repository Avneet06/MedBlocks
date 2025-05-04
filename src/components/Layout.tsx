import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, UserPlus, Users, Database, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center text-primary hover:text-primary/80 transition-colors duration-300">
                <Activity className="h-6 w-6 mr-2" />
                <span className="text-xl font-semibold">MedTrack</span>
              </NavLink>
            </div>
            <nav className="hidden md:flex space-x-2">
              <NavButton
                to="/dashboard"
                label="Dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                isActive={location.pathname === '/dashboard'}
              />
              <NavButton
                to="/register"
                label="Register Patient"
                icon={<UserPlus className="h-5 w-5" />}
                isActive={location.pathname === '/register'}
              />
              <NavButton
                to="/records"
                label="Patient Records"
                icon={<Users className="h-5 w-5" />}
                isActive={location.pathname === '/records'}
              />
              <NavButton
                to="/query"
                label="SQL Query"
                icon={<Database className="h-5 w-5" />}
                isActive={location.pathname === '/query'}
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
        <div className="flex justify-around px-2 py-3">
          <MobileNavButton
            to="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            isActive={location.pathname === '/dashboard'}
          />
          <MobileNavButton
            to="/register"
            icon={<UserPlus className="h-5 w-5" />}
            label="Register"
            isActive={location.pathname === '/register'}
          />
          <MobileNavButton
            to="/records"
            icon={<Users className="h-5 w-5" />}
            label="Records"
            isActive={location.pathname === '/records'}
          />
          <MobileNavButton
            to="/query"
            icon={<Database className="h-5 w-5" />}
            label="Query"
            isActive={location.pathname === '/query'}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8 pt-6">
        {children}
      </main>
    </div>
  );
};

interface NavButtonProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ to, label, icon, isActive }) => {
  return (
    <NavLink
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </NavLink>
  );
};

const MobileNavButton: React.FC<NavButtonProps> = ({ to, label, icon, isActive }) => {
  return (
    <NavLink
      to={to}
      className="flex flex-col items-center space-y-1 transition-colors duration-200"
    >
      <div className={`p-1 rounded-full ${isActive ? 'bg-primary text-white' : 'text-gray-500'}`}>
        {icon}
      </div>
      <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="indicator"
          className="absolute bottom-0 h-1 w-8 bg-primary rounded-t-md"
          transition={{ type: 'spring', duration: 0.5 }}
        />
      )}
    </NavLink>
  );
};

export default Layout;