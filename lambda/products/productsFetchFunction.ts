import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { ProductRepository } from "/opt/nodejs/productsLayer";

import { DynamoDB } from "aws-sdk";

import * as AWSXRay from "aws-xray-sdk";

AWSXRay.captureAWS(require("aws-sdk"));

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbClient, productsDdb);

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(
    `API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`
  );

  const { httpMethod, resource, pathParameters } = event;

  if (resource === "/products") {
    if (httpMethod === "GET") {
      console.log("GET /products");

      const products = await productRepository.getAllProducts();

      return {
        statusCode: 200,
        body: JSON.stringify(products),
      };
    }
  }

  if (resource === "/products/{id}" && httpMethod === "GET") {
    const productId = pathParameters!.id as string;

    try {
      const product = await productRepository.getProductById(productId);

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

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: "Resource not found",
    }),
  };
};
