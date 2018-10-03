import { NativeModules, Platform } from "react-native";
import {
  IPolicies,
  IAuthenticationResult,
  IError
} from "./MsalClientInterfaces";

const { RNMsalPlugin } = NativeModules;
const RESET_PASSWORD_CODE = "AADB2C90118";
const delay = (t: any) => new Promise(resolve => setTimeout(resolve, t));

export default class MsalClient {
  _authority: string;
  _clientId: string;
  _b2cAuthority: string;

  constructor(authority: string, clientId: string) {
    this._authority = authority;
    this._clientId = clientId;
    this._b2cAuthority = authority;
  }

  acquireTokenAsync = (
    scopes: Array<string>,
    extraQueryParameters?: Record<string, string>
  ): Promise<IAuthenticationResult> => {
    return RNMsalPlugin.acquireTokenAsync(
      this._b2cAuthority,
      this._clientId,
      Platform.OS == "ios" ? scopes : scopes.join(","),
      JSON.stringify(extraQueryParameters)
    );
  };

  aquireTokenB2CAsync = (
    scopes: Array<string>,
    policies: IPolicies,
    extraQueryParameters?: Record<string, string>,
    beforePasswordReset?: () => {}
  ): IAuthenticationResult => {
    this._addPolicyToAuthority(policies.signUpSignInPolicy);

    return RNMsalPlugin.acquireTokenAsync(
      this._b2cAuthority,
      this._clientId,
      Platform.OS == "ios" ? scopes : scopes.join(","),
      JSON.stringify(extraQueryParameters)
    ).catch((error: IError) => {
      if (
        error.message.includes(RESET_PASSWORD_CODE) &&
        policies.passwordResetPolicy
      ) {
        if (beforePasswordReset) {
          beforePasswordReset();
        }
        return this._resetPasswordAsync(
          scopes,
          policies.passwordResetPolicy,
          extraQueryParameters
        );
      } else {
        throw error;
      }
    });
  };

  acquireTokenSilentAsync = (
    scopes: Array<string>,
    userIdentitfier: string,
    authority: string
  ): Promise<IAuthenticationResult> => {
    return RNMsalPlugin.acquireTokenSilentAsync(
      authority,
      this._clientId,
      Platform.OS == "ios" ? scopes : scopes.join(","),
      userIdentitfier
    );
  };

  private _resetPasswordAsync = (
    scopes: Array<string>,
    passwordResetPolicy: string,
    extraQueryParameters?: Record<string, string>
  ): Promise<IAuthenticationResult> => {
    let self = this;

    this._addPolicyToAuthority(passwordResetPolicy);

    //had to use a delay otherwise exception is thrown, only one interactive session allowed
    //if anyone knows a better way feel free to fix
    return delay(1000).then(() => {
      return RNMsalPlugin.acquireTokenAsync(
        self._b2cAuthority,
        self._clientId,
        Platform.OS == "ios" ? scopes : scopes.join(","),
        JSON.stringify(extraQueryParameters)
      );
    });
  };

  tokenCacheDeleteItem = (userIdentitfier: string): Promise<void> => {
    return RNMsalPlugin.tokenCacheDeleteItem(
      this._authority,
      this._clientId,
      userIdentitfier
    );
  };

  tokenCacheB2CDeleteItem = (
    authority: string,
    userIdentitfier: string
  ): Promise<void> => {
    return RNMsalPlugin.tokenCacheDeleteItem(
      authority,
      this._clientId,
      userIdentitfier
    );
  };

  private _addPolicyToAuthority(policy: string): void {
    this._b2cAuthority = this._authority + "/" + policy;
  }
}
