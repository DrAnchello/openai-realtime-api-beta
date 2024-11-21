import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatInterface from "./chat/ChatInterface";
import CalendarPage from "./pages/CalendarPage";
import CreatePage from "./pages/CreatePage";
import SettingsPage from "./pages/SettingsPage";
import ParticleBackground from "../components/ui/ParticleBackground";

export default function DashboardLayout({ userName }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex">
        <div className="fixed inset-0 bg-gradient-to-l from-aida-coral via-aida-sand to-aida-mint opacity-75" />
        <ParticleBackground color="#f7797d" count={40} />

        <div className="relative flex w-full">
          <Sidebar
            isSidebarCollapsed={isSidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />

          <div className="flex-1">
            <Routes>
              <Route path="/dashboard" element={<ChatInterface userName={userName} />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
