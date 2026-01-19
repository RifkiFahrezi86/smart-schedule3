interface ProgressBarProps {
  progress: number;
  currentStep: string;
}

export default function ProgressBar({ progress, currentStep }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <p className="process-step">{currentStep}</p>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <span className="progress-text">{Math.round(progress)}%</span>
    </div>
  );
}