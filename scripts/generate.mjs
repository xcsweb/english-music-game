import fs from 'fs';
import path from 'path';

const audioDir = path.join(process.cwd(), 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const musics = [];
const sentences = [];
let musicIdCounter = 1;
let sentenceIdCounter = 1;

const parseLRC = (lrcText) => {
  const lines = lrcText.split('\n');
  const result = [];
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  
  lines.forEach(line => {
    const match = timeReg.exec(line);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
      const time = min * 60 + sec + ms / 1000;
      
      let text = line.replace(timeReg, '').trim();
      let translation = '';
      
      const transMatch = text.match(/\(([^)]+)\)$|【([^】]+)】$/);
      if (transMatch) {
        translation = transMatch[1] || transMatch[2];
        text = text.replace(/\([^)]+\)$|【[^】]+】$/, '').trim();
      }
      
      if (text && !text.includes('作曲') && !text.includes('作词') && !text.includes('编曲') && !text.includes('制作人')) {
        result.push({ startTime: time, text, translation });
      }
    }
  });
  
  for (let i = 0; i < result.length; i++) {
    result[i].endTime = i < result.length - 1 ? result[i + 1].startTime : result[i].startTime + 5;
  }
  
  return result;
};

const downloadAudio = async (url, dest) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(arrayBuffer));
  } finally {
    clearTimeout(timeoutId);
  }
};

async function run() {
  console.log('Fetching multiple playlists to find 100 full English songs...');
  const playlists = [
    '689440333', // 经典老歌 (Carpenters, MLTR, etc)
    '66873341',  // 百听不厌的经典英文老歌 (Celine Dion, Westlife, etc)
    '2829816518',// 欧美热歌榜 (Adele, Justin Bieber, The Weeknd)
    '180106',    // UK Top 40
    '3101344078',// Spotify Top 50
    '7466781234',// 旋律抓耳
    '12971671311',// 适合单曲循环
    '19723756'   // 欧美热歌榜2
  ];

  const addedUrls = new Set();
  
  try {
    for (const pid of playlists) {
      if (musics.length >= 100) break;
      console.log(`\n--- Fetching playlist ${pid} ---`);
      
      const res = await fetch(`https://api.injahow.cn/meting/?type=playlist&id=${pid}`);
      const list = await res.json();
      if (!Array.isArray(list)) {
         console.log('Playlist invalid or empty, skipping...');
         continue;
      }
      
      for (const track of list) {
        if (musics.length >= 100) break;
        if (!track.url || addedUrls.has(track.url)) continue;
        addedUrls.add(track.url);

        try {
          console.log(`Processing: ${track.name} - ${track.artist}`);
          
          // Fetch LRC
          const lrcRes = await fetch(track.lrc);
          const lrcText = await lrcRes.text();
          const parsed = parseLRC(lrcText);
          
          if (parsed.length < 5) {
            console.log(`  Skipping: No valid lyrics or too short.`);
            continue;
          }
          
          const mId = 'm' + musicIdCounter;
          const fileName = `${mId}.mp3`;
          const localAudioPath = `/audio/${fileName}`;
          const absolutePath = path.join(audioDir, fileName);
          
          // Download audio
          console.log(`  Downloading audio...`);
          await downloadAudio(track.url, absolutePath);
          
          // Check file size to avoid VIP 30-second previews (which are usually around 400KB - 800KB)
          const stats = fs.statSync(absolutePath);
          if (stats.size < 1000000) {
            console.log(`  Skipping: File too small (${stats.size} bytes), likely a 30s VIP preview or broken.`);
            fs.unlinkSync(absolutePath);
            continue;
          }

          // Only increment counters if we actually kept the song
          musicIdCounter++;
          
          musics.push({
            id: mId,
            title: track.name,
            artist: track.artist,
            coverUrl: track.pic,
            audioUrl: localAudioPath,
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
          });
          
          // Add sentences
          parsed.forEach(p => {
            sentences.push({
              id: 's' + sentenceIdCounter++,
              musicId: mId,
              text: p.text,
              translation: p.translation,
              distractors: "",
              startTime: parseFloat(p.startTime.toFixed(3)),
              endTime: parseFloat(p.endTime.toFixed(3))
            });
          });
          
          console.log(`  => Successfully added! (${musics.length}/100)`);
          // Slight delay to prevent rate limit
          await new Promise(r => setTimeout(r, 200));
          
        } catch (e) {
          console.error(`  Error processing track ${track.name}:`, e.message);
        }
      }
    }
    
    const output = `import type { Music } from '../stores/music'
import type { Sentence } from '../stores/sentence'

export const defaultMusics: Music[] = ${JSON.stringify(musics, null, 2)};

export const defaultSentences: Sentence[] = ${JSON.stringify(sentences, null, 2)};
`;
    
    fs.writeFileSync('src/data/defaultData.ts', output);
    console.log(`\nSuccess! Generated ${musics.length} songs and ${sentences.length} sentences.`);
  } catch (e) {
    console.error('Failed to fetch playlist', e);
  }
}

run();
