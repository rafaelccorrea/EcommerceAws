#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { ProductsAppStack, EcommerceApiStack } from "../lib";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.ACCOUNT_AWS,
  region: process.env.REGION_AWS,
};

const tags = {
  cost: "Ecommerce",
  team: "Correa",
};

// Criação da stack de produtos
const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags,
  env,
});

// Criação da stack ecommerce
const ecommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  tags,
  env,
});

ecommerceApiStack.addDependency(productsAppStack);
