// ui/ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
  progress: number;
  currentStep?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ProgressBar({
  progress,
  currentStep,
  showPercentage = true,
  height = 12,
  color = "#5f5f5f",
  backgroundColor = "#ccc",
}: ProgressBarProps) {
  return (
    <div className="progress-bar-container">
      {currentStep && (
        <div className="progress-step-text">{currentStep}</div>
      )}
      
      <div
        className="progress-bar"
        style={{
          height: `${height}px`,
          backgroundColor: backgroundColor,
        }}
      >
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {showPercentage && (
        <div className="progress-text">{progress}%</div>
      )}
    </div>
  );
}

// Circular Progress Bar
export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  color = "#5f5f5f",
  backgroundColor = "#e0e0e0",
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.3s ease",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      <div className="circular-progress-text">{progress}%</div>
    </div>
  );
}

// Step Progress Bar
export function StepProgress({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="step-progress-container">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step-item ${index <= currentStep ? "active" : ""} ${
            index < currentStep ? "completed" : ""
          }`}
        >
          <div className="step-circle">
            {index < currentStep ? "✓" : index + 1}
          </div>
          <div className="step-label">{step}</div>
          {index < steps.length - 1 && (
            <div
              className={`step-line ${
                index < currentStep ? "completed" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}