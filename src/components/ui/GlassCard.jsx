import React from "react";

const GlassCard = ({
  children,
  className = "",
  blur = "sm",
  intensity = "20",
  ...props
}) => {
  return (
    <div
      className={`
        backdrop-blur-${blur}
        bg-white/${intensity}
        border border-white/30
        rounded-2xl
        shadow-lg
        ${className}
      `}
      {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
