#import "RNMsalPlugin.h"

#import "React/RCTLog.h"

#import <MSAL.h>

@implementation RNMsalPlugin

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(createAsync,
                 authority:(NSString *)authority
                 validateAuthority:(BOOL)validateAuthority
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject )
{

}

RCT_REMAP_METHOD(acquireTokenAsync,
                  authority:(NSString *)authority
                   clientId:(NSString *)clientId
                     scopes:(NSArray<NSString*>*)scopes
                redirectUri:(NSString *)redirectUri
            extraQueryParms:(NSString*)extraQueryParms
                   resolver:(RCTPromiseResolveBlock)resolve
                   rejecter:(RCTPromiseRejectBlock)reject )
{

    MSALPublicClientApplication* context = [RNMsalPlugin getOrCreateAuthContext:authority withClientId:clientId];

    [context acquireTokenForScopes:scopes
              extraScopesToConsent:nil
                              user:nil
                        uiBehavior:MSALUIBehaviorDefault
              extraQueryParameters:nil
                         authority:authority
                     correlationId:nil
                   completionBlock:^(MSALResult *result, NSError *error)
     {
         if(error) {
             reject(@"TOKEN_ERROR", error.description, error);
         } else {
             resolve(@{
                     @"accessToken": result.accessToken,
                     @"idToken": result.idToken,
                     @"userInfo": @{
                             @"userId": result.user.uid,
                             @"userIdentifier": result.user.userIdentifier,
                             @"name": result.user.name,
                             @"identityProvider": result.user.identityProvider,
                             @"tenantId": result.tenantId
                             }
                     });
         }

     }];
}

RCT_REMAP_METHOD(acquireTokenSilentAsync,
                 authority:(NSString *)authority
                 clientId:(NSString *)clientId
                 scopes:(NSArray<NSString*>*)scopes
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject )
{
    MSALPublicClientApplication* context = [RNMsalPlugin getOrCreateAuthContext:authority withClientId:clientId];

    [context acquireTokenSilentForScopes:scopes
                                    user:nil
                               authority:authority
                         completionBlock:^(MSALResult *result, NSError *error) {
                             if(error) {
                                reject(@"TOKEN_ERROR", error.description, error);
                             } else {
                                resolve(@{
                                         @"accessToken": result.accessToken,
                                         @"idToken": result.idToken,
                                         @"userInfo": @{
                                                 @"userId": result.user.uid,
                                                 @"userIdentifier": result.user.userIdentifier,
                                                 @"name": result.user.name,
                                                 @"identityProvider": result.user.identityProvider,
                                                 @"tenantId": result.tenantId
                                                 }
                                         });
                         }];

}

static NSMutableDictionary *existingContexts = nil;

+ (MSALPublicClientApplication *)getOrCreateAuthContext:(NSString *)authority
                                           withClientId:(NSString*)clientId
{
    if (!existingContexts)
    {
        existingContexts = [NSMutableDictionary dictionaryWithCapacity:1];
    }

    MSALPublicClientApplication *authContext = [existingContexts objectForKey:authority];

    if (!authContext)
    {
        NSError *error = nil;

        authContext = [[MSALPublicClientApplication alloc] initWithClientId:clientId authority:authority error:&error];

        if (error != nil)
        {
            @throw(error);
        }

        [existingContexts setObject:authContext forKey:authority];
    }

    return authContext;
}

static id ObjectOrNil(id object)
{
    return [object isKindOfClass:[NSNull class]] ? nil : object;
}
@end
