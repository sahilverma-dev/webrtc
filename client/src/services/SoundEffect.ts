import joinAudioFile from "../sounds/join.mp3";
import leaveAudioFile from "../sounds/leave.mp3";
import messageAudioFile from "../sounds/message.mp3";
import notificationAudioFile from "../sounds/notification.mp3";
import ringAudioFile from "../sounds/ring.mp3";

type Name = "join" | "leave" | "message" | "notification" | "ring";

const sounds: Map<Name, string> = new Map();

sounds.set("join", joinAudioFile);
sounds.set("leave", leaveAudioFile);
sounds.set("message", messageAudioFile);
sounds.set("notification", notificationAudioFile);
sounds.set("ring", ringAudioFile);

export class SoundEffect {
  name: Name;

  constructor(name: Name) {
    this.name = name;
  }

  play() {
    const audio = new Audio(sounds.get(this.name));

    audio.play();
    console.log(`play the ${this.name}`);
  }
}
