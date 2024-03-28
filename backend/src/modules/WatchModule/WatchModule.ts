import { BaseKernelModule, IKernel } from '@grandlinex/kernel';
import { WatchDB } from './database';
import QService from './service/QService';
import WatchClient from './client/WatchClient';
import MovieAction from './action/movie/MovieAction';
import MovieImgAction from './action/movie/MovieImgAction';
import MovieStreamAction from './action/movie/MovieStreamAction';
import FileMetaService from './service/FileMetaService';
import MovieVersionAction from './action/movie/MovieVersionAction';
import ScanLibAction from './action/admin/ScanLibAction';
import ThumbService from './service/ThumbService';
import AuthProvider from './class/AuthProvider';
import UpdateMovieAction from './action/admin/UpdateMovieAction';
import MovieLabelAction from './action/movie/MovieLabelAction';
import LabelAction from './action/label/LabelAction';
import BindLabelAction from './action/label/BindLabelAction';
import UnbindLabelAction from './action/label/UnbindLabelAction';
import NewLabelAction from './action/label/NewLabelAction';
import DeleteMovieAction from './action/movie/DeleteMovieAction';
import GetMovieAction from './action/movie/GetMovieAction';
import DownloadAction from './action/admin/DownloadAction';
import DService from './service/DService';
import DownloadStatusAction from './action/admin/DownloadStatusAction';
import DeleteDownloadAction from './action/admin/DeleteDownloadAction';
import AddLibPathAction from './action/admin/AddLibPathAction';
import GetLibPathAction from './action/admin/GetLibPathAction';
import RatingAction from './action/rating/RatingAction';
import UpdateLabelAction from './action/label/UpdateLabelAction';
import SetMovieRatingAction from './action/movie/SetMovieRatingAction';
import GetMovieRatingAction from './action/movie/GetMovieRatingAction';
import NewRatingAction from './action/rating/NewRatingAction';
import UpdateRatingAction from './action/rating/UpdateRatingAction';
import NewLabelAliasAction from './action/alias/NewLabelAliasAction';
import DeleteLabelAliasAction from './action/alias/DeleteLabelAliasAction';
import LabelAliasAction from './action/alias/LabelAliasAction';
import LabelLookupAction from './action/label/LabelLookupAction';
import DownloadLabelSuggestionsAction from './action/admin/DownloadLabelSuggestionsAction';
import FindVideoSuggestionsAction from './action/admin/FindVideoSuggestionsAction';

export default class WatchModule extends BaseKernelModule<
  IKernel,
  WatchDB,
  WatchClient,
  null,
  null
> {
  constructor(kernel: IKernel) {
    super('watch', kernel, 'yt-dl');
    this.addAction(
      // movie
      new MovieAction(this),
      new GetMovieAction(this),
      new MovieVersionAction(this),
      new MovieImgAction(this),
      new MovieStreamAction(this),
      new MovieLabelAction(this),
      new DeleteMovieAction(this),
      new SetMovieRatingAction(this),
      new GetMovieRatingAction(this),
      // label
      new LabelAction(this),
      new NewLabelAction(this),
      new UpdateLabelAction(this),
      new BindLabelAction(this),
      new UnbindLabelAction(this),
      new LabelLookupAction(this),
      // label alias
      new LabelAliasAction(this),
      new NewLabelAliasAction(this),
      new DeleteLabelAliasAction(this),
      // admin
      new ScanLibAction(this),
      new UpdateMovieAction(this),
      new DownloadAction(this),
      new DownloadLabelSuggestionsAction(this),
      new DownloadStatusAction(this),
      new DeleteDownloadAction(this),
      new AddLibPathAction(this),
      new GetLibPathAction(this),
      new FindVideoSuggestionsAction(this),
      // rating
      new RatingAction(this),
      new NewRatingAction(this),
      new UpdateRatingAction(this),
    );
    this.addService(
      new QService(this),
      new FileMetaService(this),
      new ThumbService(this),
      new DService(this),
    );
  }

  async initModule(): Promise<void> {
    const db = new WatchDB(this);
    this.getKernel().getCryptoClient()?.setAuthProvider(new AuthProvider(this));
    this.setDb(db);
    this.setClient(new WatchClient(this));
  }
}
