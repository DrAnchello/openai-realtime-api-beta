class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.stream = null;
    this.processor = null;
    this.onDataCallback = null;
  }

  async initialize(onData) {
    this.onDataCallback = onData;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext({ sampleRate: 24000 });

    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.processor.onaudioprocess = this.handleAudioProcess.bind(this);
  }

  handleAudioProcess(e) {
    const inputData = e.inputBuffer.getChannelData(0);
    const audioData = new Float32Array(inputData);
    this.onDataCallback?.(audioData);
  }

  start() {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.processor) {
      this.processor.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default new AudioRecorder();
