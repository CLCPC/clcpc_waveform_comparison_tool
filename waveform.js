
const modelCanvas = document.getElementById("modelCanvas");
const learnerCanvas = document.getElementById("learnerCanvas");
const modelCtx = modelCanvas.getContext("2d");
const learnerCtx = learnerCanvas.getContext("2d");

const audioFiles = {
  aama: "audio/arm.mp3",
  kwahi: "audio/back.mp3",
  motso: "audio/beard.mp3"
};

// Draw waveform
function drawWaveform(ctx, data, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  const step = Math.ceil(data.length / width);
  const amp = height / 2;
  for (let i = 0; i < width; i++) {
    const min = data[i * step] * amp;
    const max = data[i * step + 1] * amp;
    ctx.moveTo(i, amp - min);
    ctx.lineTo(i, amp - max);
  }
  ctx.strokeStyle = "#00514d";
  ctx.stroke();
}

// Play model audio and draw waveform
function playModel() {
  const word = document.getElementById("word-select").value;
  const audio = new Audio(audioFiles[word]);
  audio.play();

  // Draw waveform
  fetch(audioFiles[word])
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx.decodeAudioData(buffer);
    })
    .then(decoded => {
      const data = decoded.getChannelData(0);
      drawWaveform(modelCtx, data, modelCanvas.width, modelCanvas.height);
    });
}

// Record learner voice and draw waveform
function recordLearner() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const input = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(2048, 1, 1);

    const chunks = [];
    processor.onaudioprocess = e => {
      const inputData = e.inputBuffer.getChannelData(0);
      chunks.push(...inputData);
      drawWaveform(learnerCtx, inputData, learnerCanvas.width, learnerCanvas.height);
    };

    input.connect(processor);
    processor.connect(audioCtx.destination);

    setTimeout(() => {
      stream.getTracks().forEach(t => t.stop());
      processor.disconnect();
    }, 2000); // record for 2 seconds
  });
}
