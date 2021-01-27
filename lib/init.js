const pars = require('./send');
const quran = require('./parsing');

const split = (string) => [string.split(' ', 1).toString(), string.split(' ').slice(1).join(' ')];
function quranSurah(value) {
  let textToSend = '';
  if (value === '') {
    textToSend += 'Penggunaan *!quran [surah|nomor]*\n';
    textToSend += 'Contoh: *!quran 1* atau *!quran alfatihah*\n\n';
    textToSend += '*[ NOTE ] PENULISAN SURAH JANGAN PAKAI SPASI*';
  } else if (!parseInt(value)) {
    const surah = quran.selectSurah(value);
    if (surah) {
      textToSend += pars.sendSelectSurah(surah);
    } else {
      textToSend += `Surah *${value}* tidak ada`;
    }
  } else {
    const surah = quran.selectSurah(value);
    if (surah) {
      textToSend += pars.sendSelectSurah(surah);
    } else {
      textToSend += `Surah ke- *${value}* tidak ada`;
    }
  }
  return textToSend;
}
function select(value) {
  let textToSend = '';
  if (value === '') {
    textToSend += '\nTampilkan ayat tertentu pada surah\n';
    textToSend += 'Penggunaan:\n';
    textToSend += '  *!select [nama|nomor - ayat]*\n';
    textToSend += 'Contoh:\n';
    textToSend += '  *!select Arrahman 57*\n\n';
    textToSend += '*[ NOTE ] PENULISAN NAMA SURAH JANGAN PAKAI SPASI*';
  } else {
    const [keyword, ayat] = value.split(' ');
    const surah = quran.selectAyat(keyword, ayat);
    if (!surah.surah) {
      textToSend += `\nSurah *${keyword}* tidak ditemukan\n\nPastikan format benar`;
    } else if (surah.data.length !== 0) {
      textToSend += pars.sendSelectSurah(surah);
    } else if (surah.surah) {
      if (ayat === undefined) {
        textToSend += 'Kamu melupakan ayat-nya kaka 😇, pastikan format benar ';
      } else {
        textToSend += `Ayat *${ayat}* tidak ada di surah *${surah.surah}*`;
      }
    }
  }
  return textToSend;
}
function search(value) {
  const newArr = [];
  let textToSend = '';
  if (value !== '') {
    const arr = quran.findAyat(value.toLowerCase());
    if (arr.length === 0) {
      textToSend += `Keyword *${value}* tidak ditemukan`;
      newArr.push(textToSend);
    } else {
      arr.forEach((ayat) => {
        textToSend = pars.sendFindAyat(ayat);
        // detecting word or other
        const word = value.split(' ')[1] === undefined ? value : ayat.data.arti;
        const replacer = new RegExp(`${word}`, 'gi');
        const textSend = textToSend.replace(replacer, `*${word}*`);
        newArr.push(textSend);
      });
    }
  } else {
    textToSend += '\nPenggunaan\nContoh *!search Adam*\n';
    newArr.push(textToSend);
  }
  return newArr;
}
function specify(value) {
  console.log(value);
  let textToSend = '';
  if (value === '') {
    textToSend += 'Mendaptkan surah secara spesifik\n';
    textToSend += 'Penggunaan: \n';
    textToSend += '  *!specify [nama|nomor - awal:akhir]*\n';
    textToSend += 'Contoh:\n';
    textToSend += '  *!specify 1 5:*  => Mulai dari ayat 5 sampai selesai\n';
    textToSend += '  *!specify 1 :5*  => Mulai dari ayat 1 sampai 5\n';
    textToSend += '  *!specify 2 5:10*  => Mulai dari ayat 5 sampai 10\n\n';
  } else {
    const [surah, range] = split(value);
    if (range.includes(':')) {
      if (range.startsWith(':')) { // handler message if startsWith "-"
        const result = quran.selectRange(surah, undefined, range.replace(':', ''));
        if (result.data.length === 0) {
          textToSend += `Ayat *${range.replace(':', '')}* tidak di temukan`;
        } else {
          textToSend += pars.sendSelectSurah(result);
        }
      } else if (range.endsWith(':')) {
        const result = quran.selectRange(surah, range.replace(':', ''));
        textToSend += pars.sendSelectSurah(result);
      } else {
        const [start, end] = range.split(':');
        const result = quran.selectRange(surah, start, end);
        if (result.data === undefined) {
          textToSend += 'Penulisan nama surah salah 😇';
        } else if (result.data.length === 0) {
          textToSend += 'Format salah!, ayat mulai lebih besar dari ayat akhir';
        } else {
          textToSend += pars.sendSelectSurah(result);
        }
      }
    } else if (!range.includes('-') || range === '') {
      textToSend += '*Format salah*\n';
      textToSend += 'Contoh:\n';
      textToSend += '  *!specify 1 5:*  => Mulai dari ayat 5 sampai selesai\n';
      textToSend += '  *!specify 1 :5*  => Mulai dari ayat 1 sampai 5\n';
      textToSend += '  *!specify 2 5:10*  => Mulai dari ayat 5 sampai 10\n\n';
    }
  }
  return textToSend;
}
function command(nama) {
  let textToSend = '';
  textToSend += `\n\nHi kak *${nama}*, Saya Quran bot\n`;
  textToSend += 'Saya punya beberapa perintah disini\n\n';
  textToSend += 'Cari surah\n';
  textToSend += '   *!quran [nama|nomor]*\n';
  textToSend += 'Mendaptkan surah secara spesifik\n';
  textToSend += '   *!specify [surah - nomor]*\n';
  textToSend += 'Cari kata tertentu di alquran\n';
  textToSend += '   *!search [kata]*\n';
  textToSend += 'Tampilkan ayat tertentu pada surah\n';
  textToSend += '   *!select [nama|nomor - ayat]>*\n';
  textToSend += 'Ok, saat ini fitur yang tersedia hanya itu\n';
  textToSend += 'Jangan lupa share \n';
  textToSend += 'Kamu bisa support saya dengan donasi agar bot ini terus dikembangkan\n\n';
  textToSend += 'Wa owner ~ http://wa.me/6281242873775?text=Hallo\n';
  textToSend += '\n';
  return textToSend;
}

module.exports = {
  command, select, quranSurah, specify, search,
};
