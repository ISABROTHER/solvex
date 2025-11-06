import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';
import ScrollToTop from '../../shared/components/ScrollToTop';

const PublicLayout: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
