package pdfutil

import (
	"bytes"
	"fmt"
	"io"
	"strings"

	"github.com/ledongthuc/pdf"
)

// PlainText extracts best-effort plain text from PDF bytes (maxBytes caps read size).
func PlainText(data []byte, maxBytes int) (string, error) {
	if maxBytes <= 0 {
		maxBytes = 12 * 1024 * 1024
	}
	if len(data) > maxBytes {
		return "", fmt.Errorf("file too large (max %d bytes)", maxBytes)
	}
	rdr := bytes.NewReader(data)
	rd, err := pdf.NewReader(rdr, int64(len(data)))
	if err != nil {
		return "", fmt.Errorf("pdf open: %w", err)
	}
	rc, err := rd.GetPlainText()
	if err != nil {
		return "", fmt.Errorf("pdf text: %w", err)
	}
	var buf bytes.Buffer
	if _, err := io.Copy(&buf, rc); err != nil {
		return "", err
	}
	s := strings.TrimSpace(buf.String())
	if s == "" {
		return "", fmt.Errorf("no extractable text in PDF")
	}
	return s, nil
}
