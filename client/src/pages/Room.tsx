import { io, Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faker } from "@faker-js/faker";
import { useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
const getRandomUser = () => {
  return {
    id: crypto.randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    image: faker.internet.avatar(),
  };
};

const user = getRandomUser();

const Room = () => {
  const userVideo = useRef<HTMLVideoElement>();
  const partnerVideo = useRef<HTMLVideoElement>();
  const peerRef = useRef<RTCPeerConnection>();

  const socketRef = useRef<Socket>();
  const otherUser = useRef();
  const userStream = useRef(new MediaStream());
  const { roomId } = useParams<{ roomId: string }>();

  const createPeer = useCallback((userID: string) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  }, []);

  const callUser = useCallback(
    (userID: string) => {
      peerRef.current = createPeer(userID);
      userStream.current.getTracks().forEach((track) => {
        if (peerRef.current)
          peerRef?.current.addTrack(track, userStream.current);
      });
    },
    [createPeer]
  );

  const handleNegotiationNeededEvent = useCallback((userID: string) => {
    if (peerRef.current)
      peerRef.current
        .createOffer()
        .then((offer) => {
          if (peerRef?.current)
            return peerRef?.current.setLocalDescription(offer);
        })
        .then(() => {
          if (socketRef.current && peerRef.current) {
            const payload = {
              target: userID,
              caller: socketRef.current.id,
              sdp: peerRef.current.localDescription,
            };
            socketRef.current.emit("offer", payload);
          }
        })
        .catch((e) => console.log(e));
  }, []);

  const handleRecieveCall = useCallback(
    (incoming: { caller: string; sdp: RTCSessionDescription }) => {
      peerRef.current = createPeer();
      const desc = new RTCSessionDescription(incoming.sdp);
      peerRef.current
        .setRemoteDescription(desc)
        .then(() => {
          userStream.current.getTracks().forEach((track) => {
            if (peerRef.current)
              peerRef.current.addTrack(track, userStream.current);
          });
        })
        .then(() => {
          if (peerRef.current) return peerRef.current.createAnswer();
        })
        .then((answer) => {
          if (peerRef.current)
            return peerRef.current.setLocalDescription(answer);
        })
        .then(() => {
          if (peerRef.current && socketRef.current) {
            const payload = {
              target: incoming.caller,
              caller: socketRef.current.id,
              sdp: peerRef.current.localDescription,
            };
            socketRef.current.emit("answer", payload);
          }
        });
    },
    [createPeer]
  );

  const handleAnswer = useCallback(
    (message: { sdp: RTCSessionDescription }) => {
      const desc = new RTCSessionDescription(message?.sdp);

      if (peerRef.current)
        peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
    },
    []
  );

  const handleICECandidateEvent = useCallback((e: RTCIceCandidate) => {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      if (socketRef.current) {
        socketRef.current.emit("ice-candidate", payload);
      }
    }
  }, []);

  const handleNewICECandidateMsg = useCallback((incoming: RTCIceCandidate) => {
    const candidate = new RTCIceCandidate(incoming);
    if (peerRef.current)
      peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  }, []);

  const handleTrackEvent = useCallback((e: RTCTrackEvent) => {
    if (partnerVideo.current) partnerVideo.current.srcObject = e.streams[0];
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (userVideo.current) userVideo.current.srcObject = stream;
        userStream.current = stream;

        socketRef.current = io("http://localhost:5000", {
          reconnection: false,
        });

        if (socketRef.current) {
          socketRef?.current.emit("join room", roomId);

          socketRef.current.on("other user", (userID) => {
            callUser(userID);
            otherUser.current = userID;
          });

          socketRef.current.on("user joined", (userID) => {
            otherUser.current = userID;
          });

          socketRef.current.on("offer", handleRecieveCall);

          socketRef.current.on("answer", handleAnswer);

          socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
        }
      });
  }, []);

  return (
    <div>
      <div className="flex border-b p-4 w-full items-center justify-between">
        <h1 className="font-bold">Room</h1>
        <div className="flex items-center gap-2">
          <b>Hello, {user.name}</b>
          <Avatar className="border">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name.split(" ").join("")}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="flex">
        <video autoPlay ref={userVideo} muted />
        <video autoPlay ref={partnerVideo} />
      </div>
    </div>
  );
};

export default Room;
