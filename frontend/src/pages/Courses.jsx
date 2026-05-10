import { useEffect, useState } from "react";
import axios from "axios";

function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/courses");
            setCourses(res.data);
        } catch (error) {
            console.log(error);
            alert("Error fetching courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div>
            <h2>Courses</h2>

            {loading ? (
                <p>Loading...</p>
            ) : courses.length === 0 ? (
                <p>No courses available</p>
            ) : (
                courses.map((c) => (
                    <div key={c._id} style={{ marginBottom: "10px" }}>
                        <h3>{c.title}</h3>
                        <p>{c.description}</p>
                        <p>₹{c.price}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Courses;