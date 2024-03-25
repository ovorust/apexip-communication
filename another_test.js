// Certifique-se de importar o axios ou incluí-lo no seu projeto
const axios = require('axios');

// Envolve o código em uma função assíncrona para poder usar await
async function processPayment() {

  const params = {
      name: 'Afonso' // Substitua 'nome_do_cliente' pelo nome pelo qual deseja filtrar
    }
  
    const cliente = await axios.get('https://sandbox.asaas.com/api/v3/customers?name=CRISTIANE', {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoXzA3ZjgwMTVjLTJiYzgtNDZjYS04YzUxLTQ3NzFhZGU2MTg3Mg=='
      }
    })

      console.log(cliente.data.data[0].id)
}

// Lembre-se de chamar a função
processPayment();
