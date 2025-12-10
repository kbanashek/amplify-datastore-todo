/**
 * Enhanced logging utility with icons and formatting
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

interface LogOptions {
  level?: LogLevel;
  icon?: string;
  color?: string;
  data?: any;
}

const ICONS = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  debug: '🔍',
  task: '📋',
  question: '❓',
  answer: '✏️',
  navigation: '🧭',
  activity: '📊',
  sync: '🔄',
  database: '💾',
  validation: '✔️',
  submit: '📤',
  seed: '🌱',
};

const COLORS = {
  info: '\x1b[36m', // Cyan
  success: '\x1b[32m', // Green
  warning: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m',
};

/**
 * Enhanced logger with icons and formatting
 */
export const logger = {
  info: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.info, data });
  },

  success: (message: string, data?: any) => {
    log(message, { level: 'success', icon: ICONS.success, data });
  },

  warning: (message: string, data?: any) => {
    log(message, { level: 'warning', icon: ICONS.warning, data });
  },

  error: (message: string, data?: any) => {
    log(message, { level: 'error', icon: ICONS.error, data });
  },

  debug: (message: string, data?: any) => {
    log(message, { level: 'debug', icon: ICONS.debug, data });
  },

  task: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.task, data });
  },

  question: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.question, data });
  },

  answer: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.answer, data });
  },

  navigation: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.navigation, data });
  },

  activity: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.activity, data });
  },

  sync: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.sync, data });
  },

  database: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.database, data });
  },

  validation: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.validation, data });
  },

  submit: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.submit, data });
  },

  seed: (message: string, data?: any) => {
    log(message, { level: 'info', icon: ICONS.seed, data });
  },
};

function log(message: string, options: LogOptions = {}) {
  const { level = 'info', icon = ICONS[level], data } = options;
  const color = COLORS[level] || COLORS.info;
  const reset = COLORS.reset;

  // Format timestamp
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

  // Format message with icon
  const formattedMessage = `${icon} [${timestamp}] ${message}`;

  // Log with color (works in terminal, not in React Native console)
  if (data !== undefined) {
    console.log(`${color}${formattedMessage}${reset}`, data);
  } else {
    console.log(`${color}${formattedMessage}${reset}`);
  }
}

/**
 * Create a section divider for logs
 */
export function logSection(title: string) {
  const divider = '═'.repeat(50);
  console.log(`\n${divider}`);
  console.log(`  ${ICONS.info} ${title}`);
  console.log(`${divider}\n`);
}

/**
 * Create a subsection divider
 */
export function logSubsection(title: string) {
  const divider = '─'.repeat(40);
  console.log(`\n${divider}`);
  console.log(`  ${title}`);
  console.log(`${divider}`);
}

