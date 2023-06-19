import React, { useEffect, useMemo, useState } from 'react';
import {
  cnx,
  getDocumentMeta,
  Grid,
  IconButton,
  IOCheckmark,
  IOClose,
  IOCloseCircleOutline,
  IODownload,
  IODownloadOutline,
  IOLogOut,
  IOPricetag,
  IORocketOutline,
  IOScanCircleOutline,
  IOSearch,
  IOServer,
  IOSync,
  LDots,
} from '@grandlinex/react-components';
import { MovieLib } from '@elschnagoo/xserver-con/dist/ApiTypes';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';
import MovieComp from '@/component/MovieComp';
import downloadFullPlaylist from '@/utils/PlaylistGen';
import useAuthHelper from '@/utils/AuthUtil';
import usePreload from '@/store/preload';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectLabel,
  selectMax,
  selectMovie,
  selectSearch,
  setMax,
  setSearch,
} from '@/store/MovieStore';
import SearchModal from '@/component/SearchModal';
import LabelModal from '@/component/LabelModal';
import EditModal from '@/component/EditModal';
import DownloadModal from '@/component/DownloadModal';
import LibModal from '@/component/LibModal';

export default function Main() {
  const context = useGlobalContext();
  const dispatch = useAppDispatch();
  const auth = useAuthHelper();
  const { loadLabel, loadMovie } = usePreload();
  const [sModal, setSModal] = useState<boolean>(false);
  const [lModal, setLModal] = useState<boolean>(false);
  const [libModal, setLibModal] = useState<boolean>(false);
  const [dModal, setDModal] = useState<boolean>(false);
  const [double, setDouble] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const max = useAppSelector(selectMax);
  const search = useAppSelector(selectSearch);
  const data = useAppSelector(selectMovie);
  const label = useAppSelector(selectLabel);
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
  }, [search, data, max]);
  return (
    <>
      {sModal ? <SearchModal close={() => setSModal(false)} /> : null}
      {lModal ? <LabelModal close={() => setLModal(false)} /> : null}
      {dModal ? <DownloadModal close={() => setDModal(false)} /> : null}
      {editMode ? <EditModal close={() => setEditMode(false)} /> : null}
      {libModal ? <LibModal close={() => setLibModal(false)} /> : null}
      <Grid flex className="main" flexC vCenter>
        <Grid className="header" flex flexR vCenter flexSpaceB>
          <Grid flex vCenter className="glx-pl-4">
            X-Server
            <span className="hide-on-mobile">
              - {getDocumentMeta('REACT_APP_VERSION')}
            </span>
          </Grid>
          <Grid flex flexR gap={4} vCenter>
            <span>
              ({max}/{data?.length || 0})
            </span>
            {search ? (
              <IconButton
                toolTip={{
                  text: 'Suche zurücksetzen',
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
              onClick={() => {
                setSModal(true);
              }}
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
              toolTip={{
                text: 'Edit Labels',
                position: 'left',
              }}
              onClick={() => {
                setLModal(true);
              }}
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
                setEditMode(!editMode);
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
              onClick={() => {
                setDModal(true);
              }}
            >
              <IODownloadOutline />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Manage Library',
                position: 'left',
              }}
              onClick={() => {
                setLibModal(true);
              }}
            >
              <IOScanCircleOutline />
            </IconButton>
            <IconButton
              toolTip={{
                text: 'Refresh',
                position: 'left',
              }}
              onClick={() => {
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
                  downloadFullPlaylist('XServer', data, auth);
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
          {!data || !label || editMode ? (
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
              {cur.map((e) => (
                <MovieComp
                  key={e.e_id}
                  mov={e}
                  label={label}
                  reload={() => {
                    loadMovie(search);
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
