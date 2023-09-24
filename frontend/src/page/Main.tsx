import React, { useEffect, useMemo, useState } from 'react';
import {
  cnx,
  getDocumentMeta,
  Grid,
  IconButton,
  IOCheckmarkDone,
  IOCloseCircle,
  IOCloseCircleOutline,
  IODownload,
  IODownloadOutline,
  IOGridOutline,
  IOLogOut,
  IOPlayCircle,
  IOPricetag,
  IOScanCircleOutline,
  IOSearch,
  IOServer,
  IOSparkles,
  IOSync,
  IOTrash,
  LDots,
} from '@grandlinex/react-components';
import { MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import { useGlobalContext } from '@/context/GlobalContext';
import MovieComp from '@/component/MovieComp';
import downloadFullPlaylist from '@/utils/PlaylistGen';
import useAuthHelper from '@/utils/AuthUtil';
import usePreload from '@/store/preload';
import { useAppDispatch, useAppSelector, usePlayMode } from '@/store';
import {
  addMulti,
  removeMulti,
  resetMulti,
  selectEditMode,
  selectLabel,
  selectMax,
  selectMovie,
  selectMulti,
  selectRevision,
  selectSearch,
  setEditMode,
  setMax,
  setModal,
  setMulti,
  setSearch,
} from '@/store/MovieStore';
import EditModal from '@/component/EditModal';
import { MODAL } from '@/lib';
import ModalSwitch from '@/component/ModalSwitch';

export default function Main() {
  const dispatch = useAppDispatch();
  const editMode = useAppSelector(selectEditMode);
  const multi = useAppSelector(selectMulti);
  const max = useAppSelector(selectMax);
  const search = useAppSelector(selectSearch);
  const data = useAppSelector(selectMovie);
  const label = useAppSelector(selectLabel);
  const revision = useAppSelector(selectRevision);
  const mode = usePlayMode();
  const [double, setDouble] = useState<boolean>(false);
  const context = useGlobalContext();
  const auth = useAuthHelper();
  const { loadLabel, loadMovie, loadRating } = usePreload();
  const cur = useMemo<MovieLib[]>(() => {
    if (!data) {
      return [];
    }
    return data.slice(0, max);
  }, [max, data]);
  useEffect(() => {
    // DATA LENGTH IS SMALLER THAN MAX
    if (data && max > data.length) {
      dispatch(setMax(data.length));
    }
    // MAX IS SMALLER THAN 14 AND MAX IS SMALLER THAN DATA LENGTH
    if (data && max < data.length && max < 14) {
      if (data.length >= 14) {
        dispatch(setMax(14));
      } else {
        dispatch(setMax(data.length));
      }
    }
  }, [search, data, max, dispatch]);
  return (
    <>
      {editMode !== -1 ? <EditModal /> : null}
      <ModalSwitch />
      <Grid flex className="main" flexC vCenter>
        <Grid className="header" flex flexR vCenter flexSpaceB>
          <Grid flex vCenter className="glx-pl-4">
            X-Server
            <span className="hide-on-mobile">
              - {getDocumentMeta('REACT_APP_VERSION')}
            </span>
          </Grid>
          <Grid flex flexR gap={4} vCenter>
            {multi.length > 0 ? (
              <>
                <span>({multi.length} selected)</span>
                <IconButton
                  toolTip={{
                    text: 'Reset Selection',
                    position: 'left',
                  }}
                  onClick={() => {
                    dispatch(resetMulti());
                  }}
                >
                  <IOCloseCircle />
                </IconButton>
                <IconButton
                  className="hide-on-mobile"
                  toolTip={{
                    text: 'Start Multi View',
                    position: 'left',
                  }}
                  onClick={() => {
                    try {
                      const docElm = document.documentElement as any;
                      if (docElm.requestFullscreen) {
                        docElm.requestFullscreen();
                      } else if (docElm.msRequestFullscreen) {
                        docElm.msRequestFullscreen();
                      } else if (docElm.mozRequestFullScreen) {
                        docElm.mozRequestFullScreen();
                      } else if (docElm.webkitRequestFullScreen) {
                        docElm.webkitRequestFullScreen();
                      }
                    } catch (e) {
                      console.warn(e);
                    }
                    dispatch(setModal(MODAL.MULTI_VIEW));
                  }}
                >
                  <IOGridOutline />
                </IconButton>
                <IconButton
                  className="hide-on-mobile"
                  toolTip={{
                    text: 'Set rating to selected',
                    position: 'left',
                  }}
                  onClick={() => dispatch(setModal(MODAL.BULK_RATING))}
                >
                  <IOSparkles />
                </IconButton>
                <IconButton
                  className="hide-on-mobile"
                  toolTip={{
                    text: 'Delete selected',
                    position: 'left',
                  }}
                  onClick={() => dispatch(setModal(MODAL.BULK_DELETE))}
                >
                  <IOTrash />
                </IconButton>
                <IconButton
                  className="hide-on-mobile"
                  toolTip={{
                    text: 'Add labels to selected',
                    position: 'left',
                  }}
                  onClick={() => dispatch(setModal(MODAL.BULK_LABEL))}
                >
                  <IOPricetag />
                </IconButton>
                |
              </>
            ) : null}
            <span>
              ({max}/{data?.length || 0})
            </span>
            {search ? (
              <IconButton
                toolTip={{
                  text: 'Reset Search',
                  position: 'left',
                }}
                onClick={() => {
                  dispatch(setSearch(null));
                  dispatch(setMax(14));
                  loadMovie();
                }}
              >
                <IOCloseCircleOutline />
              </IconButton>
            ) : null}
            <IconButton
              toolTip={{
                text: 'Search',
                position: 'left',
              }}
              onClick={() => dispatch(setModal(MODAL.SEARCH))}
            >
              <IOSearch />
            </IconButton>
            <IconButton
              className="hide-on-mobile"
              toolTip={{
                text: 'Maximize elements',
                position: 'left',
              }}
              onClick={() => {
                setDouble(!double);
              }}
            >
              <span style={double ? { color: 'green' } : undefined}> 2x</span>
            </IconButton>
            <IconButton
              className="hide-on-mobile"
              toolTip={{
                text: 'Select all loaded elements',
                position: 'left',
              }}
              onClick={() => {
                dispatch(setMulti(cur.map((x) => x.e_id)));
              }}
            >
              <IOCheckmarkDone />
            </IconButton>{' '}
            <IconButton
              className="hide-on-mobile"
              toolTip={{
                text: 'Set play mode',
                position: 'left',
              }}
              onClick={() => dispatch(setModal(MODAL.PLAY_MODE))}
            >
              <IOPlayCircle />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Edit Labels',
                position: 'left',
              }}
              onClick={() => dispatch(setModal(MODAL.LABEL))}
            >
              <IOPricetag />
            </IconButton>
            <IconButton
              className="hide-on-mobile"
              toolTip={{
                text: 'Edit Mode',
                position: 'left',
              }}
              onClick={() => {
                dispatch(setEditMode(0));
              }}
              disabled={cur.length === 0}
            >
              <IOServer />
            </IconButton>
            <IconButton
              className="hide-on-mobile"
              toolTip={{
                text: 'Download Media',
                position: 'left',
              }}
              onClick={() => dispatch(setModal(MODAL.DOWNLOAD))}
            >
              <IODownloadOutline />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Manage Library',
                position: 'left',
              }}
              onClick={() => dispatch(setModal(MODAL.LIB))}
            >
              <IOScanCircleOutline />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Refresh',
                position: 'left',
              }}
              onClick={() => {
                loadRating();
                loadLabel();
                loadMovie(search);
                dispatch(setMax(14));
              }}
            >
              <IOSync />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Download Playlist',
                position: 'left',
              }}
              onClick={() => {
                if (data) {
                  downloadFullPlaylist('XServer', data, auth, mode);
                }
              }}
            >
              <IODownload />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Logout',
                position: 'left',
              }}
              onClick={() => context.logOut()}
            >
              <IOLogOut />
            </IconButton>
          </Grid>
        </Grid>
        <Grid
          flex
          flexC
          className={cnx('body', [double, 'body-large'])}
          gap={24}
          vCenter
        >
          {!data || !label || editMode >= 0 ? (
            <Grid className="item" flex flexC hCenter vCenter>
              <div style={{ width: '62px' }}>
                <LDots />
              </div>
            </Grid>
          ) : (
            <Grid
              className="scroll-container"
              flex
              gap={12}
              onScroll={(event: React.UIEvent<HTMLDivElement>) => {
                const { target } = event;
                const div = target as HTMLDivElement;

                if (
                  div.offsetHeight + div.scrollTop >= div.scrollHeight - 350 &&
                  data &&
                  data.length > max
                ) {
                  dispatch(setMax(max + 14));
                }
              }}
            >
              {cur.map((e, index) => (
                <MovieComp
                  key={`${e.e_id}_${revision}`}
                  mov={e}
                  label={label}
                  reload={() => {
                    loadMovie(search);
                  }}
                  index={index}
                  multi={{
                    list: multi,
                    updateMulti: (id) => {
                      if (multi.includes(id)) {
                        dispatch(removeMulti(id));
                      } else {
                        dispatch(addMulti(id));
                      }
                    },
                  }}
                />
              ))}
              {cur.length === 0 ? <Grid> No Elements</Grid> : null}
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
}
