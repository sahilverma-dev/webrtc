import { FC, ReactNode } from "react";
import { WebRTCProvider } from "./WebRTCProvider";
import { SocketProvider } from "./SocketProvider";

interface Props {
  children: ReactNode;
}

const Providers: FC<Props> = ({ children }) => {
  return (
    <WebRTCProvider>
      <SocketProvider>{children}</SocketProvider>
    </WebRTCProvider>
  );
};

export default Providers;
