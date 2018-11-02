import draftLog from 'draftlog';
import chalk from 'chalk';
import prettyTime from 'pretty-time';

import { renderBar, colorize, ellipsisLeft } from '../utils/cli';
import { throttle } from '../utils';
import { formatRequest } from '../utils/request';
import { BULLET, TICK } from '../utils/consts';

const globalConsole = console; // eslint-disable-line no-console

const renderT = throttle((fn, ...args) => fn(...args), 1, 50);

export default class BarsReporter {
  constructor() {
    this._render = this._render.bind(this);
    this.drafts = null;
  }

  compiling() {
    if (!globalConsole.draft) {
      draftLog.into(globalConsole);
    }

    globalConsole.log();
    this.drafts = [globalConsole.draft(), globalConsole.draft()];
  }

  compiled(context) {
    this._render(context);
  }

  update(context) {
    renderT(this._render, context);
  }

  _render(context) {
    const {
      state,
      options: { stream, name },
    } = context;

    const columns = stream.columns || 80;
    const color = colorize(state.color);

    if (!state.isRunning) {
      const color2 = state.progress === 100 ? color : chalk.grey;

      const line1 = color2(`${TICK} ${name}`);
      const time = prettyTime(state.elapsed, 2);
      const line2 = chalk.grey(`  Compiled succesfuly in ${time}`);

      this.drafts[0](line1);
      this.drafts[1](line2);
    } else {
      const line1 = [
        color(BULLET),
        color(name),
        renderBar(state.progress, state.color),
        state.msg,
        `(${state.progress || 0}%)`,
        chalk.grey((state.details && state.details[0]) || ''),
        chalk.grey((state.details && state.details[1]) || ''),
      ].join(' ');

      const line2 = state.request
        ? '  ' +
          chalk.grey(ellipsisLeft(formatRequest(state.request), columns - 2))
        : '';

      this.drafts[0](line1);
      this.drafts[1](line2);
    }
  }
}