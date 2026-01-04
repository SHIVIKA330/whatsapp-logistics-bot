// Simple in-memory state management
// For production, use Redis or a Database (MongoDB/PostgreSQL)

const userState = {};

module.exports = {
    // Get current step for a user
    getState: (userId) => {
        return userState[userId] || null;
    },

    // Set state for a user
    setState: (userId, state) => {
        userState[userId] = state;
    },

    // Clear state
    clearState: (userId) => {
        delete userState[userId];
    }
};
