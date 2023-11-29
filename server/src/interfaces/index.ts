export type UserMap = Map<string, User>;

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

export type RoomMap = Map<string, User[]>;

export interface ClientToServerEvents {
  leave: (data: { socketId: string; user: User }) => void;
  join: (data: { socketId: string; user: User }) => void;
  offer: (data: { user: User; offer: RTCSessionDescription }) => void;
  answer: (data: { user: User; answer: RTCSessionDescription }) => void;
  allUsers: (data: { users: UserMap }) => void;
}

export interface ServerToClientEvents {
  allUsers: (data: { roomId: string }) => void;
  join: (data: { roomId: string; user: User }) => void;
  leave: (data: { roomId: string; user: User }) => void;
  answer: (data: {
    roomId: string;
    user: User;
    answer: RTCSessionDescription;
  }) => void;
  offer: (data: {
    roomId: string;
    user: User;
    offer: RTCSessionDescription;
  }) => void;
}

export interface InterServerEvents {}

export interface SocketData {}
