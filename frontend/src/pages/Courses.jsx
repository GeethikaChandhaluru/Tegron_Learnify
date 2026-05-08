import { useEffect, useState } from "react";
import axios from "axios";

function Courses() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/courses")
            .then(res => setCourses(res.data));
    }, []);

    return (
        <div>
            <h2>Courses</h2>
            {courses.map(c => (
                <div key={c._id}>{c.title} - ₹{c.price}</div>
            ))}
        </div>
    );
}

export default Courses;