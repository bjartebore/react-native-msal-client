#import "RNMsalPlugin.h"
#import "React/RCTConvert.h"
#import "React/RCTLog.h"
#import <MSAL/MSAL.h>

@implementation RNMsalPlugin

RCT_EXPORT_MODULE();

static NSMutableDictionary* existingApplications = nil;

- (NSDictionary *)constantsToExport
{
    return @{ @"MSALErrorCode" :
                  @{
                      @"InvalidParameter" : @(MSALErrorInvalidParameter),
                      @"RedirectSchemeNotRegistered" : @(MSALErrorRedirectSchemeNotRegistered),
                      @"InvalidRequest" : @(MSALErrorInvalidRequest),
                      @"InvalidClient" : @(MSALErrorInvalidClient),
                      @"FailedAuthorityValidation" : @(MSALErrorFailedAuthorityValidation),
                      @"InteractionRequired" : @(MSALErrorInteractionRequired),
                      @"MismatchedUser" : @(MSALErrorMismatchedUser),
                      @"NoAuthorizationResponse" : @(MSALErrorNoAuthorizationResponse),
                      @"BadAuthorizationResponse" : @(MSALErrorBadAuthorizationResponse),
                      @"AuthorizationFailed" : @(MSALErrorAuthorizationFailed),
                      @"NoAccessTokenInResponse" : @(MSALErrorNoAccessTokenInResponse),
                      @"TokenCacheItemFailure" : @(MSALErrorTokenCacheItemFailure),
                      @"AmbiguousAuthority" : @(MSALErrorAmbiguousAuthority),
                      @"UserNotFound" : @(MSALErrorUserNotFound),
                      @"NoAccessTokensFound" : @(MSALErrorNoAccessTokensFound),
                      @"WrapperCacheFailure" : @(MSALErrorWrapperCacheFailure),
                      @"NetworkFailure" : @(MSALErrorNetworkFailure),
                      @"UserCanceled" : @(MSALErrorUserCanceled),
                      @"SessionCanceled" : @(MSALErrorSessionCanceled),
                      @"InteractiveSessionAlreadyRunning" : @(MSALErrorInteractiveSessionAlreadyRunning),
                      @"NoViewController" : @(MSALErrorNoViewController),
                      @"Internal": @(MSALErrorInternal),
                      @"InvalidState": @(MSALErrorInvalidState),
                      @"InvalidResponse": @(MSALErrorInvalidResponse)

                      }
              };
}

RCT_REMAP_METHOD(acquireTokenAsync,
                 authority:(NSString *)authority
                 clientId:(NSString *)clientId
                 scopes:(NSArray<NSString*>*)scopes
                 extraQueryParms:(NSString*)extraQueryParms
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject )
{
    @try {
        NSError* error = nil;
        MSALPublicClientApplication* clientApplication = [RNMsalPlugin getOrCreateClientApplication:authority withClientId:clientId error:&error];

        if (error) {
            @throw(error);
        }

        [clientApplication acquireTokenForScopes:scopes
                  extraScopesToConsent:nil
                                  user:nil
                            uiBehavior:MSALUIBehaviorDefault
                  extraQueryParameters:extraQueryParms
                             authority:authority
                         correlationId:nil
                       completionBlock:^(MSALResult *result, NSError *error)
         {
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
                 clientId:(NSString *)clientId
                 scopes:(NSArray<NSString*>*)scopes
                 userIdentitfier:(NSString*)userIdentifier
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSError* error = nil;
        MSALPublicClientApplication* clientApplication = [RNMsalPlugin getOrCreateClientApplication:authority
                                                                             withClientId:clientId
                                                                                    error:&error];

        if (error) {
            @throw(error);
        }

        MSALUser* user = [clientApplication userForIdentifier:userIdentifier error:&error];

        if (error) {
            @throw(error);
        }

        [clientApplication acquireTokenSilentForScopes:scopes
                                        user:user
                                   authority:authority
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
                                                                                              error:&error];

        if (error) {
            @throw error;
        }

        MSALUser* user = [clientApplication userForIdentifier:userIdentifier error:&error];

        if (error) {
            @throw error;
        }

        [clientApplication removeUser:user error:&error];

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

    [dict setObject:[self MSALUserToDictionary:result.user forTenant:result.tenantId] forKey:@"userInfo"];
    return [dict mutableCopy];
}

- (NSDictionary*)MSALUserToDictionary:(MSALUser*)user
                            forTenant:(NSString*)tenantid
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithCapacity:1];

    [dict setObject:(user.uid ?: [NSNull null]) forKey:@"userID"];
    [dict setObject:(user.displayableId ?: [NSNull null]) forKey:@"userName"];
    [dict setObject:(user.userIdentifier ?: [NSNull null]) forKey:@"userIdentifier"];
    [dict setObject:(user.name ?: [NSNull null]) forKey:@"name"];
    [dict setObject:(user.identityProvider ?: [NSNull null]) forKey:@"identityProvider"];
    [dict setObject:(tenantid ?: [NSNull null]) forKey:@"tenantId"];

    return [dict mutableCopy];
}

+ (MSALPublicClientApplication* )getOrCreateClientApplication:(NSString*)authority
                                                 withClientId:(NSString*)clientId
                                                        error:(NSError* __autoreleasing*)error
{
    if (!existingApplications)
    {
        existingApplications = [NSMutableDictionary dictionaryWithCapacity:1];
    }

    MSALPublicClientApplication* clientApplication = [existingApplications objectForKey:authority];

    if (!clientApplication)
    {
        NSError* _error;
        clientApplication = [[MSALPublicClientApplication alloc] initWithClientId:clientId authority:authority error:&_error];
        if (_error != nil)
        {
            *error = _error;
        }
        [existingApplications setObject:clientApplication forKey:authority];
    }
    return clientApplication;
}
@end
