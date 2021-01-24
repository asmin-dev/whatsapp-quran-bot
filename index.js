/*
 *
 * WHATSAPP QURAN BOT
 * AUTHOR: ASMIN | ZETT ID
 * TEAM: XIUZCODE
 * WE LOVE OPEN SOURCE
 *
 *
 */
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const difflib = require('difflib');
const { WAConnection, MessageType, WA_MESSAGE_STUB_TYPE } = require('@adiwajshing/baileys');

const express = require('express');
const path = require('path');
const handle = require('./lib/init');

const app = express();

app.use(express.static(`${__dirname}/`));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './src/index.html'));
});
app.listen(process.env.PORT || 8080);

// initialized WAh
const OWNER = '6281242873775@s.whatsapp.net';
const con = new WAConnection();

// Startwith scan qr code
con.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  con.regenerateQRIntervalMs = null;
  console.log(`[${moment().format('HH:mm:ss')}] Scan the Qr code with app!`);
});
con.on('credentials-updated', () => {
  // save credentials whenever updated
  console.log(`[${moment().format(('HH:mm:ss'))}] Credentials update`);
  // get all the auth info we need to restore this session
  const authInfo = con.base64EncodedAuthInfo();
  fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t')); // save this info to a file
});
fs.existsSync('./session.json') && con.loadAuthInfo('./session.json');
con.connect();

// get messages
const split = (string) => [
  string.split(' ', 1).toString(),
  string.split(' ').slice(1).join(' '),
];

