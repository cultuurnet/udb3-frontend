import { NextApiRequest } from 'next';
import getConfig from 'next/config';

import { getAuthServer } from '@/auth/node';

const authServer = getAuthServer();

export default authServer.handleAuth({
  async login(req, res) {
    const language = req.cookies['udb-language'] ?? 'nl';
    try {
      await authServer.handleLogin(req, res, {
        authorizationParams: {
          audience: 'https://api.publiq.be',
          scope: 'openid profile email',
          locale: language,
          referrer: 'udb',
          skip_verify_legacy: 'true',
          product_display_name: 'UiTdatabank',
        },
      });
    } catch (error) {
      res.status(error.status || 400).end(error.message);
    }
  },
  async logout(req: NextApiRequest, res) {
    const { publicRuntimeConfig } = getConfig();
    try {
      await authServer.handleLogout(req, res, {
        returnTo: publicRuntimeConfig.baseUrl,
      });
    } catch (err) {
      res.status(err.status || 400).end();
    }
  },
});
