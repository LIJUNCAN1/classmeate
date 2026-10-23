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

        refreshWidget()
    }

    @ReactMethod
    fun updateWidgetDetailData(
        remaining: Int,
        total: Int,
        dismissal: String,
        dayText: String,
        c1Name: String,
        c1Loc: String,
        c1Time: String,
        c2Name: String,
        c2Loc: String,
        c2Time: String
    ) {
        val prefs = reactContext.getSharedPreferences("classmeate_widget_data", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putInt("remaining_count", remaining)
            putInt("total_count", total)
            putString("dismissal_text", dismissal)
            putString("day_text", dayText)
            putString("c1_name", c1Name)
            putString("c1_location", c1Loc)
            putString("c1_time", c1Time)
            putString("c2_name", c2Name)
            putString("c2_location", c2Loc)
            putString("c2_time", c2Time)
            apply()
        }

        refreshWidget()
    }

    private fun refreshWidget() {
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
