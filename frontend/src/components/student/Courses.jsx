import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import { toast } from "react-toastify";
import "./Student.css";

// Get the API base URL from EnumService
const { BOW_COURSE_APP_API_URL } = EnumService();

const StudentCourses = () => {
  // ==========================
  // STATE VARIABLES
  // ==========================
  const [courses, setCourses] = useState([]); // List of all available courses
  const [studentData, setStudentData] = useState(null); // Logged-in student's data (profile, registered courses, etc.)
  const [searchQuery, setSearchQuery] = useState(""); // User's search input for filtering courses
  const [selectedTerm, setSelectedTerm] = useState("All"); // Selected academic term (Fall, Winter, etc.)
  const [selectedCourse, setSelectedCourse] = useState(null); // Currently selected course for viewing/registering
  const [showModal, setShowModal] = useState(false); // Whether to show or hide the course details modal
  const [message, setMessage] = useState(""); // Message displayed for errors or updates
  const [loading, setLoading] = useState(true); // Loading indicator while data is being fetched

  // Retrieve authentication token from local storage (used for API requests)
  const token = localStorage.getItem("token");

  // ==========================
  // INITIAL DATA FETCH
  // ==========================
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch student data and available courses from the backend
  const fetchData = async () => {
    try {
      // Run both API calls at the same time to improve performance
      const [coursesData, studentDataRes] = await Promise.all([
        apiHelper.get(`${BOW_COURSE_APP_API_URL}/courses`),
        apiHelper.get(`${BOW_COURSE_APP_API_URL}/students/profile`, token),
      ]);

      // Update state with data
      setCourses(coursesData);
      setStudentData(studentDataRes);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // COURSE FILTERING LOGIC
  // ==========================
  const filteredCourses = courses.filter(
    (course) =>
      // Filter by course code or name
      (course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      // Filter by selected term (or show all if 'All' is selected)
      (selectedTerm === "All" ||
        course.term?.toLowerCase() === selectedTerm.toLowerCase()) &&
      // Only show courses that belong to the student's program
      course.programCode === studentData?.program
  );

  // ==========================
  // CHECK IF STUDENT IS REGISTERED FOR A COURSE
  // ==========================
  const isRegistered = (courseCode, courseTerm) => {
    if (selectedTerm === "All") {
      return studentData?.registeredCourses?.some(
        (c) => c.courseCode === courseCode && c.term === courseTerm
      );
    }
    return studentData?.registeredCourses?.some(
      (c) => c.courseCode === courseCode && c.term === selectedTerm
    );
  };

  // ==========================
  // COURSE ACTION HANDLERS
  // ==========================

  // When "View" button is clicked, show the modal with course details
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  // Register a student for the selected course
  const handleRegisterCourse = async () => {
    if (!selectedCourse) return;

    setMessage("");

    try {
      await apiHelper.post(
        `${BOW_COURSE_APP_API_URL}/students/register-course`,
        {
          courseCode: selectedCourse.code,
          term: selectedCourse.term,
        },
        token
      );

      toast.success("Course registered successfully!");
      fetchData(); // Refresh course and student data
      setShowModal(false);
    } catch (err) {
      const errorMessage = err.message || "Error registering course";
      toast.error(errorMessage);
      setMessage(errorMessage);
    }
  };

  // Unregister a student from a course
  const handleRemoveCourse = async (course) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to remove this course?")) {
      return;
    }

    setMessage("");

    try {
      await apiHelper.put(
        `${BOW_COURSE_APP_API_URL}/students/unregister-course`,
        {
          courseCode: course.code,
          term: course.term,
        },
        token
      );

      toast.success("Course removed successfully!");
      fetchData(); // Refresh data after removing
    } catch (err) {
      const errorMessage = err.message || "Error removing course";
      toast.error(errorMessage);
      setMessage(errorMessage);
    }
  };

  // Get the list of registered courses in the selected term
  const registeredCoursesInTerm =
    selectedTerm === "All"
      ? studentData?.registeredCourses || []
      : studentData?.registeredCourses?.filter(
          (c) => c.term === selectedTerm
        ) || [];

  // ==========================
  // LOADING STATE
  // ==========================
  if (loading) {
    return (
      <Sidebar role="student">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  // ==========================
  // MAIN RENDER
  // ==========================
  return (
    <Sidebar role="student">
      <div className="courses-container">
        {/* ===== HEADER SECTION ===== */}
        <div className="courses-header">
          <h2>Course Registration</h2>

          {/* Dropdown for selecting term */}
          <div className="term-selector">
            <label>Select Term:</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="All">All Terms</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
            </select>
          </div>
        </div>

        {/* Display error or status messages */}
        {message && <div className="message">{message}</div>}

        {/* Show how many courses the student has registered */}
        <div className="registration-info">
          <p>
            Registered Courses: {registeredCoursesInTerm.length}/5 (minimum 2,
            maximum 5)
          </p>
        </div>

        {/* ===== SEARCH BAR ===== */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ===== COURSES TABLE ===== */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Term</th>
                <th>Start</th>
                <th>Capacity</th>
                <th>Enrolled</th>
                <th>Available Slots</th>
                <th>Program</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* If no courses found, show message */}
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No courses found or registration not open yet
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const registered = isRegistered(course.code, course.term);
                  const isFull = course.enrolled >= course.capacity;

                  return (
                    <tr key={course.code}>
                      <td>{course.code}</td>
                      <td>{course.name}</td>
                      <td>{course.term}</td>
                      <td>{course.startDate}</td>
                      <td>{course.capacity}</td>
                      <td>{course.enrolled}</td>
                      <td>{course.remainingSlots}</td>
                      <td>{course.programCode}</td>
                      <td>
                        {registered ? (
                          <span className="status-registered">Registered</span>
                        ) : isFull ? (
                          <span className="status-full">Full</span>
                        ) : (
                          <span className="status-open">Open</span>
                        )}
                      </td>
                      <td>
                        {/* Show "Remove" button if registered, otherwise "View" button */}
                        {registered ? (
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleRemoveCourse(course)}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleViewCourse(course)}
                            disabled={isFull}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===== COURSE DETAILS MODAL ===== */}
        {showModal && selectedCourse && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Course Details</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Modal body showing full course info */}
              <div className="modal-body">
                <div className="course-details">
                  <div className="detail-item">
                    <label>Course Code:</label>
                    <p>{selectedCourse.code}</p>
                  </div>
                  <div className="detail-item">
                    <label>Course Name:</label>
                    <p>{selectedCourse.name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Term:</label>
                    <p>{selectedCourse.term}</p>
                  </div>
                  <div className="detail-item">
                    <label>Start Date:</label>
                    <p>{selectedCourse.startDate}</p>
                  </div>
                  <div className="detail-item">
                    <label>End Date:</label>
                    <p>{selectedCourse.endDate}</p>
                  </div>
                  <div className="detail-item">
                    <label>Available Slots:</label>
                    <p>
                      {selectedCourse.capacity - selectedCourse.enrolled} /{" "}
                      {selectedCourse.capacity}
                    </p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Description:</label>
                    <p>{selectedCourse.description}</p>
                  </div>
                </div>
              </div>

              {/* Modal footer with action buttons */}
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleRegisterCourse}>
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default StudentCourses;
