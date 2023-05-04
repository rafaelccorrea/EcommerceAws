import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";

import { DynamoDB, Lambda } from "aws-sdk";

import { ProductEvent, ProductEventType } from "/opt/nodejs/productEventsLayer";

import * as AWSXRay from "aws-xray-sdk";

AWSXRay.captureAWS(require("aws-sdk"));

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

const productsEventsFunctionName = process.env.PRODUCT_EVENTS_FUNCTION_NAME;

const lambdaClient = new Lambda();

const productRepository = new ProductRepository(ddbClient, productsDdb);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { awsRequestId } = context;
  const apiRequestId = event.requestContext.requestId;
  const { resource, httpMethod, pathParameters, body } = event;

  console.log(
    `API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${awsRequestId}`
  );

  if (resource === "/products" && httpMethod === "POST") {
    console.log("POST /products");

    const product = JSON.parse(body!) as Product;

    const productCreated = await productRepository.create(product);

    const response = await sendProductEvent(
      productCreated,
      ProductEventType.CREATED,
      "rafael@gmail.com",
      awsRequestId
    );

    console.log(response);

    return { statusCode: 201, body: JSON.stringify(productCreated) };
  }

  if (resource === "/products/{id}") {
    const productId = pathParameters!.id as string;
    if (httpMethod === "PUT") {
      const product = JSON.parse(body!) as Product;
      try {
        const productUpdated = await productRepository.update(
          productId,
          product
        );

        const response = await sendProductEvent(
          productUpdated,
          ProductEventType.UPDATED,
          "correa@gmail.com",
          awsRequestId
        );

        console.log(response);

        return { statusCode: 200, body: JSON.stringify(productUpdated) };
      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 404,
          body: "Product not found!",
        };
      }
    }

    if (httpMethod === "DELETE") {
      console.log(`DELETE /products/${pathParameters!.id}`);

      try {
        const product = await productRepository.delete(
          pathParameters!.id as string
        );

        const response = await sendProductEvent(
          product,
          ProductEventType.DELETED,
          "deletecorrea@gmail.com",
          awsRequestId
        );

        console.log(response);

        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      } catch (err) {
        console.error((<Error>err).message);

        return {
          statusCode: 404,
          body: JSON.stringify({
            message: (<Error>err).message,
          }),
        };
      }
    }
  }

  console.log(`Unsupported resource: ${resource}, HTTP method: ${httpMethod}`);
  return { statusCode: 400, body: JSON.stringify({ message: "Bad Request" }) };
};

function sendProductEvent(
  product: Product,
  eventType: ProductEventType,
  email: string,
  lambdaRequestId: string
) {
  const event: ProductEvent = {
    email: email,
    eventType: eventType,
    productCode: product.code,
    productId: product.id,
    productPrice: product.price,
    requestId: lambdaRequestId,
  };

  return lambdaClient
    .invoke({
      FunctionName: productsEventsFunctionName!,
      InvocationType: "Event",
      Payload: JSON.stringify(event),
    })
    .promise();
}
