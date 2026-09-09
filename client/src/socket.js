import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';

// Create a singleton instance of the socket connection
export const socket = io(SOCKET_URL, {
  autoConnect: true,
});

export default socket;
