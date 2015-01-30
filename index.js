var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyATH0", {
    baudrate: 115200
},
true); // this is the openImmediately flag [default is true]
var XMPP = require('node-xmpp');
// 构建一个XMPP 客户端并登录
var xmpp = new XMPP.Client({
    jid: 'weijiangbo@vps/Spark 2.6.3',
    password: '123',
    host: '27.54.252.133',
    port: 5222,
    preferred: 'Plain'
});

serialPort.open(function(error) {
    if (error) {
        console.log('failed to open: ' + error);
    } else {
        console.log('open');
        // 硬件传输上来的信息
        serialPort.on('data',
        function(data) {
            console.log('data received: ' + data);

            // 发送消息(可以在这里将硬件状态发给用户)
            xmpp.send(new XMPP.Element('message', {
                to: 'lisen@vps/Spark 2.6.3',
                type: 'chat'
            }).c('body').t('msg:' + data))

        });

        // 向硬件传输下去的信息
        //serialPort.write("Hello Arduino 32u4\n",
        //function(err, results) {
        //	console.log('err ' + err);
        //	console.log('results ' + results);
        //});
    }
});

// 如果在线的情况下，显示我的状态为online
xmpp.on('online',
function() {
    console.log('Yes, I\'m connected!');
    xmpp.send(new XMPP.Element('presence', {}).c('show').t('online').up());

    // 发送消息(可以在这里将硬件状态发给用户)
    //	xmpp.send(new XMPP.Element('message', {
    //		to: 'lisen@vps/Spark 2.6.3',
    //		type: 'chat'
    //	}).c('body').t('msg,helloworld'))

    // 接收用户发来的消息(可以在这里将用户指令发给硬件执行)
    xmpp.on('stanza',
    function(stanza) {
        //console.log('me:' + stanza)
        if (stanza.attrs.type == 'error') {
            util.log('[error] ' + stanza);
            return;
        }

        // ignore everything that isn't a room message
        if (!stanza.is('message') || !stanza.attrs.type == 'chat') {
            return;
        }

        var body = stanza.getChild('body');
        // message without body is probably a topic change
        if (!body) {
            return;
        }
        var msg = body.getText();
        console.log('msg body:' + msg)

        // 向硬件传输下去的信息
        serialPort.write(msg,
        function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });

    })

});

// 异常状态监听
xmpp.on('error',
function(err) {
    console.error(err);
});
