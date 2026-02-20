'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface TimerProps {
  projectId: string;
  projectTitle: string;
  initialTimeSpent?: number; // in minutes
  onTimerUpdate?: (timeSpent: number) => void;
}

export default function Timer({ 
  projectId, 
  projectTitle, 
  initialTimeSpent = 0,
  onTimerUpdate 
}: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(initialTimeSpent * 60); // convert to seconds

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update timer every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/timer/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.session && data.session.projectId === projectId) {
          setSessionId(data.session.id);
          setIsRunning(true);
          
          // Calculate elapsed time from start
          const startTime = new Date(data.session.startTime).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          setElapsedTime(elapsed);
        }
      }
    } catch (error) {
      console.error('Check active session error:', error);
    }
  };

  // Check for active session on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkActiveSession();
  }, [projectId]);

  const handleStart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please login to use the timer');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/timer/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId })
      });

      const data = await res.json();

      if (res.ok) {
        setSessionId(data.session.id);
        setIsRunning(true);
        setElapsedTime(0);
      } else {
        alert(data.message || 'Failed to start timer');
      }
    } catch (error) {
      console.error('Start timer error:', error);
      alert('Failed to start timer');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !sessionId) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace/timer/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sessionId,
          notes: `Worked on ${projectTitle}`
        })
      });

      const data = await res.json();

      if (res.ok) {
        const newTotal = totalTimeSpent + elapsedTime;
        setTotalTimeSpent(newTotal);
        setIsRunning(false);
        setElapsedTime(0);
        setSessionId(null);
        
        // Notify parent component
        if (onTimerUpdate) {
          onTimerUpdate(Math.floor(data.totalTimeSpent / 60)); // convert to minutes
        }

        alert(`Session completed! Total time: ${formatTime(elapsedTime)}`);
      } else {
        alert(data.message || 'Failed to stop timer');
      }
    } catch (error) {
      console.error('Stop timer error:', error);
      alert('Failed to stop timer');
    }
  };

  return (
    <Card className="p-6 bg-white border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Time Tracker
          </h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {formatTime(totalTimeSpent)}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold font-mono text-primary mb-2">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-sm text-muted-foreground">
          {isRunning ? '⚡ Timer Running' : elapsedTime > 0 ? '⏸️ Paused' : '⏱️ Ready to Start'}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex gap-2 justify-center">
        {!sessionId ? (
          <Button
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Timer
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button
                onClick={handlePause}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleResume}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            <Button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!sessionId && (
        <div className="mt-4 text-xs text-center text-muted-foreground">
          Click Start to begin tracking your work on this project
        </div>
      )}
    </Card>
  );
}
