import React, { useState, useEffect } from 'react';
import { Target, Zap, Send, CheckCircle, XCircle, AlertTriangle, MessageSquare, Anchor, ShieldAlert } from 'lucide-react';
import { fetchDeepSeekChat, PMO_PLAN_PROMPT, PMO_FEEDBACK_PROMPT } from '../api';

const CareerPath = () => {
  const [plan, setPlan] = useState(null);
  const [taskData, setTaskData] = useState({}); // { "0-1": { status: 'pass', feedback: '...' } }
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [errorPlan, setErrorPlan] = useState('');

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null); // "wIdx-tIdx"
  const [reportInput, setReportInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    const savedPlan = localStorage.getItem('career_companion_pmo_plan');
    const savedTasks = localStorage.getItem('career_companion_pmo_tasks');
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedTasks) setTaskData(JSON.parse(savedTasks));
  }, []);

  const handleGeneratePlan = async () => {
    if (!goalInput.trim()) {
      setErrorPlan("目标不能为空，你难道连目标都不明确吗？");
      return;
    }
    setIsGenerating(true);
    setErrorPlan('');
    
    try {
      const messages = [
        { role: 'system', content: PMO_PLAN_PROMPT },
        { role: 'user', content: `我的目标是：${goalInput}` }
      ];
      const response = await fetchDeepSeekChat(messages, { temperature: 0.8 });
      const cleanJsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const newPlan = JSON.parse(cleanJsonStr);
      
      setPlan(newPlan);
      setTaskData({});
      localStorage.setItem('career_companion_pmo_plan', JSON.stringify(newPlan));
      localStorage.setItem('career_companion_pmo_tasks', JSON.stringify({}));
    } catch (err) {
      console.error(err);
      setErrorPlan(err.message || 'PMO 繁忙，拒绝了你的请求。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetPlan = () => {
    if(window.confirm('放弃当前战役？这将抹除所有记录，懦夫的行为。确认吗？')) {
      setPlan(null);
      setTaskData({});
      setSelectedTaskIndex(null);
      localStorage.removeItem('career_companion_pmo_plan');
      localStorage.removeItem('career_companion_pmo_tasks');
    }
  };

  const handleSubmitReport = async () => {
    if (!reportInput.trim()) return;
    if (!selectedTaskIndex) return;

    setIsSubmitting(true);
    setReportError('');

    const [wIdx, tIdx] = selectedTaskIndex.split('-');
    const taskText = plan.weeks[wIdx].tasks[tIdx];

    try {
      const messages = [
        { role: 'system', content: PMO_FEEDBACK_PROMPT },
        { role: 'user', content: `【目标任务】：${taskText}\n【求职者汇报】：${reportInput}` }
      ];
      const response = await fetchDeepSeekChat(messages, { temperature: 0.7 });
      const cleanJsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const feedbackObj = JSON.parse(cleanJsonStr);

      const newTaskData = {
        ...taskData,
        [selectedTaskIndex]: feedbackObj
      };
      
      setTaskData(newTaskData);
      localStorage.setItem('career_companion_pmo_tasks', JSON.stringify(newTaskData));
      setReportInput('');
    } catch (err) {
      console.error(err);
      setReportError(err.message || '你网络断了，PMO 接受不到汇报。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plan) {
    return (
      <div className="flex-col h-full animate-fade-in items-center justify-center p-6">
        <div className="glass-panel max-w-2xl w-full p-10 flex-col items-center text-center relative overflow-hidden bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
            <ShieldAlert size={64} className="text-error mb-6" />
            <h1 className="text-3xl font-black mb-4 text-primary tracking-tight">PMO 铁血作战指挥部</h1>
            <p className="text-secondary text-lg mb-8 font-medium">
              向我输入你的野心。我会用最无情的方式，把它拆成让你感到痛苦但也最高效的作战计划。
            </p>
            
            <div className="w-full flex-col gap-4">
              <input 
                 className="input-glass w-full text-lg p-4 shadow-sm" 
                 placeholder="输入你的大目标，例如：1个月内拿下字节跳动核心业务线精英 Offer"
                 value={goalInput}
                 onChange={(e) => setGoalInput(e.target.value)}
                 disabled={isGenerating}
              />
              <button 
                className="btn-primary w-full justify-center p-4 text-lg font-bold bg-error hover:bg-red-600 border-red-200 text-white shadow-md active:scale-[0.98] transition-all"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex-row items-center gap-2"><Zap className="animate-spin" size={22} /> 拆解幻境中...</span>
                ) : (
                  <span className="flex-row items-center gap-2">接受 PMO 指派 <Target size={22} /></span>
                )}
              </button>
              {errorPlan && <div className="text-error text-sm mt-2 font-medium bg-red-50 p-2 rounded">{errorPlan}</div>}
            </div>
        </div>
      </div>
    );
  }

  const selectedTaskMeta = selectedTaskIndex ? (() => {
      const [wIdx, tIdx] = selectedTaskIndex.split('-');
      return plan.weeks[wIdx].tasks[tIdx];
  })() : null;

  const currentTaskData = selectedTaskIndex ? taskData[selectedTaskIndex] : null;

  return (
    <div className="flex-col h-full animate-fade-in" style={{ height: 'calc(100vh - 6rem)', overflow: 'hidden' }}>
      
      {/* Header */}
      <header className="mb-4 shrink-0 flex justify-between items-end pb-4 border-b border-slate-200">
        <div>
            <h1 className="text-2xl flex items-center gap-3 font-black text-primary mb-2 tracking-tight">
            <Anchor className="text-error" size={26} /> {plan.title}
            </h1>
            <p className="text-[0.95rem] text-slate-600 max-w-3xl italic font-medium">"{plan.pmo_comment}"</p>
        </div>
        <button onClick={handleResetPlan} className="text-xs text-secondary hover:text-error hover:bg-red-50 transition-colors px-3 py-1.5 rounded font-bold border border-slate-200 hover:border-red-200 bg-white">
            终止战役
        </button>
      </header>

      <div className="flex-row flex-col-mobile gap-6 flex-1 min-h-0">
        
        {/* Left Panel: Plan Tree */}
        <div className="glass-panel flex-col w-full-mobile h-full overflow-y-auto hide-scrollbar shadow-sm" style={{ flex: '1', padding: '1.5rem', minWidth: '320px', backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <h3 className="text-lg font-bold text-accent mb-6 flex items-center gap-2">
                <Target size={20} /> 任务拆解阵列
            </h3>
            
            <div className="flex-col gap-6 relative ml-3 border-l-2 border-slate-200 pl-4 mt-2">
                {plan.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="relative">
                        <div className="absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-white shadow-sm"></div>
                        <h4 className="text-primary font-bold mb-3">{week.week_name}</h4>
                        <div className="flex-col gap-2">
                            {week.tasks.map((task, tIdx) => {
                                const indexStr = `${wIdx}-${tIdx}`;
                                const tData = taskData[indexStr];
                                const isSelected = selectedTaskIndex === indexStr;
                                const isPass = tData?.status === 'pass';
                                const isRejected = tData?.status === 'rejected';

                                return (
                                    <div 
                                        key={tIdx}
                                        onClick={() => setSelectedTaskIndex(indexStr)}
                                        className={`p-3 rounded-xl border text-[0.95rem] cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden
                                            ${isSelected ? 'bg-white border-accent shadow-[0_4px_12px_rgba(139,92,246,0.1)]' : 'bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white'}
                                            ${isPass ? 'opacity-50' : ''}
                                        `}
                                    >
                                        <div className="mt-0.5 shrink-0 z-10">
                                            {isPass ? <CheckCircle size={18} className="text-success" /> : 
                                             isRejected ? <XCircle size={18} className="text-error" /> :
                                             <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300" />}
                                        </div>
                                        <span className={`leading-relaxed font-medium z-10 ${isPass ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                            {task}
                                        </span>
                                        {isSelected && <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Panel: PMO Chat / Report */}
        <div className="glass-panel flex-col w-full-mobile h-full shadow-sm" style={{ flex: '1.2', padding: 0, minWidth: '320px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.85)' }}>
            <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur font-bold text-primary flex items-center gap-2 shrink-0">
                <MessageSquare size={18} className="text-accent" /> 汇报与审阅
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex-col">
                {!selectedTaskIndex ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-70">
                        <Target size={56} className="mb-4 text-slate-300" />
                        <p className="text-secondary font-medium">在左侧选中一个颗粒度任务，向我汇报进度。</p>
                    </div>
                ) : (
                    <div className="flex-col gap-6 animate-fade-in-up">
                        {/* Task specific header */}
                        <div className="bg-white shadow-sm border border-slate-200 p-5 rounded-xl border-l-4 border-l-accent">
                            <h5 className="text-[0.75rem] text-accent uppercase font-black mb-1.5 tracking-wider">当前对齐目标</h5>
                            <p className="text-primary font-bold leading-relaxed">{selectedTaskMeta}</p>
                        </div>

                        {/* Existing Feedback */}
                        {currentTaskData && (
                            <div className={`p-5 rounded-xl border shadow-sm ${currentTaskData.status === 'pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                                    {currentTaskData.status === 'pass' ? 
                                        <><CheckCircle size={18} className="text-success" /> <span className="text-success">PMO 审阅通过</span></> : 
                                        <><XCircle size={18} className="text-error" /> <span className="text-error">PMO 怒斥并驳回</span></>}
                                </div>
                                <p className="text-primary leading-relaxed font-medium">
                                    "{currentTaskData.feedback_text}"
                                </p>
                            </div>
                        )}
                        
                        {/* Input Area */}
                        {currentTaskData?.status !== 'pass' && (
                            <div className="mt-2 flex-col gap-3">
                                <label className="text-[0.75rem] text-secondary font-black uppercase tracking-wider">提交执行成果 / 进度：</label>
                                <textarea 
                                    className="input-glass w-full min-h-[140px] resize-none text-[0.95rem] p-4 shadow-sm"
                                    placeholder="以结果导向告诉我你做了什么。如不符合预期，准备迎接狂风暴雨。"
                                    value={reportInput}
                                    onChange={e => setReportInput(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-error text-[0.8rem] font-bold">{reportError}</span>
                                    <button 
                                        className="btn-primary px-6 py-2.5 text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all font-bold"
                                        onClick={handleSubmitReport}
                                        disabled={isSubmitting || !reportInput.trim()}
                                    >
                                        {isSubmitting ? <span className="animate-spin">◷</span> : <Send size={16} />}
                                        提交汇报
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPath;
