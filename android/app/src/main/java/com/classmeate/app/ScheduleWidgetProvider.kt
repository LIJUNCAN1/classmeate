package com.classmeate.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

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

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            ACTION_PREV_DAY -> switchWidgetDay(context, -1)
            ACTION_NEXT_DAY -> switchWidgetDay(context, 1)
        }
    }

    private fun switchWidgetDay(context: Context, delta: Int) {
        val prefs = context.getSharedPreferences("classmeate_widget_data", Context.MODE_PRIVATE)
        val currentDay = prefs.getInt("current_selected_day", getTodayDayOfWeek())
        var nextDay = currentDay + delta
        if (nextDay < 1) nextDay = 7
        if (nextDay > 7) nextDay = 1
        prefs.edit().putInt("current_selected_day", nextDay).apply()

        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, ScheduleWidgetProvider::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        const val ACTION_PREV_DAY = "com.classmeate.app.ACTION_PREV_DAY"
        const val ACTION_NEXT_DAY = "com.classmeate.app.ACTION_NEXT_DAY"

        private val DAY_NAMES = arrayOf("", "周一", "周二", "周三", "周四", "周五", "周六", "周日")

        fun getTodayDayOfWeek(): Int {
            val cal = Calendar.getInstance()
            val d = cal.get(Calendar.DAY_OF_WEEK) // 1=Sunday, 2=Monday, ..., 7=Saturday
            return if (d == Calendar.SUNDAY) 7 else d - 1
        }

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_schedule_2x2)

            // 点击小组件卡片主体直接启动课星球主界面
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

            // 星期几左右切换按钮交互绑定
            val prevIntent = Intent(context, ScheduleWidgetProvider::class.java).apply {
                action = ACTION_PREV_DAY
            }
            val prevPending = PendingIntent.getBroadcast(
                context,
                101,
                prevIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_prev_day, prevPending)

            val nextIntent = Intent(context, ScheduleWidgetProvider::class.java).apply {
                action = ACTION_NEXT_DAY
            }
            val nextPending = PendingIntent.getBroadcast(
                context,
                102,
                nextIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_next_day, nextPending)

            // 从本地 SharedPreferences 读取数据
            val prefs = context.getSharedPreferences("classmeate_widget_data", Context.MODE_PRIVATE)
            val selectedDay = prefs.getInt("current_selected_day", getTodayDayOfWeek())
            val weeklyJson = prefs.getString("weekly_schedule_json", null)

            var dayText = DAY_NAMES.getOrElse(selectedDay) { "周五" }
            var remaining = 2
            var total = 4
            var finished = 2
            var dismissal = "17:40 放学"
            var c1Name = ""
            var c1Loc = ""
            var c1Time = ""
            var c2Name = ""
            var c2Loc = ""
            var c2Time = ""
            var hasCourses = false

            if (!weeklyJson.isNullOrEmpty()) {
                try {
                    val arr = JSONArray(weeklyJson)
                    for (i in 0 until arr.length()) {
                        val obj = arr.getJSONObject(i)
                        if (obj.optInt("dayOfWeek", -1) == selectedDay) {
                            dayText = obj.optString("dayOfWeekName", dayText)
                            total = obj.optInt("totalCount", 0)
                            remaining = obj.optInt("remainingCount", 0)
                            finished = obj.optInt("finishedCount", 0)
                            dismissal = obj.optString("dismissalText", "已放学")
                            val coursesArr = obj.optJSONArray("courses")
                            if (coursesArr != null && coursesArr.length() > 0) {
                                hasCourses = true
                                val c1Obj = coursesArr.optJSONObject(0)
                                if (c1Obj != null) {
                                    c1Name = c1Obj.optString("name", "")
                                    c1Loc = c1Obj.optString("location", "")
                                    c1Time = c1Obj.optString("timeText", "")
                                }
                                if (coursesArr.length() > 1) {
                                    val c2Obj = coursesArr.optJSONObject(1)
                                    if (c2Obj != null) {
                                        c2Name = c2Obj.optString("name", "")
                                        c2Loc = c2Obj.optString("location", "")
                                        c2Time = c2Obj.optString("timeText", "")
                                    }
                                }
                            }
                            break
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            } else {
                // 默认演示数据
                remaining = prefs.getInt("remaining_count", 2)
                total = prefs.getInt("total_count", 4)
                finished = (total - remaining).coerceAtLeast(0)
                dismissal = prefs.getString("dismissal_text", "17:40 放学") ?: "17:40 放学"
                dayText = prefs.getString("day_text", DAY_NAMES.getOrElse(selectedDay) { "周五" }) ?: "周五"
                c1Name = prefs.getString("c1_name", "给水排水管道工程") ?: "给水排水管道工程"
                c1Loc = prefs.getString("c1_location", "@长智楼 A208") ?: "@长智楼 A208"
                c1Time = prefs.getString("c1_time", "25分钟后 · 10:05") ?: "25分钟后 · 10:05"
                c2Name = prefs.getString("c2_name", "计算机系统结构") ?: "计算机系统结构"
                c2Loc = prefs.getString("c2_location", "@信息实验楼 301") ?: "@信息实验楼 301"
                c2Time = prefs.getString("c2_time", "4小时后 · 14:00") ?: "4小时后 · 14:00"
                hasCourses = c1Name.isNotEmpty()
            }

            // 绘制分段弧线进度图（按今天几节课分几段，底部80度对称开口，绝不遮挡文字）
            val arcBitmap = createSegmentedArcBitmap(total, finished)
            views.setImageViewBitmap(R.id.widget_arc_image, arcBitmap)

            views.setTextViewText(R.id.widget_day_text, dayText)
            views.setTextViewText(R.id.widget_count_number, remaining.toString())
            views.setTextViewText(R.id.widget_dismissal_time, dismissal)

            // 下方课程表列表：从左到右 课程名和地点，右边写还有多久上课，一次只显示两门，已结束的不显示
            if (!hasCourses || c1Name.isEmpty()) {
                views.setViewVisibility(R.id.widget_course_1_row, View.GONE)
                views.setViewVisibility(R.id.widget_course_2_row, View.GONE)
                views.setViewVisibility(R.id.widget_course_empty_row, View.VISIBLE)
                val emptyMsg = if (total == 0) "今日没课 · 享受大学时光" else "今日课程已全部结束 ✨"
                views.setTextViewText(R.id.widget_empty_text, emptyMsg)
            } else {
                views.setViewVisibility(R.id.widget_course_empty_row, View.GONE)
                views.setViewVisibility(R.id.widget_course_1_row, View.VISIBLE)
                views.setTextViewText(R.id.widget_c1_name, c1Name)
                views.setTextViewText(R.id.widget_c1_location, c1Loc)
                views.setTextViewText(R.id.widget_c1_time, c1Time)

                if (c2Name.isNotEmpty()) {
                    views.setViewVisibility(R.id.widget_course_2_row, View.VISIBLE)
                    views.setTextViewText(R.id.widget_c2_name, c2Name)
                    views.setTextViewText(R.id.widget_c2_location, c2Loc)
                    views.setTextViewText(R.id.widget_c2_time, c2Time)
                } else {
                    views.setViewVisibility(R.id.widget_course_2_row, View.GONE)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        /**
         * 绘制分段弧线进度图：
         * 1. 今天有几节课就分几段
         * 2. 底部保留 80 度开口（130° 顺时针绘制 280° 至 50°），两侧尖端与文字保留充分安全距离
         * 3. 进度条绝不遮挡文字
         */
        private fun createSegmentedArcBitmap(totalCount: Int, finishedCount: Int): Bitmap {
            val size = 320
            val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            val strokeWidth = 20f

            val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                style = Paint.Style.STROKE
                this.strokeWidth = strokeWidth
                strokeCap = Paint.Cap.ROUND
            }

            val padding = strokeWidth / 2 + 10f
            val oval = RectF(padding, padding, size - padding, size - padding)

            val totalSweep = 280f
            val startBase = 130f

            if (totalCount <= 0) {
                paint.color = Color.parseColor("#E2E8F0")
                canvas.drawArc(oval, startBase, totalSweep, false, paint)
                return bitmap
            }

            val n = totalCount.coerceIn(1, 10)

            if (n == 1) {
                paint.color = Color.parseColor("#E2E8F0")
                canvas.drawArc(oval, startBase, totalSweep, false, paint)
                if (finishedCount >= 1) {
                    paint.color = Color.parseColor("#10B981")
                    canvas.drawArc(oval, startBase, totalSweep, false, paint)
                }
                return bitmap
            }

            // 多节课：按节数等距分段
            val gap = if (n >= 6) 4f else 6f
            val totalGap = (n - 1) * gap
            val segSweep = (totalSweep - totalGap) / n

            for (i in 0 until n) {
                val startAngle = startBase + i * (segSweep + gap)
                paint.color = if (i < finishedCount) Color.parseColor("#10B981") else Color.parseColor("#E2E8F0")
                canvas.drawArc(oval, startAngle, segSweep, false, paint)
            }

            return bitmap
        }
    }
}
