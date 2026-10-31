// Hash curto e determinístico (djb2). Serve para chaves e identificadores de cotação, não para segurança.
export function hashString(text: string): string {
  let hash = 5381;
  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) + hash + text.charCodeAt(index)) | 0;
  }
  return (hash >>> 0).toString(16);
}
