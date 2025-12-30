import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Student.css";

// Get the backend API base URL from EnumService.
// This helps keep URLs consistent and easy to update.
const { BOW_COURSE_APP_API_URL } = EnumService();

const StudentProfile = () => {
  // Store the student's profile data retrieved from the backend.
  const [studentData, setStudentData] = useState(null);

  // Determines if the profile is currently being edited.
  const [isEditing, setIsEditing] = useState(false);

  // Holds editable form data (like name, email, password, etc.).
  const [formData, setFormData] = useState({});

  // Tracks whether the page is still fetching data.
  const [loading, setLoading] = useState(true);

  // Retrieve the authentication token saved during login.
  const token = localStorage.getItem("token");

  // useEffect is used to load the student profile when the component first renders.
  useEffect(() => {
    fetchStudentData();
  }, []); // [] to prevent infinite re-renders.

  /**
   * Fetches the student's profile information from the backend.
   * This function runs once when the component mounts.
   */
  const fetchStudentData = async () => {
    try {
      const data = await apiHelper.get(
        `${BOW_COURSE_APP_API_URL}/students/profile`,
        token
      );

      // Save the fetched data to state.
      setStudentData(data);

      // Update localStorage with the latest user data in the required format
      const userData = {
        id: data.userId,
        role: "student",
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        department: data.department,
        program: data.program
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Initialize form fields with the current profile info.
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
      // Stop showing the loading indicator once the API call is done.
      setLoading(false);
    }
  };

  /**
   * Updates the formData state whenever a user types into an input field.
   */
  const handleChange = (e) => {
    // Keep all existing values and update only the changed one.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Sends the updated profile data to the backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form reload behavior.

    try {
      // Create a copy of the current form data.
      const updateData = { ...formData };

      // Remove password fields if they're not being updated.
      if (!updateData.password) {
        delete updateData.password;
      }

      // Send the updated profile to the backend.
      const response = await apiHelper.put(
        `${BOW_COURSE_APP_API_URL}/students/profile`,
        updateData,
        token
      );

      // Update localStorage with the updated user data in the required format
      if (response && response.user) {
        const userData = {
          id: response.user.userId,
          role: "student",
          email: response.user.email,
          name: `${response.user.firstName} ${response.user.lastName}`,
          department: response.user.department,
          program: response.user.program
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      toast.success("Profile updated successfully!");

      // Exit edit mode after saving.
      setIsEditing(false);

      // Refresh the data to display updated info.
      fetchStudentData();
    } catch (err) {
      toast.error(err.message || "Error updating profile");
    }
  };

  // Display loading indicator while fetching data.
  if (loading) {
    return (
      <Sidebar role="student">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  // UI Rendering
  return (
    <Sidebar role="student">
      {/* Toast container handles success/error popup messages */}
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
        {/* ===== PROFILE HEADER SECTION ===== */}
        <div className="profile-header">
          {/* Avatar circle shows the first letter of the student’s first name */}
          <div className="profile-avatar">
            <div className="avatar-circle">{studentData?.firstName?.[0]}</div>
          </div>

          {/* Display student's name and ID */}
          <div className="profile-info">
            <h2>
              {studentData?.firstName} {studentData?.lastName}
            </h2>
            <p className="student-id">Student ID: {studentData?.userId}</p>
          </div>
        </div>

        {/* ===== PROFILE DETAILS SECTION ===== */}
        <div className="profile-sections">
          {/* === Personal Information === */}
          <section className="profile-section">
            <div className="section-header">
              <h3>Personal Information</h3>

              {/* Show "Edit Profile" button only if not editing */}
              {!isEditing && (
                <button
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* === Edit Mode Form === */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                {/* Name fields side by side */}
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

                {/* Contact information */}
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

                {/* Optional password change fields */}
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

                {/* Save and Cancel buttons */}
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
              // === Read-Only View Mode ===
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

          {/* === Academic Information Section === */}
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
                <p>{studentData?.userId}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Sidebar>
  );
};

export default StudentProfile;
