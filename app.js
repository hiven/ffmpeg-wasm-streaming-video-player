console.log("Start");

const sourceBuffer = fetch("input.avi")
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    console.log("Fetching input AVI file...");
    return response.arrayBuffer();
  })
  .then(arrayBuffer => {
    // Work with the array buffer
    console.log("Array buffer:", arrayBuffer);
  })
  .catch(error => {
    console.error("There was a problem with the fetch operation:", error);
  });


async function loadFFmpeg() {
  // Create the FFmpeg instance with logging enabled
  const ffmpeg = createFFmpeg({ log: true, logger: m => console.log(m) });

  // Log a message indicating that FFmpeg is being loaded
  console.log("Loading FFmpeg...");

  // Asynchronously load FFmpeg
  await ffmpeg.load();

  // Log a message indicating that FFmpeg has been loaded successfully
  console.log("FFmpeg loaded successfully.");

  // Return the loaded FFmpeg instance
  return ffmpeg;
}

// Call the async function
loadFFmpeg()
  .then(ffmpeg => {
    // Now you can use the loaded FFmpeg instance here
    console.log("FFmpeg instance:", ffmpeg);
  })
  .catch(error => {
    // Handle errors
    console.error("Error loading FFmpeg:", error);
  });


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
