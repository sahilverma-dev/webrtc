import { PropsWithChildren, createContext } from "react";

export const WebRTCContext = createContext<{
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescription
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer: (offer: RTCSessionDescription) => Promise<void>;
  addLocalTrack: (stream: MediaStream) => void;
  dataChannel: RTCDataChannel;
  resetPeerConnection: () => void;
} | null>(null);

export const WebRTCProvider = (props: PropsWithChildren) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
          "turn:turn01.hubl.in?transport=udp",
          "turn:turn02.hubl.in?transport=tcp",
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

  const addLocalTrack = (stream: MediaStream) => {
    console.log("Adding local stream to the peer");

    const tracks = stream.getTracks();

    for (const track of tracks) {
      console.log("Checking track:", track);
      const sender = peer.getSenders().find((s) => s.track === track);
      if (!sender) {
        console.log("Adding track:", track);
        peer.addTrack(track, stream);
      } else {
        console.log("Track already added:", track);
      }
    }
  };

  const createOffer = async () => {
    console.log("creating offer");

    try {
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
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
      if (!peer.currentRemoteDescription)
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

  const resetPeerConnection = () => {
    // Reset existing sender state
    peer.getSenders().forEach((sender) => {
      peer.removeTrack(sender);
    });

    // Add new tracks or perform other initialization
  };

  return (
    <WebRTCContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        addLocalTrack,
        dataChannel,
        resetPeerConnection,
      }}
    >
      {props.children}
    </WebRTCContext.Provider>
  );
};
