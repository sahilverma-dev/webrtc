import { FC, ReactNode } from "react";
// import { WebRTCProvider } from "./WebRTCProvider";
// import { SocketProvider } from "./SocketProvider";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const Providers: FC<Props> = ({ children }) => {
  return (
    <>
      <BrowserRouter>{children}</BrowserRouter>
      <Toaster richColors />
    </>
  );
};

export default Providers;
