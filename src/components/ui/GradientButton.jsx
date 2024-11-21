import React from "react";
import { motion } from "framer-motion";

const GradientButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
  ...props
}) => {
  const gradients = {
    primary: "from-pink-300 via-purple-300 to-blue-300",
    secondary: "from-blue-300 via-purple-300 to-pink-300",
    danger: "from-red-300 via-pink-300 to-purple-300",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden
        px-4 py-2 rounded-lg
        bg-gradient-to-r ${gradients[variant]}
        text-white font-medium
        shadow-lg
        disabled:opacity-50
        ${className}
      `}
      {...props}>
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
    </motion.button>
  );
};

export default GradientButton;
