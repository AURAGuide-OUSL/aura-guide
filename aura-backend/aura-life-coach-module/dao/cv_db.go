package dao

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	auralifecoach "aura-backend/aura-life-coach-module"
	"aura-backend/common/cvstorage"
	"aura-backend/common/db"

	"github.com/jackc/pgx/v5"
)

type CVAnalysisRow struct {
	FileName     string
	FilePath     string
	UploadedAt   *time.Time
	Strengths    []string
	Weaknesses   []string
	Improvements []string
}

func lookupUserStudentID(ctx context.Context, email string) (int, error) {
	var id int
	err := db.Pool.QueryRow(ctx, `SELECT id FROM user_student WHERE lower(trim(email)) = lower(trim($1))`, email).Scan(&id)
	return id, err
}

func unmarshalJSONArray(src any, dest *[]string) error {
	if dest == nil {
		return nil
	}
	switch v := src.(type) {
	case nil:
		*dest = nil
	case []byte:
		return json.Unmarshal(v, dest)
	case string:
		if strings.TrimSpace(v) == "" {
			*dest = nil
			return nil
		}
		return json.Unmarshal([]byte(v), dest)
	default:
		b, err := json.Marshal(v)
		if err != nil {
			return err
		}
		return json.Unmarshal(b, dest)
	}
	return nil
}

func GetCVAnalysisRow(ctx context.Context, email string) (*CVAnalysisRow, error) {
	userID, err := lookupUserStudentID(ctx, email)
	if err != nil {
		return nil, err
	}
	row := db.Pool.QueryRow(ctx, `
SELECT file_name, file_path, uploaded_at, strengths, weaknesses, improvements
FROM user_cv_analysis WHERE user_id = $1`, userID,
	)
	var r CVAnalysisRow
	var strengths, weaknesses, improvements any
	if err := row.Scan(&r.FileName, &r.FilePath, &r.UploadedAt, &strengths, &weaknesses, &improvements); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if err := unmarshalJSONArray(strengths, &r.Strengths); err != nil {
		return nil, fmt.Errorf("strengths: %w", err)
	}
	if err := unmarshalJSONArray(weaknesses, &r.Weaknesses); err != nil {
		return nil, fmt.Errorf("weaknesses: %w", err)
	}
	if err := unmarshalJSONArray(improvements, &r.Improvements); err != nil {
		return nil, fmt.Errorf("improvements: %w", err)
	}
	return &r, nil
}

func ListCVAnalysisMeta(ctx context.Context, email string) ([]auralifecoach.CVMeta, error) {
	r, err := GetCVAnalysisRow(ctx, email)
	if err != nil || r == nil || r.FileName == "" {
		return []auralifecoach.CVMeta{}, err
	}
	var at time.Time
	if r.UploadedAt != nil {
		at = *r.UploadedAt
	}
	return []auralifecoach.CVMeta{
		{FileName: r.FileName, UploadedAt: at},
	}, nil
}

// PersistCVPDF stores PDF bytes on disk and links them to the user's CV analysis row.
func PersistCVPDF(ctx context.Context, email, fileName string, data []byte) error {
	userID, err := lookupUserStudentID(ctx, email)
	if err != nil {
		return err
	}
	if old, _ := getCVFilePath(ctx, userID); old != "" {
		cvstorage.RemoveFile(old)
	}
	path, err := cvstorage.SavePDF(userID, fileName, data)
	if err != nil {
		return err
	}
	_, err = db.Pool.Exec(ctx, `
UPDATE user_cv_analysis
SET file_path = $2,
    file_size = $3,
    file_name = COALESCE(NULLIF(trim($4), ''), file_name),
    uploaded_at = COALESCE(uploaded_at, NOW())
WHERE user_id = $1`, userID, path, int64(len(data)), fileName)
	return err
}

// GetCVFileForDownload returns the on-disk path and display name for the user's CV PDF.
func GetCVFileForDownload(ctx context.Context, email string) (path, displayName string, err error) {
	userID, err := lookupUserStudentID(ctx, email)
	if err != nil {
		return "", "", err
	}
	var filePath, fileName *string
	err = db.Pool.QueryRow(ctx, `
SELECT file_path, file_name FROM user_cv_analysis WHERE user_id = $1`, userID,
	).Scan(&filePath, &fileName)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", "", fmt.Errorf("no cv on file")
		}
		return "", "", err
	}
	if filePath == nil || strings.TrimSpace(*filePath) == "" {
		return "", "", fmt.Errorf("cv file not stored")
	}
	name := "cv.pdf"
	if fileName != nil && strings.TrimSpace(*fileName) != "" {
		name = strings.TrimSpace(*fileName)
	}
	return strings.TrimSpace(*filePath), name, nil
}

func getCVFilePath(ctx context.Context, userID int) (string, error) {
	var path *string
	err := db.Pool.QueryRow(ctx, `SELECT file_path FROM user_cv_analysis WHERE user_id = $1`, userID).Scan(&path)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	if path == nil {
		return "", nil
	}
	return strings.TrimSpace(*path), nil
}

// RemoveStoredCVFile deletes the on-disk PDF for a user if present.
func RemoveStoredCVFile(ctx context.Context, userID int) {
	path, _ := getCVFilePath(ctx, userID)
	if path != "" {
		cvstorage.RemoveFile(path)
	}
}
