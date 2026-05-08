import { useState } from "react";
import axios from "axios";

function Admin() {
    const [data, setData] = useState({ title: "", description: "", price: "" });

    const addCourse = async () => {
        await axios.post("http://localhost:5000/api/courses", data);
        alert("Course added");
    };

    return (
        <div>
            <h2>Admin</h2>
            <input placeholder="Title" onChange={e => setData({ ...data, title: e.target.value })} />
            <input placeholder="Desc" onChange={e => setData({ ...data, description: e.target.value })} />
            <input placeholder="Price" onChange={e => setData({ ...data, price: e.target.value })} />
            <button onClick={addCourse}>Add</button>
        </div>
    );
}

export default Admin;