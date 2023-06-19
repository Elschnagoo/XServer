export interface FullResourceMeta extends ResourceMeta {
  directStream: FormatsEntity | null;
}
export interface ResourceMeta {
  id: string;
  title: string;
  formats?: FormatsEntity[] | null;
  thumbnails?: ThumbnailsEntity[] | null;
  description?: string | null;
  upload_date: string;
  uploader: string;
  uploader_id: string;
  uploader_url?: string | null;
  channel_id?: string | null;
  channel_url?: string | null;
  duration?: number | null;
  view_count?: number | null;
  average_rating?: null;
  age_limit?: number | null;
  webpage_url: string;
  categories?: string[] | null;
  tags?: (string | null)[] | null;
  is_live?: boolean | null;
  channel?: string | null;
  extractor: string;
  webpage_url_basename: string;
  extractor_key: string;
  n_entries?: number | null;
  playlist?: string | null;
  playlist_id?: string | null;
  playlist_title?: string | null;
  playlist_uploader?: string | null;
  playlist_uploader_id?: string | null;
  playlist_index?: number | null;
  thumbnail: string;
  display_id: string;
  requested_subtitles?: null;
  requested_formats?: RequestedFormatsEntity[] | null;
  format: string;
  format_id: string;
  width: number;
  height: number;
  resolution?: null;
  fps: number;
  vcodec: string;
  vbr?: number | null;
  stretched_ratio?: null;
  acodec: string;
  abr?: number | null;
  ext: string;
  fulltitle: string;
  _filename: string;
  subtitles?: Subtitles | null;
  timestamp?: number | null;
  url?: string | null;
  manifest_url?: string | null;
  tbr?: number | null;
  protocol?: string | null;
  preference?: null;
  quality?: number | null;
  format_note?: string | null;
  http_headers?: HttpHeaders | null;
  automatic_captions?: AutomaticCaptions | null;
}
export interface FormatsEntity {
  asr?: number | null;
  filesize?: number | null;
  format_id: string;
  format_note?: string | null;
  fps?: number | null;
  height?: number | null;
  quality?: number | null;
  tbr: number;
  url: string;
  width?: number | null;
  ext: string;
  vcodec: string;
  acodec: string;
  abr?: number | null;
  downloader_options?: DownloaderOptions | null;
  container?: string | null;
  format: string;
  protocol: string;
  http_headers: HttpHeaders;
  vbr?: number | null;
  manifest_url?: string | null;
  preference?: null;
}
export interface DownloaderOptions {
  http_chunk_size: number;
}
export interface HttpHeaders {
  'User-Agent': string;
  'Accept-Charset': string;
  Accept: string;
  'Accept-Encoding': string;
  'Accept-Language': string;
}
export interface ThumbnailsEntity {
  height?: number | null;
  url: string;
  width?: number | null;
  resolution?: string | null;
  id: string;
}
export interface RequestedFormatsEntity {
  asr?: number | null;
  filesize: number;
  format_id: string;
  format_note: string;
  fps?: number | null;
  height?: number | null;
  quality: number;
  tbr: number;
  url: string;
  width?: number | null;
  ext: string;
  vcodec: string;
  acodec: string;
  abr?: number | null;
  downloader_options: DownloaderOptions;
  container: string;
  format: string;
  protocol: string;
  http_headers: HttpHeaders;
  vbr?: number | null;
}

export type Subtitles = Record<string, SubType[] | null>;
export interface SubType {
  ext: string;
  url: string;
}

export type AutomaticCaptions = Record<string, any>;
