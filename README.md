# virtual-tour

## Debug with vscode

Use `ng serve` command to build and serve the app, then launch one of the tasks switch the page that have to be debugged.

## Assets generation

See **virtual-tour-cli** project :

```bash

  Usage: vti [options] <input> <output>

  Asset generator for virtual-tour project


  Options:

    -V, --version     output the version number
    -v, --video       generate video
    -t, --turnaround  generate turn-around
    -c, --carousel    generate carousel
    -h, --help        output usage information
```

## Useful commands

```bash

ffmpeg -i in.m4v -c:v libvpx-vp9 -pass 1 -b:v 4000K -crf 40 -threads 8 -speed 4 -frame-parallel 1 -an -f webm /dev/null
ffmpeg -i in.m4v -c:v libvpx-vp9 -pass 2 -b:v 4000K -crf 40 -threads 8 -speed 2 -frame-parallel 1 -auto-alt-ref 1 -lag-in-frames 25 -c:a libopus -b:a 64k -f webm in.webm

ffmpeg -i in.m4v -an -vcodec libtheora -b 4000000 in.ogv



ffmpeg -i in.m4v -c:v libvpx-vp9 -pass 1 -b:v 4000K -crf 40 -threads 8 -speed 4 -frame-parallel 1 -an -f webm /dev/null && ffmpeg -i in.m4v -c:v libvpx-vp9 -pass 2 -b:v 4000K -crf 40 -threads 8 -speed 2 -frame-parallel 1 -auto-alt-ref 1 -lag-in-frames 25 -c:a libopus -b:a 64k -f webm in.webm && ffmpeg -i out.m4v -an -vcodec libtheora -b 4000000 out.ogv && ffmpeg -i out.m4v -c:v libvpx-vp9 -pass 1 -b:v 4000K -crf 40 -threads 8 -speed 4 -frame-parallel 1 -an -f webm /dev/null && ffmpeg -i out.m4v -c:v libvpx-vp9 -pass 2 -b:v 4000K -crf 40 -threads 8 -speed 2 -frame-parallel 1 -auto-alt-ref 1 -lag-in-frames 25 -c:a libopus -b:a 64k -f webm out.webm && ffmpeg -i out.m4v -an -vcodec libtheora -b 4000000 out.ogv



ffmpeg -i in.m4v -c:v libvpx-vp9 -pass 1 -b:v 4000K -crf 40 -threads 8 -speed 4 -frame-parallel 1 -an -f webm /dev/null && ffmpeg -i in.m4v -c:v libvpx-vp9 -pass 2 -b:v 4000K -crf 40 -threads 8 -speed 2 -frame-parallel 1 -auto-alt-ref 1 -lag-in-frames 25 -c:a libopus -b:a 64k -f webm in.webm && ffmpeg -i out.m4v -an -vcodec libtheora -b 4000000 in.ogv && ffmpeg -i out.m4v -c:v libvpx-vp9 -pass 1 -b:v 4000K -crf 40 -threads 8 -speed 4 -frame-parallel 1 -an -f webm /dev/null && ffmpeg -i out.m4v -c:v libvpx-vp9 -pass 2 -b:v 4000K -crf 40 -threads 8 -speed 2 -frame-parallel 1 -auto-alt-ref 1 -lag-in-frames 25 -c:a libopus -b:a 64k -f webm out.webm && ffmpeg -i out.m4v -an -vcodec libtheora -b 4000000 out.ogv





```