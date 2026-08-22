import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token') || localStorage.getItem('jalrakshak_token');

    socket = io(SOCKET_URL, {
      auth: {
        token: token ? `Bearer ${token}` : null,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to Jal Rakshak Live Gateway:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ Socket connection warning:', err.message);
    });
  }

  return socket;
};

export const updateSocketAuth = (token) => {
  if (socket) {
    socket.auth = { token: token ? `Bearer ${token}` : null };
    socket.disconnect().connect();
  }
};

export const subscribeToCitizenRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('subscribe:citizen', userId);
  }
};

export const subscribeToRescueRoom = (teamId) => {
  const s = getSocket();
  if (s && teamId) {
    s.emit('subscribe:rescue', teamId);
  }
};

export default getSocket;
