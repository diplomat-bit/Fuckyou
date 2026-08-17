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
    status?: 'BOOK' | 'PDNG';
    valDate?: string;
    debtorName?: string;
    creditorName?: string;
    endToEndId?: string;
    uetr?: string;
  }>;
}

export class CamtGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required for CamtGenerator");
    }
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
            MsgId: { type: Type.STRING, description: "Unique message identifier" },
            CreDtTm: { type: Type.STRING, description: "Creation date time in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)" }
          },
          required: ["MsgId", "CreDtTm"]
        },
        Stmt: {
          type: Type.OBJECT,
          properties: {
            Id: { type: Type.STRING, description: "Unique statement identifier" },
            CreDtTm: { type: Type.STRING, description: "Statement creation date time" },
            Acct: {
              type: Type.OBJECT,
              properties: {
                Id: {
                  type: Type.OBJECT,
                  properties: {
                    IBAN: { type: Type.STRING, description: "IBAN of the account" },
                    Othr: {
                      type: Type.OBJECT,
                      properties: {
                        Id: { type: Type.STRING, description: "Alternative account identifier" },
                        SchmeNm: {
                          type: Type.OBJECT,
                          properties: {
                            Cd: { type: Type.STRING, description: "Scheme name code, e.g., BBAN" }
                          }
                        }
                      },
                      required: ["Id"]
                    }
                  }
                },
                Ccy: { type: Type.STRING, description: "Three-letter ISO currency code" }
              },
              required: ["Id", "Ccy"]
            },
            Bal: {
              type: Type.ARRAY,
              description: "Opening and closing balances",
              items: {
                type: Type.OBJECT,
                properties: {
                  Tp: { type: Type.STRING, description: "Balance type: OPBD (Opening Booked) or CLBD (Closing Booked)" },
                  Amt: { type: Type.NUMBER, description: "Balance amount" },
                  CdtDbtInd: { type: Type.STRING, description: "CRDT or DBIT" },
                  Dt: { type: Type.STRING, description: "Balance date (YYYY-MM-DD)" }
                },
                required: ["Tp", "Amt", "CdtDbtInd", "Dt"]
              }
            },
            Ntry: {
              type: Type.ARRAY,
              description: "Statement entries (transactions)",
              items: {
                type: Type.OBJECT,
                properties: {
                  Amt: { type: Type.NUMBER, description: "Transaction amount" },
                  CdtDbtInd: { type: Type.STRING, description: "CRDT or DBIT" },
                  Status: { type: Type.STRING, description: "BOOK (Booked) or PDNG (Pending)" },
                  BookgDt: { type: Type.STRING, description: "Booking date (YYYY-MM-DD)" },
                  ValDt: { type: Type.STRING, description: "Value date (YYYY-MM-DD)" },
                  AcctSvcrRef: { type: Type.STRING, description: "Account servicer reference" },
                  TxDtls: {
                    type: Type.OBJECT,
                    properties: {
                      Refs: {
                        type: Type.OBJECT,
                        properties: {
                          EndToEndId: { type: Type.STRING, description: "End-to-end transaction ID" },
                          UETR: { type: Type.STRING, description: "Unique End-to-End Transaction Reference (UUID)" }
                        }
                      },
                      Amt: { type: Type.NUMBER, description: "Transaction details amount" },
                      RltdPties: {
                        type: Type.OBJECT,
                        properties: {
                          Dbtr: {
                            type: Type.OBJECT,
                            properties: {
                              Name: { type: Type.STRING, description: "Debtor name" }
                            }
                          },
                          Cdtr: {
                            type: Type.OBJECT,
                            properties: {
                              Name: { type: Type.STRING, description: "Creditor name" }
                            }
                          }
                        }
                      },
                      RmtInf: {
                        type: Type.OBJECT,
                        properties: {
                          Ustrd: { type: Type.STRING, description: "Unstructured remittance info / description" }
                        }
                      }
                    }
                  }
                },
                required: ["Amt", "CdtDbtInd", "Status", "BookgDt", "ValDt"]
              }
            }
          },
          required: ["Id", "CreDtTm", "Acct", "Bal", "Ntry"]
        }
      }
    };
  }

  async generateCamtXml(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Convert this transaction data into a JSON structure compliant with ISO 20022 CAMT.053.001.01. Ensure all fields are mapped accurately and logically: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: this.getCamtSchema(),
        },
      });

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error("Empty response received from Gemini API");
      }

      const json = JSON.parse(responseText);
      
      // Programmatically map the clean LLM JSON to the exact fast-xml-parser structure with attributes
      const mappedXmlContent = {
        Document: {
          "@_xmlns": "urn:iso:std:iso:20022:tech:xsd:camt.053.001.01",
          BkToCstmrStmt: {
            GrpHdr: {
              MsgId: json.GrpHdr.MsgId,
              CreDtTm: json.GrpHdr.CreDtTm
            },
            Stmt: {
              Id: json.Stmt.Id,
              CreDtTm: json.Stmt.CreDtTm,
              Acct: {
                Id: json.Stmt.Acct.Id,
                Ccy: json.Stmt.Acct.Ccy
              },
              Bal: json.Stmt.Bal.map((b: any) => ({
                Tp: {
                  CdOrPrtry: {
                    Cd: b.Tp
                  }
                },
                Amt: {
                  "@_Ccy": json.Stmt.Acct.Ccy,
                  "#text": b.Amt
                },
                CdtDbtInd: b.CdtDbtInd,
                Dt: {
                  Dt: b.Dt
                }
              })),
              Ntry: json.Stmt.Ntry.map((n: any) => {
                const entry: any = {
                  Amt: {
                    "@_Ccy": json.Stmt.Acct.Ccy,
                    "#text": n.Amt
                  },
                  CdtDbtInd: n.CdtDbtInd,
                  Sts: n.Status,
                  BookgDt: {
                    Dt: n.BookgDt
                  },
                  ValDt: {
                    Dt: n.ValDt
                  }
                };
                if (n.AcctSvcrRef) {
                  entry.AcctSvcrRef = n.AcctSvcrRef;
                }
                if (n.TxDtls) {
                  entry.NtryDtls = {
                    TxDtls: {
                      Refs: n.TxDtls.Refs ? {
                        EndToEndId: n.TxDtls.Refs.EndToEndId,
                        UETR: n.TxDtls.Refs.UETR
                      } : undefined,
                      Amt: n.TxDtls.Amt ? {
                        "@_Ccy": json.Stmt.Acct.Ccy,
                        "#text": n.TxDtls.Amt
                      } : undefined,
                      RltdPties: n.TxDtls.RltdPties ? {
                        Dbtr: n.TxDtls.RltdPties.Dbtr ? {
                          Nm: n.TxDtls.RltdPties.Dbtr.Name
                        } : undefined,
                        Cdtr: n.TxDtls.RltdPties.Cdtr ? {
                          Nm: n.TxDtls.RltdPties.Cdtr.Name
                        } : undefined
                      } : undefined,
                      RmtInf: n.TxDtls.RmtInf ? {
                        Ustrd: n.TxDtls.RmtInf.Ustrd
                      } : undefined
                    }
                  };
                }
                return entry;
              })
            }
          }
        }
      };

      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true,
      });

      return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(mappedXmlContent)}`;
    } catch (error) {
      console.error("Error generating CAMT XML:", error);
      throw new Error(`Failed to generate CAMT XML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async processRawJson(data: TransactionData): Promise<string> {
    return this.generateCamtXml(JSON.stringify(data));
  }
}

export async function generateCamtXmlFromData(apiKey: string, data: TransactionData): Promise<string> {
  const generator = new CamtGenerator(apiKey);
  return generator.processRawJson(data);
}