import React from 'react';
// eslint-disable-next-line 
import {MDBBtn,MDBContainer,MDBCard,MDBCardBody,MDBCol,MDBRow,MDBInput,MDBCheckbox,MDBIcon} from 'mdb-react-ui-kit';
import logo from "./../images/logo.png"

import Layout from './../components/layout.js'
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";

function Signup() {
  return (
    <MDBContainer fluid>

      {/* <div className="p-5 bg-image" style={{backgroundImage: 'url(https://mdbootstrap.com/img/new/textures/full/171.jpg)', height: '300px'}}></div> */}
      <br></br><br></br><br></br><br></br>
      <MDBCard className='mx-5 mb-5 p-5 shadow-5' style={{marginTop: '-100px', background: 'hsla(0, 0%, 100%, 0.8)', backdropFilter: 'blur(30px)'}}>
        <MDBCardBody className='p-5 text-center'>

          <h1 className="fw-bold mb-4">SIGN UP NOW</h1>


          <img src={logo} style={{width: '185px'}} alt="logo" className=" mb-4"/>



          <MDBInput wrapperClass='mb-4' label='Full name' id='form1' type='text'/>
          <MDBInput wrapperClass='mb-4' label='Email' id='form1' type='email'/>
          <MDBInput wrapperClass='mb-4' label='Phone number' id='form1' type='text'/>
          <MDBInput wrapperClass='mb-4' label='Password' id='form1' type='password'/>

          

          <MDBBtn className='w-100 mb-4' size='md'>sign up</MDBBtn>

        </MDBCardBody>
      </MDBCard>

    </MDBContainer>
  );
}

export default Signup;