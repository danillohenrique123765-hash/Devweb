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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Erro na API do Claude' });
    }

    const reply = data.content?.[0]?.text || 'Desculpe, não consegui responder agora.';
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

