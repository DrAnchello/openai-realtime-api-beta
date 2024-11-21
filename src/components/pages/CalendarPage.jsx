import React, { useState } from "react";
import GlassCard from "../ui/GlassCard";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import GradientButton from "../ui/GradientButton";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const events = {
    // Sample events - in real app would come from a store
    "2024-03-15": [
      { title: "AI Training Session", time: "10:00 AM" },
      { title: "Project Review", time: "2:00 PM" },
    ],
    "2024-03-20": [{ title: "Team Meeting", time: "11:00 AM" }],
  };

  const getDateKey = (day) => {
    return `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  return (
    <div className="p-8">
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-light">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <GradientButton className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Event
          </GradientButton>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-4">
          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = getDateKey(day);
            const dayEvents = events[dateKey] || [];

            return (
              <div
                key={day}
                className="aspect-square rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors cursor-pointer group">
                <div className="h-full flex flex-col">
                  <span className="text-sm font-medium">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="text-xs bg-purple-300/20 rounded px-1 py-0.5 truncate">
                          {event.time} - {event.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};

export default CalendarPage;
