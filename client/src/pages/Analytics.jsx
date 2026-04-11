import { useState, useEffect, useContext } from "react"
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Analytics(){
    const { token, logout } = useContext(AuthContext)
    const [analytics, setAnalytics] = useState(null)

    useEffect(()=>{
        fetchAnalytics()
    },[])
    
         async function fetchAnalytics() {
             try {
                 console.log("Fetching from:", `${process.env.REACT_APP_API_URL}/api/habits/analytics`);
                 const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/habits/analytics`, {
                     headers: { Authorization: `Bearer ${token}` }
                 });
                 console.log("Data received:", res.data); 
                 setAnalytics(res.data);
             } catch (err) {
                 console.error("Fetch error:", err.response || err);
                 setAnalytics({}); 
             }
            }
        if (!analytics) return <p>Loading...</p>

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-8 text-center text-green-400 underline decoration-green-600/30">
                Performance Dashboard
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Bar Chart: Weekly Activity */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-gray-300">Weekly Completion Trend</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.completionsPerDay}>
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10B981' }}
                                />
                                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Pie Chart: Habit Distribution */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-gray-300">Success Rate by Habit</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.habitCompletion}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {analytics.habitCompletion.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Streak Leaderboard (The "List") */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-400">🔥 Current Streak Leaders</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {analytics.streakLeaderboard.map((item, index) => (
                            <div key={index} className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-orange-500">
                                <p className="text-sm text-gray-400 uppercase tracking-wider">{item.name}</p>
                                <p className="text-2xl font-bold">{item.streak} Days</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}