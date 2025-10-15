import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Student.css";

// Get the default backend API URL from the EnumService.
const { BOW_COURSE_APP_API_URL } = EnumService();

const StudentProfile = () => {
  const [studentData, setStudentData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const data = await apiHelper.get(
        `${BOW_COURSE_APP_API_URL}/students/profile`,
        token
      );

      setStudentData(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || "",
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      console.error("Error fetching student data:", err);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      await apiHelper.put(
        `${BOW_COURSE_APP_API_URL}/students/profile`,
        updateData,
        token
      );

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchStudentData();
    } catch (err) {
      toast.error(err.message || "Error updating profile");
    }
  };

  if (loading) {
    return (
      <Sidebar role="student">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  return (
    <Sidebar role="student">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">{studentData?.firstName?.[0]}</div>
          </div>
          <div className="profile-info">
            <h2>
              {studentData?.firstName} {studentData?.lastName}
            </h2>
            <p className="student-id">Student ID: {studentData?.id}</p>
          </div>
        </div>

        <div className="profile-sections">
          <section className="profile-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              {!isEditing && (
                <button
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>First Name</label>
                  <p>{studentData?.firstName}</p>
                </div>
                <div className="info-item">
                  <label>Last Name</label>
                  <p>{studentData?.lastName}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{studentData?.email}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{studentData?.phone || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Birthday</label>
                  <p>{studentData?.birthday || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Username</label>
                  <p>{studentData?.username}</p>
                </div>
              </div>
            )}
          </section>

          <section className="profile-section">
            <h3>Academic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Department</label>
                <p>{studentData?.department}</p>
              </div>
              <div className="info-item">
                <label>Program</label>
                <p>{studentData?.program}</p>
              </div>
              <div className="info-item">
                <label>Student ID</label>
                <p>{studentData?.id}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Sidebar>
  );
};

export default StudentProfile;
