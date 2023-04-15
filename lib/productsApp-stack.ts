import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import * as dynadb from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";

export class ProductsAppStack extends cdk.Stack {
  readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;
  readonly productsAdminHandler: lambdaNodeJs.NodejsFunction;
  readonly ProductsDdb = new dynadb.Table(this, "ProductsDdb", {
    tableName: "products",
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    partitionKey: {
      name: "id",
      type: dynadb.AttributeType.STRING,
    },
    billingMode: dynadb.BillingMode.PROVISIONED,
    readCapacity: 1,
    writeCapacity: 1,
  });
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Stack Products
    this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(
      this,
      "ProductsFetchFunction",
      {
        functionName: "ProductsFetchFunction",
        entry: "lambda/products/productsFetchFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          PRODUCTS_DDB: this.ProductsDdb.tableName,
        },
      }
    );
    // Permission Read Table Stack Product
    this.ProductsDdb.grantReadData(this.productsFetchHandler);

    // Stack admin products
    this.productsAdminHandler = new lambdaNodeJs.NodejsFunction(
      this,
      "ProductsAdminFunction",
      {
        functionName: "ProductsAdminFunction",
        entry: "lambda/products/productsAdminFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          PRODUCTS_DDB: this.ProductsDdb.tableName,
        },
      }
    );

    // Permission Write Stack admin products
    this.ProductsDdb.grantWriteData(this.productsAdminHandler);
  }
}
