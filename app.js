// fetch the AVI file
const sourceBuffer = await fetch("input.avi").then(r => r.arrayBuffer());

// create the FFmpeg instance and load it
const ffmpeg = createFFmpeg({ log: true });
await ffmpeg.load();

// write the AVI to the FFmpeg file system
ffmpeg.FS(
  "writeFile",
  "input.avi",
  new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength)
);

// run the FFmpeg command-line tool, converting the AVI into an MP4
await ffmpeg.run("-i", "input.avi", "output.mp4");

// read the MP4 file back from the FFmpeg file system
const output = ffmpeg.FS("readFile", "output.mp4");

// ... and now do something with the file
const video = document.getElementById("video");
video.src = URL.createObjectURL(
  new Blob([output.buffer], { type: "video/mp4" })
);
