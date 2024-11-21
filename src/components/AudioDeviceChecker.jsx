import React, { useEffect, useRef, useState } from 'react';

const AudioDeviceChecker = () => {
  const [devices, setDevices] = useState({
    inputs: [],
    outputs: []
  });
  const audioContextRef = useRef(null);

  useEffect(() => {
    const checkAudioDevices = async () => {
      try {
        // Get all media devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        
        const audioDevices = {
          inputs: allDevices.filter(device => device.kind === 'audioinput'),
          outputs: allDevices.filter(device => device.kind === 'audiooutput')
        };

        setDevices(audioDevices);

        // Log clear device information
        console.log('\n=== Audio Device Information ===');
        console.log('\nOutput Devices:');
        audioDevices.outputs.forEach((device, index) => {
          console.log(`${index + 1}. ${device.label || 'Unnamed Device'} (${device.deviceId})`);
        });

        console.log('\nInput Devices:');
        audioDevices.inputs.forEach((device, index) => {
          console.log(`${index + 1}. ${device.label || 'Unnamed Device'} (${device.deviceId})`);
        });

        // Create and check AudioContext
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        console.log('\nAudioContext Status:');
        console.log('State:', audioContextRef.current.state);
        console.log('Sample Rate:', audioContextRef.current.sampleRate);
        console.log('Default Output:', audioContextRef.current.destination.channelCount, 'channels');

        // Play a test tone
        const testTone = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 0.1; // Low volume
        testTone.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        console.log('\nPlaying test tone...');
        testTone.start();
        setTimeout(() => {
          testTone.stop();
          console.log('Test tone finished');
        }, 500);

      } catch (error) {
        console.error('Audio Device Check Error:', error);
      }
    };

    checkAudioDevices();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Render the device information in the UI
  return (
    <div className="fixed top-0 right-0 m-4 p-4 bg-white/90 rounded shadow max-w-md">
      <h3 className="font-bold mb-2">Audio Devices</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Output Devices:</h4>
        <ul className="text-sm">
          {devices.outputs.map((device, index) => (
            <li key={device.deviceId}>
              {index + 1}. {device.label || 'Unnamed Device'}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Input Devices:</h4>
        <ul className="text-sm">
          {devices.inputs.map((device, index) => (
            <li key={device.deviceId}>
              {index + 1}. {device.label || 'Unnamed Device'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AudioDeviceChecker;
