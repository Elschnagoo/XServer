import React, { useMemo, useState } from 'react';
import {
  getDocumentMeta,
  Grid,
  IconButton,
  IOCheckmarkDone,
  IOCloseCircle,
  IOCloseCircleOutline,
  IOContract,
  IODownload,
  IOExpand,
  IOGridOutline,
  IOLogOut,
  IOPricetag,
  IOSearch,
  IOServer,
  IOSettings,
  IOSparkles,
  IOSync,
  IOTrash,
} from '@grandlinex/react-components';
import { MovieLib } from '@elschnagoo/xserver-con';
import { useGlobalContext } from '@/context/GlobalContext';
import downloadFullPlaylist from '@/utils/PlaylistGen';
import useAuthHelper from '@/utils/AuthUtil';
import usePreload, { useLoader } from '@/store/preload';
import { useAppDispatch, useAppSelector, usePlayMode } from '@/store';
import {
  resetMulti,
  selectCinema,
  selectEditMode,
  selectMax,
  selectMovie,
  selectMulti,
  selectSearch,
  setCinema,
  setEditMode,
  setModal,
  setMulti,
  setSearch,
} from '@/store/MovieStore';
import { MODAL } from '@/lib';
import ModalSwitch from '@/component/ModalSwitch';
import HomeGrid from '@/page/HomeGrid';
import Cinema from '@/page/Cinema';
import EditModalV2 from '@/component/EditModal';

export default function Main() {
  const dispatch = useAppDispatch();
  useLoader();
  const editMode = useAppSelector(selectEditMode);
  const multi = useAppSelector(selectMulti);
  const max = useAppSelector(selectMax);
  const search = useAppSelector(selectSearch);
  const data = useAppSelector(selectMovie);

  const mode = usePlayMode();
  const [double, setDouble] = useState<boolean>(false);
  const [full, setFull] = useState<boolean>(false);
  const context = useGlobalContext();
  const auth = useAuthHelper();
  const cinema = useAppSelector(selectCinema);
  const { loadLabel, clearLoadMovie, loadRating } = usePreload();
  const cur = useMemo<MovieLib[]>(() => {
    if (!data) {
      return [];
    }
    return data.slice(0, max);
  }, [max, data]);
  return (
    <>
      {editMode !== -1 ? <EditModalV2 /> : null}
      <ModalSwitch />
      <Grid flex className="main" flexC vCenter>
        <Grid className="header" flex flexR vCenter flexSpaceB>
          <Grid flex vCenter className="glx-pl-4">
            <div className="hide-on-mobile">
              X-Server - {getDocumentMeta('REACT_APP_VERSION')}
            </div>
          </Grid>
          <Grid flex flexR gap={4} vCenter>
            {multi.length > 0 ? (
              <>
                <span
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  ({multi.length} sel.)
                </span>
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
            {cinema && (
              <>
                <IconButton
                  toolTip={{
                    text: 'Close cinema mode',
                    position: 'left',
                  }}
                  onClick={() => {
                    dispatch(setCinema(null));
                  }}
                >
                  <IOCloseCircle />
                </IconButton>
                |
              </>
            )}
            <span>
              ({data?.length || 0}/{max})
            </span>
            {search ? (
              <IconButton
                toolTip={{
                  text: 'Reset Search',
                  position: 'left',
                }}
                onClick={() => {
                  dispatch(setSearch(null));
                  clearLoadMovie();
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
                text: 'Edit Mode',
                position: 'left',
              }}
              onClick={() => {
                if (cinema) {
                  const ax = data?.findIndex((e) => e.e_id === cinema.e_id);
                  if (ax !== undefined && ax >= 0) {
                    dispatch(setEditMode(ax));
                    dispatch(setCinema(null));
                    return;
                  }
                }
                dispatch(setEditMode(0));
              }}
              disabled={cur.length === 0}
            >
              <IOServer />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Refresh',
                position: 'left',
              }}
              onClick={() => {
                loadRating();
                loadLabel();
                clearLoadMovie();
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
                text: 'Toggle Fullscreen',
                position: 'left',
              }}
              onClick={() => {
                try {
                  if (!full) {
                    setFull(true);
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
                  } else {
                    setFull(false);
                    const doc = document as any;
                    if (doc.exitFullscreen) {
                      doc.exitFullscreen();
                    } else if (doc.msExitFullscreen) {
                      doc.msExitFullscreen();
                    } else if (doc.mozCancelFullScreen) {
                      doc.mozCancelFullScreen();
                    } else if (doc.webkitCancelFullScreen) {
                      doc.webkitCancelFullScreen();
                    }
                  }
                } catch (e) {
                  console.warn(e);
                }
              }}
            >
              {full ? <IOContract /> : <IOExpand />}
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Settings',
                position: 'left',
              }}
              onClick={() => dispatch(setModal(MODAL.SETTINGS))}
            >
              <IOSettings />
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
        {!cinema && <HomeGrid double={double} />}
        {cinema && <Cinema />}
      </Grid>
    </>
  );
}
