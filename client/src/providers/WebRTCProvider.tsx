import { PropsWithChildren, createContext } from "react";

export const WebRTCContext = createContext<{
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescription
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer: (offer: RTCSessionDescription) => Promise<void>;
  sendStream: (stream: MediaStream) => void;
  dataChannel: RTCDataChannel;
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

  const dataChannel = peer.createDataChannel("dataChannel", {
    ordered: true,
    maxRetransmits: 3,
  });

  dataChannel.onopen = () => {
    console.log("Data channel opened");
  };

  dataChannel.onmessage = (event) => {
    console.log("Received message:", event.data);
  };

  const createOffer = async () => {
    console.log("creating offer");

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error; // You might want to handle the error accordingly in your application
    }
  };

  const createAnswer = async (offer: RTCSessionDescription) => {
    console.log("got the offer and creating answer");

    try {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      console.log("answer created");

      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error; // Handle the error appropriately
    }
  };

  const setRemoteAnswer = async (ans: RTCSessionDescription) => {
    console.log("got the answer and setting the answer as remote SDP");
    await peer.setRemoteDescription(ans);
  };

  const sendStream = (stream: MediaStream) => {
    console.log("sending stream");

    const tracks = stream?.getTracks();

    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendStream,
        dataChannel,
      }}
    >
      {props.children}
    </WebRTCContext.Provider>
  );
};
