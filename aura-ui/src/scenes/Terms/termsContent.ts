/** Terms shown from Sign-up (Terms link) and Settings - keep in sync manually. */

export const termsUpdatedSubtitle = "Last updated: June 2026";

export const termsIntroduction =
  'By accessing or using the AURA Guide mobile application ("Application", "App", "we", "our", or "us"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the application.';

export const termsSections: { title: string; body: string }[] = [
  {
    title: "1. About the Application",
    body: "AURA Guide is a mobile application designed to support undergraduate Software Engineering, Computer Science, and Information Technology students in Sri Lanka by helping them develop professional and career-oriented skills.",
  },
  {
    title: "2. Scope of Guidance",
    body: "AURA Guide provides guidance only for the following career tracks:\n\n• Software Engineer\n• Quality Assurance (QA) Engineer\n• DevOps Engineer\n• Backend Developer\n\nThe application is intended to guide users only within the selected and relevant career track. It does not provide guidance beyond these defined career paths.",
  },
  {
    title: "3. Key Features",
    body: "The application includes, but is not limited to, the following features:\n\n• Career track selection\n• Personalized daily and weekly learning tasks\n• Skill gap analysis against role requirements\n• Motivational support and reminders\n• CV feedback and review\n• Mock interview support\n• Progress monitoring and performance tracking",
  },
  {
    title: "4. Skills Evaluated by the System",
    body: "AURA Guide assesses your readiness using seven system-defined skills. Tasks, AI Coach sessions, and progress tracking may update scores for:\n\n• Professional Communication\n• Behavioral Interview Skills\n• Reflection and Self Assessment\n• Code Understanding\n• Debugging Reasoning\n• Algorithmic Thinking\n• Git Concept Knowledge\n\nThese skills reflect what employers commonly expect for the career tracks listed in Section 2.",
  },
  {
    title: "5. Skill Levels and Scores",
    body: "Each skill is scored from 1 to 3. The score describes how strong you are in that skill:\n\n• Score 1 - Low / Beginner\n• Score 2 - Moderate / Developing\n• Score 3 - Strong / Industry-Ready\n\nScores are used to compare your profile against role requirements and to suggest focused learning tasks. They are guidance indicators, not formal certifications.",
  },
  {
    title: "6. Skill Importance for Job Roles",
    body: "Each career track assigns a required minimum score per skill. This reflects how important that skill is for the role:\n\n• Core skills for the role - typically require score 3\n• Supporting skills - typically require score 2\n• Nice-to-have skills - typically require score 1–2\n\nThis keeps expectations realistic for students while still showing clear career targets.",
  },
  {
    title: "7. Software Engineer - Skill Requirements",
    body: "Software engineers need strong problem solving, debugging, and code reasoning.\n\n• Professional Communication - Required: 2 - Communicate with teammates and write clear comments or messages\n• Behavioral Interview Skills - Required: 2 - Needed for job interviews\n• Reflection and Self Assessment - Required: 2 - Important for continuous improvement\n• Code Understanding - Required: 3 - Must read and understand complex code\n• Debugging Reasoning - Required: 3 - Debugging is a core engineering skill\n• Algorithmic Thinking - Required: 3 - Core programming and interview skill\n• Git Concept Knowledge - Required: 2 - Must understand basic workflows\n\nMinimum role profile:\n• Communication ≥ 2\n• Behavioral ≥ 2\n• Reflection ≥ 2\n• Code Understanding ≥ 3\n• Debugging ≥ 3\n• Algorithms ≥ 3\n• Git ≥ 2",
  },
  {
    title: "8. QA / Test Engineer - Skill Requirements",
    body: "QA engineers focus on finding issues, understanding systems, and communicating problems clearly.\n\n• Professional Communication - Required: 3 - Must clearly report bugs and communicate issues\n• Behavioral Interview Skills - Required: 2 - Needed for interviews\n• Reflection and Self Assessment - Required: 2 - Important for learning testing strategies\n• Code Understanding - Required: 2 - Must understand code behavior\n• Debugging Reasoning - Required: 3 - Critical for identifying defects\n• Algorithmic Thinking - Required: 2 - Helpful but less central\n• Git Concept Knowledge - Required: 2 - Needed for version control and test workflow\n\nMinimum role profile:\n• Communication ≥ 3\n• Behavioral ≥ 2\n• Reflection ≥ 2\n• Code Understanding ≥ 2\n• Debugging ≥ 3\n• Algorithms ≥ 2\n• Git ≥ 2",
  },
  {
    title: "9. Backend Developer - Skill Requirements",
    body: "Backend developers need strong system logic and debugging skills.\n\n• Professional Communication - Required: 2 - Collaboration with frontend and DevOps teams\n• Behavioral Interview Skills - Required: 2 - Interview preparation\n• Reflection and Self Assessment - Required: 2 - Continuous improvement\n• Code Understanding - Required: 3 - Must understand APIs and server logic\n• Debugging Reasoning - Required: 3 - Debugging backend issues is critical\n• Algorithmic Thinking - Required: 3 - Needed for efficient backend logic\n• Git Concept Knowledge - Required: 3 - Strong collaboration through version control\n\nMinimum role profile:\n• Communication ≥ 2\n• Behavioral ≥ 2\n• Reflection ≥ 2\n• Code Understanding ≥ 3\n• Debugging ≥ 3\n• Algorithms ≥ 3\n• Git ≥ 3",
  },
  {
    title: "10. DevOps Engineer - Skill Requirements",
    body: "DevOps engineers focus on systems thinking, troubleshooting, and Git workflows.\n\n• Professional Communication - Required: 3 - Coordinate between development and operations\n• Behavioral Interview Skills - Required: 2 - Interview preparation\n• Reflection and Self Assessment - Required: 2 - Continuous improvement mindset\n• Code Understanding - Required: 2 - Understand deployment scripts and services\n• Debugging Reasoning - Required: 3 - Troubleshooting systems is critical\n• Algorithmic Thinking - Required: 1 - Less central than for developers\n• Git Concept Knowledge - Required: 3 - Core DevOps workflow tool\n\nMinimum role profile:\n• Communication ≥ 3\n• Behavioral ≥ 2\n• Reflection ≥ 2\n• Code Understanding ≥ 2\n• Debugging ≥ 3\n• Algorithms ≥ 1\n• Git ≥ 3",
  },
  {
    title: "11. Career Readiness Classification",
    body: "Instead of a hard pass/fail result, AURA Guide compares your skill scores to each role profile and classifies readiness supportively:\n\n• 80–100% match - Ready\n• 60–79% match - Developing\n• Below 60% match - Needs Improvement\n\nExample: if your Debugging Reasoning score is below the required level for Software Engineer, Backend Developer, or DevOps roles, the system may highlight debugging as a priority growth area while still acknowledging strengths in other skills (for example, strong algorithmic thinking or communication).\n\nFeedback is designed to guide improvement, not to reject or disqualify you from learning or using the application.",
  },
  {
    title: "12. User Responsibilities",
    body: "By using the application, you agree to:\n\n• Provide accurate, complete, and up-to-date information\n• Use the application strictly for educational and learning purposes\n• Refrain from harming, harassing, or misusing the platform or other users\n• Comply with all applicable laws and regulations",
  },
  {
    title: "13. Account Registration",
    body: "If you create an account:\n\n• You are responsible for maintaining the confidentiality of your account credentials\n• You are fully responsible for all activities conducted through your account\n• You must notify us immediately of any unauthorized access or security breach",
  },
  {
    title: "14. Data Ownership and Usage",
    body: "By uploading your CV or any personal data to the AURA Guide application:\n\n• You grant us permission to process, analyze, and store this data solely for providing app-related services\n• Your data will be used only to improve learning outcomes and application functionality\n• We do not claim ownership of your uploaded content",
  },
  {
    title: "15. Rewards, Badges, and Progress Tracking",
    body: "Badges, scores, and progress indicators are provided only for motivational and self-development purposes. Skill scores and readiness classifications do not guarantee employment, certification, or professional success.",
  },
  {
    title: "16. Educational Disclaimer",
    body: "AURA Guide provides guidance, recommendations, and learning support only. We are not responsible for any decisions, career choices, or outcomes based on suggestions made by the application. The application does not replace professional career counseling or expert advice.",
  },
  {
    title: "17. Changes to the Application",
    body: "We reserve the right to:\n\n• Modify, update, suspend, or discontinue any part of the application at any time\n• Change features, content, skill matrices, or functionality without prior notice",
  },
  {
    title: "18. Changes to Terms and Conditions",
    body: "We may update these Terms and Conditions from time to time. Continued use of the application after changes are made constitutes acceptance of the revised terms.\n\nBy continuing to use the AURA Guide application, you confirm that you have read, understood, and agreed to these Terms and Conditions.",
  },
];
