const fs = require('fs');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const { WAConnection, MessageType } = require('@adiwajshing/baileys');

const jam = moment().format('HH:mm:ss');
const express = require('express');
const path = require('path');
const { setMaxListeners } = require('process');
const handle = require('./handle.js');

const app = express();

app.use(express.static(`${__dirname}/`));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './src/index.html'));
});
app.listen(process.env.PORT || 8080);

// initialized WAh
const con = new WAConnection();

// Startwith scan qr code
con.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log(`[${moment().format('HH:mm:ss')}] Scan the Qr code with app!`);
});
con.on('credentials-updated', () => {
  // save credentials whenever updated
  console.log(`[${jam}] Credentials update`);
  // get all the auth info we need to restore this session
  const authInfo = con.base64EncodedAuthInfo();
  fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t')); // save this info to a file
});
fs.existsSync('./session.json') && con.loadAuthInfo('./session.json');
// uncomment the following line to proxy the connection; some random proxy I got off of: https://proxyscrape.com/free-proxy-list
// conn.connectOptions.agent = ProxyAgent ('http://1.0.180.120:8080')
con.connect();

// get messages
const split = (string) => [
  string.split(' ', 1).toString(),
  string.split(' ').slice(1).join(' '),
];

async function handlerMessages(msg) {
  if (msg.message !== null) {
    const pesan = msg.message.extendedTextMessage !== null && !msg.key.fromMe ? msg.message.extendedTextMessage.text : msg.message.conversation;
    const nomor = msg.key.remoteJid;
    const [cmd, value] = split(pesan);
    const command = cmd.toLowerCase();
    const badword = [
      'ajg',
      'anjing',
      'jancok',
      'jncok',
      'jancok',
      'asu',
      'asw',
      'kntl',
      'kontol',
      'memek',
      'bangsat',
      'bgst',
      'bangst',
      'bgsat',
      'ngtd',
      'ngentod',
      'telaso',
      'tlso',
    ];

    // Handler if received new message
    // message startsWith quran
    if (command === '!quran') {
      process.stdout.write(`\r [${jam}] ${nomor.split('@s.whatsapp.net')[0].replace('62', '0')} Mengirim permintaan: ${pesan} `);
      const textToSend = handle.quranSurah(value);
      await con.sendMessage(nomor, textToSend, MessageType.text, {
        quoted: msg,
      });
      console.log(' ..done');

      // if message startsWith select
    } else if (command === '!select') {
      process.stdout.write(`\r [${jam}] ${nomor.split('@s.whatsapp.net')[0].replace('62', '0')} Mengirim permintaan: ${pesan} `);
      const textToSend = handle.select(value);
      await con.sendMessage(nomor, textToSend, MessageType.text, { quoted: msg });
      console.log(' ..done');
    } else if (command === '!search') {
      process.stdout.write(`\r [${jam}] ${nomor.split('@s.whatsapp.net')[0].replace('62', '0')} Mengirim permintaan: ${pesan}`);
      const textToSend = handle.search(value.toLowerCase());
      if (textToSend.length === 1) {
        await con.sendMessage(nomor, textToSend[0], MessageType.text, {
          quoted: msg,
        });
      } else {
        textToSend.forEach(async (mainText) => {
          await con.sendMessage(nomor, mainText, MessageType.text);
        });
      }
      console.log(' ..done');
    } else if (command === '!specify') {
      process.stdout.write(`\r [${jam}] ${nomor.split('@s.whatsapp.net')[0].replace('62', '0')} Mengirim permintaan: ${pesan} `);
      const textToSend = handle.specify(value);
      await con.sendMessage(nomor, textToSend, MessageType.text, {
        quoted: msg,
      });
      console.log(' ..done');
    } else if (command === '!command') {
      process.stdout.write(`\r [${jam}] ${nomor.split('@s.whatsapp.net')[0].replace('62', '0')} Mengirim permintaan: ${pesan}`);
      const textToSend = handle.command();
      await con.sendMessage(nomor, textToSend, MessageType.text, { quoted: msg });
      console.log(' ..done');
    } else if (pesan !== '') {
      let textToSend = '';
      const pesanlist = pesan.toLowerCase().split(' ');
      pesanlist.forEach((kata) => {
        if (badword.includes(kata)) {
          console.log(`[${jam}] ${nomor.split('@s.whatsapp.net')[0].replace('62', '0')} Badword detected: ${pesan}`);
          textToSend = 'Jangan selalu ngebadword kawan. Itu sangat tidak baik';
          return;
        } if (nomor.endsWith('net') && textToSend === '') {
          textToSend = `Command *${pesan}* tidak terdaftar\nType *!command* untuk melihat daftar perintah`;
        }
      });

      if (textToSend !== '') {
        con.sendMessage(nomor, textToSend, MessageType.text, { quoted: msg });
      }
    }
  }
}

con.setMaxListeners(50);
async function messagesHandler() {
  con.on('open', async () => { // firstly running, it will be get all unread messages
    console.log(`[${jam}] You have ${con.chats.length} chats`);
    const getunread = await con.loadAllUnreadMessages();
    const unread = [...new Set(getunread)];
    if (unread.length !== 0) {
      unread.forEach(async (m) => {
        try {
          await handlerMessages(m);
          await con.chatRead(m.key.remoteJid);
        } catch (err) {
          console.log(`[${jam}] ${err}`);
        }
      });
    }
  });
  con.on('message-new', async (msg) => {
    try {
      await con.chatRead(msg.key.remoteJid);
      handlerMessages(msg);
    } catch (err) {
      console.log(`[${jam}] ${err}`);
      handlerMessages(msg);
    }
  });
}
try {
  messagesHandler();
} catch (err) {
  console.log(`[${jam}] ${err}`);
}
