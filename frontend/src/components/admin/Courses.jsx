import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";

// Get the default backend API URL from the EnumService.
const { BOW_COURSE_APP_API_URL } = EnumService();

const AdminCourses = () => {
  // Local component states
  const [courses, setCourses] = useState([]); // Stores all courses fetched from API
  const [searchQuery, setSearchQuery] = useState(""); // Search input state
  const [showModal, setShowModal] = useState(false); // Handles visibility of Add/Edit modal
  const [editingCourse, setEditingCourse] = useState(null); // Tracks which course is being edited (if any)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    term: "",
    startDate: "",
    endDate: "",
    description: "",
    capacity: 0,
    programCode: "",
  });
  const [loading, setLoading] = useState(true); // Controls loading state for fetch
  const token = localStorage.getItem("token"); // Authentication token for API calls

  // Fetch course data on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Retrieve all courses from API
  const fetchCourses = async () => {
    try {
      const data = await apiHelper.get(
        `${BOW_COURSE_APP_API_URL}/courses`,
        token
      );
      setCourses(data);
    } catch (err) {
      toast.error("Error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  // Generic form field handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? Number(value) : value, // Convert capacity to number
    });
  };

  // Opens the modal in "add" mode and resets the form
  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      code: "",
      name: "",
      term: "Fall",
      startDate: "",
      endDate: "",
      description: "",
      capacity: "",
      programCode: "",
    });
    setShowModal(true);
  };

  // Opens the modal in "edit" mode and populates it with the selected course
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      term: course.term,
      startDate: course.startDate,
      endDate: course.endDate,
      description: course.description,
      capacity: course.capacity,
      programCode: course.programCode,
    });
    setShowModal(true);
  };

  // Handles submission for both adding and updating courses
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        // Update existing course
        await apiHelper.put(
          `${BOW_COURSE_APP_API_URL}/courses/${editingCourse.code}`,
          formData,
          token
        );
        toast.success("Course updated successfully!");
      } else {
        // Create new course
        await apiHelper.post(
          `${BOW_COURSE_APP_API_URL}/courses`,
          formData,
          token
        );
        toast.success("Course created successfully!");
      }
      fetchCourses(); // Refresh course list
      setShowModal(false); // Close modal
    } catch (err) {
      toast.error(err.message || "Error saving course");
    }
  };

  // Deletes a specific course after confirmation
  const handleDeleteCourse = async (courseCode) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await apiHelper.delete(
        `${BOW_COURSE_APP_API_URL}/courses/${courseCode}`,
        token
      );
      toast.success("Course deleted successfully!");
      fetchCourses();
    } catch (err) {
      toast.error(err.message || "Error deleting course");
    }
  };

  // Filters courses based on user search input
  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // Render loading indicator while fetching data
  if (loading) {
    return (
      <Sidebar role="admin">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  // Main component render
  return (
    <Sidebar role="admin">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="courses-management">
        {/* Page header and 'Add Course' button */}
        <div className="page-header">
          <h2>Courses Management</h2>
          <button className="btn-primary" onClick={handleAddCourse}>
            + Add Course
          </button>
        </div>

        {/* Search input field */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by course name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Data table showing all courses */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Term</th>
                <th>Start</th>
                <th>Capacity</th>
                <th>Program Code</th>
                <th>Enrolled</th>
                <th>Available Slots</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.code}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.term}</td>
                  <td>{course.startDate}</td>
                  <td>{course.capacity}</td>
                  <td>{course.programCode}</td>
                  <td>{course.enrolled}</td>
                  <td>{course.remainingSlots}</td>
                  <td>
                    {course.enrolled >= course.capacity ? (
                      <span className="status-full">Full</span>
                    ) : (
                      <span className="status-open">Open</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDeleteCourse(course.code)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conditional modal for Add/Edit course */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingCourse ? "Edit Course" : "Add New Course"}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Course form */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Course code field */}
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      disabled={editingCourse !== null}
                      placeholder="e.g., SODV1201"
                    />
                  </div>

                  {/* Course name field */}
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Web Programming"
                    />
                  </div>

                  {/* Term selection */}
                  <div className="form-group">
                    <label>Term *</label>
                    <select
                      name="term"
                      value={formData.term}
                      onChange={handleChange}
                      required
                    >
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                      <option value="Spring">Spring</option>
                    </select>
                  </div>

                  {/* Program selection */}
                  <div className="form-group">
                    <label>Program *</label>
                    <select
                      name="programCode"
                      value={formData.programCode}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a program</option>
                      <option value="SDD">
                        Software Development - Diploma (2 years)
                      </option>
                      <option value="SDPD">
                        Software Development - Post-Diploma (1 year)
                      </option>
                    </select>
                  </div>

                  {/* Start & End date fields */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Capacity input */}
                  <div className="form-group">
                    <label>Maximum Students *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>

                  {/* Optional description */}
                  <div className="form-group">
                    <label>Course Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Enter course description..."
                    />
                  </div>
                </div>

                {/* Modal action buttons */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCourse ? "Save Changes" : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default AdminCourses;
