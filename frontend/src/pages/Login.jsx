import { useState } from "react";
import axios from "axios";

function Login() {
    const [data, setData] = useState({ email: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("http://localhost:5000/api/auth/login", data);
        alert(res.data.message);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input placeholder="Email" onChange={(e) => setData({ ...data, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={(e) => setData({ ...data, password: e.target.value })} />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;