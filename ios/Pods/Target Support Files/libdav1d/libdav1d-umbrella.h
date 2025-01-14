#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "common.h"
#import "data.h"
#import "dav1d.h"
#import "headers.h"
#import "picture.h"
#import "version.h"

FOUNDATION_EXPORT double libdav1dVersionNumber;
FOUNDATION_EXPORT const unsigned char libdav1dVersionString[];

