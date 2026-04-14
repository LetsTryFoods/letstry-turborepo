type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class AuthLogger {
  private static readonly PREFIX = '[Auth]';
  private static readonly IS_DEV = __DEV__;

  private static format(level: LogLevel, message: string): string {
    const timestamp = new Date().toLocaleTimeString();
    return `${AuthLogger.PREFIX} [${timestamp}] [${level}] ${message}`;
  }

  static debug(message: string, ...args: any[]) {
    if (this.IS_DEV) {
      console.log(this.format('DEBUG', message), ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    console.log(this.format('INFO', message), ...args);
  }

  static warn(message: string, ...args: any[]) {
    console.warn(this.format('WARN', message), ...args);
  }

  static error(message: string, error?: any, ...args: any[]) {
    console.error(this.format('ERROR', message), error, ...args);
  }


  static step(step: number, message: string, ...args: any[]) {
    if (this.IS_DEV) {
      console.log(`${AuthLogger.PREFIX} Step ${step}: ${message}`, ...args);
    }
  }
}

export default AuthLogger;
