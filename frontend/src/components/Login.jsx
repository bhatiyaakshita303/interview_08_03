import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const login = async () => {
        try {
            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }

            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (err) {
            if (err.response) {
                alert(err.response.data);
            } else {
                alert("Something went wrong");
            }
            console.log(err);
        }
    };

    return (
        <div className="container">
            <h2>Login</h2>
            <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>

            <div className="link-text" onClick={() => navigate("/register")}>
                 Register here
            </div>
        </div>
    );
}

export default Login;