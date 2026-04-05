cat > /mnt/user-data/outputs/api/chat.js << 'EOF'
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensagens inválidas' });
  }

  const SYSTEM_PROMPT = `Você é o Eletrôbot, o assistente virtual inteligente da Eletrônica Alfa, uma loja tradicional de consertos eletrônicos localizada em Várzea Grande - MT, com mais de 40 anos de história.

Informações da loja:
- Nome: Eletrônica Alfa
- Localização: Avenida Couto Magalhães, 1381, em frente à Casa de Arte e Cultura, Várzea Grande - MT
- WhatsApp: (65) 99342-0096
- Instagram: @eletronicaalfa.1
- Horário: Dias úteis 07:30 às 17:30 | Sábados 07:30 às 12:00

Serviços oferecidos:
- Conserto de TVs (qualquer marca)
- Conserto de caixas amplificadas (qualquer marca)
- Conserto de micro-ondas (qualquer marca)

Produtos à venda:
- Controles remotos para televisão
- Antenas externas e internas
- Cabos de diversas variedades
- Fontes de todos os valores
- E outros produtos eletrônicos

Personalidade: Seja simpático, objetivo e profissional. Use linguagem informal mas educada, como um atendente prestativo. Quando o cliente perguntar sobre orçamento ou problemas específicos, incentive-o a entrar em contato pelo WhatsApp. Responda sempre em português brasileiro. Seja breve e direto. Não invente informações que não foram fornecidas.`;

  try {
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiMessages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Erro na API do Gemini' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui responder agora.';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
