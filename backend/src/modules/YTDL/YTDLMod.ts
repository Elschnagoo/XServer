import { CoreKernelModule, ICoreKernel } from '@grandlinex/kernel';
import YTClient from './client/YTClient';

export default class YTDLMod extends CoreKernelModule<
  ICoreKernel<any>,
  null,
  YTClient,
  null,
  null
> {
  constructor(kernel: ICoreKernel<any>) {
    super('yt-dl', kernel);
  }

  async initModule(): Promise<void> {
    this.setClient(new YTClient(this));
  }
}
