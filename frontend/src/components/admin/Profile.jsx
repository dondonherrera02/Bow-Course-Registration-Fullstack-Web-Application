import Sidebar from "../common/Sidebar";
import "./Admin.css";

const AdminProfile = () => {
  // Retrieve user information from localStorage
  // If there's no stored user, it defaults to an empty object
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    // The Sidebar component wraps the page layout
    // and changes appearance based on user role (admin in this case)
    <Sidebar role="admin">
      <div className="profile-container">
        {/* ===== PROFILE HEADER ===== */}
        <div className="profile-header">
          {/* Avatar section - shows first letter of admin's name */}
          <div className="profile-avatar">
            <div className="avatar-circle">{user.name?.[0]}</div>
          </div>

          {/* Admin’s name and role */}
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p className="admin-role">Administrator</p>
          </div>
        </div>

        {/* ===== ACCOUNT INFORMATION SECTION ===== */}
        <div className="profile-sections">
          <section className="profile-section">
            <h3>Account Information</h3>

            {/* Display key account details in a grid layout */}
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>{user.name}</p>
              </div>

              <div className="info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>

              <div className="info-item">
                <label>Admin ID</label>
                <p>{user.id}</p>
              </div>

              <div className="info-item">
                <label>Role</label>
                <p>Administrator</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Sidebar>
  );
};

export default AdminProfile;
