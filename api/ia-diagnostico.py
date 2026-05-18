from http.server import BaseHTTPRequestHandler
import json, os, urllib.request, urllib.error


class handler(BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            length  = int(self.headers.get('Content-Length', 0))
            body    = self.rfile.read(length)
            payload = json.loads(body)

            # Valida campos obrigatórios
            messages = payload.get('messages')
            if not messages or not isinstance(messages, list):
                self._erro(400, 'Campo "messages" obrigatório.')
                return

            # API key via variável de ambiente do Vercel
            api_key = os.environ.get('GROQ_API_KEY', '')
            if not api_key:
                self._erro(500, 'GROQ_API_KEY não configurada no servidor.')
                return

            system_prompt = payload.get('system', '')

            # Groq usa o mesmo formato da OpenAI:
            # [{ role: 'system'|'user'|'assistant', content: '...' }]
            groq_messages = []

            # System prompt vai como mensagem de role 'system'
            if system_prompt:
                groq_messages.append({
                    'role':    'system',
                    'content': system_prompt
                })

            # Repassa o histórico normalmente (user / assistant)
            for msg in messages:
                groq_messages.append({
                    'role':    msg.get('role', 'user'),
                    'content': msg.get('content', '')
                })

            groq_payload = json.dumps({
                'model':       'llama-3.3-70b-versatile',
                'messages':    groq_messages,
                'max_tokens':  1000,
                'temperature': 0.7
            }).encode('utf-8')

            req = urllib.request.Request(
                'https://api.groq.com/openai/v1/chat/completions',
                data=groq_payload,
                headers={
                    'Content-Type':  'application/json',
                    'Authorization': 'Bearer ' + api_key
                },
                method='POST'
            )

            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_data = json.loads(resp.read())

            # Extrai o texto e converte para o formato que o frontend já espera
            text = (
                resp_data
                .get('choices', [{}])[0]
                .get('message', {})
                .get('content', 'Sem resposta.')
            )

            resposta = json.dumps({
                'content': [{ 'type': 'text', 'text': text }]
            }).encode('utf-8')

            self.send_response(200)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(resposta)

        except urllib.error.HTTPError as e:
            err_body = e.read()
            try:
                err_json = json.loads(err_body)
                msg = err_json.get('error', {}).get('message', str(e))
            except Exception:
                msg = str(e)
            self._erro(e.code, msg)

        except Exception as e:
            self._erro(500, str(e))

    def _erro(self, code, msg):
        body = json.dumps({'error': msg}).encode('utf-8')
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass