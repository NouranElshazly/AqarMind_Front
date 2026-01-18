import { React, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLock, FaHome } from "react-icons/fa";

const Unauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const particlesContainer = document.querySelector(".particles-container");
      if (!particlesContainer) return;

      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";

        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        const opacity = Math.random() * 0.5 + 0.1;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.opacity = opacity;

        particlesContainer.appendChild(particle);
      }
    };

    createParticles();

    return () => {
      document.querySelectorAll(".particle").forEach((el) => el.remove());
    };
  }, []);

  const handleReturnHome = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden particles-container"
      style={{
        background:
          "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
      }}
    >
      {/* Background Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')",
        }}
      />

      {/* Rotating Gradient Overlay */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animationDuration: "60s",
        }}
      />

      {/* Main Content Card */}
      <div
        className="relative z-10 max-w-3xl mx-4 p-12 bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 transition-all duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] group"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        {/* Lock Icon with Animations */}
        <div className="flex justify-center mb-8">
          <FaLock className="text-8xl text-yellow-400 drop-shadow-[0_0_20px_rgba(248,213,107,0.8)] animate-float-glow" />
        </div>

        {/* Title with Underline Effect */}
        <div className="mb-6">
          <h1
            className="text-6xl font-bold text-white text-center mb-4 tracking-wide drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Access Denied
          </h1>
          <div className="flex justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Description */}
        <p
          className="text-xl text-white/90 text-center max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Your credentials don't grant you access to this royal chamber. Please
          contact the administrator if you believe this is a mistake.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReturnHome}
            className="group relative px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold text-lg rounded-full uppercase tracking-wider shadow-lg shadow-yellow-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/50 hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <FaHome className="text-xl" />
              Return to Home
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>

          <Link
            to="/login"
            className="group relative px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full uppercase tracking-wider border-2 border-white/30 shadow-lg transition-all duration-500 hover:bg-white/20 hover:border-white/50 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <FaLock className="text-xl" />
              Login
            </span>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600&display=swap");

        @keyframes float-glow {
          0%,
          100% {
            transform: translateY(0) rotate(-5deg);
            filter: drop-shadow(0 0 10px rgba(248, 213, 107, 0.5));
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
            filter: drop-shadow(0 0 20px rgba(248, 213, 107, 0.8));
          }
        }

        .animate-float-glow {
          animation: float-glow 6s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          pointer-events: none;
          animation: float ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 60s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* 3D Hover Effect */
        .group:hover {
          transform: perspective(1000px) rotateY(2deg) rotateX(2deg);
        }

        @media (max-width: 768px) {
          .group > div:first-child svg {
            font-size: 4rem;
          }

          h1 {
            font-size: 2.5rem;
          }

          p {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Unauthorized;
