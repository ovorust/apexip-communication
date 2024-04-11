require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { format } = require('date-fns');
const fetch = require('node-fetch');

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

function ajustaDescricaoPagamento(descricao) {
  if (descricao.includes("Parcela")) {
    // Extrai o texto após a pontuação usando uma expressão regular
    const match = descricao.match(/\. (.+)/);
    
    // Se houver uma correspondência na expressão regular
    if (match) {
      // Captura o texto após a pontuação
      descricao = match[1];
    }
  }
  return descricao
}

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
    let TEMPLATE = ""
    let FLOW = ""

    // Comercial (Clientes NACIONAIS): 10015005   FECHAMENTO DE NEGÓCIO (ÚLTIMO ESTÁGIO): 10075648
    // PIPELINE DE TESTE: 50000676    ETAPA 3 (ÚLTIMO ESTÁGIO): 50000676
    // Serviços (Clientes NACIONAIS): 10015007
    if (pipelineId === 10015005) {
      TEMPLATE = "notificacao_servicos"
      FLOW = "Notificação de atualização no estado do serviço";
    } else if (pipelineId === 10015007) {
      FLOW = "Notificação de atualização no estado do serviço nacional";
      TEMPLATE = "notificacao_servicos_nacionais"
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
          text: `Olá,\n\nGostaríamos de informar que o serviço "${dealTitle}" já está em andamento.\n\nEm breve, você receberá atualizações sobre o status do caso.\n\nCaso tenha alguma dúvida, sinta-se à vontade para entrar em contato.\n\nAgradecemos a sua confiança!\nEquipe Apex Marcas e Patentes`,
          html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Olá, <strong>${contactName}</strong></p>
              <p style="font-size: 18px;"><strong>Gostaríamos de informar que o serviço "${dealTitle}" já está em andamento.</strong></p>
              <p style="font-size: 18px;">Em breve, você receberá atualizações sobre o status do caso.</p>
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

    // PIPELINE COMERCIAL (NACIONAL)
    if (PipelineId !== 10015005) {
      return res.status(200).send('Pipeline ID não corresponde. Nenhuma ação necessária.');
    }

    res.status(200).send('Processando a requisição...'); // Resposta imediata ao webhook

    const response = await axios.get(`https://api.clickup.com/api/v2/list/901103087671/task`, {
      headers: {
        'Authorization': process.env.API_CLICKUP,
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
        "notify_all": false,
        "status": "Complete"
      };

      await axios.put(`https://api.clickup.com/api/v2/task/${taskId}`, requestBody, {
        headers: {
          'Authorization': process.env.API_CLICKUP,
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

app.post('/ploomesnew', async (req, res) => {
  try {
    const { ContactName, PipelineId, Title } = req.body.New;

    // PIPELINE COMERCIAL (NACIONAL)
    if (PipelineId !== 10015005) {
      return res.status(200).send('Pipeline ID não corresponde. Nenhuma ação necessária.');
    }

    res.status(200).send('Processando a requisição...'); // Resposta imediata ao webhook

    const requestBody = {
      "name": Title,
      "assignees": [],
      "tags": ["ploomes"],
      "status": "To do",
      "due_date_time": false,
      "start_date_time": false,
      "notify_all": false,
      "parent": null,
      "links_to": null,
      "check_required_custom_fields": true,
      "custom_fields": [
      {
      "id": "e1f8157c-af5d-455a-b6c8-07771c482779",
      "value": ContactName
      }
      ]
      };

    await axios.post(`https://api.clickup.com/api/v2/list/901103087671/task`, requestBody, {
      headers: {
        'Authorization': 'pk_75429419_ZT8345CO82TTH22D2MZJXN3QVRUXP7OA',
      }
    });

    console.log('[/ploomesnew] Card criado!');
  } catch (error) {
    console.error('Erro ao processar requisição /ploomesnew:', error.message);
  }
});

app.post('/asaaspagamento', async (req, res) => {
  try {
    const event = req.body.event;
    const payment = req.body.payment;

    const PIPELINE_COMERCIAL_NACIONAL = 10015005;
    const PIPELINE_TESTE = 50000676;
    const newStage = 10075648; // ETAPA 3 50003845    FECHAMENTO DO NEGÓCIO 10075648

    const dataAtual = new Date();
    const dataFormatada = format(dataAtual, 'dd/MM/yyyy');  

    const pagoTrue = {
      "OtherProperties": [
        {
            "FieldKey": "deal_6DE22E98-7388-470D-9759-90941364B71D",
            "StringValue": "Aprovado"
        }
      ]
    };

    const aplicarDataCobranca = {
      "OtherProperties": [
        {
            "FieldKey": "deal_5F5D9E86-F0DF-4063-AD70-7FF2F9F2F7C9",
            "StringValue": dataFormatada
        }
      ]
    }

    const nextStage = {
      "StageId": newStage
    };

    if (event === "PAYMENT_CREATED") {
      const idCardCobranca = ajustaDescricaoPagamento(payment.description)
      const response = await axios.get(`https://api2.ploomes.com/Deals?$filter=PipelineId eq ${PIPELINE_COMERCIAL_NACIONAL} and Id eq ${idCardCobranca}`, {
        headers: {
          'User-Key': process.env.PLOOMES_USER_KEY
        }
      });

      console.log(response.data)

      if (response.data.value && response.data.value.length > 0) {
        const dealId = response.data.value[0].Id;

        await axios.patch(`https://api2.ploomes.com/Deals(${dealId})`, aplicarDataCobranca, {
          headers: {
            'User-Key': process.env.PLOOMES_USER_KEY
          }
        });
        console.log('[/asaaspagamento] Pagamento criado e data de cobrança definida.');
      } else {
        console.log('[/asaaspagamento] Nenhum negócio encontrado com a descrição fornecida.');
        return res.status(200).send('Nenhum negócio encontrado com a descrição fornecida.');
      }
    }

    if (event === "PAYMENT_RECEIVED") {
      console.log('[/asaaspagamento] Pagamento recebido');
      const idCardCobranca = ajustaDescricaoPagamento(payment.description)

      const response = await axios.get(`https://api2.ploomes.com/Deals?$filter=PipelineId eq ${PIPELINE_COMERCIAL_NACIONAL} and Id eq ${idCardCobranca}`, {
        headers: {
          'User-Key': process.env.PLOOMES_USER_KEY
        }
      });

      if (response.data.value && response.data.value.length > 0) {
        const dealId = response.data.value[0].Id;

        await axios.patch(`https://api2.ploomes.com/Deals(${dealId})`, pagoTrue, {
          headers: {
            'User-Key': process.env.PLOOMES_USER_KEY
          }
        });

        // await axios.patch(`https://api2.ploomes.com/Deals(${dealId})`, nextStage, {
        //   headers: {
        //     'User-Key': process.env.PLOOMES_USER_KEY
        //   }
        // });

        console.log('[/asaaspagamento] Pagamento realizado com sucesso!');
      } else {
        console.log('[/asaaspagamento] Nenhum negócio encontrado com a descrição fornecida.');
        return res.status(200).send('Nenhum negócio encontrado com a descrição fornecida.');
      }
    }

      

      return res.status(200).send('Processo finalizado com sucesso.');
    } catch (error) {
      console.error('[/asaaspagamento] Erro ao processar requisição /asaaspagamento:', error.message);
      return res.status(200).send('Erro ao processar a requisição.');
    }
});

let lastProcessedEvent = null; // Variável para armazenar o último evento processado

app.post('/asaascriacaopagamento', async (req, res) => {
  try {
    const { Title, PipelineId, StageId, ContactName, Amount, Id } = req.body.New;
    const oldStageId = req.body.Old.StageId
    let formaDePagamento;
    const STAGE_FECHAMENTO_DO_NEGOCIO = 10075648;
    
    let parcelas;
    // Verificar se o StageId é igual ao estágio específico    STAGE: FECHAMENTO DO NEGOCIO = 10075648
    if (StageId !== STAGE_FECHAMENTO_DO_NEGOCIO || oldStageId === StageId) {
      // console.log('[/asaascriacaopagamento] Pipeline não correspondente.')
      return res.status(200).send('Pipeline não correspondente.')
    }

    // Verificar se o evento atual é o mesmo que o último evento processado
    if (lastProcessedEvent === JSON.stringify(req.body)) {
      console.log('[/asaascriacaopagamento] Este evento já foi processado.')
      return res.status(200).send('Este evento já foi processado.');
    }

    // Armazenar o evento atual como o último evento processado
    lastProcessedEvent = JSON.stringify(req.body);

    function getCurrentDate(addDays = 0) {
      const today = new Date();
      today.setDate(today.getDate() + addDays);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // const response = await axios.get(`https://api2.ploomes.com/Deals?$expand=OtherProperties&$filter=Title+eq+'${Title}'`, {
    //   headers: {
    //     'User-Key': process.env.PLOOMES_USER_KEY
    //   }
    // });

    const clienteGet = await axios.get(`https://api.asaas.com/v3/customers?name=${ContactName}`, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    })

    const dealGet = await axios.get(`https://api2.ploomes.com/Deals?$expand=OtherProperties&$filter=Id+eq+${Id}&$select=OtherProperties`, {
          headers: {
              'Accept': 'application/json',
              'User-Key': process.env.PLOOMES_USER_KEY
          }
      });

      // Verifique se há dados na resposta
      if (dealGet.data && dealGet.data.value && dealGet.data.value.length > 0) {
        const deals = dealGet.data.value;
        parcelas = deals[dealGet.data.value.length - 1]['OtherProperties'].find(deal => deal.FieldKey === 'deal_0CDE1351-1AE7-4EC6-BEC6-51B6D6103356').ObjectValueName;
        formaDePagamento = deals[dealGet.data.value.length - 1]['OtherProperties'].find(deal => deal.FieldKey === 'deal_A856FC68-9D24-4D0F-99E4-E7553A97D4CF').ObjectValueName.toUpperCase();

        if (formaDePagamento === 'CARTÃO DE CRÉDITO') {
          formaDePagamento = 'CREDIT_CARD'
        } else if (formaDePagamento === undefined) {
          formaDePagamento = 'UNDEFINED'
        }

        if (parcelas === 'À vista (1x)' || parcelas === undefined) {

          parcelas = 0 // Deve ser 0 porque na Asaas 0 parcelas significa "À Vista"
        } else {
          parcelas = parseInt(parcelas)
        }

    } else {
        console.log("[/asaascriacaopagamento] Nenhum dado de pagamento encontrado.");
        return res.status(200).send('Cobrança realizada.');
    }

    const idCliente = clienteGet.data.data[0].id

   const data = {
      billingType: formaDePagamento,
      customer: idCliente,
      value: Amount,
      description: String(Id),
      installmentCount: parcelas,
      totalValue: Amount,
      dueDate: getCurrentDate(7)
    };

    const mailOptions = {
      from: '"Apex Propriedade Intelectual" <no-reply@apexipartners.com>',
      to: 'financeiro@apexip.com',
      subject: 'Confirmação de Cobrança',
      text: `Cobrança criada para o cliente ${ContactName}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
          <p style="font-size: 18px;><strong>Confirmação de Cobrança</strong></p>
          <p style="font-size: 18px;">Cobrança criada para o cliente <strong>${ContactName}</strong>.</p>
          <p style="font-size: 16px;">Descrição da Cobrança: ${Title}</p>
          <p style="font-size: 16px;">Valor: ${Amount}</p>
          <p style="font-size: 16px;">Forma de Pagamento: ${formaDePagamento}</p>
          <p style="font-size: 16px;">Data de Criação: ${getCurrentDate(0)}</p>
        </div>
      `,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(200).send('Erro ao enviar e-mail');
      } else {
        console.log('E-mail enviado: ' + info.response);
        return res.status(200).send('E-mail enviado com sucesso');
      }
    });

    const criarCobranca = await axios.post('https://api.asaas.com/v3/payments', data, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    })

    console.log("[/asaascriacaopagamento] Cobrança criada com sucesso!")

    return res.status(200).send('Cobrança realizada.');
  } catch (error) {
    console.error('[/asaascriacaopagamento] Erro ao processar requisição /asaascriacaopagamento:', error.message);
    return res.status(200).send('Erro ao processar a requisição.');
  }
});


app.post('/stripeinvoice', async (req, res) => {
  try {

    const { ContactName, Amount, PipelineId, Title, StageId } = req.body.New;

    const ETAPA_FINANCEIRA = 10078298;

    // PIPELINE FUNIL SERVIÇOS (EXTERIOR): 10015008      ETAPA FINANCEIRA: 10078298
    if (StageId !== 50003845) {
      return res.status(200).send('Pipeline não correspondente.')
    }

    const valorEmCentavos = Math.round(Amount * 100)

    const customers = await stripe.customers.search({
      query: `name:\'${ContactName}\'`,
    });

    if (customers.data.length == 0) {
      console.log('[/stripeinvoice] Nenhum cliente encontrado na Stripe')
    }

    const customer_id = customers.data[0].id;

    await stripe.invoiceItems.create({
      customer: customer_id,
      amount: valorEmCentavos, // O valor deve ser especificado em centavos (R$1,00)
      currency: 'brl', // Definindo a moeda para Real Brasileiro
      description: Title,
    });

    const invoice = await stripe.invoices.create({
      customer: customer_id,
    });

    console.log('[/stripeinvoice] Invoice criado com sucesso!')


    return res.status(200).send('Processo finalizado com sucesso.');
  } catch (error) {
    console.error('[/stripeinvoice] Erro ao processar requisição /stripeinvoice:', error.message);
    return res.status(200).send('Erro ao processar a requisição.');
  }
});

app.post('/newclient', async (req, res) => {
  try {
    const { Name, CNPJ, CPF } = req.body.New;

    let userPhoneNumber = '';

    const userPhones = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Name eq '${Name}'&$expand=Phones&$orderby=TypeId desc`, {
      headers: {
        'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
      }
    });
  
    if (userPhones.data.value.length > 0 && userPhones.data.value[0].Phones && userPhones.data.value[0].Phones.length > 0) {
      userPhoneNumber = userPhones.data.value[0].Phones[0].SearchPhoneNumber.toString();
    } else {
      console.log('A lista de Phones está vazia ou o caminho está incorreto.');
    }

    const getContacts = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Name+eq+'${Name}'`, {
      headers: {
        'User-Key': process.env.PLOOMES_USER_KEY
      }
    });

    const emailContacts = getContacts.data.value[0].Email
    const endereco = getContacts.data.value[0].StreetAddress
    const numeroEndereco = getContacts.data.value[0].StreetAddressNumber
    const bairro = getContacts.data.value[0].Neighborhood
    const complemento = getContacts.data.value[0].StreetAddressLine2
    const CEP = getContacts.data.value[0].ZipCode
    
    
    

    const customer = await stripe.customers.create({
      name: Name,
      email: emailContacts,
    });
    console.log('[/newclient] Cliente cadastrado com sucesso na Stripe')

    // ENDPOINT DO SANDBOX: https://sandbox.asaas.com/api/v3/customers


const url = 'https://api.asaas.com/v3/customers';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
    },
    data: {
      name: Name,
      cpfCnpj: CNPJ || CPF,
      email: emailContacts || '',
      mobilePhone: userPhoneNumber,
      address: endereco,
      addressNumber: numeroEndereco,
      province: bairro,
      complement: complemento,
      postalCode: String(CEP),
      }
  };

  try {
    const response = await axios(url, options);

    const notificacoesGet = await axios.get(`https://api.asaas.com/v3/customers/${response.data.id}/notifications`, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    });

    const paymentDueDateWarnings = notificacoesGet.data.data.filter(notification => notification.event === 'PAYMENT_DUEDATE_WARNING');
    const paymentOverdue = notificacoesGet.data.data.filter(notification => notification.event === 'PAYMENT_OVERDUE');
    const paymentCreated = notificacoesGet.data.data.filter(notification => notification.event === 'PAYMENT_CREATED');

    const url_notifications = 'https://api.asaas.com/v3/notifications/batch';
    const options_notifications = {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      },
      body: JSON.stringify({
        customer: response.data.id,
        notifications: [
          {
            id: paymentDueDateWarnings[0].id,
            enabled: true,
            emailEnabledForProvider: true,
            smsEnabledForProvider: false,
            emailEnabledForCustomer: true,
            smsEnabledForCustomer: true,
            phoneCallEnabledForCustomer: false,
            whatsappEnabledForCustomer: false,
            scheduleOffset: 5
          },
          {
            id: paymentOverdue[0].id,
            enabled: true,
            emailEnabledForProvider: true,
            smsEnabledForProvider: false,
            emailEnabledForCustomer: true,
            smsEnabledForCustomer: true,
            phoneCallEnabledForCustomer: false,
            whatsappEnabledForCustomer: false,
          },
          {
            id: paymentCreated[0].id,
            enabled: true,
            emailEnabledForProvider: true,
            smsEnabledForProvider: false,
            emailEnabledForCustomer: true,
            smsEnabledForCustomer: true,
            phoneCallEnabledForCustomer: false,
            whatsappEnabledForCustomer: false,
          },
        ]
      })
    };

    fetch(url_notifications, options_notifications)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    console.log('[/newclient] Cliente cadastrado com sucesso na Asaas');

    // Agora que o cliente foi criado com sucesso, vamos buscar o ID do cliente
    const clienteGet = await axios.get(`https://api.asaas.com/v3/customers?name=${Name}`, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    });

    const idCliente = clienteGet.data.data[0].id;
    console.log(idCliente);
  } catch (error) {
    console.error('[/newclient] Erro ao criar notificação do cliente:', error);
  }
      
    return res.status(200).send('Processo finalizado com sucesso.');
  } catch (error) {
    console.error('[/newclient] Erro ao processar requisição /newclient:', error.message);
    return res.status(500).send('Erro ao processar a requisição.');
  }
});

