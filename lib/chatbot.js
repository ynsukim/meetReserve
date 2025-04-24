import axios from 'axios';
import { OPENROUTER_API_KEY } from '@env';

export async function askChatbot(prompt) {
  try {
    console.log(OPENROUTER_API_KEY);
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        // model: 'google/gemini-2.0-flash-exp:free',
        model: 'google/gemini-2.0-flash-exp:free',

        messages: [
          {
            role: 'system',
            content: '한글. 판타지 캐릭터 롤플레잉. 짧게 인사. 이모지 많이 사용. 대화중 계속 롤플레잉 말투 및 이모지 유지'
          },
          { role: 'user', content: prompt }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        return "❗ API 키가 잘못되었어요. 확인해 주세요.";
      } else if (status === 429) {
        return "⏳ 너무 많은 요청이에요! 잠시 후 다시 시도해 주세요.";
      } else if (status >= 500) {
        return "🚨 서버 오류가 발생했어요. 잠시 후에 다시 시도해 주세요.";
      } else {
        return `⚠️ 알 수 없는 오류 (${status})가 발생했어요.`;
      }

    } else if (error.code === 'ECONNABORTED') {
      return "⌛ 요청이 너무 오래 걸렸어요. 네트워크 상태를 확인해 주세요.";
    } else {
      return "😢 챗봇 호출 중 오류가 발생했어요.";
    }
  }
}
