const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');

async function createInvoice() {

  const Name = 'Empresa Teste'
  const CNPJ = '53.659.052/0001-30'
  const Email = 'afonso@apexip.com'

  const userPhones = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Name eq '${Name}'&$expand=Phones&$orderby=TypeId desc&$select=Phones`, {
    headers: {
      'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
    }
  });

  const userNumber = userPhones.data.value[0].Phones[0].SearchPhoneNumber.toString();

  const asaasCustomers = await axios.get(`https://api.asaas.com/v3/customers?name=${Name}`, {
      headers: {
        accept: 'application/json',
        access_token: process.env.ASAAS_ACCESS_KEY
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
          email: Email,
          phone: userNumber,
          cpfCnpj: CNPJ || CPF,
        })
      };
      
      fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));

    } else {
      console.log('[/updateclient] Cliente não encontrado na Asaas');
    }
  
}

createInvoice();
