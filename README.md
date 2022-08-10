# Bitcoin Price guessing

## Workflow
- User enters username in the form.
- On the guessing page, user can see BTC price which updates by every 5 seconds.
- There are two buttons - "UP" and "DOWN" which are used to guess the rise and fall of BTC price after a minute.
- And below two buttons, there's a table shows the history of user's guessing.
- When user clicks on one of the two buttons, necessary data(user, BTC price at the moment, time,..) is sent to the server.
- Server receives the request and waits 1 minutes before fetching before fetching new BTC price, generating the result of the guess, storing the result on the db and sending the result to the user.
- User receives the response and on the outcome of the guess, the score changes.
- When there's a pending guess, user can't click on both buttons until it is resolved.
- All the data(score, guess history) are stored on the server and persists over a period of time.

## Built with
Next.js for both frontend and backend. Database is just json file which is handled by node-json-db module.

## How to run. 
It's simple. Just run these two commands
```
npm install
npm run dev
```
