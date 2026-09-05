#!/usr/bin/env python3
"""
Diagnostic HTTP Server for Port 5001
-----------------------------------
Runs a standalone HTTP server on 0.0.0.0:5001 to inspect exactly what requests
and headers Caddy (or any reverse proxy) forwards to port 5001.

Usage:
    python3 diagnose_5001.py
    python3 diagnose_5001.py [port]
"""

import sys
import os
import json
import html
import socket
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Force unbuffered output so terminal logs appear in real time
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)

DEFAULT_PORT = 5001

# Terminal colors
BOLD = "\033[1m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RED = "\033[91m"
DIM = "\033[2m"
RESET = "\033[0m"


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


class DiagnosticHandler(BaseHTTPRequestHandler):
    server_version = "CaddyDiagnosticServer/1.0"

    def log_message(self, format, *args):
        # Custom clean logging instead of default BaseHTTPRequestHandler format
        pass

    def do_all(self):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query = parsed_url.query
        query_params = parse_qs(query)

        # Collect all headers
        headers_dict = dict(self.headers)
        client_ip = self.client_address[0]
        client_port = self.client_address[1]

        # Read body if present
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8', errors='replace') if content_length > 0 else ""

        # Terminal inspection output
        print(f"\n{BOLD}{CYAN}------------------------------------------------------------{RESET}")
        print(f"{BOLD}[{timestamp}] {GREEN}{self.command} {self.path}{RESET}")
        print(f"{DIM}From client:{RESET} {client_ip}:{client_port}")
        print(f"{BOLD}Path received at port 5001:{RESET} {YELLOW}{path}{RESET}")

        # Diagnosis logic
        starts_with_rt = path.startswith('/RT') or path.startswith('/rt')
        referer = self.headers.get('Referer', '(none)')
        user_agent = self.headers.get('User-Agent', '(none)')
        x_forwarded_for = self.headers.get('X-Forwarded-For', '(none)')
        x_forwarded_proto = self.headers.get('X-Forwarded-Proto', '(none)')
        x_forwarded_host = self.headers.get('X-Forwarded-Host', '(none)')
        x_forwarded_prefix = self.headers.get('X-Forwarded-Prefix', '(none)')
        host_header = self.headers.get('Host', '(none)')
        
        print(f"{BOLD}Proxy Headers:{RESET}")
        print(f"  Host:               {host_header}")
        print(f"  X-Forwarded-For:    {x_forwarded_for}")
        print(f"  X-Forwarded-Proto:  {x_forwarded_proto}")
        print(f"  X-Forwarded-Host:   {x_forwarded_host}")
        print(f"  X-Forwarded-Prefix: {x_forwarded_prefix}")
        print(f"  Referer:            {referer}")
        print(f"  User-Agent:         {user_agent[:70]}...")

        # Diagnostic recommendation
        if starts_with_rt:
            diagnosis_summary = "Caddy PRESERVES the /RT prefix in the request path."
            diagnosis_advice = (
                "Your Caddyfile is forwarding paths with '/RT/' intact (e.g. using `handle /RT/*` or `reverse_proxy /RT/*`).\n"
                "-> Vite MUST be run with base '/RT/' (run: `npm run dev:caddy`)."
            )
            print(f"{GREEN}✓ Diagnosis: {diagnosis_summary}{RESET}")
        else:
            diagnosis_summary = "Caddy STRIPPED the /RT prefix (or request was made directly to root)."
            diagnosis_advice = (
                "The path received on port 5001 does NOT start with '/RT/'.\n"
                "If you visited https://domain/RT/ in the browser, Caddy used `handle_path /RT/*` which stripped '/RT/'.\n"
                "-> If Caddy strips '/RT/', Vite should run with standard `npm run dev` (base '/'), BUT asset links in HTML may need special proxying, OR configure Caddy with `handle /RT/*` instead of `handle_path`."
            )
            print(f"{YELLOW}! Diagnosis: {diagnosis_summary}{RESET}")

        print(f"{CYAN}------------------------------------------------------------{RESET}\n")

        # JSON response if requested
        if 'application/json' in self.headers.get('Accept', '') or 'format=json' in query:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            data = {
                "timestamp": timestamp,
                "method": self.command,
                "raw_path": self.path,
                "parsed_path": path,
                "query": query,
                "query_params": query_params,
                "client": {"ip": client_ip, "port": client_port},
                "headers": headers_dict,
                "body_preview": body[:500],
                "diagnosis": {
                    "preserves_rt_prefix": starts_with_rt,
                    "summary": diagnosis_summary,
                    "advice": diagnosis_advice
                }
            }
            self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))
            return

        # HTML response
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        headers_rows = "".join(
            f"<tr><td class='key'>{html.escape(k)}</td><td class='val'>{html.escape(v)}</td></tr>"
            for k, v in sorted(headers_dict.items())
        )

        query_rows = "".join(
            f"<tr><td class='key'>{html.escape(k)}</td><td class='val'>{html.escape(', '.join(v))}</td></tr>"
            for k, v in query_params.items()
        ) if query_params else "<tr><td colspan='2' style='color:#94a3b8; font-style:italic;'>No query parameters</td></tr>"

        raw_diagnostics_json = json.dumps({
            "timestamp": timestamp,
            "method": self.command,
            "path_received_at_5001": path,
            "full_request_uri": self.path,
            "client_address": f"{client_ip}:{client_port}",
            "key_headers": {
                "host": host_header,
                "x-forwarded-for": x_forwarded_for,
                "x-forwarded-proto": x_forwarded_proto,
                "x-forwarded-host": x_forwarded_host,
                "x-forwarded-prefix": x_forwarded_prefix,
                "referer": referer,
                "user-agent": user_agent
            },
            "diagnosis_summary": diagnosis_summary,
            "diagnosis_advice": diagnosis_advice
        }, indent=2)

        page_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Port 5001 Caddy & Reverse Proxy Inspector</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
      padding: 2rem 1rem;
    }}
    .container {{
      max-width: 900px;
      margin: 0 auto;
    }}
    .header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }}
    h1 {{
      font-size: 1.6rem;
      font-weight: 700;
      color: #38bdf8;
    }}
    .badge {{
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
    }}
    .card {{
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }}
    .card-title {{
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .highlight-box {{
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 1rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 1.05rem;
      color: #f8fafc;
      word-break: break-all;
      margin-bottom: 1rem;
    }}
    .path-hl {{
      color: {'#4ade80' if starts_with_rt else '#fbbf24'};
      font-weight: 700;
    }}
    .alert {{
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid;
    }}
    .alert-success {{
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
      color: #86efac;
    }}
    .alert-warning {{
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fde047;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }}
    th, td {{
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }}
    th {{
      color: #94a3b8;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    td.key {{
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #93c5fd;
      width: 35%;
      word-break: break-all;
    }}
    td.val {{
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #e2e8f0;
      word-break: break-all;
    }}
    .button-row {{
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }}
    button {{
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
      transition: background 0.15s ease;
    }}
    button:hover {{
      background: #0369a1;
    }}
    button.secondary {{
      background: #334155;
    }}
    button.secondary:hover {{
      background: #475569;
    }}
    pre.code-block {{
      background: #020617;
      border: 1px solid #1e293b;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-top: 0.5rem;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Port 5001 Request Inspector</h1>
        <div style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">Diagnostic listener running on 0.0.0.0:5001</div>
      </div>
      <span class="badge">Timestamp: {timestamp}</span>
    </div>

    <!-- Main Path Arrival Card -->
    <div class="card">
      <div class="card-title">
        <span>Request Received by Port 5001</span>
        <span style="font-size:0.85rem; color:#94a3b8;">Method: <strong>{self.command}</strong></span>
      </div>
      <div class="highlight-box">
        {self.command} <span class="path-hl">{html.escape(path)}</span>{('?' + html.escape(query)) if query else ''}
      </div>

      <div class="alert {'alert-success' if starts_with_rt else 'alert-warning'}">
        <div style="font-weight:700; margin-bottom:4px;">{html.escape(diagnosis_summary)}</div>
        <div style="font-size:0.9rem; white-space:pre-line;">{html.escape(diagnosis_advice)}</div>
      </div>

      <div class="button-row">
        <button onclick="copyDiagnostics()">Copy Diagnostics JSON</button>
        <button class="secondary" onclick="window.location.reload()">Refresh / Test Again</button>
      </div>
    </div>

    <!-- Key Reverse Proxy Headers -->
    <div class="card">
      <div class="card-title">Key Proxy & Forwarding Headers</div>
      <table>
        <thead>
          <tr><th>Header</th><th>Received Value</th></tr>
        </thead>
        <tbody>
          <tr><td class="key">Host</td><td class="val">{html.escape(host_header)}</td></tr>
          <tr><td class="key">X-Forwarded-For</td><td class="val">{html.escape(x_forwarded_for)}</td></tr>
          <tr><td class="key">X-Forwarded-Proto</td><td class="val">{html.escape(x_forwarded_proto)}</td></tr>
          <tr><td class="key">X-Forwarded-Host</td><td class="val">{html.escape(x_forwarded_host)}</td></tr>
          <tr><td class="key">X-Forwarded-Prefix</td><td class="val">{html.escape(x_forwarded_prefix)}</td></tr>
          <tr><td class="key">Referer</td><td class="val">{html.escape(headers_dict.get('referer', '(none)'))}</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Recommended Caddy Configurations -->
    <div class="card">
      <div class="card-title">Recommended Caddy Configurations</div>
      
      <p style="font-size:0.9rem; color:#94a3b8; margin-bottom:0.75rem;">
        <strong>Recommended Approach (Subpath /RT/):</strong> Forward with <code style="color:#38bdf8;">handle</code> so the path is kept intact.
      </p>
      <pre class="code-block"># Caddyfile (Option A - Recommended):
handle /RT/* {{
    reverse_proxy localhost:5001
}}

# Run Vite in dev mode with:
npm run dev:caddy</pre>

      <p style="font-size:0.9rem; color:#94a3b8; margin-top:1.25rem; margin-bottom:0.75rem;">
        <strong>Alternative Approach (Strip /RT/):</strong> If using <code style="color:#fbbf24;">handle_path</code>, Caddy strips <code style="color:#fbbf24;">/RT/</code> before forwarding:
      </p>
      <pre class="code-block"># Caddyfile (Option B):
handle_path /RT/* {{
    reverse_proxy localhost:5001
}}

# Run Vite in dev mode with:
npm run dev</pre>
    </div>

    <!-- All Headers Table -->
    <div class="card">
      <div class="card-title">All Received Headers ({len(headers_dict)})</div>
      <table>
        <thead>
          <tr><th>Header Name</th><th>Value</th></tr>
        </thead>
        <tbody>
          {headers_rows}
        </tbody>
      </table>
    </div>

    <!-- Query Parameters Table -->
    <div class="card">
      <div class="card-title">Query Parameters ({len(query_params)})</div>
      <table>
        <thead>
          <tr><th>Parameter</th><th>Value</th></tr>
        </thead>
        <tbody>
          {query_rows}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    const diagData = {raw_diagnostics_json};
    function copyDiagnostics() {{
      navigator.clipboard.writeText(JSON.stringify(diagData, null, 2)).then(() => {{
        alert("Diagnostics copied to clipboard!");
      }}).catch(err => {{
        console.error("Clipboard error:", err);
      }});
    }}
  </script>
</body>
</html>
"""
        self.wfile.write(page_html.encode('utf-8'))

    def do_GET(self):
        self.do_all()

    def do_POST(self):
        self.do_all()

    def do_HEAD(self):
        self.do_all()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()


def run_server(port=DEFAULT_PORT):
    if is_port_in_use(port):
        print(f"\n{RED}{BOLD}[ERROR] Port {port} is already in use!{RESET}")
        print(f"{YELLOW}Another process (like Vite) is currently running on port {port}.{RESET}")
        print(f"Stop Vite first (press Ctrl+C in your dev terminal) and run this script again.\n")
        sys.exit(1)

    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, DiagnosticHandler)

    print(f"\n{GREEN}{BOLD}============================================================{RESET}")
    print(f"{GREEN}{BOLD}   Port {port} Caddy & Reverse Proxy Diagnostic Server{RESET}")
    print(f"{GREEN}{BOLD}============================================================{RESET}")
    print(f"Listening on: {CYAN}http://0.0.0.0:{port}{RESET} and {CYAN}http://localhost:{port}{RESET}")
    print(f"Waiting for incoming requests from Caddy or local browser...")
    print(f"{DIM}Press Ctrl+C to stop.{RESET}\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Diagnostic server stopped.{RESET}")
        httpd.server_close()


if __name__ == '__main__':
    target_port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    run_server(target_port)
