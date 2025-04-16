const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

router.post('/', async (req, res) => {
  console.log("THis ran");
  const { name, email, phone, message } = req.body
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
  const mailOptions = {
    from: email,
    to: process.env.CONTACT_EMAIL,
    subject: `Nuevo mensaje de contacto de ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nMensaje: ${message}`
  }
  try {
    await transporter.sendMail(mailOptions)
    res.redirect('/')
  } catch (err) {
    res.status(500).send("Error")
  }
})

module.exports = router
