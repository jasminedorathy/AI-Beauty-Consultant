import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signup } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/beauty_consultant.jpg";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await signup({
        email: email,
        password: password,
      });

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Signup failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* Left Image Section */}
      <div
        className="hidden md:block bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Right Form Section */}
      <div className="flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSignup}
          className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-center mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Sign up to get started
          </p>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <div className="relative mb-4">
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

          {/* Confirm Password */}
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded"
            required
          />

          {/* Submit */}
          <button className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
            Sign Up
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
