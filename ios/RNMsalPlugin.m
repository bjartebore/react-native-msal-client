#import "RNMsalPlugin.h"
#import "React/RCTConvert.h"
#import "React/RCTLog.h"
#import <MSAL/MSAL.h>



@implementation RCTConvert (RNTDjiCameraManager)

RCT_ENUM_CONVERTER(MSALPromptType   , (@{
                                      @"MSALPromptTypeSelectAccount" : @(MSALPromptTypeSelectAccount),
                                      @"MSALPromptTypeLogin" : @(MSALPromptTypeLogin),
                                      @"MSALPromptTypeConsent" : @(MSALPromptTypeConsent),
                                      @"MSALPromptTypeDefault" : @(MSALPromptTypeDefault),
                                      }), MSALPromptTypeDefault, integerValue)
@end

@implementation RNMsalPlugin

RCT_EXPORT_MODULE();

static NSMutableDictionary* existingApplications = nil;

+ (BOOL)requiresMainQueueSetup
{
   return YES;
}

- (NSDictionary *)constantsToExport
{
    return @{ @"MSALErrorCodes" :
                  @{
                      @"ErrorInternal" : @(MSALErrorInternal),
                      @"InternalErrorInvalidParameter" : @(MSALInternalErrorInvalidParameter),
                      @"InternalErrorAccountRequired" : @(MSALInternalErrorAccountRequired),
                      @"ErrorInteractionRequired" : @(MSALErrorInteractionRequired),
                      @"InternalErrorNonHttpsRedirect" : @(MSALInternalErrorNonHttpsRedirect),
                      @"InternalErrorMismatchedUser" : @(MSALInternalErrorMismatchedUser),
                      @"InternalErrorRedirectSchemeNotRegistered" : @(MSALInternalErrorRedirectSchemeNotRegistered),
                      @"InternalErrorFailedAuthorityValidation" : @(MSALInternalErrorFailedAuthorityValidation),
                      @"InternalErrorAuthorizationFailed" : @(MSALInternalErrorAuthorizationFailed),
                      @"ErrorUserCanceled" : @(MSALErrorUserCanceled),
                      @"InternalErrorInteractiveSessionAlreadyRunning" : @(MSALInternalErrorInteractiveSessionAlreadyRunning),
                      @"InternalErrorNoViewController" : @(MSALInternalErrorNoViewController),
                      @"InternalErrorAttemptToOpenURLFromExtension" : @(MSALInternalErrorAttemptToOpenURLFromExtension),
                      @"InternalErrorUINotSupportedInExtension" : @(MSALInternalErrorUINotSupportedInExtension),
                      @"InternalErrorBrokerResponseNotReceived" : @(MSALInternalErrorBrokerResponseNotReceived),
                      @"InternalErrorBrokerNoResumeStateFound" : @(MSALInternalErrorBrokerNoResumeStateFound),
                      @"InternalErrorBrokerBadResumeStateFound" : @(MSALInternalErrorBrokerBadResumeStateFound),
                      @"InternalErrorBrokerMismatchedResumeState" : @(MSALInternalErrorBrokerMismatchedResumeState),
                      @"InternalErrorBrokerResponseHashMissing" : @(MSALInternalErrorBrokerResponseHashMissing),
                      @"InternalErrorBrokerCorruptedResponse" : @(MSALInternalErrorBrokerCorruptedResponse),
                      @"InternalErrorBrokerResponseDecryptionFailed" : @(MSALInternalErrorBrokerResponseDecryptionFailed),
                      @"InternalErrorBrokerResponseHashMismatch": @(MSALInternalErrorBrokerResponseHashMismatch),
                      @"InternalErrorBrokerKeyFailedToCreate": @(MSALInternalErrorBrokerKeyFailedToCreate),
                      @"InternalErrorBrokerKeyNotFound": @(MSALInternalErrorBrokerKeyNotFound),
                      @"ErrorWorkplaceJoinRequired": @(MSALErrorWorkplaceJoinRequired),
                      @"InternalErrorBrokerUnknown": @(MSALInternalErrorBrokerUnknown),
                      @"InternalErrorAuthorizationFailed": @(MSALInternalErrorAuthorizationFailed),
                      @"InternalErrorInvalidResponse": @(MSALInternalErrorInvalidResponse),
                      @"InternalErrorInvalidRequest": @(MSALInternalErrorInvalidRequest),
                      @"InternalErrorInvalidClient": @(MSALInternalErrorInvalidClient),
                      @"InternalErrorInvalidGrant": @(MSALInternalErrorInvalidGrant),
                      @"InternalErrorInvalidScope": @(MSALInternalErrorInvalidScope),
                      @"InternalErrorUnauthorizedClient": @(MSALInternalErrorUnauthorizedClient),
                      @"ErrorServerDeclinedScopes": @(MSALErrorServerDeclinedScopes),
                      @"InternalErrorInvalidState": @(MSALInternalErrorInvalidState),
                      @"ErrorServerProtectionPoliciesRequired": @(MSALErrorServerProtectionPoliciesRequired),
                      @"InternalErrorUnhandledResponse": @(MSALInternalErrorUnhandledResponse)
                      },
              @"MSALUIBehavior":
                  @{
                      @"SelectAccount" : @(MSALPromptTypeSelectAccount),
                      @"Login" : @(MSALPromptTypeLogin),
                      @"ForceConsent" : @(MSALPromptTypeConsent),
                      @"Default" : @(MSALPromptTypeDefault)
                      }
              };
}

