import React from "react";
import {
  Calendar,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessagesSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isSidebarCollapsed, setSidebarCollapsed }) => {
  const navigate = useNavigate();

  const navItems = [
    { icon: MessagesSquare, label: "Chat", path: "/dashboard" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: Plus, label: "Create", path: "/create" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div
      className={`
        relative h-screen
        bg-white/10 backdrop-blur-md
        border-r border-white/30
        transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? "w-16" : "w-64"}
      `}>
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute -right-3 top-8 bg-white/40 rounded-full p-1 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/50 transition-colors">
        {isSidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-700" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="p-4 space-y-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-aida-coral to-aida-mint shadow-lg" />
          {!isSidebarCollapsed && (
            <span className="text-xl font-light text-gray-800">AIda</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-4">
          {navItems.map(({ icon: Icon, label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-white/20 transition-colors text-gray-700 group">
              <Icon className="w-5 h-5 group-hover:text-aida-coral transition-colors" />
              {!isSidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
