/**
 * @name: Bow Course Registration Fullstack Web Application
 * @course: Web Programming SODV2201 Assignment and Project Work 2025
 * @class: SODV2201
 * @author: Dondon Herrera, Victor Leung, Salman Aravai, Mark Castro, Nicole Ricare
 */

const { roleEnum } = require("../utils/enum");
const { generateToken } = require("./authHelper");

function prepareUserResponse(user) {
  const commonUserData = {
    id: user.userId,
    role: user.role,
    email: user.email,
  };

  if (commonUserData.role === roleEnum.STUDENT) {
    return {
      token: generateToken(user),
      user: {
        ...commonUserData,
        name: `${user.firstName} ${user.lastName}`,
        department: user.department,
        program: user.program,
      },
    };
  } else if (commonUserData.role === roleEnum.ADMIN) {
    return {
      token: generateToken(user),
      user: {
        ...commonUserData,
        name: user.name,
      },
    };
  }
}

module.exports = {
  prepareUserResponse,
};
