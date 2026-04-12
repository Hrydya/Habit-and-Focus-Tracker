import { useState, useContext } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext.js'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
   
    const { saveToken } = useContext(AuthContext);
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("All fields are required");
            return;
        }
        try {
      
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
            saveToken(res.data.token);
            navigate('/dashboard')
        }
        catch (err) {
            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message;

                if (status === 401) {
                    setError("Invalid email or password");
                } else if (status === 400) {
                    setError(message || "Invalid input");
                } else if (status === 500) {
                    setError("Server error. Try again later.");
                } else {
                    setError(message || "Request failed");
                }
            } else {
                setError("Network error. Please check your connection.");
            }
        }
       
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">Login</h2>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-2 rounded mb-4 focus:outline-none focus:border-indigo-500"
                        value={email}
                        required
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-2 rounded mb-4 focus:outline-none focus:border-indigo-500"
                        value={password}
                        required
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    />
                    <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                        Login
                    </button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-500">
                    Don't have an account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    )
}