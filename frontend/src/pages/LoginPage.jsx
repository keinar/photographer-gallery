import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    if(localStorage.getItem('user')) {
        navigate('/dashboard');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
       try {
            const response = await axios.post(
                'http://localhost:5001/api/users/login', 
                { email, password }
            );
            console.log('Login successful:', response.data);
            login(response.data);
            alert('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            alert(message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input  
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;