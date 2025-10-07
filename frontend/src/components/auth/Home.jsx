import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import EnumService from "../../services/enum";
import "./Home.css";

// get the default backend api url from enum service
const { BOW_COURSE_APP_API_URL } = EnumService();

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch course and program data from the backend API when the home page loads
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, programsRes] = await Promise.all([
        fetch(`${BOW_COURSE_APP_API_URL}/courses`),
        fetch(`${BOW_COURSE_APP_API_URL}/programs`),
      ]);

      const coursesData = await coursesRes.json();
      const programsData = await programsRes.json();

      setCourses(coursesData);
      setPrograms(programsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins landing-page">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img
              src="/logo.png"
              alt="Bow Valley College"
              className="logo-img"
            />
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-text">
              <p className="hero-subtitle">Come Curious. Leave Inspired.</p>
              <h1 className="hero-title">Bow Course Registration.</h1>
              <p className="hero-description">
                Discover our comprehensive programs and register for course that
                will advance your career in technology.
              </p>
              <Link to="/register" className="cta-button">
                Register Now!
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Programs Section */}
      <section className="programs-section">
        <div className="container">
          <h2 className="section-title">Our Programs</h2>
          <div className="programs-grid">
            {loading ? (
              <p className="loading-text">Loading programs...</p>
            ) : programs.length === 0 ? (
              <p className="loading-text">
                {" "}
                No programs available at the moment.
              </p>
            ) : (
              programs.slice(0, 3).map((program) => (
                <div key={program.code} className="program-card">
                  <h3 className="program-title">{program.name}</h3>
                  <p className="program-code">Code: {program.code}</p>
                  <p className="program-term">Term: {program.term}</p>
                  <p className="program-fees">
                    Domestic: $ {program.fees[0].toLocaleString()}
                  </p>
                  <p className="program-fees">
                    International: $ {program.fees[1].toLocaleString()}
                  </p>

                  <p className="program-description">{program.description}</p>
                  <div className="program-dates">
                    <span className="start-date">
                      Start Date: {program.startDate}
                    </span>
                    <span className="end-date">
                      End Date: {program.endDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Available Courses Section */}
      <section className="courses-section">
        <div className="container">
          <h2 className="section-title">Available Courses</h2>
          <div className="courses-grid">
            {loading ? (
              <p className="loading-text">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="loading-text">
                No courses available at the moment.
              </p>
            ) : (
              courses.map((course) => (
                <div key={course.code} className="course-card">
                  <h3 className="course-title">{course.name}</h3>
                  <p className="program-code">Code: {course.code}</p>
                  <p className="course-code">
                    Program Code: {course.programCode}
                  </p>
                  <p className="course-term">Term: {course.term}</p>
                  <p className="course-description">{course.description}</p>
                  <div className="course-dates">
                    <span className="start-date">
                      Start: {course.startDate}
                    </span>
                    <span className="end-date">End: {course.endDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner">
        <div className="container">
          <h2 className="cta-title">Ready to Register?</h2>
          <p className="cta-description">
            Step into your future with Bow Valley College! Explore courses, plan
            your path, and connect with a community ready to help you succeed.
          </p>
          <Link to="/register" className="cta-button-white">
            Register Now!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3 className="footer-title">Bow Course Registration</h3>
              <p className="footer-description">
                Your courses, your schedule, your success.
              </p>
            </div>
            <div className="footer-column">
              <h3 className="footer-title">Quick Links</h3>
              <div className="footer-links">
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
                <Link to="/faq" className="footer-link">
                  FAQ (Frequently Asked Questions)
                </Link>
                <Link to="/help" className="footer-link">
                  Help Center
                </Link>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="footer-title">Follow Us</h3>
              <div className="social-links">
                <a href="#" class="social-link">
                  <FaFacebook />
                </a>
                <a href="#" class="social-link">
                  <FaTwitter />
                </a>
                <a href="#" class="social-link">
                  <FaInstagram />
                </a>
                <a href="#" class="social-link">
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
