// There are two config files in the app that need to be changed. The one in root, "config.json" 
// is for the node server and all the settings here will only affect the node server hosting. 
// The email and the password for the sender are set here.

// The other file is in "./src/config.json" and it is used by the sight to point to the server. Just
// add the ip-port location in there to let the website know where to go.

var express =       require('express');
var parser =        require('body-parser');
const nodemailer =  require('nodemailer');
var cors =          require('cors');
var multer =        require('multer');
var upload =        multer({ dest: 'uploads/' })
var fs =            require('fs');
var config =        require("./config.json");

var app = express();

app.use(cors());
app.use(parser.json());

var hostname = config.address;
const port = config.port;

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.hostEmail,
        pass: config.hostEmailPassword
    }

});

app.post('/ado-gradForm/sendEmail', upload.single("file"), function(req, res){
    console.log(req.body);
    
    
    sendEmailGraduate(res,
                      req.file, 
                      req.body.username, 
                      req.body.surname, 
                      req.body.email, 
                      req.body.cellnumber, 
                      req.body.form,
                      req.body.isCitizen,
                      req.body.informAgain,
                      req.body.visa);
})

var sendEmailGraduate = function(res, filePath, username, surname, email, cellnumber, form, isCitizen, informAgain, visa){
    console.log(filePath);
  let mailOptions = {
      from: '"ADO " <' + config.hostEmail + '>', // the transporter email address. i.e. Email which will send the form from website
      to: config.recieverEmail, // replace with proper email. i.e. Email which will receive emails from the website
      subject: form + username + "  " + surname, 
      attachments: [{ 
          content: filePath,
          filename: filePath.originalname
      }],
      text: "Name: " + username + "\n" + 
            "Surname: " + surname + '\n' +
            "Cellnumber: " + cellnumber + '\n' +
            "Email: " + email + '\n' +
            "Inform Again: " + informAgain + '\n' +
            "Citizen: " + isCitizen + '\n' +
            "Valid Visa: " + visa + '\n' 
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
          res.statusCode = 400;
          res.statusMessage="failed";
          res.send(false);
      }else {
          res.statusCode = 200;
          res.statusMessage="success";
          res.send(true);
          console.log('Message %s sent: %s', info.messageId, info.response);
      }
      fs.unlink(filePath.path, (err) => {
          if (err) {
              console.log("Some error has occurred: " + err);
          } else {
              console.log("Succesfully deleted the file: " + filePath.path);
          }
      })
  });
}

app.post('/ado-vacationForm/sendEmail', function(req, res){
   console.log(req.body);
    
    sendEmailVacation(res,
                      req.body.textBlock, 
                      req.body.username, 
                      req.body.surname, 
                      req.body.email, 
                      req.body.cellnumber, 
                      req.body.form,
                      req.body.informAgain);
})

var sendEmailVacation = function(res, textBlock, username, surname, email, cellnumber, form, informAgain){

  let mailOptions = {
        from: '"ADO " <' + config.hostEmail + '>', // the transporter email address. i.e. Email which will send the form from website
        to: config.recieverEmail, // replace with proper email. i.e. Email which will receive emails from the website
        subject: form + username + " " + surname, 
        text: "Name: " + username + "\n" + 
              "Surname: " + surname + '\n' +
              "Cellnumber: " + cellnumber + '\n' +
              "Email: " + email + '\n' +
              "Inform Again: " + informAgain + '\n' + 
              "Additional Text: \n" + textBlock + '\n'
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
          res.statusCode = 400;
          res.statusMessage="failed";
          res.send(false);
      } else {
          res.statusCode = 200;
          res.statusMessage="success";
          res.send(true);
          console.log('Message %s sent: %s', info.messageId, info.response);
      }
  });
}


app.listen(port, hostname);

console.log('Listening at http://' + hostname + ":" + port)
