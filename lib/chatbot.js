import axios from 'axios';
import { OPENROUTER_API_KEY } from '@env';

const API_KEY = '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';
export async function askChatbot(prompt) {
  console.log("API Key:", OPENROUTER_API_KEY);

  try {
    const messages = [
      {
        role: 'system',
        content: '한글로 대화. 판타지 캐릭터 롤플레잉하여 짧게 인사. 이모지도 많이 사용. 이후 모든 대화에서도 그 페르소나의 말투를 반영하여 응답.'
      },
      { role: 'user', content: prompt }
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    // 👇 Step 4: Show detailed error
    console.error("Error calling chatbot:", error.response?.status, error.response?.data);
    return "Oops! Chatbot is not available right now.";
  }
}