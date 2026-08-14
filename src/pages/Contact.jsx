import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Contact = () => {
  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-32 pb-12 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-darkText mb-6">Contact</h1>
          <p className="text-gray-500">Page en construction...</p>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Contact;