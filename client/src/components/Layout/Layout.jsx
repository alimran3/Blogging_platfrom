import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-navy-900 text-cream-100 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-500 rounded-lg" />
              <span className="bengali-text text-xl font-bold" style={{ fontFamily: "'AlinurAtithi', serif" }}>মনের কিছু কথা</span>
            </div>
            <p className="text-navy-400 text-sm">
              © {new Date().getFullYear()} <span className="bengali-text" style={{ fontFamily: "'AlinurAtithi', serif" }}>মনের কিছু কথা</span>। Crafted with elegance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;