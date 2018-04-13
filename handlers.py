__author__ = 'xsank'

import logging

import tornado.websocket
from tornado import escape
from daemon import Bridge
from data import ClientData
from utils import check_ip, check_port
import json


class IndexHandler(tornado.web.RequestHandler):
    def get(self, host):
        username = self.get_argument('username', 'automation')
        password = self.get_argument('password', 'password')
        port = self.get_argument('port', '22')

        options = {}
        options["host"] = host
        options["port"] = port
        options["username"] = username
        options["secret"] = password
        options["ispwd"] = True
        options_str = escape.json_encode(options)
        logging.info('Request data: ' + str(options))
        # logging.info(options_str)

        self.render("index.html", options=options_str)

    # # call this method when websocket is closed
    # def unregister(self, callback):
    #     self.callbacks.remove(callback)


class TelnetHandler(tornado.web.RequestHandler):
    def get(self, telnet_host, telnet_port):
        server_username = self.get_argument('server_username', 'automation')
        server_password = self.get_argument('server_password', 'password')
        server_port = self.get_argument('server_port', '22')
        #username = self.get_argument('username', 'automation')
        #password = self.get_argument('password', 'password')
        #cmds = self.get_argument('cmds', '')

        options = {}
        options["host"] = '127.0.0.1'
        options["port"] = server_port
        options["username"] = server_username
        options["secret"] = server_password
        options["ispwd"] = True
        
        options["telnet_host"] = telnet_host
        options["telnet_port"] = telnet_port
        #options["telnet_username"] = username
        #options["telnet_password"] = password
        #options["cmds"] = cmds.split(',')
        options_str = escape.json_encode(options)
        logging.info('Request data: ' + str(options))
        # logging.info(options_str)

        self.render("telnet.html", options=options_str)

    # call this method when websocket is closed
    def unregister(self, callback):
        self.callbacks.remove(callback)


class LoginHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("login.html")


class WSHandler(tornado.websocket.WebSocketHandler):
    clients = dict()

    def get_client(self):
        return self.clients.get(self._id(), None)

    def put_client(self):
        bridge = Bridge(self)
        self.clients[self._id()] = bridge

    def remove_client(self):
        bridge = self.get_client()
        if bridge:
            bridge.destroy()
            del self.clients[self._id()]

    @staticmethod
    def _check_init_param(data):
        return check_ip(data["host"]) and check_port(data["port"])

    @staticmethod
    def _is_init_data(data):
        return data.get_type() == 'init'

    def _id(self):
        return id(self)

    def open(self):
        self.put_client()

    def on_message(self, message):
        bridge = self.get_client()
        client_data = ClientData(message)
        if self._is_init_data(client_data):
            if self._check_init_param(client_data.data):
                bridge.open(client_data.data)
                logging.info('connection established from: %s' % self._id())
            else:
                self.remove_client()
                logging.warning('init param invalid: %s' % client_data.data)
        else:
            if bridge:
                bridge.trans_forward(client_data.data)

    def on_close(self):
        self.remove_client()
        logging.info('client close the connection: %s' % self._id())

