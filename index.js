const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const axios = require('axios'); // Importar o módulo Axios

// Substitua o caminho abaixo pelo caminho do seu arquivo de credenciais do Firebase
const serviceAccount = require('./ploomes-webhook-firebase-adminsdk-qa6or-63a88d0737.json'); // Certifique-se de que o caminho até o arquivo JSON de credenciais está correto

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ploomes-webhook-default-rtdb.firebaseio.com/'
});

const db = admin.database();
const ref = db.ref('/clientes');

// Configure o Nodemailer com suas configurações de SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    auth: {
        user: "teste@apexipartners.com", // Seu usuário SMTP
        pass: "Apex@123", // Sua senha SMTP
    },
});

// Função para enviar e-mail
function enviarEmail(email, clientId, dealStatusId, dealTitle, contactName) {
  // Faz a solicitação para a API Ploomes
  axios.get(`https://api2.ploomes.com/Deals@Stages?$filter=Id eq ${dealStatusId}`, {
    headers: {
      'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E',
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
        // Após o envio do e-mail, remover apenas o cliente específico
        ref.child(clientId).remove()
        .then(() => console.log(`Cliente ${clientId} removido com sucesso.`))
        .catch((error) => console.error('Erro ao remover cliente:', error))
        .finally(() => {
          // Verifica se o nó "/clientes" está vazio e, em caso afirmativo, adiciona um marcador
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

// Ouvir por novos clientes adicionados
ref.on('child_added', (snapshot) => {
  const clientId = snapshot.key; // Captura o ID único do cliente
  const newClientData = snapshot.val(); // Acessa os dados do cliente

  const contactId = newClientData?.New?.ContactId;
  const contactName = newClientData?.New?.ContactName;
  const dealTitle = newClientData?.New?.Title;
  const dealStatusId = newClientData?.New?.StageId;

  if (!contactId) {
    console.log('No contact ID found for new client.');
    return;
  }

  // Faz a solicitação para a API Ploomes para obter o e-mail do contato
  axios.get(`https://api2.ploomes.com/Contacts?$filter=Id eq ${contactId}&$select=Email`, {
    headers: {
      'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E',
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    const email = response.data.value[0]?.Email;

    if (!email) {
      console.log('No email address found for the contact.');
      return;
    }

    // Chama a função para enviar o e-mail
    enviarEmail(email, clientId, dealStatusId, dealTitle, contactName);
  })
  .catch(error => {
    console.error('Erro ao obter o endereço de e-mail do contato:', error);
  });
});
