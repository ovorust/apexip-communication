const axios = require('axios');

async function fetchDeals() {
  const PIPELINE_TESTE = 50000676;
  const description = 'Teste Asaas';

  try {
    const response = await axios.get(`https://api2.ploomes.com/Deals?$filter=PipelineId eq 50000676 and Title eq 'Teste Asaas'`, {
      headers: {
        'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
      }
    });

    // Supondo que a resposta inclua um array de "Deals", e você esteja interessado no primeiro
    if (response.data.value && response.data.value.length > 0) {
      const dealId = response.data.value[0].Id; // Ajuste isso de acordo com a estrutura real da resposta
      console.log(dealId);
    } else {
      console.log('Nenhum deal encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar deals:', error);
  }
}

fetchDeals();
