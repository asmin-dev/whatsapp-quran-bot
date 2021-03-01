const fs = require('fs');
const difflib = require('difflib');
// const input = require('readline').createInterface({
//  input: process.stdin,
//  output: process.stdout,
// });

const listSurah = [
  'Al Fatihah',
  'Al Baqarah',
  "Ali 'Imran",
  "An Nisa'",
  "Al Ma'idah",
  "Al An'am",
  "Al A'raf\xa0",
  'Al Anfal',
  'At Taubah',
  'Yunus',
  'Hud',
  'Yusuf',
  "Ar Ra'd",
  'Ibrahim',
  'Al Hijr',
  'An Nahl',
  "Al Isra'",
  'Al Kahfi',
  'Maryam',
  'Taha',
  "Al Anbiya'",
  'Al Hajj',
  "Al Mu'minun",
  'An Nur',
  'Al Furqan',
  "Asy Syu'ara'",
  'An Naml',
  'Al Qasas',
  "Al 'Ankabut",
  'Ar Rum',
  'Luqman',
  'As Sajdah',
  'Al Ahzab',
  "Saba'",
  'Fatir',
  'Yasin',
  'As Saffat',
  'Sad',
  'Az Zumar',
  'Gafir',
  'Fussilat',
  'Asy Syura',
  'Az Zukhruf',
  'Ad Dukhan',
  'Al Jasiyah',
  'Al Ahqaf',
  'Muhammad',
  'Al Fath',
  'Al Hujurat',
  'Qaf',
  'Az Zariyat',
  'At Tur',
  'An Najm',
  'Al Qamar',
  'Ar Rahman',
  "Al Waqi'ah",
  'Al Hadid',
  'Al Mujadilah',
  'Al Hasyr',
  'Al Mumtahanah',
  'As Saff',
  "Al Jumu'ah",
  'Al-Munafiqun',
  'At Tagabun',
  'At Talaq',
  'At Tahrim',
  'Al Mulk',
  'Al Qalam',
  'Al Haqqah',
  "Al Ma'arij",
  'Nuh',
  'Al Jinn',
  'Al Muzzammil',
  'Al Muddassir',
  'Al Qiyamah',
  'Al Insan',
  'Al Mursalat',
  "An Naba'",
  "An Nazi'at",
  "'Abasa",
  'At Takwir',
  'Al Infitar',
  'Al Mutaffifin',
  'Al-Insyiqaq',
  'Al Buruj',
  'At Tariq',
  'Al A´Laa',
  'Al-Gasyiyah',
  'Al Fajr',
  'Al Balad',
  'Asy Syams',
  'Al Lail',
  'Ad Duha',
  'Asy Syarh',
  'At Tin',
  "Al 'Alaq",
  'Al Qadr',
  'Al Bayyinah',
  'Al Zalzalah',
  "Al 'Adiyat",
  "Al Qari'ah",
  'At Takasur',
  "Al 'Asr",
  'Al Humazah',
  'Al Fil',
  'Quraisy',
  "Al Ma'un",
  'Al Kausar',
  'Al Kafirun',
  'An Nasr',
  'Al Lahab',
  'Al Ikhlas',
  'Al Falaq',
  'An Nas',
];

// word correction
const spell = (word) => difflib.getCloseMatches(word, listSurah)[0];
function cekSurah(word) {
  let result;
  if (isNaN(word)) {
    result = spell(word);
  } else {
    const total = listSurah.length;
    for (let i = 1; i <= total; i++) {
      if (i === Number(word)) {
        result = listSurah[i - 1];
      }
    }
  }
  return result;
}
function findAyat(word) {
  const arr = [];
  const file = eval(fs.readFileSync('./lib/quran.json', 'utf-8'));
  file.forEach((surah) => {
    surah.data.forEach((ayat) => {
      const kata = ayat.arti
        .replace(/,/g, '')
        .replace(/\./g, '')
        .replace(/’/g, '')
        .replace(/”/g, '')
        .toLowerCase();
      const mean = word.split(' ')[1] === undefined
        ? ` ${word} `
        : word
          .replace(/,/g, '')
          .replace(/\./g, '')
          .replace(/’/g, '')
          .replace(/”/g, '');
      if (kata.includes(mean.toLowerCase())) {
        const content = {};
        content.surah = surah.surah;
        content.nomor = surah.nomor;
        content.data = ayat;
        arr.push(content);
      }
    });
  });
  return arr;
}

function selectSurah(nama) {
  let obj;
  const file = eval(fs.readFileSync('./lib/quran.json', 'utf-8'));
  file.forEach((surah) => {
    const namaSurah = cekSurah(nama);
    if (namaSurah === surah.surah) {
      obj = surah;
    }
  });
  return obj;
}

function selectAyat(surah, ayat) {
  const obj = {};
  const arr = [];
  const namaSurah = cekSurah(surah);
  const file = eval(fs.readFileSync('./lib/quran.json', 'utf-8'));
  file.forEach((quran) => {
    if (namaSurah === quran.surah) {
      obj.surah = quran.surah;
      obj.nomor = quran.nomor;
      quran.data.forEach((nomor) => {
        if (Number(nomor.ayat) === Number(ayat)) {
          arr.push(nomor);
        }
      });
    }
  });
  obj.data = arr;
  return obj;
}

function selectRange(surah, start = undefined, end = undefined) {
  const obj = {};
  const data = [];
  const namaSurah = cekSurah(surah);
  const file = eval(fs.readFileSync('./lib/quran.json', 'utf-8'));
  file.forEach((quran) => {
    if (start !== undefined && end !== undefined) {
      if (namaSurah === quran.surah) {
        quran.data.forEach((ayat) => {
          if (Number(end) >= Number(ayat.ayat)) {
            if (Number(start) <= Number(ayat.ayat)) {
              data.push(ayat);
            }
          }
        });
        const namasurah = quran.surah;
        const nomorSurah = quran.nomor;
        obj.surah = namasurah;
        obj.nomor = nomorSurah;
        obj.data = data;
      }
    } else {
      if (start) {
        if (namaSurah === quran.surah) {
          quran.data.forEach((ayat) => {
            if (Number(start) <= Number(ayat.ayat)) {
              data.push(ayat);
            }
          });
          const namasurah = quran.surah;
          const nomorSurah = quran.nomor;
          obj.surah = namasurah;
          obj.nomor = nomorSurah;
          obj.data = data;
        }
      }
      if (end) {
        if (namaSurah === quran.surah) {
          quran.data.forEach((ayat) => {
            if (Number(end) >= Number(ayat.ayat)) {
              data.push(ayat);
            }
          });
          const namasurah = quran.surah;
          const nomorSurah = quran.nomor;
          obj.surah = namasurah;
          obj.nomor = nomorSurah;
          obj.data = data;
        }
      }
    }
  });
  return obj;
}
function DaftarSurah() {
  const arr = [];
  const file = eval(fs.readFileSync('./lib/quran.json', 'utf-8'));
  file.forEach((surah) => {
    arr.push({ surah: surah.surah, nomor: surah.nomor });
  });
  return arr;
}
// console.log(selectRange(read, spell, '8', undefined));
// console.log(selectAyat(read, spell, '5'));
// console.log(select(read, undefined, 1));
// console.log(findAyat(read));
module.exports = {
  selectRange,
  selectAyat,
  selectSurah,
  findAyat,
  DaftarSurah,
};
