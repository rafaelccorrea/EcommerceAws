#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import {
  ProductsAppStack,
  EcommerceApiStack,
  ProductsAppLayersStack,
} from "../lib";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.ACCOUNT_AWS,
  region: process.env.REGION_AWS,
};

const tags = {
  cost: "Ecommerce",
  team: "Correa",
};

// Criação de layers de produtos

const productsAppLayersStack = new ProductsAppLayersStack(
  app,
  "ProductsAppLayers",
  {
    tags,
    env,
  }
);

// Criação da stack de produtos
const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags,
  env,
});

productsAppStack.addDependency(productsAppLayersStack);

// Criação da stack ecommerce
const ecommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags,
  env,
});

ecommerceApiStack.addDependency(productsAppStack);
