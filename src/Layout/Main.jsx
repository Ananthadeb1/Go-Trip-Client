import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../Pages/Shared/Footer/Footer';
import NavBar from '../Pages/Shared/NavBar/NavBar';

const Main = () => {
    return (
        <div className='bg-white min-h-screen text-black'>
            <NavBar></NavBar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default Main;