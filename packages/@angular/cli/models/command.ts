import { Logger } from '@angular-devkit/core/src/logger';
const { cyan } = require('chalk');

export interface CommandConstructor {
  new(context: CommandContext, logger: Logger): Command;
  aliases: string[];
  scope: CommandScope.everywhere;
}

export enum CommandScope {
  everywhere,
  inProject,
  outsideProject
}

export abstract class Command {
  constructor(context: CommandContext, logger: Logger) {
    this.logger = logger;
    if (context) {
      this.project = context.project;
      this.ui = context.ui;
    }
  }

  initialize(_options: any): Promise<void> {
    return Promise.resolve();
  }

  validate(_options: any): boolean | Promise<boolean> {
    return true;
  }

  printHelp(_options: any): void {
    this.printHelpUsage(this.name, this.arguments, this.options);
    this.printHelpOptions(this.options);
  }

  protected printHelpUsage(name: string, args: string[], options: Option[]) {
    const argDisplay = args && args.length > 0
      ? ' ' + args.map(a => `<${a}>`).join(' ')
      : '';
    const optionsDisplay = options && options.length > 0
      ? ` [options]`
      : ``;
    this.logger.info(`usage: ng ${name}${argDisplay}${optionsDisplay}`);
  }

  protected printHelpOptions(options: Option[]) {
    if (options && this.options.length > 0) {
      this.logger.info(`options:`);
      this.options
        .filter(o => !o.hidden)
        .forEach(o => {
        const aliases = o.aliases && o.aliases.length > 0
          ? '(' + o.aliases.map(a => `-${a}`).join(' ') + ')'
          : '';
        this.logger.info(`  ${cyan(o.name)} ${aliases}`);
        this.logger.info(`    ${o.description}`);
      });
    }
  }

  abstract run(options: any): any | Promise<any>;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly arguments: string[];
  abstract readonly options: Option[];
  public hidden = false;
  public unknown = false;
  public scope = CommandScope.everywhere;
  protected readonly logger: Logger;
  protected readonly project: any;
  protected readonly ui: Ui;
}

export interface CommandContext {
  ui: Ui;
  project: any;
}

export interface Ui {
  writeLine: (message: string) => void;
  errorLog: (message: string) => void;
}

export abstract class Option {
  abstract readonly name: string;
  abstract readonly description: string;
  readonly default?: string | number | boolean;
  readonly required?: boolean;
  abstract readonly aliases?: string[]; // (string | { [key: string]: string })[];
  abstract readonly type: any;
  readonly values?: any[];
  readonly hidden?: boolean = false;
}
