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
    const personName = req.body.New.PersonName;
    const dealTitle = req.body.New.Title;
    const pipelineId = req.body.New.PipelineId;
    const TEMPLATE = "notificar_cliente"
    const FLOW = "Notificação de atualização no estado do serviço"

    const action = req.body.Action;

    let resposta;

    switch (action) {
      case 'Win':
        resposta = 'ganho';
        break;
      case 'Lose':
        resposta = 'perdido';
        break;
      default:
        resposta = 'Ação desconhecida';
    }
    // PIPELINE COMERCIAL: 10015005
    // PIPELINE DE TESTE: 50000676
    if (pipelineId !== 50000676 && stageId !== 50003845) {
      console.log('Pipeline ou Stage não correspondente')
      return res.status(200).send('Pipeline ID ou Stage não corresponde. Nenhuma ação necessária.');
    }
    


    if (!contactId || !stageId) {
      throw new Error('Contact ID or Stage ID not found in the request payload.');
    }

    // Requisição para obter o e-mail do contato
    const contactInfo = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Id eq ${contactId}&$expand=Phones&$orderby=TypeId desc`, {
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
      const stageTitle = stageInfo.data.value[0].Name;

      const phone = '+55 ' + contactInfo.data.value[0]?.Phones[0]?.PhoneNumber;


      const converx = {
        "name": personName,
        "phone": phone,
        "account": 196,
        "template": TEMPLATE,
        "inbox_id": 605,
        "parameter_1": personName,
        "parameter_2": dealTitle,
        "parameter_3": resposta,
        "flow": FLOW
      }

      console.log(resposta)
  
      await axios.post('https://southamerica-east1-converx-hobspot.cloudfunctions.net/send_template', converx)
      .then((response) => {
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error.response.data);
      });


      if (email && stageTitle) {
        // Configuração da mensagem de e-mail
        const mailOptions = {
          from: '"Apex Propriedade Intelectual" <teste@apexipartners.com>',
          to: email,
          subject: 'Atualização de Status do Serviço',
          text: `Olá,\n\nGostaríamos de informar que o seu serviço "${dealTitle}" alcançou o estado de ${resposta}.\n\nAtenciosamente,\nEquipe da Apex Propriedade Intelectual`,
          html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Olá, <strong>${contactName}</strong></p>
              <p style="font-size: 18px;"><strong>Gostaríamos de informar que o seu serviço "${dealTitle}" foi ${resposta}.</strong></p>
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
