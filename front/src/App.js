import {Routes,Route} from 'react-router-dom';
import Login from './pages/Auth/login.js';
import Signup from './pages/Auth/signup.js';
import Home from './pages/home.js'
import Error404 from './pages/pagenotfound.js';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='*' element={<Error404/>}/>
      </Routes>
    </>
  );
}

export default App;
