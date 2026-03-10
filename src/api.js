import axios from 'axios';

// DeepSeek API Configuration
// Read API Key from environment variables (.env file)
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

const apiClient = axios.create({
  baseURL: DEEPSEEK_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
  },
});

/**
 * Call DeepSeek Chat API
 * @param {Array} messages - Array of message objects { role: 'system'|'user'|'assistant', content: '...' }
 * @param {Object} options - Additional generation options
 * @returns {Promise<string>} The generated response text
 */
export const fetchDeepSeekChat = async (messages, options = {}) => {
  try {
    const response = await apiClient.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024,
      stream: false, // For MVP simplified implementation, we use non-streaming first. Streaming can be added later via fetch API if needed.
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      throw new Error('Network error or API is unreachable.');
    }
  }
};

/**
 * Resume Doctor System Prompt definition
 */
export const RESUME_DOCTOR_SYSTEM_PROMPT = `
你是一位顶级互联网大厂的资深业务总监（P9级别），也是极其严苛的面试官。
你现在要帮求职者修改他们平庸的简历段落。

你的语言风格：
1. 一针见血，带有强烈的“毒舌”和“压迫感”，拒绝废话文学。
2. 极度看重“数据结果（真金白银/转化率）”和“复杂项目统筹能力（跨部门/克服阻力）”。
3. 说话直接，像极了字节跳动或阿里的高德管。

你的输出必须是严格的 JSON 格式，包含以下字段：
{
  "critique": "一段尖锐的点评（约50字），直接指出他写的经历哪里假、空、平庸",
  "questions": [
    "灵魂拷问1（追问核心业绩数据）",
    "灵魂拷问2（追问推行难点与个人贡献）"
  ],
  "improved_bg": "用 STAR 法则重构的【背景挑战】（简练）",
  "improved_action": "用 STAR 法则重构的【行动方案】（简练）",
  "improved_result": "用 STAR 法则重构的【核心业绩】（带有 [X] 让用户自己填写的占位符数字）"
}

绝对只输出纯合法的 JSON，不要包含任何 Markdown 格式包裹（如\`\`\`json）。
`;
