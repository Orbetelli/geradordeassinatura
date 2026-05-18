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
            api_key = os.environ.get('GEMINI_API_KEY', '')
            if not api_key:
                self._erro(500, 'GEMINI_API_KEY não configurada no servidor.')
                return

            system_prompt = payload.get('system', '')

            # Converte histórico do formato Anthropic → Gemini
            # Anthropic: [{ role: 'user'|'assistant', content: '...' }]
            # Gemini:    [{ role: 'user'|'model',     parts: [{ text: '...' }] }]
            gemini_contents = []
            for msg in messages:
                role = 'model' if msg.get('role') == 'assistant' else 'user'
                gemini_contents.append({
                    'role':  role,
                    'parts': [{ 'text': msg.get('content', '') }]
                })

            # Gemini recebe o system prompt como systemInstruction separado
            gemini_payload = json.dumps({
                'systemInstruction': {
                    'parts': [{ 'text': system_prompt }]
                },
                'contents': gemini_contents,
                'generationConfig': {
                    'maxOutputTokens': 1000,
                    'temperature':     0.7
                }
            }).encode('utf-8')

            url = (
                'https://generativelanguage.googleapis.com/v1beta/models/'
                'gemini-1.5-flash:generateContent?key=' + api_key
            )

            req = urllib.request.Request(
                url,
                data=gemini_payload,
                headers={ 'Content-Type': 'application/json' },
                method='POST'
            )

            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_data = json.loads(resp.read())

            # Extrai o texto da resposta do Gemini e converte para
            # o formato que o frontend já espera (igual ao da Anthropic)
            text = (
                resp_data
                .get('candidates', [{}])[0]
                .get('content', {})
                .get('parts', [{}])[0]
                .get('text', 'Sem resposta.')
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