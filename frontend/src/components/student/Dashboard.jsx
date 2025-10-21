import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import "./Student.css";

// Get the backend API base URL from EnumService.
const { BOW_COURSE_APP_API_URL } = EnumService();

const StudentDashboard = () => {
  // State to store the student's registered course data.
  const [studentData, setStudentData] = useState(null);

  // State to track if the page is still loading data.
  const [loading, setLoading] = useState(true);

  // Get user info and token from local storage.
  // These are saved when the user logs in.
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // This effect runs when the component loads.
  // It calls the API to fetch student course data.
  useEffect(() => {
    fetchStudentData();
  }, []); //  [] ensures this runs only once when the component mounts.

  // Function to get registered courses for the logged-in student.
  const fetchStudentData = async () => {
    try {
      // Make a GET request to the backend using the helper function.
      const response = await apiHelper.get(
        `${BOW_COURSE_APP_API_URL}/students/registered-courses`,
        token
      );

      // Save the data from the response to state.
      setStudentData(response);
    } catch (err) {
      // Log any errors for debugging.
      console.error("Error fetching student data:", err);
    } finally {
      // Stop showing the loading message after API call completes (success or fail).
      setLoading(false);
    }
  };

  // Show a loading state while waiting for data.
  if (loading) {
    return (
      <Sidebar role="student">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  // Fallback: If no data is returned, use an empty array.
  const registeredCourses = studentData || [];

  // Get the current term based on the first registered course.
  // If no course exists, show "N/A".
  const currentTerm =
    registeredCourses.length > 0 ? registeredCourses[0].term : "N/A";

  return (
    <Sidebar role="student">
      <div className="space-y-8">
        {/* ======= QUICK STATUS SECTION ======= */}
        <section>
          <h2 className="text-gray-800 text-2xl font-bold mb-6">
            Quick Status
          </h2>

          {/* Display some quick student information cards */}
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

        {/* ======= CURRENT COURSES SECTION ======= */}
        <section>
          <h2 className="text-gray-800 text-2xl font-bold mb-6">
            Current Courses
          </h2>

          {/* If no registered courses, show a message. Otherwise, show the table. */}
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
                        {/* Convert the date into a readable format */}
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
