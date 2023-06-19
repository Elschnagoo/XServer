import https from 'https';
import http from 'http';
import * as fs from 'fs';
import Path from 'path';

const extMap = new Map<string, string>([
  ['text/html; charset=utf-8', 'html'],
  ['text/html', 'html'],
  ['text/plain', 'txt'],
  ['video/mp4', 'mp4'],
  ['video/mpeg', 'mpeg'],
  ['video/webm', 'webm'],
  ['audio/webm', 'weba'],
  ['audio/mpeg', 'mp3'],
  ['audio/wav', 'wav'],
  ['audio/aac', 'aac'],
  ['audio/webm', 'aac'],
  ['audio/opus', 'opus'],
  ['image/webp', 'webp'],
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/gif', 'gif'],
  ['image/webp', 'webp'],
  ['image/svg+xml', 'svg'],
  ['application/pdf', 'pdf'],
  ['application/zip', 'zip'],
  ['application/x-rar-compressed', 'rar'],
  ['application/x-7z-compressed', '7z'],
  ['application/x-tar', 'tar'],
  ['application/x-bzip2', 'bz2'],
  ['application/x-gzip', 'gz'],
  ['application/json; charset=utf-8', 'json'],
]);

function selectClient(url: string) {
  if (url.startsWith('https')) {
    return https;
  }
  return http;
}

export default async function downStream(
  url: string,
  path: string,
  fExt?: string
): Promise<{
  name: string;
  size: number;
  type: string;
} | null> {
  return new Promise((resolve) => {
    try {
      selectClient(url)
        .get(url, (res) => {
          const raw = extMap.get(res.headers['content-type'] as string);
          const ext = raw || 'blob';
          const fName = `${path}.${fExt || ext}`;
          const file = fs.createWriteStream(fName);
          // A chunk of data has been received.
          res.on('data', (chunk) => {
            file.write(chunk);
          });

          // The whole response has been received. Print out the result.
          res.on('end', () => {
            const cl = res.headers['content-length'];
            const cli = parseInt(cl as string, 10);
            file.close();
            resolve({
              size: cli,
              name: Path.basename(fName),
              type: res.headers['content-type'] || '',
            });
          });
        })
        .on('error', (err) => {
          console.error(`Error: ${err.message}`);
          resolve(null);
        });
    } catch (e) {
      console.error(e);
      resolve(null);
    }
  });
}
