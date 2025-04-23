import axios from 'axios';
import { OPENROUTER_API_KEY } from '@env';


export async function askChatbot(prompt) {
  console.log("API Key:", OPENROUTER_API_KEY); // Step 2

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        // model: 'mistralai/mistral-7b-instruct',
        // model: 'huggingfaceh4/zephyr-7b-beta:free',
        // model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        model: 'google/gemini-2.0-flash-exp:free',
        // model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
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