import express from "express";
import acquisitionsRouter from "./acquisitions";
import aiRouter from "./ai";
import alpacaRouter from "./alpaca";
import alpacaCollateralRouter from "./alpacaCollateral";
import azureRouter from "./azure";
import azureGovComplianceRouter from "./azureGovCompliance";
import citiRouter from "./citi";
import configRouter from "./config";
import cryptoStrategyRouter from "./crypto-strategy";
import fapiRouter from "./fapi";
import googleChatRouter from "./google-chat";
import governmentGatewayRouter from "./government-gateway";
import modernTreasuryRouter from "./modern-treasury";
import plaidRouter from "./plaid";
import realEstateRouter from "./real-estate";
import sovereignRouter from "./sovereign";
import stripeRouter from "./stripe";
import taxLiensRouter from "./tax-liens";
import tqqqStrategyRouter from "./tqqq-strategy";

const apiApp = express.Router();

apiApp.use(express.json({ limit: "10mb" }));
apiApp.use(express.urlencoded({ extended: true }));

apiApp.use(configRouter);
apiApp.use(aiRouter);
apiApp.use(alpacaRouter);
apiApp.use(alpacaCollateralRouter);
apiApp.use(azureRouter);
apiApp.use(azureGovComplianceRouter);
apiApp.use(citiRouter);
apiApp.use(cryptoStrategyRouter);
apiApp.use(fapiRouter);
apiApp.use(googleChatRouter);
apiApp.use(governmentGatewayRouter);
apiApp.use(modernTreasuryRouter);
apiApp.use(plaidRouter);
apiApp.use(realEstateRouter);
apiApp.use(sovereignRouter);
apiApp.use(stripeRouter);
apiApp.use(taxLiensRouter);
apiApp.use(tqqqStrategyRouter);
apiApp.use(acquisitionsRouter);

export default apiApp;
