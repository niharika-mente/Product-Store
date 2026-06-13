gh pr review 114 --approve
gh pr edit 114 --add-label "ssoc,easy"

gh pr review 113 --approve
gh pr edit 113 --add-label "ssoc,medium"

gh pr review 112 --request-changes -b "Hey, great work on the wishlist feature! However, since we have authentication in the app, could you update the backend to tie the wishlist to the logged-in user's ID? A single global wishlist means all users will share and overwrite the same saved products, which isn't ideal. Let me know if you need any help with this!"
gh pr edit 112 --add-label "ssoc,medium"

gh pr review 105 --approve
gh pr edit 105 --add-label "ssoc,easy"

gh pr review 101 --approve
gh pr edit 101 --add-label "ssoc,medium"

gh pr review 93 --approve
gh pr edit 93 --add-label "ssoc,hard"

gh pr review 81 --approve
gh pr edit 81 --add-label "ssoc,hard"

gh pr review 70 --request-changes -b "Awesome initiative on centralizing the error handling! I noticed one critical issue in `app.js` though. The `notFoundHandler` is placed *before* the static file serving and the React catch-all route (`app.get("/*")`). This means in production, any request to load the frontend will be intercepted by the 404 handler and return a JSON error instead of the React app. Could you move the error handlers to the very bottom, *after* the static file serving block?"
gh pr edit 70 --add-label "ssoc,medium"

gh pr review 65 --approve
gh pr edit 65 --add-label "ssoc,hard"
