import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const logToHtml = (message) => {
  const logDiv = document.getElementById('log') || document.createElement('div');
  logDiv.id = 'log';
  logDiv.style = 'background: #f9f9f9; padding: 10px; margin-top: 10px; border: 1px solid #ddd;';
  logDiv.textContent += `${message}\n`;
  document.body.appendChild(logDiv);
};

const ffmpeg = createFFmpeg({ log: true });

document.getElementById('processButton').addEventListener('click', async () => {
  try {
    logToHtml('Process started...');
    const fileInput = document.getElementById('upload');
    if (fileInput.files.length === 0) {
      alert('Please select a video file');
      return;
    }

    const file = fileInput.files[0];
    logToHtml('Loading FFmpeg...');
    await ffmpeg.load();

    logToHtml('Writing file to FFmpeg...');
    ffmpeg.FS('writeFile', file.name, await fetchFile(file));
    logToHtml('Running FFmpeg command...');
    await ffmpeg.run('-i', file.name, 'output.mp4');

    logToHtml('Reading output file...');
    const outputFile = ffmpeg.FS('readFile', 'output.mp4');

    const videoBlob = new Blob([outputFile.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(videoBlob);

    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.controls = true;
    document.body.appendChild(videoElement);

    logToHtml('Processing completed. Video appended to the page.');
  } catch (error) {
    logToHtml(`Error: ${error.message}`);
  }
});
