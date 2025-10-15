import React, { useState } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import { toast } from "react-toastify";
import "./Student.css";

const { BOW_COURSE_APP_API_URL } = EnumService();

const StudentContact = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiHelper.post(
        `${BOW_COURSE_APP_API_URL}/students/contact`,
        { message },
        token
      );

      toast.success("Message sent successfully!");
      setMessage("");
    } catch (err) {
      const errorMessage = err.message || "Error sending message";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar role="student">
      <div className="contact-container">
        <h2>Contact Form</h2>
        <p className="contact-description">
          Have a question or need assistance? Send us a message and we'll get
          back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label>Your Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="8"
              placeholder="Type your message here..."
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </Sidebar>
  );
};

export default StudentContact;

