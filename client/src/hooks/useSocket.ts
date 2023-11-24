import { SocketContext } from "@/providers/SocketProvider";
import { useContext } from "react";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context) {
    return context;
  } else {
    throw new Error("Something is wrong with socket context");
  }
};
