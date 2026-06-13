package skillgapanalysis

type SkillLevel struct {
	SkillID   int    `json:"skill_id"`
	SkillName string `json:"skill_name"`
	Category  string `json:"category"`
	Score     int    `json:"score"`
	Level     string `json:"level"`
}

type SkillGap struct {
	SkillID       int    `json:"skill_id"`
	SkillName     string `json:"skill_name"`
	RequiredScore int    `json:"required_score"`
	CurrentScore  int    `json:"current_score"`
	Gap           int    `json:"gap"`
	RequiredLevel string `json:"required_level"`
	CurrentLevel  string `json:"current_level"`
}
