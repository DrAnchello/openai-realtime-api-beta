import React from "react";
import GlassCard from "../ui/GlassCard";
import {
  MessageCircle,
  Folder,
  FileText,
  Code,
  Terminal,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatePage = () => {
  const navigate = useNavigate();

  const createOptions = [
    {
      title: "New Chat",
      description: "Start a new conversation with AIda",
      icon: MessageCircle,
      action: () => navigate("/"),
      gradient: "from-purple-300 via-pink-300 to-blue-300",
    },
    {
      title: "New Project",
      description: "Create a new project workspace",
      icon: Folder,
      action: () => console.log("New Project"),
      gradient: "from-blue-300 via-green-300 to-teal-300",
    },
    {
      title: "New Document",
      description: "Create a new AI-assisted document",
      icon: FileText,
      action: () => console.log("New Document"),
      gradient: "from-orange-300 via-amber-300 to-yellow-300",
    },
    {
      title: "Code Assistant",
      description: "Get help with coding tasks",
      icon: Code,
      action: () => console.log("Code Assistant"),
      gradient: "from-emerald-300 via-teal-300 to-cyan-300",
    },
    {
      title: "Terminal Assistant",
      description: "AI-powered command line help",
      icon: Terminal,
      action: () => console.log("Terminal Assistant"),
      gradient: "from-rose-300 via-red-300 to-pink-300",
    },
    {
      title: "Learning Session",
      description: "Start an AI-guided learning session",
      icon: Brain,
      action: () => console.log("Learning Session"),
      gradient: "from-indigo-300 via-purple-300 to-violet-300",
    },
  ];

  return (
    <div className="p-8">
      <GlassCard className="p-6">
        <h1 className="text-2xl font-light mb-6">Create New</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {createOptions.map(
            ({ title, description, icon: Icon, action, gradient }) => (
              <button
                key={title}
                onClick={action}
                className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative p-6 flex flex-col items-center text-center space-y-3">
                  <Icon className="w-8 h-8 text-gray-700 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-medium">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </button>
            )
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default CreatePage;
