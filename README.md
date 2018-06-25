# react-native-msal-client

This is a simple wrapper around Microsofts [MSAL](https://github.com/samcolby/react-native-ms-adal/) library. it currently only supports iOS

## Requirements

* [React Native](https://facebook.github.io/react-native/) (tested on 0.55)
* [Cocoapods](https://cocoapods.org/)

## Installation

```sh
yarn add react-native-msal-client
```

Install [MSAL](https://github.com/AzureAD/microsoft-authentication-library-for-objc) with cocoapods

Add the following to the Podfile and run ```pod install``

```ruby
pod 'MSAL', :git => 'https://github.com/AzureAD/microsoft-authentication-library-for-objc.git', :tag => '0.1.3'
```


## Usage

```js
import MsalClient from 'react-native-msal-client';

const authClient = MsalClient('https://login.microsoftonline.com/common')

const clientId = '1ee9299a-9936-4aa9-92c5-b5602ee938d9';
const redirectUri = `msal${clientId}://auth`;
const scopes = ['email'];
const extraQueryParms = '';

authClient.acquireTokenAsync(clientId, scopes, redirectUri, '')
  .then((data)=> {

  }).catch((err) => {

  });
```
