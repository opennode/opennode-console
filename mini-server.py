#!/usr/bin/env python

"""Minimalistic web-server for testing of the OpenNode Console."""

import SimpleHTTPServer
import SocketServer

PORT = 8080

handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), handler)

print "serving at port", PORT
httpd.serve_forever()
