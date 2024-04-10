// Certifique-se de importar o axios ou incluí-lo no seu projeto
const axios = require('axios');
const fetch = require('node-fetch');

// Envolve o código em uma função assíncrona para poder usar await
async function testFunction() {

  const Title = 'Busca de Anterioridade de Patente'

  const dealGet = await axios.get(`https://api2.ploomes.com/Deals?$expand=OtherProperties&$filter=Title+eq+'${Title}'&$select=OtherProperties`, {
    headers: {
        'Accept': 'application/json',
        'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
    }
});

if (dealGet.data && dealGet.data.value && dealGet.data.value.length > 0) {
  const deals = dealGet.data.value;
  parcelas = deals[dealGet.data.value.length - 1]['OtherProperties'].find(deal => deal.FieldKey === 'deal_0CDE1351-1AE7-4EC6-BEC6-51B6D6103356').ObjectValueName;
  formaDePagamento = deals[dealGet.data.value.length - 1]['OtherProperties'].find(deal => deal.FieldKey === 'deal_A856FC68-9D24-4D0F-99E4-E7553A97D4CF').ObjectValueName.toUpperCase();

  console.log(parcelas)
  console.log(formaDePagamento)

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
  return res.status(200).send('Cobrança realizada.');
}
}
// Lembre-se de chamar a função
testFunction();
