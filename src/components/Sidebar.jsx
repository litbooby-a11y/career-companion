import React from 'react';
import { LayoutDashboard, FileText, Mic, Target, Zap, Radar } from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: '工作台', icon: <LayoutDashboard size={22} /> },
    { id: 'resume', label: '简历问诊室', icon: <FileText size={22} /> },
    { id: 'assessor', label: '岗位雷达', icon: <Radar size={22} /> },
    { id: 'interview', label: '高压面试场', icon: <Mic size={22} /> },
    { id: 'career', label: '成长陪伴', icon: <Target size={22} /> }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="glass-panel flex-col desktop-only" style={{ width: '280px', margin: '1.5rem', height: 'calc(100vh - 3rem)', padding: '2rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <div className="flex-row gap-3 mb-10" style={{ padding: '0 0.5rem' }}>
          <div style={{ background: 'var(--surface-color)', boxShadow: 'var(--shadow-sm)', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
            <Zap size={24} color="var(--accent-primary)" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="text-gradient">Career AI</h2>
        </div>
        
        <div className="flex-col gap-3 flex-grow" style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Menu</div>
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--surface-border-highlight)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  width: '100%',
                  fontWeight: isActive ? '700' : '500',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  textAlign: 'left',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--surface-color-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', transition: 'color var(--transition-normal)' }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)', marginTop: 'auto', border: '1px solid var(--surface-border)' }}>
          <div className="flex-row gap-4 items-center">
            <div style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0, #f8fafc)', boxShadow: 'var(--shadow-sm)', border: '2px solid rgba(255,255,255,0.8)' }}></div>
            <div className="flex-col">
              <span style={{ fontWeight: 600, fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Alex L.</span>
              <span style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>Pro Plan Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '75px',
        background: 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--surface-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 0.5rem',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50
      }}>
        {navItems.map(item => {
          const isActive = currentPage === item.id;
          return (
             <button
              key={`mobile-${item.id}`}
              onClick={() => onNavigate(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                padding: '0.5rem',
                width: '64px',
                transition: 'all var(--transition-normal)',
                transform: isActive ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}>
                <span style={{ 
                  color: 'inherit',
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))' : 'none' 
                }}>
                  {item.icon}
                </span>
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-primary)' : 'inherit'
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  );
};

export default Sidebar;
