import { Body, Controller, Post, } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as sgMail from '@sendgrid/mail';
const PdfPrinter = require('pdfmake');
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
};

const printer = new PdfPrinter(fonts);

const fields = {
  dataReclamacao: { page: 1, label: 'Data da Reclamação' },
  responsavelfazer: { page: 1, label: 'Responsável por fazer a reclamação' },
  responsavelreceber: { page: 1, label: 'Responsável por receber a reclamação' },
  propriedade: { page: 1, label: 'Propriedade' },
  proprietario: { page: 1, label: 'Proprietário' },
  municipioUF: { page: 1, label: 'Município/UF' },
  contato: { page: 1, label: 'Contato' },
  telefone: { page: 1, label: 'Telefone' },
  revenda: { page: 1, label: 'Revenda' },
  cidadeuf: { page: 1, label: 'Cidade/UF' },
  endereco: { page: 1, label: 'Endereço' },
  vendedor: { page: 1, label: 'Vendedor' },
  contatovendedor: { page: 1, label: 'Contato' },
  condicoes: { page: 1, label: 'Condições de armazenamento das sementes' },
  notafiscal: { page: 2, label: 'Nota Fiscal de Compra Nº' },
  datanota: { page: 2, label: 'Data da emissão da Nota Fiscal' },
  especie: { page: 2, label: 'Espécie' },
  lote: { page: 2, label: 'Lote' },
  safra: { page: 2, label: 'Safra' },
  tratamento: { page: 2, label: 'Tratamento' },
  qtdadquirido: { page: 2, label: 'Quantidade de semente adquirida' },
  qtdutilizado: { page: 2, label: 'Quantidade de semente utilizada' },
  sobra: { page: 2, label: 'Sobra de semente' },
  motivo: { page: 2, label: 'Motivo da Solicitação' },
  descricaoMotivo: { page: 2, label: 'Descreva (Para todos os casos)' },
  culturaRemanescente: { page: 2, label: 'Cultura remanescente' },
  culturaAnterior: { page: 2, label: 'Cultura anterior' },
  manejoHerbicicida: { page: 2, label: 'Manejo de herbicida' },
  antecedentesEInvasores: { page: 2, label: 'Antecedentes e invasoras na área' },
  pragasEDoencas: { page: 2, label: 'Antecedência de ocorrência de pragas e doenças' },
  topografia: { page: 2, label: 'Topografia' },
  tipoDeSolo: { page: 2, label: 'Tipo de solo' },
  caracteristicaDoSolo: { page: 2, label: 'Característica do solo' },
  problemasObservados: { page: 2, label: 'Problemas observados(Compactação do solo, Restos de galho, Palhada)' },
  analiseDoSolo: { page: 2, label: 'Análise do solo disponível' },
  datapreparacao: { page: 3, label: 'Data do início da preparação do solo' },
  sequenciaOperacoes: { page: 3, label: 'Sequência de operação' },
  implementosUtilizados: { page: 3, label: 'Implementos utilizados' },
  fonteCalcario: { page: 3, label: 'Fonte' },
  dataCalcario: { page: 3, label: 'Data da aplicaçã' },
  sistemaCalcario: { page: 3, label: 'Sistema de aplicação' },
  qtdCalcario: { page: 3, label: 'Quantidade (ton/ha)' },
  fonteGesso: { page: 3, label: 'Fonte' },
  dataGesso: { page: 3, label: 'Data da aplicaçã' },
  sistemaGesso: { page: 3, label: 'Sistema de aplicação' },
  qtdGesso: { page: 3, label: 'Quantidade (ton/ha)' },
  fonteAntesPlantio: { page: 3, label: 'Fonte' },
  dataAntesPlantio: { page: 3, label: 'Data da aplicaçã' },
  sistemaAntesPlantio: { page: 3, label: 'Sistema de aplicação' },
  qtdAntesPlantio: { page: 3, label: 'Quantidade (ton/ha)' },
  fonteSimultaneaPlantio: { page: 3, label: 'Fonte' },
  dataSimultaneaPlantio: { page: 3, label: 'Data da aplicaçã' },
  sistemaSimultaneoPlantio: { page: 3, label: 'Sistema de aplicação' },
  qtdSimultaneaPlantio: { page: 3, label: 'Quantidade (ton/ha)' },
  herbicidaDaninhas: { page: 3, label: 'Herbicida' },
  dataDaninhas: { page: 3, label: 'Data da aplicaçã' },
  sistemaDaninhas: { page: 3, label: 'Sistema de aplicação' },
  qtdDaninhas: { page: 3, label: 'Quantidade (ton/ha)' },
  fontePragas: { page: 3, label: 'Produto' },
  dataPragas: { page: 3, label: 'Data da aplicaçã' },
  sistemaPragas: { page: 3, label: 'Sistema de aplicação' },
  qtdPragas: { page: 3, label: 'Quantidade (ton/ha)' },
  fonteAdubacao: { page: 3, label: 'Fonte' },
  dataAdubacao: { page: 3, label: 'Data da aplicaçã' },
  sistemaAdubacao: { page: 3, label: 'Sistema de aplicação' },
  qtdAdubacao: { page: 3, label: 'Quantidade (ton/ha)' },
  dataInicioSemeadura: { page: 4, label: 'Data do início da semeadura' },
  dataTerminoSemeadura: { page: 4, label: 'Data do término da semeadura' },
  condicoesArmazenamentoSementePrioridade: { page: 4, label: 'Condições de armazenamento das sementes na propriedade' },
  areaTotalSemeada: { page: 4, label: 'Área total semeada (ha)' },
  areaComProblema: { page: 4, label: 'Área com problema (ha)' },
  sistemaPlantio: { page: 4, label: 'Sistema de plantio' },
  distanciaLinhas: { page: 4, label: 'Distância entre linhas (cm)' },
  distanciaPlantas: { page: 4, label: 'Distância entre plantas (cm)' },
  equipamentoUtilizadoSemeadura: { page: 4, label: 'Equipamento utilizado na semeadura' },
  sementesIncorporadas: { page: 4, label: 'Sementes foram incorporadas?' },
  equipamentoSementesIncorporadas: { page: 4, label: 'Se sim informar equipamento' },
  presencaPalha: { page: 4, label: 'Presença de palha na área:' },
  semeaduraEspecie: { page: 4, label: 'Espécie' },
  semeaduraCultivar: { page: 4, label: 'Cultivar' },
  semeaduraVolume: { page: 4, label: 'Volume' },
  semeaduraPorcentagemCoberta: { page: 4, label: 'Porcentagem coberta' },
  dataColheitaCultura: { page: 4, label: 'Data de colheita da cultura' },
  sistemaIntegracaoLP: { page: 4, label: 'Sistema Integração Lavoura/Pecuária' },
  sistemaIntegracaoLPsistemaIntegracaoLPOpcao: { page: 4, label: 'Se sim' },
  dataSemeaduraCultura: { page: 4, label: 'Data de semeadura da cultura' },
  sistemaSemeaduraCultura: { page: 4, label: 'Sistema de semeadura' },
  densidadeCultura: { page: 4, label: 'Densidade' },
  profundidadeCultura: { page: 4, label: 'Profundidade' },
  dataSemeaduraForrageira: { page: 4, label: 'Data de semeadura da forrageira' },
  sistemaSemeaduraForrageira: { page: 4, label: 'Sistema de semeadura' },
  densidadeForrageira: { page: 4, label: 'Densidade' },
  profundidadeForrageira: { page: 4, label: 'Profundidade' },
  misturaAduboSemetesPlantio: { page: 4, label: 'Mistura de adubo com a sementes no plantio:' },
  manejoMistura: { page: 4, label: 'Manejo da mistura' },
  proporcaoAduboSemente: { page: 4, label: 'Proporção (Adubo/Semente)' },
  manipulacaoForrageira: { page: 4, label: 'Manipulação' },
  tempoContato: { page: 4, label: 'Tempo de contato (Entre a mistura e a semeadura)' },
  quinzeAntesPlantio: { page: 5, label: '15 dias antes do plantio (mm):' },
  quinzeDepoisPlantio: { page: 5, label: '15 dias depois do plantio (mm):' },
  geadas: { page: 5, label: 'Geadas' },
  estagioDesenvolvimentoPlantasObservadas: { page: 5, label: 'Estágio de desenvolvimento das plantas observadas:' },
  densidadeSementes: { page: 5, label: 'Densidade de sementes (m²):' },
  densidadePlantulas: { page: 5, label: 'Densidade de Plântulas (m²):' },
  uniformidadeEmergenciaPlantulas: { page: 5, label: 'Uniformidade de emergência das plântulas:' },
  especiesDoencas: { page: 5, label: 'Doenças - Espécies' },
  incidenciaDoenca: { page: 5, label: 'Incidência:' },
  danoDoenca: { page: 5, label: 'Dano:' },
  severidadeDoenca: { page: 5, label: 'Severidade:' },
  especiesPragas: { page: 5, label: 'Pragas - Espécies' },
  sintomasPragas: { page: 5, label: 'Sintomas:' },
  localizacaoPragas: { page: 5, label: 'Localização:' },
  severidade: { page: 5, label: 'Severidade dos danos:' },
  plantasInvasorasPragas: { page: 5, label: 'Plantas Invasoras - Espécies' },
  estagioDesenvolvimentoPlantasInvasoras: { page: 5, label: 'Estágio de desenvolvimento:' },
  densidadePlantasInvasoras: { page: 5, label: 'Densidade:' },
  coberturaPlantasInvasoras: { page: 5, label: 'Cobertura:' },
  denfensivosAgricolaProduto1: { page: 6, label: 'Produto1:' },
  denfensivosAgricolaDosagem1: { page: 6, label: 'Dosagem:' },
  denfensivosAgricolaData1: { page: 6, label: 'Data da aplicação:' },
  denfensivosAgricolaObjetivo1: { page: 6, label: 'Obetivo:' },
  denfensivosAgricolaProduto2: { page: 6, label: 'Produto2:' },
  denfensivosAgricolaDosagem2: { page: 6, label: 'Dosagem:' },
  denfensivosAgricolaData2: { page: 6, label: 'Data da aplicação:' },
  denfensivosAgricolaObjetivo2: { page: 6, label: 'Obetivo:' },
  denfensivosAgricolaProduto3: { page: 6, label: 'Produto3:' },
  denfensivosAgricolaDosagem3: { page: 6, label: 'Dosagem:' },
  denfensivosAgricolaData3: { page: 6, label: 'Data da aplicação:' },
  denfensivosAgricolaObjetivo3: { page: 6, label: 'Obetivo:' },
  denfensivosAgricolaProduto4: { page: 6, label: 'Produto4:' },
  denfensivosAgricolaDosagem4: { page: 6, label: 'Dosagem:' },
  denfensivosAgricolaData4: { page: 6, label: 'Data da aplicação:' },
  denfensivosAgricolaObjetivo4: { page: 6, label: 'Obetivo:' },
  interpretacaoComentarioParecer: { page: 6, label: 'Interpretação da situação - Comentários da vistoria - Parecer Técnico' },
  consideracoesFinais: { page: 6, label: 'Considerações finais' },
}

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor() { }

  @Post()
  async sendMail(@Body() mailDto: any) {
    try {
      const emailContent = `
      <h1>Nova Ficha Técnica de Reclamação - FTR</h1>
  `;

      const docDefinition = this.gerarPdfDocDefinition(mailDto, fields);

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);

          console.log(pdfBuffer.toString('base64'))
          
          // Configuração do email
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);

          const arr = process.env.EMAILS_TO_SEND.split(',')
          await Promise.all(arr.map(async (email) => {
            const message = {
              to: email, // Destinatário
              from: process.env.EMAIL_FROM, // Remetente (configure no SendGrid)
              subject: 'Ficha Técnica de Reclamação Recebida',
              html: emailContent, // Corpo do email em HTML
              attachments: [
                {
                  content: pdfBuffer.toString('base64'), // <- converte o Buffer em base64
                  filename: 'Ficha-Tecnica.pdf',
                  type: 'application/pdf',
                  disposition: 'attachment',
                },
              ],
            };

            // Envio do email
            await sgMail.send(message)
              .catch(e => console.error('e 41:', e));
          }))

          return { message: 'Formulário enviado com sucesso!', error: false };
        } catch (error) {
          console.error(error)
        }
      });
      pdfDoc.end();

    } catch (error) {
      console.error(error)
      return { message: 'Erro ao enviar o formulário.', error: true };
    }
  }

  private gerarPdfDocDefinition(mailDto: Record<string, string>, fields: Record<string, { label: string }>) {
    const content = [
      {
        text: 'Ficha Técnica de Reclamação - FTR',
        style: 'header',
      },
      {
        text: '\n',
      }
    ];

    const fieldEntries = Object.keys(fields).map((key) => {
      const label = fields[key].label;
      const value = mailDto[key] || '----';
      const isLongText = value.length > 80 || key === 'interpretacaoComentarioParecer' || key === 'consideracoesFinais';

      return {
        label,
        value,
        isLongText,
      };
    });

    // Agrupa os campos em colunas de 2 (exceto os longos)
    for (let i = 0; i < fieldEntries.length; i++) {
      const field = fieldEntries[i];

      if (field.isLongText) {
        // Campo grande ocupa a largura toda
        content.push({
          // @ts-ignore
          stack: [
            { text: field.label, style: 'fieldLabel' },
            { text: field.value, style: 'textArea' },
          ],
          margin: [0, 5, 0, 10],
        });
      } else {
        // Agrupar dois campos curtos em uma linha com columns
        const nextField = fieldEntries[i + 1];
        if (nextField && !nextField.isLongText) {
          content.push({
            // @ts-ignore
            columns: [
              {
                width: '50%',
                stack: [
                  { text: field.label, style: 'fieldLabel' },
                  { text: field.value, style: 'inputField' },
                ],
              },
              {
                width: '50%',
                stack: [
                  { text: nextField.label, style: 'fieldLabel' },
                  { text: nextField.value, style: 'inputField' },
                ],
              },
            ],
            columnGap: 20,
            margin: [0, 5, 0, 10],
          });
          i++; // Pula o próximo pois já foi usado
        } else {
          content.push({
            // @ts-ignore
            stack: [
              { text: field.label, style: 'fieldLabel' },
              { text: field.value, style: 'inputField' },
            ],
            margin: [0, 5, 0, 10],
          });
        }
      }
    }

    return {
      content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#2C674B',
          margin: [0, 0, 0, 20],
          alignment: 'center',
        },
        fieldLabel: {
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 3],
          color: '#333333',
        },
        inputField: {
          fontSize: 11,
          margin: [0, 0, 0, 5],
          color: '#555555',
          fillColor: '#f0f0f0',
          lineHeight: 1.2,
        },
        textArea: {
          fontSize: 11,
          color: '#555555',
          fillColor: '#f0f0f0',
          lineHeight: 1.4,
          margin: [0, 0, 0, 5],
        },
      },
      defaultStyle: {
        font: 'Helvetica',
      }
    };
  }
}
