import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { useChat } from '@ai-sdk/react';

function Test() {
  const result = useChat({ api: '/api/chat' });
  console.log("type of append:", typeof result.append);
  console.log("type of sendMessage:", typeof result.sendMessage);
  return React.createElement('div', null, 'test');
}

renderToStaticMarkup(React.createElement(Test));
