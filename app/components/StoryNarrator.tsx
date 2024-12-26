'use client';

import { useState, useEffect } from 'react';
import ClickableStoryText from './ClickableStoryText';

interface StoryNarratorProps {
  html: string;
}

export default function StoryNarrator({ html }: StoryNarratorProps) {
  const [isPaused, setIsPaused] = useState(true);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState(0);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  useEffect(() => {
    const synth = window.speechSynthesis;
    const text = stripHtml(html);
    const u = new SpeechSynthesisUtterance(text);
    
    u.onboundary = (event) => {
      setCurrentPosition(event.charIndex);
    };

    u.onend = () => {
      setIsPaused(true);
      setCurrentPosition(0);
    };

    setUtterance(u);

    const loadVoices = () => {
      const availableVoices = synth.getVoices().filter(voice => voice.lang.startsWith('en'));
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      synth.cancel();
    };
  }, [html]);

  const speakWord = (word: string) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any ongoing speech
    
    const wordUtterance = new SpeechSynthesisUtterance(word);
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) wordUtterance.voice = voice;
    }
    
    synth.speak(wordUtterance);
  };

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    if (utterance) {
      if (isPaused) {
        synth.cancel();
        
        if (currentPosition > 0) {
          const text = stripHtml(html);
          const newUtterance = new SpeechSynthesisUtterance(text.slice(currentPosition));
          
          if (selectedVoice) {
            const voice = voices.find(v => v.name === selectedVoice);
            if (voice) newUtterance.voice = voice;
          }
          
          newUtterance.onboundary = (event) => {
            setCurrentPosition(currentPosition + event.charIndex);
          };

          newUtterance.onend = () => {
            setIsPaused(true);
            setCurrentPosition(0);
          };

          synth.speak(newUtterance);
        } else {
          if (selectedVoice) {
            const voice = voices.find(v => v.name === selectedVoice);
            if (voice) utterance.voice = voice;
          }
          synth.speak(utterance);
        }
      }
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;
    synth.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPaused(true);
    setCurrentPosition(0);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
    handleStop();
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedVoice}
          onChange={handleVoiceChange}
          className="px-3 py-2 border rounded-lg"
        >
          {voices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={isPaused ? handlePlay : handlePause}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {isPaused ? 'Play' : 'Pause'}
        </button>
        
        <button
          onClick={handleStop}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Stop
        </button>
      </div>

      <ClickableStoryText html={html} onWordClick={speakWord} />
    </div>
  );
} 