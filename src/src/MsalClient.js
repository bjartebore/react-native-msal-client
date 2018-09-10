import {
  NativeModules,
  Platform
} from 'react-native';

const { RNMsalPlugin } = NativeModules;

export const { MSALErrorCode } = Platform.OS == "ios" ? RNMsalPlugin : {};

const normalizeError = (err) => {
  if (err.code) {
    err.code = parseInt(err.code, 10);
  }
  throw err;
}

export default class MsalClient {
  constructor(authority) {
    this._authority = authority;
  }

  static ErrorCodes = MSALErrorCode;

  acquireTokenAsync = (clientId, scopes, extraQueryParameters) => {
      return RNMsalPlugin.acquireTokenAsync(
        this._authority,
        clientId,
        Platform.OS == "ios" ? scopes : scopes.join(","),
        extraQueryParameters,
      ).catch(normalizeError);
  };

  acquireTokenSilentAsync = (clientId, scopes, userIdentitfier) => {
    return RNMsalPlugin.acquireTokenSilentAsync(
      this._authority,
      clientId,
      Platform.OS == "ios" ? scopes : scopes.join(","),
      userIdentitfier,
    ).catch(normalizeError);
  };


  tokenCacheDeleteItem = (clientId, userIdentitfier) => {
    return RNMsalPlugin.tokenCacheDeleteItem(
      this._authority,
      clientId,
      userIdentitfier,
    ).catch(normalizeError);
  }
}
