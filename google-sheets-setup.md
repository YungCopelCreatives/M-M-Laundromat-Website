# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets to store waitlist sign-ups from your website.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "M&M Laundromats Waitlist" (or any name you prefer)
4. Set up the header row in Row 1 with these columns (in this exact order):
   - **Timestamp**
   - **Name**
   - **Email**
   - **Phone**
   - **Service**
   - **City**
   - **Updates**

## Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Delete any existing code
3. Copy and paste this code:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Add the data to the sheet
    sheet.appendRow([
      data.timestamp,
      data.name,
      data.email,
      data.phone,
      data.service,
      data.city,
      data.updates
    ]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **File** > **Save** (or press Ctrl+S / Cmd+S)
5. Name your project: "M&M Waitlist Handler"

## Step 3: Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Fill in the deployment settings:
   - **Description**: "Waitlist Form Handler" (optional)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important!)
5. Click **Deploy**
6. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Step 4: Update Your Website

1. Open `/js/script.js` in your code editor
2. Find this line (around line 58):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';
   ```
3. Replace `'YOUR_GOOGLE_SCRIPT_URL'` with your Web App URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Save the file

## Step 5: Test It!

1. Visit your website
2. Fill out the sign-up form
3. Submit it
4. Check your Google Sheet - you should see a new row with the data!

## Troubleshooting

### No data appearing in the sheet?
- Make sure you set "Who has access" to **Anyone** when deploying
- Check the Apps Script execution log: **View** > **Executions** in Apps Script
- Make sure the column headers match exactly

### Getting CORS errors?
- The code uses `no-cors` mode, which is normal
- The form will still work even if you see CORS warnings in the console

### Need to update the script?
- After making changes to the Apps Script code, you need to create a **new deployment**
- Go to **Deploy** > **Manage deployments**
- Click the edit icon (✏️) on your deployment
- Click **New version**
- Click **Deploy**

## Alternative: Email Notifications

If you prefer to receive sign-ups via email instead of (or in addition to) Google Sheets:

1. Sign up for [EmailJS](https://www.emailjs.com/) (free tier available)
2. Set up an email template
3. Update the JavaScript code to use EmailJS instead

## Security Note

The Web App URL is public, but it only allows POST requests. For additional security, you can:
- Add a simple token check in the Apps Script
- Use Google Forms as an alternative (less customizable)
- Set up a backend server for more control

---

**Need help?** Check the [Google Apps Script documentation](https://developers.google.com/apps-script)

