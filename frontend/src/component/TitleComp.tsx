import React, { useState } from 'react';
import {
  Form,
  Grid,
  IconButton,
  InputOptionType,
  IOClose,
  IOPencil,
  IOSave,
} from '@grandlinex/react-components';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/GlobalContext';
import { useMovieContext } from '@/context/MovieContext';

export default function TitleComp({ noEdit = false }: { noEdit?: boolean }) {
  const { mov, update } = useMovieContext();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(mov.movie_name);
  const context = useGlobalContext();

  if (!edit) {
    return (
      <Grid flex flexR vCenter className="glx-w-full" flexSpaceB>
        <h4>{mov.movie_name}</h4>
        {!noEdit && (
          <Grid flex flexR>
            <IconButton
              toolTip={{
                text: 'Edit title',
                position: 'left',
              }}
              onClick={() => {
                setName(mov.movie_name);
                setEdit(true);
              }}
            >
              <IOPencil />
            </IconButton>
          </Grid>
        )}
      </Grid>
    );
  }
  return (
    <Grid flex flexR vCenter className="glx-w-full name-edit" flexSpaceB>
      <Form
        className="glx-flex-grow-1"
        compact
        defaultState={{
          name,
        }}
        options={[
          [
            {
              key: 'name',
              type: InputOptionType.TEXT,
            },
          ],
        ]}
        onChange={({ form }) => {
          setName(form.name);
        }}
      />
      <IconButton
        toolTip={{
          text: 'Save',
          position: 'left',
        }}
        onClick={() => {
          context
            .updateMovie(mov.e_id, { movie_name: name })
            .then((x) => {
              if (x.success && x.data) {
                update(x.data);
                toast.success(`Title updated`);
              } else {
                toast.error(`Error updating title`);
              }
              setEdit(false);
            })
            .catch((x) => {
              toast.error(`Error updating title`);
              setEdit(false);
            });
        }}
      >
        <IOSave />
      </IconButton>
      <IconButton
        toolTip={{
          text: 'Cancel',
          position: 'left',
        }}
        onClick={() => setEdit(false)}
      >
        <IOClose />
      </IconButton>
    </Grid>
  );
  return null;
}
