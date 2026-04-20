package settings

type Preferences struct {
	Theme          string `json:"theme"`
	Language       string `json:"language"`
	CareerPathView string `json:"career_path_view"`
}

type NotificationPreferences struct {
	EmailNotifications bool `json:"email_notifications"`
	PushNotifications  bool `json:"push_notifications"`
	DailyReminders     bool `json:"daily_reminders"`
}

type SettingsResponse struct {
	Message string `json:"message"`
}
