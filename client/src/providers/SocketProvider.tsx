import { FC, ReactNode, createContext } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<{
  socket: Socket | null;
} | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const socket = io(import.meta.env.VITE_SOCKET_IO_URI, {
    reconnection: false,
    // autoConnect: false
  });
  return (
    <SocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider };
