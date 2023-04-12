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
  team: "Correa"
}