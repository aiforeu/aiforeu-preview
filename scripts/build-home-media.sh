#!/bin/sh
# Prepare the pictures and clips of the site.
#   sources:  .higgsfield-local/sources/   (Higgsfield output, not published)
#   results:  assets/aiforeu-home/  (.jpg and .mp4)
#             homepage: night, scene-{voice,desktop,workflows,traffic,ive}, agentario, junction, dawn
#             subpages: scene-{three,anyuse,automation,row}, junction-wide, and the still scene-notes
# Each clip becomes a seamless loop: its first moments are faded in over its last ones,
# so the end runs into the beginning. Most clips were generated with the same first and last frame
# and need only a short fade; the two flights are faded over a longer stretch.
# The scene clips keep their black surroundings: the page lets that black dissolve into its own colour.
# Every still picture is the first frame of its own loop, so nothing shifts when the clip starts to play.
# FFMPEG must be an ffmpeg with libx264, PYTHON must provide Pillow.
set -eu
cd "$(dirname "$0")/.."
FFMPEG="${FFMPEG:-ffmpeg}"
PYTHON="${PYTHON:-python3}"
SRC=.higgsfield-local/sources
OUT=assets/aiforeu-home
mkdir -p "$OUT"
FRAMES=$(mktemp -d)
trap 'rm -rf "$FRAMES"' EXIT

# Everything is counted in frames (24 a second), so the loop turns on an exact frame.
# A generated clip needs a few frames to settle after its given first picture and drifts towards its given last one,
# so `skip` frames are dropped at both ends. Of what remains, the first `fade` frames are laid over the last ones
# with rising weight: the loop ends almost entirely on frame fade-1 and starts again with frame fade.
clip() { # name frames fade skip filter quality source
  name=$1; frames=$(($2 - 2 * $4)); fade=$3; skip=$4; filter=$5; quality=$6; source=$7
  "$FFMPEG" -loglevel error -y -i "$SRC/$source.mp4" -filter_complex \
    "[0:v]${filter},fps=24,trim=start_frame=${skip},setpts=N/(24*TB),format=yuv420p,split[body][pre];[pre]trim=end_frame=${fade},format=yuva420p,fade=t=in:s=0:n=${fade}:alpha=1,setpts=(N+${frames}-2*${fade})/(24*TB)[head];[body]trim=start_frame=${fade}:end_frame=${frames},setpts=N/(24*TB)[main];[main][head]overlay=eof_action=pass,format=yuv420p[v]" \
    -map "[v]" -an -c:v libx264 -preset slow -crf "$quality" -profile:v high -pix_fmt yuv420p -movflags +faststart -r 24 "$OUT/$name.mp4"
}
first() { # name frame filter source  -> the frame the loop starts with
  "$FFMPEG" -loglevel error -y -i "$SRC/$4.mp4" -vf "fps=24,select='eq(n,$2)',$3" -frames:v 1 "$FRAMES/$1.png"
}
loop() { # name frames fade skip framing quality still-framing [source, if it differs from the name]
  clip "$1" "$2" "$3" "$4" "$5" "$6" "${8:-$1}"
  first "$1" "$(($3 + $4))" "$7" "${8:-$1}"
}
DESK="scale=1280:960:flags=lanczos";  DESK_STILL="scale=1600:1200:flags=lanczos"
WIDE="scale=1920:1080:flags=lanczos"
SQUARE_A="crop=1248:1248:0:324"      # the three desks of the homepage, from an upright clip
SQUARE_J="crop=1080:1080:420:0"      # the middle of the wide junction
SIX=144; EIGHT=192                   # six and eight seconds
# Quality: the lower the number, the less the picture changes when the loop starts again with a fresh key frame;
# clips full of fine detail (the junction, the clouds) therefore get lower numbers than the desks in darkness.
#    name             frames fade skip  clip framing                              quality  still framing                             source
loop night            $EIGHT 29   8     "$WIDE"                                   20       "$WIDE"
loop dawn             $EIGHT 29   8     "scale=1600:900:flags=lanczos"            19       "$WIDE"
loop scene-voice      $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-desktop    $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-workflows  $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-traffic    $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-ive        $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-three      $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-anyuse     $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-automation $SIX   12   10    "$DESK"                                   21       "$DESK_STILL"
loop scene-row        $SIX   12   10    "$WIDE"                                   22       "$WIDE"
loop agentario        $SIX   12   10    "$SQUARE_A,scale=960:960:flags=lanczos"   21       "$SQUARE_A,scale=1200:1200:flags=lanczos"
loop junction-wide    $EIGHT 12   10    "scale=1600:900:flags=lanczos"            19       "$WIDE"
loop junction         $EIGHT 12   10    "$SQUARE_J,scale=960:960:flags=lanczos"   19       "$SQUARE_J,scale=1200:1200:flags=lanczos"  junction-wide

"$PYTHON" - "$OUT" "$FRAMES" <<'PICTURES'
import sys
from pathlib import Path
from PIL import Image
out, frames = sys.argv[1:]
for frame in sorted(Path(frames).glob("*.png")):
    Image.open(frame).convert("RGB").save(f"{out}/{frame.stem}.jpg", quality=84, progressive=True, optimize=True)
# a scene without a clip
notes = Image.open(".higgsfield-local/sources/scene-notes.png").convert("RGB")
notes.resize((1600, round(1600 * notes.height / notes.width)), Image.LANCZOS).save(f"{out}/scene-notes.jpg", quality=84, progressive=True, optimize=True)
PICTURES
