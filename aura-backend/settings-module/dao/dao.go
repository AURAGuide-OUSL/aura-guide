package dao

import (
	"sync"

	settings "aura-backend/settings-module"
)

var (
	settingsMu             sync.RWMutex
	preferencesStore       = map[string]settings.Preferences{}
	notificationPrefsStore = map[string]settings.NotificationPreferences{}
)

func UpdatePreferences(email string, preferences settings.Preferences) {
	settingsMu.Lock()
	preferencesStore[email] = preferences
	settingsMu.Unlock()
}

func UpdateNotificationPreferences(email string, preferences settings.NotificationPreferences) {
	settingsMu.Lock()
	notificationPrefsStore[email] = preferences
	settingsMu.Unlock()
}
