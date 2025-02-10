import React from 'react'
import Header from './header'
import {Helmet} from "react-helmet";

const Layout = ({children, title, description, keywords, author}) => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description}/>
        <meta name="keywords" content={keywords}/>
        <meta name="author" content={author}/>
        <title>{title}</title>
      </Helmet>


      <Header/>
      <main>
          {children}
      </main>
      {/* <Footer/> */}
    </div>
  )
}

Layout.defaultProps={
  title:"HSD - Hate Speech Detection",
  description:"Hate Speech Detection",
  keywords:"MERN",
  author:"jal patel"
}

export default Layout
