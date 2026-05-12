import { useState } from "react";
import axios from "axios";

function Admin() {
    const [data, setData] = useState({
        title: "",
        description: "",
        price: "",
    });

    const addCourse = async () => {
        try {
            await axios.post("http://localhost:5000/api/courses/add", data);
            alert("Course added");
            setData({ title: "", description: "", price: "" });
        } catch {
            alert("Error");
        }
    };

    return (
        <div>
            <h2>Admin Panel</h2>

            <input
                placeholder="Title"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
            />

            <input
                placeholder="Description"
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
            />

            <input
                type="number"
                placeholder="Price"
                value={data.price}
                onChange={(e) => setData({ ...data, price: e.target.value })}
            />

            <button onClick={addCourse}>Add Course</button>
        </div>
    );
}

export default Admin;