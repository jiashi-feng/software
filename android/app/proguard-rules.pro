
# ==================================
# React Native 基本规则
# ==================================

# 保留 Annotation 不混淆
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses

# React Native
-keep,allowobfuscation @interface **.BuildConfig
-keep,allowobfuscation class com.facebook.hermes.unicode.** { *; }
-keep,allowobfuscation class com.facebook.jni.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# JSC反射相关
-keepclassmembers class * implements java.io.Serializable {
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Hermes 引擎
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.react.hermes.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ==================================
# React Native 第三方库规则
# ==================================

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Navigation
-keep class com.facebook.react.ReactFragment { *; }
-keep class com.facebook.react.ReactActivity { *; }
-keep class com.facebook.react.ReactActivityDelegate { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Image Picker
-keep class com.imagepicker.** { *; }

# RNFS
-keep class com.rnfs.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ==================================
# 网络请求相关
# ==================================

# OkHttp
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontnote okhttp3.**

# Okio
-keep class sun.misc.Unsafe { *; }
-dontwarn java.nio.file.*
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
-dontwarn okio.**

# ==================================
# JSON 处理相关
# ==================================

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.** { *; }
-keep class com.google.gson.stream.** { *; }

# Crypto-JS
-keep class org.spongycastle.** { *; }
-dontwarn org.spongycastle.**

# ==================================
# 应用特定规则
# ==================================

# 保留模型类不被混淆
-keep class com.awesomeproject.models.** { *; }

# 保留自定义组件
-keep public class com.awesomeproject.components.** { *; }

# JSC调试支持
-keepclassmembers class com.facebook.react.bridge.CatalystInstance {
    void setGlobalVariable(java.lang.String, java.lang.String);
}

# 确保 ReactInstanceManager 创建的原生模块不被混淆
-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

# Crashlytics
-keep class com.crashlytics.** { *; }
-dontwarn com.crashlytics.**

# 保留自定义应用入口
-keep public class com.awesomeproject.MainActivity { *; }
