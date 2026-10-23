package com.classmeate.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
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
            val remaining = prefs.getInt("remaining_count", 2)
            val total = prefs.getInt("total_count", 4)
            val finished = (total - remaining).coerceAtLeast(0)
            val dismissal = prefs.getString("dismissal_text", "17:40 放学") ?: "17:40 放学"
            val dayText = prefs.getString("day_text", "周五") ?: "周五"
            val c1Name = prefs.getString("c1_name", "给水排水管道工程") ?: "给水排水管道工程"
            val c1Loc = prefs.getString("c1_location", "@长智楼 A208") ?: "@长智楼 A208"
            val c1Time = prefs.getString("c1_time", "25分钟后 · 10:05") ?: "25分钟后 · 10:05"
            val c2Name = prefs.getString("c2_name", "计算机系统结构") ?: "计算机系统结构"
            val c2Loc = prefs.getString("c2_location", "@信息实验楼 301") ?: "@信息实验楼 301"
            val c2Time = prefs.getString("c2_time", "4小时后 · 14:00") ?: "4小时后 · 14:00"

            // 绘制 300 度圆弧分段进度图（今天有几节课就分几段，底部保留 60 度开口）
            val arcBitmap = create300DegreeArcBitmap(total, finished)
            views.setImageViewBitmap(R.id.widget_arc_image, arcBitmap)

            views.setTextViewText(R.id.widget_day_text, dayText)
            views.setTextViewText(R.id.widget_count_number, remaining.toString())
            views.setTextViewText(R.id.widget_dismissal_time, dismissal)

            views.setTextViewText(R.id.widget_c1_name, c1Name)
            views.setTextViewText(R.id.widget_c1_location, c1Loc)
            views.setTextViewText(R.id.widget_c1_time, c1Time)

            views.setTextViewText(R.id.widget_c2_name, c2Name)
            views.setTextViewText(R.id.widget_c2_location, c2Loc)
            views.setTextViewText(R.id.widget_c2_time, c2Time)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun create300DegreeArcBitmap(totalCount: Int, finishedCount: Int): Bitmap {
            val size = 320
            val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            val strokeWidth = 22f

            val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                style = Paint.Style.STROKE
                this.strokeWidth = strokeWidth
                strokeCap = Paint.Cap.ROUND
            }

            val padding = strokeWidth / 2 + 10f
            val oval = RectF(padding, padding, size - padding, size - padding)

            val n = if (totalCount <= 0) 1 else totalCount.coerceAtMost(10)
            if (totalCount <= 0) {
                paint.color = Color.parseColor("#E2E8F0")
                canvas.drawArc(oval, 120f, 300f, false, paint)
                return bitmap
            }

            if (n == 1) {
                paint.color = Color.parseColor("#E2E8F0")
                canvas.drawArc(oval, 120f, 300f, false, paint)
                if (finishedCount >= 1) {
                    paint.color = Color.parseColor("#10B981")
                    canvas.drawArc(oval, 120f, 300f, false, paint)
                }
                return bitmap
            }

            // 分段绘制：今天有几节课就分几段
            val gap = if (n >= 6) 4f else 6f
            val totalGap = (n - 1) * gap
            val segSweep = (300f - totalGap) / n

            for (i in 0 until n) {
                val startAngle = 120f + i * (segSweep + gap)
                paint.color = if (i < finishedCount) Color.parseColor("#10B981") else Color.parseColor("#E2E8F0")
                canvas.drawArc(oval, startAngle, segSweep, false, paint)
            }

            return bitmap
        }
    }
}
