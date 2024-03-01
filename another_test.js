const axios = require('axios');
require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = require('./ploomes-webhook-firebase-adminsdk-qa6or-63a88d0737.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ploomes-webhook-default-rtdb.firebaseio.com/'
});

const db = admin.database();
const ref = db.ref('/calls');

  const converx = {
    "name": "Pessoa Teste Node",
    "phone": "(+54) 99698-2868",
    "account": 196,
    "template": "atualizacao_servico",
    "inbox_id": 605,
    "parameter_1": "Pessoa Teste Node",
    "parameter_2": "Teste",
    "parameter_3": "Etapa 2",
    "flow": "Notificação de atualização no estado do serviço"
  }

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



  const test = {
    "logentry": {
    "account_id": 10929,
    "adgroup_id": 40380,
    "adgroup_name": "Offline",
    "advert_id": 50370,
    "advert_name": "Cartões de Visita",
    "audio_record": "https://storage.googleapis.com/records-partner-001/eab4b256-3295-44da-9b35-3bf7c74cd1d7.wav",
    "b_hangup_cause": "no_answer",
    "b_status": "completed",
    "bill_duration": 60,
    "bill_rate": "0.00000",
    "call_id": "1709240438.2648",
    "call_metadata": {
    "call_duration": "41.220",
    "call_id": "1709240438.2648",
    "call_score": 1,
    "called_talk_pct": "0.00",
    "caller_talk_pct": "0.00",
    "cross_talk_pct": "0.00",
    "gender_consumer_accuracy_pct": "0.00",
    "is_incomplete": true,
    "is_manual_sentiment": false,
    "is_mono": true,
    "last_speaker_agent": "s",
    "manual_gender": false,
    "plead": false,
    "rings_count": 0,
    "rings_count_before": 0,
    "silence_time_sec": 24,
    "wait_time_sec": 43
    },
    "campaign_id": 26599,
    "campaign_name": "Padrão",
    "client_id": 25351,
    "client_name": " APEX PROPRIEDADE INTELECTUAL",
    "date_answer": {
    "date": "29 Feb",
    "time": "18:00:38"
    },
    "date_answer_tz": {
    "date": "2024-02-29 18:00:38.000000",
    "timezone": "America/Sao_Paulo",
    "timezone_type": 3
    },
    "date_end": {
    "date": "29 Feb",
    "time": "18:01:33"
    },
    "date_end_tz": {
    "date": "2024-02-29 18:01:33.000000",
    "timezone": "America/Sao_Paulo",
    "timezone_type": 3
    },
    "date_in": {
    "date": "29 Feb",
    "time": "21:00:38"
    },
    "date_in_tz": {
    "date": "2024-02-29 21:00:38.000000",
    "timezone": "America/Sao_Paulo",
    "timezone_type": 3
    },
    "date_start": {
    "date": "29 Feb",
    "time": "18:00:38"
    },
    "date_start_tz": {
    "date": "2024-02-29 18:00:38.000000",
    "timezone": "America/Sao_Paulo",
    "timezone_type": 3
    },
    "deleted_at": "",
    "destination_formatted": "1018907003",
    "destination_number": "551018907003",
    "dialled_formatted": "+0",
    "dialled_number": "0",
    "duration": 55,
    "failed": 1,
    "first_call_consumer": 0,
    "hangup_cause": "no_answer",
    "id": 70880353,
    "menu_ura": "",
    "origin_formatted": "(54) 93211-3211",
    "origin_number": "5594981022549",
    "origin_number_ignored": 0,
    "player_link": "https://phonetrack.app/public/call-log/details-iframe/1709240438.2648/fb938fa1-d738-11ee-89b0-42010a947809/722a0122c262772eba4f16272ef8be2e",
    "status": "completed",
    "type_call": "O"
    },
    "topic": "client#25351",
    "type": "hangup"
    }

    const phoneNumber = test.logentry.origin_formatted;
    const audioRecord = test.logentry.audio_record;
    const consumerCalled = test.logentry.first_call_consumer;
    const duration = test.logentry.duration;
    const callDateTz = test.logentry.date_answer_tz.date;
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
          console.log('Contato não encontrado.');
          return; // Não prossiga se não houver nenhum contato encontrado
      }
        const contact = response.data.value[0];

        
        const dateNow = getCurrentDateTime();
        //console.log(contact)

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
      })
      .catch(error => {
          console.error('Erro ao criar registro de interação:', error.response.data);
      });
  
    })
    .catch(error => {
        console.error('Erro ao buscar o contato:', error);
    });