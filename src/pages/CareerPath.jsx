import React from 'react';
import { Target, TrendingUp, BookOpen, Award, CheckCircle } from 'lucide-react';

const CareerPath = () => {
  return (
    <div className="flex-col h-full animate-fade-in" style={{ height: '100%', overflowY: 'auto', paddingRight: '1rem' }}>
      <header className="mb-8 animate-fade-in-up delay-100">
        <h1 className="flex-row gap-4 mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
          <span className="text-gradient">产品经理成长路线图</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>基于你的背景动态生成的晋升路径，清晰对齐下一阶段能力模型。</p>
      </header>

      <div className="flex-row gap-6 mb-8 animate-fade-in-up delay-200" style={{ flexWrap: 'wrap' }}>
        <div className="glass-panel flex-row gap-4 items-center" style={{ padding: '1.5rem', flex: 1, minWidth: '300px' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', border: '1px solid rgba(139, 92, 246, 0.2)', boxShadow: 'var(--glow-primary)' }}>
            <Target size={32} color="#c4b5fd" />
          </div>
          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>当前职级定位</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>P6 / 高级产品经理</span>
          </div>
        </div>

        <div className="glass-panel flex-row gap-4 items-center" style={{ padding: '1.5rem', flex: 1, minWidth: '300px' }}>
          <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.2)', boxShadow: 'var(--glow-secondary)' }}>
            <TrendingUp size={32} color="#67e8f9" />
          </div>
          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>下阶段冲击目标</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>P7 / 资深/产品专家</span>
          </div>
        </div>
      </div>

      <div className="glass-panel animate-fade-in-up delay-300" style={{ padding: '2rem' }}>
        <h3 className="mb-6 flex-row gap-2 items-center" style={{ fontSize: '1.25rem' }}>
          <Award size={22} color="var(--warning)" /> P6 到 P7 核心跨越必修课
        </h3>

        <div className="flex-col gap-6 relative" style={{ paddingLeft: '2.5rem' }}>
          {/* Vertical timeline line */}
          <div style={{ position: 'absolute', left: '0.75rem', top: '0', bottom: '0', width: '2px', background: 'var(--surface-border-highlight)' }}></div>

          {/* Module 1 */}
          <div className="relative">
            <div style={{ position: 'absolute', left: '-2.5rem', top: '0', background: 'var(--bg-base)', padding: '0.25rem' }}>
              <CheckCircle size={24} color="var(--success)" fill="rgba(16,185,129,0.2)" />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>阶段一：从“执行落地”到“策略推演”</h4>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>不再仅仅是“怎么把功能做出来”，而是“为什么做这个？不做行不行？做了能带来多少商业价值增量？”</p>
              <div className="flex-row gap-2 flex-wrap">
                <span className="badge badge-success">商业模式画布</span>
                <span className="badge badge-success">投入产出比 (ROI) 测算</span>
                <span className="badge badge-success">北极星指标拆解</span>
              </div>
            </div>
          </div>

          {/* Module 2 */}
          <div className="relative">
            <div style={{ position: 'absolute', left: '-2.5rem', top: '0', background: 'var(--bg-base)', padding: '0.25rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-primary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></div>
              </div>
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>阶段二：复杂项目统筹与横向影响力 (当前卡点)</h4>
            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'inset 0 0 10px rgba(139,92,246,0.05)' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>P7 需要主导跨团队的复杂战役，协调端到端资源。你目前的简历中缺乏横向拉通 3 个以上跨部门团队的成功案例。</p>
              <div className="flex-row gap-2 flex-wrap mb-4">
                <span className="badge">跨越部门墙利益博弈</span>
                <span className="badge">资源争取与向上管理</span>
                <span className="badge">危机熔断机制设计</span>
              </div>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                去面试场进行【跨部门冲突】抗压演练
              </button>
            </div>
          </div>

          {/* Module 3 */}
          <div className="relative">
             <div style={{ position: 'absolute', left: '-2.5rem', top: '0', background: 'var(--bg-base)', padding: '0.25rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--surface-border-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              </div>
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>阶段三：业务破局点寻找与第二曲线</h4>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--surface-border)', padding: '1.25rem', borderRadius: 'var(--radius-md)', opacity: 0.6 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>在存量业务中寻找结构性增量，或者从 0 到 1 孵化创新业务线闭环。</p>
              <div className="flex-row gap-2 flex-wrap">
                <span className="badge" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }}>行业宏观趋势判断</span>
                <span className="badge" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }}>第二曲线孵化</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CareerPath;