async function handlerMessages(msg) {
  const jam = moment().format('HH:mm:ss');
  if (msg.message) {
    let user = '';
    const nomor = msg.key.remoteJid;
    const pesan = msg.message.extendedTextMessage !== null && !msg.key.fromMe
      ? msg.message.extendedTextMessage.text
      : msg.message.conversation;
    const rawName = con.chats.get(msg.participant) === undefined
      ? con.contacts[nomor]
      : con.contacts[msg.participant];
    const nama = rawName !== undefined ? rawName.notify : undefined;
    if (nomor.endsWith('us')) {
      user = `${nama} di grub ${con.chats.get(nomor).name}`;
    } else if (nomor.endsWith('net')) {
      user = `[${nomor.replace('@s.whatsapp.net', '')}] ${nama}`;
    }
    const [cmd, value] = split(pesan);
    const command = cmd.toLowerCase();
    const badword = [
      'ajg',
      'anjing',
      'anjink',
      'anjinc',
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
      'ngntod',
      'ngentod',
      'telaso',
      'tlso',
      'babi',
    ];

    // Handler if received new message
    const type = Object.keys(msg.message)[0];
    if (type === 'stickerMessage' && !msg.key.fromMe && nomor.endsWith('.net')) {
      const buffer = await con.downloadMediaMessage(msg);
      con.sendMessage(nomor, buffer, MessageType.sticker);
      con.chatRead(nomor);
    }
    // message startsWith quran
    if (command === '!quran') {
      process.stdout.write(
        `\r [${jam}] ${user} Mengirim permintaan: ${pesan} `,
      );
      const textToSend = handle.quranSurah(value);
      await con.sendMessage(nomor, textToSend, MessageType.text, {
        quoted: msg,
      });
      await con.chatRead(nomor);
      console.log(' ..done');

      // if message startsWith select
    } else if (command === '!select') {
      process.stdout.write(
        `\r [${jam}] ${user} Mengirim permintaan: ${pesan} `,
      );
      const textToSend = handle.select(value);
      await con.sendMessage(nomor, textToSend, MessageType.text, {
        quoted: msg,
      });
      await con.chatRead(nomor);
      console.log(' ..done');
    } else if (command === '!search') {
      process.stdout.write(
        `\r [${jam}] ${user} Mengirim permintaan: ${pesan} `,
      );
      process.stdout.write(
        `\r [${jam}] ${user} Mengirim permintaan: ${pesan} `,
      );
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
      await con.chatRead(nomor);
      console.log(' ..done');
    } else if (command === '!specify') {
      process.stdout.write(
        `\r [${jam}] ${user} Mengirim permintaan: ${pesan} `,
      );
      const textToSend = handle.specify(value);
      await con.sendMessage(nomor, textToSend, MessageType.text, {
        quoted: msg,
      });
      await con.chatRead(nomor);
      console.log(' ..done');
    } else if (command === '!command') {
      process.stdout.write(
        `\r [${jam}] ${user} Mengirim permintaan: ${pesan} `,
      );
      const textToSend = handle.command(nama);
      await con.sendMessage(nomor, textToSend, MessageType.text, {
        quoted: msg,
      });
      await con.chatRead(nomor);
      console.log(' ..done');
    } else if (command === '!broadcast') {
      let broadcast = '';
      if (nomor === OWNER || msg.participant === OWNER) {
        if (value === '') {
          con.sendMessage(nomor, 'Text nya bang jago', MessageType.text);
          con.chatRead(nomor);
        } else {
          broadcast += `${value}`;
          const allUser = fs.readFileSync('./users.txt', 'utf-8').split('\n');
          allUser.pop();
          await allUser.forEach(async (pengguna) => {
                await con.sendMessage(pengguna, broadcast, MessageType.text);
                con.chatRead(nomor);
          });
        }
      } else {
        con.sendMessage(
          nomor,
          '*Maaf, kamu bukan bos saya!*',
          MessageType.text,
        );
        await con.chatRead(nomor);
      }
    } else if (command === '!filter') {
      let textToSend = '';
      if (nomor === OWNER || nomor === msg.participant) {
        let resFilter = '';
        const allUser = fs.readFileSync('users.txt', 'utf8').split('\n');
        allUser.pop();
        const userActive = await con.chats.toJSON();
        allUser.forEach((userCheck) => {
          const res = userActive.find((o) => o.jid === userCheck);
          if (!res) {
            const nameToDelete = con.contacts[userCheck];
            textToSend += `Delete user: ${nameToDelete.jid.includes('.net') ? nameToDelete.notify : nameToDelete.jid}\n`;
          } else {
            resFilter += `${userCheck}\n`;
          }
        });
        fs.writeFileSync('users.txt', resFilter, { flag: 'w' });
        if (textToSend === '') {
          con.sendMessage(OWNER, 'No users deleting', MessageType.text);
        } else {
          con.sendMessage(OWNER, textToSend, MessageType.text);
        }
      } else {
        con.sendMessage(nomor, 'Kamu bukan bos saya', MessageType.text);
      }
    } else if (pesan !== '') {
      let textToSend = '';
      const pesanlist = pesan.toLowerCase().split(' ');
      pesanlist.forEach((kata) => {
        if (badword.includes(kata)) {
          process.stdout.write(
            `\r [${jam}] ${user} badword detected: ${pesan} `,
          );
          textToSend = 'Astagfirullah, jangan selalu ngebadword kawan. Itu sangat tidak baik';
          return;
        }
        if (textToSend === '') {
          const salam = ['assalamualaikum'];
          if (pesan.length > 10) {
            const reply = difflib.getCloseMatches(pesan.toLowerCase(), salam)[0];
            if (reply !== undefined) {
              textToSend = `Waalaikumsalam kak ${nama}`;
            } else if (nomor.endsWith('.net')) {
              textToSend = `Command *${pesan}* tidak terdaftar\nType *!command* untuk melihat daftar perintah`;
            }
          } else if (nomor.endsWith('.net')) {
            textToSend = `Command *${pesan}* tidak terdaftar\nType *!command* untuk melihat daftar perintah`;
          }
        }
      });

      if (textToSend !== '') {
        con.sendMessage(nomor, textToSend, MessageType.text, { quoted: msg });
        await con.chatRead(nomor);
      }
    }
  }
}
async function getMessagesUnread() {
  const getunread = await con.loadAllUnreadMessages();
  const results = [...new Set(getunread)];
  if (results.length !== 0) {
    results.forEach(async (m) => {
      try {
        await handlerMessages(m);
        if (m.key.remoteJid.endsWith('.us')) {
          con.chatRead(m.key.remoteJid);
        }
      } catch (err) {
        console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
      }
    });
  }
  const allChat = await con.chats.toJSON();
  await allChat.forEach((chat) => {
    const allready = fs.readFileSync('users.txt', 'utf-8');
    if (allready.includes(chat.jid) === false && chat.jid.includes('status') === false) {
      const nama = con.contacts[chat.jid] !== undefined ? con.contacts[chat.jid].notify : undefined;
      console.log(`[${moment().format('HH:mm:ss')}] Added new user: ${nama}`);
      fs.writeFileSync('users.txt', `${chat.jid}\n`, { flag: 'a+' });
    }
  });
}

async function messagesHandler() {
  let done = false;
  await con.on('message-new', async (msg) => {
    try {
      const content = fs.readFileSync('users.txt', 'utf-8');
      if (content.includes(msg.key.remoteJid) === false && msg.key.remoteJid !== 'status@broadcast') {
        console.log(`[${moment().format('HH:mm:ss')}] Added new user: ${con.contacts[msg.key.remoteJid].notify}`);
        fs.writeFileSync('users.txt', `${msg.key.remoteJid}\n`, { flag: 'a+' });
      }
      if (msg.key.remoteJid !== 'status@broadcast') {
        await handlerMessages(msg);
        if (msg.key.remoteJid.endsWith('.us')) {
          con.chatRead(msg.key.remoteJid);
        }
      }
      if (!done) {
        getMessagesUnread();
        done = true;
      }
    } catch (err) {
      console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
    }
  });
}
try {
  messagesHandler();
} catch (err) {
  console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
}
