import { GoogleGenerativeAI, Schema, Type } from "@google/generative-ai";
import { XMLBuilder } from "fast-xml-parser";

export interface TransactionData {
  accountId: string;
  currency: string;
  balance: number;
  entries: Array<{
    amount: number;
    date: string;
    description: string;
    creditDebitIndicator: 'CRDT' | 'DBIT';
  }>;
}

export class CamtGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  private getCamtSchema(): Schema {
    return {
      type: Type.OBJECT,
      properties: {
        GrpHdr: {
          type: Type.OBJECT,
          properties: {
            MsgId: { type: Type.STRING },
            CreDtTm: { type: Type.STRING }
          }
        },
        Stmt: {
          type: Type.OBJECT,
          properties: {
            Id: { type: Type.STRING },
            Acct: { type: Type.OBJECT, properties: { Id: { type: Type.OBJECT, properties: { IBAN: { type: Type.STRING } } } } },
            Ntry: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  Amt: { type: Type.NUMBER },
                  CdtDbtInd: { type: Type.STRING },
                  BookgDt: { type: Type.STRING },
                  NtryDtls: { type: Type.OBJECT, properties: { TxDtls: { type: Type.OBJECT, properties: { RmtInf: { type: Type.OBJECT, properties: { Ustrd: { type: Type.STRING } } } } } } }
                }
              }
            }
          }
        }
      }
    };
  }

  async generateCamtXml(prompt: string): Promise<string> {
    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Convert this transaction data into a JSON structure compliant with ISO 20022 CAMT.053.001.01: ${prompt}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this.getCamtSchema(),
      },
    });

    const json = JSON.parse(result.response.text());
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true,
    });

    const xmlContent = {
      Document: {
        "@_xmlns": "urn:iso:std:iso:20022:tech:xsd:camt.053.001.01",
        BkToCstmrStmt: json
      }
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(xmlContent)}`;
  }

  async processRawJson(data: TransactionData): Promise<string> {
    return this.generateCamtXml(JSON.stringify(data));
  }
}