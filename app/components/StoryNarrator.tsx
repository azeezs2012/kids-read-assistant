'use client';

import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface StoryNarratorProps {
  html: string;
}

export default function StoryNarrator({ html }: StoryNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);
  const htmlWordsRef = useRef<HTMLElement[]>([]);

  // Initialize available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setSelectedVoice(availableVoices[0]); // Set default voice
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(html);
    
    const walkTextNodes = (node: Node, words: string[] = [], elements: HTMLElement[] = []) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textWords = node.textContent?.trim().split(/\s+/) || [];
        textWords.forEach(word => {
          words.push(word);
          elements.push(node.parentElement as HTMLElement);
        });
      }
      node.childNodes.forEach(child => walkTextNodes(child, words, elements));
      return { words, elements };
    };

    const { words, elements } = walkTextNodes(tempDiv);
    wordsRef.current = words;
    htmlWordsRef.current = elements;

    initializeUtterance(words.join(' '));
  }, [html, selectedVoice]);

  const initializeUtterance = (text: string) => {
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utteranceRef.current.voice = selectedVoice;
    }
    
    utteranceRef.current.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordIndex(prev => prev + 1);
      }
    };

    utteranceRef.current.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };
  };

  const stopNarration = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const togglePlay = () => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (utteranceRef.current) {
        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        } else {
          speechSynthesis.speak(utteranceRef.current);
        }
        setIsPlaying(true);
      }
    }
  };

  const speakWord = (word: string, index: number) => {
    // Cancel any ongoing speech and reset state
    speechSynthesis.cancel();
    setIsPlaying(false);
    
    // Create new utterance for the single word
    const wordUtterance = new SpeechSynthesisUtterance(word);
    
    // Apply selected voice if available
    if (selectedVoice) {
      wordUtterance.voice = selectedVoice;
    }

    // Set up event handlers
    wordUtterance.onstart = () => {
      setCurrentWordIndex(index);
    };

    wordUtterance.onend = () => {
      setCurrentWordIndex(-1);
    };

    // Speak the word
    speechSynthesis.speak(wordUtterance);
  };

  const renderHighlightedHtml = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(html);

    let wordIndex = 0;
    const highlightWords = (node: Node): Node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        const fragment = document.createDocumentFragment();
        const words = node.textContent.split(/(\s+)/);
        
        words.forEach(word => {
          if (word.trim()) {
            const span = document.createElement('span');
            span.textContent = word;
            span.style.cursor = 'pointer';
            // Add a distinctive class for clickable words
            span.className = `clickable-word ${
              wordIndex === currentWordIndex ? 'bg-yellow-200' : ''
            } transition-colors duration-200`;
            // Store the word and index as data attributes
            span.dataset.word = word;
            span.dataset.index = wordIndex.toString();
            fragment.appendChild(span);
            wordIndex++;
          } else {
            fragment.appendChild(document.createTextNode(word));
          }
        });
        return fragment;
      }
      
      node.childNodes.forEach((child, i) => {
        const newChild = highlightWords(child);
        if (newChild !== child) {
          node.replaceChild(newChild, child);
        }
      });
      
      return node;
    };

    const processedContent = highlightWords(tempDiv);
    return { __html: processedContent.innerHTML };
  };

  // Add click handler using useEffect
  useEffect(() => {
    const handleWordClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('clickable-word')) {
        const word = target.dataset.word;
        const index = parseInt(target.dataset.index || '0', 10);
        if (word) {
          console.log('Word clicked:', word, index);
          speakWord(word, index);
        }
      }
    };

    // Add click listener to the container
    const container = document.querySelector('.prose');
    if (container) {
      container.addEventListener('click', handleWordClick);
    }

    return () => {
      // Clean up listener
      if (container) {
        container.removeEventListener('click', handleWordClick);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select
          className="px-4 py-2 border rounded-lg"
          onChange={(e) => {
            const voice = voices.find(v => v.name === e.target.value);
            setSelectedVoice(voice || null);
          }}
          value={selectedVoice?.name}
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
        <button
          onClick={togglePlay}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={stopNarration}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Stop
        </button>
      </div>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={renderHighlightedHtml()}
      />
    </div>
  );
} 
