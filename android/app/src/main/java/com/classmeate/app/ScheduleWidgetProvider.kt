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
            val remaining = prefs.getInt("remaining_count", 3)
            val dismissal = prefs.getString("dismissal_text", "20:35 放学 · 距放学 2小时15分") ?: "20:35 放学 · 距放学 2小时15分"
            val nextCourse = prefs.getString("next_course", "下节: 形势与政策 @ 涵虚楼A101 · 14:00") ?: "下节: 形势与政策 @ 涵虚楼A101 · 14:00"
            val progress = prefs.getFloat("progress", 0.35f)

            // 绘制 300 度圆弧进度图（底部保留 60 度开口）
            val arcBitmap = create300DegreeArcBitmap(progress)
            views.setImageViewBitmap(R.id.widget_arc_image, arcBitmap)

            views.setTextViewText(R.id.widget_count_number, remaining.toString())
            views.setTextViewText(R.id.widget_dismissal_time, dismissal)
            views.setTextViewText(R.id.widget_next_class, nextCourse)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun create300DegreeArcBitmap(progress: Float): Bitmap {
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

            // 底轨：300 度浅灰色弧线（从 120 度开始顺时针绘制 300 度，在 60 度处截止，底部保留 60 度开口）
            paint.color = Color.parseColor("#E2E8F0")
            canvas.drawArc(oval, 120f, 300f, false, paint)

            // 活跃进度轨：300 度生机草木绿弧线
            val validProgress = progress.coerceIn(0f, 1f)
            if (validProgress > 0f) {
                paint.color = Color.parseColor("#10B981")
                val sweep = 300f * validProgress
                canvas.drawArc(oval, 120f, sweep, false, paint)
            }

            return bitmap
        }
    }
}
