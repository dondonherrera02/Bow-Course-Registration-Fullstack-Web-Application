import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import EnumService from "../../services/enum";

const { BOW_COURSE_APP_API_URL } = EnumService();

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BOW_COURSE_APP_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    /**https://v2.tailwindcss.com/docs */
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 p-5">
      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-poppins text-[26px] text-gray-800 font-bold mb-2">
            Bow Course Registration
          </h1>
          <h2 className="font-poppins text-purple-500 text-[20px] font-medium">
            Login
          </h2>
        </div>

        {error && (
          <div className="font-poppins bg-red-50 text-red-700 p-3 rounded-lg mb-5 border-l-4 border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-poppins block mb-2 text-gray-700 font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className="font-poppins w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
            />
          </div>

          <div>
            <label className="font-poppins block mb-2 text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="font-poppins w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-poppins w-full py-3 bg-purple-600 text-white rounded-lg text-base font-semibold hover:bg-purple-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-5 text-center space-y-2 text-[14px]">
          <p className="font-poppins text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-poppins text-purple-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
          <p>
            <Link
              to="/"
              className="font-poppins text-purple-500 font-semibold hover:underline"
            >
              View Courses
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
