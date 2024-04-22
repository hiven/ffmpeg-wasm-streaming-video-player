const sourceBuffer = await fetch("input.avi").then(r => {
  console.log("Fetching input AVI file...");
  return r.arrayBuffer();
});

// create the FFmpeg instance and load it
const ffmpeg = createFFmpeg({ log: true, logger: m => console.log(m) });
console.log("Loading FFmpeg...");
await ffmpeg.load();
console.log("FFmpeg loaded successfully.");

// write the AVI to the FFmpeg file system
console.log("Writing AVI file to FFmpeg file system...");
ffmpeg.FS("writeFile", "input.avi", new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength));
console.log("AVI file written successfully.");

// run the FFmpeg command-line tool, converting the AVI into an MP4
console.log("Running FFmpeg to convert AVI to MP4...");
await ffmpeg.run("-i", "input.avi", "output.mp4");
console.log("Conversion completed successfully.");

// read the MP4 file back from the FFmpeg file system
console.log("Reading MP4 file from FFmpeg file system...");
const output = ffmpeg.FS("readFile", "output.mp4");
console.log("MP4 file read successfully.");

// ... and now do something with the file
const video = document.getElementById("video");
console.log("Setting video source...");
video.src = URL.createObjectURL(new Blob([output.buffer], { type: "video/mp4" }));
console.log("Video source set successfully.");
