import { api } from "./utils/api.js";

export const store = {
  state: {
    userId: null,
    currentUser: null,
  },

  init() {
    api.initMockData();
    const session = api.getSession();
    this.state.userId = session.currentUserId || null;
    this.state.currentUser = api.getUserById(this.state.userId);
    return this.state;
  },

  register(payload) {
    const user = api.register(payload);
    return user;
  },

  login(payload) {
    const user = api.login(payload);
    this.state.userId = user.id;
    this.state.currentUser = user;
    return user;
  },

  logout() {
    api.logout();
    this.state.userId = null;
    this.state.currentUser = null;
  },

  refreshCurrentUser() {
    const user = api.getCurrentUser();
    this.state.userId = user ? user.id : null;
    this.state.currentUser = user;
    return user;
  },

  updateProfile(patch) {
    const updated = api.updateCurrentUserProfile(patch);
    this.state.userId = updated.id;
    this.state.currentUser = updated;
    return updated;
  },
};
