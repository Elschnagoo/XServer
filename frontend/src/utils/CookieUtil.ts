import { useEffect, useState } from 'react';
import { getDocumentMeta } from '@grandlinex/react-components';
import { selectEndpoint, selectToken, useAppSelector } from '@/store';
import { parseJwtLegacy } from '@/lib/ParseJWT';

function cookieString(
  cname: string,
  cvalue: string,
  expire: Date,
  domain?: string
) {
  const expires = `expires=${expire.toUTCString()}`;
  return `${cname}=${cvalue};${expires};SameSite=Lax;${
    domain ? `Domain=${domain};` : ''
  }path=/`;
}

function setCookie(cname: string, cvalue: string, expire: Date) {
  const dom = getDocumentMeta('REACT_C_NAME');
  if (!dom) {
    console.error('No domain found for cookie');
    return;
  }
  document.cookie = cookieString(cname, cvalue, expire, dom);
}

function rmCookie(cname: string) {
  document.cookie = `${cname}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
}

function clearCookie() {
  rmCookie('glxauth');
}

function getCookie(cname: string) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (const element of ca) {
    let c = element;
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function checkCookie(cname: string) {
  const user = getCookie(cname);
  return !!user && user !== '';
}
function useCookie() {
  const token = useAppSelector(selectToken);
  const api = useAppSelector(selectEndpoint);

  const [valid, setValid] = useState(false);
  useEffect(() => {
    if (token && api) {
      const jwt = parseJwtLegacy(token);
      const date = new Date(0);
      date.setUTCSeconds(jwt?.exp || 0);
      setCookie('glxauth', token.replace('Bearer ', ''), date);

      if (checkCookie('glxauth')) {
        setValid(true);
        // toast.success('Cookie set', { autoClose: 2000 });
      } else {
        setValid(false);
        console.warn('Cookie invalid domain');
        //        toast.error('Cookie invalid domain', { autoClose: 2000 });
      }
    } else {
      setValid(false);
      clearCookie();
      //      toast.warning('Cookie unset', { autoClose: 2000 });
    }
  }, [token, api]);
  return valid;
}
export { checkCookie, useCookie };
