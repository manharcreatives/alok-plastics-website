# Apps Script setup (email + Google Sheet + resumes in Drive)

1. Open https://script.google.com signed in as the Gmail account that should own the data, then **New project**.
2. Delete the sample code and paste the whole of `alok-forms.local.gs` (the version with the real values filled in; it is not committed to git).
3. Click **Run > authorizeAll** once and approve the Drive, Sheets and Gmail permissions.
4. **Deploy > New deployment > Web app**: *Execute as* **Me**, *Who has access* **Anyone**. Copy the web app URL.
5. In Vercel > Project > Settings > Environment Variables add `SCRIPT_URL` (that URL) and `SCRIPT_SECRET` (the value in `.env.local`), for Production and Preview, then redeploy.

After changing the script, use **Deploy > Manage deployments > Edit > New version** so the same URL keeps working.
