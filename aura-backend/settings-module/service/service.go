package service

import (
	settings "aura-backend/settings-module"
	"aura-backend/settings-module/dao"
)

func UpdatePreferences(email string, preferences settings.Preferences) {
	dao.UpdatePreferences(email, preferences)
}

func UpdateNotificationPreferences(email string, preferences settings.NotificationPreferences) {
	dao.UpdateNotificationPreferences(email, preferences)
}
