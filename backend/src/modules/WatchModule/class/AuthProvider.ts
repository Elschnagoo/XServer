import {
  AuthResult,
  BaseAuthProvider,
  IBaseKernelModule,
  JwtToken,
} from '@grandlinex/kernel';

import { Request } from 'express';

export default class AuthProvider extends BaseAuthProvider {
  module: IBaseKernelModule;

  constructor(module: IBaseKernelModule) {
    super();
    this.module = module;
  }

  async authorizeToken(
    username: string,
    token: string,
    requestType: string
  ): Promise<AuthResult> {
    return {
      valid: await this.isAllowed(username, token),
      userId: 'admin',
    };
  }

  async validateAccess(token: JwtToken, requestType: string): Promise<boolean> {
    return this.isAllowed(token.username);
  }

  async bearerTokenValidation(req: Request): Promise<JwtToken | number> {
    const cc = this.module.getKernel().getCryptoClient();
    let token: string | undefined;
    if (req.headers.authorization !== undefined) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(' ')[1];
    } else if (req.query.glxauth !== undefined) {
      token = req.query.glxauth as string;
    } else if (req.headers.cookie !== undefined) {
      const crumbs = req.headers.cookie.trim();
      const coList = crumbs.split(';');
      const oel = coList.find((el) => el.startsWith('glxauth='));
      token = oel?.split('=')[1];
    }
    if (token === undefined || !cc) {
      return 401;
    }
    return cc.jwtVerifyAccessToken(token);
  }

  async isAllowed(email: string, token?: string) {
    if (token) {
      return (
        email === 'admin' &&
        token ===
          this.module.getKernel().getConfigStore().get('SERVER_PASSWORD')
      );
    }
    return email === 'admin';
  }
}
