import { TestContext, XUtil,JestLib } from '@grandlinex/kernel';
/* eslint-disable */
import ApiCon, { NodeCon } from '../gen';
/* eslint-enable */
import ServiceKernel from '../src/XKernel';

const [testPath] = XUtil.setupEnvironment(
  [__dirname, '..'],
  ['data', 'config']
);
const sKernel = new ServiceKernel(true);
const [kernel] = TestContext.getEntity({
  kernel: sKernel,
  cleanUpPath: testPath,
  modLenth: 2,
});
const port = sKernel.getAppServerPort();
const store = sKernel.getConfigStore();

if (!store.get("TMDB_TOKEN")){
  store.set("TMDB_TOKEN","DEV_NO_TOKEN");
}

const con = new ApiCon({
  con: NodeCon,
  endpoint: `http://localhost:${port}`,
});

JestLib.jestStart();

describe('token', () => {
  test('get api token', async () => {
    expect(
      await con.connect('admin', store.get('SERVER_PASSWORD') || '')
    ).toBeTruthy();
  });
});

describe('waitForService', () => {
  test('loop', async () => {
    await XUtil.sleep(3000);
  });
});

JestLib.jestEnd();
