// Certifique-se de importar o axios ou incluí-lo no seu projeto
const axios = require('axios');

// Envolve o código em uma função assíncrona para poder usar await
async function testFunction() {

  try {

    function getCurrentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda se for menor que 10
      const day = String(today.getDate()).padStart(2, '0'); // Adiciona zero à esquerda se for menor que 10
      return `${year}-${month}-${day}`;
    }

    const Title = 'Titulo Teste'
    const ContactName = 'Empresa Teste'
    const Amount = '15'


    // const response = await axios.get(`https://api2.ploomes.com/Deals?$expand=OtherProperties&$filter=Title+eq+'${Title}'`, {
    //   headers: {
    //     'User-Key': process.env.PLOOMES_USER_KEY
    //   }
    // });

    const clienteGet = await axios.get(`https://sandbox.asaas.com/api/v3/customers?name=${ContactName}`, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoXzA3ZjgwMTVjLTJiYzgtNDZjYS04YzUxLTQ3NzFhZGU2MTg3Mg=='
      }
    })

    const idCliente = clienteGet.data.data[0].id

    const data = {
      billingType: 'UNDEFINED',
      customer: idCliente,
      value: Amount,
      description: Title,
      dueDate: getCurrentDate()

    };


    const criarCobranca = await axios.post('https://sandbox.asaas.com/api/v3/payments', data, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoXzA3ZjgwMTVjLTJiYzgtNDZjYS04YzUxLTQ3NzFhZGU2MTg3Mg=='
      }
  })

  

    console.log("[/asaascriacaopagamento] Cobrança criada com sucesso!")

    return
  } catch (error) {
    console.error('erro:', error.message);
    return
  }
}
// Lembre-se de chamar a função
testFunction();
