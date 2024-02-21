require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    auth: {
        user: "teste@apexipartners.com", // Seu usuário SMTP
        pass: "Apex@123", // Sua senha SMTP
    },
});

// Middleware
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  try {
    const contactId = req.body.New.ContactId;
    const stageId = req.body.New.StageId;
    const contactName = req.body.New.ContactName;
    const dealTitle = req.body.New.Title;


    if (!contactId || !stageId) {
      throw new Error('Contact ID or Stage ID not found in the request payload.');
    }

    // Requisição para obter o e-mail do contato
    const contactInfo = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Id eq ${contactId}&$select=Email`, {
      headers: {
        'User-Key': process.env.PLOOMES_USER_KEY
      }
    });

    // Requisição para obter o nome do estágio
    const stageInfo = await axios.get(`https://api2.ploomes.com/Deals@Stages?$filter=Id eq ${stageId}&$select=Name`, {
      headers: {
        'User-Key': process.env.PLOOMES_USER_KEY
      }
    });

    

    if (contactInfo.data && contactInfo.data.value && contactInfo.data.value.length > 0 && stageInfo.data && stageInfo.data.value && stageInfo.data.value.length > 0) {
      const email = contactInfo.data.value[0].Email;
      const stageName = stageInfo.data.value[0].Name;


      if (email && stageName) {
        // Configuração da mensagem de e-mail
        const mailOptions = {
          from: '"Apex Propriedade Intelectual" <teste@apexipartners.com>',
          to: email,
          subject: 'Atualização de Status do Serviço',
          text: `Olá,\n\nGostaríamos de informar que o seu serviço "${dealTitle}" alcançou o estado de "${stageName}".\n\nAtenciosamente,\nEquipe da Apex Propriedade Intelectual`,
          html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Olá, <strong>${contactName}</strong></p>
              <p style="font-size: 18px;"><strong>Gostaríamos de informar que o seu serviço "${dealTitle}" alcançou o estado de "${stageName}".</strong></p>
              <p style="font-size: 16px;">Atenciosamente,<br>Equipe da Apex Propriedade Intelectual</p>
            </div>
          `,
        };

        // Enviar e-mail
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res.status(500).send('Erro ao enviar e-mail');
          } else {
            console.log('E-mail enviado: ' + info.response);
            return res.status(200).send('E-mail enviado com sucesso');
          }
        });
      } else {
        throw new Error('Email or stage name not found in the response data.');
      }
    } else {
      throw new Error('Contact or stage information not found in the response data.');
    }
  } catch (error) {
    console.error('Erro ao processar a requisição:', error.message);
    return res.status(500).send('Erro ao processar a requisição');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
