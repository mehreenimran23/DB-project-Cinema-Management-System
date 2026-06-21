# CineVerse Studios

This version of the project is fully runnable without SQL Server or MySQL.

## What changed

- The backend was rebuilt into a self-contained Node server that serves the frontend and API together.
- The booking flow now works across movie details, login, ticket selection, seat selection, snacks, payment, and thank you pages.
- Local JSON seed data is used instead of a database so the project works immediately and is easier to deploy for a first project demo.
- Ratings, tickets, seat reservations, bookings, and payments are stored in `Backend/data/data.json`.

## Run locally

1. Open a terminal in `Backend`.
2. Run `node home.js`.
3. Open [http://localhost:3002/cineverse.html](http://localhost:3002/cineverse.html).

## Demo login

- Email: `demo@cineverse.com`
- Password: `demo123`

You can also create a new account from the signup page.

## Notes

- No extra database install is needed right now.
- Payment is a demo flow suitable for project presentation and deployment practice.
- If you want, this can be upgraded later to MySQL, SQL Server, Stripe, or another real payment/database stack.
