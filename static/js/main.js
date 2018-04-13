// import {Terminal} from 'xterm';
// import * as attach from '../../node_modules/xterm/build/addons/attach/attach';
// import * as fit from '../../node_modules/xterm/build/addons/fit/fit';
// import * as fullscreen from '../../node_modules/xterm/build/addons/fullscreen/fullscreen';
// import * as search from '../../node_modules/xterm/build/addons/search/search';
// import * as webLinks from '../../node_modules/xterm/build/addons/webLinks/webLinks';
// import * as winptyCompat from '../../node_modules/xterm/build/addons/winptyCompat/winptyCompat';


// Terminal.applyAddon(attach);
// Terminal.applyAddon(fit);
// Terminal.applyAddon(fullscreen);
// Terminal.applyAddon(search);
// Terminal.applyAddon(webLinks);
// Terminal.applyAddon(winptyCompat);
// import { Terminal } from 'xterm';
// import * as fit from 'xterm/lib/addons/fit/fit';
// Terminal.applyAddon(fit);

function createTerminal() {
    // Clean terminal
    while (terminalContainer.children.length) {
      terminalContainer.removeChild(terminalContainer.children[0]);
    }
    term = new Terminal({
    //   macOptionIsMeta: optionElements.macOptionIsMeta.enabled,
    //   cursorBlink: optionElements.cursorBlink.checked,
    //   scrollback: parseInt(optionElements.scrollback.value, 10),
    //   tabStopWidth: parseInt(optionElements.tabstopwidth.value, 10),
    //   screenReaderMode: optionElements.screenReaderMode.checked
    });
    // term.applyAddon(attach);
    // term.applyAddon(fit);
    // term.applyAddon(fullscreen);
    // term.applyAddon(search);
    // term.applyAddon(webLinks);
    // term.applyAddon(winptyCompat);


    window.term = term;  // Expose `term` to window for debugging purposes
    term.on('resize', function (size) {
      if (!pid) {
        return;
      }
      var cols = size.cols,
          rows = size.rows,
          url = '/terminals/' + pid + '/size?cols=' + cols + '&rows=' + rows;

      fetch(url, {method: 'POST'});
    });
    protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
    socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + '/terminals/';

    term.open(terminalContainer);
    // term.winptyCompatInit();
    // term.webLinksInit();
    // term.fit();
    term.focus();

    // fit is called within a setTimeout, cols and rows need this.
    setTimeout(function () {
      colsElement.value = term.cols;
      rowsElement.value = term.rows;
      paddingElement.value = 0;

      // Set terminal size again to set the specific dimensions on the demo
      setTerminalSize();

      fetch('/terminals?cols=' + term.cols + '&rows=' + term.rows, {method: 'POST'}).then(function (res) {

        res.text().then(function (processId) {
          pid = processId;
          socketURL += processId;
          socket = new WebSocket(socketURL);
          socket.onopen = runRealTerminal;
          socket.onclose = runFakeTerminal;
          socket.onerror = runFakeTerminal;
        });
      });
    }, 0);
  }


function openTerminal(options) {
    var terminalContainer = document.getElementById('term');
    while (terminalContainer.children.length) {
        terminalContainer.removeChild(terminalContainer.children[0]);
    }
    var client = new WSSHClient();
    var termSize = getTerminalSize();

    terminalContainer.style.width = window.innerWidth;
    terminalContainer.style.height = window.innerHeight-60;
    var term = new Terminal({
        cols: termSize.w,
        rows: termSize.h,
        screenKeys: true,
        useStyle: true});
    window.term = term;
    term.on('data', function (data) {
        client.sendClientData(data);
    });

    term.open(terminalContainer);
    // term.winptyCompatInit();
    // term.webLinksInit();
    // term.fit();
    term.focus();

    // $('.terminal').detach().appendTo('#term');
    // $("#term").show();
    term.write('Connecting...');
    client.connect({
        onError: function (error) {
            term.write('Error: ' + error + '\r\n');
            console.debug('error happened');
        },
        onConnect: function () {
            client.sendInitData(options);
            client.sendClientData('\r');
			if (options.telnet_host) {
				input_telnet(client, options);
			}
            console.debug('connection established');
        },
        onClose: function () {
            term.write("\rconnection closed")
            console.debug('connection reset by peer');
            $('term').hide()
        },
        onData: function (data) {
            term.write(data);
            console.debug('get data:' + data);
        }
    });

	$(window).on('resize', function() {
       size = getTerminalSize();
       term.resize(size.w, size.h);
	});
}

