import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useSocket, useWebRTC } from "@/hooks";
import { motion } from "framer-motion";
import { User } from "@/interfaces";
import { faker } from "@faker-js/faker";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { container, item } from "@/constants/variants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(
    null
  );
  const [remoteMediaStream, setRemoteMediaStream] = useState(new MediaStream());
  const { roomId } = useParams<{ roomId: string }>();
  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAnswer, addLocalTrack } =
    useWebRTC();

  // handling events
  const handleJoin = useCallback(
    async ({ user: otherUser }: { user: User }) => {
      const offer = await createOffer();
      console.log(`offer created for ${otherUser.name}`, offer);
      toast.success(`${otherUser.name} joined the room`);
      socket?.emit("offer", {
        offer,
        userTo: otherUser,
        userBy: user,
        roomId,
      });
    },
    [createOffer, roomId, socket]
  );
  const handleLeave = useCallback(async ({ user }: { user: User }) => {
    console.log(`${user.name} left the room`);

    // removing the stream
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = new MediaStream();
    }

    toast.error(`${user.name} left the room`);
  }, []);
  const handleOffer = useCallback(
    async ({
      userBy: otherUser,
      offer,
    }: {
      userBy: User;
      offer: RTCSessionDescription;
    }) => {
      console.log(`got the offer from ${otherUser.name}`, offer);

      const answer = await createAnswer(offer);
      console.log(`created answer for ${otherUser.name}`, answer);
      socket?.emit("answer", {
        answer,
        userTo: otherUser,
        userBy: user,
        roomId,
      });
    },
    [createAnswer, roomId, socket]
  );
  const handleAnswer = useCallback(
    async ({
      answer,
      userBy,
    }: {
      userBy: User;
      answer: RTCSessionDescription;
    }) => {
      console.log(`got the answer from ${userBy.name}`, answer);

      setRemoteAnswer(answer);
    },
    [setRemoteAnswer]
  );
  const handleICECandidates = useCallback(
    async ({
      candidate,
      userBy,
    }: {
      userBy: User;
      candidate: RTCIceCandidate;
    }) => {
      console.log(`got the ice candidate from ${userBy.name}`);
      peer.addIceCandidate(candidate);
    },
    [peer]
  );

  useEffect(() => {
    const getUserLocalMediaStream = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        socket?.emit("join", { roomId, user });
        setLocalMediaStream(media);
        if (localVideoRef.current && media) {
          localVideoRef.current.srcObject = media;
          addLocalTrack(media);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUserLocalMediaStream();
  }, []);

  useEffect(() => {
    // socket events
    socket?.on("join", handleJoin);
    socket?.on("leave", handleLeave);
    socket?.on("offer", handleOffer);
    socket?.on("answer", handleAnswer);
    socket?.on("ice-candidate", handleICECandidates);

    // peer events
    peer.ontrack = (event) => {
      console.log("got the track", event.track);

      event.streams[0].getTracks().forEach((track) => {
        setRemoteMediaStream((state) => {
          state.addTrack(track);
          return state;
        });
      });

      if (remoteVideoRef.current) {
        console.log("setting the track to remote video element");
        remoteVideoRef.current.srcObject = remoteMediaStream;
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the ICE candidate to the other peer
        socket?.emit("ice-candidate", {
          userBy: user,
          candidate: event.candidate,
          roomId,
        });
      }
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        setIsPeerConnected(true);
        console.log("Peers connected!");
      }
    };

    return () => {
      // remove the events on unmount
      socket?.off("join", handleJoin);
      socket?.off("leave", handleLeave);
      socket?.off("offer", handleOffer);
      socket?.off("answer", handleAnswer);
      socket?.off("ice-candidate", handleICECandidates);
    };
  }, [
    handleAnswer,
    handleICECandidates,
    handleJoin,
    handleLeave,
    handleOffer,
    localMediaStream,
    peer,
    remoteMediaStream,
    roomId,
    socket,
  ]);

  return (
    <div className="h-dvh ">
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

      <div className="p-4 h-full space-y-2">
        {/* <Button
          onClick={() => {
            socket?.emit("join", { roomId, user });
          }}
        >
          Join the room
        </Button> */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="w-full h-full md:h-auto gap-4 flex flex-col md:flex-row "
          // className="w-full grid gap-4 grid-cols-2 lg:grid-cols-3"
        >
          <motion.div
            layout
            variants={item}
            className="w-full flex items-center gap-4 flex-col h-full md:h-auto border rounded-xl md:aspect-video overflow-hidden"
          >
            <video
              ref={localVideoRef}
              controls={false}
              autoPlay
              muted
              className=" w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            layout
            variants={item}
            className={cn([
              "w-full flex items-center gap-4 flex-col h-full border rounded-xl md:aspect-video overflow-hidden",
              !isPeerConnected && "hidden",
            ])}
          >
            <video
              ref={remoteVideoRef}
              controls={false}
              autoPlay
              className=" w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
        {/* <div className="flex gap-2">
          <Button
            onClick={() => {
              // dataChannel.send("hello");
              console.log(remoteVideoRef);
            }}
          >
            Send Message
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default Room;
