// Certifique-se de importar o axios ou incluí-lo no seu projeto
const axios = require('axios');
const fetch = require('node-fetch');

// Envolve o código em uma função assíncrona para poder usar await
async function testFunction() {

  const Name = 'Empresa Teste'

  try {

    const asaasCustomers = await axios.get('https://sandbox.asaas.com/api/v3/customers', {
      headers: {
        accept: 'application/json',
        access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoX2RlY2Y4OTZmLWE3Y2YtNGE2Mi1iN2NhLTM1Mzk3ZjU2NDY4Yw=='
      }
    });

    const existingCustomer = asaasCustomers.data.data.find(customer => customer.name === Name);

    if (existingCustomer) {
      const customerIdAsaas = existingCustomer.id;

      // Atualizar cliente na Asaas
      const url = `https://sandbox.asaas.com/api/v3/customers/${customerIdAsaas}`;
      const options = {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoX2RlY2Y4OTZmLWE3Y2YtNGE2Mi1iN2NhLTM1Mzk3ZjU2NDY4Yw=='
        }
      };
      
      fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));
    return
  } 
  } catch (error) {
    console.error('erro:', error.message);
    return
}
}
// Lembre-se de chamar a função
testFunction();
