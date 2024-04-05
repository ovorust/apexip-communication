const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');

async function createInvoice() {

  const Title = 'Processo de Registro de uma Marca - Engetins'

  const dealGet = await axios.get(`https://api2.ploomes.com/Deals?$expand=OtherProperties&$filter=Title+eq+'${Title}'&$select=OtherProperties`, {
          headers: {
              'Accept': 'application/json',
              'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
          }
      });

      // Verifique se há dados na resposta
      if (dealGet.data && dealGet.data.value && dealGet.data.value.length > 0) {
        const deals = dealGet.data.value;
        parcelas = deals[0]['OtherProperties'].find(deal => deal.FieldKey === 'deal_0CDE1351-1AE7-4EC6-BEC6-51B6D6103356').ObjectValueName;
        formaDePagamento = deals[0]['OtherProperties'].find(deal => deal.FieldKey === 'deal_A856FC68-9D24-4D0F-99E4-E7553A97D4CF').ObjectValueName.toUpperCase();
      }

      console.log(parcelas)
      console.log(formaDePagamento)
  
}

createInvoice();
