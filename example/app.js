import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import MsalClient from 'react-native-msal-client';
const authority = 'https://login.microsoftonline.com/common';
const clientId = 'b0024ae1-263c-406a-8bc6-34aecf73a907';
const redirectUri =  `msal${clientId}://auth`;
const scopes = [
  'User.Read'
];

export default class msalExample extends Component {

  constructor(props) {
    super(props);

    this.authClient = new MsalClient(authority);

    this.state = {
      isLoggingIn:false,
      isLoggedin: false,
      name: '',
      userIdentifier: null,
      expiresOn:'',
      isRefreshingToken:false
    }
  }
  
  _isLoggingIn = (value) =>{
    this.setState({
      isLoggingIn: value
    });
  }

  _refreshingToken = (value) => {
    this.setState({
      isRefreshingToken:value
    });
  }

  _handleTokenRefresh = async () => {

    this._refreshingToken(true);

      try {
        let result = await this.authClient.acquireTokenSilentAsync(clientId, scopes, this.state.userIdentifier);

        this.setState({
          isRefreshingToken:false,
          isLoggedin: true,
          expiresOn:result.expiresOn,
          name: result.userInfo.name,
          userIdentifier: result.userInfo.userIdentifier,
        });

      } catch (error) {
        this._refreshingToken(false);
        console.log(error);
      }
  }

  _handleLoginPress = () => {
       this._isLoggingIn(true);

      this.authClient.acquireTokenAsync(clientId, scopes)
        .then((result)=> {

          this.setState({
            isLoggingIn:false,
            isLoggedin: true,
            expiresOn:result.expiresOn,
            name: result.userInfo.name,
            userIdentifier: result.userInfo.userIdentifier,
          });

          console.log('success', result);
        }).catch((err) => {
          this._isLoggingIn(false);
          console.log('error', err);
        });
  }

  _handleLogoutPress = () => {
    this.setState({
      isLoggedin: false,
      name: '',
      userIdentifier: null,
      expiresOn:''
    });
  }

  renderLogin() {
    return (
      <TouchableOpacity onPress={this._handleLoginPress}>
        <Text style={styles.button}>Login</Text>
      </TouchableOpacity>
    );
  }

  renderRefreshToken(){
      return  this.state.isRefreshingToken ? 
                (<ActivityIndicator></ActivityIndicator>)  : 
                (<TouchableOpacity style={{margin:10}} onPress={this._handleTokenRefresh}>
                    <Text style={styles.button}>Refresh Token</Text>
                </TouchableOpacity>) 
  }

  renderLogout() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Hi {this.state.name}!</Text>
        <Text style={styles.expiresOn}>Token Expires On {this.state.expiresOn}</Text>
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
       {
         this.state.isLoggingIn && (<ActivityIndicator></ActivityIndicator>)
       }
       {
         this.state.isLoggedin && !this.state.isLoggingIn && this.renderLogout()
       }
       {
         !this.state.isLoggedin && !this.state.isLoggingIn && this.renderLogin()
       }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 20,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  expiresOn:{
    fontSize: 15,
    textAlign: 'center'
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10
  }
});
