function EnumService() {
  // Local
  const BOW_COURSE_APP_API_URL = "http://localhost:8080/api";

  // Dev Environment - Render
  // const BOW_COURSE_APP_API_URL =
  //   "https://bow-course-registration.onrender.com/api";

  return {
    BOW_COURSE_APP_API_URL,
  };
}

export default EnumService;
