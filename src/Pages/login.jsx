import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin", // default role
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {



      const response = await axios.post(
        import.meta.env.VITE_API_URL_LOGIN,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const { token, user } = response.data;

      // ✅ Optional check (allow hierarchical role access)
      const allowedRoles = {
        admin: ["admin"],
        manager: ["manager", "admin"], // ✅ manager can access admin routes
        client: ["client"],
        serviceman: ["serviceman"],
      };

      if (!allowedRoles[user.role]?.includes(formData.role)) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      // ✅ Store auth data
      login(user, token);
      localStorage.setItem("email", user.email);

      // ✅ Set default headers for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // ✅ Redirect to role dashboard
      navigate(`/${user.role}-dashboard`);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please make sure the server is running.");
      } else if (err.response) {
        setError(err.response.data.message || "Invalid credentials. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user?.role) {
      navigate(`/${user.role}-dashboard`);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Login
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="client">Client</option>
            <option value="serviceman">Tracker</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
