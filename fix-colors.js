const fs = require('fs');
const path = require('path');

// Folder, w którym znajdują się Twoje komponenty (np. 'app' lub 'src')
const directory = './'; 

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            walk(filePath); // Rekurencyjnie wejdź do podfolderów
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
            // Czytaj zawartość pliku
            let content = fs.readFileSync(filePath, 'utf8');
            
            if (content.includes('bg-white')) {
                // Zamień błędny kod na poprawny
                const updatedContent = content.replace(/bg-white\/50/g, 'bg-white');
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`✅ Naprawiono: ${filePath}`);
            }
        }
    });
}

console.log('Rozpoczynam naprawę plików...');
walk(directory);
console.log('Gotowe!');