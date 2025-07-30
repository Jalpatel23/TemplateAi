import {Routes,Route} from 'react-router-dom';
import Home from './pages/home.js'
import Error404 from './pages/pagenotfound.js';
import Subscription from './pages/subscription.js'
import { useEffect } from 'react';
import globalErrorHandler from './utils/globalErrorHandler.js';

function App() {
  useEffect(() => {
    // Initialize the global error handler
    globalErrorHandler.init();
    
    // Cleanup on unmount
    return () => {
      globalErrorHandler.cleanup();
    };
  }, []);

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
