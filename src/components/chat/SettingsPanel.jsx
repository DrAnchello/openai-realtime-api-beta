import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Mic, Volume2 } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const SettingsPanel = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState({
    inputs: [],
    outputs: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    input: "",
    output: "",
  });

  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          inputs: allDevices.filter((device) => device.kind === "audioinput"),
          outputs: allDevices.filter((device) => device.kind === "audiooutput"),
        });
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };

    if (isOpen) {
      getDevices();
    }
  }, [isOpen]);

  const handleDeviceChange = (type, deviceId) => {
    setSelectedDevices((prev) => ({
      ...prev,
      [type]: deviceId,
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}>
            <GlassCard className="w-full max-w-md m-4 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Mic className="w-4 h-4" />
                    Input Device
                  </label>
                  <select
                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
                    value={selectedDevices.input}
                    onChange={(e) =>
                      handleDeviceChange("input", e.target.value)
                    }>
                    {devices.inputs.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Microphone ${device.deviceId.slice(0, 4)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Volume2 className="w-4 h-4" />
                    Output Device
                  </label>
                  <select
                    className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
                    value={selectedDevices.output}
                    onChange={(e) =>
                      handleDeviceChange("output", e.target.value)
                    }>
                    {devices.outputs.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Speaker ${device.deviceId.slice(0, 4)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
