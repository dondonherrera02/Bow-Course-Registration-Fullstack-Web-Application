import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import DashboardIcon from "../../assets/dashboard.svg";
import ProfileIcon from "../../assets/profile.svg";
import CoursesIcon from "../../assets/courses.svg";
import ContactIcon from "../../assets/contact.svg";
import StudentsIcon from "../../assets/students.svg";
import SignoutIcon from "../../assets/sign-out.svg";

const Sidebar = ({ role, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { path: "/student/dashboard", label: "Dashboard", icon: DashboardIcon },
    { path: "/student/profile", label: "Profile", icon: ProfileIcon },
    { path: "/student/courses", label: "Courses", icon: CoursesIcon },
    { path: "/student/contact", label: "Contact Forms", icon: ContactIcon },
  ];

  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
    { path: "/admin/profile", label: "Profile", icon: ProfileIcon },
    { path: "/admin/courses", label: "Courses", icon: CoursesIcon },
    { path: "/admin/students", label: "Students", icon: StudentsIcon },
    { path: "/admin/contact-forms", label: "Contact Forms", icon: ContactIcon },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="font-poppins flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-950 text-white flex flex-col fixed h-screen overflow-y-auto">
        <div className="p-5 bg-indigo-900 border-b border-r-gray-700">
          <h2 className="text-[17px] font-semibold">Bow Course Registration</h2>
        </div>

        <nav className="flex-1 py-5">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-5 py-3 transition-all border-l-4 ${
                isActive(link.path)
                  ? "bg-gray-600 border-purple-600 text-white"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-purple-600"
              }`}
            >
              <img
                src={link.icon}
                alt={link.label + " icon"}
                className="w-5 h-5 mr-3 inline-block"
                style={{ verticalAlign: "middle" }}
              />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-5 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-5 py-3 rounded-lg bg-transparent text-gray-300 hover:bg-red-600 hover:text-white transition-all"
          >
            <img
              src={SignoutIcon}
              alt="signout icon"
              className="w-5 h-5 mr-3 inline-block"
              style={{ verticalAlign: "middle" }}
            />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-gray-800 text-3xl font-bold">
            Welcome back, {user.name}!
          </h1>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-md">{children}</div>
      </main>
    </div>
  );
};

export default Sidebar;
