import React, { useState } from 'react';
import {
  Badge,
  BadgeColor,
  Button,
  Form,
  Grid,
  IconButton,
  INames,
  InputOptionType,
  Tooltip,
} from '@grandlinex/react-components';
import { FindVideoSuggestionsResponseElement } from '@elschnagoo/xserver-con';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';
import PersistentStorage from '@/utils/PersistentStorage';
import LoadingComp from '@/component/LoadingComp';
import { useMovieContext } from '@/context/MovieContext';

export function FindMatchElement({
  item,
  canUpdate,
}: {
  canUpdate: boolean;
  item: FindVideoSuggestionsResponseElement;
}) {
  const mc = useMovieContext();
  const context = useGlobalContext();
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  return (
    <Grid key={item.meta.url} className="suggestion-item" gap={4}>
      <hr />
      <h3>
        <a href={item.meta.url} target="_blank" rel="noreferrer">
          {item.meta.title}
        </a>
      </h3>
      <img src={item.meta.thumbnail} alt="Thumbnail" />
      <Grid flex flexR flexSpaceB>
        <div>
          <IconButton
            toolTip={{
              text: 'Show raw metadata',
            }}
            onClick={() => {
              setOpen(!open);
            }}
            icon={open ? 'IOChevronDown' : 'IOChevronForward'}
          />
          {canUpdate && (
            <IconButton
              icon="IOLink"
              disabled={update}
              toolTip={{
                text: 'Import data to Video',
              }}
              onClick={async () => {
                setUpdate(true);
                const a = await context.updateMovie(mc.mov.e_id, {
                  movie_name: item.meta.title,
                  movie_url: item.meta.url,
                });
                const b = await Promise.all(
                  item.label.map(async (value) => {
                    return context.bindLabel({
                      label: value.e_id,
                      mov_lib: mc.mov.e_id,
                    });
                  }),
                );
                const c = b.reduce((p, d) => p && d.success, true);
                if (a.success && c) {
                  toast.success('Data imported');
                  mc.update(a.data!);
                } else if (a.success && !c) {
                  toast.warn('Data imported with warnings');
                  mc.update(a.data!);
                } else {
                  toast.error('Error importing data');
                }
                setUpdate(false);
              }}
            />
          )}
          <IconButton
            icon="IODownload"
            toolTip={{
              text: 'Download video and add to library',
            }}
            disabled={update}
            onClick={async () => {
              setUpdate(true);

              const l = await context.downloadMedia({
                url: item.meta.url,
                label: item.label.map(({ e_id }) => ({ e_id })),
              });
              if (l.success) {
                toast.success('Download queued');
              } else {
                toast.error('Error adding download');
              }
              setUpdate(false);
            }}
          />
        </div>
        <div>
          <b>Duration:</b>{' '}
          <i>
            {Math.trunc(
              moment.duration(item.meta.duration, 'seconds').asMinutes(),
            )}{' '}
            min
          </i>
        </div>
      </Grid>
      {open && (
        <div>
          {item.search.map((s) => (
            <div>{s.text}</div>
          ))}
        </div>
      )}
      <Grid flex flexRow className="glx-flex-wrap" gap={8}>
        {item.label.map((l) => (
          <Badge
            icon={l.icon as INames}
            text={l.label_name}
            color={l.color as BadgeColor}
          />
        ))}
      </Grid>
      {update && (
        <Grid flex flexR hCenter>
          <LoadingComp loading />
        </Grid>
      )}
      <hr />
    </Grid>
  );
}

export default function FindMatchComp() {
  const context = useGlobalContext();
  const { mov } = useMovieContext();
  const [data, setData] = useState<
    FindVideoSuggestionsResponseElement[] | null
  >(null);

  const [page, setPage] = useState(-1);
  const [f, setF] = useState<Record<string, string>>({});

  return (
    <Grid flex flexC gap={8}>
      <h2>Video Suggestion</h2>
      <Form<any>
        className="find-match-form"
        options={[
          [
            {
              key: 'element',
              required: true,
              type: InputOptionType.TEXT,
              label: 'ID',
              disabled: true,
            },
          ],
          [
            {
              key: 'url',
              required: true,
              type: InputOptionType.TEXT,
              label: 'Search',
              hint: 'https://www.youtube.com/results?search_query=',
            },
            {
              key: 'direct',
              required: false,
              type: InputOptionType.CHECKBOX,
              label: (
                <Tooltip text="Direct url for the Movie element">
                  Direct
                </Tooltip>
              ),
            },
          ],
          [
            {
              key: 'title',
              type: InputOptionType.TEXT,
              label: 'Search Title (Optional)',
            },
          ],
        ]}
        defaultState={{
          element: mov.e_id,
          url: PersistentStorage.getDefaultQuery(),
        }}
        submit={{
          onSubmit: async ({ form, setError }) => {
            setData(null);
            setPage(-1);
            setF(form);
            try {
              const suggest = await context.findVideoSuggestions({
                url: form.url,
                element: form.element,
                title: form.title,
                direct: form.direct ?? undefined,
              });
              if (suggest.data) {
                setData(suggest.data);
                if (suggest.data.length === 3) {
                  setPage(1);
                }
              } else {
                setError({
                  global: ['No data found'],
                });
              }
            } catch (e: any) {
              setError({
                global: [e?.message],
              });
            }
          },
          loading: true,
          loadingMessage: 'Searching...',
        }}
      />
      <Grid flex flexC gap={4} vCenter>
        {data?.map((d) => (
          <FindMatchElement
            canUpdate={!mov.movie_url}
            key={d.meta.url}
            item={d}
          />
        ))}
        {data?.length === 0 && <div>No Elements</div>}
        {page >= 0 && (
          <Button
            onClick={async () => {
              const p = page;
              setPage(-2);
              try {
                const suggest = await context.findVideoSuggestions({
                  url: f.url,
                  element: f.element,
                  title: f.title,
                  page: p,
                });
                if (suggest.data) {
                  setData([...data!, ...suggest.data]);
                  if (suggest.data.length === 3) {
                    setPage(p + 1);
                  } else {
                    setPage(-1);
                  }
                } else {
                  setPage(-1);
                }
              } catch (e: any) {
                setPage(-1);
                toast.error(e?.message);
              }
            }}
          >
            Find more...
          </Button>
        )}
        {page === -2 && <LoadingComp loading />}
      </Grid>
    </Grid>
  );
}
