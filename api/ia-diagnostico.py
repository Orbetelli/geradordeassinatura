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
            # Lê o body da requisição
            length  = int(self.headers.get('Content-Length', 0))
            body    = self.rfile.read(length)
            payload = json.loads(body)

            # Valida campos obrigatórios
            messages = payload.get('messages')
            if not messages or not isinstance(messages, list):
                self._erro(400, 'Campo "messages" obrigatório.')
                return

            # API key via variável de ambiente do Vercel
            api_key = os.environ.get('ANTHROPIC_API_KEY', '')
            if not api_key:
                self._erro(500, 'ANTHROPIC_API_KEY não configurada no servidor.')
                return

            # Monta o payload para a Anthropic
            anthropic_payload = json.dumps({
                'model':      payload.get('model', 'claude-sonnet-4-20250514'),
                'max_tokens': min(int(payload.get('max_tokens', 1000)), 2000),
                'system':     payload.get('system', ''),
                'messages':   messages
            }).encode('utf-8')

            req = urllib.request.Request(
                'https://api.anthropic.com/v1/messages',
                data=anthropic_payload,
                headers={
                    'Content-Type':      'application/json',
                    'x-api-key':         api_key,
                    'anthropic-version': '2023-06-01'
                },
                method='POST'
            )

            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_body = resp.read()

            self.send_response(200)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(resp_body)

        except urllib.error.HTTPError as e:
            err_body = e.read()
            self.send_response(e.code)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(err_body)

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
        pass  # Silencia logs desnecessários
