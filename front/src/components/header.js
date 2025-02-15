// eslint-disable-next-line
import {MDBContainer,MDBNavbar,MDBNavbarBrand,MDBNavbarToggler,MDBNavbarNav,MDBNavbarItem,MDBNavbarLink,MDBCollapse,MDBIcon} from 'mdb-react-ui-kit';
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import Logo from './../images/logo.png'
import React from 'react';
import { useAuth } from '../context/auth';

export default function App() {
  const [auth,setAuth]=useAuth();

  const handleLogout=()=>{
    setAuth({
      ...auth,
      user: null,
      token: "",
    })
    localStorage.removeItem("auth");
  }

  return (
    <MDBNavbar expand='lg' light bgColor='light' className='fw-bold'>
      <MDBContainer fluid>
        <img src={Logo} style={{width: '120px'}} alt="logo" className='me-5'/>
        <MDBNavbarNav className="fs-4">
            
            {/* <MDBNavbarToggler
            type='button'
            aria-expanded='false'
            aria-label='Toggle navigation'
            onClick={() => setOpenNav(!openNav)}
            >
            <MDBIcon icon='bars' fas />
            </MDBNavbarToggler> */}
            {/* <MDBCollapse navbar open={openNav}> */}
            
            <MDBNavbarItem className="ms-5 px-4">
              <MDBNavbarLink active aria-current='page' href='/' >Home</MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem className="px-4">
              <MDBNavbarLink href='#' >Pricing</MDBNavbarLink>
            </MDBNavbarItem>
            
            {
              !auth.user ? (
                <>
                  
                  <MDBNavbarItem className="px-4">
                    <MDBNavbarLink href='/signup'>SignUp</MDBNavbarLink>
                  </MDBNavbarItem>
                  <MDBNavbarItem className="px-4">
                    <MDBNavbarLink href='/login'>Login</MDBNavbarLink>
                  </MDBNavbarItem>
                </>
              ):(
                <>
                  <MDBNavbarItem className="px-4">
                    <MDBNavbarLink href='/profile'>Profile</MDBNavbarLink>
                  </MDBNavbarItem >
                  <MDBNavbarItem className="px-4">
                    <MDBNavbarLink href='/history' >history</MDBNavbarLink>
                  </MDBNavbarItem>
                  <MDBNavbarItem className="px-4">
                    <MDBNavbarLink href='/login' onClick={handleLogout}>Logout</MDBNavbarLink>
                  </MDBNavbarItem>
                </>
              )
            }
            
            {/* <MDBNavbarItem>
              <MDBNavbarLink disabled href='#' tabIndex={-1} aria-disabled='true'>Disabled</MDBNavbarLink>
            </MDBNavbarItem> */}
        </MDBNavbarNav>
        {/* </MDBCollapse> */}
      </MDBContainer>
    </MDBNavbar>
  );
}





// import React, { useState } from 'react';
// import {
//   MDBContainer,
//   MDBNavbar,
//   MDBNavbarBrand,
//   MDBNavbarToggler,
//   MDBIcon,
//   MDBNavbarNav,
//   MDBNavbarItem,
//   MDBNavbarLink,
//   MDBBtn,
//   MDBDropdown,
//   MDBDropdownToggle,
//   MDBDropdownMenu,
//   MDBDropdownItem,
//   MDBCollapse,
// } from 'mdb-react-ui-kit';

// export default function App() {
//   const [openBasic, setOpenBasic] = useState(false);

//   return (
//     <MDBNavbar expand='lg' light bgColor='light'>
//       <MDBContainer fluid>
//         <MDBNavbarBrand href='#'>Brand</MDBNavbarBrand>

//         <MDBNavbarToggler
//           aria-controls='navbarSupportedContent'
//           aria-expanded='false'
//           aria-label='Toggle navigation'
//           onClick={() => setOpenBasic(!openBasic)}
//         >
//           <MDBIcon icon='bars' fas />
//         </MDBNavbarToggler>

//         <MDBCollapse navbar open={openBasic}>
//           <MDBNavbarNav className='mr-auto mb-2 mb-lg-0'>
//             <MDBNavbarItem>
//               <MDBNavbarLink active aria-current='page' href='#'>
//                 Home
//               </MDBNavbarLink>
//             </MDBNavbarItem>
//             <MDBNavbarItem>
//               <MDBNavbarLink href='#'>Link</MDBNavbarLink>
//             </MDBNavbarItem>

//             <MDBNavbarItem>
//               <MDBDropdown>
//                 <MDBDropdownToggle tag='a' className='nav-link' role='button'>
//                   Dropdown
//                 </MDBDropdownToggle>
//                 <MDBDropdownMenu>
//                   <MDBDropdownItem link>Action</MDBDropdownItem>
//                   <MDBDropdownItem link>Another action</MDBDropdownItem>
//                   <MDBDropdownItem link>Something else here</MDBDropdownItem>
//                 </MDBDropdownMenu>
//               </MDBDropdown>
//             </MDBNavbarItem>

//             <MDBNavbarItem>
//               <MDBNavbarLink disabled href='#' tabIndex={-1} aria-disabled='true'>
//                 Disabled
//               </MDBNavbarLink>
//             </MDBNavbarItem>
//         <form className='d-flex input-group w-auto'>
//             <input type='search' className='form-control' placeholder='Type query' aria-label='Search' />
//             <MDBBtn color='primary'>Search</MDBBtn>
//           </form>
//           </MDBNavbarNav>

          
//         </MDBCollapse>
//       </MDBContainer>
//     </MDBNavbar>
//   );
// }

