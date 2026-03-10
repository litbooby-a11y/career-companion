import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { fetchDeepSeekChat } from '../api';

const SYSTEM_PROMPT = `
你是一位顶级互联网大厂的高级业务总监（P9级别），现在正在面试一位【资深商业化产品经理】。
你的风格：极度冷酷、毒舌、压迫感极强、直击要害。

面试者的每一个回答，你都要给出两部分内容（按格式合成字符串）：
第一部分：你的回复（包含一段点评，和下一个更难的追问）。
第二部分：你对刚刚他那个回答的打分（0-100分）。

请必须严格输出如下格式的纯 JSON，不要带任何多余符号或 Markdown 代码块包裹：
{
  "reply": "【一针见血】...你的点评...\n\n【致命追问】...你的下一个问题...",
  "score": 75,
  "metrics": {
    "business_sense": 70,
    "logic": 80,
    "execution": 65
  }
}
`;

const INITIAL_MSG = '你好！我是你的高压面试教练（高级业务总监级别）。今天面试的是【资深商业化产品经理】岗。请准备好接受压力测试。我们现在开始：\n\n**如果你们业务的 DAU 在周末突然下降了 10%，而你下周就要向 CEO 汇报，作为 PM，你会从哪几个维度排查并给出版案？**';

const InterviewCoach = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: INITIAL_MSG, score: null }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [radarData, setRadarData] = useState({ business_sense: 0, logic: 0, execution: 0 });
  const endRef = useRef(null);

  // Voice I/O states
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputVal(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("你的浏览器不支持语音识别功能，请使用 Chrome 或 Edge。");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (isMuted || !window.speechSynthesis) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance and remove formatting markers for cleaner speech
    const cleanTextForSpeech = text.replace(/【.*?】/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.1; // Slightly faster for pressure
    utterance.pitch = 0.8; // Lower pitch for an authoritative tone

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    const userMsg = inputVal;

    // Optimistic UI update
    const newMessagesForUI = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessagesForUI);
    setInputVal('');
    setIsTyping(true);

    try {
      // Build conversation history for API
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...newMessagesForUI.map(m => ({
          role: m.role,
          content: m.text
        }))
      ];

      const aiResponseText = await fetchDeepSeekChat(apiMessages, { temperature: 0.8, max_tokens: 1000 });

      let parsed = null;
      try {
        // More robust JSON extraction
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        const cleanJsonStr = jsonMatch ? jsonMatch[0] : aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJsonStr);
      } catch (parseError) {
        console.warn("Failed to parse JSON strictly. Falling back to raw text.", parseError, aiResponseText);
        // Fallback if LLM fails to output valid JSON
        parsed = {
          reply: aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim() + '\n\n*(注：AI格式解析失败，此为原始输出)*',
          score: 0,
          metrics: { business_sense: 0, logic: 0, execution: 0 }
        };
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: parsed.reply,
        score: parsed.score
      }]);

      setRadarData(parsed.metrics || { business_sense: 0, logic: 0, execution: 0 });

      // Speak the bot's reply
      speakText(parsed.reply);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `⚠️ 模拟面试中断：${err.message || '请检查 API 密钥余额或网络状况。'}`,
        score: null
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-row flex-col-mobile gap-6 h-full animate-fade-in" style={{ height: '100%' }}>
      <div className="glass-panel flex-col w-full-mobile" style={{ flex: 2, display: 'flex', height: '100%', minWidth: '320px' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>高压模拟面试场</h2>
            <p style={{ fontSize: '1rem', marginTop: '0.75rem', color: 'var(--text-secondary)' }}>目标岗位：<span className="badge badge-warning ml-2" style={{ padding: '0.4rem 0.8rem' }}>字节跳动 - 商业化高级产品经理</span></p>
          </div>
          <button
            className="btn-glass"
            style={{ padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) window.speechSynthesis.cancel();
            }}
            title={isMuted ? "开启语音播报" : "关闭语音播报"}
          >
            {isMuted ? <VolumeX size={20} color="var(--text-secondary)" /> : <Volume2 size={20} color="var(--accent-primary)" />}
          </button>
        </div>

        <div className="flex-grow flex-col" style={{ flex: 1, padding: '2rem', overflowY: 'auto', gap: '2rem', paddingBottom: '1rem' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex-row gap-4 ${m.role === 'user' ? 'justify-end' : ''} animate-fade-in-up delay-100`} style={{ alignItems: 'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '50%', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: 'var(--glow-primary)', minWidth: '44px' }}><Bot size={24} color="#c4b5fd" /></div>
              )}

              <div style={{
                background: m.role === 'user' ? 'linear-gradient(135deg, var(--accent-primary), #6d28d9)' : 'rgba(255,255,255,0.03)',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-xl)',
                borderBottomRightRadius: m.role === 'user' ? '4px' : 'var(--radius-xl)',
                borderTopLeftRadius: m.role === 'assistant' ? '4px' : 'var(--radius-xl)',
                maxWidth: '85%',
                border: m.role === 'user' ? 'none' : '1px solid var(--surface-border)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontSize: '1rem',
                boxShadow: m.role === 'user' ? '0 4px 14px rgba(139, 92, 246, 0.3)' : 'var(--shadow-sm)'
              }}>
                {m.score && (
                  <div className="mb-3 flex-row justify-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.02em' }}>AI 严格打分</span>
                    <span style={{ color: m.score < 70 ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>{m.score} / 100 分</span>
                  </div>
                )}
                {m.text}
              </div>

              {m.role === 'user' && (
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.2)', minWidth: '44px' }}><User size={24} color="#f8fafc" /></div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex-row gap-4 animate-fade-in">
              <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '50%', border: '1px solid rgba(139, 92, 246, 0.3)', minWidth: '44px' }}><Bot className="animate-pulse-slow" size={24} color="#c4b5fd" /></div>
              <div style={{ color: 'var(--text-secondary)', padding: '0.75rem', fontStyle: 'italic', fontSize: '0.95rem' }}>总监正在进行思考和碾压式推理...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input area fixed at the bottom of the left pane */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.4)', alignItems: 'center', marginTop: 'auto' }}>
          <button
            className={`btn-glass ${isListening ? 'animate-pulse' : ''}`}
            style={{
              height: '56px', width: '56px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0,
              background: isListening ? 'rgba(239, 68, 68, 0.15)' : '',
              borderColor: isListening ? 'rgba(239, 68, 68, 0.3)' : ''
            }}
            onClick={toggleListening}
            title={isListening ? "停止识别" : "语音输入"}
          >
            {isListening ? <MicOff size={22} color="#ef4444" /> : <Mic size={22} color="var(--text-primary)" />}
          </button>
          <textarea
            className="input-glass"
            placeholder={isListening ? "正在聆听中..." : "输入你的作答（支持多行作答，回车发送）"}
            style={{ height: '56px', minHeight: '56px', flex: 1, resize: 'none', borderRadius: 'var(--radius-lg)', lineHeight: '1.5', paddingTop: '1rem' }}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button className="btn-primary" style={{ height: '56px', width: '56px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)', flexShrink: 0 }} onClick={handleSend} disabled={isTyping} aria-label="发送">
            <Send size={22} />
          </button>
        </div>
      </div>

      {/* Right Column (Radar & Guide) */}
      <div className="flex-col gap-6 w-full-mobile desktop-only" style={{ flex: 1, minWidth: '320px', overflowY: 'auto' }}>
        <div className="glass-panel animate-fade-in-up delay-200" style={{ padding: '2rem' }}>
          <h3 className="flex-row gap-2 mb-4" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}><AlertCircle size={22} color="var(--warning)" /> 实战能力评估</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>根据你的回答，动态生成能力考核图档。</p>

          <div className="flex-col gap-5">
            <div>
              <div className="flex-row justify-between mb-2">
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>业务深度 & 数据Sense</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>{radarData.business_sense}/100</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
                <div style={{ width: `${Math.max(5, radarData.business_sense)}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', borderRadius: '4px', boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>
            <div>
              <div className="flex-row justify-between mb-2">
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>逻辑闭环</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{radarData.logic}/100</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
                <div style={{ width: `${Math.max(5, radarData.logic)}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #c084fc)', borderRadius: '4px', boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>
            <div>
              <div className="flex-row justify-between mb-2">
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>抗压与协作落地</span>
                <span style={{ fontSize: '0.95rem', color: radarData.execution > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                  {radarData.execution > 0 ? `${radarData.execution}/100` : '待评估'}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
                <div style={{ width: `${Math.max(5, radarData.execution)}%`, height: '100%', background: radarData.execution > 0 ? 'var(--success)' : 'var(--error)', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel animate-fade-in-up delay-300" style={{ padding: '2rem', background: 'rgba(139, 92, 246, 0.03)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <h3 className="mb-4 text-gradient" style={{ fontSize: '1.2rem' }}>💡 黄金回答结构范例</h3>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            遇到开放式问题，不要急于扔点子，必须遵循框架：<br /><br />
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <span className="badge mb-2">1. 确认共识</span> <br />
              先反问面试官条件或确认数据的准确性。
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <span className="badge mb-2">2. 宏观漏斗拆解</span> <br />
              外部环境 - 内部产研 - 业务运营。
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <span className="badge mb-2">3. 微观定点打击</span> <br />
              具体 Action（附带时间节点与责任划分）。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCoach;