RCT_REMAP_METHOD(acquireTokenAsync,
                  authority:(NSString *)authority
                  validateAuthority:(BOOL)validateAuthority
                  clientId:(NSString *)clientId
                  scopes:(NSArray<NSString*>*)scopes
                  redirectUri:(NSString *)redirectUri
                  accountId:(NSString* _Nullable)accountId
                  promptType:(MSALPromptType)promptType
                  extraQueryParms:(NSString* _Nullable)extraQueryParms
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject )
{
    @try {
        NSError* error = nil;
        MSALPublicClientApplication* clientApplication = [RNMsalPlugin getOrCreateClientApplication:authority
                                                                                       withClientId:clientId
                                                                                    withRedirectUrl:redirectUri
                                                                                  validateAuthority:validateAuthority
                                                                                              error:&error];

        if (error) {
            @throw(error);
        }

        MSALAccount* account = nil;
        
        if (accountId != nil) {
            account = [clientApplication accountForHomeAccountId:accountId error:&error];
        }
        
        
        [clientApplication acquireTokenForScopes:scopes
                                         account:account
                                     promptType:promptType
                            extraQueryParameters:nil
                                 completionBlock:^(MSALResult *result, NSError *error) {
                                     if(error) {
                                         reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
                                     } else {
                                         resolve([self MSALResultToDictionary:result]);
                                     }
                                 }];
        

    }
    @catch (NSError* error)
    {
        reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
    }

}

RCT_REMAP_METHOD(acquireTokenSilentAsync,
                 authority:(NSString *)authority
                 validateAuthority:(BOOL)validateAuthority
                 clientId:(NSString *)clientId
                 scopes:(NSArray<NSString*>*)scopes
                 accountId:(NSString*)accountId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSError* error = nil;
        MSALPublicClientApplication* clientApplication = [RNMsalPlugin getOrCreateClientApplication:authority
                                                                                       withClientId:clientId
                                                                                    withRedirectUrl:nil
                                                                                  validateAuthority:validateAuthority
                                                                                    error:&error];

        if (error) {
            @throw(error);
        }

        MSALAccount* account = [clientApplication accountForHomeAccountId:accountId error:&error];

        if (error) {
            @throw(error);
        }
        
        
        [clientApplication acquireTokenSilentForScopes:scopes
                                               account:account
                                       completionBlock:^(MSALResult *result, NSError *error) {
                                           if(error) {
                                               reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
                                           } else {
                                               resolve([self MSALResultToDictionary:result]);
                                           }
                                       }];


    }
    @catch(NSError* error)
    {
        reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
    }
}

RCT_REMAP_METHOD(tokenCacheDeleteItem,
                 authority:(NSString *)authority
                 clientId:(NSString *)clientId
                 userIdentitfier:(NSString*)userIdentifier
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try
    {
        NSError* error = nil;
        MSALPublicClientApplication* clientApplication = [RNMsalPlugin getOrCreateClientApplication:authority
                                                                                       withClientId:clientId
                                                                                    withRedirectUrl:nil
                                                                                  validateAuthority:NO
                                                                                              error:&error];

        if (error) {
            @throw error;
        }

        MSALAccount* account = [clientApplication accountForUsername:userIdentifier error:&error];

        if (error) {
            @throw error;
        }

        [clientApplication removeAccount:account error:&error];

        if (error) {
            @throw error;
        }

        resolve([NSNull null]);

    }
    @catch(NSError* error)
    {
        reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
    }
}

- (NSDictionary*)MSALResultToDictionary:(MSALResult*)result
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithCapacity:1];
    [dict setObject:(result.accessToken ?: [NSNull null]) forKey:@"accessToken"];
    [dict setObject:(result.idToken ?: [NSNull null]) forKey:@"idToken"];
    [dict setObject:(result.uniqueId) ?: [NSNull null] forKey:@"uniqueId"];

    if (result.expiresOn)
    {
        [dict setObject:[NSNumber numberWithDouble:[result.expiresOn timeIntervalSince1970] * 1000] forKey:@"expiresOn"];
    }

    [dict setObject:[self MSALUserToDictionary:result.account forTenant:result.tenantId] forKey:@"userInfo"];
    return [dict mutableCopy];
}

- (NSDictionary*)MSALUserToDictionary:(MSALAccount*)account
                            forTenant:(NSString*)tenantid
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithCapacity:1];

    [dict setObject:(account.homeAccountId.identifier ?: [NSNull null]) forKey:@"homeAccountId"];
    [dict setObject:(account.username ?: [NSNull null]) forKey:@"username"];
    return [dict mutableCopy];
}

+ (MSALPublicClientApplication* )getOrCreateClientApplication:(NSString*)authorityUrl
                                                 withClientId:(NSString*)clientId
                                              withRedirectUrl:(NSString*)redirectUrl
                                            validateAuthority:(BOOL)validateAuthority
                                                        error:(NSError* __autoreleasing*)error
{
    if (!existingApplications)
    {
        existingApplications = [NSMutableDictionary dictionaryWithCapacity:1];
    }

    MSALPublicClientApplication* clientApplication = [existingApplications objectForKey:authorityUrl];

    if (!clientApplication)
    {
        NSError* _error;
        NSURL* _authorityUrl = [NSURL URLWithString:authorityUrl];
        MSALAuthority* authority = [MSALAuthority authorityWithURL:_authorityUrl error:&_error];
        
        MSALPublicClientApplicationConfig *b2cApplicationConfig = [[MSALPublicClientApplicationConfig alloc]
                                                                   initWithClientId:clientId
                                                                   redirectUri:redirectUrl
                                                                   authority:authority];
        
        b2cApplicationConfig.knownAuthorities = @[authority];
        
        clientApplication = [[MSALPublicClientApplication alloc]
                             initWithConfiguration:b2cApplicationConfig
                             error:&_error];
        

        
        if (_error != nil)
        {
            *error = _error;
        }
        [existingApplications setObject:clientApplication forKey:authorityUrl];
    }
    return clientApplication;
}
@end
