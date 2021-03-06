var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');

// If modifying these scopes, delete your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Change token directory to your system preference
// var TOKEN_DIR = ('credentials/');
// var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';
var TOKEN_PATH = 'gmailToken.json';
var gmail = google.gmail('v1');
runGmail();
function runGmail(){
    // Load client secrets from a local file.
    fs.readFile('credentials/gmailCredentials.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    //   authorize(JSON.parse(content), listLabels);
    authorize(JSON.parse(content), getRecentEmail);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
 
    var OAuth2 = google.auth.OAuth2;
 
    var oauth2Client = new OAuth2(clientId, clientSecret,  redirectUrl);
 
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) return getAccessToken(oauth2Client, callback);
        oauth2Client.setCredentials(JSON.parse(token));
        callback(oauth2Client);
    });
}
 
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES});
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
 
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
    //   callback(oauth2Client);
    });
  });
}
 
/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
//   try {
//     fs.mkdirSync(TOKEN_DIR);
//   } catch (err) {
//     if (err.code != 'EEXIST') {
//       throw err;
//     }
//   }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}
 
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  gmail.users.labels.list({auth: auth, userId: 'me',}, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
 
    var labels = response.data.labels;
 
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('%s', label.name);
      }
    }
  });
}
/**
 * Get the recent email from your Gmail account
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getRecentEmail(auth) {
    // Only get the recent email - 'maxResults' parameter
    // var ul = document.createElement("ul");
    // var ul = document.getElementById("gmailUL");
    // ul.innerHTML = " ";
    document.getElementById("gmailT").innerHTML = "";
    gmail.users.messages.list({auth: auth, userId: 'me', maxResults: 5,}, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
 
        
        // Get the message id which we will need to retreive tha actual message next.
        response['data']['messages'].forEach(element => {
            var message_id = element['id'];

            gmail.users.messages.get({auth: auth, userId: 'me', 'id': message_id}, function(err, response) {
                if (err) {
                  console.log('The API returned an error: ' + err);
                  return;
                }
                response.data.labelIds.forEach(element => {
                    if (element=='UNREAD'){
                        var subject="";
                        var from="";
                        var date="";
                        // console.log(response.data);
                        response.data.payload.headers.forEach(element => {
                            if (element['name']=='From'){
                                from = element['value'];
                            }
                            if (element['name']=='Subject'){
                                subject = element['value'];
                            }
                            if (element['name']=='Date'){
                                date = element['value'];
                            }
                        });

                        var snippet = response.data.snippet;
                        var mailText = "From:" + from + " Subject: " + subject;

                        var tr = document.createElement("tr");
                        var tdFrom = document.createElement("td");
                        tdFrom.appendChild(document.createTextNode(from));
                        tr.appendChild(tdFrom);

                        var tdSubject = document.createElement("td");
                        tdSubject.appendChild(document.createTextNode(subject));
                        tr.appendChild(tdSubject);

                        var tdDate = document.createElement("td");
                        tdDate.appendChild(document.createTextNode(date));
                        tr.appendChild(tdDate);

                        document.getElementById('gmailT').appendChild(tr);
                    }
                });
                
          });
            
        });
    });
       
    // document.getElementById("gmailUL").appendChild(ul);
}