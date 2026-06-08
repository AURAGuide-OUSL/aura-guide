package service

import (
	"context"

	notification "aura-backend/notification-module"
	"aura-backend/notification-module/dao"
)

func GetDailyTaskReminder(ctx context.Context, email string) (*notification.Response, error) {
	return dao.GetDailyTaskReminder(ctx, email)
}

func GetMotivationalQuote() notification.Response {
	return dao.GetMotivationalQuote()
}

func ListNotifications(ctx context.Context, email string) ([]notification.Item, error) {
	return dao.ListNotificationsByEmail(ctx, email)
}

func MarkAllRead(ctx context.Context, email string) error {
	return dao.MarkAllRead(ctx, email)
}
