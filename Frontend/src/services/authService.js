import axiosClient from "../utils/axios";

export const authService = {
  /**
   * Log in user or admin
   */
  async login(credentials) {
    const response = await axiosClient.post("/user/login", {
      emailId: credentials.emailId.trim(),
      password: credentials.password,
    });
    return response.data.user;
  },

  /**
   * Register a new user
   */
  async signup(userData) {
    const response = await axiosClient.post("/user/register", {
      firstName: userData.firstName.trim(),
      emailId: userData.emailId.trim(),
      password: userData.password,
    });
    return response.data.user;
  },

  /**
   * Register a new admin (with optional invite/admin token)
   */
  async adminSignup(userData) {
    // If backend uses /user/admin/register or requires invite code header
    const headers = userData.adminInviteCode
      ? { "x-admin-invite": userData.adminInviteCode }
      : {};

    const response = await axiosClient.post(
      "/user/admin/register",
      {
        firstName: userData.firstName.trim(),
        emailId: userData.emailId.trim(),
        password: userData.password,
      },
      { headers }
    );
    return response.data.user || response.data;
  },

  /**
   * Get current authenticated user session from cookie
   */
  async getCurrentUser() {
    const response = await axiosClient.get("/user/check");
    return response.data.user;
  },

  /**
   * Log out user and expire cookie
   */
  async logout() {
    const response = await axiosClient.post("/user/logout");
    return response.data;
  },

  /**
   * Helper to extract human-readable error from axios response
   */
  getErrorMessage(error) {
    if (!error) return "An unexpected error occurred.";
    if (typeof error === "string") return error;
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === "string") return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map((e) => e.msg || e.message || e).join(", ");
      }
    }
    return error.message || "Failed to communicate with authentication server.";
  },
};

export default authService;

