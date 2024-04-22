document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const clipButton = document.getElementById('clipButton');
  const videoPlayer = document.getElementById('videoPlayer');

  clipButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const ffmpeg = createFFmpeg({ log: true });
      await ffmpeg.load();

      ffmpeg.FS('writeFile', file.name, new Uint8Array(arrayBuffer));
      await ffmpeg.run('-i', file.name, '-t', '10', '-c', 'copy', 'output.mp4');

      const data = ffmpeg.FS('readFile', 'output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      videoPlayer.src = URL.createObjectURL(blob);
      videoPlayer.play();
    };

    reader.readAsArrayBuffer(file);
  });
});
