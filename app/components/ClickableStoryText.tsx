'use client';

import { useState, useEffect } from 'react';

interface ClickableStoryTextProps {
  html: string;
  onWordClick: (word: string) => void;
}

export default function ClickableStoryText({ html, onWordClick }: ClickableStoryTextProps) {
  const [processedContent, setProcessedContent] = useState<Array<{
    type: 'text' | 'html';
    content: string;
  }>>([]);

  useEffect(() => {
    const div = document.createElement('DIV');
    div.innerHTML = html;

    const processed: Array<{ type: 'text' | 'html'; content: string }> = [];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        processed.push({
          type: 'text',
          content: node.textContent
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.childNodes.length === 0) {
          processed.push({
            type: 'html',
            content: element.outerHTML
          });
        } else {
          processed.push({
            type: 'html',
            content: element.outerHTML.split('>')[0] + '>'
          });
          Array.from(element.childNodes).forEach(processNode);
          processed.push({
            type: 'html',
            content: '</' + element.tagName.toLowerCase() + '>'
          });
        }
      }
    };

    Array.from(div.childNodes).forEach(processNode);
    setProcessedContent(processed);
  }, [html]);

  const renderContent = () => {
    return processedContent.map((item, index) => {
      if (item.type === 'html') {
        return (
          <span
            key={index}
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        );
      } else {
        return item.content.split(/\s+/).map((word, wordIndex) => (
          <span
            key={`${index}-${wordIndex}`}
            onClick={() => onWordClick(word)}
            className="cursor-pointer hover:bg-yellow-100 px-0.5 rounded transition-colors"
          >
            {word}{' '}
          </span>
        ));
      }
    });
  };

  return (
    <div className="prose prose-lg max-w-none">
      {renderContent()}
    </div>
  );
} 