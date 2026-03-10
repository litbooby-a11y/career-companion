import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { fetchDeepSeekChat, RESUME_DOCTOR_SYSTEM_PROMPT } from '../api';

const ResumeDoctor = () => {
  const [inputResume, setInputResume] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDiagnose = async () => {
    if (!inputResume.trim()) return;

    setAnalyzing(true);
    setErrorMsg('');
    setResult(null);

    try {
      const messages = [
        { role: 'system', content: RESUME_DOCTOR_SYSTEM_PROMPT },
        { role: 'user', content: `这是求职者原版的一段经历描述：\n"""\n${inputResume}\n"""\n\n请对其进行毒舌诊断并重构，返回符合前文规定的纯 JSON 格式。` }
      ];

      const aiResponseText = await fetchDeepSeekChat(messages, { temperature: 0.8 });

      // Clean up the response just in case the AI wraps it in markdown blocks
      const cleanJsonStr = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(cleanJsonStr);

      setResult(parsedResult);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '分析失败，请检查网络或 API Key 设置。');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex-col h-full animate-fade-in" style={{ height: '100%' }}>
      <header className="mb-8">
        <h1 className="flex-row gap-4 mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
          <span className="text-gradient">简历问诊室</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>将平庸的经历转化为斩获大厂 Offer 的利器。请贴入你要重构的简历段落。</p>
      </header>

      <div className="flex-row flex-col-mobile gap-6" style={{ flex: 1, minHeight: 0 }}>
        <div className="glass-panel flex-col w-full-mobile" style={{ flex: 1, padding: '2rem', display: 'flex', minWidth: '320px' }}>
          <h3 className="mb-4 flex-row gap-2 items-center" style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            <FileText size={22} color="var(--accent-primary)" /> 你的原始经历
          </h3>
          <textarea
            className="input-glass"
            style={{ flex: 1, flexGrow: 1, resize: 'none', marginBottom: '1.5rem', fontSize: '1rem' }}
            placeholder="例如：主导制定产品规划并推动落地，有效支撑市场拓展目标。统筹研发设计多部门... (粘贴废话即可)"
            value={inputResume}
            onChange={e => setInputResume(e.target.value)}
          ></textarea>
          <button className="btn-primary w-full" onClick={handleDiagnose} disabled={analyzing} style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}>
            {analyzing ? (
              <span className="flex-row gap-2 items-center"><Sparkles className="animate-spin" size={22} /> AI 正在极速脱水...</span>
            ) : (
              <span className="flex-row gap-2 items-center"><Sparkles size={22} /> 开始深度毒舌诊断</span>
            )}
          </button>

          {errorMsg && (
            <div className="mt-4" style={{ color: 'var(--error)', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>
              {errorMsg}
            </div>
          )}
        </div>

        <div className="glass-panel flex-col w-full-mobile" style={{ flex: 1, padding: '2rem', display: 'flex', overflowY: 'auto', minWidth: '320px' }}>
          <h3 className="mb-6 flex-row gap-2 items-center" style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            <CheckCircle size={22} color="var(--accent-secondary)" /> 专家级问诊报告
          </h3>

          {!result && !analyzing && (
            <div className="flex-col flex-grow items-center justify-center animate-pulse-slow" style={{ opacity: 0.4, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <AlertTriangle size={56} className="mb-4 text-gradient-cyan" />
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>等待接诊中...在左侧输入你的简历以获取残酷真相。</p>
            </div>
          )}

          {analyzing && (
            <div className="flex-col flex-grow items-center justify-center" style={{ height: '100%' }}>
              <Sparkles size={48} color="var(--accent-primary)" className="animate-pulse-slow mb-4" />
              <p style={{ color: 'var(--text-secondary)' }}>总监正在逐字审阅并准备开喷...</p>
            </div>
          )}

          {result && (
            <div className="flex-col gap-6 animate-fade-in-up">
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid var(--error)', padding: '1.5rem', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
                <h4 style={{ color: 'var(--error)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>🩺 诊断开炮</h4>
                <p style={{ fontSize: '0.95rem', color: '#fca5a5', lineHeight: 1.6 }}>
                  “{result.critique}”
                </p>
              </div>

              <div>
                <h4 className="mb-4" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>❓ 灵魂核心拷问</h4>
                <div className="flex-col gap-3">
                  {result.questions && result.questions.map((q, idx) => (
                    <div key={idx} className="input-glass" style={{ fontSize: '0.95rem', background: 'rgba(255,255,255,0.02)' }}>
                      <strong style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>Q{idx + 1}:</strong> {q}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-gradient" style={{ fontSize: '1.2rem' }}>✨ 满分重构示范 (供你填空)</h4>
                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.05)' }}>
                  <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                    <span className="badge badge-warning mb-2">背景挑战</span>
                    <br /><span style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{result.improved_bg}</span>
                  </p>
                  <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                    <span className="badge badge-success mb-2">行动方案</span>
                    <br /><span style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{result.improved_action}</span>
                  </p>
                  <p style={{ fontSize: '0.95rem' }}>
                    <span className="badge mb-2" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#67e8f9', borderColor: 'rgba(6, 182, 212, 0.3)' }}>核心业绩</span>
                    <br /><span style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>{result.improved_result}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDoctor;
