import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

export default function FocusTimer({ task, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const intervalRef = useRef(null);

  // Load saved timer state from localStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem(`focusTimer_${task._id}`);
    if (savedTimer) {
      const { timeLeft: savedTime, isRunning: savedIsRunning } = JSON.parse(savedTimer);
      setTimeLeft(savedTime);
      setIsRunning(savedIsRunning);
    }
  }, [task._id]);

  // Save timer state to localStorage
  useEffect(() => {
    if (timeLeft !== FOCUS_DURATION || isRunning) {
      localStorage.setItem(`focusTimer_${task._id}`, JSON.stringify({
        timeLeft,
        isRunning
      }));
    }
  }, [timeLeft, isRunning, task._id]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.(task);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, task, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(FOCUS_DURATION);
    setIsCompleted(false);
    localStorage.removeItem(`focusTimer_${task._id}`);
  };

  const progress = ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100;

  if (!showTimer) {
    return (
      <button
        onClick={() => setShowTimer(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
      >
        <Clock className="w-4 h-4" />
        Focus Mode
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Focus on: {task.title}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {task.category} • 25-minute Pomodoro session
          </p>

          {/* Timer Circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isCompleted ? "#10b981" : "#3b82f6"}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* Timer text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-mono font-bold ${
                  isCompleted ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {isCompleted ? 'Session Complete!' : (isRunning ? 'Focus Time' : 'Ready to Focus')}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isCompleted ? (
              <>
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Focus
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-medium">Great job! Session completed.</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Start Another Session
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowTimer(false)}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Close Focus Mode
          </button>
        </div>
      </div>
    </div>
  );
}
