# BPG Frame player
A frame sequence player with a bpm file as source file. It uses a web worker to parse an animated BPG file.

Highly experimental. Currently crashing my iPhone 6. I expect this is happening due to either too many frames, high image resolution or hight image render quality.

## Prerequisites
* ffmpeg `brew install ffmpeg` see: https://www.ffmpeg.org/
* libbpg `brew install libbpg` see: https://github.com/mirrorer/libbpg
* pngquand `brew install pngquant` see: https://github.com/pornel/pngquant

## Create BPG sequence
* `ffmpeg -i input.mp4 -vf fps=30 -vf scale=720:-1 anim%d.png`
* `pngquant *.png --quality=70 --skip-if-larger`
* `bpgenc -a anim%2d.png -fps 30 -loop 0 -o anim.bpg`

For more info go here: http://bellard.org/bpg/

## How to use...
See the example directory.

### Installation
You need to have node and npm installed to be able to work on this code.

`npm install`

### Dev
`npm run dev` - Has a watcher

Start a local server in the root (e.g. php -S localhost:3000) and visit: http://localhost:3000/example

Make sure to use the proper webworker URL (see ./example/index.html). It is currently copied into the lib folder next to BPGFramePlayer.js

### Build

`npm run build` - Same as `npm run dev` but uglified and without watcher...

## Credits
* https://github.com/m-2k/bpg-ww
* http://bellard.org/bpg/