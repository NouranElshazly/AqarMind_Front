import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".footer-element").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer 
      ref={footerRef}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 text-white"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-float"
              style={{
                width: Math.random() * 8 + 2 + 'px',
                height: Math.random() * 8 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 20 + 's',
                animationDuration: Math.random() * 20 + 20 + 's'
              }}
            />
          ))}
        </div>

        {/* Gradient Orbs */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main Wave Separator */}
      <div className="relative h-24 -mt-1 overflow-hidden">
        <svg 
          viewBox="0 0 1200 120" 
          className="absolute w-full h-full"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            className="fill-current text-gray-900" 
            opacity=".8"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            className="fill-current text-gray-900" 
            opacity=".6"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-current text-gray-900" 
            opacity=".4"
          ></path>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand Section */}
          <div className="footer-element flex flex-col items-start space-y-6 opacity-0 translate-y-8 transition-all duration-700">
            {/* Animated Logo */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
              <div className="relative">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-emerald-200 bg-clip-text text-transparent relative z-10">
                  Aqar<span className="text-emerald-400">Mind</span>
                </h3>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed font-light">
              Redefining luxury living through exceptional rental experiences and unparalleled service.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: 'fab fa-facebook-f', color: 'hover:bg-blue-500' },
                { icon: 'fab fa-twitter', color: 'hover:bg-sky-400' },
                { icon: 'fab fa-instagram', color: 'hover:bg-pink-500' },
                { icon: 'fab fa-linkedin-in', color: 'hover:bg-blue-600' },
                { icon: 'fab fa-tiktok', color: 'hover:bg-gray-800' }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`footer-element w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all duration-500 opacity-0 translate-y-4 hover:scale-110 hover:shadow-2xl ${social.color} border border-white/10 hover:border-transparent`}
                  style={{ transitionDelay: `${index * 100 + 500}ms` }}
                >
                  <i className={`${social.icon} text-white/80 text-base`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-element opacity-0 translate-y-8 transition-all duration-700" style={{transitionDelay: '200ms'}}>
            <h4 className="text-2xl font-semibold mb-8 pb-4 relative">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Explore
              </span>
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'Premium Properties', path: '/premium-properties' },
                { name: 'Luxury Villas', path: '/luxury-villas' },
                { name: 'City Apartments', path: '/apartments' },
                { name: 'Beach Houses', path: '/beach-houses' },
                { name: 'Investment Opportunities', path: '/investment' }
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="group flex items-center text-white/70 hover:text-white transition-all duration-300 py-2 border-b border-white/5 hover:border-emerald-400/30"
                  >
                    <i className="fas fa-chevron-right text-xs text-emerald-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mr-3"></i>
                    <span className="group-hover:translate-x-2 transition-transform duration-300 font-light">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-element opacity-0 translate-y-8 transition-all duration-700" style={{transitionDelay: '400ms'}}>
            <h4 className="text-2xl font-semibold mb-8 pb-4 relative">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Connect
              </span>
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></span>
            </h4>
            <div className="space-y-6">
              {[
                { icon: 'fas fa-envelope', text: 'hello@nestino.com', subtext: 'Quick responses guaranteed' },
                { icon: 'fas fa-phone', text: '+1 (555) 123-4567', subtext: '24/7 Support available' },
                { icon: 'fas fa-map-marker-alt', text: '123 Luxury Avenue', subtext: 'Metropolis, MP 12345' },
                { icon: 'fas fa-clock', text: 'Mon - Sun: 9AM - 9PM', subtext: 'Extended business hours' }
              ].map((contact, index) => (
                <div key={index} className="group flex items-start gap-4 p-3 rounded-xl transition-all duration-300 hover:bg-white/5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/10">
                    <i className={`${contact.icon} text-emerald-400 text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-white font-medium">{contact.text}</p>
                    <p className="text-white/60 text-sm mt-1">{contact.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-element opacity-0 translate-y-8 transition-all duration-700" style={{transitionDelay: '600ms'}}>
            <h4 className="text-2xl font-semibold mb-8 pb-4 relative">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Stay Updated
              </span>
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></span>
            </h4>
            <p className="text-white/80 mb-6 font-light leading-relaxed">
              Get exclusive access to premium listings and market insights before anyone else.
            </p>
            
            <div className="space-y-4">
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 outline-none text-white placeholder-white/50 font-light"
                />
                <div className="absolute right-2 top-2">
                  <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-medium text-white hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
                    Subscribe
                  </button>
                </div>
              </div>
              
              <p className="text-white/60 text-xs font-light">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-6 text-white/60 text-sm font-light">
              <p>&copy; {new Date().getFullYear()} Nestino. Crafted with excellence.</p>
              <div className="flex gap-4">
                <Link to="/privacy" className="hover:text-white transition-colors duration-300">Privacy</Link>
                <Link to="/terms" className="hover:text-white transition-colors duration-300">Terms</Link>
                <Link to="/cookies" className="hover:text-white transition-colors duration-300">Cookies</Link>
              </div>
            </div>
            
            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className="group relative px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-400/30 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
              <span className="relative flex items-center gap-2 text-white/80 group-hover:text-white font-medium">
                Back to Top
                <i className="fas fa-arrow-up text-xs group-hover:translate-y-[-2px] transition-transform duration-300"></i>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .footer-element.animate {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;