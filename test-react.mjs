import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { useChat } from '@ai-sdk/react';

function Test() {
  const result = useChat({ api: '/api/chat' });
  console.log("Keys:", Object.keys(result));
  return React.createElement('div', null, result.input);
}

const html = renderToStaticMarkup(React.createElement(Test));
