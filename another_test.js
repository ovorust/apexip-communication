const axios = require('axios');

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



axios.post('https://southamerica-east1-converx-hobspot.cloudfunctions.net/send_template', converx)
    .then((response) => {
      console.log('Response:', response.data);
    })
    .catch((error) => {
      console.error('Error:', error.response.data);
    });