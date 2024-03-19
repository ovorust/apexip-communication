// Certifique-se de importar o axios ou incluí-lo no seu projeto
const axios = require('axios');

// Envolve o código em uma função assíncrona para poder usar await
async function processPayment() {
  try {
    const req = {
      "event": "PAYMENT_RECEIVED",
      "payment": {
        "anticipable": false,
        "anticipated": false,
        "bankSlipUrl": "https://sandbox.asaas.com/b/pdf/80h7s7wdzzsc6pdn",
        "billingType": "BOLETO",
        "canBePaidAfterDueDate": true,
        "clientPaymentDate": "2024-03-19",
        "confirmedDate": "2024-03-19",
        "creditDate": "2024-03-19",
        "customer": "cus_000005928250",
        "dateCreated": "2024-03-19",
        "deleted": false,
        "description": "Teste Asaas",
        "discount": {
          "dueDateLimitDays": 0,
          "type": "PERCENTAGE",
          "value": 0
        },
        "dueDate": "2024-03-26",
        "estimatedCreditDate": "2024-03-19",
        "fine": {
          "type": "PERCENTAGE",
          "value": 0
        },
        "id": "pay_80h7s7wdzzsc6pdn",
        "interest": {
          "type": "PERCENTAGE",
          "value": 0
        },
        "invoiceNumber": "05309358",
        "invoiceUrl": "https://sandbox.asaas.com/i/80h7s7wdzzsc6pdn",
        "netValue": 14.01,
        "nossoNumero": "1515612",
        "object": "payment",
        "originalDueDate": "2024-03-26",
        "paymentDate": "2024-03-19",
        "postalService": false,
        "status": "RECEIVED",
        "transactionReceiptUrl": "https://sandbox.asaas.com/comprovantes/7669377126646840",
        "value": 15
      }
    };

    const event = req.event;
    const payment = req.payment;

    const PIPELINE_TESTE = 50000676;
    const newStage = 50003844; // ETAPA 3

    const patchBody = {
      "StageId": newStage,
      "OtherProperties": [
        {
          "FieldKey": "deal_6DE22E98-7388-470D-9759-90941364B71D",
          "StringValue": "True"
        }
      ]
    };

    if (event !== "PAYMENT_RECEIVED") {
      console.log('Evento de pagamento não correspondente');
      return;
    }

    console.log('Pagamento recebido');

    const response = await axios.get(`https://api2.ploomes.com/Deals?$filter=PipelineId eq ${PIPELINE_TESTE} and Title eq '${payment.description}'`, {
      headers: {
        'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
      }
    });

    if (response.data.value && response.data.value.length > 0) {
      const dealId = response.data.value[0].Id;

      await axios.patch(`https://api2.ploomes.com/Deals(${dealId})`, patchBody, {
        headers: {
          'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
        }
      });

      console.log('[/asaaspagamento] Card movido para o próximo estágio.');
    } else {
      console.log('[/asaaspagamento] Nenhum negócio encontrado com a descrição fornecida.');
      return;
    }

    console.log("Processo finalizado com sucesso.");
  } catch (error) {
    console.error('Erro ao processar requisição /asaaspagamento:', error.message);
  }
}

// Lembre-se de chamar a função
processPayment();
