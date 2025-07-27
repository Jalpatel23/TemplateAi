import {Routes,Route} from 'react-router-dom';
import Home from './pages/home.js'
import Error404 from './pages/pagenotfound.js';
import Subscription from './pages/subscription.js'



function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/subscription' element={<Subscription/>}/>
        <Route path='*' element={<Error404/>}/>   
      </Routes>
    </>
  );
}

export default App;
