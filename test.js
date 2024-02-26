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

const TEMPLATE = 'atualizacao_servico';
const FLOW = 'Notificação de Atualização de Serviço'

ref.on('child_added', (snapshot) => {
  const clientId = snapshot.key;
  const newClientData = snapshot.val();

  const contactId = newClientData?.New?.ContactId;
  const contactName = newClientData?.New?.ContactName;
  const dealTitle = newClientData?.New?.Title;
  const dealStatusId = newClientData?.New?.StageId;
  const pipelineId = newClientData?.New?.PipelineId;
  const personName = newClientData?.New?.PersonName;

  if (!contactId) {
    console.log('No contact ID found for new client.');
    return;
  }

  if (pipelineId != '50000676') {
    console.log(`Pipeline ID ${pipelineId} is not the required pipeline for sending email. Removing client ${clientId} from database.`);
    ref.child(clientId).remove()
      .then(() => console.log(`Cliente ${clientId} removido com sucesso.`))
      .catch((error) => console.error('Erro ao remover cliente:', error));
    return;
  }

  axios.get(`https://api2.ploomes.com/Contacts?$filter=Id eq ${contactId}&$expand=Phones&$orderby=TypeId desc`, {
    headers: {
      'User-Key': process.env.PLOOMES_USER_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    const email = response.data.value[0]?.Email;
    let phone = response.data.value[0]?.Phones[0]?.PhoneNumber;

    if (phone.startsWith('(')) {
      // Encontra a posição do parêntese aberto
      const index = phone.indexOf('(');
  
      // Adiciona o caractere '+' após o parêntese aberto
      phone = phone.substring(0, index + 1) + '+' + phone.substring(index + 1);
  }



    if (!email) {
      console.log('No email address found for the contact.');
      return;
    }

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

      // Aqui você pode realizar qualquer ação necessária com os dados obtidos da segunda requisição
      const converx = {
        "name": personName,
        "phone": phone,
        "account": 196,
        "template": TEMPLATE,
        "inbox_id": 605,
        "parameter_1": personName,
        "parameter_2": dealTitle,
        "parameter_3": stageTitle,
        "flow": "Notificação de atualização no estado do serviço"
      }
  
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
  
      console.log(converx)

    })
    .catch(error => {
      console.error('Erro ao obter o título do negócio:', error);
    });

    
    axios.post('https://southamerica-east1-converx-hobspot.cloudfunctions.net/send_template', converx)
    .then((response) => {
      console.log('Response:', response.data);
    })
    .catch((error) => {
      console.error('Error:', error.response.data);
    });

    // Aqui você pode incluir outras ações que deseja realizar após o envio do email, se necessário

  })
  .catch(error => {
    console.error('Erro ao obter o endereço de e-mail do contato:', error);
  });
});
