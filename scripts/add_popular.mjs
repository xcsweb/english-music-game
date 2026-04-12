import pkg from 'NeteaseCloudMusicApi';
import fs from 'fs';
import path from 'path';

const { cloudsearch, lyric, song_url_v1 } = pkg;

const popularSongs = [
  "Shape of You Ed Sheeran",
  "See You Again Wiz Khalifa",
  "Sugar Maroon 5",
  "Faded Alan Walker",
  "Someone Like You Adele",
  "Rolling in the Deep Adele",
  "Love Story Taylor Swift",
  "Just the Way You Are Bruno Mars",
  "Baby Justin Bieber",
  "My Heart Will Go On Celine Dion",
  "Take Me To Your Heart Michael Learns to Rock",
  "Yesterday Once More Carpenters",
  "Let It Go Idina Menzel",
  "Halo Beyonce",
  "Demons Imagine Dragons",
  "Billie Jean Michael Jackson",
  "Hello Adele",
  "You Belong With Me Taylor Swift",
  "Call Me Maybe Carly Rae Jepsen",
  "Roar Katy Perry",
  "Counting Stars OneRepublic",
  "Apologize Timbaland",
  "Bad Romance Lady Gaga",
  "We Will Rock You Queen",
  "Numb Linkin Park"
];

async function run() {
  for (const query of popularSongs) {
    try {
      const res = await cloudsearch({ keywords: query, limit: 1 });
      const song = res.body.result.songs[0];
      console.log(`Found: ${song.name} - ${song.ar[0].name} (${song.id})`);
    } catch(e) {
      console.log('Error', query);
    }
  }
}
run();
