// import UIKit
// import React // This already includes RCTLinkingManager
// import React_RCTAppDelegate
// import ReactAppDependencyProvider
// import Firebase
// import FirebaseCrashlytics // ✅ Added for Crashlytics
// import UserNotifications

// // This is your original, working delegate. No changes needed here.
// class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
//   override func sourceURL(for bridge: RCTBridge) -> URL? {
//     self.bundleURL()
//   }

//   override func bundleURL() -> URL? {
// #if DEBUG
//     return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
// #else
//     return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
// #endif
//   }
// }

// @main
// class AppDelegate: UIResponder, UIApplicationDelegate {

//   var window: UIWindow?
//   var reactNativeDelegate: ReactNativeDelegate?
//   var reactNativeFactory: RCTReactNativeFactory?

//   func application(
//     _ application: UIApplication,
//     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
//   ) -> Bool {

//     // 1. Configure Firebase (from your working code)
//     FirebaseApp.configure()
//     print("🔥 Firebase manually configured")

//     // ✅ Set a test log and force crash handler
//     Crashlytics.crashlytics().log("🚀 Crashlytics initialized")

//     // 2. Set up React Native (from your working code)
//     let delegate = ReactNativeDelegate()
//     let factory = RCTReactNativeFactory(delegate: delegate)
//     delegate.dependencyProvider = RCTAppDependencyProvider()

//     self.reactNativeDelegate = delegate
//     self.reactNativeFactory = factory

//     self.window = UIWindow(frame: UIScreen.main.bounds)

//     factory.startReactNative(
//       withModuleName: "csk",
//       in: window,
//       launchOptions: launchOptions
//     )

//     // 3. Add the push notification request here
//     UNUserNotificationCenter.current().delegate = self
//     UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
//       if let error = error {
//         print("[DEBUG] Push notification permission error: \(error.localizedDescription)")
//       } else {
//         print("[DEBUG] Push notification permission granted: \(granted)")
//         if granted {
//           DispatchQueue.main.async {
//             UIApplication.shared.registerForRemoteNotifications()
//             print("[DEBUG] Registered for remote notifications")
//           }
//         }
//       }
//     }

//     return true
//   }
  
//   // MARK: - CORRECTED URL Handling for reCAPTCHA
//   func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
//     // This is the corrected line:
//     return RCTLinkingManager.application(app, open: url, options: options)
//   }

//   // MARK: - Remote Notification Handlers
//   func application(
//     _ application: UIApplication,
//     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
//   ) {
//     print("[DEBUG] Did register for remote notifications, token: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
//     Auth.auth().setAPNSToken(deviceToken, type: .unknown)
//     print("[DEBUG] APNs token set for Firebase Auth")
//   }

//   func application(
//     _ application: UIApplication,
//     didFailToRegisterForRemoteNotificationsWithError error: Error
//   ) {
//     print("[DEBUG] Failed to register for remote notifications: \(error.localizedDescription)")
//   }

//   // MARK: - ✅ THIS IS THE NEW DEBUGGING FUNCTION
//   // It will print a message if the silent push from Plan A is successful.
//   func application(_ application: UIApplication,
//                    didReceiveRemoteNotification userInfo: [AnyHashable : Any],
//                    fetchCompletionHandler completionHandljjer: @escaping (UIBackgroundFetchResult) -> Void) {

//     print("✅✅✅ --- PLAN A SUCCESS! --- The Silent Push Was Received By The App --- ✅✅✅")

//     // Pass the notification to Firebase to be processed
//     if Auth.auth().canHandleNotification(userInfo) {
//       completionHandler(.newData)
//       return
//     }
    
//     // This is for other types of notifications
//     completionHandler(.noData)
//   }
// }

// // MARK: - Notification Delegate Extension
// extension AppDelegate: UNUserNotificationCenterDelegate {
//   func userNotificationCenter(
//     _ center: UNUserNotificationCenter,
//     willPresent notification: UNNotification,
//     withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
//   ) {
//     completionHandler([.banner, .badge, .sound])
//   }
// }













import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseCrashlytics
import UserNotifications
import FirebaseMessaging // ✅ 1. Yeh import add karein

// This is your original, working delegate. No changes needed here.
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    // 1. Configure Firebase (from your working code)
    FirebaseApp.configure()
    print("🔥 Firebase manually configured")

    // ✅ Set a test log and force crash handler
    Crashlytics.crashlytics().log("🚀 Crashlytics initialized")
    
    // ✅ 2. Messaging delegate set karein
    Messaging.messaging().delegate = self

    // 2. Set up React Native (from your working code)
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    self.reactNativeDelegate = delegate
    self.reactNativeFactory = factory

    self.window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "csk",
      in: window,
      launchOptions: launchOptions
    )

    // 3. Add the push notification request here
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
      if let error = error {
        print("[DEBUG] Push notification permission error: \(error.localizedDescription)")
      } else {
        print("[DEBUG] Push notification permission granted: \(granted)")
        if granted {
          DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
            print("[DEBUG] Registered for remote notifications")
          }
        }
      }
    }

    return true
  }
  
  // MARK: - CORRECTED URL Handling for reCAPTCHA
  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // This is the corrected line:
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // MARK: - Remote Notification Handlers
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    print("[DEBUG] Did register for remote notifications, token: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
    
    // Yeh Phone Auth ke liye hai (Aapka original code)
    Auth.auth().setAPNSToken(deviceToken, type: .unknown)
    
    // ✅ 3. Yeh visible notifications ke liye hai
    Messaging.messaging().apnsToken = deviceToken
    
    print("[DEBUG] APNs token set for Firebase Auth & Messaging")
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("[DEBUG] Failed to register for remote notifications: \(error.localizedDescription)")
  }

  // This is your existing function for silent notifications. No changes needed.
  func application(_ application: UIApplication,
                   didReceiveRemoteNotification userInfo: [AnyHashable : Any],
                   fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    
    print("✅ Silent Push Was Received By The App")

    // Pass the notification to Firebase to be processed
    if Auth.auth().canHandleNotification(userInfo) {
      completionHandler(.newData)
      return
    }
    
    // This is for other types of notifications
    completionHandler(.noData)
  }
}

// MARK: - ✅ 4. Messaging Delegate Extension (Naya Code)
// Yeh extension aapko FCM token dega
extension AppDelegate: MessagingDelegate {
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("✅✅✅ FIREBASE MESSAGING TOKEN: \(fcmToken ?? "N/A") ✅✅✅")
    
    
  }
}


// MARK: - Notification Delegate Extension (Updated Code)
extension AppDelegate: UNUserNotificationCenterDelegate {
  
  // Jab app foreground mein ho aur notification aaye
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    let userInfo = notification.request.content.userInfo
    print("[DEBUG] Notification received in foreground. UserInfo: ", userInfo)
    completionHandler([.banner, .badge, .sound])
  }
  
  // ✅ 5. Jab user notification par TAP kare (Naya Code)
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
    let userInfo = response.notification.request.content.userInfo
    print("[DEBUG] User tapped on notification. UserInfo: ", userInfo)
    
    
     
    completionHandler()
  }
}

