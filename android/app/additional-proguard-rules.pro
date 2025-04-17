# ==================================
# 项目特定的第三方库 ProGuard 规则
# ==================================

# Alicloud OpenAPI Client
-keep class com.aliyun.** { *; }
-keep class com.alicloud.** { *; }
-dontwarn com.aliyun.**
-dontwarn com.alicloud.**

# FlyerHQ React Native Chat UI
-keep class com.flyerhq.** { *; }
-dontwarn com.flyerhq.**

# React Native Dropdown Select List
-keep class com.flatlist.dropdown.** { *; }
-dontwarn com.flatlist.dropdown.**

# React Native Confetti / Confetti Cannon
-keep class com.confetti.** { *; }
-keep class ca.jaysoo.** { *; }
-dontwarn ca.jaysoo.**

# React Native Linear Gradient
-keep class com.BV.LinearGradient.** { *; }
-dontwarn com.BV.LinearGradient.**

# React Native Paper
-keep class com.reactnativepaper.** { *; }
-dontwarn com.reactnativepaper.**

# React Native Permissions
-keep class com.zoontek.rnpermissions.** { *; }
-dontwarn com.zoontek.rnpermissions.**

# React Native Sound
-keep class com.zmxv.RNSound.** { *; }
-dontwarn com.zmxv.RNSound.**

# Redux / React-Redux
-keep class com.facebook.react.turbomodule.core.CallInvokerHolderImpl { *; }

# 避免在 Hermes 引擎上的反射问题
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# 处理 WebP 图片格式
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.fresco.** { *; }
-keep class com.facebook.animated.** { *; }
-dontwarn com.facebook.animated.**

# JS 引擎相关
-keep class com.facebook.react.bridge.queue.** { *; }
-keep class com.facebook.react.bridge.JavaScriptExecutor** { *; }
-keep class com.facebook.react.bridge.JavaMethodWrapper { *; }

# React Native Navigation 相关
-keep class com.facebook.react.ReactRootView { *; }
-keep class com.facebook.react.ReactInstanceManager { *; }
-keep class com.facebook.react.shell.MainReactPackage { *; }
-keep class com.facebook.soloader.SoLoader { *; }

# AsyncStorage 相关
-keep class com.facebook.react.modules.storage.** { *; }
-keep class com.facebook.react.modules.storage.ReactDatabaseSupplier { *; }

# 确保应用的主要入口点不被混淆
-keep public class com.awesomeproject.MainApplication { *; }
-keep public class com.awesomeproject.MainActivity { *; }

# 保留 JS 引擎错误处理相关类
-keepclassmembers class com.facebook.react.bridge.ReactContext {
   public void handleException(java.lang.Exception);
} 