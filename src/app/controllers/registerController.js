const yup = require('yup')
const axios = require('axios')
require('dotenv').config()


const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const items = require('../services/services')
const account = require('../services/receive_rules')
const formaDePagamento = require('../services/payment_terms')
const currentDate = new Date();



class RegisterController {
    async store(req, res) {
        const schema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().required(),
            telefone: yup.string(),
            celular: yup.string().required(),
            cpf_cnpj: yup.string().required(),
            rg: yup.string().required(),
            data_nascimento: yup.string().required(),
            role: yup.string().required(),
            data_venda: yup.string().required(),
            postal_code: yup.string().required(),
            endereco: yup.string().required(),
            numero: yup.string().required(),
            aditional_info: yup.string(),
            district: yup.string(),
            tipo_item: yup.string(),
            desc_item: yup.string(),
            quantidade: yup.number(),
            valor_total: yup.number().required(),
            tipo_desconto: yup.string(),
            n_parcelas: yup.number().required(),
            valor_da_Primeira_Parcela: yup.number().required(),
            valor_da_parcela_após_pp: yup.number().required(),
            parcela_forma_de_pagamento: yup.string().required(),
            parcela_dia_de_vencimento: yup.string().required(),
            data_de_vencimento_da_primeira: yup.string().required(),
            data_de_vencimento_da_ultima: yup.string().required(),
            desconto_total_Pontualidade: yup.number().required(),
            material_didático: yup.string().required(),
            md_valor: yup.number().required(),
            md_data_de_pagamento: yup.string().required(),
            md_forma_de_pagamento: yup.string().required(),
            tm_valor: yup.number().required(),
            tm_forma_de_pagamento: yup.string().required(),
            tm_data_de_pagamento: yup.string().required(),
            carga_horaria: yup.string(),
            unidade: yup.string(),
            descricao: yup.string(),
            n_contrato: yup.string(),
            background: yup.string(),
            primeira_aula: yup.string(),
            dia_aula: yup.string(),
            professor: yup.string(),
            horario: yup.string(),
            carga: yup.string(),
            curso: yup.string(),
        })

        try {
            await schema.validateSync(req.body, { abortEarly: false })     //this guy validates what comes from multiple places 
        } catch (err) {
            return res.status(400).json({ error: "Erro nos dados enviados" })
        }
        const {
            name, email, etapa,
            celular, cpf_cnpj, tipo_item,
            desc_item, quantidade,
            valor_total, endereco,
            numero, data_nascimento, n_parcelas,
            district, aditional_info, postal_code,
            role, rg, telefone, valor_da_Primeira_Parcela,
            valor_da_parcela_após_pp, parcela_forma_de_pagamento,
            parcela_dia_de_vencimento, data_de_vencimento_da_primeira,
            data_de_vencimento_da_ultima,
            desconto_total_Pontualidade, material_didático,
            md_valor, md_data_de_pagamento, md_forma_de_pagamento,
            tm_valor, tm_forma_de_pagamento, tm_data_de_pagamento, carga_horaria,
            unidade, descricao, n_contrato, background, primeira_aula,
            dia_aula, professor, horario_inicio, horario_fim, curso,
        } = req.body

        const notes = JSON.stringify({
            n_contrato, background, primeira_aula, dia_aula, professor, horario_inicio, horario_fim
        })

        const customerBody = {
            "name": name,
            "email": email,
            "business_phone": telefone, //
            "mobile_phone": celular,
            "person_type": cpf_cnpj.lenght <= 11 ? "LEGAL" : "NATURAL", //
            "document": cpf_cnpj,
            "identity_document": rg, //
            "date_of_birth": new Date(data_nascimento.split("/").reverse().join("-")),
            "notes": notes, //
            "contacts": [
                {
                    "name": name,
                    "business_phone": telefone,
                    "email": email,
                    "job_title": role
                }
            ],
            "address": {
                "zip_code": postal_code,
                "street": endereco,
                "number": numero,
                "complement": aditional_info,
                "neighborhood": district
            }
        }

        async function db() {
            const log = await prisma.index.findMany({ where: { id: 1 } })
            senderCustomer(log[0].access_token)
        }
        db()

        async function senderCustomer(token) {
            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
            if (etapa === 'Dados Cadastrais para Matrícula' && unidade === 'PTB') {
                await axios.post('https://api.contaazul.com/v1/customers',
                    customerBody, { headers })
                    .then(res => {
                        senderSale(res.data)
                    })
                    .catch(async err => {
                        if (err.response.data.message === 'CPF/CPNJ já utilizado por outro cliente.') {
                            await axios.get(`https://api.contaazul.com/v1/customers?document=${cpf_cnpj}`,
                                { headers }).then(data => senderSale(data.data[0]))
                        }
                    }
                    )
            }
            return

        }

        const parcelas = [];
        for (let i = 0; i < n_parcelas; i++) {
            const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 11);
            const parcela = {
                "number": i + 1,
                "value": valor_da_parcela_após_pp,
                "due_date": dueDate.toISOString(),
                "status": 'PENDING',
                "note": "NOTE",
                "hasBillet": true
            };
            parcelas.push(parcela); //essa função faz um loop pra criar as parcelas de acordo com o n_parcelas
        }

        const method = formaDePagamento[parcela_forma_de_pagamento]; // esse cara define o metodo de pagamento padronizados pelo site de acordo com o banco de dados
        const id_item = items[tipo_item]
        const financial = account[method]

        const salesNotesString = {
            "Valor da Primeira(s) Parcela(s)": valor_da_Primeira_Parcela,
            "Valor da Parcela": valor_da_parcela_após_pp,
            "PP Forma PG": parcela_forma_de_pagamento,
            "Parcela dia de vencimento": parcela_dia_de_vencimento,
            "PP Vencimento": data_de_vencimento_da_primeira,
            "Data de vencimento da última": data_de_vencimento_da_ultima,
            "N° de Parcelas": n_parcelas,
            "Desconto total": desconto_total_Pontualidade,
            "MD": material_didático,
            "MD Valor": md_valor,
            "MD vencimento": md_data_de_pagamento,
            "MD forma pg": md_forma_de_pagamento,
            "TM Valor": tm_valor,
            "TM forma de pg": tm_forma_de_pagamento,
            "TM Venc": tm_data_de_pagamento,
            "Carga Horária do Curso": carga_horaria,
            "Unidade": unidade,
            "Descrição": descricao,
            "Curso": curso
        }

        const saleNotes = JSON.stringify(salesNotesString)

        async function senderSale(customer) {
            const token = await prisma.index.findMany({ where: { id: 1 } })
            const headers = {
                "Authorization": `Bearer ${token[0].access_token}`,
                "Content-Type": "application/json"
            }

            const saleBody = {
                "emission": customer?.created_at,
                "status": "PENDING",
                "customer_id": customer?.id,
                "services": [
                    {
                        "description": desc_item,
                        "quantity": quantidade,
                        "service_id": id_item,
                        "value": valor_total
                    }
                ],
                "discount": {
                    "measure_unit": "VALUE",
                    "rate": desconto_total_Pontualidade
                },
                "payment": {
                    "type": n_parcelas <= 1 ? "CASH" : "TIMES",
                    "method": method,
                    "installments":
                        parcelas
                    ,
                    "financial_account_id": financial
                },
                "notes": saleNotes,   //
                "category_id": "" //
            }

            await axios.post('https://api.contaazul.com/v1/sales', saleBody, { headers })
                .then(data => {
                    data ? console.log("A venda foi lançada") : console.log("A venda nao foi lançada")
                }).catch(error => {
                    if (error) {
                        return res.status(400).json({ message: "Erro na venda" })
                    }

                })

        }

        return res.status(201).json({ message: "Enviado com sucesso" })

    }

}

module.exports = new RegisterController()


