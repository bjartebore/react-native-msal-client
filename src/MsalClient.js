// @flow
import {
  NativeModules,
  Platform,
} from 'react-native';

const { RNMsalPlugin } = NativeModules;

export const {
  MSALErrorCodes = {},
  MSALUIBehavior,
} = RNMsalPlugin;

const normalizeError = err => {
  if (Platform.OS === 'ios' && err.code) {
    err.code = parseInt(err.code, 10);
  }
  throw err;
};

type Jwt = string;
type MsalResponse = {
  accessToken: Jwt,
  idToken: Jwt,
  uniqueId: string,
  expiresOn: ?number,
  userInfo: {
    homeAccountId: string,
    username: string,
  },
};

export default class MsalClient {
  _authority: string;
  _validateAuthority: boolean;

  constructor(authority: string, validate: boolean = false) {
    this._authority = authority;
    this._validateAuthority = validate;
  }

  static ErrorCodes = MSALErrorCodes;

  setAuthority = (authority: string) => {
    this._authority = authority;
  }

  acquireTokenAsync = (
    clientId: string,
    scopes: Array<string>,
    redirectUri: string,
    userIdentitfier: ?string = null,
    uiBehavior: number = MSALUIBehavior.Default,
    extraQueryParameters: ?string = null,
  ): Promise<MsalResponse> => RNMsalPlugin.acquireTokenAsync(
    this._authority,
    this._validateAuthority,
    clientId,
    scopes,
    redirectUri,
    userIdentitfier,
    uiBehavior,
    extraQueryParameters,
  ).catch(normalizeError);

  acquireTokenSilentAsync = (
    clientId: string,
    scopes: Array<string>,
    userIdentitfier: ?string = null,
  ): Promise<MsalResponse> => RNMsalPlugin.acquireTokenSilentAsync(
    this._authority,
    this._validateAuthority,
    clientId,
    scopes,
    userIdentitfier,
  ).catch(normalizeError);


  tokenCacheDeleteItem = (
    clientId: string,
    userIdentitfier: string,
  ): Promise<any> => RNMsalPlugin.tokenCacheDeleteItem(
    this._authority,
    clientId,
    userIdentitfier,
  ).catch(normalizeError);
}
