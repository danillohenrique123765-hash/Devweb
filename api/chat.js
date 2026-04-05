module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const messages = req.body && req.body.messages;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensagens inválidas' });
  }

  const SYSTEM_PROMPT = `Você é o Eletrôbot da Eletrônica Alfa, loja de consertos eletrônicos em Várzea Grande - MT, com mais de 40 anos de história. Endereço: Av. Couto Magalhães, 1381. WhatsApp: (65) 99342-0096. Instagram: @eletronicaalfa.1. Horário: dias úteis 07:30-17:30, sábados 07:30-12:00. Serviços: conserto de TVs, caixas amplificadas e micro-ondas (qualquer marca). Produtos: controles remotos, antenas, cabos, fontes e outros eletrônicos. Seja simpático, breve e direto. Responda sempre em português brasileiro. Para orçamentos, direcione ao WhatsApp.`;

  const geminiMessages = messages.map(function(m) {
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    };
  });

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: geminiMessages
      })
    }
  );

  const text = await response.text();
  console.log('Gemini raw response:', text);

  let data;
  try {
    data = JSON.parse(text);
  } catch(e) {
    return res.status(500).json({ error: 'Resposta inválida do Gemini', raw: text });
  }

  if (!response.ok) {
    return res.status(500).json({ error: 'Erro Gemini', detail: data });
  }

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui responder agora.';
  return res.status(200).json({ reply });
};
