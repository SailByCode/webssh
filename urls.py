__author__ = 'xsank'

from handlers import *


handlers = [
    (r"/ssh/(\d+\.\d+\.\d+\.\d+)/?", IndexHandler),
    (r"/login", LoginHandler),
    (r"/ws", WSHandler),
    (r"/telnet/(\d+\.\d+\.\d+\.\d+)/(\d+)/?", TelnetHandler)
]
