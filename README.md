webssh
====================


WebSSH is a SSH tool in Web

this project is based on [xsank/webssh](https://github.com/xsank/webssh),

Enhencement
------------
- visualization is improved
- easy of use
- provide a way to ssh to target with the url directly
- provide a way to telnet with the server as a bastion hot as well


Information
-----------

> 1.git clone https://github.com/SailByCode/webssh.git

> 2.pip install paramiko && pip install tornado

> 3.python main.py

> 4.open your explorer and input your data then connect,the server init port is `8000`,
> you can modify it in `webssh.conf` file

Usage
-----------
**login with url parameters**: http://127.0.0.1:8000/ssh/127.0.0.1

http://<server_ip>:<server_port>/ssh/<ssh_target>?username=<username>&password=<password>&port=<port>

**parameters of ssh target**:
- username
- password
- port

**login page**: http://127.0.0.1:8000/login

**telent 127.0.01 23**: http://127.0.0.1:8000/telnet/127.0.0.1/23
http://<server_ip>:<server_port>/telnet/<telnet_target>/<telnet_port>?server_username=<server_username>&server_password=<server_password>?server_port=<server_port>

**parameters of server as a ssh bastion host**:
- server_username
- server_password
- server_port

Config
----------
**webssh.conf**
```
#the total config of webssh

#port
port = 8000

#logger settings
log_file_prefix = "webssh.log"
logging = "info"
log_to_stderr = True
log_file_max_size = 2*1024*1024
log_file_num_backups = 7
```
Preview
-------
<div align="center">
    <img src="https://raw.githubusercontent.com/xsank/webssh/master/preview/login.png" width = "600" height = "377" alt="login" />
</div>
<div align="center">
    <img src="https://raw.githubusercontent.com/xsank/webssh/master/preview/htop.png" width = "600" height = "295" alt="htop" />
</div>


