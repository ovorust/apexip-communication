const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');

async function createInvoice() {

  const Name = 'Empresa Teste'
  const CNPJ = '32132131231231'
  const Email = 'ovojogarust32@gmail.com'

  const asaasCustomers = await axios.get(`https://sandbox.asaas.com/api/v3/customers?name=${Name}`, {
    headers: {
      accept: 'application/json',
      access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoX2RlY2Y4OTZmLWE3Y2YtNGE2Mi1iN2NhLTM1Mzk3ZjU2NDY4Yw=='
    }
  });

  const existingCustomer = asaasCustomers.data.data.find(customer => customer.name === Name);
  console.log(existingCustomer)

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
      },
      body: JSON.stringify({name: Name, cpfCnpj: CNPJ || CPF, email: Email})
    };
    
    fetch(url, options)
      .then(res => console.log('[/updateclient] Cliente atualizado na Asaas com sucesso!'))
      .catch(err => console.error('[/updateclient] Erro ao atualizar cliente Asaas: ' + err));

  } else {
    console.log('[/updateclient] Cliente não encontrado na Asaas');
  }
  
}

createInvoice();
