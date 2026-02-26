import { db } from "@/lib/db";


/**
 * Get user by phone number
 * @param {string} phoneNumber - User phone number
 * @returns {Promise<User|null>}
 */
export async function getUserByPhone(phoneNumber) {
  if (!phoneNumber) return null;

  try {
    const user = await db.user.findUnique({
      where: { phoneNumber: phoneNumber.trim() },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by phone:", error);
    return null;
  }
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<User|null>}
 */
export async function getUserById(id) {
  if (!id) return null;

  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

/**
 * Check if user exists by email    
 * @param {string} email - User email
 * @returns {Promise<User|null>}
 */
export async function getUserByEmail(email) {
  if (!email) return null;

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}



/**
 * Check if user exists by email
 * @param {string} email - User email
 * @returns {Promise<boolean>}
 */
export async function userExistsByEmail(email) {
  if (!email) return false;

  try {
    const count = await db.user.count({
      where: { email: email.toLowerCase().trim() },
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking user by email:", error);
    return false;
  }
}

/**
 * Check if user exists by phone
 * @param {string} phoneNumber - User phone number
 * @returns {Promise<boolean>}
 */
export async function userExistsByPhone(phoneNumber) {
  if (!phoneNumber) return false;

  try {
    const count = await db.user.count({
      where: { phoneNumber: phoneNumber.trim() },
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking user by phone:", error);
    return false;
  }
}

/**
 * Update user's last login
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address (optional)
 * @returns {Promise<void>}
 */
export async function updateLastLogin(userId, ipAddress = null) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        ...(ipAddress && { lastLoginIp: ipAddress }),
      },
    });
  } catch (error) {
    console.error("Error updating last login:", error);
  }
}

/**
 * Verify user's phone number
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function verifyUserPhone(userId) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        phoneVerified: new Date(),
        phoneOtp: null,
        phoneOtpExpires: null,
      },
    });
  } catch (error) {
    console.error("Error verifying phone:", error);
  }
}

/**
 * Block/Unblock user
 * @param {string} userId - User ID
 * @param {boolean} blocked - Block status
 * @returns {Promise<User|null>}
 */
export async function setUserBlockStatus(userId, blocked = true) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { isBlocked: blocked },
    });
    return user;
  } catch (error) {
    console.error("Error updating user block status:", error);
    return null;
  }
}

/**
 * Activate/Deactivate user
 * @param {string} userId - User ID
 * @param {boolean} active - Active status
 * @returns {Promise<User|null>}
 */
export async function setUserActiveStatus(userId, active = true) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { isActive: active },
    });
    return user;
  } catch (error) {
    console.error("Error updating user active status:", error);
    return null;
  }
}
