import React from 'react';
import { ArrowRight, FileText, Mic, Briefcase } from 'lucide-react';

const StatCard = ({ title, value, label, icon, delayClass }) => (
  <div className={`glass-panel flex-col justify-between animate-fade-in-up ${delayClass} flex-1`} style={{ padding: '1.75rem' }}>
    <div className="flex-row justify-between mb-6">
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-heading)' }}>{title}</span>
      <div style={{ padding: '0.65rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
        {icon}
      </div>
    </div>
    <div className="flex-col gap-2">
      <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)', fontWeight: 500 }}>{label}</span>
    </div>
  </div>
);

const Dashboard = ({ onNavigate }) => {
  return (
    <div className="flex-col h-full animate-fade-in">
      <header className="mb-8 delay-100 animate-fade-in-up">
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          欢迎回来, <span className="text-gradient">Alex</span>
        </h1>
        <p style={{ fontSize: '1.15rem' }}>今天准备好冲击大厂 Offer 了吗？</p>
      </header>

      <div className="flex-row flex-col-mobile gap-6 w-full mb-8">
        <StatCard title="已诊断简历" value="3" label="+1 份待完善" icon={<FileText size={24} />} delayClass="delay-100" />
        <StatCard title="高压面试模拟" value="12" label="平均得分: 85/100" icon={<Mic size={24} />} delayClass="delay-200" />
        <StatCard title="目标投递靶向" value="5" label="2 家已进入二面" icon={<Briefcase size={24} />} delayClass="delay-300" />
      </div>

      <div className="glass-panel animate-fade-in-up delay-300" style={{ padding: '2.5rem' }}>
        <h3 className="mb-6" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🔥</span> 核心训练推荐
        </h3>
        <div className="flex-row flex-col-mobile gap-6">
          <div className="flex-col flex-1" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', transition: 'transform 0.3s ease, background 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
            <div className="badge badge-warning mb-4" style={{ width: 'fit-content' }}>高优先级</div>
            <h4 className="mb-3" style={{ fontSize: '1.25rem' }}>资深产品简历急救版</h4>
            <p className="mb-6 flex-1" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>发现你上次上传的简历缺少核心转化率指标，建议立即重构【商业化项目】段落，以匹配目标岗位 JD。</p>
            <button className="btn-primary" style={{ width: 'fit-content' }} onClick={() => onNavigate('resume')}>
              立即问诊 <ArrowRight size={18} />
            </button>
          </div>

          <div className="flex-col flex-1" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', transition: 'transform 0.3s ease, background 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
            <div className="badge badge-success mb-4" style={{ width: 'fit-content' }}>为你定制</div>
            <h4 className="mb-3" style={{ fontSize: '1.25rem' }}>字节跳动-商业化PM模拟</h4>
            <p className="mb-6 flex-1" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>根据你近期的偏好，我们为你准备了字节最新的商业化产品面试真题，立刻开始抗压测试，提升临场反应。</p>
            <button className="btn-secondary" style={{ width: 'fit-content', color: 'var(--accent-secondary)' }} onClick={() => onNavigate('interview')}>
              开始挑战 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
