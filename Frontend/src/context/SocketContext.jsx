import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  reconnectEvent: 0,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context?.socket || null;
};

export const useSocketStatus = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectEvent, setReconnectEvent] = useState(0);

  const { isAuthentication, user } = useSelector((state) => state.auth || state.slicers || {});
  const hasConnectedOnce = useRef(false);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!isAuthentication && !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      hasConnectedOnce.current = false;
      return;
    }

    let socketUrl = "http://localhost:1200";
    if (import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL) {
      try {
        socketUrl = new URL(import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL).origin;
      } catch (err) {
        socketUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL;
      }
    }

    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      if (hasConnectedOnce.current) {
        // Reconnected after drop: trigger refetch for subscribed components
        setReconnectEvent((prev) => prev + 1);
      }
      hasConnectedOnce.current = true;
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.warn("[Socket.IO] Connection error:", error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthentication, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnectEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
