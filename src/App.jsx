import React, { useEffect } from 'react';
import Background from './components/Background';
import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import Stats      from './components/Stats';
import Features   from './components/Features';
import Rutas      from './components/Rutas';
import CtaBanner  from './components/CtaBanner';
import Footer     from './components/Footer';

export default function App() {
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Background />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Rutas />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
