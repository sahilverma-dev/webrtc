import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
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
