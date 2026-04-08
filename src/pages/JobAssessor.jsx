import React, { useState, useEffect } from 'react';
import { Radar, Target, MessageSquare, Zap, AlertTriangle, CheckCircle, Copy, Award, Shield, FileText, BookmarkPlus } from 'lucide-react';
import { fetchDeepSeekChat, JOB_ASSESSOR_PROMPT, ICEBREAKER_PROMPT } from '../api';

const JobAssessor = () => {
  const [jdText, setJdText] = useState('');
  const [resumeContext, setResumeContext] = useState('');
  
  // States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState('');

  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [icebreakerResult, setIcebreakerResult] = useState(null);
  const [icebreakerError, setIcebreakerError] = useState('');

  const [copySuccess, setCopySuccess] = useState(false);
  
  // Save to Tracker States
  const [isSaving, setIsSaving] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [saveComplete, setSaveComplete] = useState(false);

  // Auto-Fire Control
  const [autoFireReq, setAutoFireReq] = useState(null);

  useEffect(() => {
    // 载入基础简历数据
    const savedResume = localStorage.getItem('career_companion_resume_context');
    if (savedResume) {
      setResumeContext(savedResume);
    }

    // ========== 插件自动化打通核心逻辑 ==========
    
    // 1. 检查遗留 localStorage (比如由于浏览器新开 Tab 导致)
    const consumeStoredJd = () => {
      const incomingJd = localStorage.getItem('career_companion_incoming_jd');
      if (incomingJd) {
        setJdText(incomingJd);
        localStorage.removeItem('career_companion_incoming_jd');
        setAutoFireReq(incomingJd);
      }
    };
    consumeStoredJd();

    // 2. 监听事件 (插件将触发这个 Context)
    const handleExtensionData = (e) => {
      const newJd = e.detail;
      setJdText(newJd);
      localStorage.removeItem('career_companion_incoming_jd'); // 清理防止重复
      setAutoFireReq(newJd);
    };

    window.addEventListener('extension_jd_received', handleExtensionData);
    
    return () => {
      window.removeEventListener('extension_jd_received', handleExtensionData);
    };
  }, []);

  // 当 autoFireReq 与 resumeContext 备齐时，自动启动！
  useEffect(() => {
    if (autoFireReq && resumeContext) {
      console.log("⚡ [Automation] Extracted JD and Resume detected, auto-firing Evaluation!");
      handleEvaluateDirect(autoFireReq, resumeContext);
      setAutoFireReq(null); // Consume
    } else if (autoFireReq && !resumeContext) {
      setEvalError("🚨 已从 Boss 直聘自动穿透捕获 JD，但本地系统尚未载入您的【简历基础】。请先前往简历问诊室挂载 PDF！");
      setAutoFireReq(null);
    }
  }, [autoFireReq, resumeContext]);

  // 分离出的直接运行核心，避免被 state 异步困扰
  const handleEvaluateDirect = async (currentJdText, currentResumeContext) => {
    setIsEvaluating(true);
    setEvalError('');
    setEvalResult(null);
    setIcebreakerResult(null);
    setIcebreakerError('');

    try {
      const messages = [
        { role: 'system', content: JOB_ASSESSOR_PROMPT },
        { role: 'user', content: `【求职者当前简历详情】：\n${currentResumeContext.substring(0, 10000)}\n\n【目标岗位 JD 说明】：\n${currentJdText}` }
      ];

      const responseText = await fetchDeepSeekChat(messages, { temperature: 0.7 });
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);
      
      setEvalResult(parsed);

      // 如果判断是好职位（A或B），紧接着自动生成破冰！真正的一键式！
      if (['A', 'B'].includes(parsed.score)) {
        handleGenerateIcebreakerDirect(currentJdText, currentResumeContext);
      }
    } catch (err) {
      console.error(err);
      setEvalError(err.message || '评估失败，请检查网络或 API Key 设置。');
    } finally {
      setIsEvaluating(false);
    }
  };

  // 分离出来的生成破冰语函数，支持自动化连携调用
  const handleGenerateIcebreakerDirect = async (currentJdText, currentResumeContext) => {
    setIsGeneratingIcebreaker(true);
    setIcebreakerError('');

    try {
      const messages = [
        { role: 'system', content: ICEBREAKER_PROMPT },
        { role: 'user', content: `【求职者简历】：\n${currentResumeContext.substring(0, 8000)}\n\n【目标岗位 JD】：\n${currentJdText}` }
      ];

      const responseText = await fetchDeepSeekChat(messages, { temperature: 0.8 });
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);
      
      setIcebreakerResult(parsed);
    } catch (err) {
      console.error(err);
      setIcebreakerError(err.message || '生成搭讪话术失败。');
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  // 手动触发入口
  const handleEvaluateClick = () => {
    if (!jdText.trim()) {
      setEvalError('请先粘贴岗位 JD 说明，或者去安装插件实现自动提取。');
      return;
    }
    if (!resumeContext) {
      setEvalError('未检测到您的基础简历数据。请先在【简历问诊室】上传简历PDF。');
      return;
    }
    handleEvaluateDirect(jdText, resumeContext);
  };

  const handleGenerateIcebreakerClick = () => {
    handleGenerateIcebreakerDirect(jdText, resumeContext);
  };

  const handleSaveToTracker = () => {
    if (!jobTitleInput.trim()) return;

    try {
      const existingData = localStorage.getItem('career_companion_pipeline');
      let pipeline = existingData ? JSON.parse(existingData) : [];
      
      pipeline.push({
        id: Date.now().toString(),
        title: jobTitleInput.trim(),
        score: evalResult.score,
        verdict: evalResult.verdict,
        status: 'status_matched', // Initial status
        timestamp: new Date().toISOString()
      });

      localStorage.setItem('career_companion_pipeline', JSON.stringify(pipeline));
      setSaveComplete(true);
      setTimeout(() => { setIsSaving(false); setSaveComplete(false); setJobTitleInput(''); }, 3000);
    } catch(err) {
      console.error('Failed to save to tracker', err);
    }
  };

  const copyToClipboard = () => {
    if (icebreakerResult && icebreakerResult.icebreaker) {
      navigator.clipboard.writeText(icebreakerResult.icebreaker);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getScoreColor = (score) => {
    if (['A', 'B'].includes(score)) return 'text-success border-emerald-200 bg-emerald-50';
    if (['C', 'D'].includes(score)) return 'text-warning border-orange-200 bg-orange-50';
    return 'text-error border-red-200 bg-red-50';
  };
  
  const getScoreColorText = (score) => {
    if (['A', 'B'].includes(score)) return 'text-success';
    if (['C', 'D'].includes(score)) return 'text-warning';
    return 'text-error';
  }

  return (
    <div className="flex-col animate-fade-in h-screen-overflow">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="flex-row gap-4 mb-2 text-3xl font-bold tracking-tight">
            <span className="text-gradient">岗位雷达自动化</span>
          </h1>
          <p className="text-secondary text-lg font-medium">配合专属 Chrome 插件，实现 Boss JD 一键穿透提取 & 回复自动化。</p>
        </div>
      </header>

      {!resumeContext && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-warning shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-orange-700 font-bold mb-1">未检测到基础简历，自动化链路阻断</h4>
            <p className="text-sm text-orange-600 font-medium">
              我们需要您的简历数据才能进行自动化匹配度评估。请前往左侧菜单的 <strong className="text-orange-800">简历问诊室</strong> 上传简历！
            </p>
          </div>
        </div>
      )}

      <div className="flex-row flex-col-mobile gap-6" style={{ flex: 1, minHeight: 0 }}>
        
        {/* Left Panel - Input */}
        <div className="glass-panel flex-col w-full-mobile h-full shadow-sm" style={{ flex: '1', padding: '2rem', display: 'flex', minWidth: '320px', overflowY: 'auto', backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <h3 className="mb-4 flex-row gap-2 items-center text-primary text-xl font-bold">
                <Radar size={22} color="var(--accent-primary)" /> 本地目标 JD 注入点
            </h3>
            
            <p className="text-xs text-secondary mb-3 flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-500" /> 支持手动或 Chrome 插件全自动提取直链
            </p>

            <textarea
                className="input-glass"
                style={{ flex: 1, resize: 'none', marginBottom: '1.5rem', fontSize: '0.95rem', minHeight: '300px' }}
                placeholder="等待 Chrome 插件拦截信号，或手动粘贴 Boss、拉勾等平台的岗位职责..."
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                disabled={!resumeContext}
            ></textarea>

            <button 
                className="btn-primary w-full justify-center p-4 text-lg shadow-sm" 
                onClick={handleEvaluateClick} 
                disabled={isEvaluating || !jdText.trim() || !resumeContext}
            >
                {isEvaluating ? (
                <span className="flex-row gap-2 items-center"><Zap className="animate-spin" size={22} /> AI 总监正在进行双轨分析...</span>
                ) : (
                <span className="flex-row gap-2 items-center"><Zap size={22} /> 执行测算打穿此岗</span>
                )}
            </button>

            {evalError && (
                <div className="mt-4 p-3 bg-red-50 text-error rounded-xl text-sm border border-red-100 font-medium">
                    <AlertTriangle size={16} className="inline mr-2 -mt-0.5"/> {evalError}
                </div>
            )}
        </div>

        {/* Right Panel - Results */}
        <div className="glass-panel flex-col w-full-mobile h-full shadow-sm" style={{ flex: '1.2', padding: '0', display: 'flex', overflowY: 'auto', minWidth: '320px', backgroundColor: 'rgba(255,255,255,0.85)' }}>
          
          <div className="p-8 pb-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-200">
            <h3 className="flex-row gap-2 items-center text-xl text-primary font-bold">
                <Target size={22} className="text-accent" /> 
                {evalResult ? '自动化诊断与输出' : '等候雷达信号指令'}
            </h3>
          </div>

          <div className="p-8 pt-6 flex-1 flex-col transition-all">
            {!evalResult && !isEvaluating && (
              <div className="flex-col flex-grow items-center justify-center animate-pulse-slow h-full opacity-60">
                <Radar size={56} className="mb-4 text-slate-300" />
                <p className="text-lg text-secondary font-medium text-center">系统正在蛰伏，等待 JD 被抓取并投递。</p>
              </div>
            )}

            {isEvaluating && (
              <div className="flex-col flex-grow items-center justify-center h-full">
                <div className="relative">
                    <Radar size={64} className="text-accent animate-spin-slow" />
                </div>
                <h3 className="text-xl font-bold text-gradient mt-6 mb-2">穿透匹配中...</h3>
                <p className="text-secondary text-center max-w-sm font-medium">若匹配度为 A、B 等级，将触发后续「静默搭建专属破冰语」功能...</p>
              </div>
            )}

            {evalResult && (
              <div className="flex-col gap-6 animate-fade-in-up pb-8">
                
                {/* Header Score Info */}
                <div className="flex items-center gap-6 bg-white shadow-sm p-6 rounded-2xl border border-slate-200">
                    <div className={`flex items-center justify-center w-24 h-24 rounded-full border-4 shadow-sm ${getScoreColor(evalResult.score)}`}>
                        <span className={`text-5xl font-black ${getScoreColorText(evalResult.score)}`}>{evalResult.score}</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-lg text-primary font-bold mb-2">{evalResult.verdict}</p>
                        <p className="text-sm font-semibold text-secondary bg-slate-50 border border-slate-100 inline-block py-1.5 px-3 rounded-lg">
                            <span className="text-accent mr-2">执行命令:</span>{evalResult.action_suggestion}
                        </p>
                    </div>
                </div>

                {/* Radar Details */}
                {evalResult.radar && (
                  <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white shadow-sm p-4 rounded-xl text-center border border-slate-200">
                          <p className="text-secondary text-xs uppercase font-bold tracking-wider mb-2">匹配度</p>
                          <p className="text-2xl font-black text-success">{evalResult.radar.match_score}</p>
                      </div>
                      <div className="bg-white shadow-sm p-4 rounded-xl text-center border border-slate-200">
                          <p className="text-secondary text-xs uppercase font-bold tracking-wider mb-2">能力缺口率</p>
                          <p className={`text-2xl font-black ${evalResult.radar.gap_score > 40 ? 'text-error' : 'text-warning'}`}>
                              {evalResult.radar.gap_score}
                          </p>
                      </div>
                      <div className="bg-white shadow-sm p-4 rounded-xl text-center border border-slate-200">
                          <p className="text-secondary text-xs uppercase font-bold tracking-wider mb-2">WLB反水率</p>
                          <p className={`text-2xl font-black ${evalResult.radar.wlb_score < 50 ? 'text-error' : 'text-success'}`}>
                              {evalResult.radar.wlb_score}
                          </p>
                      </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 shadow-sm rounded-xl p-5">
                      <h4 className="flex items-center gap-2 font-bold text-success mb-3">
                          <CheckCircle size={18} /> 核心红利收割点
                      </h4>
                      <ul className="flex-col gap-2">
                          {evalResult.analysis?.strengths?.map((item, idx) => (
                              <li key={idx} className="text-[0.95rem] text-slate-700 font-medium flex items-start gap-2">
                                  <span className="text-success mt-0.5">•</span> {item}
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="bg-red-50 border border-red-100 shadow-sm rounded-xl p-5">
                      <h4 className="flex items-center gap-2 font-bold text-error mb-3">
                          <AlertTriangle size={18} /> 致命雷区拦截
                      </h4>
                      <ul className="flex-col gap-2">
                          {evalResult.analysis?.weaknesses?.map((item, idx) => (
                              <li key={idx} className="text-[0.95rem] text-slate-700 font-medium flex items-start gap-2">
                                  <span className="text-error mt-0.5">•</span> {item}
                              </li>
                          ))}
                      </ul>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-slate-200 my-2"></div>

                {/* Icebreaker Generator */}
                {['A', 'B'].includes(evalResult.score) ? (
                    <div className="mt-2">
                        <h4 className="font-bold text-xl text-primary mb-3 flex items-center gap-2">
                            <MessageSquare className="text-accent" size={22} /> 高转化率破冰搭讪语
                        </h4>
                        
                        {!icebreakerResult && !isGeneratingIcebreaker ? (
                            <button 
                                className="w-full flex justify-center items-center py-3 rounded-xl font-bold bg-purple-50 border border-purple-100 hover:bg-accent hover:border-accent text-accent hover:text-white transition-all shadow-sm active:scale-[0.98]" 
                                onClick={handleGenerateIcebreakerClick}
                            >
                                <Zap size={18} className="mr-2" /> (自动化失效时备用点击) 继续生成专属破冰
                            </button>
                        ) : isGeneratingIcebreaker ? (
                            <div className="flex items-center justify-center py-8 bg-purple-50/50 rounded-xl border border-purple-100/50">
                                <span className="animate-pulse flex items-center gap-2 text-accent font-bold"><MessageSquare className="animate-bounce" size={20}/> 检测到 A/B 高分岗，正在静默全自动提取搭讪语...</span>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative animate-fade-in">
                                <div className="absolute top-0 right-0 p-2">
                                    <button 
                                        className={`p-2 rounded-lg transition-colors ${copySuccess ? 'bg-emerald-50 text-success' : 'bg-slate-50 text-secondary hover:text-primary hover:bg-slate-100'}`}
                                        onClick={copyToClipboard}
                                        title="复制文案"
                                    >
                                        {copySuccess ? <CheckCircle size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                                
                                <div className="p-6">
                                    <h5 className="text-xs uppercase tracking-wider text-secondary mb-3 font-bold">1秒破窗专属直球搭讪</h5>
                                    <p className="text-[1.05rem] text-primary leading-relaxed mb-6 font-semibold">
                                        {icebreakerResult.icebreaker}
                                    </p>
                                    
                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex gap-3">
                                        <Shield size={18} className="text-accent shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-sm font-bold text-accent block mb-1">暗黑聊法指导：</span>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{icebreakerResult.highlight_advice}</p>
                                        </div>
                                    </div>

                                    {/* Action Box to Tracker */}
                                    <div className="mt-6 pt-5 border-t border-slate-100">
                                        {!isSaving && !saveComplete ? (
                                            <button 
                                                className="flex-row items-center gap-2 text-sm text-accent hover:text-accent-light font-bold transition-colors"
                                                onClick={() => setIsSaving(true)}
                                            >
                                                <BookmarkPlus size={18} /> 确认为潜客，收归至「漏斗看板」
                                            </button>
                                        ) : isSaving && !saveComplete ? (
                                            <div className="flex-row items-center gap-3">
                                                <input 
                                                    type="text" 
                                                    className="input-glass flex-1 py-2 px-3 text-sm shadow-sm" 
                                                    placeholder="请输入追踪代号 (如: 字节-资深前端)"
                                                    value={jobTitleInput}
                                                    onChange={(e) => setJobTitleInput(e.target.value)}
                                                />
                                                <button 
                                                    className="btn-primary py-2 px-4 text-sm shadow-sm"
                                                    onClick={handleSaveToTracker}
                                                    disabled={!jobTitleInput.trim()}
                                                >
                                                    确认归档
                                                </button>
                                                <button className="text-secondary text-sm hover:text-primary font-bold" onClick={() => setIsSaving(false)}>撤销</button>
                                            </div>
                                        ) : (
                                            <div className="flex-row items-center gap-2 text-success text-sm font-bold">
                                                <CheckCircle size={18} /> 此岗位已成功纳入底层漏斗监控矩阵。
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {icebreakerError && (
                            <p className="text-sm text-error mt-2 font-medium">{icebreakerError}</p>
                        )}
                    </div>
                ) : (
                    <div className="mt-4 p-6 bg-slate-50 border border-slate-200 shadow-sm rounded-xl text-center">
                        <AlertTriangle size={28} className="mx-auto text-slate-400 mb-3" />
                        <h4 className="text-primary font-bold mb-2">低价值标的，放弃执行掩护抓取</h4>
                        <p className="text-sm text-secondary font-medium max-w-sm mx-auto">
                        由于核心命中评分较低，系统拒绝为其消耗脑力生成专属破冰搭讪策略。不要在这种岗位浪费时间，立刻看下一家！
                        </p>
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

export default JobAssessor;
