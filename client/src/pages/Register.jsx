import {useState,useContext} from 'react'
import {useNavigate,Link} from 'react-router-dom'
import axios from 'axios'
import {AuthContext} from '../context/AuthContext'

export default function Register(){
    const [email,setEmail]= useState('')
    const[name,setName] = useState('')
    const [password,setPassword] = useState('')
    const [confirmpassword,setConfirmPassword]= useState('')
    const [error,setError] = useState('')
    const {saveToken} = useContext(AuthContext)
    const navigate= useNavigate()

    const handleSubmit= async (e)=>{
        e.preventDefault();
        if (!email || !password || !name || !confirmpassword) {
            setError("All fields are required");
            return;
        }
        if (password !== confirmpassword) {
            setError('Passwords do not match ')
            return;
        }
        try{

            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`,{name,email,password,confirmpassword})
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
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">Register</h2>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-2 rounded mb-4 focus:outline-none focus:border-indigo-500"
                        value={name}
                        required
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-2 rounded mb-4 focus:outline-none focus:border-indigo-500"
                        value={confirmpassword}
                        required
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    />
                    <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                        Register
                    </button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    )
}