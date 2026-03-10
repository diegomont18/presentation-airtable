
  1. Install the Airtable CLI (if you haven't)

  npm install -g @airtable/blocks-cli

  2. Navigate to your extension directory

  cd /Users/user/presentation-airtable/presentation_builder

  3. Create a new custom extension entry in Airtable

  - Open your Airtable base in the browser
  - Click Extensions in the top-right
  - Click Add an extension
  - Choose Build a custom extension
  - Select Remix from GitHub or Build from scratch — either way, Airtable will give you a Block ID and API key

  4. Link your local code to the remote extension

  Run:

  block set-api-key

  It will prompt you for the API key from step 3. Then run:

  block add-remote <blockId> <baseId>

  - blockId — the block identifier shown in the Airtable UI (starts with blk)
  - baseId — your base ID (starts with app, found in the Airtable URL)

  This creates a remote.json file that maps your code to the Airtable extension.

  5. Release (deploy) the extension

  block release

  This will:
  - Bundle your frontend code
  - Upload it to Airtable's servers
  - Make it available to all users of the base

  6. Verify

  - Refresh your Airtable base
  - The extension should now load from Airtable's CDN — no block run or localhost needed

  Notes

  - Every time you make changes, run block release again to publish updates.
  - block run is for development only (localhost). block release is for production.
  - Other collaborators on the base will automatically see the released version.
