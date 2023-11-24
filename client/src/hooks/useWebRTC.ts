import { WebRTCContext } from "@/providers/WebRTCProvider";
import { useContext } from "react";

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (context) {
    return context;
  } else {
    throw new Error("Something is wrong with socket context");
  }
};
