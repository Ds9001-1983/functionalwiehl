#!/usr/bin/env bash
# Re-encodiert das 61-MB-Studio-Video der Bestands-Site auf Web-Maß.
# Ziel ≤ 8 MB; falls größer → Trim auf 25-s-Loop (mit Kunde abstimmen, siehe Plan §3).
set -euo pipefail
cd "$(dirname "$0")/.."

RAW="assets/raw/functional-wo1.mp4"
OUT_DIR="public/video"
mkdir -p "$OUT_DIR"

if [ ! -f "$RAW" ]; then
  echo "Lade Original-Video (61 MB) …"
  curl -fSL -o "$RAW" "https://functional-wiehl.de/wp-content/uploads/2025/06/functional-wo1.mp4"
fi

# Original ist 15 s, sehr bewegungsintensiv (61 MB) — 960px/crf32 ergibt 4,5 MB
echo "Encode H.264 960px/24fps …"
ffmpeg -y -i "$RAW" -an -vf "scale=960:-2,fps=24" \
  -c:v libx264 -crf 32 -preset slow -movflags +faststart \
  "$OUT_DIR/studio-loop.mp4"

echo "Poster-Frame extrahieren …"
ffmpeg -y -ss 1 -i "$OUT_DIR/studio-loop.mp4" -frames:v 1 -q:v 4 "$OUT_DIR/studio-loop-poster.jpg"
ls -lh "$OUT_DIR"
