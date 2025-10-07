import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import EnumService from "../../services/enum";
import { toast } from "react-toastify";

// get the default backend api url from enum service
const { BOW_COURSE_APP_API_URL } = EnumService();

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: "",
    program: "SD",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${BOW_COURSE_APP_API_URL}/programs`);
      const data = await response.json();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BOW_COURSE_APP_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          birthday: formData.birthday,
          program: formData.program,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success(
        `Registration successful! Your Student ID is: ${data.studentId}`
      );
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 p-5">
      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-poppins text-[26px] text-gray-800 font-bold mb-2">
            Bow Course Registration
          </h1>
          <h2 className="font-poppins text-purple-500 text-[20px] font-medium">
            Student Sign Up
          </h2>
        </div>

        {error && (
          <div className="font-poppins bg-red-50 text-red-700 p-3 rounded-lg mb-5 border-l-4 border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="font-poppins grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Birthday
              </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Program *
            </label>
            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
            >
              {programs.map((prog) => (
                <option key={prog.code} value={prog.code}>
                  {prog.name} ({prog.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg text-base font-semibold hover:bg-purple-700"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
