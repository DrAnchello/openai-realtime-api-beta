// public/audioProcessor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputData = input[0];
    
    // Convert Float32 to Int16 and add to buffer
    for (let i = 0; i < inputData.length; i++) {
      if (this.bufferIndex >= this.bufferSize) {
        // Buffer is full, send it
        this.port.postMessage(this.buffer);
        this.buffer = new Int16Array(this.bufferSize);
        this.bufferIndex = 0;
      }

      // Convert Float32 to Int16
      const sample = Math.max(-1, Math.min(1, inputData[i]));
      this.buffer[this.bufferIndex++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
