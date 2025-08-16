// backend/services/openai.js
import fetch from 'node-fetch';
import { AI_KEYS } from '../config/aiKeys.js';

export async function callOpenAI(prompt) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AI_KEYS.OPENAI}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: String(prompt ?? '') }]
    })
  });
  const j = await r.json();
  return j?.choices?.[0]?.message?.content ?? '';
}