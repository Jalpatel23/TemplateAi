// eslint-disable-next-line 
import {MDBBtn,MDBContainer,MDBCard,MDBCardBody,MDBCol,MDBRow,MDBInput,MDBCheckbox,MDBIcon} from 'mdb-react-ui-kit';
import React from 'react';
import logo from "./../../images/logo.png"
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import Layout from '../../components/layout';

function Login() {
  return (
    <Layout title={'Login'}>
      <MDBContainer fluid>

        {/* <div className="p-5 bg-image" style={{backgroundImage: 'url(https://mdbootstrap.com/img/new/textures/full/171.jpg)', height: '300px'}}></div> */}
        <br></br><br></br><br></br><br></br>
        <MDBCard className='mx-5 mb-5 p-5 shadow-5 mx-auto' style={{width:'500px', background: 'hsla(0, 0%, 100%, 0.8)', backdropFilter: 'blur(30px)'}}>
          <MDBCardBody className='p-5 text-center'>


            <h1 className="fw-bold mb-4">LOGIN NOW</h1>


            <img src={logo} style={{width: '185px'}} alt="logo" className="mb-4"/>


            <MDBInput wrapperClass='mb-4' label='Email' id='form1' type='email'/>
            <MDBInput wrapperClass='mb-4' label='Password' id='form1' type='password'/>

            
            <MDBBtn className='w-100 mb-4' size='md'>Login</MDBBtn>
            <a className="text-muted" href="/forgotpassword">Don't have an Acount? Register Here</a>
            <br></br>
            <a className="text-muted" href="/forgotpassword">Forgot password</a>

          </MDBCardBody>
        </MDBCard>

      </MDBContainer>
    </Layout>
  );
}

export default Login;