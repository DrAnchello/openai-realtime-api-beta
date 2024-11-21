// services/ai/audioService.js
import realtimeService from './realtimeService';
import axios from 'axios';

class AudioService {
  constructor() {
    this.mode = 'realtime'; // or 'whisper-tts'
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.eventHandlers = new Map();
  }

  setMode(mode) {
    this.mode = mode;
  }

  async initialize(apiKey) {
    this.apiKey = apiKey;
    if (this.mode === 'realtime') {
      return realtimeService.initialize(apiKey);
    }
    return true;
  }

  async transcribeAudio(audioData) {
    const formData = new FormData();
    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  async synthesizeSpeech(text, voice = 'shimmer') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          input: text,
          model: 'tts-1',
          voice: voice,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw error;
    }
  }

  async handleAudioInput(audioData) {
    if (this.mode === 'realtime') {
      return realtimeService.appendInputAudio(audioData);
    } else {
      // Transcribe audio using Whisper
      const transcript = await this.transcribeAudio(audioData);
      this.emit('speechStarted');
      this.emit('textResponse', { delta: { text: transcript } });
      
      // Get chat completion
      const completion = await this.getChatCompletion(transcript);
      
      // Synthesize speech
      const audioResponse = await this.synthesizeSpeech(completion);
      this.emit('audioResponse', { delta: new Int16Array(audioResponse) });
      
      this.emit('speechStopped', { transcript });
      return true;
    }
  }

  async getChatCompletion(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { 
              role: 'system', 
              content: 'You are a helpful, witty, and friendly AI assistant. Your responses should be natural and engaging.' 
            },
            { role: 'user', content: text }
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Chat completion error:', error);
      throw error;
    }
  }

  async startRecording() {
    if (this.mode === 'realtime') {
      return realtimeService.startRecording();
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks);
        const arrayBuffer = await audioBlob.arrayBuffer();
        this.handleAudioInput(new Int16Array(arrayBuffer));
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    if (this.mode === 'realtime') {
      return realtimeService.stopRecording();
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  addListener(eventName, callback) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName).add(callback);
  }

  removeListener(eventName, callback) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  emit(eventName, data) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  disconnect() {
    if (this.mode === 'realtime') {
      return realtimeService.disconnect();
    }
    
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }
}

export default new AudioService();
