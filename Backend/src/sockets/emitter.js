/**
 * Centralized Socket.IO Emitter helper
 * Allows services, controllers, and cron jobs to emit events to user rooms
 * without circular dependencies or having to pass `io` everywhere.
 */

let io = null;

/**
 * Register global Socket.IO instance
 * @param {object} ioInstance
 */
function setSocketIO(ioInstance) {
  io = ioInstance;
}

/**
 * Get the registered Socket.IO instance
 * @returns {object|null}
 */
function getSocketIO() {
  return io;
}

/**
 * Emit an event to a user's private room across all their active sockets/tabs
 * @param {string|object} userId
 * @param {string} event
 * @param {object} payload
 * @returns {boolean}
 */
function emitToUser(userId, event, payload) {
  if (!io) {
    console.warn(`[SocketEmitter] Cannot emit "${event}": Socket.IO not initialized.`);
    return false;
  }

  const roomName = `user:${userId.toString()}`;
  io.to(roomName).emit(event, payload);
  return true;
}

/**
 * Emit an event to all connected sockets
 * @param {string} event
 * @param {object} payload
 */
function emitBroadcast(event, payload) {
  if (!io) return false;
  io.emit(event, payload);
  return true;
}

module.exports = {
  setSocketIO,
  getSocketIO,
  emitToUser,
  emitBroadcast,
};

