"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyInfo, DocumentSettings } from "@/lib/mock-data/settings";
import { useErpDataStore } from "@/stores/erp-data-store";

export function CompanySettings() {
  const companyInfo = useErpDataStore((state) => state.companyInfo);
  const updateCompanyInfo = useErpDataStore((state) => state.updateCompanyInfo);
  const documentSettings = useErpDataStore((state) => state.documentSettings);
  const updateDocumentSettings = useErpDataStore((state) => state.updateDocumentSettings);

  const [company, setCompany] = useState<CompanyInfo>(companyInfo);
  const [documents, setDocuments] = useState<DocumentSettings>(documentSettings);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>
            Informações cadastrais aplicadas em Relatórios, Orçamentos, Ordens de Serviço e
            Financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-fantasy-name">Nome Fantasia</Label>
              <Input
                id="company-fantasy-name"
                value={company.fantasyName}
                onChange={(event) => setCompany((v) => ({ ...v, fantasyName: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-legal-name">Razão Social</Label>
              <Input
                id="company-legal-name"
                value={company.legalName}
                onChange={(event) => setCompany((v) => ({ ...v, legalName: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-cnpj">CNPJ</Label>
              <Input
                id="company-cnpj"
                value={company.cnpj}
                onChange={(event) => setCompany((v) => ({ ...v, cnpj: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-state-registration">Inscrição Estadual</Label>
              <Input
                id="company-state-registration"
                value={company.stateRegistration}
                onChange={(event) =>
                  setCompany((v) => ({ ...v, stateRegistration: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company-address">Endereço</Label>
            <Input
              id="company-address"
              value={company.address}
              onChange={(event) => setCompany((v) => ({ ...v, address: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-phone">Telefone</Label>
              <Input
                id="company-phone"
                value={company.phone}
                onChange={(event) => setCompany((v) => ({ ...v, phone: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-whatsapp">WhatsApp</Label>
              <Input
                id="company-whatsapp"
                value={company.whatsapp}
                onChange={(event) => setCompany((v) => ({ ...v, whatsapp: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-email">E-mail</Label>
              <Input
                id="company-email"
                type="email"
                value={company.email}
                onChange={(event) => setCompany((v) => ({ ...v, email: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-logo">Logo (URL)</Label>
              <Input
                id="company-logo"
                placeholder="https://..."
                value={company.logoUrl}
                onChange={(event) => setCompany((v) => ({ ...v, logoUrl: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-signature">Assinatura (URL)</Label>
              <Input
                id="company-signature"
                placeholder="https://..."
                value={company.signatureUrl}
                onChange={(event) =>
                  setCompany((v) => ({ ...v, signatureUrl: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-stamp">Carimbo (URL)</Label>
              <Input
                id="company-stamp"
                placeholder="https://..."
                value={company.stampUrl}
                onChange={(event) => setCompany((v) => ({ ...v, stampUrl: event.target.value }))}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Upload de arquivos mockado nesta fase — informe URLs de imagens já hospedadas.
          </p>

          <div>
            <Button onClick={() => updateCompanyInfo(company)}>Salvar dados da empresa</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Cabeçalho, rodapé, observações e garantia aplicados automaticamente em Relatórios,
            Orçamentos, Ordens de Serviço e Financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-header">Cabeçalho dos PDFs</Label>
            <Textarea
              id="document-header"
              value={documents.headerText}
              onChange={(event) => setDocuments((v) => ({ ...v, headerText: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-footer">Rodapé</Label>
            <Textarea
              id="document-footer"
              value={documents.footerText}
              onChange={(event) => setDocuments((v) => ({ ...v, footerText: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-observations">Observações padrão</Label>
            <Textarea
              id="document-observations"
              value={documents.defaultObservations}
              onChange={(event) =>
                setDocuments((v) => ({ ...v, defaultObservations: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-warranty">Texto padrão de garantia</Label>
            <Textarea
              id="document-warranty"
              value={documents.warrantyText}
              onChange={(event) =>
                setDocuments((v) => ({ ...v, warrantyText: event.target.value }))
              }
            />
          </div>

          <div>
            <Button onClick={() => updateDocumentSettings(documents)}>Salvar documentos</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
