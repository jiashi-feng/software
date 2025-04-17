# Hermes 引擎专用 ProGuard 规则

# Hermes 指令集
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.hermes.intl.** { *; }
-keep class com.facebook.jni.** { *; }

# 避免裁剪 JavaScript 引擎
-keepclassmembers class com.facebook.hermes.unicode.** { *; }
-keepclassmembers class com.facebook.jni.CppException { *; }
-keepclassmembers class com.facebook.jni.HybridData { *; }
-keepclassmembers class com.facebook.proguard.annotations.DoNotStrip { *; }

# JSI 相关类
-keepclassmembers class com.facebook.react.bridge.JavaScriptExecutor* { *; }
-keepclassmembers class com.facebook.react.bridge.RuntimeExecutor { *; }
-keepclassmembers class com.facebook.react.bridge.queue.NativeRunnable { *; }
-keepclassmembers class com.facebook.react.bridge.ReadableType { *; }
-keepclassmembers class com.facebook.react.bridge.WritableMap { *; }

# 避免 JavaScript 引擎相关类的混淆
-keep class * extends com.facebook.jni.HybridData { *; }
-keep,allowshrinking class * implements com.facebook.react.bridge.JavaScriptModule
-keep,allowshrinking class * implements com.facebook.react.bridge.NativeModule

# TurboModules
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.turbomodule.core.CallInvokerHolderImpl { *; }
-keep class * implements com.facebook.react.turbomodule.core.interfaces.TurboModule { *; }

# 异常处理
-keepattributes LineNumberTable,SourceFile
-renamesourcefileattribute SourceFile 