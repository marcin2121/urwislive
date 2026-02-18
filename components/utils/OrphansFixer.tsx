'use client'
import { useEffect } from 'react'

export default function OrphansFixer() {
  useEffect(() => {
    // Lista spójników do "przyklejenia"
    const orphans = ['a', 'i', 'o', 'u', 'w', 'z', 'A', 'I', 'O', 'U', 'W', 'Z'];

    const fixNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent || '';
        let modified = false;

        orphans.forEach(o => {
          // Szukamy spójnika otoczonego spacjami: " i " -> " i\u00A0"
          const regex = new RegExp(` ${o} `, 'g');
          if (regex.test(text)) {
            text = text.replace(regex, ` ${o}\u00A0`);
            modified = true;
          }
        });

        if (modified) node.textContent = text;
      } else {
        // Nie skanujemy skryptów ani stylów
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
          node.childNodes.forEach(fixNode);
        }
      }
    };

    // Uruchom po załadowaniu
    const mainContent = document.querySelector('main');
    if (mainContent) fixNode(mainContent);
  }, []);

  return null; // Komponent nic nie renderuje, tylko działa
}