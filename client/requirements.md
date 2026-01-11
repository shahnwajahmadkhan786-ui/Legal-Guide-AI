## Packages
react-markdown | For rendering formatted legal guidance from the AI
framer-motion | For smooth message animations and transitions
date-fns | For formatting timestamps in the chat history
clsx | For conditional class merging
tailwind-merge | For conditional class merging

## Notes
The backend handles AI generation synchronously on the POST /api/threads/:threadId/messages endpoint.
The POST request returns the assistant's response.
We need to handle the disclaimer visibility prominently.
Tailwind Config needs to extend with 'serif' font for the legal aesthetic.
