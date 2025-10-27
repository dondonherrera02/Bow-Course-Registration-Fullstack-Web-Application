import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import "./Admin.css";

const { BOW_COURSE_APP_API_URL } = EnumService();

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiHelper.get(
        `${BOW_COURSE_APP_API_URL}/admin/students`,
        token
      );
      setStudents(response);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Sidebar role="admin">
        <p>Loading...</p>
      </Sidebar>
    );
  }

  return (
    <Sidebar role="admin">
      <div className="students-management">
        <div className="page-header">
          <h2>Registered Students</h2>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Program</th>
                <th>Registered Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>
                    {student.firstName} {student.lastName}
                  </td>
                  <td>{student.email}</td>
                  <td>{student.program}</td>
                  <td>{student.registeredCourses?.length || 0}</td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleViewStudent(student)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedStudent && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Student Details</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="student-details">
                  <section className="details-section">
                    <h4>Personal Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Student ID:</label>
                        <p>{selectedStudent.id}</p>
                      </div>
                      <div className="detail-item">
                        <label>Name:</label>
                        <p>
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </p>
                      </div>
                      <div className="detail-item">
                        <label>Email:</label>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div className="detail-item">
                        <label>Phone:</label>
                        <p>{selectedStudent.phone || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Birthday:</label>
                        <p>{selectedStudent.birthday || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Username:</label>
                        <p>{selectedStudent.username}</p>
                      </div>
                    </div>
                  </section>

                  <section className="details-section">
                    <h4>Academic Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Department:</label>
                        <p>{selectedStudent.department}</p>
                      </div>
                      <div className="detail-item">
                        <label>Program:</label>
                        <p>{selectedStudent.programName}</p>
                      </div>
                    </div>
                  </section>

                  <section className="details-section">
                    <h4>Registered Courses</h4>
                    {selectedStudent.registeredCourses?.length > 0 ? (
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Term</th>
                            <th>Date Registered</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.registeredCourses.map(
                            (course, index) => (
                              <tr key={index}>
                                <td>{course.courseCode}</td>
                                <td>{course.courseName}</td>
                                <td>{course.term}</td>
                                <td>
                                  {new Date(
                                    course.registrationDate
                                  ).toLocaleDateString()}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-data">No courses registered</p>
                    )}
                  </section>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default AdminStudents;
