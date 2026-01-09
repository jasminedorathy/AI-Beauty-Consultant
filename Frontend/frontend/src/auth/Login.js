import { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { login } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/beauty_consultant.jpg";

export default function Login() {
  const { setToken } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");   // ✅ FIX
  const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.access_token);
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* Left Image */}
      <div
        className="hidden md:block bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Right Form */}
      <div className="flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Login to continue
          </p>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password with Eye Toggle */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
            Login
          </button>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold">
              Register Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
