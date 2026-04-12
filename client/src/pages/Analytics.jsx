import { useState, useEffect, useContext } from "react"
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {Link} from 'react-router-dom'
export default function Analytics() {
   
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
      const { token, logout } = useContext(AuthContext)
    useEffect(() => { fetchAnalytics() }, [])

    async function fetchAnalytics() {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/habits/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            console.log(data);
            setAnalytics(data)
        } catch (err) {
            setError('Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    function buildHeatmap() {
        const today = new Date()
        const days = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            let count = 0
            analytics.heatmapData.forEach(habit => {
                habit.completedDates.forEach(cd => {
                    if (new Date(cd).toISOString().split('T')[0] === dateStr) count++
                })
            })
            days.push({ date: dateStr, count })
        }
        return days
    }

    function getHeatmapColor(count) {
        if (count === 0) return '#374151'
        if (count === 1) return '#AFA9EC'
        if (count === 2) return '#7F77DD'
        return '#534AB7'
    }
    
    if (loading) return (
        <div className="min-h-screen bg-gray-950">
            <nav className="bg-gray-900 border-b border-gray-800 mb-6 px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-400">Habit & Focus Tracker</h1>
            </nav>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-7 bg-gray-800 rounded w-1/4 animate-pulse"></div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                    <div className="h-3 bg-gray-800 rounded w-1/4 mb-3"></div>
                    <div className="h-5 bg-gray-800 rounded w-2/3"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-900 rounded-xl p-4 animate-pulse">
                            <div className="h-3 bg-gray-800 rounded w-1/2 mb-3"></div>
                            <div className="h-7 bg-gray-800 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                    <div className="h-3 bg-gray-800 rounded w-1/4 mb-4"></div>
                    <div className="h-16 bg-gray-800 rounded"></div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                    <div className="h-3 bg-gray-800 rounded w-1/4 mb-4"></div>
                    <div className="h-48 bg-gray-800 rounded"></div>
                </div>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-500">{error}</p>
        </div>
    )

    const heatmapDays = buildHeatmap()
    const totalThisMonth = heatmapDays.reduce((acc, d) => acc + d.count, 0)
    const bestStreak = analytics.streakLeaderboard[0]?.streak || 0
    const totalHabits = analytics.streakLeaderboard.length
    const maxStreak = Math.max(...analytics.streakLeaderboard.map(h => h.streak), 1)
    
    return (
        <div className="min-h-screen bg-gray-950 ">
             <nav className="bg-gray-900 border-b border-gray-800 mb-6 px-8 py-4 flex justify-between items-center">
                            <h1 className="text-xl font-bold text-indigo-400">Habit & Focus Tracker</h1>
                            <div className="flex gap-4">
                                <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 font-medium">Dashboard</Link>
                                <Link to="/analytics" className="text-gray-400 hover:text-indigo-400 font-medium">Analytics</Link>
                                <Link to="/timer" className="text-gray-400 hover:text-indigo-400 font-medium">Timer</Link>
                                <button onClick={logout} className="text-red-400 hover:underline font-medium">Logout</button>
                            </div>
                        </nav>
            <div className="max-w-4xl mx-auto space-y-6">

                <h1 className="text-2xl font-medium text-gray-100">Analytics</h1>

               
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Insights</p>
                    <p className="text-base font-medium text-gray-100">{analytics.insight}</p>
                </div>

            
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-900 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Total habits</p>
                        <p className="text-2xl font-medium text-gray-100">{totalHabits}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Best streak</p>
                        <p className="text-2xl font-medium text-gray-100">{bestStreak} {bestStreak === 1 ? 'day' : 'days'}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">This month</p>
                        <p className="text-2xl font-medium text-gray-100">{totalThisMonth}</p>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-100 mb-4">Last 30 days</p>
                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
                        {heatmapDays.map((day, i) => (
                            <div
                                key={i}
                                title={`${day.date}: ${day.count} completions`}
                                style={{ background: getHeatmapColor(day.count), aspectRatio: '1', borderRadius: '3px' }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <p className="text-xs text-gray-500">Less</p>
                        {['#1f2937', '#AFA9EC', '#7F77DD', '#534AB7'].map((c, i) => (
                            <div key={i} style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
                        ))}
                        <p className="text-xs text-gray-500">More</p>
                    </div>
                </div>

                
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-100 mb-4">Weekly activity</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.completionsPerDay}>
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                            <Tooltip
                                contentStyle={{ background: '#111827', border: '0.5px solid #374151', borderRadius: 8, fontSize: 12, color: '#f3f4f6' }}
                            />
                            <Bar dataKey="count" fill="#534AB7" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-100 mb-4">Streak leaderboard</p>
                    <div className="space-y-4">
                        {analytics.streakLeaderboard.map((habit, i) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                                <p className="text-sm text-gray-300 w-24 truncate">{habit.name}</p>
                                <div className="flex-1 h-1 bg-gray-800 rounded-full">
                                    <div
                                        className="h-1 rounded-full"
                                        style={{ width: `${(habit.streak / maxStreak) * 100}%`, background: '#534AB7' }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 w-16 text-right">{habit.streak} {habit.streak === 1 ? 'day' : 'days'}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}