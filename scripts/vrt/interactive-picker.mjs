import readline from 'node:readline';

export const BACK = Symbol('back');

const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

const PRINTABLE_CHAR = /^[\x20-\x7e]$/;

const labelOf = (item) => (typeof item === 'string' ? item : item.label);
const descriptionOf = (item) =>
  typeof item === 'string' ? null : item.description;

export const selectFromList = (
  heading,
  items,
  { canGoBack = true, isSearchable = false } = {},
) =>
  new Promise((resolve) => {
    let query = '';
    let index = 0;

    const matchingItems = () =>
      isSearchable
        ? items.filter((item) =>
            labelOf(item).toLowerCase().includes(query.toLowerCase()),
          )
        : items;

    const optionsFor = (matches) =>
      isSearchable && matches.length > 1
        ? [
            ...matches,
            { label: `▸ Run all ${matches.length} matches`, isRunAll: true },
          ]
        : matches;

    const render = () => {
      const options = optionsFor(matchingItems());
      index = Math.min(index, Math.max(options.length - 1, 0));

      console.clear();
      console.log(`${heading}\n`);
      if (isSearchable) console.log(`Search: ${query}█\n`);

      if (options.length === 0) {
        console.log('  no matches');
      } else {
        options.forEach((option, i) => {
          const label = labelOf(option);
          console.log(i === index ? cyan(`❯ ${label}`) : `  ${label}`);
          const description = descriptionOf(option);
          if (description) console.log(`    ${dim(description)}`);
        });
      }

      const hints = [
        isSearchable && 'type to search',
        '↑/↓ to move',
        'enter to select',
        canGoBack && query === '' && '← back',
        'esc to quit',
      ].filter(Boolean);
      console.log(`\n(${hints.join(', ')})`);
    };

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    const onKeypress = (str, key) => {
      const matches = matchingItems();
      const options = optionsFor(matches);

      if (key?.name === 'up' && options.length > 0) {
        index = (index - 1 + options.length) % options.length;
      } else if (key?.name === 'down' && options.length > 0) {
        index = (index + 1) % options.length;
      } else if (key?.name === 'return') {
        if (options.length > 0) {
          cleanup();
          const option = options[index];
          resolve(option.isRunAll ? matches.map(labelOf) : [labelOf(option)]);
          return;
        }
      } else if (key?.name === 'backspace' && isSearchable) {
        query = query.slice(0, -1);
        index = 0;
      } else if (key?.name === 'left' && canGoBack && query === '') {
        cleanup();
        resolve(BACK);
        return;
      } else if (key?.name === 'escape' || (key?.ctrl && key?.name === 'c')) {
        cleanup();
        resolve(null);
        return;
      } else if (isSearchable && str && PRINTABLE_CHAR.test(str)) {
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
