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
    const TEMPLATE = "notificacao_servicos"
    let FLOW = ""

    // PIPELINE COMERCIAL: 10015005   FECHAMENTO DE NEGÓCIO (ÚLTIMO ESTÁGIO): 10075648
    // PIPELINE DE TESTE: 50000676    ETAPA 3 (ÚLTIMO ESTÁGIO): 50000676
    // PIPELINE DE SERVIÇOS NACIONAIS: 10015007
    if (pipelineId === 10015005) {
      FLOW = "Notificação de atualização no estado do serviço";
    } else if (pipelineId === 10015007) {
      FLOW = "Outro fluxo de notificação";
    } else {
      // Se for diferente desses dois pipelines, não fazer nada
      return res.status(200).send('Pipeline ID não corresponde. Nenhuma ação necessária.');
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

app.post('/calls', async (req, res) => {
  try {

    function secondsToMinutes(durationInSeconds) {
      // Divida a duração em segundos pelo número de segundos em um minuto (60)
      const minutes = Math.floor(durationInSeconds / 60);
      // O resto da divisão são os segundos restantes
      const seconds = durationInSeconds % 60;
      // Retorne a duração formatada como "minutos:segundos"
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  function getCurrentDateTime() {
    const now = new Date();
  
    // Definir o fuso horário para Brasília
    const options = { timeZone: 'America/Sao_Paulo' };
  
    // Formatar a data e hora atual no fuso horário de Brasília
    const brazilDateTime = now.toLocaleString('en-US', options);
  
    // Converter a data e hora para uma string ISO 8601
    const isoDateTime = new Date(brazilDateTime).toISOString();
  
    // Retornar a data e hora formatada no formato ISO 8601
    return isoDateTime;
  }
  
  function formatDateTime(inputDateTime) {
    // Divide a string da data e hora em partes
    const parts = inputDateTime.split(' ');
    const datePart = parts[0];
    const timePart = parts[1];
  
    // Divide a parte da data em partes
    const dateParts = datePart.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
  
    // Retorna a data no formato desejado
    return `${day}/${month}/${year} - ${timePart.substring(0, 5)}`;
  }
  
      const phoneNumber = req.body.logentry.origin_formatted;
      const audioRecord = req.body.logentry.audio_record;
      const consumerCalled = req.body.logentry.first_call_consumer;
      const duration = req.body.logentry.duration;
      const callDateTz = req.body.logentry.date_answer_tz.date;
      const callDate = formatDateTime(callDateTz)
      const callDuration = secondsToMinutes(duration)
      let callType;
      if (consumerCalled === 0) {
        callType = 'Ligação Realizada'    
      } else {
        callType = 'Ligação Recebida'
      }
  
      axios.get(`https://api2.ploomes.com/Contacts?$expand=Phones&$filter=Phones/any(phone: phone/PhoneNumber eq '${phoneNumber}')&$orderby=TypeId desc`, {
          headers: {
              'User-Key': process.env.PLOOMES_USER_KEY
          }
      })
      .then(response => {
        
  
        if (response.data.value.length === 0) {
          console.log('Contato não presente na lista.');
          return; // Não prossiga se não houver nenhum contato encontrado
        }

        const contact = response.data.value[0];
          
        const dateNow = getCurrentDateTime();
  
        const interactionRecord = {
          "ContactId": contact.Id,
          "DealId": null,
          "Date": dateNow,
          "Content": `${callType}: ${audioRecord}\nDuração: ${callDuration}\nData: ${callDate}`,
          "TypeId": contact.TypeId,
          "OtherProperties": [
              {
                  "FieldKey": "interaction_record_250E00F0-0DF7-4026-96F8-9029A7D76D8F",
                  "IntegerValue": 13
              }
          ]
        }
  
        axios.post('https://api2.ploomes.com/InteractionRecords', interactionRecord, {
        headers: {
            'User-Key': process.env.PLOOMES_USER_KEY
            }
        })
        .then(response => {
            console.log('Registro de interação registrado com sucesso:', response.data);
            return res.status(200).send('Registro de interação registrado com sucesso.');
        })
        .catch(error => {
            console.error('Erro ao criar registro de interação:', error.response.data);
            return res.status(500).send('Erro ao criar registro de interação');
        });
    
      })
      .catch(error => {
          console.error('Erro ao buscar o contato:', error);
          return res.status(500).send('Erro ao buscar o contato');
      });


  } catch (error) {
    console.error('Erro ao processar a requisição:', error.message);
    return res.status(500).send('Erro ao processar a requisição');
  }
});

app.post('/ploomeswin', async (req, res) => {
  try {
    const { ContactName, FinishDate, PipelineId, Title } = req.body.New;

    if (PipelineId !== 50000676) {
      return res.status(200).send('Pipeline ID não corresponde. Nenhuma ação necessária.');
    }

    console.log('Card ganho no Pipeline de Testes');
    res.status(200).send('Processando a requisição...'); // Resposta imediata ao webhook

    const response = await axios.get(`https://api.clickup.com/api/v2/list/901103087671/task`, {
      headers: {
        'Authorization': 'pk_75429419_ZT8345CO82TTH22D2MZJXN3QVRUXP7OA',
      },
      params: {
        custom_fields: `[{"field_id":"e1f8157c-af5d-455a-b6c8-07771c482779", "value": "${ContactName}", "operator": "="}]`
      }
    });

    if (response.data && response.data.tasks && Array.isArray(response.data.tasks)) {
      const tasks = response.data.tasks;
      if (tasks.length === 0) {
        console.error('Nenhuma tarefa encontrada');
        return;
      }

      const taskId = tasks[0].id;
      const cardEndDateInMilliseconds = new Date(FinishDate).getTime();

      const requestBody = {
        "name": Title,
        "due_date": cardEndDateInMilliseconds,
      };

      await axios.put(`https://api.clickup.com/api/v2/task/${taskId}`, requestBody, {
        headers: {
          'Authorization': 'pk_75429419_ZT8345CO82TTH22D2MZJXN3QVRUXP7OA',
        }
      });

      console.log('[/ploomeswin] Card concluído!');
    } else {
      console.error('Resposta da API não está no formato esperado');
    }
  } catch (error) {
    console.error('Erro ao processar requisição /ploomeswin:', error.message);
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
