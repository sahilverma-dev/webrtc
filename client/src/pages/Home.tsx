import { Button } from "@/components/ui/button";
import { SoundEffect } from "@/services/SoundEffect";
import { WebRTC } from "@/services/WebRTC";
import { useNavigate } from "react-router-dom";

const webrtc = new WebRTC();

console.log(webrtc);

const soundEffect = new SoundEffect("join");

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        onClick={() => {
          navigate(`/room/${crypto.randomUUID()}`);
        }}
      >
        Create Room
      </Button>
      <Button
        onClick={() => {
          soundEffect.play();
        }}
      >
        Play Sound
      </Button>
    </div>
  );
};

export default Home;
