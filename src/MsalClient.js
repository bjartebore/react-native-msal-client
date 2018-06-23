import {
  NativeModules
} from 'react-native';

const { RNMsalPlugin } = NativeModules;

export default class MsalClient {
  constructor(authority) {
    this._authority = authority;
  }

  acquireTokenAsync = (clientId, scopes, redirectUri, extraQueryParameters) => {
    var a = RNMsalPlugin ;
    debugger;
    return RNMsalPlugin.acquireTokenAsync(
      this._authority,
      clientId,
      scopes,
      redirectUri,
      extraQueryParameters,
    );
  };

  acquireTokenSilentAsync = (clientId, scopes) => {
    return RNMsalPlugin.acquireTokenAsync(
      this._authority,
      clientId,
      scopes,
    );
  };
}
