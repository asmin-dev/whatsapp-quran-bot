const fs = require('fs');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const difflib = require('difflib');
const {
  WAConnection,
  MessageType,
  ChatModification,
} = require('@adiwajshing/baileys');
const quran = require('./lib/init');

const adminBot = '6281242873775@s.whatsapp.net';
const bot = new WAConnection();

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

/* Start with generating qrcode */
bot.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log(`[${moment().format('HH:mm:ss')}] Scan QR with whatsapp app`);
});

bot.on('credentials-updated', () => {
  bot.regenerateQRIntervalMs = null;
  const authInfo = bot.base64EncodedAuthInfo();
  fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t'));
});
fs.existsSync('./session.json') && bot.loadAuthInfo('./session.json');
bot.connect();

/*  Global function  */
const split = (string) => [
  string.split(' ', 1).toString(),
  string.split(' ').slice(1).join(' '),
];

function getName(key) {
  const getname = bot.contacts[key];
  if (getname !== undefined) {
    let { name } = getname;
    name = name ?? getname.notify;
    name = name ?? getname.vname;
    name = name ?? undefined;
    return name;
  }
  return undefined;
}

async function ExtractMsg(msg) {
  const from = {};
  const grup = {};
  const message = {};
  const text = msg.message;
  const sender = msg.key.remoteJid;
  const isGroup = !!sender.endsWith('us');
  from.from = sender;
  from.name = getName(sender);
  if (text) {
    const type = Object.keys(text)[0];
    switch (type) {
      case 'conversation':
        message.type = 'text';
        message.msg = text.conversation;
        break;

      case 'extendedTextMessage':
        message.type = 'text';
        message.msg = text.extendedTextMessage.text;
        break;

      case 'stickerMessage':
        message.type = type;
        message.msg = await bot.downloadMediaMessage(msg);
        break;

      case 'imageMessage':
        message.type = type;
        message.msg = await bot.downloadMediaMessage(msg);
        break;

      case 'audioMessage':
        message.type = type;
        message.msg = await bot.downloadMediaMessage(msg);
        break;

      case 'videoMessage':
        message.type = type;
        message.msg = await bot.downloadMediaMessage(msg);
        break;

      default:
        message.type = undefined;
        message.msg = undefined;
    }
  } else {
    message.type = undefined;
    message.msg = undefined;
  }
  from.message = message;
  from.isGroup = isGroup;
  from.fromMe = msg.key.fromMe;
  if (isGroup && !msg.key.fromMe) {
    grup.member = msg.participant;
    grup.memberName = getName(msg.participant);
    from.senderGroup = grup;
  } else {
    grup.member = undefined;
    grup.memberName = undefined;
    from.senderGroup = grup;
  }
  from.quoted = msg;
  return from;
}

async function send(sender, message, type, reply, quoted) {
  // Check user already exist in database
  const user = fs.readFileSync('./users.txt', 'utf-8');
  if (!user.includes(sender)) {
    fs.writeFileSync('./users.txt', `${sender}\n`, { flag: 'a+' });
    console.log(`[${moment().format('HH:mm:ss')}] Added new user: ${getName(sender)}`);
  }
  try {
    if (reply) {
      // filtering group
      if (sender.endsWith('us')) {
        try {
          await bot.sendMessage(sender, message, type, { quoted });
        } catch (err) {
          console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
        }
      } else {
        try {
          await bot.sendMessage(sender, message, type);
        } catch (err) {
          console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
        }
      }
    } else {
      try {
        await bot.sendMessage(sender, message, type);
      } catch (err) {
        console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
      }
    }
  } catch (err) {
    console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
  }
}

