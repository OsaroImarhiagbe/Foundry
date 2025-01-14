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

#import "RNCPagerViewComponentView.h"
#import "LEGACY_RNCPagerViewComponentView.h"
#import "LEGACY_RNCPagerView.h"
#import "LEGACY_RNCPagerViewManager.h"
#import "RCTConvert+UIPageViewControllerNavigationOrientation.h"
#import "RCTOnPageScrollEvent.h"
#import "RCTOnPageScrollStateChanged.h"
#import "RCTOnPageSelected.h"
#import "RNCPagerScrollView.h"
#import "RNCPagerView.h"
#import "RNCPagerViewManager.h"
#import "UIView+isHorizontalRtlLayout.h"
#import "UIViewController+CreateExtension.h"
#import "RNCViewPager/RNCViewPagerComponentDescriptor.h"
#import "RNCViewPager/RNCViewPagerShadowNode.h"
#import "RNCViewPager/RNCViewPagerState.h"

FOUNDATION_EXPORT double react_native_pager_viewVersionNumber;
FOUNDATION_EXPORT const unsigned char react_native_pager_viewVersionString[];

