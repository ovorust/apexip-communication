require('dotenv').config();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const axios = require('axios');

const serviceAccount = require('./ploomes-webhook-firebase-adminsdk-qa6or-63a88d0737.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ploomes-webhook-default-rtdb.firebaseio.com/'
});

const db = admin.database();
const ref = db.ref('/clientes');

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    auth: {
        user: "teste@apexipartners.com",
        pass: "Apex@123",
    },
});

function enviarEmail(email, clientId, dealStatusId, dealTitle, contactName) {
  axios.get(`https://api2.ploomes.com/Deals@Stages?$filter=Id eq ${dealStatusId}`, {
    headers: {
      'User-Key': process.env.PLOOMES_USER_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    const stageTitle = response.data.value[0]?.Name;

    if (!stageTitle) {
      console.log('No deal title found for the given deal status ID.');
      return;
    }

    const mailOptions = {
      from: '"Apex Propriedade Intelectual" <teste@apexipartners.com>',
      to: email,
      subject: 'Atualização de Status do Serviço',
      text: `Olá,\n\nGostaríamos de informar que o seu serviço "${dealTitle}" alcançou o estado de "${stageTitle}".\n\nAtenciosamente,\nEquipe da Apex Propriedade Intelectual`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Olá, <strong>${contactName}</strong></p>
          <p style="font-size: 18px;"><strong>Gostaríamos de informar que o seu serviço "${dealTitle}" alcançou o estado de "${stageTitle}".</strong></p>
          <p style="font-size: 16px;">Atenciosamente,<br>Equipe da Apex Propriedade Intelectual</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions)
      .then(() => {
        console.log(`E-mail enviado para: ${email}`);
        ref.child(clientId).remove()
        .then(() => console.log(`Cliente ${clientId} removido com sucesso.`))
        .catch((error) => console.error('Erro ao remover cliente:', error))
        .finally(() => {
          ref.once('value', (snapshot) => {
            if (snapshot.numChildren() === 0) {
              ref.set('');
            }
          });
        });

      })
      .catch((error) => console.error('Erro ao enviar e-mail:', error));
  })
  .catch(error => {
    console.error('Erro ao obter o título do estágio do negócio:', error);
  });
}

ref.on('child_added', (snapshot) => {
  const clientId = snapshot.key;
  const newClientData = snapshot.val();

  const contactId = newClientData?.New?.ContactId;
  const contactName = newClientData?.New?.ContactName;
  const dealTitle = newClientData?.New?.Title;
  const dealStatusId = newClientData?.New?.StageId;
  const pipelineId = newClientData?.New?.PipelineId;

  if (!contactId) {
    console.log('No contact ID found for new client.');
    return;
  }

  if (pipelineId != '10015005') {
    console.log(`Pipeline ID ${pipelineId} is not the required pipeline for sending email. Removing client ${clientId} from database.`);
    ref.child(clientId).remove()
      .then(() => console.log(`Cliente ${clientId} removido com sucesso.`))
      .catch((error) => console.error('Erro ao remover cliente:', error));
    return;
  }

  axios.get(`https://api2.ploomes.com/Contacts?$filter=Id eq ${contactId}&$select=Email`, {
    headers: {
      'User-Key': process.env.PLOOMES_USER_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    const email = response.data.value[0]?.Email;

    if (!email) {
      console.log('No email address found for the contact.');
      return;
    }

    // enviarEmail(email, clientId, dealStatusId, dealTitle, contactName);
    
    console.log('Supostamente enviou o email para ', clientId)
    ref.child(clientId).remove()
  })
  .catch(error => {
    console.error('Erro ao obter o endereço de e-mail do contato:', error);
  });
});
