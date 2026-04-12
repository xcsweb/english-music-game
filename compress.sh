#!/bin/bash
mkdir -p public/audio_compressed
for f in public/audio/*.mp3; do
  echo "Compressing $f"
  ffmpeg -i "$f" -b:a 96k -v error -y "public/audio_compressed/$(basename "$f")"
done
