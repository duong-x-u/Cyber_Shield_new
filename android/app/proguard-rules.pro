# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-keep class com.thaiduong.cybershield.analysis.AnalysisRequest { *; }
-keep class com.thaiduong.cybershield.analysis.AnalysisResponse { *; }
-keep class com.thaiduong.cybershield.analysis.FullApiResponse { *; }

# If using Gson, you might also need these general rules
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.stream.** { *; }
-keep class com.google.gson.internal.** { *; }
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class com.google.gson.Gson
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer
