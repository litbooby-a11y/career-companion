import React, { useState, useEffect } from 'react';
import { ArrowRight, Trash2, ChevronRight, Bookmark, MessageSquare, MessagesSquare, Calendar, Award, FileText, Radar, Play } from 'lucide-react';

const STAGES = [
  { id: 'status_matched', title: '智能生厂商', icon: <Bookmark size={18} />, colorClass: 'text-primary' },
  { id: 'status_icebreaker', title: '已发破冰语', icon: <MessageSquare size={18} />, colorClass: 'text-accent' },
  { id: 'status_chatting', title: '深度沟通中', icon: <MessagesSquare size={18} />, colorClass: 'text-warning' },
  { id: 'status_interview', title: '进入面阵', icon: <Award size={18} />, colorClass: 'text-success' }
];

const Dashboard = ({ onNavigate }) => {
  const [pipeline, setPipeline] = useState([]);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = () => {
    const data = localStorage.getItem('career_companion_pipeline');
    if (data) {
      setPipeline(JSON.parse(data));
    }
  };

  const updateStatus = (id, currentStatus) => {
    const stageIndex = STAGES.findIndex(s => s.id === currentStatus);
    if (stageIndex >= 0 && stageIndex < STAGES.length - 1) {
      const newStatus = STAGES[stageIndex + 1].id;
      const newPipeline = pipeline.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      );
      setPipeline(newPipeline);
      localStorage.setItem('career_companion_pipeline', JSON.stringify(newPipeline));
    }
  };

  const deleteItem = (id) => {
    const newPipeline = pipeline.filter(item => item.id !== id);
    setPipeline(newPipeline);
    localStorage.setItem('career_companion_pipeline', JSON.stringify(newPipeline));
  };

  const getCardsByStatus = (statusId) => {
    return pipeline.filter(item => item.status === statusId);
  };

  const getScoreColor = (score) => {
    if (['A', 'B'].includes(score)) return 'bg-success/10 text-success border-success/20';
    if (['C', 'D'].includes(score)) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-error/10 text-error border-error/20';
  };

  return (
    <div className="flex-col h-full animate-fade-in" style={{ height: 'calc(100vh - 6rem)', minHeight: '600px' }}>
      <header className="mb-6 delay-100 animate-fade-in-up shrink-0">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.03em', fontWeight: 800 }}>
          私域求职漏斗 <span className="text-gradient">看板</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: '1.05rem' }}>高维度追踪你的每一个 A 级岗位沟通节点。</p>
      </header>

      {pipeline.length === 0 ? (
        <div className="flex-col flex-1 items-center justify-center animate-fade-in-up delay-200 mt-4">
            <div className="glass-panel w-full max-w-4xl p-8 rounded-2xl flex-col gap-8 relative overflow-hidden bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-success"></div>
                
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-primary mb-3">开启你的反海投生涯</h2>
                    <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
                        你的求职漏斗目前空空如也，因为我们主张“宁缺毋滥”。<br/>
                        通过 Career-Ops 思想过滤毒性企业，按以下三步走建立你的专属精兵库：
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <div className="hidden md:block absolute top-[45%] left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10"></div>
                    
                    <div className="bg-white/60 border border-slate-200/60 rounded-xl p-6 flex-col items-center text-center hover:bg-white shadow-sm transition-all group">
                        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform">
                            <FileText size={28} />
                        </div>
                        <h3 className="font-bold text-primary mb-2">Step 1. 建立底座</h3>
                        <p className="text-sm text-secondary mb-6 flex-1">
                            前往「简历问诊室」进行 X 光体检，并由本地系统沉淀你的核心履历。
                        </p>
                        <button className="btn-secondary w-full justify-center text-sm" onClick={() => onNavigate('resume')}>
                            前往建立底座 <ArrowRight size={14} className="ml-1" />
                        </button>
                    </div>

                    <div className="bg-white/60 border border-slate-200/60 rounded-xl p-6 flex-col items-center text-center hover:bg-white shadow-sm transition-all group">
                        <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-4 text-cyan-600 group-hover:scale-110 transition-transform">
                            <Radar size={28} />
                        </div>
                        <h3 className="font-bold text-primary mb-2">Step 2. 雷达挂载</h3>
                        <p className="text-sm text-secondary mb-6 flex-1">
                            将拉勾、Boss 上的 JD 贴入「岗位雷达」，测算出 A 级岗位并获取搭讪文案。
                        </p>
                        <button className="btn-secondary w-full justify-center text-sm" onClick={() => onNavigate('assessor')}>
                            启动岗位雷达 <ArrowRight size={14} className="ml-1" />
                        </button>
                    </div>

                    <div className="bg-white/60 border border-slate-200/60 rounded-xl p-6 flex-col items-center text-center hover:bg-white shadow-sm transition-all group">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                            <Play size={28} />
                        </div>
                        <h3 className="font-bold text-primary mb-2">Step 3. Kanban 追踪</h3>
                        <p className="text-sm text-secondary mb-6 flex-1">
                            将通过甄选的高得分岗位归档至此漏斗中，持续纵深跟进你的流转节点。
                        </p>
                        <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 w-full inline-block font-semibold">
                            目前处于此步骤
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="flex flex-row overflow-x-auto gap-4 pb-4 animate-fade-in-up delay-200 flex-1 hide-scrollbar" style={{ minHeight: '400px' }}>
          
          {STAGES.map((stage, sIdx) => {
            const cards = getCardsByStatus(stage.id);
            
            return (
              <div key={stage.id} className="flex-col glass-panel shrink-0 shadow-sm" style={{ width: '320px', padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid var(--surface-border)' }}>
                {/* Column Header */}
                <div className="flex-row justify-between items-center mb-5 pb-3 border-b border-slate-200">
                  <div className={`flex-row items-center gap-2 font-bold ${stage.colorClass}`}>
                    {stage.icon}
                    <span>{stage.title}</span>
                  </div>
                  <div className="bg-white shadow-sm border border-slate-100 text-xs px-2 py-1 rounded-full text-secondary font-bold">
                    {cards.length}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-col gap-3 overflow-y-auto pr-1 flex-1 hide-scrollbar" style={{ paddingBottom: '1rem' }}>
                  {cards.length === 0 ? (
                    <div className="flex-col items-center justify-center py-8 opacity-60">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <span className="text-slate-400">{stage.icon}</span>
                      </div>
                      <span className="text-slate-400 text-sm font-medium">空空如也</span>
                    </div>
                  ) : (
                    cards.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all group relative">
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => deleteItem(item.id)} className="text-error/60 hover:text-error p-1.5 bg-red-50 rounded-md transition-colors">
                                  <Trash2 size={14} />
                              </button>
                          </div>
                          
                          <div className="flex justify-between items-start mb-2 pr-6">
                              <h4 className="font-bold text-primary text-[0.95rem] truncate" title={item.title}>{item.title}</h4>
                          </div>
                          
                          <div className="flex gap-2 mb-4 mt-1">
                              <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border ${getScoreColor(item.score)}`}>
                                  评级 {item.score}
                              </span>
                              <span className="text-[0.65rem] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 truncate font-medium" title={item.verdict}>
                                  {item.verdict}
                              </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-secondary mt-auto pt-3 border-t border-slate-100">
                              <span className="text-[0.7rem] text-slate-500 font-medium">{new Date(item.timestamp).toLocaleDateString()}</span>
                              
                              {sIdx < STAGES.length - 1 && (
                                  <button 
                                      className="flex items-center gap-1 text-accent font-semibold hover:text-white bg-purple-50 hover:bg-accent px-2.5 py-1 rounded-md transition-colors border border-purple-100 hover:border-accent"
                                      onClick={() => updateStatus(item.id, item.status)}
                                  >
                                      推进 <ChevronRight size={12} />
                                  </button>
                              )}
                              {sIdx === STAGES.length - 1 && (
                                  <span className="flex items-center gap-1 text-success font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
                                      <Award size={12} /> 待突围
                                  </span>
                              )}
                          </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
