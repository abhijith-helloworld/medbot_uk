"use client";

import { useEmergency } from "@/hooks/useEmergency";
import Draggable from "react-draggable";
import { useRef, useState } from "react"; // 1. Import useState
import "@/styles/emergency.css";

// Icons remain the same...
const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function EmergencyButton() {
  const { active, toggleEmergency, isLoading } = useEmergency();
  const nodeRef = useRef(null);
  const [wasDragged, setWasDragged] = useState(false); // 2. Add state to track dragging

  // 3. Define event handlers for the Draggable component
  const handleDragStart = () => {
    setWasDragged(false); // Reset drag status on new interaction
  };

  const handleDrag = () => {
    setWasDragged(true); // Set drag status to true if mouse moves
  };

  // 4. Create a new click handler
  const handleClick = () => {
    // Only toggle if the button was NOT dragged
    if (wasDragged) {
      return;
    }
    toggleEmergency();
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={handleDragStart} // Add onStart handler
      onDrag={handleDrag}       // Add onDrag handler
    >
      <div ref={nodeRef} className="emergencyWrapper">
        <button
          onClick={handleClick} // Use the new conditional click handler
          disabled={isLoading}
          aria-label={active ? "Stop Robot" : "Start Robot"}
          className={`emergencyButton ${
            active ? "emergencyActive" : "emergencyInactive"
          }`}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : active ? (
            <StopIcon />
          ) : (
            <PlayIcon />
          )}
        </button>
      </div>
    </Draggable>
  );
}