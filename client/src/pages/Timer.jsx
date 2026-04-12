import { useState, useEffect,useContext } from "react";
import {Link} from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function App() {
    const [time, setTime] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState("Focus");
    const [cycles, setCycles] = useState(0);
  const {logout } = useContext(AuthContext)
    useEffect(() => {
        let timer;

        if (isRunning) {
            timer = setInterval(() => {
                setTime((prev) => {
                    if (prev === 1) {
                        handleTimerEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [isRunning, mode]);

    const handleTimerEnd = () => {
        if (mode === "Focus") {
            setMode("Break");
            setTime(5 * 60);
        } else {
            setMode("Focus");
            setTime(25 * 60);
            setCycles((c) => c + 1);
        }
    };

    // 🔹 Controls
    const startFocus = () => {
        setMode("Focus");
        setTime(25 * 60);
        setIsRunning(false);
    };

    const startBreak = () => {
        setMode("Break");
        setTime(5 * 60);
        setIsRunning(false);
    };

    const skipBreak = () => {
        if (mode === "Break") {
            startFocus();
        }
    };

    const extendBreak = () => {
        if (mode === "Break") {
            setTime((prev) => prev + 2 * 60);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(mode === "Focus" ? 25 * 60 : 5 * 60);
    };

    const formatTime = () => {
        const mins = Math.floor(time / 60).toString().padStart(2, "0");
        const secs = (time % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    return (
        <div className="min-h-screen bg-gray-950">

            <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-400">Habit & Focus Tracker</h1>
                <div className="flex gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 font-medium">Dashboard</Link>
                    <Link to="/analytics" className="text-gray-400 hover:text-indigo-400 font-medium">Analytics</Link>
                    <Link to="/timer" className="text-gray-400 hover:text-indigo-400 font-medium">Timer</Link>
                    <button onClick={logout} className="text-red-400 hover:underline font-medium">Logout</button>
                </div>
            </nav>

            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 flex flex-col items-center gap-6 w-96">

                    <h1 className="text-2xl font-bold text-gray-100">Focus Tracker</h1>

                    <div className={`text-sm font-semibold px-4 py-1 rounded-full ${mode === "Focus" ? "bg-indigo-900 text-indigo-300" : "bg-green-900 text-green-300"
                        }`}>
                        {mode === "Focus" ? "Focus Time" : "Break Time"}
                    </div>

                    <div className={`text-7xl font-mono font-bold ${mode === "Focus" ? "text-indigo-400" : "text-green-400"
                        }`}>
                        {formatTime()}
                    </div>

                    <div className="flex gap-3 flex-wrap justify-center">
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            className={`px-5 py-2 rounded-lg text-white font-medium ${isRunning
                                    ? "bg-gray-700 hover:bg-gray-600"
                                    : mode === "Focus"
                                        ? "bg-indigo-600 hover:bg-indigo-700"
                                        : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {isRunning ? "Pause" : "Start"}
                        </button>

                        <button onClick={handleReset} className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300">
                            Reset
                        </button>

                        {mode === "Break" && (
                            <>
                                <button onClick={skipBreak} className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
                                    Skip Break
                                </button>
                                <button onClick={extendBreak} className="px-5 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white">
                                    +2 Min
                                </button>
                            </>
                        )}

                        {mode === "Focus" && (
                            <button onClick={startBreak} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                                Take Break
                            </button>
                        )}
                    </div>

                    <p className="text-gray-500 text-sm">Cycles completed: {cycles}</p>
                </div>
            </div>
        </div>
    )
}