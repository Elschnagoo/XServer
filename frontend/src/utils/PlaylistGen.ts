import { toast } from 'react-toastify';
import { MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import useAuthHelper from '@/utils/AuthUtil';
import { usePlayMode } from '@/store';

function downloadPlaylist(title: string, text: string) {
  try {
    const blob = new Blob([text], {
      type: 'text/plain',
    });
    const dUrl = window.URL.createObjectURL(blob);

    const fileTitle = title.replace(/[^a-zA-Z0-9.]/g, '_');

    const link = document.createElement('a');
    link.style.display = 'none';

    link.setAttribute('target', '_blank');
    link.setAttribute('href', dUrl);
    link.setAttribute('download', `${fileTitle}.m3u8`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    toast.error("Can't generate playlist");
  }
}

export default function downloadFullPlaylist(
  title: string,
  files: MovieLib[],
  auth: ReturnType<typeof useAuthHelper>,
  mode: ReturnType<typeof usePlayMode>,
) {
  const lines = ['#EXTM3U', `#PLAYLIST:${title}`];
  files.forEach((s) => {
    lines.push(`#EXTINF:-1, ${s.movie_name}`);
    lines.push(auth(`/movie/stream/${s.e_id}?${mode(true)}`, true, true));
  });

  downloadPlaylist(title, lines.join('\n'));
}
