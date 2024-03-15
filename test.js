const axios = require('axios')

axios.get(`https://api.clickup.com/api/v2/list/901103087671/task`, {
  headers: {
    'Authorization': 'pk_75429419_ZT8345CO82TTH22D2MZJXN3QVRUXP7OA',
  },
  params: {
    custom_fields: '[{"field_id":"e1f8157c-af5d-455a-b6c8-07771c482779", "value": "501090282", "operator": "="}]'
  }
})
.then(response => {
  // Verificando se a resposta tem a estrutura esperada

  const respostaWebhookCardGanho = {
    "AccountId": 1003788,
    "Action": "Win",
    "ActionUserId": 10025735,
    "Entity": "Deals",
    "New": {
    "Amount": 0,
    "CollaboratingUsers": [
    {
    "UserId": 10025735
    }
    ],
    "ContactId": 501104187,
    "ContactName": "Anselmo",
    "CreateDate": "2024-02-28T12:18:04.737",
    "CreatorId": 50003950,
    "CurrencyId": 1,
    "DaysInStage": 0,
    "FinishDate": "2024-02-28T19:00:01.233",
    "HasScheduledTasks": false,
    "HoursInStage": 0,
    "Id": 501090282,
    "IsLastQuoteApproved": true,
    "LastInteractionRecordId": 503824368,
    "LastStageId": 10087507,
    "LastUpdateDate": "2024-02-28T19:00:01.213",
    "Length": 0,
    "OriginId": 50003697,
    "OtherProperties": {
    "deal_2A81336C-5576-4FAC-ACAF-87977148F98A": 744747
    },
    "OwnerId": 10025735,
    "PipelineId": 10017213,
    "Read": true,
    "StageId": 10087507,
    "StartAmount": 0,
    "StartCurrencyId": 1,
    "StartDate": "2024-02-28T12:18:04.737",
    "StatusId": 2,
    "TasksOrdination": 2,
    "Title": "Novo Lead Convertido (Qualificar)",
    "UpdaterId": 10025735
    },
    "Old": {
    "Amount": 0,
    "CollaboratingUsers": [
    {
    "UserId": 10025735
    }
    ],
    "ContactId": 501104187,
    "ContactName": "Anselmo",
    "CreateDate": "2024-02-28T12:18:04.737",
    "CreatorId": 50003950,
    "CurrencyId": 1,
    "DaysInStage": 0,
    "HasScheduledTasks": false,
    "HoursInStage": 7,
    "Id": 501090282,
    "IsLastQuoteApproved": true,
    "LastInteractionRecordId": 503824368,
    "LastUpdateDate": "2024-02-28T13:19:32.41",
    "Length": 0,
    "OriginId": 50003697,
    "OtherProperties": {
    "deal_2A81336C-5576-4FAC-ACAF-87977148F98A": 744747
    },
    "OwnerId": 10025735,
    "PipelineId": 10017213,
    "Read": true,
    "StageId": 10087507,
    "StartAmount": 0,
    "StartCurrencyId": 1,
    "StartDate": "2024-02-28T12:18:04.737",
    "StatusId": 1,
    "TasksOrdination": 2,
    "Title": "Novo Lead Convertido (Qualificar)",
    "UpdaterId": 10025735
    },
    "WebhookCreatorId": 50004632,
    "WebhookId": 50001877
    }

    const dateString = respostaWebhookCardGanho.New.FinishDate;
    const milliseconds = new Date(dateString).getTime();
    console.log(milliseconds);


  if (response.data && response.data.tasks && Array.isArray(response.data.tasks)) {
    // Se a estrutura está correta, vamos acessar os dados da tarefa
    const tasks = response.data.tasks;
    const taskId = tasks[0].id
    // Vamos assumir que você está interessado apenas na primeira tarefa
    // console.log(tasks);

    const requestBody = {
      "name": "testando 5",
      "due_date": milliseconds,
      "tags": ['ploomes']
    }

    axios.put(`https://api.clickup.com/api/v2/task/${taskId}`, requestBody, {

    headers: {
      'Authorization': 'pk_75429419_ZT8345CO82TTH22D2MZJXN3QVRUXP7OA',
    }
    })
    .then(response => {

        console.log('feito')
    })
    .catch(error => {
      console.error('Erro ao editar tarefa:', error);
    });
  } else {
    console.error('Resposta da API não está no formato esperado');
  }

})
.catch(error => {
  console.error('Erro ao obter tarefas:', error);
});
