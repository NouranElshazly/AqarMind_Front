import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import logo2 from "../assets/AqarMindLogo-removebg-preview.png";

// Premium Animations
const logoReveal = keyframes`
  0% { 
    transform: scale(0.5) rotate(-10deg);
    opacity: 0;
    filter: blur(10px);
  }
  20% {
    transform: scale(1.2) rotate(5deg);
    opacity: 0.8;
    filter: blur(2px);
  }
  40% {
    transform: scale(1.1) rotate(-2deg);
    opacity: 1;
    filter: blur(0px);
  }
  60%, 100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0px);
  }
`;

const backgroundFlow = keyframes`
  0%, 100% { 
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% { 
    background-position: 100% 50%;
    filter: hue-rotate(30deg);
  }
`;

const textGlowBlue = keyframes`
  0%, 100% { 
    text-shadow: 
      0 0 20px rgba(0, 150, 255, 0.8),
      0 0 40px rgba(0, 150, 255, 0.6),
      0 0 60px rgba(0, 150, 255, 0.4);
  }
  50% { 
    text-shadow: 
      0 0 30px rgba(100, 200, 255, 1),
      0 0 60px rgba(100, 200, 255, 0.8),
      0 0 90px rgba(100, 200, 255, 0.6);
  }
`;

const blueWave = keyframes`
  0% { 
    background-position: -200% 0;
  }
  100% { 
    background-position: 200% 0;
  }
`;

const floatGentle = keyframes`
  0%, 100% { 
    transform: translateY(0px);
  }
  50% { 
    transform: translateY(-10px);
  }
`;

const progressBlue = keyframes`
  0% { 
    width: 0%;
    background-position: 0% 50%;
  }
  100% { 
    width: 100%;
    background-position: 100% 50%;
  }
`;

const particleFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
    opacity: 0;
  }
  10%, 90% { 
    opacity: 1;
  }
  50% { 
    transform: translateY(-100px) rotate(180deg);
  }
`;

// Styled Components
const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg, 
      #0a1929 0%, 
      #0d2b4e 25%, 
      #1a4b8c 50%, 
      #0d2b4e 75%, 
      #0a1929 100%);
  background-size: 400% 400%;
  animation: ${backgroundFlow} 12s ease infinite;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const LogoContainer = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
  animation: ${floatGentle} 6s ease-in-out infinite;
  margin-bottom: 2rem;
`;

const LogoImage = styled.div`
  width: 300px;
  height: 300px;
  margin: 0 auto 3rem;
  background: url(${logo2}) center/contain no-repeat;
  animation: ${logoReveal} 8s ease-out forwards;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: radial-gradient(circle, rgba(0, 150, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
    animation: ${floatGentle} 4s ease-in-out infinite;
    animation-delay: 1s;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -30px;
    left: -30px;
    right: -30px;
    bottom: -30px;
    background: radial-gradient(circle, rgba(100, 200, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -2;
    animation: ${floatGentle} 6s ease-in-out infinite;
    animation-delay: 2s;
  }
`;

const LogoText = styled.h1`
  font-size: 4.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1rem;
  animation: ${textGlowBlue} 4s ease-in-out infinite;
  position: relative;
  letter-spacing: 2px;
  
  &::before {
    content: 'Aqar Mind';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      #64c8ff 25%,
      #0096ff 50%,
      #64c8ff 75%,
      #ffffff 100%
    );
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: ${blueWave} 4s linear infinite;
    z-index: 2;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: #64c8ff;
  font-weight: 300;
  letter-spacing: 3px;
  text-transform: uppercase;
  animation: ${textGlowBlue} 3s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(100, 200, 255, 0.5);
  margin-bottom: 2rem;
`;

const BlueParticle = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  animation: ${particleFloat} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  z-index: 1;
  box-shadow: 0 0 ${props => props.glow}px ${props => props.color};
  left: ${props => props.left}%;
`;

const LoaderContainer = styled.div`
  width: 500px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  z-index: 2;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 200, 255, 0.3);
`;

const LoaderProgress = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(
    90deg,
    #0066cc,
    #0096ff,
    #64c8ff,
    #0096ff,
    #0066cc
  );
  background-size: 300% 100%;
  border-radius: 10px;
  animation: ${progressBlue} 8s ease-in-out forwards;
  position: relative;
  transition: width 0.3s ease;
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    animation: ${blueWave} 2s infinite;
  }
`;

