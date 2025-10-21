import { useState } from "react";
import Sidebar from "../common/Sidebar";
import EnumService from "../../services/enum";
import { apiHelper } from "../../services/apiHelper";
import { toast } from "react-toastify";
import "./Student.css";

// Get the API base URL from EnumService
const { BOW_COURSE_APP_API_URL } = EnumService();

const StudentContact = () => {
  // ==========================
  // STATE VARIABLES
  // ==========================
  const [message, setMessage] = useState(""); // Holds the message the student types in
  const [loading, setLoading] = useState(false); // Controls the "Sending..." state of the button

  // Retrieve token for authentication (stored during login)
  const token = localStorage.getItem("token");

  // ==========================
  // HANDLE FORM SUBMISSION
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload on form submit
    setLoading(true); // Show loading state while sending message

    try {
      // Send the message to backend API
      await apiHelper.post(
        `${BOW_COURSE_APP_API_URL}/students/contact`,
        { message },
        token
      );

      // If successful, show a success message
      toast.success("Message sent successfully!");
      setMessage(""); // Clear input after sending
    } catch (err) {
      // Handle any error during API request
      const errorMessage = err.message || "Error sending message";
      toast.error(errorMessage);
    } finally {
      // Remove loading state whether success or error
      setLoading(false);
    }
  };

  // ==========================
  // UI RENDERING
  // ==========================
  return (
    // Sidebar layout for student users
    <Sidebar role="student">
      <div className="contact-container">
        <h2>Contact Form</h2>

        {/* Description text below the title */}
        <p className="contact-description">
          Have a question or need assistance? Send us a message and we'll get
          back to you as soon as possible.
        </p>

        {/* Message form */}
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label>Your Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)} // Update message as the user types
              required
              rows="8"
              placeholder="Type your message here..."
            />
          </div>

          {/* Submit button — changes text while loading */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </Sidebar>
  );
};

export default StudentContact;
