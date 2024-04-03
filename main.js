const fs = require('fs');
var mongoose = require('mongoose');

async function gravaDadosClientes(clientesArray){
    await mongoose.connect('mongodb://localhost:27017/Loja', { useNewUrlParser: true });
    const clienteSchema = new mongoose.Schema({ name: String, _id: Number}, {versionKey: false});
    const Clientes = mongoose.model('Cliente', clienteSchema);
    for(const cliente of clientesArray){
        await Clientes.create({ name: cliente.nome, _id: cliente.id});
    }
}    
async function gravaDadosPagamentos(pagamentosArray){
    await mongoose.connect('mongodb://localhost:27017/Loja', { useNewUrlParser: true });
    const pagamentoSchema = new mongoose.Schema({  data: Date, codigoProduto: String, valorProduto: Number, pago: Boolean, id: String}, {versionKey: false});
    const Pagamentos = mongoose.model('Pagamento', pagamentoSchema);
    for(const pagamento of pagamentosArray){
        await Pagamentos.create({ data: pagamento.data, codigoProduto: pagamento.codigoProduto, valorProduto: pagamento.valorProduto, pago: pagamento.pago, idCliente: pagamento.id});
    }
}   

let clientesPromise = new Promise((resolve, reject) => {
    fs.readFile('./clientes.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de clientes:', err);
            reject(err);
            return;
        }
        const clientes = data.split('\n').map(item => item.trim());
        resolve(clientes);
    });
});

let pagamentosPromise = new Promise((resolve, reject) => {
    fs.readFile('./pagamentos.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de pagamentos:', err);
            reject(err);
            return;
        }
        const pagamentos = data.split('\n').map(item => item.trim());
        resolve(pagamentos);
    });
});

function formatDate(dataOriginal) {
    if (dataOriginal.length === 8 || dataOriginal.length === 7) {
        const dia = dataOriginal.substring(0, dataOriginal.length === 7 ? 1 : 2);
        const mes = dataOriginal.substring(dataOriginal.length === 7 ? 1 : 2, dataOriginal.length === 7 ? 3 : 4);
        const ano = dataOriginal.substring(dataOriginal.length === 7 ? 3 : 4);
        const dataFormatada = `${mes}/${dia}/${ano}`;

        return new Date(dataFormatada)
    } else {
        console.log('Formato de data inválido:', dataOriginal);
    }
}

Promise.all([clientesPromise, pagamentosPromise])
    .then(([clientes, pagamentos]) =>  {

        let infoPagamentos = []
        pagamentos.forEach(element => {
            const data = element.split(/\s*;\s*/)
            infoPagamentos.push({
                id: data[0],
                data: formatDate(data[1]),
                codigoProduto: data[2],
                valorProduto: parseFloat(data[3]),
                pago: data[4] === 't' ? true : false
            })
        });

        infoPagamentos.sort(function (a, b) {
            return new Date(a.data) - new Date(b.data)
        })

        let infoClientes = []
        clientes.forEach(element => {
            const data = element.split(/\s*;\s*/)
            infoClientes.push({
                id: data[0],
                nome: data[4]
            })
        });

        gravaDadosClientes(infoClientes)
        gravaDadosPagamentos(infoPagamentos)

    })
    .catch(err => {
        console.error('Erro:', err);
    });

    // const naoPagos = infoPagamentos.filter((pagamento) => pagamento.pago === false);
    //     const pagos = infoPagamentos.filter((pagamento) => pagamento.pago === true)

    //     const valoresPendentes = naoPagos.reduce((acc, cur) => {
    //         if (!acc[cur.id]) {
    //             acc[cur.id] = 0;
    //         }
    //         acc[cur.id] += cur.valorProduto;
    //         return acc;
    //     }, {});

    //     const valoresPagos = pagos.reduce((acc, cur) => {
    //         if (!acc[cur.id]) {
    //             acc[cur.id] = 0;
    //         }
    //         acc[cur.id] += cur.valorProduto;
    //         return acc;
    //     }, {});

    //     const valoresPendentesPorData = naoPagos.reduce((acc, cur) => {
    //         if (!acc[cur.data]) {
    //             acc[cur.data] = 0;
    //         }
    //         acc[cur.data] += cur.valorProduto;
    //         return acc;
    //     }, {});

    //     const valoresPagosPorData = pagos.reduce((acc, cur) => {
    //         if (!acc[cur.data]) {
    //             acc[cur.data] = 0;
    //         }
    //         acc[cur.data] += cur.valorProduto;
    //         return acc;
    //     }, {});

    //     let writePagosPorCliente = []
    //     let writeNaoPagosPorCliente = []
    //     let writePagosPorData = []
    //     let writeNaoPagosPorData = []

    //     //Clientes x Valores NÃO pagos
    //     Object.keys(valoresPendentes).forEach(element => {
    //         const nomeCliente = infoClientes.filter(cliente => cliente.id === element)[0].nome;
    //         const valor = valoresPendentes[element]
    //         const line = `${nomeCliente}: ${valor.toFixed(2)}`
    //         writeNaoPagosPorCliente.push(line)
    //     });
        
    //     //Clientes x Valores pagos
    //     Object.keys(valoresPagos).forEach(element => {
    //         const nomeCliente = infoClientes.filter(cliente => cliente.id === element)[0].nome;
    //         const valor = valoresPagos[element]
    //         const line = `${nomeCliente}: ${valor.toFixed(2)}`
    //         writePagosPorCliente.push(line)
    //     });

    //     //Valor a ser recebido ordenado por data
    //     Object.keys(valoresPendentesPorData).forEach(element => {
    //         const valor = valoresPendentesPorData[element];
    //         const line = `${new Date(element).toLocaleDateString()}: ${valor.toFixed(2)}`
    //         writeNaoPagosPorData.push(line)
    //     })

    //     //Valor recebido ordenado por data
    //     Object.keys(valoresPagosPorData).forEach(element => {
    //         const valor = valoresPagosPorData[element];
    //         const line = `${new Date(element).toLocaleDateString()}: ${valor.toFixed(2)}`
    //         writePagosPorData.push(line)
    //     })

    //     fs.writeFile('relatorioPagosPorData.txt', writePagosPorData.join('\n'), err => {
    //         if (err) {
    //             console.error('Erro ao escrever no arquivo:', err);
    //             return;
    //         }
    //         console.log('Os dados foram escritos no arquivo "valores_pagos.txt" com sucesso.');
    //     });

    //     fs.writeFile('relatorioNaoPagosPorData.txt', writeNaoPagosPorData.join('\n'), err => {
    //         if (err) {
    //             console.error('Erro ao escrever no arquivo:', err);
    //             return;
    //         }
    //         console.log('Os dados foram escritos no arquivo "valores_pagos.txt" com sucesso.');
    //     });

    //     fs.writeFile('relatorioPagosPorCliente.txt', writePagosPorCliente.join('\n'), err => {
    //         if (err) {
    //             console.error('Erro ao escrever no arquivo:', err);
    //             return;
    //         }
    //         console.log('Os dados foram escritos no arquivo "valores_pagos.txt" com sucesso.');
    //     });

    //     fs.writeFile('relatorioNaoPagosPorCliente.txt', writeNaoPagosPorCliente.join('\n'), err => {
    //         if (err) {
    //             console.error('Erro ao escrever no arquivo:', err);
    //             return;
    //         }
    //         console.log('Os dados foram escritos no arquivo "valores_pagos.txt" com sucesso.');
    //     });