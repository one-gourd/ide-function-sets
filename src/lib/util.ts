import { generateUUIDv4 } from '@bitjourney/uuid-v4';

export function uuid(prefix = '', len = 5) {
  return prefix + generateUUIDv4().slice(0, len); // id 截断处理
}
