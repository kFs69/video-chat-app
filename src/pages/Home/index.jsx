import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4} from 'uuid';
import './styles.css';

function Home() {
  const navigate = useNavigate();

  function createRoom() {
    const roomId = uuidv4();

    navigate(`/${roomId}`);
  }

  return (
    <div id="homeContainer">
      <button onClick={createRoom}>Criar sala de bate-papo</button>
    </div>
  );
}

export default Home;
