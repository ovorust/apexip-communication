// Certifique-se de importar o axios ou incluí-lo no seu projeto
const axios = require('axios');
const fetch = require('node-fetch');

// Envolve o código em uma função assíncrona para poder usar await
async function testFunction() {

  try {
    const Title = 'Teste 2047'
    const ContactName = 'Empresa Teste'
    const Amount = 15
    const Id = 501204512
    let formaDePagamento;
    const STAGE_FECHAMENTO_DO_NEGOCIO = 10075648;

    // Verificar se o evento atual é o mesmo que o último evento processado


    // Armazenar o evento atual como o último evento processado


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

    const clienteGet = await axios.get(`https://api.asaas.com/v3/customers?name=${ContactName}`, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    })

    const dealGet = await axios.get(`https://api2.ploomes.com/Deals?$expand=OtherProperties&$filter=Id+eq+${Id}&$select=OtherProperties`, {
          headers: {
              'Accept': 'application/json',
              'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
          }
      });

      // Verifique se há dados na resposta
      if (dealGet.data && dealGet.data.value && dealGet.data.value.length > 0) {
        const deals = dealGet.data.value;
        parcelas = deals[dealGet.data.value.length - 1]['OtherProperties'].find(deal => deal.FieldKey === 'deal_0CDE1351-1AE7-4EC6-BEC6-51B6D6103356').ObjectValueName;
        formaDePagamento = deals[dealGet.data.value.length - 1]['OtherProperties'].find(deal => deal.FieldKey === 'deal_A856FC68-9D24-4D0F-99E4-E7553A97D4CF').ObjectValueName.toUpperCase();

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

    } else {
        console.log("[/asaascriacaopagamento] Nenhum dado de pagamento encontrado.");
    }

    const idCliente = clienteGet.data.data[0].id

   const data = {
      billingType: formaDePagamento,
      customer: idCliente,
      value: Amount,
      description: String(Id),
      installmentCount: parcelas,
      totalValue: Amount,
      dueDate: getCurrentDate(7)
    };



    const criarCobranca = await axios.post('https://api.asaas.com/v3/payments', data, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    })

    console.log("[/asaascriacaopagamento] Cobrança criada com sucesso!")

  } catch (error) {
    console.error('[/asaascriacaopagamento] Erro ao processar requisição /asaascriacaopagamento:', error.message);
  }
}
// Lembre-se de chamar a função
testFunction();
