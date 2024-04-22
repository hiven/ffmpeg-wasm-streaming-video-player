const { Observable, fromEvent, combineLatest, zip } = rxjs;
const { map, flatMap, take, skip } = rxjs.operators;

const bufferStream = filename =>
  new Observable(async subscriber => {
    const ffmpeg = FFmpeg.createFFmpeg({
      corePath: "thirdparty/ffmpeg-core.js",
      log: false
    });

    const fileExists = file => ffmpeg.FS("readdir", "/").includes(file);
    const readFile = file => ffmpeg.FS("readFile", file);

    await ffmpeg.load();
    const sourceBuffer = await fetch(filename).then(r => r.arrayBuffer());
    ffmpeg.FS(
      "writeFile",
      "input.mp4",
      new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength)
    );

    ffmpeg
      .run(
        "-i",
        "input.mp4",
        "-t",
        "10", // Trim to first 10 seconds
        "-c",
        "copy", // Copy codec without re-encoding
        "output.mp4"
      )
      .then(() => {
        subscriber.next(readFile("output.mp4"));
        subscriber.complete();
      });
  });

document.addEventListener("DOMContentLoaded", () => {
  const videoPlayer = document.getElementById("videoPlayer");
  const mediaSource = new MediaSource();
  videoPlayer.src = URL.createObjectURL(mediaSource);
  videoPlayer.play();

  const mediaSourceOpen = fromEvent(mediaSource, "sourceopen");

  const bufferStreamReady = combineLatest(
    mediaSourceOpen,
    bufferStream("tests/4club-JTV-i63.mp4")
  ).pipe(map(([, a]) => a));

  const sourceBufferUpdateEnd = bufferStreamReady.pipe(
    take(1),
    map(buffer => {
      const mime = `video/mp4; codecs="${muxjs.mp4.probe
        .tracks(buffer)
        .map(t => t.codec)
        .join(",")}"`;
      const sourceBuf = mediaSource.addSourceBuffer(mime);

      mediaSource.duration = 10; // Duration of the trimmed video
      sourceBuf.timestampOffset = 0;
      sourceBuf.appendBuffer(buffer);

      return fromEvent(sourceBuf, "updateend").pipe(map(() => sourceBuf));
    }),
    flatMap(value => value)
  );

  zip(sourceBufferUpdateEnd, bufferStreamReady.pipe(skip(1)))
    .pipe(
      map(([sourceBuf, buffer]) => {
        mediaSource.duration += 10; // Duration of the trimmed video
        sourceBuf.timestampOffset += 10; // Offset for the next segment
        sourceBuf.appendBuffer(buffer.buffer);
      })
    )
    .subscribe();
});
