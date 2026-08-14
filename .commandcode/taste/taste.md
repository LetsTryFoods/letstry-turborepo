# Tastes

- When the assistant asks scoping questions with recommended defaults, prefers to defer to those recommendations and signal "continue" rather than answer each option individually. Confidence: 0.5
- Prefers clean UI with no duplicated elements — e.g., a screen should show only one heading/back button, so if a navigator header and an in-screen custom header both render, one must be removed. Confidence: 0.7
- Reports UI issues by attaching a screenshot with a brief text description of the problem. Confidence: 0.4
- Cares about mobile keyboard behavior — expects input fields and content below them (e.g., search box and results at the bottom of a screen) to stay visible above the on-screen keyboard rather than being hidden behind it (e.g., via KeyboardAvoidingView). Confidence: 0.8
- Develops against a backend running on their local machine over the LAN — wants the app's API base URL config checked and updated to match their current local IP (e.g., "check the ip again and change according to the ip of my local"). Confidence: 0.6
