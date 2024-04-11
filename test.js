const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;


async function createInvoice() {

 const lister = {
    "@odata.context": "https://public6-api2.ploomes.com/$metadata#Deals(OtherProperties)",
    "value": [
        {
            "OtherProperties": [
                {
                    "Id": 3766113,
                    "FieldId": 10206670,
                    "FieldKey": "deal_3388F098-9EF9-4232-AC02-1E33A457DE00",
                    "DealId": 102547136,
                    "StringValue": null,
                    "BigStringValue": null,
                    "IntegerValue": 747907,
                    "DecimalValue": null,
                    "DateTimeValue": null,
                    "BoolValue": null,
                    "ObjectValueId": 747907,
                    "ObjectValueName": "Brasil",
                    "UserValueId": null,
                    "UserValueName": null,
                    "UserValueAvatarUrl": null,
                    "ProductValueId": null,
                    "ProductValueName": null,
                    "AttachmentValueId": null,
                    "AttachmentValueName": null,
                    "ContactValueId": null,
                    "ContactValueName": null,
                    "ContactValueTypeId": null,
                    "ContactValueRegister": null,
                    "CurrencyValueId": null,
                    "AttachmentItemValueId": null,
                    "AttachmentItemValueName": null
                },
                {
                    "Id": 3766114,
                    "FieldId": 10207724,
                    "FieldKey": "deal_0F5A202C-69AB-4031-B5F3-C73EEED528E3",
                    "DealId": 102547136,
                    "StringValue": null,
                    "BigStringValue": null,
                    "IntegerValue": null,
                    "DecimalValue": null,
                    "DateTimeValue": "2023-01-16T18:34:59-03:00",
                    "BoolValue": null,
                    "ObjectValueId": null,
                    "ObjectValueName": null,
                    "UserValueId": null,
                    "UserValueName": null,
                    "UserValueAvatarUrl": null,
                    "ProductValueId": null,
                    "ProductValueName": null,
                    "AttachmentValueId": null,
                    "AttachmentValueName": null,
                    "ContactValueId": null,
                    "ContactValueName": null,
                    "ContactValueTypeId": null,
                    "ContactValueRegister": null,
                    "CurrencyValueId": null,
                    "AttachmentItemValueId": null,
                    "AttachmentItemValueName": null
                }
              ]
              }
            ]
          }


console.log(lister.value.length - 1)
}
createInvoice();