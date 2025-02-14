// eslint-disable-next-line 
import {MDBBtn,MDBContainer,MDBCard,MDBCardBody,MDBCol,MDBRow,MDBInput,MDBCheckbox,MDBIcon,MDBTypography} from 'mdb-react-ui-kit';
import logo from "./../../images/logo.png"
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import Layout from '../../components/layout';

function ForgotPass() {
  

  return (
    <Layout title={'Login'}>
      <MDBContainer fluid>
        <br></br><br></br><br></br><br></br>
        <MDBCard className='mx-5 mb-5 p-5 shadow-5 mx-auto' style={{width:'550px', background: 'hsla(0, 0%, 100%, 0.8)', backdropFilter: 'blur(30px)'}}>
          <MDBCardBody className='p-5 text-center'>
           

            <h1 className="fw-bold mb-4">Reset Password</h1>

            <img src={logo} style={{width: '185px'}} alt="logo" className="mb-4"/>

            <MDBInput wrapperClass='mb-4' label='Enter Email' id='form1' type='email'/>
            <MDBInput wrapperClass='mb-4' label='Set New Password' id='form1' type='password'/>

            <MDBBtn className='w-100 mb-4' size='md'>Reset</MDBBtn>

          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </Layout>
  );
}

export default ForgotPass;