export type UserMap = Map<string, User>;
export interface ServerToClientEvents {
  join: (data: { roomId: string; id: string }) => void;
}

export interface ClientToServerEvents {
  message: (message: string) => void;
  join: (data: { roomId: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}
