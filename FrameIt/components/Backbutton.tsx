import React, { useState } from "react";

interface BackButtonProps {
  onBack?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  const [sliding, setSliding] = useState(false);

  const handleClick = () => {
    setSliding(true);
    setTimeout(() => {
      setSliding(false);
      if (onBack) onBack();
    }, 300); // duration matches CSS transition
  };

  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        background: "#eee",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        overflow: "hidden",
      }}
      onClick={handleClick}
    >
      <span
        style={{
          display: "inline-block",
          transition: "transform 0.3s",
          transform: sliding ? "translateX(40px)" : "translateX(0)",
        }}
      >
        {/* Simple left arrow SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24">
          <polyline
            points="15 6 9 12 15 18"
            fill="none"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span style={{ marginLeft: "8px", fontWeight: 500 }}>Back</span>
    </button>
  );
};

export default BackButton;
