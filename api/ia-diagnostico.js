// api/ia-diagnostico.js
// Proxy Vercel → Groq (compatível com plano gratuito — Node.js)

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

    const { messages, system } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Campo "messages" obrigatório.' });
    }

    const api_key = (process.env.GROQ_API_KEY || '').trim();
    if (!api_key) {
        return res.status(500).json({ error: 'GROQ_API_KEY não configurada no servidor.' });
    }

    const groq_messages = [];
    if (system) groq_messages.push({ role: 'system', content: system });
    messages.forEach(m => groq_messages.push({ role: m.role || 'user', content: m.content || '' }));

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + api_key
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: groq_messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const msg = data?.error?.message || 'Erro desconhecido';
            return res.status(response.status).json({ error: `[HTTP ${response.status}] ${msg}` });
        }

        const text = data?.choices?.[0]?.message?.content || 'Sem resposta.';
        return res.status(200).json({ content: [{ type: 'text', text }] });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
