package cvstorage

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Dir returns the directory used to persist uploaded CV PDFs.
func Dir() string {
	if d := strings.TrimSpace(os.Getenv("CV_STORAGE_DIR")); d != "" {
		return d
	}
	return filepath.Join("data", "cv")
}

// SavePDF writes PDF bytes for a user and returns the absolute path on disk.
func SavePDF(userID int, originalName string, data []byte) (string, error) {
	if len(data) == 0 {
		return "", fmt.Errorf("empty pdf")
	}
	dir := Dir()
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return "", err
	}
	base := strings.TrimSpace(originalName)
	if base == "" {
		base = "cv.pdf"
	}
	base = filepath.Base(base)
	if !strings.HasSuffix(strings.ToLower(base), ".pdf") {
		base += ".pdf"
	}
	safe := fmt.Sprintf("%d_%d_%s", userID, time.Now().Unix(), base)
	path := filepath.Join(dir, safe)
	if err := os.WriteFile(path, data, 0o600); err != nil {
		return "", err
	}
	abs, err := filepath.Abs(path)
	if err != nil {
		return path, nil
	}
	return abs, nil
}

// RemoveFile deletes a stored PDF if present (best-effort).
func RemoveFile(path string) {
	if strings.TrimSpace(path) == "" {
		return
	}
	_ = os.Remove(path)
}
