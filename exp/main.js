import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

document.getElementById('processButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('upload');
  if (fileInput.files.length === 0) {
    alert('Please select a video file');
    return;
  }

  const file = fileInput.files[0];
  await ffmpeg.load();

  ffmpeg.FS('writeFile', file.name, await fetchFile(file));
  await ffmpeg.run('-i', file.name, 'output.mp4');

  const outputFile = ffmpeg.FS('readFile', 'output.mp4');

  const videoBlob = new Blob([outputFile.buffer], { type: 'video/mp4' });
  const videoUrl = URL.createObjectURL(videoBlob);

  const videoElement = document.createElement('video');
  videoElement.src = videoUrl;
  videoElement.controls = true;
  document.body.appendChild(videoElement);
});