var charWidth = 10;
var charHeight = 16.25;

/**
 * for full screen
 * @returns {{w: number, h: number}}
 */
function getTerminalSize() {
    var width = window.innerWidth;
    var height = window.innerHeight-100;
    var size = {
        w: Math.floor(width / charWidth),
        h: Math.floor(height / charHeight)
    };
    console.log('Terminal Size: ', size)
    return size;
}

function setTerminalSize(term) {
    // var
    // var cols = parseInt(colsElement.value, 10);
    // var rows = parseInt(rowsElement.value, 10);
    // var width = (cols * term.renderer.dimensions.actualCellWidth + term.viewport.scrollBarWidth).toString() + 'px';
    // var height = (rows * term.renderer.dimensions.actualCellHeight).toString() + 'px';
    // terminalContainer.style.width = width;
    // terminalContainer.style.height = height;
    var terminalContainer = document.getElementById('term');
    terminalContainer.style.width = window.innerWidth;
    terminalContainer.style.height = window.innerHeight-40;
    term.fit();
  }


function hideMainLogin() {
    $('#main').css({
        'display': 'none'
    });
}


function store(options) {
    window.localStorage.host = options.host
    window.localStorage.port = options.port
    window.localStorage.username = options.username
    window.localStorage.ispwd = options.ispwd;
    window.localStorage.secret = options.secret
}

function check() {
    return validResult["host"] && validResult["port"] && validResult["username"];
}

function hideMainLogin() {
    $('#main').css({
        'display': 'none'
    });
}

function connect() {
    var remember = $("#remember").is(":checked")
    var options = {
        host: $("#host").val(),
        port: $("#port").val(),
        username: $("#username").val(),
        ispwd: $("input[name=ispwd]:checked").val(),
        secret: $("#secret").val(),
    }

    if (remember) {
        store(options)
    }
    if (check()) {
        openTerminal(options)
        hideMainLogin();
    } else {
        for (var key in validResult) {
            if (!validResult[key]) {
                alert(errorMsg[key]);
                break;
            }
        }
    }
}

function connect_with_options(options) {
    try {
        options = JSON.stringify(options);
        options = JSON.parse(options);
    } catch (err) {
        console.log('Not a valid JSON!');
        console.error(err);
        alert('Not a valid JSON!');
    }
    console.log('Request Data: ', options);

    openTerminal(options);
}

function input_telnet(client, options) {
    var username = options.telnet_username;
	var password = options.telnet_password;
	var host = options.telnet_host;
	var port = options.telnet_port;
	var cmds = options.cmds;

	if (host && port) {
	    var telnet_cmd = 'telnet ' + host + ' ' + port + '\r';
		console.log(telnet_cmd);
        client.sendClientData(telnet_cmd);
    }
	//if (username && password) {
 	//   	setTimeout(function() {
 	//   	    client.sendClientData(username + '\r');
 	//    	}, 500);

 	//   	setTimeout(function() {
 	//   	    client.sendClientData(password + '\r');
 	//    	}, 1000);
 	//   }
 	//	if (cmds) {
 	//  	console.log('cmds: ', cmds)
 	//       $.each(cmds, function(idx, cmd) {
 	//           client.sendClientData(cmd + '\r');
 	//       });
 	//   }
}

function telnet_with_options(options) {
    try {
        options = JSON.stringify(options);
        options = JSON.parse(options);
    } catch (err) {
        console.log('Not a valid JSON!');
        console.error(err);
        alert('Not a valid JSON!');
    }
    console.log(options);

    openTerminal(options);
}

function toggleLogin() {
    $('#login-btn').click(function(evt) {
        $('#main').toggle();
    });
}

function clickConnectBtn() {
    var clickOnce = true;

    $('#connect-btn').click(function() {
		if (clickOnce) {
 	       connect();
		   clickOnce = false;
        }
	});
}

function restore() {
    var host = window.localStorage.host
    var host = window.localStorage.port
    var username = window.localStorage.username
    var ipswd = window.localStorage.ispwd
    var secret = window.localStorage.secret
    if (host && port && username && ipswd && secret) {
        $("#host").val(host);
        $("#port").val(port)
        $("#username").val(username)
        $("input[name=ispwd]:checked").val(ipswd)
        $("#secret").val(secret)
        $("#rememeber").checked('true')
    }
}