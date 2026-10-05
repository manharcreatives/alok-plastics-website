# Google Apps Script: career applications and order log

The PHP endpoints (`/api/career.php`, `/api/order.php`) post to this script from the server, so the web app URL and secret never reach the browser.

## One-time setup

1. Create a Google Sheet for the website forms and copy its ID (the long part of its URL).
2. Create a Drive folder for resumes and copy its ID.
3. In the Google account that should own this, open script.google.com, create a project, and paste the contents of `alok-forms.gs`.
4. Project Settings, Script properties, add:
   - `SECRET`: a long random string (also placed in `config.php` as `$ALOK_GAS_SECRET`).
   - `CLIENT_EMAIL`: the address that should receive career applications.
   - `SHEET_ID`: the Sheet ID from step 1.
   - `RESUME_FOLDER_ID`: the folder ID from step 2.
5. Deploy, New deployment, type Web app. Execute as: Me. Who has access: Anyone. Authorise when asked.
6. Copy the web app URL into `public/api/config.php` as `$ALOK_GAS_URL`.

## What happens

- A career application is saved in the admin panel first, then the script appends a row to the `Careers` tab, stores the resume file in the Drive folder and emails the client. If the script is slow or down, the application is still safe in the admin panel.
- Each placed order is appended to the `Orders` tab.
- Requests without the right `SECRET` are rejected.
