import { useState, useRef, useCallback } from 'react';

/**
 * Real-time speech-to-text using Deepgram's WebSocket API.
 * Uses the browser's MediaRecorder to capture mic audio and streams
 * it to Deepgram's Nova-2 model for high-accuracy transcription.
 */
export function useDeepgramTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const keepAliveRef = useRef(null);

  const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

  const startRecording = useCallback((onFinalTranscript) => {
    if (!DEEPGRAM_API_KEY) {
      setError('Missing VITE_DEEPGRAM_API_KEY in .env file');
      return;
    }

    setError(null);
    setIsRecording(true);
    setInterimText('');

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;

        // Connect to Deepgram WebSocket
        const wsUrl = 'wss://api.deepgram.com/v1/listen?' + new URLSearchParams({
          model: 'nova-3',
          language: 'en',
          smart_format: 'true',
          punctuate: 'true',
          interim_results: 'true',
          utterance_end_ms: '1500',
          vad_events: 'true',
          encoding: 'linear16',
          sample_rate: '16000',
          channels: '1',
        });

        const socket = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log('[Deepgram] Connected');

          // Keep-alive every 8 seconds
          keepAliveRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'KeepAlive' }));
            }
          }, 8000);

          // Use AudioContext to get raw PCM data at 16kHz for best quality
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          source.connect(processor);
          processor.connect(audioContext.destination);

          processor.onaudioprocess = (e) => {
            if (socket.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert float32 to int16
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              socket.send(int16.buffer);
            }
          };

          // Store for cleanup
          mediaRecorderRef.current = { audioContext, processor, source };
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
              const transcript = data.channel.alternatives[0].transcript;
              if (transcript) {
                if (data.is_final) {
                  setInterimText('');
                  onFinalTranscript(transcript + ' ');
                } else {
                  setInterimText(transcript);
                }
              }
            }
          } catch (e) {
            console.error('[Deepgram] Parse error:', e);
          }
        };

        socket.onerror = (e) => {
          console.error('[Deepgram] WebSocket error:', e);
          setError('Connection error — check your API key');
        };

        socket.onclose = (e) => {
          console.log('[Deepgram] Disconnected:', e.code, e.reason);
          setIsRecording(false);
        };
      })
      .catch((err) => {
        console.error('[Deepgram] Mic error:', err);
        setError('Microphone access denied');
        setIsRecording(false);
      });
  }, [DEEPGRAM_API_KEY]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setInterimText('');

    // Stop keep-alive
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }

    // Stop audio processing
    if (mediaRecorderRef.current) {
      const { audioContext, processor, source } = mediaRecorderRef.current;
      try {
        processor.disconnect();
        source.disconnect();
        audioContext.close();
      } catch (e) { /* already closed */ }
      mediaRecorderRef.current = null;
    }

    // Close WebSocket
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  return {
    isRecording,
    interimText,
    error,
    startRecording,
    stopRecording,
  };
}
