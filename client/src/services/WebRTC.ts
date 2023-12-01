export class WebRTC {
  peer: RTCPeerConnection;

  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  addLocalMediaStream(mediaStream: MediaStream) {
    const tracks = mediaStream.getTracks();
    tracks.map((track) => {
      this.peer.addTrack(track, mediaStream);
    });
  }

  async createOffer() {
    try {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error; // You might want to handle the error accordingly in your application
    }
  }

  async createAnswer(offer: RTCSessionDescription) {
    console.log("got the offer and creating answer");

    try {
      await this.peer.setRemoteDescription(offer);
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      console.log("answer created");

      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error; // Handle the error appropriately
    }
  }

  async setRemoteAnswer(ans: RTCSessionDescription) {
    console.log("got the answer and setting the answer as remote SDP");
    await this.peer.setRemoteDescription(ans);
  }
}
