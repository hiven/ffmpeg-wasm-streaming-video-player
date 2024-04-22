// Import necessary functions and operators from the rxjs library
const { Observable } = rxjs;

// Define a function to create an observable stream for buffering a video file
const bufferStream = filename =>
  new Observable(async subscriber => {
    // Initialize FFmpeg
    const ffmpeg = FFmpeg.createFFmpeg({
      corePath: "thirdparty/ffmpeg-core.js",
      log: true
    });

    // Function to check if a file exists
    const fileExists = file => ffmpeg.FS("readdir", "/").includes(file);
    // Function to read a file
    const readFile = file => ffmpeg.FS("readFile", file);

    // Load FFmpeg
    await ffmpeg.load();
    // Fetch the video file and create a source buffer
    const sourceBuffer = await fetch(filename).then(r => r.arrayBuffer());
    ffmpeg.FS(
      "writeFile",
      "input.mp4",
      new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength)
    );

    // Run FFmpeg to segment the video file into 5-second segments
    await ffmpeg.run(
      "-i", "input.mp4",
      "-c", "copy",
      "-f", "segment",
      "-segment_time", "5",
      "%d.mp4"
    );

    let index = 0;
    // Periodically check for new files written by FFmpeg
    const checkFilesInterval = setInterval(() => {
      if (fileExists(`${index}.mp4`)) {
        subscriber.next(readFile(`${index}.mp4`));
        index++;
      } else {
        clearInterval(checkFilesInterval);
        subscriber.complete();
      }
    }, 200);
  });

// Create a new MediaSource object
const mediaSource = new MediaSource();
// Set up the video player to use the MediaSource
videoPlayer.src = URL.createObjectURL(mediaSource);
videoPlayer.play();

// Create an observable stream for buffering the video file
const bufferStreamReady = bufferStream("tests/4club-JTV-i63.mp4");

// Subscribe to the buffered video stream
bufferStreamReady.subscribe(buffer => {
  // Determine the correct MIME type for the video
  const mime = `video/mp4; codecs="${muxjs.mp4.probe
    .tracks(buffer)
    .map(t => t.codec)
    .join(",")}"`;
  // Create a new source buffer with the determined MIME type
  const sourceBuf = mediaSource.addSourceBuffer(mime);

  // Append the buffer to the source buffer
  mediaSource.duration = 5;
  sourceBuf.timestampOffset = 0;
  sourceBuf.appendBuffer(buffer);
});
