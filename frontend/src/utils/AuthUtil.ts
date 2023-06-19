import { selectEndpoint, selectToken, useAppSelector } from '@/store';
import { checkCookie } from '@/utils/CookieUtil';

export default function useAuthHelper() {
  const api = useAppSelector(selectEndpoint);
  const token = useAppSelector(selectToken);

  return (url: string, endpoint = false, force = false) => {
    const newUrl = endpoint ? api + url : url;
    const given = new URL(api);
    const target = new URL(newUrl);
    if (
      (!checkCookie('glxauth') || force) &&
      given.hostname === target.hostname
    ) {
      target.searchParams.append('glxauth', token.replace(/^Bearer /, ''));
      // console.log('no cookie');
      return target.toString();
    }
    // console.log('cookie or no hotname match');
    return newUrl;
  };
}

export function useUserImage() {
  const auth = useAuthHelper();

  function userImgFc(id: string) {
    return auth(`/api/user/icon/${id}`, true);
  }
  return userImgFc;
}
