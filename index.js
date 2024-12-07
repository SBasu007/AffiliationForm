import express from "express";
import bodyParser from "body-parser";
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req,res) => {
    res.render("index.ejs")
  });
app.post("/submit", async (req, res) => {
    try {
      const formData = req.body;
      function postDate() {
        const d = new Date();
        let date = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
        return date;
        }; 
      const name = formData.institution_name+"_affiliation_form"  
      // Generate PDF from HTML layout
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${name}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h2, h4 { text-align: center; }
              .form-group { margin-bottom: 10px; }
              .form-group label { font-weight: bold; }
              .form-group input, .form-group textarea { width: 100%; }
              ol{
                font-size:11.5px;
              }
          </style>
      </head>
      <body>
          <h2>Calcutta Talent Search School</h2>
          <h4 style="margin:auto;background-color:red; width:fit-content; color:white">APPLICATION FORM FOR AFFILIATION</h4>
          <p><strong>Institution Name:</strong> ${formData.institution_name}</p>
          <p><strong>Address:</strong> ${formData.address}</p>
          <p><strong>State:</strong> ${formData.state}</p>
          <p><strong>District:</strong> ${formData.district}</p>
          <p><strong>Post Office:</strong> ${formData.post}</p>
          <p><strong>Pincode:</strong> ${formData.pin}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Mobile:</strong> ${formData.mobile}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Foundation Year:</strong> ${formData.foundation_year}</p>
          <p><strong>Approx Students:</strong> ${formData.students}</p>
          <p><strong>Principal Name:</strong> ${formData.principal}</p>
          <p><strong>Principal Address:</strong> ${formData.principal_address}</p>
          <p><strong>Qualification:</strong> ${formData.qualification}</p>
          <p><strong>Mobile (Own):</strong> ${formData.own_mobile}</p>
          <p><strong>Alternative Mobile:</strong> ${formData.alternative_mobile}</p>
          <h4 style="text-align: center; color:#253b70">RULES AND REGULATIONS FOR OPENING OF AN EXAMINATION CENTRE</h4>
            <ol>
                <li>Any Drawing, Painting Institution from any parts of India can seek application in the prescribed form up to Advance Level 10th year.</li>
                <li>To fix an Examination centre, the Institution concerned shall be required to send at least thirty Candidates every year.</li>
                <li>If any Examination centre fails to send any Candidate for the first one year, the centre will lose its affiliation automatically.</li>
                <li>The Registrar/Secretary of Calcutta Talent Search School has the right to refuse or cancel any affiliated centre at their discretion without giving any notice to the centre in charge concerned.</li>
                <li>Affiliation will be granted in the name of the Secretary or in the name of the principal.</li>
                <li>Inspection of an affiliated Institution shall be conducted by a person or persons appointed from time to time by Calcutta Talent Search School for the purpose.</li>
                <li>Calcutta Talent Search School is just holding the Examination for the students of the affiliated centre. Calcutta Talent Search School is not responsible or involved in any legal binding or any other problems related to the affiliated training centre at any time.</li>
                <li>In the event of any act like epidemic, flood, famine, civil disturbance, etc., in a particular part of India, Calcutta Talent Search School will have every right to deviate from the usual procedures or impose any new instruction to the affected centre in the affected area without any prior notice.</li>
                <li>Calcutta Talent Search School Level-wise courses are not recognized by any State Governments, Education Societies, and Education Boards. Please give clear information to the guardians.</li>
                <li>All disputes are subject to Kolkata Jurisdiction.</li>
            </ol>
            <h4 style="margin-left:0px;color:red">DECLARATION</h4>
            <div class="checkbox-group">
                    <div class="declaration">I hereby declare that I/We am are interested to have our Institution affiliated to Calcutta Talent Search School, I/We amare in a position to start an Examination Centre as per your syllabus. We have read your rules and regulations and shall uphold the ideal of Calcutta Talent Search School. The particular regrading mylour institution are given below for your information which are correct and best of mylour knowledge. We assure you to abide by the exisiting rules and regulations or whatever further imposed or amended by Calcutta Talent Search School from time to me.</div>
            </div>
            <input type="checkbox"class="box" name="conditions" style="margin-right:10px" checked required><span style="font-weight:100">   I agree to abide by the declaration mentioned above.</span> 
            <br>
            <p><strong>Date:</strong> ${postDate()}</p>
      
            </body>
      </html>`;

      // Launch Puppeteer to create the PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      // Save PDF locally
      const pdfPath = './'+name+'.pdf';
      fs.writeFileSync(pdfPath, pdfBuffer);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'basudoesbusiness@gmail.com', // Replace with your email
            pass: 'lsdw zflr lexp wzwu'  // Replace with your email password or app password
        }
    });

    const mailOptions = {
        from: 'basudoesbusiness@gmail.com',
        to: 'calcuttatalentsearchschool@gmail.com', // Replace with recipient email
        subject: 'Affiliation Form Submission',
        text: 'Please find the attached affiliation form submission.',
        attachments: [
            {
                filename: name+'.pdf',
                path: pdfPath
            }
        ]
    };

    await transporter.sendMail(mailOptions);

    // Clean up saved PDF file
    fs.unlinkSync(pdfPath);

      res.render("message.ejs",{message:"Form submitted successfully!"});
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while processing your request.');
  }
  });
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });