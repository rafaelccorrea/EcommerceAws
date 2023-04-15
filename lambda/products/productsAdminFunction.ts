import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { awsRequestId } = context;
  const apiRequestId = event.requestContext.requestId;
  const { resource, httpMethod, pathParameters } = event;

  console.log(
    `API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${awsRequestId}`
  );

  if (resource === "/products" && httpMethod === "POST") {
    console.log("POST /products");
    return { statusCode: 201, body: "POST /products" };
  }

  if (resource === "/products/{id}") {
    if (httpMethod === "PUT") {
      console.log(`PUT /products/${pathParameters?.id}`);
      return { statusCode: 200, body: `PUT /products/${pathParameters?.id}` };
    }

    if (httpMethod === "DELETE") {
      console.log(`DELETE /products/${pathParameters?.id}`);
      return {
        statusCode: 200,
        body: `DELETE /products/${pathParameters?.id}`,
      };
    }
  }

  console.log(`Unsupported resource: ${resource}, HTTP method: ${httpMethod}`);
  return { statusCode: 400, body: JSON.stringify({ message: "Bad Request" }) };
};
