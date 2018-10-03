import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";

import MsalClient from "react-native-msal-client";
import { IPolicies, IAuthenticationResult, IError } from "react-native-msal-client";

const authority = "https://{domain}.b2clogin.com/tfp/{domain}.onmicrosoft.com";
const applicationId = "{applicationId}";
const policies = {
  signUpSignInPolicy: "B2C_1_signup-signin-policy",
  passwordResetPolicy: "B2C_1_Password-reset-policy"
} as IPolicies;

const scopes = [
  "https://{domain}.onmicrosoft.com/{app id}/user_impersonation"
] as Array<string>;


interface IState {
  isLoggingIn: Boolean;
  isLoggedin: Boolean;
  authenticationResult: IAuthenticationResult;
  isRefreshingToken: Boolean;
}

export default class B2CLoginExample extends React.Component<any, IState> {
  authClient: MsalClient;

  constructor(props: any) {
    super(props);

    this.authClient = new MsalClient(authority, applicationId);

    this.state = {
      isLoggingIn: false,
      isLoggedin: false,
      isRefreshingToken: false,
      authenticationResult: {} as IAuthenticationResult
    };
  }

  _isLoggingIn = (value: Boolean): void => {
    this.setState({
      isLoggingIn: value
    });
  };

  _refreshingToken = (value: Boolean): void => {
    this.setState({
      isRefreshingToken: value
    });
  };

  _handleTokenRefresh = async (): Promise<void> => {
    this._refreshingToken(true);

    try {
      let result = await this.authClient.acquireTokenSilentAsync(
        scopes,
        this.state.authenticationResult.userInfo.userIdentifier,
        this.state.authenticationResult.authority
      );

      this.setState({
        isRefreshingToken: false,
        isLoggedin: true,
        authenticationResult: result
      });
    } catch (error) {
      this._refreshingToken(false);
      console.log(error);
    }
  };

  _handleLoginPress = async (): Promise<void> => {
    this._isLoggingIn(true);

    try {
      let result = await this.authClient.aquireTokenB2CAsync(scopes, policies);
      this.setState({
        isLoggingIn: false,
        isLoggedin: true,
        authenticationResult: result
      });
    } catch (error) {
      this._isLoggingIn(false);
      console.log(error);
    }
  };

  _handleLogoutPress = () => {
    this.authClient.tokenCacheB2CDeleteItem(
      this.state.authenticationResult.authority,
      this.state.authenticationResult.userInfo.userIdentifier
    ).then(()=>{
        this.setState({
        isLoggedin: false,
        authenticationResult: {} as IAuthenticationResult
      });
    }).catch((error:IError)=>{
      console.log(error.message);
    });
  };

  renderLogin() {
    return (
      <TouchableOpacity onPress={this._handleLoginPress}>
        <Text style={styles.button}>Login with b2c</Text>
      </TouchableOpacity>
    );
  }

  renderRefreshToken() {
    return this.state.isRefreshingToken ? (
      <ActivityIndicator />
    ) : (
      <TouchableOpacity
        style={{ margin: 10 }}
        onPress={this._handleTokenRefresh}
      >
        <Text style={styles.button}>Refresh Token</Text>
      </TouchableOpacity>
    );
  }

  renderLogout() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Hi {this.state.authenticationResult.userInfo.name}!
        </Text>
        <Text style={styles.expiresOn}>
          Token Expires On {this.state.authenticationResult.expiresOn}
        </Text>
        {this.renderRefreshToken()}
        <TouchableOpacity onPress={this._handleLogoutPress}>
          <Text style={styles.button}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.isLoggingIn && <ActivityIndicator />}
        {this.state.isLoggedin &&
          !this.state.isLoggingIn &&
          this.renderLogout()}
        {!this.state.isLoggedin &&
          !this.state.isLoggingIn &&
          this.renderLogin()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 20
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  expiresOn: {
    fontSize: 15,
    textAlign: "center"
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10
  }
});
