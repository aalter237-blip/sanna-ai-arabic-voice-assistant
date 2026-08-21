package com.androidvoiceagent

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class AndroidAccessibilityService : AccessibilityService() {

    companion object {
        var instance: AndroidAccessibilityService? = null
            private set

        fun isRunning(): Boolean = instance != null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPES_ALL_MASK
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                    AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            notificationTimeout = 50
        }
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Accessibility events tracking
    }

    override fun onInterrupt() {
        // Service interrupted
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    fun findAndClick(targetText: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByText(targetText)
        if (!nodes.isNullOrEmpty()) {
            for (node in nodes) {
                if (performClickOnNode(node)) return true
            }
        }
        return false
    }

    fun findAndClickById(viewId: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByViewId(viewId)
        if (!nodes.isNullOrEmpty()) {
            for (node in nodes) {
                if (performClickOnNode(node)) return true
            }
        }
        return false
    }

    private fun performClickOnNode(node: AccessibilityNodeInfo): Boolean {
        var current: AccessibilityNodeInfo? = node
        while (current != null) {
            if (current.isClickable) {
                return current.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            }
            current = current.parent
        }
        return false
    }

    fun inputText(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val focusedNode = rootNode.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
            ?: rootNode.findAccessibilityNodeInfosByViewId("android:id/input").firstOrNull()

        if (focusedNode != null && focusedNode.isEditable) {
            val arguments = Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
            }
            return focusedNode.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
        }
        return false
    }

    fun extractScreenText(): List<String> {
        val rootNode = rootInActiveWindow ?: return emptyList()
        val textList = mutableListOf<String>()
        traverseNode(rootNode, textList)
        return textList
    }

    private fun traverseNode(node: AccessibilityNodeInfo?, texts: MutableList<String>) {
        if (node == null) return
        val text = node.text?.toString()?.trim()
        val desc = node.contentDescription?.toString()?.trim()

        if (!text.isNullOrEmpty() && !texts.contains(text)) {
            texts.add(text)
        }
        if (!desc.isNullOrEmpty() && !texts.contains(desc)) {
            texts.add(desc)
        }

        for (i in 0 until node.childCount) {
            traverseNode(node.getChild(i), texts)
        }
    }

    fun triggerGlobalAction(action: String): Boolean {
        val actionId = when (action.lowercase()) {
            "back" -> GLOBAL_ACTION_BACK
            "home" -> GLOBAL_ACTION_HOME
            "recents" -> GLOBAL_ACTION_RECENTS
            "notifications" -> GLOBAL_ACTION_NOTIFICATIONS
            "quick_settings" -> GLOBAL_ACTION_QUICK_SETTINGS
            else -> GLOBAL_ACTION_BACK
        }
        return performGlobalAction(actionId)
    }
}
