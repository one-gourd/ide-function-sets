import { generateUUIDv4 } from '@bitjourney/uuid-v4';

export function uuid(prefix = '', len = 5) {
  return prefix + generateUUIDv4().slice(0, len); // id 截断处理
}

// 精简自 https://mathiasbynens.be/demo/javascript-identifier-regex
const REG_FN_NAME = /^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|true|void|with|await|break|catch|class|const|false|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)(?:[\$A-Z_a-z])([\$\d\w])*$/;

export function isValidFunctionName(name: string) {
  return REG_FN_NAME.test(name);
}

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
export function escapeRegex(s: string) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
