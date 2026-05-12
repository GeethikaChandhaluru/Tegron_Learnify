import { useEffect, useState } from "react";
import axios from "axios";

function Courses() {
    const [courses, setCourses] = useState([]);

    const fetchCourses = async () => {
        const res = await axios.get("http://localhost:5000/api/courses");
        setCourses(res.data);
    };

    const deleteCourse = async (id) => {
        await axios.delete(`http://localhost:5000/api/courses/${id}`);
        fetchCourses(); // refresh
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div>
            <h2>Courses</h2>

            {courses.map((c) => (
                <div key={c._id}>
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
                    <p>₹{c.price}</p>

                    <button onClick={() => deleteCourse(c._id)}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}

export default Courses;