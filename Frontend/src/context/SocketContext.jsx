import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthentication, user } = useSelector((state) => state.auth || state.slicers || {});

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!isAuthentication || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Determine the socket server origin from VITE_BASE_URL
    let socketUrl = "http://localhost:1200";
    if (import.meta.env.VITE_BASE_URL) {
      try {
        socketUrl = new URL(import.meta.env.VITE_BASE_URL).origin;
      } catch (err) {
        socketUrl = import.meta.env.VITE_BASE_URL;
      }
    }

    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthentication, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
