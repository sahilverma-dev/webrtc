import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
    </div>
  );
};

export default Home;
