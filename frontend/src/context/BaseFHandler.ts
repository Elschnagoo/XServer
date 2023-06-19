import { IApiCon } from '@elschnagoo/xserver-con';
import { AppEnv } from '@/lib';

export default interface BaseFHandler extends IApiCon {
  getName(): string;

  preloadEnv(): Promise<AppEnv>;

  logOut(): Promise<any>;

  openExternalConfig(conf: { url: string; external?: boolean }): Promise<void>;
}
