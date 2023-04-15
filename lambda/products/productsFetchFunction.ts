import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

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

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "GET products - OK",
        }),
      };
    }
  }

  if (resource === "/products/{id}" && httpMethod === "GET") {
    const productId = pathParameters?.id;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing product ID",
        }),
      };
    }

    console.log(`GET /products/${productId}`);

    return {
      statusCode: 200,
      body: `GET /products/${productId}`,
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: "Not Found",
    }),
  };
};