const LoadingText = styled.div`
  color: #64c8ff;
  font-size: 1.1rem;
  font-weight: 300;
  letter-spacing: 2px;
  text-align: center;
  animation: ${textGlowBlue} 2s ease-in-out infinite;
  margin-top: 1.5rem;
  text-transform: uppercase;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 3rem;
  margin-top: 2rem;
  animation: ${floatGentle} 4s ease-in-out infinite;
`;

const StatItem = styled.div`
  text-align: center;
  color: #64c8ff;
  position: relative;
  
  .number {
    font-size: 2.2rem;
    font-weight: 700;
    display: block;
    background: linear-gradient(135deg, #64c8ff, #0096ff, #ffffff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 20px rgba(100, 200, 255, 0.3);
  }
  
  .label {
    font-size: 0.9rem;
    opacity: 0.9;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 0.5rem;
  }
`;

const SplashScreen = ({ onFinish }) => {
  const [visited] = useState(localStorage.getItem("visited") === "true");
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState("INITIALIZING REAL ESTATE PLATFORM...");

  useEffect(() => {
    if (!visited) {
      // Create blue particles
      const particles = [
        { color: 'rgba(0, 150, 255, 0.8)', size: 4, duration: 6, delay: 0, glow: 15, left: 10 },
        { color: 'rgba(100, 200, 255, 0.6)', size: 3, duration: 8, delay: 1, glow: 12, left: 20 },
        { color: 'rgba(0, 100, 255, 0.7)', size: 5, duration: 7, delay: 2, glow: 18, left: 30 },
        { color: 'rgba(100, 200, 255, 0.8)', size: 3, duration: 9, delay: 3, glow: 10, left: 70 },
        { color: 'rgba(0, 150, 255, 0.6)', size: 4, duration: 10, delay: 4, glow: 14, left: 80 },
        { color: 'rgba(100, 200, 255, 0.7)', size: 3, duration: 8, delay: 5, glow: 11, left: 90 },
      ];

      const texts = [
        "INITIALIZING REAL ESTATE PLATFORM...",
        "LOADING PROPERTIES DATABASE...",
        "CONNECTING WITH REAL ESTATE AGENTS...",
        "PREPARING MARKET INSIGHTS...",
        "WELCOME TO AQAR MIND - ALMOST READY..."
      ];

      let currentIndex = 0;
      const textInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        setCurrentText(texts[currentIndex]);
      }, 1500);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            clearInterval(textInterval);
            return 100;
          }
          const increment = Math.random() * 8 + 2;
          return Math.min(prev + increment, 100);
        });
      }, 200);

      localStorage.setItem("visited", "true");
      
      const timer = setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(textInterval);
        onFinish();
      }, 8000); // 8 seconds to see the logo
      
      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
        clearInterval(textInterval);
      };
    } else {
      onFinish();
    }
  }, [onFinish, visited]);

  if (visited) return null;

  return (
    <SplashContainer>
      {/* Blue Particles */}
      <BlueParticle color="rgba(0, 150, 255, 0.8)" size={4} duration={6} delay={0} glow={15} left={10} />
      <BlueParticle color="rgba(100, 200, 255, 0.6)" size={3} duration={8} delay={1} glow={12} left={20} />
      <BlueParticle color="rgba(0, 100, 255, 0.7)" size={5} duration={7} delay={2} glow={18} left={30} />
      <BlueParticle color="rgba(100, 200, 255, 0.8)" size={3} duration={9} delay={3} glow={10} left={70} />
      <BlueParticle color="rgba(0, 150, 255, 0.6)" size={4} duration={10} delay={4} glow={14} left={80} />
      <BlueParticle color="rgba(100, 200, 255, 0.7)" size={3} duration={8} delay={5} glow={11} left={90} />

      <LogoContainer>
        <LogoImage />
        <LogoText>Aqar Mind</LogoText>
        <Subtitle>Premium Real Estate Solutions</Subtitle>
      </LogoContainer>

      <StatsContainer>
        <StatItem>
          <span className="number">1K+</span>
          <span className="label">Properties</span>
        </StatItem>
        <StatItem>
          <span className="number">100+</span>
          <span className="label">Agents</span>
        </StatItem>
        <StatItem>
          <span className="number">5K+</span>
          <span className="label">Clients</span>
        </StatItem>
      </StatsContainer>

      <LoaderContainer>
        <LoaderProgress progress={progress} />
      </LoaderContainer>
      
      <LoadingText>{currentText}</LoadingText>
    </SplashContainer>
  );
};

export default SplashScreen;