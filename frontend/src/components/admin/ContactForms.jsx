import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import "./Admin.css";

const { BOW_COURSE_APP_API_URL } = EnumService();

const AdminContactForms = () => {
  const [forms, setForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchContactForms();
  }, []);

  const fetchContactForms = async () => {
    try {
      const data = await apiHelper.get(
        `${BOW_COURSE_APP_API_URL}/admin/contact-forms`,
        token
      );
      setForms(data);
    } catch (err) {
      console.error("Error fetching contact forms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setShowModal(true);
  };

  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.studentId.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="contact-forms-management">
        <div className="page-header">
          <h2>Submitted Forms</h2>
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
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((form) => (
                <tr key={form.id}>
                  <td>{form.userId}</td>
                  <td>{form.name}</td>
                  <td>{form.email}</td>
                  <td>{new Date(form.timestamp).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleViewForm(form)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedForm && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Contact Form Details</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-details">
                  <div className="detail-item">
                    <label>Student ID:</label>
                    <p>{selectedForm.userId}</p>
                  </div>
                  <div className="detail-item">
                    <label>Name:</label>
                    <p>{selectedForm.name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <p>{selectedForm.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <p>{new Date(selectedForm.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Message:</label>
                    <div className="message-box">{selectedForm.message}</div>
                  </div>
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

export default AdminContactForms;