app.post('/updateclient', async (req, res) => {
  try {
    const { Name, CNPJ, CPF, Email } = req.body.New;

    let userPhoneNumber = '';

    const userPhones = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Name eq '${Name}'&$expand=Phones&$orderby=TypeId desc`, {
      headers: {
        'User-Key': process.env.PLOOMES_USER_KEY
      }
    });

    const endereco = userPhones.data.value[0].StreetAddress
    const numeroEndereco = userPhones.data.value[0].StreetAddressNumber
    const bairro = userPhones.data.value[0].Neighborhood
    const complemento = userPhones.data.value[0].StreetAddressLine2
    const CEP = userPhones.data.value[0].ZipCode

    console.log('CEP: ', CEP)
    console.log('Complemento: ', complemento)
    console.log('Bairro: ', bairro)
    console.log('Numero do Endereço: ', numeroEndereco)
    console.log('Endereço: ', endereco)
  
    if (userPhones.data.value.length > 0 && userPhones.data.value[0].Phones && userPhones.data.value[0].Phones.length > 0) {
      userPhoneNumber = userPhones.data.value[0].Phones[0].SearchPhoneNumber.toString();
    } else {
      console.log('A lista de Phones está vazia ou o caminho está incorreto.');
    }

    const asaasCustomers = await axios.get(`https://api.asaas.com/v3/customers?name=${Name}`, {
      headers: {
        accept: 'application/json',
        access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    });

    const existingCustomer = asaasCustomers.data.data.find(customer => customer.name === Name);

    if (existingCustomer) {
      const customerIdAsaas = existingCustomer.id;

      // Atualizar cliente na Asaas
      const url = `https://api.asaas.com/v3/customers/${customerIdAsaas}`;
      const options = {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
        },
        body: JSON.stringify({
          name: Name,
          cpfCnpj: CNPJ || CPF,
          email: Email,
          mobilePhone: userPhoneNumber,
          address: endereco,
          addressNumber: numeroEndereco,
          province: bairro,
          complement: complemento,
          postalCode: String(CEP)})
      };
      
      fetch(url, options)
        .then(res => console.log('[/updateclient] Cliente atualizado na Asaas com sucesso!'))
        .catch(err => console.error('[/updateclient] Erro ao atualizar cliente Asaas: ' + err));

    } else {
      console.log('[/updateclient] Cliente não encontrado na Asaas');
    }


      
    return res.status(200).send('Processo finalizado com sucesso.');
  } catch (error) {
    console.error('[/updateclient] Erro ao processar requisição /newclient:', error.message);
    return res.status(200).send('Erro ao processar a requisição.');
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
