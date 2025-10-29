import React, { useState, useEffect } from 'react';
import { Menu, X, Github, Linkedin, Mail, ArrowUpRight, LogIn, LogOut, Shield } from 'lucide-react';

export default function Portfolio() {
  const API_URL = 'http://localhost:3000';

  const colors = {
    beige: '#DDD0C8',
    darkGrey: '#323232',
    white: '#FAF8F7',
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    }

    // Fetch projects
    fetchProjects();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        fetchDashboard(data.token);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setDashboardData(null);
    localStorage.removeItem('token');
  };

  const fetchDashboard = async (token) => {
    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.white, color: colors.darkGrey }}>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-lg" style={{ backgroundColor: colors.white }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light" style={{ color: colors.darkGrey }}>Login</h2>
              <button onClick={() => setShowLoginModal(false)} style={{ color: colors.darkGrey }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: colors.darkGrey }}>Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border"
                  style={{ borderColor: colors.beige, backgroundColor: colors.white }}
                  placeholder="admin@portfolio.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: colors.darkGrey }}>Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border"
                  style={{ borderColor: colors.beige, backgroundColor: colors.white }}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="text-sm pt-2" style={{ color: colors.darkGrey, opacity: 0.6 }}>
                Test accounts:<br />
                Admin: admin@portfolio.com / admin123<br />
                Guest: guest@portfolio.com / guest123
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 text-sm uppercase tracking-widest font-light"
                style={{ backgroundColor: colors.darkGrey, color: colors.white }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? colors.white : 'transparent',
          borderBottom: scrolled ? `1px solid ${colors.beige}` : 'none'
        }}
      >
        <div className="container mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
          <button
            onClick={() => scrollToSection('home')}
            className="text-sm tracking-widest font-light"
            style={{ color: colors.darkGrey }}
          >
            LA
          </button>

          <div className="hidden md:flex items-center gap-8">
            {['work', 'about', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="text-base uppercase tracking-widest font-light transition-opacity"
                style={{ color: colors.darkGrey, opacity: 0.8 }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.8}
              >
                {section}
              </button>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-light" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                  {user?.name} {user?.role === 'admin' && <Shield size={14} className="inline ml-1" />}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-base uppercase tracking-widest font-light transition-opacity flex items-center gap-2"
                  style={{ color: colors.darkGrey, opacity: 0.8 }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-base uppercase tracking-widest font-light transition-opacity flex items-center gap-2"
                style={{ color: colors.darkGrey, opacity: 0.8 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
              >
                <LogIn size={16} /> Login
              </button>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: colors.darkGrey }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden" style={{ backgroundColor: colors.white, borderTop: `1px solid ${colors.beige}` }}>
            <div className="container mx-auto px-6 py-6 space-y-4">
              {['work', 'about', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block text-sm uppercase tracking-widest font-light w-full text-left"
                  style={{ color: colors.darkGrey }}
                >
                  {section}
                </button>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block text-sm uppercase tracking-widest font-light w-full text-left"
                  style={{ color: colors.darkGrey }}
                >
                  Logout ({user?.name})
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="block text-sm uppercase tracking-widest font-light w-full text-left"
                  style={{ color: colors.darkGrey }}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="home" className="min-h-screen flex items-center px-6 md:px-12">
        <div className="container mx-auto max-w-6xl py-32">
          <div className="space-y-8 max-w-4xl">
            <div className="text-sm uppercase tracking-widest font-light" style={{ color: colors.darkGrey, opacity: 0.8 }}>
              Computer Science Engineer {isAuthenticated && `· Logged in as ${user?.role}`}
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light leading-tight tracking-tight" style={{ color: colors.darkGrey }}>
              Luis Alexandre Agostinho
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed max-w-3xl" style={{ color: colors.darkGrey, opacity: 0.6 }}>
              Specializing in Cybersecurity, Artificial Intelligence, and Machine Learning solutions. Currently pursuing Master's in Computer Engineering.
            </p>
            <div className="flex flex-wrap gap-4 pt-8">
              <button
                onClick={() => scrollToSection('work')}
                className="px-8 py-4 text-sm uppercase tracking-widest font-light transition-all"
                style={{ backgroundColor: colors.darkGrey, color: colors.white }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.beige}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.darkGrey}
              >
                View Work
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 text-sm uppercase tracking-widest font-light transition-all border"
                style={{ borderColor: colors.darkGrey, color: colors.darkGrey, backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.darkGrey;
                  e.target.style.color = colors.white;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.darkGrey;
                }}
              >
                Get In Touch
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => fetchDashboard()}
                  className="px-8 py-4 text-sm uppercase tracking-widest font-light transition-all border"
                  style={{ borderColor: colors.darkGrey, color: colors.darkGrey, backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.darkGrey;
                    e.target.style.color = colors.white;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = colors.darkGrey;
                  }}
                >
                  View Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section (only visible when logged in) */}
      {isAuthenticated && dashboardData && (
        <section className="py-32 px-6 md:px-12" style={{ backgroundColor: colors.white, borderTop: `1px solid ${colors.beige}` }}>
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-sm md:text-base uppercase tracking-widest font-light mb-20" style={{ color: colors.darkGrey, opacity: 0.8 }}>
              Dashboard · {user?.role}
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="p-8" style={{ backgroundColor: colors.beige }}>
                <div className="text-5xl font-light mb-2" style={{ color: colors.darkGrey }}>
                  {dashboardData.stats.totalProjects}
                </div>
                <div className="text-sm uppercase tracking-widest" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                  Total Projects
                </div>
              </div>
              <div className="p-8" style={{ backgroundColor: colors.beige }}>
                <div className="text-5xl font-light mb-2" style={{ color: colors.darkGrey }}>
                  {dashboardData.stats.activeProjects}
                </div>
                <div className="text-sm uppercase tracking-widest" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                  Active Projects
                </div>
              </div>
              <div className="p-8" style={{ backgroundColor: colors.beige }}>
                <div className="text-5xl font-light mb-2" style={{ color: colors.darkGrey }}>
                  {dashboardData.stats.technologies}
                </div>
                <div className="text-sm uppercase tracking-widest" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                  Technologies
                </div>
              </div>
            </div>

            {user?.role === 'admin' && dashboardData.adminStats && (
              <div className="p-8 mb-8" style={{ backgroundColor: colors.beige }}>
                <h3 className="text-2xl font-light mb-6" style={{ color: colors.darkGrey }}>
                  Admin Statistics
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-light mb-1" style={{ color: colors.darkGrey }}>
                      {dashboardData.adminStats.totalUsers}
                    </div>
                    <div className="text-sm" style={{ color: colors.darkGrey, opacity: 0.7 }}>Total Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light mb-1" style={{ color: colors.darkGrey }}>
                      {dashboardData.adminStats.systemHealth}
                    </div>
                    <div className="text-sm" style={{ color: colors.darkGrey, opacity: 0.7 }}>System Health</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light mb-1" style={{ color: colors.darkGrey }}>
                      {dashboardData.adminStats.pendingReviews}
                    </div>
                    <div className="text-sm" style={{ color: colors.darkGrey, opacity: 0.7 }}>Pending Reviews</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Work */}
      <section id="work" className="py-32 px-6 md:px-12" style={{ backgroundColor: colors.beige }}>
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-sm md:text-base uppercase tracking-widest font-light mb-20" style={{ color: colors.darkGrey, opacity: 0.8 }}>
            Selected Work {projects.length > 0 && `· ${projects.length} Projects`}
          </h2>

          <div className="space-y-32">
            {projects.map((project, index) => (
              <div key={project.id} className="grid md:grid-cols-12 gap-8 md:gap-16">
                <div className="md:col-span-5 space-y-4">
                  <div className="text-sm uppercase tracking-widest font-light" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                    {project.year}
                  </div>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight" style={{ color: colors.darkGrey }}>
                    {project.title}
                  </h3>
                  <p className="text-base md:text-lg font-light" style={{ color: colors.darkGrey, opacity: 0.5 }}>
                    {project.role}
                  </p>
                </div>

                <div className="md:col-span-7 space-y-6">
                  <p className="text-xl md:text-2xl font-light leading-relaxed" style={{ color: colors.darkGrey, opacity: 0.7 }}>
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-sm md:text-base font-light px-4 py-2"
                        style={{ backgroundColor: colors.white, color: colors.darkGrey, opacity: 0.8 }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.link}
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-light transition-opacity pt-4"
                    style={{ color: colors.darkGrey, opacity: 0.5 }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                  >
                    View Project <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-32 px-6 md:px-12" style={{ backgroundColor: colors.white }}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-12 gap-16">
            <div className="md:col-span-5">
              <h2 className="text-sm md:text-base uppercase tracking-widest font-light mb-8" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                About
              </h2>
              <p className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight" style={{ color: colors.darkGrey }}>
                Building secure and intelligent systems
              </p>
            </div>

            <div className="md:col-span-7 space-y-8">
              <p className="text-xl md:text-2xl font-light leading-relaxed" style={{ color: colors.darkGrey }}>
                Computer Science Engineer with over 6 years of experience in Cybersecurity, Machine Learning, and software development. Currently pursuing Master's degree at Universidade Autónoma de Lisboa.
              </p>
              <p className="text-xl md:text-2xl font-light leading-relaxed" style={{ color: colors.darkGrey, opacity: 0.7 }}>
                Professional experience includes working at Bank of Portugal on secure interbank communication systems, developing ML-powered malware detection systems, and creating scalable web applications. Winner of the 7th Rumos Generation+ contest for best professional project nationally.
              </p>

              <div className="pt-12">
                <h3 className="text-sm md:text-base uppercase tracking-widest font-light mb-8" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                  Experience
                </h3>
                <div className="space-y-6">
                  {[
                    { title: "Web Developer", company: "Freelance", period: "2022 - 2025" },
                    { title: "Cybersecurity", company: "Bank of Portugal", period: "2022" },
                    { title: "Software Development", company: "Real Life Technologies", period: "2021" },
                    { title: "IT Engineer Associate", company: "Microcapital", period: "2019 - 2025" }
                  ].map((exp, index) => (
                    <div key={index} className="flex justify-between items-start pb-6" style={{ borderBottom: `1px solid ${colors.beige}` }}>
                      <div>
                        <div className="text-lg md:text-xl font-light" style={{ color: colors.darkGrey }}>{exp.title}</div>
                        <div className="text-base md:text-lg font-light mt-1" style={{ color: colors.darkGrey, opacity: 0.5 }}>{exp.company}</div>
                      </div>
                      <div className="text-base md:text-lg font-light" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                        {exp.period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-12">
                <h3 className="text-sm md:text-base uppercase tracking-widest font-light mb-8" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                  Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["Python", "C", "JavaScript", "HTML/CSS", "ASP.NET", "TensorFlow", "Machine Learning", "AI for Cybersecurity", "Penetration Testing", "Network Security", "System Hardening", "SQL Server", "MySQL", "Firebase", "Linux", "Windows Server", "TCP/IP"].map((skill, index) => (
                    <span
                      key={index}
                      className="text-base md:text-lg font-light px-4 py-2"
                      style={{ backgroundColor: colors.beige, color: colors.darkGrey }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 px-6 md:px-12" style={{ backgroundColor: colors.beige }}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-12 gap-16">
            <div className="md:col-span-5">
              <h2 className="text-sm md:text-base uppercase tracking-widest font-light mb-8" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                Let's Connect
              </h2>
              <p className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight" style={{ color: colors.darkGrey }}>
                Available for Cybersecurity, ML/AI Engineer and MLOps
              </p>
            </div>

            <div className="md:col-span-7 space-y-8">
              <div className="space-y-6">
                <a href="mailto:llagostinho01@gmail.com" className="group block">
                  <div className="flex items-center justify-between pb-6 transition-all" style={{ borderBottom: `1px solid ${colors.darkGrey}20` }}>
                    <div>
                      <div className="text-sm uppercase tracking-widest font-light mb-2" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                        Email
                      </div>
                      <div className="text-xl md:text-2xl font-light transition-opacity group-hover:opacity-60" style={{ color: colors.darkGrey }}>
                        llagostinho01@gmail.com
                      </div>
                    </div>
                    <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" style={{ color: colors.darkGrey, opacity: 0.8 }} />
                  </div>
                </a>

                <a href="https://www.linkedin.com/in/luisagosti" target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="flex items-center justify-between pb-6 transition-all" style={{ borderBottom: `1px solid ${colors.darkGrey}20` }}>
                    <div>
                      <div className="text-sm uppercase tracking-widest font-light mb-2" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                        LinkedIn
                      </div>
                      <div className="text-xl md:text-2xl font-light transition-opacity group-hover:opacity-60" style={{ color: colors.darkGrey }}>
                        /in/luisagosti
                      </div>
                    </div>
                    <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" style={{ color: colors.darkGrey, opacity: 0.8 }} />
                  </div>
                </a>

                <a href="https://github.com/luisagosti" target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="flex items-center justify-between pb-6 transition-all" style={{ borderBottom: `1px solid ${colors.darkGrey}20` }}>
                    <div>
                      <div className="text-sm uppercase tracking-widest font-light mb-2" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                        GitHub
                      </div>
                      <div className="text-xl md:text-2xl font-light transition-opacity group-hover:opacity-60" style={{ color: colors.darkGrey }}>
                        /luisagosti
                      </div>
                    </div>
                    <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" style={{ color: colors.darkGrey, opacity: 0.8 }} />
                  </div>
                </a>
              </div>

              <div className="pt-8">
                <div className="text-sm uppercase tracking-widest font-light" style={{ color: colors.darkGrey, opacity: 0.8 }}>
                  Location
                </div>
                <div className="text-xl md:text-2xl font-light mt-2" style={{ color: colors.darkGrey }}>
                  Lisbon, Portugal
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12" style={{ backgroundColor: colors.white, borderTop: `1px solid ${colors.beige}` }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm font-light tracking-wider" style={{ color: colors.darkGrey, opacity: 0.8 }}>
              © {new Date().getFullYear()} Luis Alexandre Agostinho
            </div>
            <div className="flex gap-8">
              <a href="mailto:llagostinho01@gmail.com" className="transition-opacity" style={{ color: colors.darkGrey, opacity: 0.8 }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.8}>
                <Mail size={18} />
              </a>
              <a href="https://www.linkedin.com/in/luisagosti" target="_blank" rel="noopener noreferrer" className="transition-opacity" style={{ color: colors.darkGrey, opacity: 0.8 }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.8}>
                <Linkedin size={18} />
              </a>
              <a href="https://github.com/luisagosti" target="_blank" rel="noopener noreferrer" className="transition-opacity" style={{ color: colors.darkGrey, opacity: 0.8 }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.8}>
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}