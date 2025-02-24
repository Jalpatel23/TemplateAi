import {Routes,Route} from 'react-router-dom';
import Login from './pages/Auth/login.js';
import Signup from './pages/Auth/signup.js';
import Home from './pages/home.js'
import Error404 from './pages/pagenotfound.js';
import ForgotPass from './pages/Auth/forgotpass.js';
import Profile from './pages/profile.js';
import PrivateRoute from './routes/private.js';

import ChatApp from './pages/temp.js';
import ChatApp2 from './pages/temp2.js';
import Signup2 from './pages/tempsignup.js'



function App() {
  return (
    <>
      <Routes>
        <Route path='/tempsignup' element={<Signup2/>}/>
        <Route path='/temp2' element={<ChatApp2/>}/>
        <Route path='/temp' element={<ChatApp/>}/>


        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/forgotpass' element={<ForgotPass/>}/>
        <Route path='*' element={<Error404/>}/>

        <Route path="profile" element={<PrivateRoute/>}>
          <Route path="" element={<Profile/>}/>
        </Route>
        

      </Routes>
    </>
  );
}

export default App;
