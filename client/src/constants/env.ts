export const STUN_SERVER: RTCIceServer = import.meta.env.VITE_STUN_SERVER;
export const TURN_SERVER_1: RTCIceServer = {
  urls: import.meta.env.VITE_TURN_SERVER_1,
  username: import.meta.env.VITE_TURN_SERVER_1_USERNAME,
  credential: import.meta.env.VITE_TURN_SERVER_1_CREDENTIAL,
};
export const TURN_SERVER_2: RTCIceServer = {
  urls: import.meta.env.VITE_TURN_SERVER_2,
  username: import.meta.env.VITE_TURN_SERVER_2_USERNAME,
  credential: import.meta.env.VITE_TURN_SERVER_2_CREDENTIAL,
};
export const TURN_SERVER_3: RTCIceServer = {
  urls: import.meta.env.VITE_TURN_SERVER_3,
  username: import.meta.env.VITE_TURN_SERVER_3_USERNAME,
  credential: import.meta.env.VITE_TURN_SERVER_3_CREDENTIAL,
};
export const TURN_SERVER_4: RTCIceServer = {
  urls: import.meta.env.VITE_TURN_SERVER_4,
  username: import.meta.env.VITE_TURN_SERVER_4_USERNAME,
  credential: import.meta.env.VITE_TURN_SERVER_4_CREDENTIAL,
};
