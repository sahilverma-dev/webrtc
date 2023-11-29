import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocket, useWebRTC } from "@/hooks";
import { motion } from "framer-motion";
import { User } from "@/interfaces";
import { faker } from "@faker-js/faker";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { container, item } from "@/constants/variants";
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
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(
    null
  );
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);

  const { roomId } = useParams<{ roomId: string }>();
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    dataChannel,
    sendStream,
  } = useWebRTC();

  useEffect(() => {
    return () => {
      socket?.emit("join", { roomId, user });
    };
  }, []);

  const handleJoin = useCallback(
    async ({ user: otherUser }: { user: User }) => {
      const offer = await createOffer();
      console.log(`offer created for ${otherUser.name}`, offer);

      socket?.emit("offer", {
        offer,
        userTo: otherUser,
        userBy: user,
        roomId,
      });
    },
    [createOffer, roomId, socket]
  );

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
    (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          // audio: true,
          video: true,
        });

        setLocalMediaStream(media);
        if (localVideoRef.current && media) {
          localVideoRef.current.srcObject = media;
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    socket?.on("join", handleJoin);
    socket?.on("offer", handleOffer);
    socket?.on("answer", handleAnswer);
    socket?.on("ice-candidate", handleICECandidates);
    peer.ontrack = (tracks) => {
      console.log("got the tracks", tracks);
      const stream = tracks.streams[0];
      if (remoteVideoRef?.current) remoteVideoRef.current.srcObject = stream;
      setRemoteMediaStream(stream);
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
        console.log("Peers connected!");
        console.log(localMediaStream);

        if (localMediaStream) sendStream(localMediaStream);
        else console.log("no media");
      }
    };

    return () => {
      socket?.off("join", handleJoin);
      socket?.off("offer", handleOffer);
      socket?.off("answer", handleAnswer);
      socket?.off("ice-candidate", handleICECandidates);
    };
  }, [
    handleAnswer,
    handleICECandidates,
    handleJoin,
    handleOffer,
    localMediaStream,
    peer,
    roomId,
    sendStream,
    socket,
  ]);

  return (
    <div className="">
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
      <div className="p-4 space-y-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="w-full grid gap-4 xl:grid-cols-3"
        >
          <motion.div
            layout
            variants={item}
            className="w-full flex items-center gap-4 flex-col h-full border rounded-lg aspect-video overflow-hidden"
          >
            <video
              ref={localVideoRef}
              controls={false}
              autoPlay
              muted
              className=" w-full h-full object-cover"
            />
          </motion.div>

          {remoteMediaStream && (
            <motion.div
              layout
              variants={item}
              className="w-full flex items-center gap-4 flex-col h-full border rounded-lg aspect-video overflow-hidden"
            >
              <video
                ref={remoteVideoRef}
                controls={false}
                autoPlay
                className=" w-full h-full object-cover"
              />
            </motion.div>
          )}
        </motion.div>
        <div className="flex gap-4">
          <Button>Send Stream</Button>
          <Button
            onClick={() => {
              dataChannel.send("hello");
            }}
          >
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Room;
