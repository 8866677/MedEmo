import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      // Socket event handlers
      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        
        // Join user-specific rooms
        newSocket.emit('join-user', { userId: user._id, userType: user.userType });
        
        // Join emergency room if user has active emergency
        if (user.activeEmergency) {
          newSocket.emit('join-emergency', user.activeEmergency);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
      });

      newSocket.on('error', (error) => {
        console.error('🔌 Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  // Reconnect logic
  useEffect(() => {
    if (socket) {
      socket.on('disconnect', () => {
        console.log('🔌 Attempting to reconnect...');
        setTimeout(() => {
          socket.connect();
        }, 1000);
      });
    }
  }, [socket]);

  const value = {
    socket,
    isConnected: socket?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
