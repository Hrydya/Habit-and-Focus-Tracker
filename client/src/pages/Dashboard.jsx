
import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import {Link} from 'react-router-dom'


export default function Dashboard() {

    const [habits, setHabits] = useState([])
    const [habitName, setHabitName] = useState('')
    const [loading, setLoading] = useState(true)
    const { token, logout } = useContext(AuthContext)


    async function fetchHabits() {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/habits`, {
                headers: { Authorization: `Bearer ${token}` }
                
            })
            console.log(data);
            setHabits(data.habits)
        } catch (err) {
            console.error(err?.response?.data || err.message)
        }
        finally{
            setLoading(false);
        }
    }
    const addHabit = async (e) => {
        e.preventDefault()
        try {
            const {data}= await axios.post(`${process.env.REACT_APP_API_URL}/api/habits`,
                { name: habitName },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setHabitName('')
            setHabits(prev => [...prev, data.habit]);
        } catch (err) {
            console.error(err?.response?.data || err.message)
        }
    }
    const completeHabit = async (id) => {
        //updating frontend first for fast ui 
        const prevState= [...habits];
        setHabits(prev=> prev.map(h=>{
                 if(h._id !== id)return h;
                    return { ...h, completed: !h.completed };
               
            })
        );
        try {
            const {data} = await axios.patch(`${process.env.REACT_APP_API_URL}/api/habits/${id}/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setHabits(prev =>
                prev.map(habit=>
                habit._id===id ?data.habit:habit
            ))
        }
        catch (err) {
            setHabits(prevState);
            console.error(err?.response?.data || err.message)
            fetchHabits()
        }
    }
    const deleteHabit = async (id) => {
        const prevState = [...habits];
        setHabits(prev =>
            prev.filter(habit => habit._id !== id)
        )
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/habits/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
        } catch (err) {
            setHabits(prevState);
            console.error("Error deleting habit")
            fetchHabits()
            
        }
    }

    useEffect(() => {
        if (!token) return ;
        fetchHabits()
    }, [token])
    if (loading) return (
        <div className="min-h-screen bg-gray-950">
            <nav className="bg-gray-900 border-b border-gray-800 mb-6 px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-400">Habit & Focus Tracker</h1>
            </nav>
            <div className="max-w-xl mx-auto">
                <div className="h-8 bg-gray-800 rounded w-1/3 mb-6 animate-pulse"></div>
                <div className="h-10 bg-gray-800 rounded mb-6 animate-pulse"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-900 border border-gray-800 p-4 rounded-lg mb-3 animate-pulse">
                        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        </div>
    )
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

            <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-100">My Habits</h1>
                </div>

                <form onSubmit={addHabit} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Add a new habit"
                        className="flex-1 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 p-2 rounded focus:outline-none focus:border-indigo-500"
                        value={habitName}
                        onChange={(e) => setHabitName(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Add
                    </button>
                </form>

                {habits.map((habit) => (
                    <div key={habit._id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg mb-3 flex justify-between items-center">
                        <div>
                            <p className={`font-medium ${habit.completed ? 'line-through text-gray-100' : 'text-gray-100'}`}>
                                {habit.name}
                            </p>
                            <p className="text-sm text-gray-500">Streak: {habit.streak} {habit.streak === 1 ? 'day' : 'days'}</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => completeHabit(habit._id)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${habit.completed
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-600 bg-transparent text-transparent hover:border-green-500"
                                    }`}
                            >
                                {habit.completed ? "✓" : ""}
                            </button>

                            <button
                                onClick={() => deleteHabit(habit._id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}

                {habits.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No habits yet. Add one above!</p>
                )}
            </div>
        </div>
    )
}
