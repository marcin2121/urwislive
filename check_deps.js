const fs = require('fs');
const content = fs.readFileSync('c:/sklepurwis/sklep-urwis.pl/components/urwisek/games/useBubbleShooter.tsx', 'utf8');

const callbacks = content.match(/const (\w+) = useCallback\(\(([\s\S]*?)\) => \{([\s\S]*?)\}, \[(.*?)\]\);/g);

if (callbacks) {
  callbacks.forEach(cb => {
    const match = cb.match(/const (\w+) = useCallback\(\(([\s\S]*?)\) => \{([\s\S]*?)\}, \[(.*?)\]\);/);
    if (!match) return;
    const [_, name, args, body, deps] = match;
    console.log(`\nFunction: ${name}`);
    console.log(`Deps: [${deps}]`);
    
    // Find used functions/states in body
    const bodyText = body.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const usedMatches = bodyText.match(/[a-zA-Z]\w*/g) || [];
    const usedSet = new Set(usedMatches);
    
    // States/Hooks we should check
    const potentialDeps = ['isStarted', 'gameOver', 'score', 'level', 'misses', 'rewardMsg', 'rankingData', 'rankingStatusMessage', 'playerName', 'isSubmittingScore', 'nextColorUI'];
    const potentialFuncs = ['getNeighbors', 'findCluster', 'removeFloatingBalls', 'endGame', 'shiftBoardDown', 'snapToGrid', 'updatePhysics', 'drawTrajectory', 'render', 'swapBalls', 'initGame', 'handleGameOver', 'submitScore', 'setIsStarted', 'setGameOver', 'setScore', 'setLevel', 'setMisses', 'setRewardMsg', 'setRankingData', 'setRankingStatusMessage', 'setNextColorUI', 'setIsSubmittingScore'];
    
    const missing = [];
    [...potentialDeps, ...potentialFuncs].forEach(d => {
      if (usedSet.has(d) && !deps.includes(d)) {
        // Exclude stable setters if needed (but ESLint recommends including them)
        missing.push(d);
      }
    });
    
    if (missing.length > 0) {
      console.log(`MISSING: ${missing.join(', ')}`);
    } else {
      console.log('Deps OK');
    }
  });
}
