// =============================================
// Eletrôbot — Eletrônica Alfa
// =============================================

let chatHistory = [];
let isLoading = false;

function abrirChat() {
  const chatbot = document.getElementById('chatbot');
  chatbot.style.display = 'flex';
  chatbot.style.flexDirection = 'column';

  // Mensagem de boas-vindas se ainda não tiver mensagens
  const body = document.getElementById('chat-body');
  if (body.children.length <= 1) {
    adicionarMensagem('bot', 'Olá! 👋 Sou o Eletrôbot da Eletrônica Alfa. Posso te ajudar com informações sobre nossos serviços, produtos e horários. No que posso ajudar?');
  }
}

function fecharchat() {
  const chatbot = document.getElementById('chatbot');
  chatbot.style.display = 'none';
}

async function enviarPergunta() {
  if (isLoading) return;

  const input = document.getElementById('pergunta');
  const texto = input.value.trim();
  if (!texto) return;

  input.value = '';
  adicionarMensagem('user', texto);
  chatHistory.push({ role: 'user', content: texto });

  isLoading = true;
  mostrarDigitando();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory })
    });

    const data = await res.json();
    removerDigitando();

    const resposta = data.reply || 'Desculpe, tive um problema. Fale conosco pelo WhatsApp! 😊';
    chatHistory.push({ role: 'assistant', content: resposta });
    adicionarMensagem('bot', resposta);

  } catch (e) {
    removerDigitando();
    adicionarMensagem('bot', 'Ops! Tive um problema técnico. Fale com a gente pelo WhatsApp: (65) 99342-0096 😊');
  }

  isLoading = false;
}

function adicionarMensagem(tipo, texto) {
  const body = document.getElementById('chat-body');

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    justify-content: ${tipo === 'user' ? 'flex-end' : 'flex-start'};
    margin: 6px 0;
  `;

  const bubble = document.createElement('div');
  bubble.style.cssText = `
    max-width: 80%;
    padding: 9px 13px;
    border-radius: ${tipo === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};
    font-size: 13px;
    line-height: 1.5;
    background: ${tipo === 'user' ? '#cf1f25' : '#f1f1f1'};
    color: ${tipo === 'user' ? '#fff' : '#1f1f1f'};
  `;
  bubble.textContent = texto;

  wrapper.appendChild(bubble);
  body.appendChild(wrapper);
  body.scrollTop = body.scrollHeight;
}

function mostrarDigitando() {
  const body = document.getElementById('chat-body');
  const div = document.createElement('div');
  div.id = 'digitando';
  div.style.cssText = 'display:flex; justify-content:flex-start; margin:6px 0;';
  div.innerHTML = `
    <div style="background:#f1f1f1; padding:10px 14px; border-radius:14px 14px 14px 4px; display:flex; gap:5px; align-items:center;">
      <span style="width:7px;height:7px;border-radius:50%;background:#cf1f25;animation:bounce 1s infinite;display:inline-block;"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:#cf1f25;animation:bounce 1s infinite 0.15s;display:inline-block;"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:#cf1f25;animation:bounce 1s infinite 0.3s;display:inline-block;"></span>
    </div>
  `;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;

  if (!document.getElementById('bounce-style')) {
    const style = document.createElement('style');
    style.id = 'bounce-style';
    style.textContent = '@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}';
    document.head.appendChild(style);
  }
}

function removerDigitando() {
  const d = document.getElementById('digitando');
  if (d) d.remove();
}

// Enviar com Enter
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('pergunta');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') enviarPergunta();
    });
  }
});
