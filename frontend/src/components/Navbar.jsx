import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <h2>Book Store</h2>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
        </nav>
    );
}

export default Navbar;