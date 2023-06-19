import useAuthHelper from '@/utils/AuthUtil';

function useImgThumbHelper() {
  const auth = useAuthHelper();
  function getImgThumb(item?: any) {
    if (!item) {
      return undefined;
    }
    let img = item.meta?.img;
    if (!img) {
      if (item.direct?.img) {
      } else if (item.watch?.movie) {
        img = auth(
          `/s/watch-service/movie/img/${item.watch.movie}?type=poster`,
          true
        );
      } else if (item.watch?.show) {
        img = auth(
          `/s/watch-service/show/img/${item.watch.show}?type=poster`,
          true
        );
      }
    }
    return img;
  }
  return getImgThumb;
}

export default useImgThumbHelper;
