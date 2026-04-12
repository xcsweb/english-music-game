import fs from 'fs';
import path from 'path';
import { defaultMusics, defaultSentences } from './src/data/defaultData.ts';

const badMusics = [];

for (const music of defaultMusics) {
  const sentences = defaultSentences.filter(s => s.musicId === music.id);
  
  let chineseCount = 0;
  let totalTextLen = 0;
  for (const s of sentences) {
    totalTextLen += s.text.length;
    const match = s.text.match(/[\u4e00-\u9fa5]/g);
    if (match) {
      chineseCount += match.length;
    }
  }
  const chineseRatio = totalTextLen === 0 ? 0 : chineseCount / totalTextLen;

  const audioPath = path.join(process.cwd(), 'public', music.audioUrl);
  let audioSize = 0;
  let isSilentFake = false;
  if (fs.existsSync(audioPath)) {
    audioSize = fs.statSync(audioPath).size;
    // Our fake ffmpeg silent files are around 90-120KB
    if (audioSize > 90000 && audioSize < 125000) {
       isSilentFake = true;
    }
  } else {
    audioSize = -1;
  }

  // Conditions for removal:
  // 1. Title contains Chinese characters AND it's a new song (m104+)
  // 2. Lyrics contain Chinese characters
  // 3. Audio file is missing
  // 4. Audio is the silent fake we generated
  const titleHasChinese = /[\u4e00-\u9fa5]/.test(music.title);

  if (chineseCount > 0 || audioSize === -1 || isSilentFake || titleHasChinese) {
    badMusics.push({
      id: music.id,
      title: music.title,
      chineseCount,
      audioSize,
      isSilentFake,
      titleHasChinese
    });
  }
}

console.log(`Found ${badMusics.length} suspicious musics:`);
console.log(JSON.stringify(badMusics, null, 2));

// Auto-generate clean script
const idsToRemove = badMusics.map(m => m.id);
fs.writeFileSync('idsToRemove.json', JSON.stringify(idsToRemove));
