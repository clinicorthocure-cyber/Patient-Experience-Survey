# Orthocure Patient Experience App

## Google Sheets Integration Setup

To connect this app to Google Sheets, follow these steps:

1.  Create a new Google Sheet.
2.  Go to **Extensions > Apps Script**.
3.  Delete any existing code and paste the following:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Create header row if sheet is empty
  if (sheet.getLastRow() == 0) {
    var headers = Object.keys(data);
    sheet.appendRow(headers);
  }
  
  var row = Object.values(data);
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var data = [];
  
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    data.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4.  Click **Deploy > New Deployment**.
5.  Select **Web App**.
6.  Set "Execute as" to **Me**.
7.  Set "Who has access" to **Anyone**.
8.  Copy the **Web App URL** and add it to your `.env` file as `VITE_GOOGLE_SCRIPT_URL`.

## Environment Variables
VITE_GOOGLE_SCRIPT_URL=yhttps://script.google.com/macros/s/AKfycbyF2kv6HX_l5PSX84InQ6G4kZxipYgLO7uJmC950p-yfNPewAeTlaXGZihfAllKFRdx/exec
DASHBOARD_PASSWORD=your_password_here
