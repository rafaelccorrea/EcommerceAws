#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import {
  ProductsAppStack,
  EcommerceApiStack,
  ProductsAppLayersStack,
  EventsDdbStack,
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

const eventsDdbStack = new EventsDdbStack(app, "EventsDdb", {
  tags,
  env,
});

// Criação da stack de produtos
const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  eventsDdb: eventsDdbStack.table,
  tags,
  env,
});

productsAppStack.addDependency(productsAppLayersStack);
productsAppStack.addDependency(eventsDdbStack);

// Criação da stack ecommerce
const ecommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags,
  env,
});

ecommerceApiStack.addDependency(productsAppStack);