/* Start */
const print = (username, message) => console.log(`[${moment().format('HH:mm:ss')}] ${username} Mengirim permintaan ${message}`);
async function messageHandler(msg) {
  const sender = await ExtractMsg(msg);
  if (!sender.from.includes('status')) {
    try {
      await bot.chatRead(sender.from);
    } catch (err) {
      console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
    }
    const username = sender.isGroup ? sender.senderGroup.memberName : sender.name;
    if (sender.message.type === 'text') {
      const [cmd, value] = split(sender.message.msg, true, sender.quoted);
      switch (cmd) {
        case '!command': {
          print(username, sender.message.msg);
          const sending = quran.command(username);
          send(sender.from, sending, MessageType.text, true, sender.quoted);
          break;
        }

        case '!quran': {
          print(username, sender.message.msg);
          const sending = quran.quranSurah(value);
          send(sender.from, sending, MessageType.text, true, sender.quoted);
          break;
        }

        case '!select': {
          print(username, sender.message.msg);
          const sending = quran.select(value);
          send(sender.from, sending, MessageType.text, true, sender.quoted);
          break;
        }

        case '!search': {
          print(username, sender.message.msg);
          const sending = quran.search(value);
          if (sending.length === 0) {
            send(sender.from, sending[0], MessageType.text, true, sender.quoted);
          } else {
            send(sender.from, sending[0], MessageType.text, true, sender.quoted);
            const slices = sending.slice(1);
            slices.forEach((pesan) => {
              send(sender.from, pesan, MessageType.text);
            });
          }
          break;
        }

        case '!specify': {
          print(username, sender.message.msg);
          const sending = quran.specify(value);
          send(sender.from, sending, MessageType.text, true, sender.quoted);
          break;
        }

        case '!list': {
          print(username, sender.message.msg);
          const sending = quran.daftarSurah();
          send(sender.from, sending, MessageType.text, true, sender.quoted);
        }
          break;
        /* Admin menu */
        case '!br': {
          if (
            sender.from === adminBot
          || sender.senderGroup.member === adminBot
          ) {
            if (value !== '') {
              const alluser = fs.readFileSync('users.txt', 'utf-8').split('\n');
              alluser.pop;
              alluser.forEach((user) => {
                send(user, value, MessageType.text);
              });
            } else {
              send(adminBot, 'Textnya bang jagoo', MessageType.text);
            }
          }
          break;
        }
        case '!delete': {
          if (
            sender.from === adminBot
          || sender.senderGroup.member === adminBot
          ) {
            const alluser = fs.readFileSync('users.txt', 'utf-8').split('\n');
            alluser.pop;
            alluser.forEach(async (user) => {
              await bot.modifyChat(user, ChatModification.delete);
            });
          }
          break;
        }
        default: {
          let empty = '';
          const message = sender.message.msg;
          if (message !== '') {
          // check badword
            const toList = message.split(' ');
            toList.forEach((word) => {
              if (badword.includes(word.toLowerCase())) {
                empty = 'Astagfirullah, jangan selalu ngebadword teman.\nItu sangat tidak baik ';
              }
            });
            if (empty === '') {
              if (message.length > 10) {
                const salam = ['Assalamualaikum'];
                const reply = difflib.getCloseMatches(message.toLowerCase(), salam);
                if (reply[0] !== undefined) {
                  empty = `Waalaikumsallam kak ${username}`;
                } else if (!sender.isGroup) {
                  empty = `Command *${message}* tidak terdaftar!\n`;
                  empty += 'Ketik *!command* untuk melihat daftar perintah';
                }
              } else if (!sender.isGroup) {
                empty = `Command *${message}* tidak terdaftar!\n`;
                empty += 'Ketik *!command* untuk melihat daftar perintah';
              }
            }
            if (empty !== '' && !sender.fromMe) {
              send(sender.from, empty, MessageType.text, true, sender.quoted);
            }
          }
        }
      }
    } else if (!sender.isGroup && !sender.fromMe) {
      if (sender.message.type === 'stickerMessage') {
        send(sender.from, sender.message.msg, MessageType.sticker);
      } else {
        send(sender.from, `Maaf kak ${username}, Saat ini saya hanya mengenali pesan yang berupa text`, MessageType.text);
      }
    }
  }
}
async function getUnread() {
  try {
    const loadUnread = await bot.loadAllUnreadMessages();
    const results = [...new Set(loadUnread)]; // delete element if duplicate
    results.forEach((unread) => {
      messageHandler(unread);
    });
  } catch (e) {
    console.log(`[${moment().format(('HH:mm:ss'))}] ${e}`);
  }
}
let succesaUnread = false;
async function incomingMessage() {
  bot.on('message-new', async (msg) => {
    if (!succesaUnread) {
      await getUnread();
      succesaUnread = true;
    } else {
      try {
        await messageHandler(msg);
      } catch (err) {
        console.log(`[${moment().format('HH:mm:ss')}] ${err}`);
      }
    }
  });
  bot.on('group-participants-update', (msg) => {
    const member = getName(msg.participants);
    const grup = getName(msg.jid);
    if (msg.action === 'add') {
      const d = msg.participants[0].split('@')[0];
      bot.sendMessage(msg.jid, `Hi kak @${d} , Selamat datang di Grub ${grup} `, MessageType.extendedText, { contextInfo: { mentionedJid: msg.participants }, previewType: 0 });
    }
  });
}

incomingMessage()
  .catch((err) => console.log(`[${moment().format('HH:mm:ss')}] ${err}`));
