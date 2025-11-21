/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const roleEnum = Object.freeze({
  STUDENT: "student",
  ADMIN: "admin",

  isValidRole(role) {
    return Object.values(roleEnum).includes(role);
  },
});


const collectionEnum = Object.freeze({
  STUDENTS: "students",
  ADMINS: "admins",
  COURSES: "courses",
  CONTACTFORMS: "contact-forms",
  PROGRAMS: "programs",
  CONTACTFORMS: "contact-forms"
});

module.exports = {
  roleEnum,
  collectionEnum,
};
