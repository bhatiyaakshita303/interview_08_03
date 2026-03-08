import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const register = async () => {
        try {
            if (!name || !email || !password) {
                alert("Please fill all fields");
                return;
            }

            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
                name,
                email,
                password
            });

            alert("Registered successfully!");
            navigate("/");
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
            <h2>Register</h2>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={register}>Register</button>

            <div className="link-text" onClick={() => navigate("/")}>
               Login here
            </div>
        </div>
    );
}

export default Register;