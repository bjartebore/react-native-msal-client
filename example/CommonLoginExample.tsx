import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";

import MsalClient from "react-native-msal-client";
import { IAuthenticationResult, IError } from "react-native-msal-client";

const authority = "https://login.microsoftonline.com/common";
const clientId = "f7006c91-4d2f-4330-a34f-ae308da20632";

const scopes = ["User.Read"] as Array<string>;

interface IState {
  isLoggingIn: Boolean;
  isLoggedin: Boolean;
  authenticationResult: IAuthenticationResult;
  isRefreshingToken: Boolean;
}

export default class CommonLoginExample extends React.Component<any, IState> {
  authClient: MsalClient;

  constructor(props: any) {
    super(props);

    this.authClient = new MsalClient(authority, clientId);

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
      let result = await this.authClient.acquireTokenAsync(scopes);
      this._authComplete(result);
    } catch (error) {
      this._isLoggingIn(false);
      console.log(error);
    }
  };

  _authComplete = (result: IAuthenticationResult): void => {
    this.setState({
      isLoggingIn: false,
      isLoggedin: true,
      authenticationResult: result
    });
  };

  _handleLogoutPress = () => {
    this.authClient
      .tokenCacheDeleteItem(
        this.state.authenticationResult.userInfo.userIdentifier
      )
      .then(() => {
        this.setState({
          isLoggedin: false,
          authenticationResult: {} as IAuthenticationResult
        });
      })
      .catch((error: IError) => {
        console.log(error.message);
      });
  };

  renderLogin() {
    return (
      <TouchableOpacity onPress={this._handleLoginPress}>
        <Text style={styles.button}>Login with common</Text>
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
