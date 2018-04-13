/**
 * File: main.js
 * Description:
 *
 * Created Date: 2018-04-13
 * Author: Sail
 *
 * Last Modified: 2018-04-13
 */


function openTerminal(options) {
    // Terminal.applyAddon(attach);
    // Terminal.applyAddon(fit);
    // Terminal.applyAddon(fullscreen);
    // Terminal.applyAddon(search);
    // Terminal.applyAddon(webLinks);
    // Terminal.applyAddon(winptyCompat);
    console.log('Create terminal ...');
    var terminalContainer = document.getElementById('term');
    while (terminalContainer.children.length) {
        terminalContainer.removeChild(terminalContainer.children[0]);
    }
    var client = new WSSHClient();

    terminalContainer.style.width = window.innerWidth;
    terminalContainer.style.height = window.innerHeight-60;

    var term = new Terminal({
        // cols: geometry.width,
        // rows: geometry.height,
        screenKeys: true,
        useStyle: true});
    window.term = term;

    term.on('data', function (data) {
        client.sendClientData(data);
    });

    term.open(terminalContainer);
    geometry = getGeometry(term);
    term.resize(geometry.cols, geometry.rows);

    // term.attach()
    // setTimeout(() => {
    //     fit(term)
    // }, 100);
    // term.toggleFullScreen();
    // term.search()
    // term.webLinks()
    // term.winptyCompatInit();

    term.focus();

    // $('.terminal').detach().appendTo('#term');
    $("#term").show();
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
        setTimeout(() => {
            geometry = getGeometry(term);
            term.resize(geometry.cols, geometry.rows);
        }, 100);
        // term.fit();
	});
}

/**
 * for full screen
 * @returns {{cols: number, rows: number}}
 */
function getGeometry(term) {
    var cellWidth = 10;
    var cellHeight = 16.25;

    var $element = $('#term');
    var elementPadding = {
        top: parseInt($element.css('padding-top')),
        bottom: parseInt($element.css('padding-bottom')),
        right: parseInt($element.css('padding-right')),
        left: parseInt($element.css('padding-left'))
    };
    var elementPaddingVer = elementPadding.top + elementPadding.bottom;
    var elementPaddingHor = elementPadding.right + elementPadding.left;
    var availableHeight = window.innerHeight - elementPaddingVer - 50;
    var availableWidth = window.innerWidth - elementPaddingHor - 20;
    if (term && term.element.parentElement && term.renderer) {
        cellWidth = term.renderer.dimensions.actualCellWidth;
        cellHeight = term.renderer.dimensions.actualCellHeight;
    }

    var size = {
        rows: Math.floor(availableHeight / cellHeight),
        cols: Math.floor(availableWidth / cellWidth)
    };
    // console.log('Terminal Size: ', size)
    return size;
}

function hideMainLogin() {
    $('#main').css({
        'display': 'none'
    });
}

function storeOptions(options) {
    window.localStorage.host = options.host
    window.localStorage.port = options.port
    window.localStorage.username = options.username
    window.localStorage.ispwd = options.ispwd;
    window.localStorage.secret = options.secret
}

function checkInput(options) {
    validResult['host'] = options['host'];
    validResult["port"] = options['port'];
    validResult['username'] = options['username'];
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
        storeOptions(options)
    }


    if (checkInput(options)) {
        openTerminal(options)
        hideMainLogin();
    } else {
        console.log(validResult);
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
		// if (clickOnce) {
            connect();
		    clickOnce = false;
        // }
	});
}

function restoreOptions() {
    var host = window.localStorage.host;
    var port = window.localStorage.port;
    var username = window.localStorage.username;
    var ipswd = window.localStorage.ispwd;
    var secret = window.localStorage.secret;
    if (host && port && username && ipswd && secret) {
        $("#host").val(host);
        $("#port").val(port);
        $("#username").val(username);
        $("input[name=ispwd]:checked").val(ipswd);
        $("#secret").val(secret);
        $("#remember").attr('checked', true);
    }
}