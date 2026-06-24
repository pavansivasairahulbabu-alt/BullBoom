/**
 * Socket.IO client singleton.
 * Import `socketService` and call `connect(token)` once after login.
 * Then use `on / off` to listen for events anywhere in the app.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', this.socket.id);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) this.socket.off(event, callback);
  }

  emit(event, data) {
    if (this.socket) this.socket.emit(event, data);
  }

  isConnected() {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
export default socketService;
