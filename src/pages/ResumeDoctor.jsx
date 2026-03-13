import React, { useState, useRef } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, FileText, Upload, File as FileIcon, Trash2, ChevronRight, Activity, Zap, Target } from 'lucide-react';
import { fetchDeepSeekChat, RESUME_DOCTOR_SYSTEM_PROMPT, RESUME_FULL_DIAGNOSIS_PROMPT } from '../api';
import { extractTextFromPdf } from '../utils/pdfParser';

const ResumeDoctor = () => {
  const [activeTab, setActiveTab] = useState('snippet'); // 'snippet' or 'fullPdf'
  
  // Snippet State
  const [inputResume, setInputResume] = useState('');
  const [analyzingSnippet, setAnalyzingSnippet] = useState(false);
  const [snippetResult, setSnippetResult] = useState(null);
  const [snippetErrorMsg, setSnippetErrorMsg] = useState('');

  // Full PDF State
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const [pdfResult, setPdfResult] = useState(null);
  const [pdfErrorMsg, setPdfErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // --- Snippet Handlers ---
  const handleDiagnoseSnippet = async () => {
    if (!inputResume.trim()) return;

    setAnalyzingSnippet(true);
    setSnippetErrorMsg('');
    setSnippetResult(null);

    try {
      const messages = [
        { role: 'system', content: RESUME_DOCTOR_SYSTEM_PROMPT },
        { role: 'user', content: `这是求职者原版的一段经历描述：\n"""\n${inputResume}\n"""\n\n请对其进行毒舌诊断并重构，返回符合前文规定的纯 JSON 格式。` }
      ];

      const aiResponseText = await fetchDeepSeekChat(messages, { temperature: 0.8 });
      const cleanJsonStr = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(cleanJsonStr);
      setSnippetResult(parsedResult);
    } catch (err) {
      console.error(err);
      setSnippetErrorMsg(err.message || '分析失败，请检查网络或 API Key 设置。');
    } finally {
      setAnalyzingSnippet(false);
    }
  };

  // --- Full PDF Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfErrorMsg('');
      setPdfResult(null); // Reset previous results when new file is uploaded
    } else if (file) {
      setPdfErrorMsg('请上传 PDF 格式的文件。');
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    setPdfResult(null);
    setPdfErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDiagnosePdf = async () => {
    if (!pdfFile) return;

    setAnalyzingPdf(true);
    setPdfErrorMsg('');
    setPdfResult(null);

    try {
      // 1. Extract text
      const extractedText = await extractTextFromPdf(pdfFile);
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('未能在 PDF 中提取到足够的文本内容，可能是纯图片扫描版简历，请更换为文本型 PDF。');
      }

      // 2. Call API
      const messages = [
        { role: 'system', content: RESUME_FULL_DIAGNOSIS_PROMPT },
        { role: 'user', content: `这是求职者的完整简历文本解析结果：\n"""\n${extractedText.substring(0, 15000)} // 避免token超限\n"""\n\n请对其进行全方位深度诊断，严格返回 JSON 格式。` }
      ];

      const aiResponseText = await fetchDeepSeekChat(messages, { temperature: 0.7, max_tokens: 2048 });
      
      // 3. Parse JSON
      const cleanJsonStr = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(cleanJsonStr);
      setPdfResult(parsedResult);
      
    } catch (err) {
      console.error(err);
      setPdfErrorMsg(err.message || '评估失败，可能是 PDF 解析异常或网络请求失败。');
    } finally {
      setAnalyzingPdf(false);
    }
  };
  
  // Helper to get color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return 'var(--success-DEFAULT, #10b981)';
      case 'warning': return 'var(--warning-DEFAULT, #f59e0b)';
      case 'error': return 'var(--error-DEFAULT, #ef4444)';
      default: return 'var(--text-secondary)';
    }
  };


  return (
    <div className="flex-col animate-fade-in h-screen-overflow">
      <header className="mb-6">
        <h1 className="flex-row gap-4 mb-2 text-3xl font-bold tracking-tight">
          <span className="text-gradient">简历问诊室</span>
        </h1>
        <p className="text-secondary text-lg">全方位 X 光扫描，打破简历投递石沉大海的魔咒。</p>
      </header>

      {/* Tabs */}
      <div className="flex-row gap-2 mb-6 border-b border-white/5 pb-2">
         <button 
           onClick={() => setActiveTab('snippet')}
           className={`px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'snippet' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-white/5 hover:text-primary-light'}`}
         >
            <div className="flex-row items-center gap-2"><Activity size={18}/> 单段经历毒舌去水</div>
         </button>
         <button 
           onClick={() => setActiveTab('fullPdf')}
           className={`px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'fullPdf' ? 'bg-accent/10 text-accent' : 'text-secondary hover:bg-white/5 hover:text-accent-light'}`}
         >
            <div className="flex-row items-center gap-2"><Target size={18}/> 完整 PDF 简历诊断</div>
         </button>
      </div>

      <div className="flex-row flex-col-mobile gap-6" style={{ flex: 1, minHeight: 0 }}>
        
        {/* Left Panel */}
        <div className="glass-panel flex-col w-full-mobile h-full" style={{ flex: '1', padding: '2rem', display: 'flex', minWidth: '320px', overflowY: 'auto' }}>
            
            {activeTab === 'snippet' ? (
                // --- Snippet UI Left ---
                <>
                <h3 className="mb-4 flex-row gap-2 items-center text-primary text-xl">
                    <FileText size={22} color="var(--accent-primary)" /> 你的原始经历
                </h3>
                <textarea
                    className="input-glass"
                    style={{ flex: 1, resize: 'none', marginBottom: '1.5rem', fontSize: '1rem', minHeight: '300px' }}
                    placeholder="例如：主导制定产品规划并推动落地，有效支撑市场拓展目标。统筹研发设计多部门... (粘贴废话即可)"
                    value={inputResume}
                    onChange={e => setInputResume(e.target.value)}
                ></textarea>
                <button className="btn-primary w-full justify-center p-4 text-lg" onClick={handleDiagnoseSnippet} disabled={analyzingSnippet}>
                    {analyzingSnippet ? (
                    <span className="flex-row gap-2 items-center"><Sparkles className="animate-spin" size={22} /> AI 正在极速脱水...</span>
                    ) : (
                    <span className="flex-row gap-2 items-center"><Sparkles size={22} /> 开始深度毒舌诊断</span>
                    )}
                </button>

                {snippetErrorMsg && (
                    <div className="mt-4 p-3 bg-error/10 text-error rounded-md text-sm">
                    {snippetErrorMsg}
                    </div>
                )}
                </>
            ) : (
                // --- Full PDF UI Left ---
                <>
                <h3 className="mb-4 flex-row gap-2 items-center text-accent text-xl">
                 <FileIcon size={22} color="var(--accent-secondary)"/> 上传简历 PDF
                </h3>
                
                <div 
                  className={`flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all mb-4 mt-2 ${isDragging ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/20'}`}
                  style={{ minHeight: '300px' }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                    {!pdfFile ? (
                        <>
                         <Upload size={48} className="text-white/20 mb-4" />
                         <p className="text-secondary text-center mb-6">点击或拖拽 PDF 文件到此处上传<br/><span className="text-xs text-white/30 mt-2 block">支持最大 10MB 解析提取</span></p>
                         <input 
                           type="file" 
                           accept="application/pdf"
                           className="hidden"
                           ref={fileInputRef}
                           onChange={handleFileChange}
                         />
                         <button 
                           className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-primary-light transition-colors"
                           onClick={() => fileInputRef.current?.click()}
                         >
                           选择文件
                         </button>
                        </>
                    ) : (
                        <div className="flex-col items-center w-full">
                           <div className="w-16 h-20 bg-accent/10 rounded border border-accent/20 flex items-center justify-center mb-4 relative">
                               <FileText size={32} className="text-accent" />
                               <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1 border border-black"><CheckCircle size={10} className="text-black"/></div>
                           </div>
                           <p className="text-primary font-medium truncate w-full text-center px-4" title={pdfFile.name}>{pdfFile.name}</p>
                           <p className="text-secondary text-sm mt-1">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                           
                           <button onClick={removeFile} className="mt-6 flex-row items-center gap-2 text-error/80 hover:text-error text-sm px-4 py-2 rounded-lg hover:bg-error/10 transition-colors">
                               <Trash2 size={16} /> 移除重传
                           </button>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    <button 
                        className="w-full flex justify-center items-center py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-500 hover:from-indigo-600 to-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none" 
                        onClick={handleDiagnosePdf} 
                        disabled={analyzingPdf || !pdfFile}
                    >
                        {analyzingPdf ? (
                        <span className="flex-row gap-2 items-center"><Zap className="animate-pulse" size={22} /> AI 总监正在进行 X 光级透视...</span>
                        ) : (
                        <span className="flex-row gap-2 items-center"><Zap size={22} /> 生成全面诊断报告</span>
                        )}
                    </button>
                </div>

                {pdfErrorMsg && (
                    <div className="mt-4 p-3 bg-error/10 text-error rounded-md text-sm border border-error/20">
                    <AlertTriangle size={16} className="inline mr-2 -mt-0.5"/> {pdfErrorMsg}
                    </div>
                )}
                
                {activeTab === 'fullPdf' && (
                    <div className="mt-6 p-4 bg-black/20 rounded-lg text-sm text-secondary leading-relaxed border border-white/5">
                        <strong className="text-primary-light block mb-2">💡 诊断须知：</strong>
                        1. 仅支持<strong>文本型 PDF</strong>，基于图片扫描的 PDF 暂无法解析提取文字。<br/>
                        2. 解析全程在本地浏览器内存中提取文本，而后加密传输至 AI，我们<strong>绝不留存</strong>您的简历文件本身。
                    </div>
                )}
                </>
            )}

        </div>

        {/* Right Panel */}
        <div className="glass-panel flex-col w-full-mobile h-full" style={{ flex: '1.2', padding: '0', display: 'flex', overflowY: 'auto', minWidth: '320px' }}>
          
          <div className="p-8 pb-4 sticky top-0 bg-black/40 backdrop-blur-md z-10 border-b border-white/5">
            <h3 className="flex-row gap-2 items-center text-xl text-primary font-semibold">
                <CheckCircle size={22} color="var(--accent-secondary)" /> 
                {activeTab === 'snippet' ? '专家级经历拷问' : '全局体检报告'}
            </h3>
          </div>

          <div className="p-8 pt-6 flex-1 flex-col transition-all">
            {/* --- Snippet Results --- */}
            {activeTab === 'snippet' && (
              <>
              {!snippetResult && !analyzingSnippet && (
                <div className="flex-col flex-grow items-center justify-center animate-pulse-slow h-full opacity-40">
                  <AlertTriangle size={56} className="mb-4 text-gradient-cyan" />
                  <p className="text-lg text-secondary text-center">等待接诊中...在左侧输入你的经历以获取残酷真相。</p>
                </div>
              )}

              {analyzingSnippet && (
                <div className="flex-col flex-grow items-center justify-center h-full">
                  <Sparkles size={48} color="var(--accent-primary)" className="animate-pulse-slow mb-4" />
                  <p className="text-secondary text-lg">总监正在逐字审阅您的经历...</p>
                </div>
              )}

              {snippetResult && (
                <div className="flex-col gap-8 animate-fade-in-up pb-8">
                  {/* ... Original Snippet Result UI ... */}
                  <div className="bg-error/5 border-l-4 border-error p-6 rounded-r-xl">
                    <h4 className="text-error font-medium mb-3 text-lg">🩺 诊断开炮</h4>
                    <p className="text-red-300/90 leading-relaxed">
                      “{snippetResult.critique}”
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-4 text-primary font-medium text-lg">❓ 灵魂核心拷问<span className="text-sm text-secondary font-normal ml-3">(回答不上来基本就凉了)</span></h4>
                    <div className="flex-col gap-3">
                      {snippetResult.questions && snippetResult.questions.map((q, idx) => (
                        <div key={idx} className="input-glass bg-white/[0.02] text-[0.95rem] py-3.5 px-4 flex items-start gap-3">
                          <strong className="text-accent-primary shrink-0 mt-0.5">Q{idx + 1}:</strong> <span className="text-primary-light/90 leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 text-gradient text-xl font-bold">✨ 满分重构示范 <span className="text-sm font-normal text-secondary ml-2">(请结合实际填空数据)</span></h4>
                    <div className="bg-indigo-500/5 p-7 rounded-xl border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                      <p className="text-[0.95rem] mb-5">
                        <span className="badge badge-warning mb-2.5 inline-block">背景挑战</span>
                        <br /><span className="text-primary/90 leading-relaxed block bg-black/20 p-3 rounded-lg border border-white/5">{snippetResult.improved_bg}</span>
                      </p>
                      <p className="text-[0.95rem] mb-5">
                        <span className="badge badge-success mb-2.5 inline-block">行动方案</span>
                        <br /><span className="text-primary/90 leading-relaxed block bg-black/20 p-3 rounded-lg border border-white/5">{snippetResult.improved_action}</span>
                      </p>
                      <p className="text-[0.95rem]">
                        <span className="badge mb-2.5 inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">核心业绩</span>
                        <br /><span className="text-primary/90 leading-relaxed block bg-black/20 p-3 rounded-lg border border-cyan-900/30">{snippetResult.improved_result}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}

            {/* --- Full PDF Results --- */}
            {activeTab === 'fullPdf' && (
              <>
              {!pdfResult && !analyzingPdf && (
                <div className="flex-col flex-grow items-center justify-center animate-pulse-slow h-full opacity-40">
                  <Target size={56} className="mb-4 text-accent" />
                  <p className="text-lg text-secondary text-center">系统冷启动中...请在左侧上传 PDF 简历文件。</p>
                </div>
              )}

              {analyzingPdf && (
                <div className="flex-col flex-grow items-center justify-center h-full">
                  <div className="relative">
                      <FileIcon size={64} className="text-white/10" />
                      <Zap size={32} className="text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-gradient mt-6 mb-2">简历深度解析中...</h3>
                  <p className="text-secondary text-center max-w-sm">HR 专家模型正在为您评估结构、提炼关键字，并挑出致命错误。预计耗时 10~15 秒。</p>
                </div>
              )}

              {pdfResult && (
                <div className="flex-col gap-8 animate-fade-in-up pb-8">
                  {/* Score Board */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="bg-gradient-to-br from-black/40 to-black/80 border border-white/10 rounded-2xl p-6 flex-col items-center justify-center shrink-0 min-w-[160px] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary"></div>
                        <span className="text-secondary font-medium tracking-wide mb-2 uppercase text-xs">整体竞争力得分</span>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-1">
                            {pdfResult.overall_score}
                        </div>
                        <span className="text-xs text-white/40">/ 100 分</span>
                    </div>
                    
                    <div className="flex-1 bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-center gap-3">
                        {/* Summary */}
                        <p className="text-primary-light/90 leading-relaxed text-[0.95rem]">
                            <strong className="text-accent-light">HR 专家辣评：</strong>
                            {pdfResult.summary}
                        </p>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                      {Object.entries(pdfResult.dimensions || {}).map(([key, data]) => {
                          const titles = { structure: '排版结构', content: '内容密度', keywords: '核心词穿透', quantification: '数据量化' };
                          const icons = { structure: '📐', content: '🥩', keywords: '🔑', quantification: '📊' };
                          return (
                              <div key={key} className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex-col">
                                  <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium text-primary-light flex items-center gap-2">{icons[key]} {titles[key]}</span>
                                      <span className={`font-bold ${data.score < 60 ? 'text-error' : data.score < 80 ? 'text-warning' : 'text-success'}`}>{data.score}</span>
                                  </div>
                                  <div className="w-full bg-black/40 rounded-full h-1.5 mb-3">
                                      <div className={`h-1.5 rounded-full ${data.score < 60 ? 'bg-error' : data.score < 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${data.score}%` }}></div>
                                  </div>
                                  <p className="text-xs text-secondary leading-snug">{data.comment}</p>
                              </div>
                          )
                      })}
                  </div>

                  {/* Top Improvements */}
                  <div>
                      <h4 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                          <AlertTriangle className="text-warning" size={20} /> 急需抢救的重点 (Top 3)
                      </h4>
                      <div className="bg-warning/5 border border-warning/20 rounded-xl p-1">
                          {pdfResult.top_improvements && pdfResult.top_improvements.map((imp, idx) => (
                              <div key={idx} className="flex gap-3 p-3 border-b border-warning/10 last:border-0 hover:bg-warning/10 transition-colors rounded-lg">
                                  <span className="text-warning font-black shrink-0 w-6 h-6 flex items-center justify-center bg-warning/10 rounded-full text-xs">{idx + 1}</span>
                                  <span className="text-primary-light/90 text-[0.95rem] pt-0.5">{imp}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Detailed Sections */}
                  <div>
                    <h4 className="font-bold text-lg text-primary mb-4 border-b border-white/10 pb-2">模块拆解显微镜</h4>
                    <div className="flex-col gap-4">
                        {pdfResult.sections && pdfResult.sections.map((sec, idx) => (
                            <div key={idx} className="bg-black/30 border border-white/10 rounded-xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: getStatusColor(sec.status) }}></div>
                                
                                <div className="flex justify-between items-start mb-3 pl-2">
                                    <h5 className="font-semibold text-primary">{sec.name}</h5>
                                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider" style={{ backgroundColor: `${getStatusColor(sec.status)}20`, color: getStatusColor(sec.status) }}>
                                        {sec.status}
                                    </span>
                                </div>
                                <p className="text-sm text-secondary/90 leading-relaxed mb-4 pl-2">
                                    {sec.diagnosis}
                                </p>
                                
                                {sec.suggestions && sec.suggestions.length > 0 && (
                                    <div className="pl-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-light/60 mb-2 uppercase"><ChevronRight size={12}/> 优化方案建议</div>
                                        <ul className="flex-col gap-2">
                                            {sec.suggestions.map((sug, sidx) => (
                                                <li key={sidx} className="text-[0.9rem] text-primary-light bg-white/5 rounded-md px-3 py-2 flex items-start gap-2">
                                                    <span className="text-accent/60 mt-0.5">•</span> 
                                                    <span>{sug}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>

                </div>
              )}
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeDoctor;
