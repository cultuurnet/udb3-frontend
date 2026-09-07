import readline from 'node:readline';

export const BACK = Symbol('back');

export const selectFromList = (heading, items, { canGoBack = true } = {}) =>
  new Promise((resolve) => {
    let index = 0;

    const render = () => {
      console.clear();
      console.log(`${heading}\n`);
      items.forEach((item, i) => {
        const label = typeof item === 'string' ? item : item.label;
        const description = typeof item === 'string' ? null : item.description;
        const isSelected = i === index;
        console.log(isSelected ? `\x1b[36m❯ ${label}\x1b[0m` : `  ${label}`);
        if (description) console.log(`    \x1b[2m${description}\x1b[0m`);
      });
      const backHint = canGoBack ? ', ← back' : '';
      console.log(`\n(↑/↓ to move, enter to select${backHint}, esc to quit)`);
    };

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    const onKeypress = (str, key) => {
      if (key?.name === 'up' && items.length > 0) {
        index = (index - 1 + items.length) % items.length;
      } else if (key?.name === 'down' && items.length > 0) {
        index = (index + 1) % items.length;
      } else if (key?.name === 'return') {
        cleanup();
        const item = items[index];
        resolve(typeof item === 'string' ? item : item.label);
        return;
      } else if (key?.name === 'left' && canGoBack) {
        cleanup();
        resolve(BACK);
        return;
      } else if (key?.name === 'escape' || (key?.ctrl && key?.name === 'c')) {
        cleanup();
        resolve(null);
        return;
      }
      render();
    };

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('keypress', onKeypress);
    render();
  });

const PRINTABLE_CHAR = /^[\x20-\x7e]$/;

export const selectFromSearchableList = (heading, items) =>
  new Promise((resolve) => {
    let query = '';
    let index = 0;

    const filtered = () =>
      items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));

    const runAllLabel = (matches) => `▸ Run all ${matches.length} matches`;

    const optionsFor = (matches) =>
      matches.length > 1 ? [...matches, runAllLabel(matches)] : matches;

    const render = () => {
      const options = optionsFor(filtered());
      index = Math.min(index, Math.max(options.length - 1, 0));

      console.clear();
      console.log(`${heading}\n`);
      console.log(`Search: ${query}█\n`);
      if (options.length === 0) {
        console.log('  no matches');
      } else {
        options.forEach((option, i) => {
          const isSelected = i === index;
          console.log(
            isSelected ? `\x1b[36m❯ ${option}\x1b[0m` : `  ${option}`,
          );
        });
      }
      const backHint = query === '' ? ', ← back' : '';
      console.log(
        `\n(type to search, ↑/↓ to move, enter to select${backHint}, esc to quit)`,
      );
    };

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    const onKeypress = (str, key) => {
      const matches = filtered();
      const options = optionsFor(matches);

      if (key?.name === 'up' && options.length > 0) {
        index = (index - 1 + options.length) % options.length;
      } else if (key?.name === 'down' && options.length > 0) {
        index = (index + 1) % options.length;
      } else if (key?.name === 'return') {
        if (options.length > 0) {
          cleanup();
          const isRunAll = matches.length > 1 && index === matches.length;
          resolve(isRunAll ? { all: matches } : { all: [options[index]] });
          return;
        }
      } else if (key?.name === 'backspace') {
        query = query.slice(0, -1);
        index = 0;
      } else if (key?.name === 'left' && query === '') {
        cleanup();
        resolve(BACK);
        return;
      } else if (key?.name === 'escape' || (key?.ctrl && key?.name === 'c')) {
        cleanup();
        resolve(null);
        return;
      } else if (str && PRINTABLE_CHAR.test(str)) {
        query += str;
        index = 0;
      }
      render();
    };

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('keypress', onKeypress);
    render();
  });
