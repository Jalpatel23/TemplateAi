// eslint-disable-next-line
import {MDBBtn,MDBContainer,MDBCard,MDBCardBody,MDBCol,MDBRow,MDBInput,MDBCheckbox,MDBIcon,MDBTypography} from 'mdb-react-ui-kit';
import React, { useState } from 'react';
import logo from "./../../images/logo.png"
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import Layout from '../../components/layout';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { useAuth } from '../../context/auth';

function Login() {
  const [email, setEmail]=useState("");
  const [password, setPassword]= useState("");
  const navigate=useNavigate();
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [auth, setAuth]=useAuth();

  //form function
  const handleSubmit=async(e)=>{
    e.preventDefault()
    try{
      const res = await axios.post('/api/v1/auth/Login',
        {email, password})

      if(res?.data?.success){
        // First update localStorage
        localStorage.setItem('auth', JSON.stringify(res.data));
        
        // Then update auth context
        setAuth({
          ...auth,
          user: res.data.user,
          token: res.data.token
        });

        // Show success message
        setNotification({
          message: res.data.message || "Login successful!", 
          type: "success"
        });

        // Navigate after a delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } 
      else {
        setNotification({ 
          message: res.data.message || "Login failed. Please check your credentials.", 
          type: "danger" 
        });
      }
    }
    catch(error){
      console.log(error);
      setNotification({ 
        message: error.response?.data?.message || "Invalid email or password!", 
        type: "danger" 
      });
    }
  }

  return (
    <Layout title={'Login'}>
      <MDBContainer fluid>
        <br></br><br></br><br></br><br></br>
        <MDBCard className='mx-5 mb-5 p-5 shadow-5 mx-auto' style={{width:'500px', background: 'hsla(0, 0%, 100%, 0.8)', backdropFilter: 'blur(30px)'}}>
          <MDBCardBody className='p-5 text-center'>
            {notification.message && (
              <div 
                className={`alert alert-${notification.type} alert-dismissible fade show mb-4`}
                role="alert"
              >
                <MDBTypography tag='div' className='mb-0'>
                  {notification.message}
                </MDBTypography>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNotification({ message: "", type: "" })}
                ></button>
              </div>
            )}

            <h1 className="fw-bold mb-4">LOGIN NOW</h1>

            <img src={logo} style={{width: '185px'}} alt="logo" className="mb-4"/>

            <MDBInput wrapperClass='mb-4' label='Email' id='form1' type='email' value={email} onChange={(e)=>setEmail(e.target.value)} required/>
            <MDBInput wrapperClass='mb-4' label='Password' id='form1' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} required/>

            <MDBBtn className='w-100 mb-4' size='md' onClick={handleSubmit}>Login</MDBBtn>
            <a className="text-muted" href="/signup">Don't have an Account? Register Here</a>
            <br></br>
            <a className="text-muted" href="/forgotpass">Forgot Password? Click Here</a>

          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </Layout>
  );
}

export default Login;