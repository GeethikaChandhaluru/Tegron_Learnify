import { useState } from "react";
import axios from "axios";

function Signup() {
    const [data, setData] = useState({ name: "", email: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("http://localhost:5000/api/auth/register", data);
        alert(res.data.message);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Signup</h2>
            <input placeholder="Name" onChange={(e) => setData({ ...data, name: e.target.value })} />
            <input placeholder="Email" onChange={(e) => setData({ ...data, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={(e) => setData({ ...data, password: e.target.value })} />
            <button type="submit">Signup</button>
        </form>
    );
}

export default Signup;