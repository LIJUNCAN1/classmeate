package com.classmeate.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetBridge"

    @ReactMethod
    fun updateWidgetData(remaining: Int, total: Int, dismissal: String, nextCourse: String, progress: Double) {
        val prefs = reactContext.getSharedPreferences("classmeate_widget_data", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putInt("remaining_count", remaining)
            putInt("total_count", total)
            putString("dismissal_text", dismissal)
            putString("next_course", nextCourse)
            putFloat("progress", progress.toFloat())
            apply()
        }

        // 立即触发桌面小组件界面刷新
        val appWidgetManager = AppWidgetManager.getInstance(reactContext)
        val componentName = ComponentName(reactContext, ScheduleWidgetProvider::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
        if (appWidgetIds.isNotEmpty()) {
            val intent = Intent(reactContext, ScheduleWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)
            }
            reactContext.sendBroadcast(intent)
        }
    }
}
