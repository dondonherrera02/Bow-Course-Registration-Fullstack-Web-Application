/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const { readJSON } = require("../utils/fileOperations");
const { roleEnum } = require("../utils/enum");
const { generateToken } = require("./authHelper");

function findUserByField(filename, field, value) {
  const users = readJSON(filename);
  return users.find((u) => u[field] === value);
}

function prepareUserResponse(user, role) {
  const commonUserData = {
    id: user.id,
    role,
    email: user.email,
  };

  if (role === roleEnum.STUDENT) {
    return {
      token: generateToken({ ...user, role }),
      user: {
        ...commonUserData,
        name: `${user.firstName} ${user.lastName}`,
        department: user.department,
        program: user.program,
      },
    };
  } else if (role === roleEnum.ADMIN) {
    return {
      token: generateToken({ ...user, role }),
      user: {
        ...commonUserData,
        name: user.name,
      },
    };
  }
}

module.exports = {
  findUserByField,
  prepareUserResponse,
};
