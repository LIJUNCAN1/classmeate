package com.classmeate.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class ScheduleWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_schedule_2x2)

            // 点击小组件直接启动课星球主界面
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

            // 从本地 SharedPreferences 读取最新课表摘要数据（若无则展示智能演示数据）
            val prefs = context.getSharedPreferences("classmeate_widget_data", Context.MODE_PRIVATE)
            val remaining = prefs.getInt("remaining_count", 3)
            val dismissal = prefs.getString("dismissal_text", "预计 17:40 放学") ?: "预计 17:40 放学"
            val nextCourse = prefs.getString("next_course", "下节: 大学英语 (405研讨室)") ?: "下节: 大学英语 (405研讨室)"

            views.setTextViewText(R.id.widget_count_number, remaining.toString())
            views.setTextViewText(R.id.widget_dismissal_time, dismissal)
            views.setTextViewText(R.id.widget_next_class, nextCourse)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
