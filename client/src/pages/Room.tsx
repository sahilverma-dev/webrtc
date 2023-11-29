import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useSocket } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "@/interfaces";
import { faker } from "@faker-js/faker";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { container, item } from "@/constants/variants";
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

interface Peer {
  peerId: string;
  user: User;
}

const Room = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const { roomId } = useParams<{ roomId: string }>();

  const { socket } = useSocket();

  useEffect(() => {
    return () => {
      socket?.emit("join", { roomId, user });
    };
  }, []);

  const handleJoin = useCallback(
    async ({ user: otherUser }: { user: User }) => {
      toast.success(`${otherUser.name} joined`);
    },
    []
  );

  const handleLeave = useCallback(
    async ({ user: otherUser, peerId }: { user: User; peerId: string }) => {
      toast.error(`${otherUser.name} left`);
      setPeers((peers) => peers.filter((i) => i.peerId !== peerId));
    },
    []
  );

  const handleAllUsers = useCallback(async ({ users }: { users: Peer[] }) => {
    console.log(users);

    setPeers(users);
  }, []);

  useEffect(() => {
    socket?.on("join", handleJoin);
    socket?.on("leave", handleLeave);
    socket?.on("all-users", handleAllUsers);
    return () => {
      socket?.off("join", handleJoin);
      socket?.off("all-users", handleAllUsers);
      socket?.off("leave", handleLeave);
    };
  }, [handleAllUsers, handleJoin, handleLeave, roomId, socket]);

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
      <div className="p-2 space-y-2">
        <AnimatePresence initial={false}>
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="w-full grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            <motion.div
              variants={item}
              className="flex items-center flex-col gap-2 border rounded-lg p-4"
            >
              <Avatar className="border">
                <AvatarImage src={user.image} />
                <AvatarFallback>{user.name.split(" ").join("")}</AvatarFallback>
              </Avatar>

              <div className="font-bold truncate">{user.name}</div>
            </motion.div>
            {peers.map((peer) => (
              <motion.div
                key={peer.peerId}
                variants={item}
                className="flex items-center flex-col gap-2 border rounded-lg p-4"
              >
                <Avatar className="border">
                  <AvatarImage src={peer?.user.image} />
                  <AvatarFallback>
                    {peer?.user.name.split(" ").join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="font-bold truncate">{peer?.user.name}</div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Room;
