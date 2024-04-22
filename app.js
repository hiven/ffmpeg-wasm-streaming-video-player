const { Observable } = rxjs;

const bufferStream = filename =>
  new Observable(async subscriber => {
    const ffmpeg = FFmpeg.createFFmpeg({
      corePath: "thirdparty/ffmpeg-core.js",
      log: false
    });

    const readFile = file => ffmpeg.FS("readFile", file);

    await ffmpeg.load();
    const sourceBuffer = await fetch(filename).then(r => r.arrayBuffer());
    ffmpeg.FS(
      "writeFile",
      "input.mp4",
      new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength)
    );

    ffmpeg
      .run("-i", "input.mp4", "-c", "copy", "output.mp4")
      .then(async () => {
        const outputBuffer = await readFile("output.mp4");
        subscriber.next(outputBuffer);
        subscriber.complete();
      })
      .catch(error => {
        subscriber.error(error);
      });
  });

const mediaSource = new MediaSource();
const videoPlayer = document.getElementById("videoPlayer");
videoPlayer.src = URL.createObjectURL(mediaSource);
videoPlayer.play();

const bufferStreamReady = bufferStream("tests/4club-JTV-i63.mp4");

bufferStreamReady.subscribe(buffer => {
  const mime = `video/mp4; codecs="${muxjs.mp4.probe
    .tracks(buffer)
    .map(t => t.codec)
    .join(",")}"`;
  const sourceBuf = mediaSource.addSourceBuffer(mime);
  sourceBuf.timestampOffset = 0;
  sourceBuf.appendBuffer(buffer);
});
