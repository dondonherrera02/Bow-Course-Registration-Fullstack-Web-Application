import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import "./Admin.css";

// Get the default backend API URL from the EnumService.
const { BOW_COURSE_APP_API_URL } = EnumService();

const AdminDashboard = () => {
  // Store summary statistics for students, courses, and contact forms.
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalContactForms: 0,
  });

  // Store the most recent contact form messages (for display in the dashboard).
  const [recentForms, setRecentForms] = useState([]);

  // Used to show a loading message while fetching data from the API.
  const [loading, setLoading] = useState(true);

  // Retrieve the saved authentication token (used for authorized API calls).
  const token = localStorage.getItem("token");

  // useEffect runs once when the component mounts.
  // It calls the function to fetch data for the dashboard.
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetches data for the dashboard (stats + recent contact forms).
  const fetchDashboardData = async () => {
    try {
      // Make two API calls at the same time using Promise.all for better performance.
      const [dataStat, dataForms] = await Promise.all([
        apiHelper.get(`${BOW_COURSE_APP_API_URL}/admin/dashboard-stats`, token),
        apiHelper.get(`${BOW_COURSE_APP_API_URL}/admin/contact-forms`, token),
      ]);

      // Update the state with fetched statistics data.
      setStats({
        totalStudents: dataStat.totalStudents,
        totalCourses: dataStat.totalCourses,
        totalContactForms: dataStat.totalContactForms,
      });

      // Only show the 5 most recent contact form messages on the dashboard.
      setRecentForms(dataForms.slice(0, 5));
    } catch (err) {
      // Log any errors that occur during the API call.
      console.error("Error fetching dashboard data:", err);
    } finally {
      // Stop the loading spinner once data fetching is complete (success or fail).
      setLoading(false);
    }
  };

  // Show a loading message while waiting for data.
  if (loading) {
    return (
      <Sidebar role="admin">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  // Render the admin dashboard once data has been loaded.
  return (
    <Sidebar role="admin">
      <div className="font-poppins dashboard">
        {/* === System Overview Section === */}
        <section className="system-overview">
          <h2>Dashboard Overview</h2>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Students</h3>
              <p className="stat-value">{stats.totalStudents}</p>
            </div>
            <div className="stat-card">
              <h3>Courses</h3>
              <p className="stat-value">{stats.totalCourses}</p>
            </div>
            <div className="stat-card">
              <h3>Contact Forms</h3>
              <p className="stat-value">{stats.totalContactForms}</p>
            </div>
          </div>
        </section>

        {/* === Recent Messages Section === */}
        <section className="recent-messages">
          <div className="section-header">
            <h2>Recent Messages</h2>

            {/* Display 'View All' link only if there are messages available */}
            {recentForms.length > 0 && (
              <a href="/admin/contact-forms" className="view-all-link">
                View All
              </a>
            )}
          </div>

          {/* Show fallback message if there are no recent forms */}
          {recentForms.length === 0 ? (
            <p className="no-data">No messages yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loop through each contact form and display basic info */}
                  {recentForms.map((form) => (
                    <tr key={form.id}>
                      <td>{form.name}</td>
                      <td>{form.email}</td>

                      {/* Show only first 50 characters of message for preview */}
                      <td className="message-preview">
                        {form.message.substring(0, 50)}
                        {form.message.length > 50 ? "..." : ""}
                      </td>

                      {/* Format the timestamp into a readable date */}
                      <td>{new Date(form.timestamp).toLocaleDateString()}</td>
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

export default AdminDashboard;
