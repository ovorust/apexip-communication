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
        user: "no-reply@apexipartners.com", // Seu usuário SMTP
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
    const TEMPLATE = "servico_notificacao"
    const FLOW = "Notificação de atualização no estado do serviço"

    // PIPELINE COMERCIAL: 10015005   FECHAMENTO DE NEGÓCIO (ÚLTIMO ESTÁGIO): 10075648
    // PIPELINE DE TESTE: 50000676    ETAPA 3 (ÚLTIMO ESTÁGIO): 50000676
    if (pipelineId !== 10015005) {
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
        "flow": FLOW
      }
  
      await axios.post('https://southamerica-east1-converx-hobspot.cloudfunctions.net/send_template', converx)
      .then((response) => {
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error.response.data);
      });


      if (email && stageTitle) {
        // Configuração da mensagem de e-mail (REMOVIDO <teste@apexipartners.com>)
        const mailOptions = {
          from: '"Apex Propriedade Intelectual" <no-reply@apexipartners.com>',
          to: email,
          subject: 'Atualização de Status do Serviço',
          text: `Olá,\n\nGostaríamos de informar que o serviço "${dealTitle}" já está em andamento.\n\nEm breve, você receberá atualizações o status do caso.\n\nCaso tenha alguma dúvida, sinta-se à vontade para entrar em contato.\n\nAgradecemos a sua confiança!\nEquipe Apex Marcas e Patentes`,
          html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Olá, <strong>${contactName}</strong></p>
              <p style="font-size: 18px;"><strong>Gostaríamos de informar que o serviço "${dealTitle}" já está em andamento.</strong></p>
              <p style="font-size: 18px;">Em breve, você receberá atualizações o status do caso.</p>
              <p style="font-size: 18px;">Caso tenha alguma dúvida, sinta-se à vontade para entrar em contato.</p>
              <p style="font-size: 16px;">Agradecemos a sua confiança!<br>Equipe Apex Marcas e Patentes</p>
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
