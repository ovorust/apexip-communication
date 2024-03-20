const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');

async function createInvoice() {

  const url = 'https://sandbox.asaas.com/api/v3/customers';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoXzA3ZjgwMTVjLTJiYzgtNDZjYS04YzUxLTQ3NzFhZGU2MTg3Mg=='
      },
      data: {
        name: 'John Doe',
        email: 'john.doe@asaas.com.br',
        cpfCnpj: '24971563792'
      }
    };

    axios(url, options)
      .then(response => console.log(response.data))
      .catch(error => console.error('error:', error));
}

createInvoice();
