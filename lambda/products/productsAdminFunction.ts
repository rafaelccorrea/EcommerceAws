import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";

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
