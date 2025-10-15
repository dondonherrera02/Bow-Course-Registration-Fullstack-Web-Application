import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import "./Student.css";

// Get the default backend API URL from the EnumService.
const { BOW_COURSE_APP_API_URL } = EnumService();

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const response = await apiHelper.get(
        `${BOW_COURSE_APP_API_URL}/students/registered-courses`,
        token
      );

      setStudentData(response);
    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Sidebar role="student">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  const registeredCourses = studentData || [];
  const currentTerm =
    registeredCourses.length > 0 ? registeredCourses[0].term : "N/A";

  return (
    <Sidebar role="student">
      <div className="space-y-8">
        <section>
          <h2 className="text-gray-800 text-2xl font-bold mb-6">
            Quick Status
          </h2>
          <div className="status-cards">
            <div className="status-card">
              <h3>Total Courses</h3>
              <p className="status-value">{registeredCourses.length}</p>
            </div>
            <div className="status-card">
              <h3>Current Term</h3>
              <p className="status-value">{currentTerm}</p>
            </div>
            <div className="status-card">
              <h3>Program</h3>
              <p className="status-value">{user.program}</p>
            </div>
            <div className="status-card">
              <h3>Department</h3>
              <p className="status-value">{user.department}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-gray-800 text-2xl font-bold mb-6">
            Current Courses
          </h2>
          {registeredCourses.length === 0 ? (
            <p className="text-center text-gray-500 py-10 italic">
              No courses registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-gray-800 font-semibold">
                      Course Code
                    </th>
                    <th className="px-4 py-4 text-left text-gray-800 font-semibold">
                      Course Name
                    </th>
                    <th className="px-4 py-4 text-left text-gray-800 font-semibold">
                      Term
                    </th>
                    <th className="px-4 py-4 text-left text-gray-800 font-semibold">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registeredCourses.map((course, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-gray-700">
                        {course.courseCode}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {course.courseName}
                      </td>
                      <td className="px-4 py-4 text-gray-700">{course.term}</td>
                      <td className="px-4 py-4 text-gray-700">
                        {new Date(course.registrationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Sidebar>
  );
};

export default StudentDashboard;
