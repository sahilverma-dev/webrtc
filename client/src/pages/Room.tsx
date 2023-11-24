import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/hooks";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { motion } from "framer-motion";
import { container, item } from "@/constants/variants";
import { User, UserMap } from "@/interfaces";

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
  const { roomId } = useParams<{ roomId: string }>();

  const [users, setUsers] = useState<{ socketId: string; user: User }[]>([]);

  const { socket } = useSocket();

  const handleLeave = () => {
    console.log("user left");
  };

  useEffect(() => {
    return () => {
      socket?.emit("join", { roomId, user });
      socket?.on("allUsers", (data) => {
        console.log(data?.users);

        // setUsers(
        //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //   // @ts-ignore
        //   users.forEach((item, key) => ({
        //     socketId: key,
        //     ...item,
        //   }))
        // );
      });
      socket?.on("leave", () => {
        // setUsers((state) => state.filter((i) => i.socketId !== socketId));
      });

      window.onclose = () => {
        console.log("close");
        handleLeave();
      };

      window.onclose = () => {
        console.log("close");
        handleLeave();
      };
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
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="w-full p-4 grid gap-4 xl:grid-cols-6"
      >
        {users.map((user) => (
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
        ))}
      </motion.div>
    </div>
  );
};

export default Room;
