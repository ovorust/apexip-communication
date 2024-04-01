// Certifique-se de importar o axios ou incluí-lo no seu projeto
const axios = require('axios');
const fetch = require('node-fetch');

// Envolve o código em uma função assíncrona para poder usar await
async function testFunction() {

  const ContactName = 'Empresa Teste'
  const Amount = '50'
  const Title = 'Teste 1616'
  let formaDePagamento;
  let parcelas;

  try {
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

    const clienteGet = await axios.get(`https://sandbox.asaas.com/api/v3/customers?name=${ContactName}`, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoX2RlY2Y4OTZmLWE3Y2YtNGE2Mi1iN2NhLTM1Mzk3ZjU2NDY4Yw=='
      }
    })

    const idCliente = clienteGet.data.data[0].id

      const dealGet = await axios.get(`https://api2.ploomes.com/Deals?$expand=OtherProperties&$filter=Title+eq+'${Title}'&$select=OtherProperties`, {
          headers: {
              'Accept': 'application/json',
              'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
          }
      });

      // Verifique se há dados na resposta
      if (dealGet.data && dealGet.data.value && dealGet.data.value.length > 0) {
        const deals = dealGet.data.value;
        parcelas = deals[0]['OtherProperties'][0].ObjectValueName
        formaDePagamento = deals[0]['OtherProperties'][1].ObjectValueName.toUpperCase()

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

        console.log(formaDePagamento)
    } else {
        console.log("[/asaascriacaopagamento] Nenhum dado de pagamento encontrado.");
        return res.status(200).send('Cobrança realizada.');
    }


  const data = {
    billingType: formaDePagamento,
    customer: idCliente,
    value: Amount,
    description: Title,
    installmentCount: parcelas,
    totalValue: Amount,
    dueDate: getCurrentDate(7)
  };




  //   const cobrançaCartao = {
  //     billingType: 'BOLETO',
  //     customer: idCliente,
  //     value: Amount,
  //     description: Title,
  //     installmentCount: 5,
  //     totalValue: Amount,
  //     dueDate: getCurrentDate(7)
  //   };

  //   // console.log(data)

    const criarCobranca = await axios.post('https://sandbox.asaas.com/api/v3/payments', data, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzY1NjY6OiRhYWNoX2RlY2Y4OTZmLWE3Y2YtNGE2Mi1iN2NhLTM1Mzk3ZjU2NDY4Yw=='
      }
    })

    console.log("[/asaascriacaopagamento] Cobrança criada com sucesso!")
    
  }  catch (error) {
    console.error('erro:', error.message);
    return
}
}
// Lembre-se de chamar a função
testFunction();
