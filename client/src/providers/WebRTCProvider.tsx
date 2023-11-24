import { PropsWithChildren, createContext } from "react";

export const WebRTCContext = createContext<{
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescription
  ) => Promise<RTCSessionDescriptionInit>;
} | null>(null);

export const WebRTCProvider = (props: PropsWithChildren) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      },
    ],
  });

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer: RTCSessionDescription) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    peer.setLocalDescription(answer);
    return answer;
  };

  return (
    <WebRTCContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
      }}
    >
      {props.children}
    </WebRTCContext.Provider>
  );
};
