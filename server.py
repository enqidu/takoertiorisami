#!/usr/bin/env python3

import http.server
import socketserver
import os
import mimetypes

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the requested path
        path = self.path

        # If path is /, serve index.html
        if path == '/':
            self.path = '/index.html'

        # If path doesn't have extension and no trailing slash, try adding .html
        elif '.' not in os.path.basename(path) and not path.endswith('/'):
            html_path = path + '.html'
            if os.path.isfile('.' + html_path):
                self.path = html_path

        # Call the parent method
        return super().do_GET()

# Set the port
PORT = 8000

# Change to the directory containing the files
os.chdir('/Users/enqidu/Documents/Tako1/Tako3')

# Start the server
with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()