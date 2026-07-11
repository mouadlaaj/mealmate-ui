import { ToastContainer } from 'react-toastify';
import './App.css';
import './index.css';
 import Root from './routes/root'


const App = () => (
  
    <div className="App">
      <Root/>
      <ToastContainer position="bottom-right" />
    </div>

);

export default App;