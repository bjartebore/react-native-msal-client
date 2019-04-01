/*******************************************************************************
 * Copyright (c) Microsoft Open Technologies, Inc.
 * All Rights Reserved
 * See License in the project root for license information.
 ******************************************************************************/

// Modifications by Bjarte Bore to work with React Native instead of Cordova

package com.microsoft.aad.msal.rn;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

import java.util.HashMap;
import java.util.Map;


import com.facebook.react.bridge.WritableMap;
import com.microsoft.identity.client.*;
import com.microsoft.identity.client.exception.MsalException;
import com.microsoft.identity.client.exception.MsalUserCancelException;

public class RNMsalPlugin extends ReactContextBaseJavaModule {

  public RNMsalPlugin(ReactApplicationContext reactContext) {
    super(reactContext);

  }

  public static final String USERNAME_MISSING_PLACEHOLDER = "Missing from the token response";

  private PublicClientApplication client;

  @Override
  public String getName() {
    return "RNMsalPlugin";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    final Map<String, Object> errorCodes = new HashMap<>();

    final Map<String, Object> uiBehaviour = new HashMap<>();
    uiBehaviour.put("SelectAccount", UiBehavior.SELECT_ACCOUNT.ordinal());
    uiBehaviour.put("ForceLogin", UiBehavior.FORCE_LOGIN.ordinal());
    uiBehaviour.put("ForceConsent", UiBehavior.CONSENT.ordinal());
    uiBehaviour.put("Default", UiBehavior.SELECT_ACCOUNT.ordinal());

    constants.put("MSALErrorCodes", errorCodes);
    constants.put("MSALUIBehavior", uiBehaviour);
    return constants;
  }

  private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
      super.onActivityResult(activity, requestCode, resultCode, data);

      client.handleInteractiveRequestRedirect(requestCode, resultCode, data);
    }
  };

  @ReactMethod
  public void acquireTokenAsync(
          String authority,
          Boolean validateAuthority,
          String clientId,
          ReadableArray scopes,
          String redirectUri,
          String accountId,
          Integer uiBehaviour,
          String extraQueryParameters,
          Promise promise
  ) {
    final PublicClientApplication client;
    try {
      client = getOrCreateClientApplication(authority,validateAuthority, clientId);
    } catch (Exception e) {
      promise.reject(e);
      return;
    }
    Activity activity = getCurrentActivity();
    this.getReactApplicationContext().addActivityEventListener(mActivityEventListener);

    IAccount account = null;
    if (accountId != null) {
      account = client.getAccount(accountId);
    }

    UiBehavior _uiBehaviour = UiBehavior.values()[uiBehaviour];

    client.acquireToken(
            activity,
            scopes.toArrayList().toArray(new String[scopes.size()]),
            account,
            _uiBehaviour,
            null,
            this.getAuthInteractiveCallback(promise));
  }

  @ReactMethod
  public void acquireTokenSilentAsync(
          String authority,
          Boolean validateAuthority,
          String clientId,
          ReadableArray scopes,
          String userIdentitfier,
          Promise promise
  ) {
    final PublicClientApplication client;
    try {
      client = getOrCreateClientApplication(authority, validateAuthority, clientId);
    } catch (Exception e) {
      promise.reject(e);
      return;
    }

    IAccount account = client.getAccount(userIdentitfier);
    client.acquireTokenSilentAsync(
            scopes.toArrayList().toArray(new String[scopes.size()]),
            account,
            authority,
            false,
            this.getAuthInteractiveCallback(promise));
  }

  @ReactMethod
  public void tokenCacheDeleteItem(
          String authority,
          String clientId,
          String userIdentitfier,
          Promise promise
  ) {
    final PublicClientApplication client;
    try {
      client = getOrCreateClientApplication(authority, false, clientId);
    } catch (Exception e) {
      promise.reject(e);
       return;
    }

    IAccount account = client.getAccount(userIdentitfier);
    if (client.removeAccount(account)) {
      promise.resolve(null);
    } else {
      promise.reject(new Exception("No such user"));
    }
  }

  private void cleanupEventHandler() {
    this.getReactApplicationContext().removeActivityEventListener(mActivityEventListener);
  }

  private AuthenticationCallback getAuthInteractiveCallback(final Promise callbackPromise) {
    return new AuthenticationCallback() {
      @Override
      public void onSuccess(AuthenticationResult authenticationResult)
      {
        final WritableMap result = Arguments.createMap();
        result.putString("accessToken", authenticationResult.getAccessToken());
        result.putString("idToken", authenticationResult.getIdToken());
        result.putString("uniqueId", authenticationResult.getUniqueId());
        result.putDouble("expiresOn", authenticationResult.getExpiresOn().getTime());
        result.putMap("userInfo", Arguments.createMap());
        final WritableMap userInfo =  Arguments.createMap();
        userInfo.putString("homeAccountId", authenticationResult.getAccount().getHomeAccountIdentifier().getIdentifier());
        String userName = authenticationResult.getAccount().getUsername();
        if (userName == USERNAME_MISSING_PLACEHOLDER) {
          userInfo.putString("username", "");
        } else {
          userInfo.putString("username", userName);
        }

        result.putMap("userInfo", userInfo);

        callbackPromise.resolve(result);

        cleanupEventHandler();
      }

      @Override
      public void onError(MsalException ex)
      {
        callbackPromise.reject(ex.getErrorCode(), ex.getMessage(), ex);
        cleanupEventHandler();
      }

      @Override
      public void onCancel() {
        MsalUserCancelException ex = new MsalUserCancelException();
        callbackPromise.reject("user_cancel", ex.getMessage(), ex);
        cleanupEventHandler();
      }
    };
  }

  private PublicClientApplication getOrCreateClientApplication (
      String authority,
      Boolean validateAuthority,
      String clientId
  ) {

    if (this.client == null) {
      this.client = new PublicClientApplication(
              this.getReactApplicationContext().getApplicationContext(),
              clientId,
              authority
      );
    }
    return this.client;
  }

}
