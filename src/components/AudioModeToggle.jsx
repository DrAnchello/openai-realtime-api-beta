import React from 'react';

const AudioModeToggle = ({ mode, onModeChange }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-medium">Voice Processing Mode</h2>
          <p className="text-sm text-gray-500">
            Choose between real-time conversation or transcribe + TTS mode
          </p>
        </div>
        <button
          onClick={() => onModeChange(mode === 'realtime' ? 'whisper-tts' : 'realtime')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            mode === 'realtime' ? 'bg-purple-300' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              mode === 'realtime' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="rounded-lg bg-white/10 p-4 text-sm">
        <h3 className="font-medium mb-2">Current Mode: {mode === 'realtime' ? 'Real-time API' : 'Whisper + TTS'}</h3>
        <div className="space-y-2 text-gray-600">
          {mode === 'realtime' ? (
            <>
              <p>• Low-latency, natural conversations</p>
              <p>• Seamless audio streaming</p>
              <p>• Better context awareness</p>
            </>
          ) : (
            <>
              <p>• Higher accuracy transcription</p>
              <p>• More consistent voice output</p>
              <p>• Lower API costs</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioModeToggle;
