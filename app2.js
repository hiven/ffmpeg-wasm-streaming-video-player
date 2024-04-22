document.addEventListener('DOMContentLoaded', () => {
  const { fromEvent } = rxjs;
  const { map, switchMap, take, flatMap } = rxjs.operators;

  const fileInput = document.getElementById('fileInput');
  const transcodeButton = document.getElementById('transcodeButton');
  const videoPlayer = document.getElementById('videoPlayer');
  const mediaSource = new MediaSource();
  videoPlayer.src = URL.createObjectURL(mediaSource);
  videoPlayer.play();
  
  const mediaSourceOpen = fromEvent(mediaSource, 'sourceopen');

  const bufferStream = filename => new Observable(async subscriber => {
    const ffmpeg = FFmpeg.createFFmpeg({
      corePath: 'thirdparty/ffmpeg-core.js',
      log: false
    });

    const fileExists = file => ffmpeg.FS('readdir', '/').includes(file);
    const readFile = file => ffmpeg.FS('readFile', file);

    await ffmpeg.load();
    const sourceBuffer = await fetch(filename).then(r => r.arrayBuffer());
    ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength));

    let index = 0;

    ffmpeg.run(
      '-i',
      'input.mp4',
      '-g',
      '1',
      '-segment_format_options',
      'movflags=frag_keyframe+empty_moov+default_base_moof',
      '-segment_time',
      '5',
      '-f',
      'segment',
      '%d.mp4'
    ).then(() => {
      while (fileExists(`${index}.mp4`)) {
        subscriber.next(readFile(`${index}.mp4`));
        index++;
      }
      subscriber.complete();
    });

    setInterval(() => {
      if (fileExists(`${index + 1}.mp4`)) {
        subscriber.next(readFile(`${index}.mp4`));
        index++;
      }
    }, 200);
  });

  const bufferStreamReady = fromEvent(transcodeButton, 'click').pipe(
    switchMap(() => {
      const file = fileInput.files[0];
      if (!file) {
        alert('Please select a file.');
        return [];
      }
      return bufferStream(URL.createObjectURL(file));
    })
  );

  const sourceBufferUpdateEnd = bufferStreamReady.pipe(
    take(1),
    map(buffer => {
      const mime = `video/mp4; codecs="${muxjs.mp4.probe.tracks(buffer).map(t => t.codec).join(',')}"`;
      const sourceBuf = mediaSource.addSourceBuffer(mime);
      mediaSource.duration = 5;
      sourceBuf.timestampOffset = 0;
      sourceBuf.appendBuffer(buffer);
      return fromEvent(sourceBuf, 'updateend').pipe(map(() => sourceBuf));
    }),
    flatMap(value => value)
  );

  bufferStreamReady.pipe(
    flatMap(buffer => fromEvent(sourceBuf, 'updateend').pipe(map(() => buffer)))
  ).subscribe(buffer => {
    mediaSource.duration += 5;
    sourceBuf.timestampOffset += 5;
    sourceBuf.appendBuffer(buffer.buffer);
  });
});
