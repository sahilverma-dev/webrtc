import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket, useWebRTC } from "@/hooks";
import { faker } from "@faker-js/faker";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { motion } from "framer-motion";
import { container, item } from "@/constants/variants";
import { User } from "@/interfaces";
import { Button } from "@/components/ui/button";

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

  const {
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    peer,
    dataChannel,
  } = useWebRTC();
  // const [users] = useState<{ socketId: string; user: User }[]>([]);

  const { socket } = useSocket();

  const handleJoin = async ({ user }: { user: User }) => {
    
    console.log(`${user.name} joined`);

    const offer = await createOffer();
    console.log(`creating offer for ${user.name}`);
    socket?.emit("offer", { roomId, offer, user });
  };

  const handleOffer = async ({
    user,
    offer,
  }: {
    user: User;
    offer: RTCSessionDescription;
  }) => {
    console.log(`creating answer for ${user.name}`);
    const answer = await createAnswer(offer);
    socket?.emit("answer", { roomId, answer, user });
  };

  const handleAnswer = async (data: {
    user: User;
    answer: RTCSessionDescription;
  }) => {
    console.log(data);
    const { answer } = data;
    await setRemoteAnswer(answer);
  };

  useEffect(() => {
    return () => {
      socket?.emit("join", {
        user,
        roomId,
      });
    };
  }, []);

  useEffect(() => {
    socket?.on("join", handleJoin);
    socket?.on("offer", handleOffer);
    socket?.on("answer", handleAnswer);
    return () => {
      socket?.off("join", handleJoin);
      socket?.off("offer", handleOffer);
      socket?.off("answer", handleAnswer);
    };
  });

  useEffect(() => {
    (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          // audio: true,
          video: true,
        });

        if (localVideoRef.current && media) {
          localVideoRef.current.srcObject = media;
          setLocalMediaStream(media);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleTracks = (e: RTCTrackEvent) => {
    const streams = e.streams;
    console.log(streams);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = streams[0];
    }
    setRemoteMediaStream(streams[0]);
  };

  useEffect(() => {
    peer.addEventListener("track", handleTracks);

    // peer.onicecandidate = () => {
    //   const { localDescription, remoteDescription } = peer;
    //   socket?.emit("offer", { roomId, offer: remoteDescription, user });
    //   socket?.emit("answer", { roomId, answer: localDescription, user });
    // };
    return () => {
      peer.removeEventListener("track", handleTracks);
    };
  }, []);

  return (
    <div className="w-full">
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

          {/* {users.map((user) => (
          <motion.div
            layout
            variants={item}
            layoutId={user.socketId}
            key={user.socketId}
            className="w-full flex items-center gap-4 flex-col h-full p-4 border rounded-lg"
          >
            <Avatar className="border">
              <AvatarImage src={user?.user?.image} />
              <AvatarFallback>
                {user?.user?.name.split(" ").join("")}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-bold truncate">{user?.user?.name}</h3>
          </motion.div>
        ))} */}
        </motion.div>
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => {
              sendStream(localMediaStream as MediaStream);
            }}
          >
            Send Track
          </Button>
          <Button
            onClick={() => {
              dataChannel.send("hello");
            }}
          >
            Send Track
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Room;
